# ATEM WEB MANAGER - AI HANDOVER SPECIFICATION
Current Application Version: v3.73

This document serves as the master architectural memory bank for the ATEM Web Manager. It must be provided as the primary source of truth to any incoming AI assistant initializing a new session. It defines the application state, structural invariants, execution context, and operational protocols.

---

## 1. STRICT RULES OF ENGAGEMENT & OPERATIONAL PROTOCOL
1. CONDITIONAL VERSION INCREMENT: Increment the application version number using two-segment vX.XX notation across file headers, metadata, ops/HANDOVER.MD, and src/version.js ONLY if codebase or documentation files are actively modified. Do not increment the version or output any files for purely conversational replies, explanations, or missing descriptor corrections. Never use semantic three-dot decimals.
2. NO UNREQUESTED CHANGES: Never alter existing features, components, styles, geometry, or architecture unless explicitly requested by the user.
3. MODULAR CHANGELOG & TOKEN CONSERVATION: NEVER output the full ops/CHANGELOG.MD or ops/HANDOVER.MD files in standard chat responses unless explicitly requested by the user. Deliver iteration changelogs exclusively as modular snippets in ops/CHANGELOG/vX.XX.md.
4. 100% COMPLETE MODIFIED FILES ONLY: Always output full, complete files ready to copy-paste directly. Never output diffs, snippets, placeholders, or partial updates. If no files are changed, do not output any code blocks.
5. DUAL PATH-ONLY FILE HEADERS: Precede every delivered file code block with an exterior header containing exclusively the absolute paths (Windows first, macOS second, without 'FILE:' prefix), as plain text outside of any code blocks.
6. PARSER ISOLATION & ZERO-NESTED-BACKTICKS PROTOCOL:
    - Each delivered file must reside in its own independent code block.
    - NEVER include backticks inside the body of any Markdown or documentation file. Use 4-space indentation for code, trees, or CLI examples inside .md files.
    - Wrap .md documentation files inside plain text code fences to prevent web chat parser collisions.
    - Ensure every code block strictly closes before starting the next file.
7. TOKEN BUDGET & OUTPUT CEILING GUARD:
    - Never attempt to output more than 2-3 large files in a single response turn.
    - When modifications span multiple large files, stage and chunk deliveries across consecutive turns or prompt the user before generating to guarantee zero mid-generation truncation and ensure all code blocks strictly close.
8. MANDATORY ITERATION DESCRIPTOR: Always conclude every turn with a concise, factual summary descriptor of all modifications made.

---

## 2. PROJECT ARCHITECTURE & INVARIANTS

### Physical Hardware & Telemetry
- LOCKED ATEM IP: 192.168.10.240. The AtemConstellationBus.jsx, AtemMacros.jsx, MediaPool.jsx, and AtemMacrosCompact.jsx components operate exclusively on this IP.
- Bridge Backend: A Node.js background daemon (bridge/server.js) utilizes atem-connection to interface with the physical ATEM via UDP 9910 and translates telemetry into a React-friendly JSON WebSocket stream on port 8080.
- Bidirectional Hardware Sync: Mixer buttons, tally lights, upstream/downstream keyers, fade-to-black states, macro execution, and auxiliary outputs dynamically reflect real-world hardware interactions captured via atem.on('receivedCommands').

### Visual Geometry & Layout Lockdowns
- Multiview 16:9 Protocol: The .quadrant-wrapper grid tracks are locked to minmax(0, 1fr) with strict min-width: 0, min-height: 0 rules and overflow: hidden. Panel padding is constrained to 10px. This mathematical boundary prevents any component from stretching the master aspect ratio.
- Button Symmetries: Switcher keys are hard-locked to exactly 74px width by 36px height. Ten-column rows equal exactly 786px with zero internal box offset. Active tallies maintain border: 1px solid var(--atem-border) parity.
- Radii: Global variables define --pill-radius: 24px and --panel-radius: 9px.

### Panel Routing Configurations (Quadrant Contexts)
1. STREAM: Embedded YouTube IFrame / HTML5 replica player overlay.
2. MEDIA POOL: Hardware-synced thumbnail loader and RGBA uploader.
3. MIXER: 1 M/E Constellation HD bus replica with locking state.
4. MACROS (PAGINATED): 100-macro selector (currently deactivated).
5. MACROS (COMPACT): 40-macro grid matching mixer dimensions.
6. CONSOLE: Bridge daemon telemetry readout with text log exporter.
0. NONE: Displays a discrete muted ID number centered in the panel.

