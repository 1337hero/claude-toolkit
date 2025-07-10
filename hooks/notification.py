#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.8"
# ///

import json
import os
import sys
import subprocess
from pathlib import Path


SOUNDS_DIR = Path(__file__).parent / "sounds"


def play_sound(name):
    sound_file = SOUNDS_DIR / f"{name}.wav"
    if sound_file.exists():
        subprocess.Popen(
            ["pw-play", str(sound_file)],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )


def main():
    try:
        input_data = json.loads(sys.stdin.read())

        if input_data.get("message") != "Claude is waiting for your input":
            play_sound("alert")

        sys.exit(0)

    except Exception:
        sys.exit(0)


if __name__ == "__main__":
    main()
