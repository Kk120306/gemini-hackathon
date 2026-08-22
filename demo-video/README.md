# ANCHOR Hackathon Product Film

This Remotion project renders the verified ANCHOR core loop as a 2-minute 36-second, 1920 by 1080 product film.

The film uses real product screenshots, a truthfully paired synthetic source room, licensed Pexels presentation references, and neutral non-cloned narration.

The rendered output is intentionally ignored by Git because it is reproducible and approximately 59 MB.

## Commands

Install the pinned dependencies:

```console
npm install
```

Open Remotion Studio without launching another browser:

```console
npm run dev
```

Run the source checks:

```console
npm run lint
```

Render the final film:

```console
npm run render
```

The final file is written to `out/anchor-demo.mp4`.

Render the primary spatial-room still:

```console
npm run still
```

## Source Material

Stock-photo attribution and usage boundaries are recorded in `ASSET_CREDITS.md`.

The complete narration is recorded in `VOICEOVER.md`.

Product frames live in `public/product`, licensed stock references live in `public/assets`, and neutral narration clips live in `public/audio`.
