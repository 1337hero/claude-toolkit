#!/bin/bash

SOUNDS_DIR="$(dirname "$0")/sounds/agents"

play_sound() {
	local name=$1
	local event=$2
	local sound_file="$SOUNDS_DIR/${name}-${event}.wav"
	
	# Fall back to default if specific sound doesn't exist
	if [[ ! -f "$sound_file" ]]; then
		sound_file="$SOUNDS_DIR/default-${event}.wav"
	fi
	
	if [[ -f "$sound_file" ]]; then
		pw-play "$sound_file" > /dev/null 2>&1 &
	fi
}

# Read JSON from stdin
agent_type=$(jq -r '.agent_type // ""' 2>/dev/null || echo "")

# Normalize agent_type (lowercase, replace spaces with dashes)
if [[ -n "$agent_type" ]]; then
	agent_type=$(echo "$agent_type" | tr '[:upper:]' '[:lower:]' | tr ' ' '-')
else
	agent_type="default"
fi

play_sound "$agent_type" "stop"
exit 0
