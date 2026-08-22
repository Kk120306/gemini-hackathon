import {GoogleGenAI} from "@google/genai";
import {execFile} from "node:child_process";
import {readFile, writeFile} from "node:fs/promises";
import {join} from "node:path";
import {promisify} from "node:util";

const root = new URL("../../", import.meta.url);
const envText = await readFile(new URL(".env.local", root), "utf8");
const apiKey = envText.match(/^GEMINI_API_KEY=(.+)$/m)?.[1]?.trim();

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is missing from .env.local");
}

const clips = [
  [
    "01-opening",
    "ANCHOR uses Gemini to help people with dementia remember familiar rooms. It turns one room photo into simple, personal practice about real objects and where they are.",
  ],
  [
    "02-problem",
    "Generic brain games ask random questions. They do not help someone remember their own desk, chair, lamp, or doorway. ANCHOR uses Gemini multimodal vision to understand the exact room a person with dementia sees every day.",
  ],
  [
    "03-inputs",
    "A caregiver uploads a photo of a familiar room. Gemini 3.6 Flash looks at the image, finds visible objects, and returns their names, boxes, and positions as structured data. Gemini does not invent routines or memories. The caregiver checks every object before it is used.",
  ],
  [
    "04-grounding",
    "From the approved room map, Gemini creates six detailed questions: object recognition, location matching, landmark search, scene comparison, visual recall, and association. Every answer points back to caregiver-approved evidence. Gemini 3.1 Flash Lite Image then turns the flat photo into a realistic two point five D spatial view while preserving the room layout. The person sees one large image, one clear question, and one action. Questions can be repeated, there is no timer, and support gets simpler after a wrong answer. Gemini provides the context. Deterministic safety rules stop invented facts.",
  ],
  [
    "05-spatial",
    "Here Gemini uses the monitor as a verified landmark and asks, Where is the keyboard? The person looks below the monitor and taps the keyboard. The question, cue, and answer all come from the same approved room photo.",
  ],
  [
    "06-challenge",
    "For visual recall, the person studies where an object appears. The room is gently hidden, and they remember its place. Gemini creates the room-specific prompt, while ANCHOR keeps the activity calm, unscored, and free of pressure.",
  ],
  [
    "07-support",
    "With consent, Gemini Image creates an approved guide portrait. Gemini Omni Flash animates a short guide clip. Gemini Flash TTS provides a neutral synthetic voice. The clip is labelled AI-generated, not live, and never clones a family voice.",
  ],
  [
    "08-close",
    "ANCHOR brings Gemini vision, structured question generation, spatial image generation, video, and voice into one dementia-friendly experience. It does not diagnose or treat dementia. It helps families practise familiar surroundings.",
  ],
];

const client = new GoogleGenAI({apiKey});
const audioDir = new URL("../public/audio/", import.meta.url);
const run = promisify(execFile);
let useLocalFallback = false;

for (const [name, transcript] of clips) {
  if (!useLocalFallback) {
    try {
      const interaction = await client.interactions.create({
        model: "gemini-3.1-flash-tts-preview",
        input: `Create a polished hackathon pitch voiceover.\n\nDIRECTOR NOTES:\nUse Sulafat as a warm, natural adult narrator. Sound human, confident, empathetic, and conversational. Speak at about 145 words per minute with natural pauses. Avoid a robotic rhythm, an advertisement voice, or exaggerated emotion. Pronounce ANCHOR as the English word anchor. Read only the transcript.\n\nTRANSCRIPT:\n${transcript}`,
        response_format: {
          type: "audio",
          mime_type: "audio/wav",
          delivery: "inline",
        },
        generation_config: {
          speech_config: [{voice: "Sulafat", language: "en"}],
        },
        store: false,
      });

      const output = interaction.output_audio;
      if (!output?.data) {
        throw new Error(`Gemini returned no audio for ${name}`);
      }

      const decoded = Buffer.from(output.data, "base64");
      const wav = isWave(decoded)
        ? decoded
        : encodeWave(decoded, output.sample_rate ?? 24000, output.channels ?? 1);
      await writeFile(join(audioDir.pathname, `${name}.wav`), wav);
      console.log(`${name}: Gemini Sulafat voice`);
      continue;
    } catch (error) {
      useLocalFallback = true;
      console.warn(
        `Gemini TTS unavailable. Using the natural local Reed voice. ${error instanceof Error ? error.message : ""}`,
      );
    }
  }

  const aiffPath = join(audioDir.pathname, `${name}.aiff`);
  const wavPath = join(audioDir.pathname, `${name}.wav`);
  await run("/usr/bin/say", [
    "-v",
    "Reed (English (UK))",
    "-r",
    "165",
    "-o",
    aiffPath,
    transcript,
  ]);
  await run("/usr/bin/afconvert", [
    "-f",
    "WAVE",
    "-d",
    "LEI16@44100",
    aiffPath,
    wavPath,
  ]);
  console.log(`${name}: natural Reed fallback voice`);
}

function isWave(bytes) {
  return (
    bytes.length >= 12 &&
    bytes.toString("ascii", 0, 4) === "RIFF" &&
    bytes.toString("ascii", 8, 12) === "WAVE"
  );
}

function encodeWave(pcm, sampleRate, channels) {
  const header = Buffer.alloc(44);
  const bytesPerSample = 2;
  header.write("RIFF", 0, "ascii");
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write("WAVE", 8, "ascii");
  header.write("fmt ", 12, "ascii");
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * channels * bytesPerSample, 28);
  header.writeUInt16LE(channels * bytesPerSample, 32);
  header.writeUInt16LE(bytesPerSample * 8, 34);
  header.write("data", 36, "ascii");
  header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}
