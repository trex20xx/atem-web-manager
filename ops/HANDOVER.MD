# ATEM WEB MANAGER - AI HANDOVER SPECIFICATION
Current Application Version: v3.90

This document serves as the master architectural memory bank for the ATEM Web Manager. It must be provided as the primary source of truth to any incoming AI assistant initializing a new session. It defines the application state, structural invariants, execution context, and operational protocols.

---

## 1. STRICT RULES OF ENGAGEMENT & OPERATIONAL PROTOCOL
1. CONDITIONAL VERSION INCREMENT: Increment the application version number using two-segment vX.XX notation across file headers, metadata, ops/HANDOVER.MD, ops/DESCRIPTOR.txt, and src/version.js ONLY if codebase or documentation files are actively modified. Do not increment the version or output any files for purely conversational replies, explanations, or missing descriptor corrections. Never use semantic three-dot decimals.
2. NO UNREQUESTED CHANGES: Never alter existing features, components, styles, geometry, or architecture unless explicitly requested by the user.
3. MODULAR CHANGELOG & TOKEN CONSERVATION: NEVER output the full ops/CHANGELOG.MD or ops/HANDOVER.MD files in standard chat responses unless explicitly requested by the user. Deliver iteration changelogs exclusively as modular snippets in ops/CHANGELOG/vX.XX.md.
4. 100% COMPLETE MODIFIED FILES ONLY: Always output full, complete files ready to copy-paste directly. Never output diffs, snippets, placeholders, or partial updates. If no files are changed, do not output any code blocks.
5. DUAL PATH-ONLY FILE HEADERS: Precede every delivered file code block with an exterior header containing exclusively the absolute paths (Windows first, macOS second, without "FILE:" prefix), as plain text outside of any code blocks.
6. PARSER ISOLATION & ZERO-NESTED-BACKTICKS PROTOCOL:
    - Each delivered file must reside in its own independent code block.
    - NEVER include backticks inside the body of any Markdown or documentation file. Use 4-space indentation for code, trees, or CLI examples inside .md files.
    - Wrap .md documentation files inside plain text code fences to prevent web chat parser collisions.
    - Ensure every code block strictly closes before starting the next file.
7. TOKEN BUDGET & OUTPUT CEILING GUARD:
    - Never attempt to output more than 1-2 large files in a single response turn. Multi-file dumps trigger Google AI Studio parser collapse.
    - When modifications span multiple large files, stage and chunk deliveries across consecutive turns. Wait for the user to reply "next" to guarantee zero mid-generation truncation.
8. MANDATORY ITERATION DESCRIPTOR & DESCRIPTOR FILE: Always conclude every turn with a concise, factual summary descriptor of all modifications made. When files are modified, always include ops/DESCRIPTOR.txt.

---

## 2. PROJECT ARCHITECTURE & INVARIANTS

### Physical Hardware & Telemetry
- LOCKED ATEM IP: 192.168.10.240. The AtemConstellationBus.jsx, AtemMacros.jsx, MediaPool.jsx, and AtemMacrosCompact.jsx components operate exclusively on this IP.
- Bridge Backend: A Node.js background daemon (bridge/server.js) utilizes atem-connection to interface with the physical ATEM via UDP 9910 and translates telemetry into a React-friendly JSON WebSocket stream on port 8080.
- Telemetry Categorization: Logs are explicitly tagged:
  - [USER]: Triggered by interaction with the web interface.
  - [ATEM]: Triggered by physical hardware or Blackmagic Software Control.
  - [BRIDGE]: Node.js daemon link status.
  - [SYSTEM]: UI settings, theme adjustments, and panel unlocks.
  - [DEBUG]: Raw incoming/outgoing ATEM UDP packets and method diagnostics.
- Duplicate Suppression: Bridge maintains a 1000ms suppression timer on user-triggered actions so that hardware acknowledgment packets do not produce duplicate [ATEM] logs.

