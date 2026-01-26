#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.10"
# dependencies = [
#     "qwen-tts",
#     "python-dotenv",
# ]
# ///

import os
import sys
from pathlib import Path

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass


def main():
    """
    Qwen3-TTS Script

    Local neural TTS with voice cloning and emotional control.

    Usage:
        ./qwen_tts.py "Your text here"
        ./qwen_tts.py --instruction "speak excitedly" "Your text here"

    Environment:
        QWEN_TTS_MODEL: Model size (0.6B or 1.7B, default: 0.6B)
        QWEN_TTS_VOICE: Path to reference audio for voice cloning
        QWEN_TTS_INSTRUCTION: Default speaking instruction
    """
    try:
        from qwen_tts import QwenTTS

        print("🎙️  Qwen3-TTS")
        print("=" * 20)

        # Parse args
        args = sys.argv[1:]
        instruction = os.getenv('QWEN_TTS_INSTRUCTION', '')

        # Check for --instruction flag
        if '--instruction' in args:
            idx = args.index('--instruction')
            if idx + 1 < len(args):
                instruction = args[idx + 1]
                args = args[:idx] + args[idx + 2:]

        # Get text
        if args:
            text = " ".join(args)
        else:
            text = "Ready for your next task."

        print(f"🎯 Text: {text}")
        if instruction:
            print(f"🎭 Instruction: {instruction}")
        print("🔊 Generating...")

        # Initialize TTS
        model = os.getenv('QWEN_TTS_MODEL', '0.6B')
        tts = QwenTTS(model=model)

        # Check for voice cloning reference
        voice_ref = os.getenv('QWEN_TTS_VOICE', '')

        if voice_ref and Path(voice_ref).exists():
            # Voice cloning mode
            audio = tts.generate_voice_clone(
                text=text,
                reference_audio=voice_ref,
                instruction=instruction if instruction else None
            )
        elif instruction:
            # Instruction-controlled mode
            audio = tts.generate_custom_voice(
                text=text,
                instruction=instruction
            )
        else:
            # Basic generation
            audio = tts.generate_custom_voice(text=text)

        # Play audio (qwen-tts handles playback)
        tts.play(audio)
        print("✅ Playback complete!")

    except ImportError:
        print("❌ qwen-tts not installed")
        print("Install with: pip install -U qwen-tts")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
