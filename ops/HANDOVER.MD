# ATEM WEB MANAGER - MASTER AI HANDOVER SPECIFICATION
**Current Version:** v2.24.0
**Architecture:** React 18, Vite, Native CSS Variables, Componentized Hooks, Synchronized Collapse Animations, Apple Switch Icons, ATEM Macro Matrix (Quadrant 2), Full Bidirectional Hardware Bridge, Silent Background Daemon with STOP Utility, Auto-Cloning Secure Workspace Wiper.

---

## 1. STRICT RULES OF ENGAGEMENT (PERMANENT PROTOCOL)
1. **INCREMENT VERSION:** Increment the version number in file headers, UI tags, and all documentation in `ops/` (`ops/HANDOVER.MD`, `ops/CHANGELOG.MD`, `ops/README.MD`, `ops/FILE_TREE.MD`) with EVERY single iteration.
2. **NO UNREQUESTED CHANGES:** Never modify existing functionality, logic, or design unless explicitly requested.
3. **MAINTAIN ALL COMMENTS & COMPLETE HISTORY:** Never trim, truncate, or delete historical changelog entries or architectural comments. Retain all records from v1.72 onwards.
4. **FULL FILES ONLY IN EVERY CHAT REPLY:** Always provide 100% complete files ready to copy-paste directly in each reply. Never output code snippets, partial diffs, or back-references.
5. **DOCUMENTATION IN /OPS ONLY:** Maintain all project documentation exclusively within the `ops/` directory.
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

## 2. FILE TREE
ATEM_WEB_MANAGER/
├── .atem_workspace_token      # Required for secure WIPE.BAT execution
├── .gitignore
├── package.json
├── vite.config.js
├── index.html
│
├── ops/                       # Operations & Documentation (EXCLUSIVE HOME FOR DOCS)
│   ├── CHANGELOG.MD           # Complete history archive (v1.72+)
│   ├── README.MD              
│   ├── HANDOVER.MD            # THIS FILE
│   ├── FILE_TREE.MD           
│   ├── INIT.BAT               # Auto-clones repo to user path if run externally
│   ├── STOP.BAT               # Kills lingering hidden background daemon processes
│   ├── PUSH.BAT               
│   ├── WIPE.BAT               # Securely deletes entire project via ghost temp-script
│   ├── INIT.SH                
│   ├── STOP.SH                
│   ├── PUSH.SH                
│   └── WIPE.SH                
│
├── bridge/                    # Node.js Hardware Bridge
│   ├── package.json
│   └── server.js              # Live two-way ATEM polling, macro triggers & WebSocket broadcast
│
└── src/                       # React Application Source
    ├── main.jsx
    ├── App.jsx                # Master Layout, Top Control Bar, Synchronized Collapse
    ├── index.css              # Global styles, Apple Switch, Pill Context Menu, Macro Grid
    ├── components/            
    │   ├── UI/                # Skeleton, GlobalTooltip, ErrorBoundary, QuadrantContextMenu
    │   ├── Sidebar/           # Sidebar, SearchBar, DeviceList, DeviceRow, ColorDropdown, BottomActionBtn
    │   ├── Multiview/         # QuadrantGrid, Panel
    │   ├── Panels/            # AtemConstellationBus.jsx, AtemMacros.jsx
    │   ├── VideoPlayer/       # Player, OverlayDrawer, QualityMenu, SnapshotEngine
    │   └── Settings/          # SettingsModal
    └── hooks/                 # useDevices, useDragDrop, useLocalStorage