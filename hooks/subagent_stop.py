#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.8"
# ///

import json
import sys
import subprocess
from pathlib import Path


SOUNDS_DIR = Path(__file__).parent / "sounds" / "agents"


def play_sound(agent_type, event):
    name = agent_type.lower().replace(" ", "-") if agent_type else "default"
    sound_file = SOUNDS_DIR / f"{name}-{event}.wav"
    if not sound_file.exists():
        sound_file = SOUNDS_DIR / f"default-{event}.wav"
    if sound_file.exists():
        subprocess.Popen(
            ["pw-play", str(sound_file)],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )


def main():
    try:
        input_data = json.loads(sys.stdin.read())
        agent_type = input_data.get("agent_type", "")
        play_sound(agent_type, "stop")
        sys.exit(0)
    except Exception:
        sys.exit(0)


if __name__ == "__main__":
    main()
