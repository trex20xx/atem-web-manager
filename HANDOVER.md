# ATEM WEB MANAGER - AI HANDOVER STATE
**Current Version:** v1.82
**Architecture:** React 18, Vite, CSS Variables, Componentized Hooks, Safe Error-Boundary Protected Hardware Bridge.

## 1. STRICT RULES OF ENGAGEMENT
- **INCREMENT VERSION:** Update version numbers in comments and UI with every iteration.
- **NO UNREQUESTED CHANGES:** Never modify existing functionality, logic, or design unless explicitly requested.
- **FULL FILES ONLY:** ALWAYS provide full updated files when changes are made. NOT snippets. 
- **GIT / GITHUB WORKFLOW:** Provide the code/commands to save changes in Git + GitHub ONLY AFTER the user confirms the changes are working in the browser.
- **[LOCKED] ELEMENTS:** Never alter corner radii (24px pills, default 9px panels), Video.js 30% transparency rules, YouTube SVG replicas, or the 16:9 Multiview scaling math.
- **HARDWARE LOCK:** The ATEM 1 M/E Constellation panel is strictly locked to IP `192.168.10.240`.

## 2. RECENT UPDATES (v1.82 Context)
- Added a robust Error Boundary wrapper (`ErrorBoundary.jsx`) around dynamic hardware panels to completely prevent blank white screen crashes if a network bridge or WebSockets socket fails.
- Upgraded `AtemConstellationBus.jsx` with safe fallback states so it displays a graceful "Bridge Offline / Local Simulation Mode" message if `ws://localhost:8080` is not running.

## 3. FILE TREE
atem-web-manager/
├── package.json               
├── vite.config.js             
├── index.html                 
├── CHANGELOG.md               
├── README.md                  
├── HANDOVER.md                # THIS FILE
└── src/                       
    ├── main.jsx               
    ├── App.jsx                
    ├── index.css              
    ├── components/            
    │   ├── UI/                # Skeleton.jsx, GlobalTooltip.jsx, ErrorBoundary.jsx
    │   ├── Sidebar/           # Sidebar, SearchBar, DeviceList, DeviceRow, ColorDropdown, BottomActionBtn
    │   ├── Multiview/         # QuadrantGrid, Panel
    │   ├── Panels/            # AtemConstellationBus.jsx (Safe Bridge Layer)
    │   ├── VideoPlayer/       # Player, OverlayDrawer, QualityMenu, SnapshotEngine
    │   └── Settings/          # SettingsModal
    └── hooks/                 # useDevices, useDragDrop, useLocalStorage