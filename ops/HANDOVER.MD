# ATEM WEB MANAGER - MASTER SPECIFICATION & HANDOVER
**Current Version:** v2.42.0
**Architecture:** React 18, Vite, Native CSS Variables, Componentized Hooks, Synchronized Collapse Animations, Apple Switch Icons, ATEM Macro Matrix (Quadrant 2), Full Bidirectional Hardware Bridge, Automated Iteration Lifecycle Suite with Detailed Post-Run Evaluation.

---

## 1. STRICT RULES OF ENGAGEMENT (PERMANENT PROTOCOL)
1. **INCREMENT VERSION:** Increment the version number in file headers, UI tags, and documentation with EVERY single iteration.
2. **NO UNREQUESTED CHANGES:** Never modify existing functionality, logic, or design unless explicitly requested.
3. **MAINTAIN ALL COMMENTS & COMPLETE HISTORY:** Never trim, truncate, or delete historical changelog entries or architectural comments. Retain all records from v1.72 onwards inside `ops/CHANGELOG.MD`.
4. **FULL FILES ONLY FOR MODIFIED FILES:** Always provide 100% complete files ready to copy-paste directly in each reply. Never output code snippets or partial diffs. Do not re-output unmodified components (such as `App.jsx`) unless their internal layout, component, or state logic is actively modified.
5. **DOCUMENTATION CONSOLIDATION IN /OPS:** All project documentation lives exclusively within `ops/` as two core files: `ops/CHANGELOG.MD` (history) and `ops/HANDOVER.MD` (master spec).
6. **AUTOMATIC GIT COMMIT & PUSH (ALL FILES):** Always provide `git add -A`, `git commit`, and `git push` commands with a clear, informative commit descriptor at the end of every response.
7. **NO WAITING FOR CONFIRMATION:** Do not hold back Git commands waiting for confirmation; provide them proactively. The user will run them and report if anything needs fixing.
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
│   ├── OPS.BAT                    # Master Windows CLI with Detailed Evaluation & Auto-Open
│   └── OPS.SH                     # Master macOS/Linux CLI with Detailed Evaluation & Auto-Open
│
├── bridge/                        # Node.js Hardware Bridge
│   ├── package-lock.json          # Bridge deterministic lockfile
│   ├── package.json
│   └── server.js                  # Live two-way ATEM polling, macro triggers & WebSocket broadcast
│
└── src/                           # React Application Source
    ├── main.jsx
    ├── App.jsx                    # Master Layout, Top Control Bar, Synchronized Collapse
    ├── index.css                  # Global styles, Apple Switch, Pill Context Menu, Macro Grid
    ├── components/            
    │   ├── UI/                # Skeleton, GlobalTooltip, ErrorBoundary, QuadrantContextMenu
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

### Automated Run & Evaluate Pipeline
When you select **`[1] RUN & EVALUATE`**, the browser opens automatically. When finished testing, pressing `Ctrl + C` in the console stops the server and presents the four evaluation choices:
1. **`[1] MERGE TO MAIN`**: Merges the finished feature branch into `main`, pushes to GitHub, and deletes the feature branch.
2. **`[2] PUSH TO BRANCH`**: Commits and pushes progress to the active branch without merging into `main`.
3. **`[3] REVERT & DISCARD`**: Executes `git reset --hard HEAD` and `git clean -fd` to discard all experimental changes and restore a clean state.
4. **`[4] RETURN TO MENU`**: Leaves local files intact without committing or reverting.