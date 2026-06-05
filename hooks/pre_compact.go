package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"time"
)

// PreCompactInput represents the JSON input from the PreCompact hook.
type PreCompactInput struct {
	SessionID            string `json:"session_id"`
	TranscriptPath       string `json:"transcript_path"`
	Trigger              string `json:"trigger"` // "manual" or "auto"
	CustomInstructions   string `json:"custom_instructions"`
}

func main() {
	verbose := flag.Bool("verbose", false, "Log compaction details to stderr")
	backup := flag.Bool("backup", false, "Create a timestamped copy of the transcript before compaction")
	flag.Parse()

	// Read JSON from stdin
	data, err := io.ReadAll(os.Stdin)
	if err != nil {
		os.Exit(0)
	}

	var input PreCompactInput
	if err := json.Unmarshal(data, &input); err != nil {
		os.Exit(0)
	}

	// Log the event
	if err := logPreCompact(data); err != nil && *verbose {
		fmt.Fprintf(os.Stderr, "Failed to log pre-compact: %v\n", err)
	}

	// Create backup if requested
	var backupPath string
	if *backup && input.TranscriptPath != "" {
		var err error
		backupPath, err = backupTranscript(input.TranscriptPath, input.Trigger)
		if err != nil && *verbose {
			fmt.Fprintf(os.Stderr, "Failed to backup transcript: %v\n", err)
		}
	}

	// Verbose output
	if *verbose {
		if input.Trigger == "manual" {
			fmt.Printf("Preparing for manual compaction (session: %.8s...)\n", input.SessionID)
			if input.CustomInstructions != "" {
				if len(input.CustomInstructions) > 100 {
					fmt.Printf("Custom instructions: %s...\n", input.CustomInstructions[:100])
				} else {
					fmt.Printf("Custom instructions: %s\n", input.CustomInstructions)
				}
			}
		} else {
			fmt.Printf("Auto-compaction triggered due to full context window (session: %.8s...)\n", input.SessionID)
		}

		if backupPath != "" {
			fmt.Printf("Transcript backed up to: %s\n", backupPath)
		}
	}

	os.Exit(0)
}

// logPreCompact appends the event to ~/.claude/logs/pre_compact.json.
func logPreCompact(data []byte) error {
	homeDir, err := os.UserHomeDir()
	if err != nil {
		return err
	}

	logDir := filepath.Join(homeDir, ".claude", "logs")
	if err := os.MkdirAll(logDir, 0755); err != nil {
		return err
	}

	logPath := filepath.Join(logDir, "pre_compact.json")

	// Read existing log or create empty array
	var logData []interface{}
	if content, err := os.ReadFile(logPath); err == nil {
		if err := json.Unmarshal(content, &logData); err != nil {
			logData = []interface{}{}
		}
	}

	// Append new entry
	var newEntry interface{}
	if err := json.Unmarshal(data, &newEntry); err != nil {
		return err
	}
	logData = append(logData, newEntry)

	// Write back
	out, err := json.MarshalIndent(logData, "", "  ")
	if err != nil {
		return err
	}

	return os.WriteFile(logPath, out, 0644)
}

// backupTranscript copies the transcript to ~/.claude/logs/transcript_backups/
// with a timestamped filename, returning the backup path.
func backupTranscript(transcriptPath, trigger string) (string, error) {
	// Check file exists
	if _, err := os.Stat(transcriptPath); err != nil {
		return "", err
	}

	homeDir, err := os.UserHomeDir()
	if err != nil {
		return "", err
	}

	backupDir := filepath.Join(homeDir, ".claude", "logs", "transcript_backups")
	if err := os.MkdirAll(backupDir, 0755); err != nil {
		return "", err
	}

	// Generate backup filename
	timestamp := time.Now().Format("20060102_150405")
	sessionName := filepath.Base(transcriptPath)
	sessionName = sessionName[:len(sessionName)-len(filepath.Ext(sessionName))] // Remove ext
	backupName := fmt.Sprintf("%s_pre_compact_%s_%s.jsonl", sessionName, trigger, timestamp)
	backupPath := filepath.Join(backupDir, backupName)

	// Copy file
	src, err := os.Open(transcriptPath)
	if err != nil {
		return "", err
	}
	defer src.Close()

	dst, err := os.Create(backupPath)
	if err != nil {
		return "", err
	}
	defer dst.Close()

	if _, err := io.Copy(dst, src); err != nil {
		return "", err
	}

	return backupPath, nil
}
