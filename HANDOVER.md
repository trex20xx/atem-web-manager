# ATEM WEB MANAGER - AI HANDOVER STATE
**Current Version:** v1.79
**Architecture:** React 18, Vite, CSS Variables (No Tailwind/SCSS), Componentized Hooks.

## 1. STRICT RULES OF ENGAGEMENT
- **INCREMENT VERSION:** Update version numbers in comments and UI with every iteration.
- **NO UNREQUESTED CHANGES:** Never modify existing functionality, logic, or design unless explicitly requested.
- **FULL FILES ONLY:** ALWAYS provide full updated files when changes are made. NOT snippets. 
- **GIT / GITHUB WORKFLOW:** Provide the code/commands to save changes in Git + GitHub ONLY AFTER the user confirms the changes are working in the browser.
- **[LOCKED] ELEMENTS:** Never alter corner radii (24px pills, default 9px panels), Video.js 30% transparency rules, YouTube SVG replicas, or the 16:9 Multiview scaling math.

## 2. RECENT UPDATES (v1.79 Context)
- Replaced monolithic HTML with isolated React Components and custom Hooks (`useDevices`, `useDragDrop`, `useLocalStorage`).
- Added Skeleton UI for 1.2s on startup.
- Fixed pixel-perfect alignment between Device Rows, Group Rows, and the Search Bar.
- Implemented `localStorage` persistence across the entire app.
- Sidebar action button visibility bound strictly to CSS/React `onMouseEnter`/`Leave`.
- Implemented Global Tooltip engine for descriptions.
- Added Light Theme and Quad-Drag disabling configurations.

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
    ├── App.jsx                # Master Layout (16:9 Math + LocalStorage State)
    ├── index.css              # Global CSS & [LOCKED] Variables
    ├── components/            
    │   ├── UI/                # Skeleton.jsx, GlobalTooltip.jsx
    │   ├── Sidebar/           # Sidebar, SearchBar, DeviceList, DeviceRow, ColorDropdown, BottomActionBtn
    │   ├── Multiview/         # QuadrantGrid, Panel
    │   ├── VideoPlayer/       # Player, OverlayDrawer, QualityMenu, SnapshotEngine
    │   └── Settings/          # SettingsModal
    └── hooks/                 # useDevices, useDragDrop, useLocalStorage