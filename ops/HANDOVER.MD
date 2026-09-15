# ATEM WEB MANAGER - MASTER SPECIFICATION & HANDOVER
Current Version: v3.33
Architecture: React 18, Vite, Native CSS Variables, Componentized Hooks, Pure Sliding Animations, Fullscreen Toggle, ATEM Macro Matrix (Quadrant 4, 100-macro 3-page scroller), Integrated Bottom Action & Aux Routing Bar, Auto-Watchdog Bridge Daemon, Full Bidirectional Hardware Bridge, Decoupled Versioning Module, Modular Runtime-Synced Changelogs, Streamlined 4-Action Master CLI Suite.

---

## 1. STRICT RULES OF ENGAGEMENT (PERMANENT PROTOCOL)
1. CONDITIONAL VERSION INCREMENT: Increment the application version number using two-segment vX.XX notation across file headers, metadata, ops/HANDOVER.MD, and src/version.js ONLY if codebase or documentation files are actively modified. Do not increment the version or output files for purely conversational replies, explanations, or missing descriptors. Never use semantic three-dot decimals.
2. NO UNREQUESTED CHANGES: Never modify existing functionality, logic, or design unless explicitly requested.
3. MODULAR CHANGELOG & TOKEN CONSERVATION: Never output the full ops/CHANGELOG.MD file in chat responses unless explicitly requested by the user, in order to preserve context tokens. Deliver individual iteration changelogs exclusively inside ops/CHANGELOG/vX.XX.md for automated synchronization by the CLI suite.
4. 100% COMPLETE MODIFIED FILES ONLY: Always output full, complete files ready to copy-paste directly. Never output diffs, snippets, placeholders, or partial updates. Only output files that were actively created or modified. If no files are changed (e.g., answering a question), do not output any code blocks.
5. DOCUMENTATION CONSOLIDATION IN /OPS: All project documentation lives exclusively within ops/ as core files (ops/CHANGELOG.MD, ops/HANDOVER.MD, ops/SYSTEM_INSTRUCTIONS.MD) supported by modular snippets in ops/CHANGELOG/.
6. ITERATION DESCRIPTOR: Always provide a clear, concise descriptor text at the end of every response summarizing the iteration's changes.
7. NO WAITING FOR CONFIRMATION: Provide full files immediately without holding back for intermediate confirmation.
8. WORKSPACE & PATH RESOLUTION PROTOCOL:
   - Workspace root path is permanently anchored to:
     C:\Users\robert.mirt\Downloads\PROGRAMMING\atem-web-manager
   - Portable, Homebrew, and enterprise Node.js/npm environments lacking global PATH registration must be detected and resolved via persistent .atem_node_path caching and injected into runtime session paths.
9. [LOCKED] ELEMENTS PROTOCOL:
   - Corner Radii: Buttons use --pill-radius: 24px. Panels use --panel-radius: 9px.
   - Video Player UI: YouTube desktop replica layout (Lofi Cafe reference) with full-width red progress scrubber, hover-expanding volume slider, and 30% transparency dark gradient control bar.
   - Multiview 16:9 Aspect Ratio: Strictly maintained under all resize conditions. Quadrant grid tracks are permanently locked to minmax(0, 1fr) and panels to min-height: 0; min-width: 0; overflow: hidden; to mathematically prevent content-driven track expansion.
   - Hardware-Locked IP: AtemConstellationBus.jsx, AtemMacros.jsx, and AtemMacrosCompact.jsx are locked exclusively to IP 192.168.10.240.
   - Sidebar Devices, Groups & Edit Panels Design: Row height 30px, 4px equidistant edit button geometry, pill edit fields, and color dropdown clear mechanics.
   - Top Bar & Navigation: Apple-style sliding switch with embedded SVG sun/moon icons matching the settings gear size; synchronized sidebar collapse and multiview vertical zoom transitions. All top bar button hover overlays use circular geometry; version tag uses pill hover geometry.
   - ATEM Switcher Button Geometry: Standardized grid buttons (PGM, PVW, Aux, Actions, Next Transition, DSK, FTB) locked to fixed 74px x 36px dimensions.
   - ATEM Switcher Bus Layout: Dual-row horizontal arrays (Inputs 1–10 top, Internal sources bottom) encapsulated within distinct bounding boxes with 4px padding equal to button spacing. Section titles align flush left with the leftmost button. Bottom row houses OUT 1–6 (Cols 1–6), Spacer (Col 7), Rate (Col 8), CUT (Col 9), and AUTO (Col 10). Next Transition sits under Inputs 1–5, DSK 1 sits under Inputs 7–8, and FTB sits under Input 10.
   - Active Button Boundaries: Selected switcher buttons change background color only and keep identical borders to unpressed buttons (border: 1px solid var(--atem-border)) to eliminate visual expansion.
