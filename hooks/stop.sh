#!/bin/bash

SOUNDS_DIR="$(dirname "$0")/sounds"

play_sound() {
	local name=$1
	local sound_file="$SOUNDS_DIR/${name}.wav"
	
	if [[ -f "$sound_file" ]]; then
		pw-play "$sound_file" > /dev/null 2>&1 &
	fi
}

play_sound "done"
exit 0
