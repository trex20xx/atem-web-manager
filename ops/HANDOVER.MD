# ATEM WEB MANAGER - MASTER SPECIFICATION & HANDOVER
**Current Version:** v2.61
**Architecture:** React 18, Vite, Native CSS Variables, Componentized Hooks, Pure Sliding Animations, Fullscreen Toggle, ATEM Macro Matrix (Quadrant 4), Aux Output Routing Bar, Drag-to-Adjust Rate Inputs, Full Bidirectional Hardware Bridge, Decoupled Versioning Module, Modular Runtime-Synced Changelogs, Streamlined 4-Action Master CLI Suite.

---

## 1. STRICT RULES OF ENGAGEMENT (PERMANENT PROTOCOL)
1. **INCREMENT VERSION:** Increment the version number in file headers, documentation, and `src/version.js` with EVERY single iteration using two-segment `vX.XX` notation (no three-dot decimals).
2. **NO UNREQUESTED CHANGES:** Never modify existing functionality, logic, or design unless explicitly requested.
3. **MAINTAIN ALL COMMENTS & COMPLETE HISTORY:** Never trim, truncate, or delete historical changelog entries or architectural comments. Retain all records inside `ops/CHANGELOG.MD`. Deliver individual iteration changelogs inside `ops/CHANGELOG/vX.XX.md` for automated synchronization by the CLI suite.
4. **FULL FILES ONLY FOR MODIFIED FILES:** Always provide 100% complete files ready to copy-paste directly in each reply. Never output code snippets or partial diffs. Do not re-output unmodified components unless their internal layout, component, or state logic is actively modified.
5. **DOCUMENTATION CONSOLIDATION IN /OPS:** All project documentation lives exclusively within `ops/` as two core files (`ops/CHANGELOG.MD` and `ops/HANDOVER.MD`) supported by modular snippets in `ops/CHANGELOG/`.
6. **ITERATION DESCRIPTOR:** Always provide a clear, concise descriptor text at the end of every response summarizing the iteration's changes.
7. **NO WAITING FOR CONFIRMATION:** Provide full files immediately without holding back for intermediate confirmation.
8. **WORKSPACE & PATH RESOLUTION PROTOCOL:**
   - Workspace root path is permanently anchored to the project root directory (e.g. `C:\Users\robert.mirt\Downloads\PROGRAMMING\VSCODE\ATEM_WEB_MANAGER`).
   - Portable and enterprise Node.js/npm environments lacking global PATH registration must be detected and resolved via persistent `.atem_node_path` caching and injected into runtime session paths.
9. **[LOCKED] ELEMENTS PROTOCOL:**
   - **Corner Radii:** Buttons use `--pill-radius: 24px`. Panels use `--panel-radius: 9px`.
   - **Video Player UI:** YouTube UI replica layout using custom SVG masks, STRICT 30% transparency (`rgba(30, 30, 30, 0.3)`).
   - **Multiview 16:9 Aspect Ratio:** Strictly maintained under all resize conditions.
   - **Hardware-Locked IP:** `AtemConstellationBus.jsx` and `AtemMacros.jsx` are locked exclusively to IP `192.168.10.240`.
   - **Sidebar Devices, Groups & Edit Panels Design:** Row height `30px`, 4px equidistant edit button geometry, pill edit fields, and color dropdown clear mechanics.
   - **Top Bar & Navigation:** Apple-style sliding switch with embedded SVG sun/moon icons matching the settings gear size; synchronized sidebar collapse and multiview vertical zoom transitions.
   - **ATEM Switcher Button Geometry:** Standardized grid buttons (PGM, PVW, Aux, Actions) universally locked to `width: 44px; height: 32px` for layout uniformity.

---

## 2. PROJECT FILE TREE
```text
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
│   ├── OPS.BAT                    # Master Windows CLI (Run & Evaluate, Wipe, Export, Exit)
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
    │   ├── UI/                # Skeleton, GlobalTooltip, ErrorBoundary, QuadrantContextMenu
    │   ├── Sidebar/           # Sidebar, SearchBar, DeviceList, DeviceRow, ColorDropdown, BottomActionBtn
    │   ├── Multiview/         # QuadrantGrid, Panel (Routes 1. STREAM, 2. MEDIA POOL, 3. MIXER, 4. MACROS)
    │   ├── Panels/            # AtemConstellationBus.jsx, AtemMacros.jsx (Hardware-locked to 192.168.10.240)
    │   ├── VideoPlayer/       # Player, OverlayDrawer, QualityMenu, SnapshotEngine
    │   └── Settings/          # SettingsModal
    └── hooks/                 # useDevices, useDragDrop, useLocalStorage