10. PARSER ISOLATION, ZERO-NESTED-BACKTICKS & PATH-ONLY FILE HEADERS:
    - Every delivered file must reside in its own independent 3-backtick code block.
    - Precede each code block with an exterior plain-text title containing *exclusively* the absolute path and filename (without any "FILE:" prefix), formatted as:
      C:\Users\robert.mirt\Downloads\PROGRAMMING\atem-web-manager\path\to\file.ext
    - To prevent web UI markdown parsers from breaking and collapsing multiple files into one chunk, NEVER use triple backticks inside the body of any delivered documentation or Markdown file (.md). Use 4-space indentation for file trees or code examples instead.
    - Ensure every code block strictly closes before starting the next file, guaranteeing exactly one file per code block card.

---

## 2. PROJECT FILE TREE

    ATEM_WEB_MANAGER/
    ├── .atem_node_path                # Persistent cache for custom/portable Node.js runtime
    ├── .atem_workspace_token          # Required for secure WIPE execution
    ├── .gitignore                     # Excludes node_modules, dist, codebase.txt, logs
    ├── package-lock.json              # Preserved in Git for deterministic dependency tree
    ├── package.json
    ├── vite.config.js                 # Vite bundler & host configuration (Port 3000, Auto-Open)
    ├── index.html                     # HTML root shell mounting /src/main.jsx
    │
    ├── ops/                           # Operations & Documentation
    │   ├── CHANGELOG.MD               # Complete master history archive (v1.72+)
    │   ├── CHANGELOG/                 # Modular per-iteration changelog snippets (vX.XX.md)
    │   ├── HANDOVER.MD                # Master documentation and spec (THIS FILE)
    │   ├── SYSTEM_INSTRUCTIONS.MD     # System instructions specification for Google AI Studio
    │   ├── OPS.BAT                    # Master Windows CLI (Run & Evaluate, Wipe, Export, Exit)
    │   ├── git-workflow.bat           # Direct standalone Git sync utility
    │   └── OPS.SH                     # Master macOS/Linux CLI (Run & Evaluate, Wipe, Export, Exit)
    │
    ├── bridge/                        # Node.js Hardware Bridge
    │   ├── package-lock.json          # Bridge deterministic lockfile
    │   ├── package.json
    │   └── server.js                  # Live two-way ATEM polling, macro triggers, aux routing & WebSocket broadcast
    │
    └── src/                           # React Application Source
        ├── version.js                 # Isolated application version module
        ├── main.jsx                   # React DOM bootstrap engine (CRITICAL: Do not delete)
        ├── App.jsx                    # Master Layout, Top Control Bar, Fullscreen Toggle
        ├── index.css                  # Global styles, Sliding Sidebar, Tooltips, Macro Grid
        ├── components/            
        │   ├── UI/                    # Skeleton, GlobalTooltip, ErrorBoundary, QuadrantContextMenu
        │   ├── Sidebar/               # Sidebar, SearchBar, DeviceList, DeviceRow, ColorDropdown, BottomActionBtn
        │   ├── Multiview/             # QuadrantGrid, Panel (Routes 1. STREAM, 2. MEDIA POOL, 3. MIXER, 5. MACROS COMPACT)
        │   ├── Panels/                # AtemConstellationBus.jsx, AtemMacrosCompact.jsx, MediaPool.jsx
        │   ├── VideoPlayer/           # Player, OverlayDrawer, QualityMenu, SnapshotEngine
        │   └── Settings/              # SettingsModal
        └── hooks/                     # useDevices, useDragDrop, useLocalStorage