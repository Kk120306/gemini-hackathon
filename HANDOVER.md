# ANCHOR Design Alignment Handover

## Handover Summary

Phase 2 live grounding is committed in `c287089`.
The updated mockup alignment checkpoint is complete in the current worktree and is ready for its dedicated commit.
The next implementation phase is the progressive cue magic moment with non-blocking validated simplified-room media.

## What Is Ready

- A Next.js 16 application with strict TypeScript, Tailwind CSS, Zod, Vitest, and Playwright is configured.
- The caregiver and patient route shells are implemented with responsive, accessible layouts.
- Synthetic bedroom, trusted-person, grounding, and six-question fixtures are included.
- The patient tablet shell has large touch targets, persistent generated-guide labeling, and no viewport scrolling at the target tablet size.
- Fixture mode runs without a Gemini API key.
- Runtime schemas reject malformed domain and lesson state before it is stored or rendered.
- The caregiver can edit a Gemma proposal, inspect its original observation, approve the evidence, and carry the correction into the lesson.
- Consent, a stylized guide, and a neutral non-likeness fallback are available through explicit caregiver controls.
- The patient can complete exactly six questions with deterministic progressive cues, visible help, generic speech synthesis, and no score.
- The source-image grounding box remains aligned when the room image is responsively cropped.
- Patient routes wait for persisted caregiver approval before rendering any lesson content.
- Primary, neutral-guide fallback, accessibility, touch-target, persistence, and viewport-fit paths are automated.
- The production preview is available privately through Tailscale Serve at `https://kais-mac-mini.tail4a140f.ts.net:3443/` while the local server is running on port 3001.
- Personal uploads, generated media, local application data, and `.env.local` are excluded from Git.
- Formatting, linting, type checking, unit tests, end-to-end tests, and the production build passed on 2026-08-22.
- Hosted Gemma proposes three to five visible objects with normalized bounding boxes through a server-only provider.
- The caregiver's selected room image is validated, stored outside version control, and served through a private no-store media route.
- Gemma produces an ID-only six-question plan and application code compiles all patient-facing language from approved evidence.
- Malformed, unsupported, over-inferred, MIME-spoofed, and ungrounded responses fail closed with at most one structured repair attempt.
- The complete prepared-room live flow passed locally against the configured Gemma model on 2026-08-22.
- A manually triggered GitHub Actions live smoke workflow is included.
- The updated mockup now anchors the product's warm neutral canvas, Figtree typography, sage actions, rounded cards, progress dots, and two-column patient stage.
- The patient start screen makes the approved room the primary visual and keeps the generated guide visibly labeled but secondary.
- The patient activity screen fits the 1194 by 834 tablet viewport without scrolling.
- The source and implementation were compared in a normalized combined capture and `design-qa.md` records a passing result.

## What Is Not Ready

- Gemini-generated simplified room media and guide media are not implemented yet.
- Repository-level GitHub Actions secret discovery currently reports no `GEMINI_API_KEY`, so the workflow credential scope must be confirmed before CI can run.
- Generated room images, media validation, and asynchronous guide video remain Phase 3 and Phase 4 work.
- Authentication is intentionally outside the hackathon MVP scope, so this build must not be exposed directly to the public internet.

## Move the Project to the Mac mini

The Mac mini should have Git, Node.js 22, and Corepack installed.

```bash
git clone https://github.com/Kk120306/gemini-hackathon.git gemini-hackathon
cd gemini-hackathon
corepack enable
corepack prepare pnpm@11.9.0 --activate
pnpm install --frozen-lockfile
cp .env.example .env.local
```

Fixture mode is enabled by default and does not need a credential.
Set `ANCHOR_DEMO_MODE=false` only when a valid server-side `GEMINI_API_KEY` is available.

Run every quality gate before starting the transferred build.

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm test:live
pnpm build
```

Start the production server on the Mac mini loopback interface.

```bash
pnpm exec next start --hostname 127.0.0.1 --port 3000
```

Open `http://127.0.0.1:3000` on the Mac mini to verify the application locally.

