#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.8"
# dependencies = []
# ///

import subprocess
import sys
from pathlib import Path

VOICE_MODEL = Path.home() / ".local/share/piper-voices/jarvis/en/en_GB/jarvis/medium/jarvis-medium.onnx"


def main():
    if len(sys.argv) > 1:
        text = " ".join(sys.argv[1:])
    else:
        text = "The first move is what sets everything in motion."

    if not VOICE_MODEL.exists():
        print(f"Voice model not found: {VOICE_MODEL}")
        sys.exit(1)

    proc = subprocess.Popen(
        ["piper", "-m", str(VOICE_MODEL)],
        stdin=subprocess.PIPE,
        stderr=subprocess.DEVNULL,
    )
    proc.communicate(input=text.encode())


if __name__ == "__main__":
    main()
