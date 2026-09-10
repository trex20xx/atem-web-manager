# ATEM WEB MANAGER - MASTER SPECIFICATION & HANDOVER
**Current Version:** v2.39.0
**Architecture:** React 18, Vite, Native CSS Variables, Componentized Hooks, Synchronized Collapse Animations, Apple Switch Icons, ATEM Macro Matrix (Quadrant 2), Full Bidirectional Hardware Bridge, Unified Operations Suite with Portable Node Session PATH Injection.

---

## 1. STRICT RULES OF ENGAGEMENT (PERMANENT PROTOCOL)
1. **INCREMENT VERSION:** Increment the version number in file headers, UI tags, and documentation with EVERY single iteration.
2. **NO UNREQUESTED CHANGES:** Never modify existing functionality, logic, or design unless explicitly requested.
3. **MAINTAIN ALL COMMENTS & COMPLETE HISTORY:** Never trim, truncate, or delete historical changelog entries or architectural comments. Retain all records from v1.72 onwards inside `ops/CHANGELOG.MD`.
4. **FULL FILES ONLY IN EVERY CHAT REPLY:** Always provide 100% complete files ready to copy-paste directly in each reply. Never output code snippets, partial diffs, or back-references.
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
├── vite.config.js                 # Vite bundler & host configuration (Port 3000)
├── index.html                     # HTML root shell mounting /src/main.jsx
│
├── ops/                           # Operations & Documentation
│   ├── CHANGELOG.MD               # Complete history archive (v1.72+)
│   ├── HANDOVER.MD                # Master documentation and spec (THIS FILE)
│   ├── OPS.BAT                    # Master Windows CLI with Session PATH Injection & Port Cleanup
│   └── OPS.SH                     # Master macOS/Linux CLI with Signal Trap & Self-Bootstrap
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

### Portable Node Session PATH Injection (Windows)
When using a standalone/portable Node.js binary, `OPS.BAT` prepends `CUSTOM_NODE_PATH` into the batch session's active `%PATH%`. This ensures child processes launched during `npm install` (such as `esbuild`'s `node install.js`) inherit `node` in their command path.