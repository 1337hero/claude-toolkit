#!/bin/bash

SOUNDS_DIR="$(dirname "$0")/sounds"

play_sound() {
	local name=$1
	local sound_file="$SOUNDS_DIR/${name}.wav"
	
	if [[ -f "$sound_file" ]]; then
		pw-play "$sound_file" > /dev/null 2>&1 &
	fi
}

# Read JSON from stdin and extract message
message=$(jq -r '.message // ""' 2>/dev/null || echo "")

# Only play alert if message is not the standard "waiting for input" message
if [[ "$message" != "Claude is waiting for your input" ]]; then
	play_sound "alert"
fi

exit 0
