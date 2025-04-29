#!/bin/bash
#
# fix-photo-dates.sh - Fix photo dates from EXIF, filename, or folder path
#
# Usage:
#   ./fix-photo-dates.sh [OPTIONS] <directory>
#
# Options:
#   -f, --fix          Actually apply fixes (default is audit/dry-run mode)
#   -r, --recursive    Process subdirectories recursively
#   -w, --write-exif   Write EXIF dates to files missing them (from filename/folder)
#   -L, --lowercase    Rename files to lowercase (DSCN0332.JPG -> dscn0332.jpg)
#   -v, --verbose      Show detailed output for each file
#   -l, --log FILE     Write detailed log to FILE
#   -h, --help         Show this help
#
# Date detection priority:
#   1. EXIF DateTimeOriginal
#   2. EXIF CreateDate
#   3. EXIF ModifyDate
#   4. Filename patterns (various formats)
#   5. Parent folder path (e.g., /Photos/2009/08_Aug/)
#

set -uo pipefail
# Note: not using -e because we handle errors explicitly

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Default options
FIX_MODE=false
RECURSIVE=false
WRITE_EXIF=false
LOWERCASE=false
VERBOSE=false
LOG_FILE=""

# Counters
TOTAL=0
CORRECT=0
FIXED=0
WOULD_FIX=0
NO_DATE=0
ERRORS=0
RENAMED=0
WOULD_RENAME=0

usage() {
    head -25 "$0" | tail -23 | sed 's/^# \?//'
    exit 0
}

log() {
    local msg="$1"
    echo -e "$msg"
    if [[ -n "$LOG_FILE" ]]; then
        echo -e "$msg" | sed 's/\x1b\[[0-9;]*m//g' >> "$LOG_FILE"
    fi
}

log_verbose() {
    if $VERBOSE; then
        log "$1"
    elif [[ -n "$LOG_FILE" ]]; then
        echo -e "$1" | sed 's/\x1b\[[0-9;]*m//g' >> "$LOG_FILE"
    fi
}

# Extract date from EXIF (returns YYYY:MM:DD HH:MM:SS or empty)
get_exif_date() {
    local file="$1"

    # Get all three dates in one exiftool call (much faster)
    local dates
    dates=$(exiftool -s3 -DateTimeOriginal -CreateDate -ModifyDate "$file" 2>/dev/null)

    # Try each date in priority order
    local date
    while IFS= read -r date; do
        if [[ -n "$date" && "$date" != "0000:00:00 00:00:00" ]]; then
            echo "$date"
            return 0
        fi
    done <<< "$dates"
    return 1
}

