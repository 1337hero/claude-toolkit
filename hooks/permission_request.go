package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"regexp"
	"strings"
)

// PermissionRequestInput represents the JSON input from the PermissionRequest hook.
type PermissionRequestInput struct {
	SessionID             string                 `json:"session_id"`
	TranscriptPath        string                 `json:"transcript_path"`
	CWD                   string                 `json:"cwd"`
	PermissionMode        string                 `json:"permission_mode"`
	HookEventName         string                 `json:"hook_event_name"`
	ToolName              string                 `json:"tool_name"`
	ToolInput             map[string]interface{} `json:"tool_input"`
	ToolUseID             string                 `json:"tool_use_id"`
}

type AllowDecision struct {
	Behavior      string                 `json:"behavior"`
	UpdatedInput  map[string]interface{} `json:"updatedInput,omitempty"`
}

type DecisionOutput struct {
	HookEventName string      `json:"hookEventName"`
	Decision      interface{} `json:"decision"`
}

type HookResponse struct {
	HookSpecificOutput DecisionOutput `json:"hookSpecificOutput"`
}

// safeBashPatterns are regexes matching read-only bash commands that are auto-allowed
// (e.g., ls, grep, git status, npm list).
var safeBashPatterns = []*regexp.Regexp{
	regexp.MustCompile(`^ls\b`),
	regexp.MustCompile(`^pwd\b`),
	regexp.MustCompile(`^echo\b`),
	regexp.MustCompile(`^cat\b`),
	regexp.MustCompile(`^head\b`),
	regexp.MustCompile(`^tail\b`),
	regexp.MustCompile(`^wc\b`),
	regexp.MustCompile(`^which\b`),
	regexp.MustCompile(`^whereis\b`),
	regexp.MustCompile(`^type\b`),
	regexp.MustCompile(`^file\b`),
	regexp.MustCompile(`^stat\b`),
	regexp.MustCompile(`^git\s+(status|log|diff|show|branch|tag)\b`),
	regexp.MustCompile(`^git\s+remote\s+-v\b`),
	regexp.MustCompile(`^npm\s+(list|ls|outdated|view)\b`),
	regexp.MustCompile(`^pip\s+(list|show|freeze)\b`),
	regexp.MustCompile(`^uv\s+(pip\s+list|tree)\b`),
	regexp.MustCompile(`^python\s+--version\b`),
	regexp.MustCompile(`^node\s+--version\b`),
	regexp.MustCompile(`^npm\s+--version\b`),
}

func main() {
	autoAllow := flag.Bool("auto-allow", false, "Auto-allow read-only operations (Read, Glob, Grep, safe Bash commands)")
	logOnly := flag.Bool("log-only", false, "Only log requests; do not return a decision")
	flag.Parse()

	// Read JSON from stdin
	data, err := io.ReadAll(os.Stdin)
	if err != nil {
		os.Exit(0)
	}

	var input PermissionRequestInput
	if err := json.Unmarshal(data, &input); err != nil {
		os.Exit(0)
	}

	// Only handle PermissionRequest events
	if input.HookEventName != "PermissionRequest" {
		os.Exit(0)
	}

	// Log the request; failures here are non-fatal for the hook.
	if err := logPermissionRequest(data); err != nil {
		// Logging failures should not interrupt the permission decision.
	}

	// If log-only, exit without decision
	if *logOnly {
		os.Exit(0)
	}

	// Handle auto-allow for read-only operations
	if *autoAllow && shouldAutoAllow(input.ToolName, input.ToolInput) {
		response := AllowDecision{
			Behavior: "allow",
		}
		out := HookResponse{
			HookSpecificOutput: DecisionOutput{
				HookEventName: "PermissionRequest",
				Decision:      response,
			},
		}
		b, err := json.Marshal(out)
		if err != nil {
			os.Exit(0)
		}
		fmt.Println(string(b))
		os.Exit(0)
	}

	// Default: exit without decision
	os.Exit(0)
}

func shouldAutoAllow(toolName string, toolInput map[string]interface{}) bool {
	switch toolName {
	case "Read", "Glob", "Grep":
		return true
	case "Bash":
		cmd, ok := toolInput["command"].(string)
		if !ok {
			return false
		}
		return isSafeBashCommand(cmd)
	default:
		return false
	}
}

func isSafeBashCommand(command string) bool {
	normalized := strings.TrimSpace(command)
	if normalized == "" {
		return false
	}

	for _, pattern := range safeBashPatterns {
		if pattern.MatchString(normalized) {
			return true
		}
	}

	return false
}

// logPermissionRequest appends the event to ~/.claude/logs/permission_request.json.
func logPermissionRequest(data []byte) error {
	homeDir, err := os.UserHomeDir()
	if err != nil {
		return err
	}

	logDir := filepath.Join(homeDir, ".claude", "logs")
	if err := os.MkdirAll(logDir, 0755); err != nil {
		return err
	}

	logPath := filepath.Join(logDir, "permission_request.json")

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
