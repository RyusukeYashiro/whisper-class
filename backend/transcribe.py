import whisper
import json
import os

def transcribe_audio(audio_path, output_path):
    if not os.path.exists(audio_path):
        raise FileNotFoundError(f"File not found: {audio_path}")
    
    model = whisper.load_model("medium")
    result = model.transcribe(audio_path, language="ja")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump({
            "text": result["text"],
            "segments": result["segments"]
        }, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    transcribe_audio("audio/lecture_cleaned.wav", "transcripts/lecture_transcript.json")