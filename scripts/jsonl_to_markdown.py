#!/usr/bin/env python3
"""
Convert Claude Code JSONL conversation logs to readable Markdown transcripts.

Usage:
    python jsonl_to_markdown.py <input.jsonl> [output.md]

If output is not specified, writes to <input>_transcript.md
"""

import json
import sys
from datetime import datetime
from pathlib import Path


def parse_timestamp(ts: str) -> str:
    """Convert ISO timestamp to readable format."""
    try:
        dt = datetime.fromisoformat(ts.replace('Z', '+00:00'))
        return dt.strftime('%Y-%m-%d %H:%M:%S')
    except:
        return ts


def extract_text_content(message: dict) -> str | None:
    """Extract the text content from a message object."""
    content = message.get('content')

    if content is None:
        return None

    # User messages have content as a string
    if isinstance(content, str):
        return content.strip()

    # Assistant messages have content as an array
    if isinstance(content, list):
        text_parts = []
        for item in content:
            if isinstance(item, dict) and item.get('type') == 'text':
                text = item.get('text', '')
                if text:
                    text_parts.append(text.strip())
        return '\n\n'.join(text_parts) if text_parts else None

    return None


def process_jsonl(input_path: Path) -> list[dict]:
    """Process JSONL file and extract conversation entries."""
    entries = []
    seen_texts = set()  # Track seen content to avoid duplicates

    with open(input_path, 'r', encoding='utf-8') as f:
        for line_num, line in enumerate(f, 1):
            line = line.strip()
            if not line:
                continue

            try:
                data = json.loads(line)
            except json.JSONDecodeError as e:
                print(f"Warning: Skipping invalid JSON on line {line_num}: {e}", file=sys.stderr)
                continue

            # Skip non-conversation entries
            entry_type = data.get('type')
            if entry_type not in ('user', 'assistant'):
                continue

            message = data.get('message', {})
            timestamp = data.get('timestamp', '')

            # Extract text content
            text = extract_text_content(message)
            if not text:
                continue

            # Create a key to deduplicate (same role + same content)
            role = message.get('role', entry_type)
            dedup_key = f"{role}:{text[:200]}"  # Use first 200 chars for dedup

            if dedup_key in seen_texts:
                continue
            seen_texts.add(dedup_key)

            entries.append({
                'role': role,
                'timestamp': parse_timestamp(timestamp),
                'content': text
            })

    return entries


def format_markdown(entries: list[dict]) -> str:
    """Format conversation entries as Markdown."""
    lines = [
        "# Conversation Transcript",
        "",
        f"*Generated from JSONL log*",
        "",
        "---",
        ""
    ]

    for entry in entries:
        role = entry['role'].upper()
        timestamp = entry['timestamp']
        content = entry['content']

        # Format header based on role
        if role == 'USER':
            lines.append(f"## 👤 USER [{timestamp}]")
        else:
            lines.append(f"## 🤖 AI [{timestamp}]")

        lines.append("")
        lines.append(content)
        lines.append("")
        lines.append("---")
        lines.append("")

    return '\n'.join(lines)


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    input_path = Path(sys.argv[1])

    if not input_path.exists():
        print(f"Error: File not found: {input_path}", file=sys.stderr)
        sys.exit(1)

    # Determine output path
    if len(sys.argv) >= 3:
        output_path = Path(sys.argv[2])
    else:
        output_path = input_path.with_name(f"{input_path.stem}_transcript.md")

    print(f"Processing: {input_path}")

    entries = process_jsonl(input_path)
    print(f"Found {len(entries)} conversation entries")

    markdown = format_markdown(entries)

    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(markdown)

    print(f"Written to: {output_path}")


if __name__ == '__main__':
    main()