### Visual Geometry & Layout Lockdowns
- Multiview 16:9 Protocol: The .quadrant-wrapper grid tracks are locked to minmax(0, 1fr) with strict min-width: 0, min-height: 0 rules and overflow: hidden. Panel padding is constrained to 10px. This mathematical boundary prevents any component from stretching the master aspect ratio.
- Switcher Architecture: Authentic 4-row layout:
  - Row 1: PROGRAM (786px wide, 10 inputs + internal sources).
  - Row 2: PREVIEW (786px wide, 10 inputs + internal sources).
  - Row 3: NEXT TRANSITION (396px, Cols 1-5), DSK 1 (162px, Cols 7-8, 72px gap), FTB (84px, Col 10, flush right).
  - Row 4: OUTPUTS (474px, Cols 1-6), TRANSITION (240px: Rate, CUT, AUTO, flush right).
- Button Symmetries: Switcher keys are hard-locked to exactly 74px width by 36px height with 4px gaps. Active tallies maintain border: 1px solid var(--atem-border) parity to eliminate optical boundary jumping.
- Rate Scrubbers: Frame-relative dragging with instantaneous middle-click and double-click reset to 25 frames (1:00). Text typing/selection is suppressed.
- Radii: Global variables define --pill-radius: 24px and --panel-radius: 9px.

### Default Panel Routing Configurations (Quadrant Contexts)
1. STREAM (Q1): Embedded YouTube IFrame / HTML5 replica player overlay.
2. MEDIA POOL (Q2): 4x4 slot grid across 2 pages (16 stills on page 1, 4 stills + 4 clips on page 2). Text-only MP1/MP2 tallies.
3. MIXER (Q3): 1 M/E Constellation HD bus replica. Muted monochrome state when disconnected, green activity pulse on hardware events.
4. MACROS (PAGINATED): 100-macro selector (currently deactivated).
5. MACROS (COMPACT) (Q4): 40-macro grid matching mixer dimensions.
6. CONSOLE: Bridge daemon telemetry readout with multi-source filtering (ALL, USER, ATEM, BRIDGE, SYSTEM, DEBUG), local OS clock timestamps, 3-state TIME filter, selectable text, and text export.
0. NONE: Displays a discrete muted ID number centered in the panel.

---

## 3. MASTER OPERATIONS CLI SUITE (ops/)

The workspace relies on a robust pair of cross-platform CLI tools: OPS.BAT for Windows and OPS.SH for macOS/Linux. 

### Menu Pathways
- [1] RUN & EVALUATE: Resolves Node.js runtime, installs dependencies, verifies/downloads offline broadcast fonts from jsDelivr, chronologically sorts changelogs (descending), serializes codebase.txt, starts the bridge daemon silently on :8080, and boots Vite on :3000. Upon Vite termination, drops control directly into GitHub Operations.
- [2] GITHUB OPERATIONS (TRUNK-BASED):
  - [1] MERGE TO MAIN: Executes Pre-Commit Version Integrity Audit Gate. If verified, commits directly to main, tags the historical marker release (e.g. v3.90), and publishes using explicit refspecs (refs/heads/ and refs/tags/), leaving the operator cleanly on main.
  - [2] PUSH TO BRANCH: Checkpoints progress on the active branch.
  - [3] SWITCH BRANCH: Formatted interactive branch and tag switcher.
  - [4] CREATE NEW BRANCH: Spawns and checks out a new branch.
  - [5] WIPE & RE-CLONE: Requires .atem_workspace_token with ATEM_MANAGER_SECURE_WIPE_KEY_2026. Detaches background ghost script to wipe and fresh-clone from GitHub.
  - [6] REVERT & DISCARD: Hard resets working tree to HEAD.
- [4] EXPORT CODEBASE: Serializes whole repository (root configs, bridge, src, ops scripts, specifications) into codebase.txt.
- [5] EXIT: Terminates ports and clears terminal.

---

## 4. CURRENT FEATURES & UPGRADES (v3.90)

- Mixer Baseline Restoration: Purged experimental T-Bar and restored clean, unshifted 4-row layout.
- Diagnostic Bridge Engine: Implemented DEBUG filter streaming raw ATEM packets and diagnostic method discovery.
- Version Integrity Audit Gate: Pre-commit verification gate with 3-choice decision menu (Abort, Force Override, Custom Tag).
- Offline Font Caching: Per-file existence check prevents redundant downloads; uses immutable jsDelivr CDN mirrors.
- Local OS Time & Console Selection: Console timestamps use local system time with 3-state TIME toggle; text is selectable.
- Settings Theme Editor: Real-time CSS variable editor for typography and colors with instant default reset.