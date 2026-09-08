# ATEM WEB MANAGER - AI HANDOVER STATE
**Current Version:** v1.84
**Architecture:** React 18, Vite, CSS Variables, Componentized Hooks, Multiview Quadrant Skeletons.

## 1. STRICT RULES OF ENGAGEMENT
- **INCREMENT VERSION:** Update version numbers in comments and UI with every iteration.
- **NO UNREQUESTED CHANGES:** Never modify existing functionality, logic, or design unless explicitly requested.
- **FULL FILES ONLY:** ALWAYS provide full updated files when changes are made. NOT snippets. 
- **GIT / GITHUB WORKFLOW:** Provide the code/commands to save changes in Git + GitHub ONLY AFTER the user confirms the changes are working in the browser.
- **[LOCKED] ELEMENTS:** Never alter corner radii (24px pills, default 9px panels), Video.js 30% transparency rules, YouTube SVG replicas, or the 16:9 Multiview scaling math.
- **HARDWARE LOCK:** The ATEM 1 M/E Constellation panel is strictly locked to IP `192.168.10.240`.

## 2. RECENT UPDATES (v1.84 Context)
- Extended the `isLoading` state from `useDevices` across the entire application layout.
- Updated `Panel.jsx` to render shimmering skeleton player blocks inside all Multiview quadrants during initial startup.
- Synchronized all documentation blocks to v1.84.

## 3. FILE TREE
atem-web-manager/
├── package.json               
├── vite.config.js             
├── index.html                 
├── CHANGELOG.md               
├── README.md                  
├── HANDOVER.md                # THIS FILE
├── FILE_TREE.md               # Visual file map
├── INIT.sh                    # Automated macOS Bootstrapper & Launcher
├── INIT.bat                   # Automated Windows Bootstrapper & Launcher
└── src/                       
    ├── main.jsx               
    ├── App.jsx                
    ├── index.css              
    ├── bridge/                # Local Node.js ATEM UDP-to-WebSocket bridge server
    ├── components/            
    │   ├── UI/                # Skeleton.jsx, GlobalTooltip.jsx, ErrorBoundary.jsx
    │   ├── Sidebar/           # Sidebar, SearchBar, DeviceList, DeviceRow, ColorDropdown, BottomActionBtn
    │   ├── Multiview/         # QuadrantGrid, Panel (Now with Quadrant Skeletons)
    │   ├── Panels/            # AtemConstellationBus.jsx
    │   ├── VideoPlayer/       # Player, OverlayDrawer, QualityMenu, SnapshotEngine
    │   └── Settings/          # SettingsModal
    └── hooks/                 # useDevices, useDragDrop, useLocalStorage