---

## 3. MASTER OPERATIONS CLI SUITE (ops/)

The workspace relies on a robust pair of cross-platform CLI tools: OPS.BAT for Windows and OPS.SH for macOS/Linux. 

### Menu Pathways
- [1] RUN & EVALUATE: Installs dependencies, cleans ports (8080/3000), bootstraps WOFF2 fonts, merges changelogs, serializes codebase.txt, starts the Node.js bridge silently in the background, and boots Vite. Upon Vite termination, intercepts control directly into GitHub Operations.
- [2] GITHUB OPERATIONS (TRUNK-BASED): Access point for all Git tasks. [1] MERGE TO MAIN utilizes a Trunk-Based approach:
  - If executed from main, it directly commits, pushes, and then tags a historical marker branch (e.g. v3.73), leaving the workspace cleanly on main.
  - If executed from a feature branch, it updates the branch, checks out main, merges the branch in, tags it, pushes, and then returns the operator back to the feature branch.
- [3] WIPE & RE-CLONE: Requires the .atem_workspace_token with the secure key ATEM_MANAGER_SECURE_WIPE_KEY_2026. Triggers a detached ghost script to terminate locks, delete the root folder, and re-clone the repo dynamically to cure corrupt states.
- [4] EXPORT CODEBASE: Manually serializes all JS, JSX, CSS, and configuration files into codebase.txt for AI prompt ingestion.
- [5] EXIT: Executes cleanup_ports and clears the terminal (cls / clear) to exit cleanly.

### Environment Paths & Portable Node
- On Windows, if a global node is absent, the CLI downloads portable Node.js LTS into bin\node. It permanently caches user-selected paths inside .atem_node_path.
- Progress overlays (Invoke-WebRequest) in Windows are suppressed via $ProgressPreference = 'SilentlyContinue' to ensure standard inline CLI outputs.

---

## 4. CURRENT FEATURES & RECENT UPGRADES (v3.73)

- Trunk-Based Development Sync: ops/OPS.BAT and ops/OPS.SH now use Trunk-Based rules. Merging from main applies commits directly to main and creates a tagged backup branch (v3.73), deliberately keeping the user's active checkout pinned to main to avoid diverged heads.
- Media Pool Controls & Concentric Tallies:
  - Added a CLEAR button to instantly wipe the local thumbnail cache.
  - Added a hover-activated 'X' button (.mp-clear-btn) to slots to clear both the local cache and trigger CLEAR_STILL on the physical ATEM switcher.
  - A small picture-lock toggle switch hides active pictures, reverting to numbered placeholders (.mp-slot-num-circle displays when images are locked on).
  - Filenames are now handled via the GlobalTooltip hover engine rather than a static text bar.
  - Tallies render at maximum brightness. When both MP1 and MP2 are assigned to the identical slot, the red MP2 tally renders concentrically (4px inner shadow) inside the green MP1 border.
- Panel Lock Toggle (Inverted): An Apple-style switch rests in the AtemConstellationBus header. When active (green/isUnlocked = true), the panel is fully interactive. When toggled OFF (grey/isUnlocked = false), it mutes opacity to 0.45 and executes pointerEvents: 'none', locking all input interactions and keyboard hotkeys while preserving active tally illumination.
- Bridge Console Log Exporter: Quadrant ID 6 (ConsolePanel.jsx) displays intercepted Node.js logs streamed from bridge/server.js. Includes an EXPORT button generating localized .txt files containing historical event telemetry.
- Double-Click Rate Reset: Transition, DSK, and FTB DragRateInput sliders immediately snap back to default 25 frames (1:00) when double-clicked.
- Keyboard Bounce Shield: A strict if (e.repeat) return; block shields the ATEM UDP network from repetitive flood queues caused by held-down keyboard hotkeys.
- Hardware YUV Decoding: bridge/server.js translates ATEM 4:2:2 UYVY buffers natively into standard 54-byte BMP structures in under 2ms via custom decimation math, avoiding external image parsing libraries and bypassing Node Event Loop blocking.
- Single-Flight UDP Queues: Background thumbnail downloads are strictly limited to one concurrent task and paused universally for 1000ms the instant any PGM/PVW/CUT/AUTO switcher command is triggered, prioritizing sub-millisecond execution for actual video transitions.