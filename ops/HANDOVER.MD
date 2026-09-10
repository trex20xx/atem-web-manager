# ATEM WEB MANAGER - MASTER SPECIFICATION & HANDOVER
**Current Version:** v2.43.0
**Architecture:** React 18, Vite, Native CSS Variables, Componentized Hooks, Synchronized Collapse Animations, Apple Switch Icons, ATEM Macro Matrix (Quadrant 2), Full Bidirectional Hardware Bridge, Decoupled Versioning Module, Streamlined 4-Action Master CLI Suite.

---

## 1. STRICT RULES OF ENGAGEMENT (PERMANENT PROTOCOL)
1. **INCREMENT VERSION:** Increment the version number in file headers, documentation, and `src/version.js` with EVERY single iteration.
2. **NO UNREQUESTED CHANGES:** Never modify existing functionality, logic, or design unless explicitly requested.
3. **MAINTAIN ALL COMMENTS & COMPLETE HISTORY:** Never trim, truncate, or delete historical changelog entries or architectural comments. Retain all records from v1.72 onwards inside `ops/CHANGELOG.MD`.
4. **FULL FILES ONLY FOR MODIFIED FILES:** Always provide 100% complete files ready to copy-paste directly in each reply. Never output code snippets or partial diffs. Do not re-output unmodified components (such as `App.jsx`) unless their internal layout, component, or state logic is actively modified.
5. **DOCUMENTATION CONSOLIDATION IN /OPS:** All project documentation lives exclusively within `ops/` as two core files: `ops/CHANGELOG.MD` (history) and `ops/HANDOVER.MD` (master spec).
6. **STREAMLINED OUTPUTS:** Git push commands at the end of responses are discontinued unless explicitly requested by the user.
7. **NO WAITING FOR CONFIRMATION:** Provide full files immediately without holding back for intermediate confirmation.
8. **[LOCKED] ELEMENTS PROTOCOL:**
   - **Corner Radii:** Buttons use `--pill-radius: 24px`. Panels use `--panel-radius: 9px`.
   - **Video Player UI:** YouTube UI replica layout using custom SVG masks, STRICT 30% transparency (`rgba(30, 30, 30, 0.3)`).
   - **Multiview 16:9 Aspect Ratio:** Strictly maintained under all resize conditions.
   - **Hardware-Locked IP:** `AtemConstellationBus.jsx` and `AtemMacros.jsx` are locked exclusively to IP `192.168.10.240`.
   - **Sidebar Devices, Groups & Edit Panels Design:** Row height `30px`, 4px equidistant edit button geometry, pill edit fields, and color dropdown clear mechanics.
   - **Top Bar & Navigation:** Apple-style sliding switch with embedded SVG sun/moon icons matching the settings gear size; synchronized sidebar collapse and multiview vertical zoom transitions.

---

## 2. PROJECT FILE TREE
```text
ATEM_WEB_MANAGER/
├── .atem_workspace_token          # Required for secure WIPE execution
├── .gitignore                     # Excludes node_modules, dist, codebase.txt, logs
├── package-lock.json              # Preserved in Git for deterministic dependency tree
├── package.json
├── vite.config.js                 # Vite bundler & host configuration (Port 3000, Auto-Open)
├── index.html                     # HTML root shell mounting /src/main.jsx
│
├── ops/                           # Operations & Documentation
│   ├── CHANGELOG.MD               # Complete history archive (v1.72+)
│   ├── HANDOVER.MD                # Master documentation and spec (THIS FILE)
│   ├── OPS.BAT                    # Master Windows CLI (Run & Evaluate, Wipe, Export, Exit)
│   └── OPS.SH                     # Master macOS/Linux CLI (Run & Evaluate, Wipe, Export, Exit)
│
├── bridge/                        # Node.js Hardware Bridge
│   ├── package-lock.json          # Bridge deterministic lockfile
│   ├── package.json
│   └── server.js                  # Live two-way ATEM polling, macro triggers & WebSocket broadcast
│
└── src/                           # React Application Source
    ├── version.js                 # Isolated application version module
    ├── main.jsx
    ├── App.jsx                    # Master Layout, Top Control Bar, Synchronized Collapse
    ├── index.css                  # Global styles, Apple Switch, Pill Context Menu, Macro Grid
    ├── components/            
    │   ├── UI/                    # Skeleton, GlobalTooltip, ErrorBoundary, QuadrantContextMenu
    │   ├── Sidebar/           # Sidebar, SearchBar, DeviceList, DeviceRow, ColorDropdown, BottomActionBtn
    │   ├── Multiview/         # QuadrantGrid, Panel (Routes Q1 Player, Q2 Macros, Q3 Switcher)
    │   ├── Panels/            # AtemConstellationBus.jsx, AtemMacros.jsx (Hardware-locked to 192.168.10.240)
    │   ├── VideoPlayer/       # Player, OverlayDrawer, QualityMenu, SnapshotEngine
    │   └── Settings/          # SettingsModal
    └── hooks/                 # useDevices, useDragDrop, useLocalStorage
```

---

## 3. MASTER OPERATIONS CLI (`OPS.SH` & `OPS.BAT`)
Execute directly from inside your project directory:
- **macOS / Linux:** `bash ops/OPS.SH`
- **Windows:** `ops\OPS.BAT`

### Streamlined 4-Option Menu
1. **`[1] RUN & EVALUATE`**: Automatically serializes `codebase.txt`, starts the bridge daemon, launches Vite with auto-opening browser, and opens the Evaluation Menu upon exit (`Ctrl+C`):
   - `[1] MERGE TO MAIN`: Merges the feature branch into `main`, pushes to GitHub, and deletes the feature branch.
   - `[2] PUSH TO BRANCH`: Commits and pushes progress to the active branch without merging into `main`.
   - `[3] REVERT & DISCARD`: Executes `git reset --hard HEAD` and `git clean -fd` to discard all experimental changes and restore a clean state.
   - `[4] RETURN TO MENU`: Leaves local files intact without committing or reverting.
2. **`[2] WIPE`**: Enforces security token verification (`ATEM_MANAGER_SECURE_WIPE_KEY_2026`) and completely deletes the directory safely.
3. **`[3] EXPORT`**: Manual export of `codebase.txt` for AI sessions on demand.
4. **`[4] EXIT`**: Clean exit.