## Private Remote Access with Tailscale

Tailscale Serve is the recommended remote-access path because it can expose the loopback-only application privately to devices authorized by the same tailnet.
Do not use Tailscale Funnel for this phase because Funnel would make the unauthenticated application publicly reachable.

1. Install the standalone Tailscale client on the Mac mini by following the [official macOS installation guide](https://tailscale.com/docs/install/mac).
2. Install Tailscale on the remote device and sign both devices into the same tailnet.
3. Keep the ANCHOR production server running on `127.0.0.1:3000`.
4. Run the following commands on the Mac mini.

```bash
tailscale serve --bg 3000
tailscale serve status
```

5. Open the HTTPS `*.ts.net` address printed by `tailscale serve status` from the authorized remote device.
6. Confirm that the landing page and `/patient/session` load from the remote device.

The current Tailscale Serve syntax and behavior are documented in the [official Serve CLI reference](https://tailscale.com/docs/reference/tailscale-cli/serve) and [Serve guide](https://tailscale.com/docs/features/tailscale-serve).

Remove the private proxy when it is no longer needed.

```bash
tailscale serve reset
```

## Keep ANCHOR Running After Login

First verify the application in a foreground Terminal session.
After that succeeds, a macOS LaunchAgent can restart it automatically whenever the Mac mini user logs in.

Create `~/Library/LaunchAgents/com.anchor.app.plist` with the following content.
Replace `/ABSOLUTE/PATH/gemini-hackathon` with the actual repository path on the Mac mini.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.anchor.app</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/zsh</string>
    <string>-lc</string>
    <string>cd /ABSOLUTE/PATH/gemini-hackathon &amp;&amp; pnpm exec next start --hostname 127.0.0.1 --port 3000</string>
  </array>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <true/>
  <key>StandardOutPath</key>
  <string>/tmp/anchor.out.log</string>
  <key>StandardErrorPath</key>
  <string>/tmp/anchor.err.log</string>
</dict>
</plist>
```

Load and start the LaunchAgent.

```bash
launchctl bootstrap "gui/$(id -u)" ~/Library/LaunchAgents/com.anchor.app.plist
launchctl kickstart -k "gui/$(id -u)/com.anchor.app"
```

Inspect its logs if the application does not start.

```bash
tail -n 100 /tmp/anchor.out.log
tail -n 100 /tmp/anchor.err.log
```

Stop and unload the LaunchAgent with the following command.

```bash
launchctl bootout "gui/$(id -u)" ~/Library/LaunchAgents/com.anchor.app.plist
```

The production server requires a successful `pnpm build` after every pulled code change.
The supported Next.js production-server options are documented in the [official Next.js CLI reference](https://nextjs.org/docs/app/api-reference/cli/next).

## Smoke-Test Checklist

- Open `/` and confirm that both caregiver and patient entry points are present.
- Open `/caregiver/world-model` and confirm that the grounding evidence is visible.
- Open `/patient/session` at a tablet-sized viewport and confirm that the room remains dominant and the page does not scroll.
- Confirm that the generated-guide label remains visible.
- Confirm that the application is reachable through the private Tailscale URL from a second authorized device.
- Confirm that the application is not reachable from a device outside the tailnet.

## Safety and Data Notes

- Use only the bundled synthetic fixtures during this phase.
- Never commit `.env.local`, `.data`, uploaded photos, generated images, or generated videos.
- Never configure Tailscale Funnel or direct router port forwarding for this unauthenticated build.
- Do not describe the current shell as diagnosing, scoring, monitoring, or treating dementia.
- Do not use a real family likeness until the caregiver consent and approval flow is implemented.

## Resume Development

Phase 3 should preserve the aligned core screens and deterministic cue engine while adding validated simplified-room media as a non-blocking enhancement.
Read `docs/STATUS.md` and `docs/IMPLEMENTATION_PLAN.md` before resuming.
Complete, verify, document, commit, push, and hand over each future phase separately.
