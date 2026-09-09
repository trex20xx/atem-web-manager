# ATEM WEB MANAGER - PROJECT FILE TREE (v2.06)

ATEM_WEB_MANAGER/
├── .atem_workspace_token      # Security token for folder wipe protection
├── .gitignore                 # Git ignore rules
├── package.json               # Frontend project dependencies
├── package-lock.json          # Dependency lockfile
├── vite.config.js             # Vite build tool configuration
├── index.html                 # Empty HTML shell mounting React
│
├── ops/                       # 🛠️ OPERATIONS, DEVOPS & DOCUMENTATION (ALL-CAPS)
│   ├── CHANGELOG.MD           # Complete historical changelog archive (v1.72+)
│   ├── README.MD              # Project rules and quick-start guides
│   ├── HANDOVER.MD            # Complete autonomous AI handover specification
│   ├── FILE_TREE.MD           # Visual project file map (THIS FILE)
│   ├── GIT_INSTRUCTIONS.MD    # User manual reference for Git commands
│   ├── CLEANUP.BAT            # Windows workspace standardization utility
│   ├── CLEANUP.SH             # macOS workspace standardization utility
│   ├── INIT.BAT               # Windows bootstrapper, bridge runner & launcher
│   ├── PUSH.BAT               # Windows automated git push script
│   ├── WIPE.BAT               # Windows secure token-verified wipe script
│   ├── INIT.SH                # macOS bootstrapper, bridge runner & launcher
│   ├── PUSH.SH                # macOS automated git push script
│   └── WIPE.SH                # macOS secure token-verified wipe script
│
├── bridge/                    # 🔌 LOCAL HARDWARE BRIDGE DAEMON
│   ├── package.json           # atem-connection & ws dependencies
│   └── server.js              # Hardware UDP-to-WebSocket server (Port 8080)
│
└── src/                       # 🧠 CORE REACT SOURCE (Standard PascalCase Components / camelCase Hooks)
    ├── main.jsx               # React 18 DOM mount bootstrapper
    ├── App.jsx                # Master Layout (16:9 Math, Theme Sync, & Root State)
    ├── index.css              # Global styles, [LOCKED] design rules, and themes
    │
    ├── components/            # 🧱 REACT COMPONENT BLOCKS (PascalCase)
    │   ├── UI/
    │   │   ├── Skeleton.jsx       # Shimmering loading placeholders
    │   │   ├── GlobalTooltip.jsx  # Description hover popup engine
    │   │   ├── ErrorBoundary.jsx  # Crash trap for unstable hardware components
    │   │   └── QuadrantContextMenu.jsx # Right-click context menu (Quadrants 1-4)
    │   │
    │   ├── Sidebar/
    │   │   ├── Sidebar.jsx        # [LOCKED] Master Sidebar container (with collapse toggle)
    │   │   ├── SearchBar.jsx      # [LOCKED] IP validation, filtering, search mechanics
    │   │   ├── DeviceList.jsx     # [LOCKED] Device maps, groups, skeleton triggers
    │   │   ├── DeviceRow.jsx      # [LOCKED] 30px row with 4px equidistant edit button
    │   │   ├── ColorDropdown.jsx  # [LOCKED] Pill dropdown with clear 'x' button
    │   │   └── BottomActionBtn.jsx# [LOCKED] 3-State button (font-weight: 500)
    │   │
    │   ├── Multiview/
    │   │   ├── QuadrantGrid.jsx   # 2x2 grid math container
    │   │   └── Panel.jsx          # Dynamic panel container
    │   │
    │   ├── Panels/
    │   │   └── AtemConstellationBus.jsx # [LOCKED IP 192.168.10.240] 10-Input Switcher
    │   │
    │   ├── VideoPlayer/
    │   │   ├── Player.jsx         # Video.js v8 initialization & YouTube API tech
    │   │   ├── OverlayDrawer.jsx  # Transparency sliders, wipe controls, file pickers
    │   │   ├── QualityMenu.jsx    # 4K/1080p/720p floating resolution drawer
    │   │   └── SnapshotEngine.js  # Offscreen canvas clipping math
    │   │
    │   └── Settings/
    │       └── SettingsModal.jsx  # DaVinci-style draggable preferences (Monochrome UI)
    │
    └── hooks/                 # ⚙️ CUSTOM LOGIC HOOKS (camelCase)
        ├── useDevices.js      # Core state model & IP regex checks
        ├── useDragDrop.js     # HTML5 drag-and-drop physics
        └── useLocalStorage.js # Browser memory synchronization (Local Database)