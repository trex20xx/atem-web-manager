# ATEM WEB MANAGER - MASTER AI HANDOVER SPECIFICATION
**Current Version:** v2.15.0
**Architecture:** React 18, Vite, Native CSS Variables, Componentized Hooks, Synchronized Collapse Animations, Apple Switch Icons, Full Bidirectional ATEM Bridge via receivedCommands.

---

## 1. STRICT RULES OF ENGAGEMENT (PERMANENT PROTOCOL)
1. **INCREMENT VERSION:** Increment the version number in file headers, UI tags, and all documentation in `ops/` (`ops/HANDOVER.MD`, `ops/CHANGELOG.MD`, `ops/README.MD`, `ops/FILE_TREE.MD`) with EVERY single iteration.
2. **NO UNREQUESTED CHANGES:** Never modify existing functionality, logic, or design unless explicitly requested.
3. **MAINTAIN ALL COMMENTS & COMPLETE HISTORY:** Never trim, truncate, or delete historical changelog entries or architectural comments. Retain all records from v1.72 onwards.
4. **FULL FILES ONLY IN EVERY CHAT REPLY:** Always provide 100% complete files ready to copy-paste directly in each reply. Never output code snippets, partial diffs, or back-references.
5. **DOCUMENTATION IN /OPS ONLY:** Maintain all project documentation exclusively within the `ops/` directory.
6. **AUTOMATIC GIT COMMIT & PUSH:** Always provide the exact `git add`, `git commit`, and `git push` commands with a clear, informative commit descriptor at the end of every code iteration.
7. **NO WAITING FOR CONFIRMATION:** Do not hold back Git commands waiting for confirmation; provide them proactively. The user will run them and report if anything needs fixing.
8. **[LOCKED] ELEMENTS PROTOCOL:**
   - **Corner Radii:** Buttons use `--pill-radius: 24px`. Panels use `--panel-radius: 9px`.
   - **Video Player UI:** YouTube UI replica layout using custom SVG masks, STRICT 30% transparency (`rgba(30, 30, 30, 0.3)`).
   - **Multiview 16:9 Aspect Ratio:** Strictly maintained under all resize conditions.
   - **Hardware-Locked IP:** The `AtemConstellationBus.jsx` panel is locked exclusively to IP `192.168.10.240`.
   - **Sidebar Devices, Groups & Edit Panels Design:** Row height `30px`, 4px equidistant edit button geometry, pill edit fields, and color dropdown clear mechanics.
   - **Top Bar & Navigation:** Apple-style sliding switch with embedded SVG sun/moon icons matching the settings gear size; synchronized sidebar collapse and multiview vertical zoom transitions.

---

## 2. FILE TREE
ATEM_WEB_MANAGER/
├── .atem_workspace_token
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
│   ├── INIT.BAT               
│   ├── PUSH.BAT               
│   ├── WIPE.BAT               
│   ├── INIT.SH                
│   ├── PUSH.SH                
│   └── WIPE.SH                
│
├── bridge/                    # Node.js Hardware Bridge
│   ├── package.json
│   └── server.js              # Live two-way ATEM polling & WebSocket broadcast
│
└── src/                       # React Application Source
    ├── main.jsx
    ├── App.jsx                # Master Layout, Top Control Bar, Synchronized Collapse
    ├── index.css              # Global styles, Apple Switch, Pill Context Menu
    ├── components/            # UI, Sidebar, Multiview, Panels, VideoPlayer, Settings
    └── hooks/                 # useDevices, useDragDrop, useLocalStorage