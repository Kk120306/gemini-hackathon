# ANCHOR Environment Setup

## Local Runtime

The current machine has Node.js 22 and pnpm available.
The application uses the repository's pinned package-manager version.

## Required Secret

`GEMINI_API_KEY` is the only required external secret for the hackathon architecture.
It is used server-side for hosted Gemma, Gemini text and validation, native image generation, Gemini Omni Flash video generation, and Gemini native speech.

Create the key in Google AI Studio and place it only in `.env.local`:

```dotenv
GEMINI_API_KEY=replace_with_your_real_key
```

Never prefix this variable with `NEXT_PUBLIC_`.
Never commit `.env.local`.

## Model Configuration

The initial model selections are:

- `GEMMA_MODEL=gemma-4-26b-a4b-it` for object analysis and lesson generation.
- `GEMINI_VALIDATION_MODEL=gemini-3.6-flash` for generated-media validation and repair tasks.
- `GEMINI_IMAGE_MODEL=gemini-3.1-flash-lite-image` for the single-reference simplified room image.
- `GEMINI_VIDEO_MODEL=gemini-omni-flash-preview` for one short generated video.
- `GEMINI_TTS_MODEL=gemini-3.1-flash-tts-preview` for exact approved question speech.
- `GEMINI_TTS_VOICE=Sulafat` for the fixed warm synthetic guide voice.

All names are environment variables because availability and preview identifiers can change.
Model access must be verified with the actual hackathon API key before implementation is locked.

The current Google documentation marks Gemini Omni Flash as a preview, paid-tier video model.
The demo must keep its static fallback if access is unavailable.

## Application Variables

| Variable                                | Required              | Purpose                                                 |
| --------------------------------------- | --------------------- | ------------------------------------------------------- |
| `GEMINI_API_KEY`                        | Yes for live AI       | Server-side Google Gen AI credential                    |
| `GEMMA_MODEL`                           | Yes                   | Hosted Gemma model identifier                           |
| `GEMINI_VALIDATION_MODEL`               | Yes                   | Multimodal validation and structured repair             |
| `GEMINI_IMAGE_MODEL`                    | Yes                   | Avatar and room image generation                        |
| `GEMINI_VIDEO_MODEL`                    | When video is enabled | Short video generation                                  |
| `GEMINI_TTS_MODEL`                      | Yes                   | Exact approved question speech                          |
| `GEMINI_TTS_VOICE`                      | Yes                   | Fixed allowlisted synthetic guide voice                 |
| `ANCHOR_STORAGE_MODE`                   | Yes                   | Selects `local` or a future storage adapter             |
| `ANCHOR_DATA_DIR`                       | Yes in local mode     | Private JSON and media root                             |
| `ANCHOR_DEMO_MODE`                      | Yes                   | Enables deterministic demo fixtures and fallback assets |
| `ANCHOR_LIVE_MEDIA_IN_DEMO`             | Yes                   | Uses live Gemini room media with deterministic demo text |
| `ANCHOR_ENABLE_IMAGE_GENERATION`        | Yes                   | Enables live image-generation jobs                      |
| `ANCHOR_ENABLE_VIDEO_GENERATION`        | Yes                   | Enables the single video-generation moment              |
| `NEXT_PUBLIC_ENABLE_SPEECH_RECOGNITION` | Yes                   | Enables the optional browser speech UI                  |
| `ANCHOR_AI_TIMEOUT_MS`                  | Yes                   | Timeout for text and image operations                   |
| `ANCHOR_VIDEO_TIMEOUT_MS`               | Yes                   | Timeout for the video operation                         |
| `ANCHOR_MAX_UPLOAD_MB`                  | Yes                   | Maximum decoded upload size                             |
| `NEXT_PUBLIC_APP_NAME`                  | Yes                   | Public display name                                     |
| `NEXT_PUBLIC_APP_URL`                   | Yes                   | Local or deployed origin                                |

## Files Created

`.env.example` is the committed template.
`.env.local` is the ignored local configuration file and contains the local live-provider configuration on the current development machine.
`.gitignore` excludes `.env.local`, `.data`, build output, test artifacts, and common local noise.

## Feature Flags

Image generation remains enabled because it is part of the required demonstration.
`ANCHOR_LIVE_MEDIA_IN_DEMO` may be enabled locally to keep the six-question fixture deterministic while exercising the real spatial-room generation and validation path.
Video generation remains enabled because it is part of the requested demonstration, but the app must degrade to a static guide.
Speech recognition remains disabled by default because it is a nice-to-have feature.

## Startup Validation

The application validates environment variables on server startup with Zod.
Validation distinguishes between live mode and fixture mode:

- Live mode requires `GEMINI_API_KEY`.
- Fixture mode may run without external credentials.
- Video can be disabled independently when the key lacks paid-tier access.
- No server-only variable may be serialized into client bundles.

## Storage Notes

Local storage is appropriate for the hackathon laptop.
It is not appropriate for an ephemeral serverless deployment.
If deployment is required, add a storage adapter and its credentials only after the local end-to-end flow is stable.

## Secret Verification

The local `GEMINI_API_KEY` was verified through the complete prepared-room Gemma smoke path on 2026-08-22.
The key value remains ignored and must never be copied into source files, client variables, logs, or screenshots.

The repository includes a manually triggered live-provider GitHub Actions workflow that expects the exact repository secret name `GEMINI_API_KEY`.
The final handover audit found the user-provided secret under the Codespaces scope, which GitHub Actions cannot read through `${{ secrets.GEMINI_API_KEY }}`.
The locally verified key was copied directly from ignored `.env.local` into the repository Actions secret without printing or storing its value elsewhere.
`gh secret list --app actions` confirmed the repository-level `GEMINI_API_KEY` name on 2026-08-22.