# Validate a parsed date is reasonable
is_valid_date() {
    local year="$1" month="$2" day="$3"
    # Remove leading zeros for arithmetic (force base 10)
    year=$((10#$year))
    month=$((10#$month))
    day=$((10#$day))

    # Check ranges
    (( year >= 1990 && year <= 2030 )) || return 1
    (( month >= 1 && month <= 12 )) || return 1
    (( day >= 1 && day <= 31 )) || return 1
    return 0
}

# Extract date from filename patterns
# Returns YYYY:MM:DD HH:MM:SS or YYYY:MM:DD 12:00:00 if no time
get_filename_date() {
    local filename="$1"
    local basename=$(basename "$filename")
    local year month day hour min sec

    # Pattern: YYYY-MM-DD_HH.MM.SS (Dropbox/Hazel style)
    if [[ "$basename" =~ ^([0-9]{4})-([0-9]{2})-([0-9]{2})_([0-9]{2})\.([0-9]{2})\.([0-9]{2}) ]]; then
        year="${BASH_REMATCH[1]}" month="${BASH_REMATCH[2]}" day="${BASH_REMATCH[3]}"
        if is_valid_date "$year" "$month" "$day"; then
            echo "${year}:${month}:${day} ${BASH_REMATCH[4]}:${BASH_REMATCH[5]}:${BASH_REMATCH[6]}"
            return 0
        fi
    fi

    # Pattern: YYYY-MM-DD_NNNN (your current format)
    if [[ "$basename" =~ ^([0-9]{4})-([0-9]{2})-([0-9]{2})_ ]]; then
        year="${BASH_REMATCH[1]}" month="${BASH_REMATCH[2]}" day="${BASH_REMATCH[3]}"
        if is_valid_date "$year" "$month" "$day"; then
            echo "${year}:${month}:${day} 12:00:00"
            return 0
        fi
    fi

    # Pattern: YYYY-MM-DD (ISO date at start)
    if [[ "$basename" =~ ^([0-9]{4})-([0-9]{2})-([0-9]{2}) ]]; then
        year="${BASH_REMATCH[1]}" month="${BASH_REMATCH[2]}" day="${BASH_REMATCH[3]}"
        if is_valid_date "$year" "$month" "$day"; then
            echo "${year}:${month}:${day} 12:00:00"
            return 0
        fi
    fi

    # Pattern: M-DD-YY or MM-DD-YY in filename (like "3-12-09" or "12-25-09")
    # Must NOT be preceded by more digits (avoid matching Facebook IDs)
    if [[ "$basename" =~ [^0-9]([0-9]{1,2})-([0-9]{1,2})-([0-9]{2})[^0-9] ]] || \
       [[ "$basename" =~ ^([0-9]{1,2})-([0-9]{1,2})-([0-9]{2})[^0-9] ]]; then
        month="${BASH_REMATCH[1]}"
        day="${BASH_REMATCH[2]}"
        year="${BASH_REMATCH[3]}"
        # Convert 2-digit year (assume 20xx for < 50, 19xx for >= 50) - force base 10
        if (( 10#$year < 50 )); then
            year="20$year"
        else
            year="19$year"
        fi
        if is_valid_date "$year" "$month" "$day"; then
            printf "%s:%02d:%02d 12:00:00" "$year" "$((10#$month))" "$((10#$day))"
            return 0
        fi
    fi

    # Pattern: YYYYMMDD_HHMMSS at START of filename (common camera format)
    if [[ "$basename" =~ ^([0-9]{4})([0-9]{2})([0-9]{2})_([0-9]{2})([0-9]{2})([0-9]{2}) ]]; then
        year="${BASH_REMATCH[1]}" month="${BASH_REMATCH[2]}" day="${BASH_REMATCH[3]}"
        if is_valid_date "$year" "$month" "$day"; then
            echo "${year}:${month}:${day} ${BASH_REMATCH[4]}:${BASH_REMATCH[5]}:${BASH_REMATCH[6]}"
            return 0
        fi
    fi

    # Pattern: IMG_YYYYMMDD_HHMMSS (Android style)
    if [[ "$basename" =~ IMG_([0-9]{4})([0-9]{2})([0-9]{2})_([0-9]{2})([0-9]{2})([0-9]{2}) ]]; then
        year="${BASH_REMATCH[1]}" month="${BASH_REMATCH[2]}" day="${BASH_REMATCH[3]}"
        if is_valid_date "$year" "$month" "$day"; then
            echo "${year}:${month}:${day} ${BASH_REMATCH[4]}:${BASH_REMATCH[5]}:${BASH_REMATCH[6]}"
            return 0
        fi
    fi

    return 1
}

# Extract date from folder path (e.g., /Photos/2009/08_Aug/)
# Returns YYYY:MM:DD 12:00:00 or just YYYY:01:01 12:00:00 if only year
get_folder_date() {
    local filepath="$1"
    local dir=$(dirname "$filepath")

    # Look for year folder pattern
    if [[ "$dir" =~ /([0-9]{4})(/|$) ]]; then
        local year="${BASH_REMATCH[1]}"

        # Look for month folder pattern (01_Jan, 02_Feb, etc.)
        if [[ "$dir" =~ /([0-9]{2})_[A-Za-z]{3}(/|$) ]]; then
            local month="${BASH_REMATCH[1]}"
            echo "$year:$month:15 12:00:00"  # Use middle of month
            return 0
        fi

        # Just year available
        echo "$year:06:15 12:00:00"  # Use middle of year
        return 0
    fi

    return 1
}

# Convert EXIF date format to touch format (YYYYMMDDHHMMSS)
exif_to_touch() {
    local exif_date="$1"
    # Strip timezone offset if present (e.g., -05:00 or +02:00)
    exif_date=$(echo "$exif_date" | sed 's/[-+][0-9][0-9]:[0-9][0-9]$//')
    # YYYY:MM:DD HH:MM:SS -> YYYYMMDDHHMM.SS
    echo "$exif_date" | sed 's/[: ]//g' | sed 's/\(..\)$/.\1/'
}

# Check if filesystem date matches EXIF date (within 24 hours tolerance)
dates_match() {
    local file="$1"
    local exif_date="$2"

    # Get filesystem mtime as epoch
    local file_epoch=$(stat -c %Y "$file" 2>/dev/null)

    # Convert EXIF date to epoch
    local exif_formatted=$(echo "$exif_date" | sed 's/:/-/; s/:/-/')
    local exif_epoch=$(date -d "$exif_formatted" +%s 2>/dev/null) || return 1

    # Check if within 24 hours (86400 seconds)
    local diff=$((file_epoch - exif_epoch))
    diff=${diff#-}  # Absolute value

    (( diff < 86400 ))
}

# Process a single file
process_file() {
    local file="$1"
    local relative_path="${file#$TARGET_DIR/}"

    ((TOTAL++))

    # Handle lowercase renaming if enabled
    if $LOWERCASE; then
        local dir=$(dirname "$file")
        local basename=$(basename "$file")
        local lowercase_name=$(echo "$basename" | tr '[:upper:]' '[:lower:]')

        if [[ "$basename" != "$lowercase_name" ]]; then
            local new_file="$dir/$lowercase_name"

            if $FIX_MODE; then
                # Check for collision
                if [[ -e "$new_file" && "$file" != "$new_file" ]]; then
                    log "  ${YELLOW}⚠${NC}  $relative_path - Cannot rename, $lowercase_name already exists"
                else
                    if mv "$file" "$new_file" 2>/dev/null; then
                        log "  ${CYAN}↓${NC}  $relative_path → $lowercase_name"
                        ((RENAMED++))
                        # Update file path for subsequent processing
                        file="$new_file"
                        relative_path="${file#$TARGET_DIR/}"
                    else
                        log "  ${RED}✗${NC}  $relative_path - Failed to rename"
                        ((ERRORS++))
                    fi
                fi
            else
                # Audit mode
                if [[ -e "$new_file" && "$file" != "$new_file" ]]; then
                    log "  ${YELLOW}⚠${NC}  $relative_path - Would skip, $lowercase_name already exists"
                else
                    log "  ${CYAN}↓${NC}  $relative_path → $lowercase_name"
                    ((WOULD_RENAME++))
                fi
            fi
        fi
    fi

    # Get current filesystem date
    local file_date=$(stat -c "%y" "$file" | cut -d'.' -f1)

    # Try to get the "real" date from various sources
    local real_date=""
    local date_source=""

    # Priority 1: EXIF
    if real_date=$(get_exif_date "$file"); then
        date_source="EXIF"
    # Priority 2: Filename
    elif real_date=$(get_filename_date "$file"); then
        date_source="filename"
    # Priority 3: Folder path
    elif real_date=$(get_folder_date "$file"); then
        date_source="folder"
    else
        log_verbose "  ${YELLOW}⚠${NC}  $relative_path - No date source found"
        ((NO_DATE++))
        return
    fi

    # Check if dates already match
    if dates_match "$file" "$real_date"; then
        log_verbose "  ${GREEN}✓${NC}  $relative_path - OK (from $date_source)"
        ((CORRECT++))
        return
    fi

    # Dates don't match - need to fix
    local file_year=$(echo "$file_date" | cut -d'-' -f1)
    local real_year=$(echo "$real_date" | cut -d':' -f1)

    if $FIX_MODE; then
        # Apply the fix
        local touch_date=$(exif_to_touch "$real_date")

        if touch -t "${touch_date}" "$file" 2>/dev/null; then
            log "  ${GREEN}✓${NC}  $relative_path"
            log "       ${RED}$file_date${NC} → ${GREEN}${real_date}${NC} (from $date_source)"
            ((FIXED++))

            # Optionally write EXIF if source wasn't EXIF
            if $WRITE_EXIF && [[ "$date_source" != "EXIF" ]]; then
                if exiftool -overwrite_original -AllDates="$real_date" "$file" &>/dev/null; then
                    log_verbose "       Also wrote EXIF dates"
                fi
            fi
        else
            log "  ${RED}✗${NC}  $relative_path - Failed to update"
            ((ERRORS++))
        fi
    else
        # Audit mode - just report
        log "  ${YELLOW}→${NC}  $relative_path"
        log "       ${RED}$file_date${NC} → ${GREEN}${real_date}${NC} (from $date_source)"
        ((WOULD_FIX++))
    fi
}

# Main
main() {
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -f|--fix)
                FIX_MODE=true
                shift
                ;;
            -r|--recursive)
                RECURSIVE=true
                shift
                ;;
            -w|--write-exif)
                WRITE_EXIF=true
                shift
                ;;
            -L|--lowercase)
                LOWERCASE=true
                shift
                ;;
            -v|--verbose)
                VERBOSE=true
                shift
                ;;
            -l|--log)
                LOG_FILE="$2"
                shift 2
                ;;
            -h|--help)
                usage
                ;;
            -*)
                echo "Unknown option: $1"
                usage
                ;;
            *)
                TARGET_DIR="$1"
                shift
                ;;
        esac
    done

    if [[ -z "${TARGET_DIR:-}" ]]; then
        echo "Error: No directory specified"
        usage
    fi

    if [[ ! -d "$TARGET_DIR" ]]; then
        echo "Error: Directory not found: $TARGET_DIR"
        exit 1
    fi

    # Resolve to absolute path
    TARGET_DIR=$(realpath "$TARGET_DIR")

    # Initialize log file
    if [[ -n "$LOG_FILE" ]]; then
        echo "Photo Date Fix Log - $(date)" > "$LOG_FILE"
        echo "Directory: $TARGET_DIR" >> "$LOG_FILE"
        echo "Mode: $($FIX_MODE && echo 'FIX' || echo 'AUDIT')" >> "$LOG_FILE"
        echo "---" >> "$LOG_FILE"
    fi

    # Header
    echo ""
    if $FIX_MODE; then
        log "${GREEN}═══ FIX MODE ═══${NC}"
    else
        log "${CYAN}═══ AUDIT MODE (dry run) ═══${NC}"
        log "Use -f to actually apply fixes"
    fi
    log "Directory: $TARGET_DIR"
    echo ""

    # Find and process files
    local find_opts=(-type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.heic" -o -iname "*.heif" \))
    if ! $RECURSIVE; then
        find_opts=(-maxdepth 1 "${find_opts[@]}")
    fi

    while IFS= read -r -d '' file; do
        process_file "$file"
    done < <(find "$TARGET_DIR" "${find_opts[@]}" -print0 | sort -z)

    # Summary
    echo ""
    log "${BLUE}═══ SUMMARY ═══${NC}"
    log "Total files scanned: $TOTAL"
    log "  ${GREEN}✓${NC} Already correct:   $CORRECT"
    if $FIX_MODE; then
        log "  ${GREEN}✓${NC} Dates fixed:       $FIXED"
    else
        log "  ${YELLOW}→${NC} Would fix dates:   $WOULD_FIX"
    fi
    if $LOWERCASE; then
        if $FIX_MODE; then
            log "  ${CYAN}↓${NC} Renamed:           $RENAMED"
        else
            log "  ${CYAN}↓${NC} Would rename:      $WOULD_RENAME"
        fi
    fi
    log "  ${YELLOW}⚠${NC} No date found:     $NO_DATE"
    if (( ERRORS > 0 )); then
        log "  ${RED}✗${NC} Errors:            $ERRORS"
    fi

    if [[ -n "$LOG_FILE" ]]; then
        log ""
        log "Detailed log written to: $LOG_FILE"
    fi
}

main "$@"
