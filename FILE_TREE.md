
---

### 4. `FILE_TREE.md` (Full File - v1.84)
```markdown
# ATEM WEB MANAGER - PROJECT FILE TREE

atem-web-manager/
├── package.json               # Frontend project dependencies (React, Video.js, etc.)
├── vite.config.js             # Vite build tool configuration
├── index.html                 # Empty HTML shell that mounts the React app
├── CHANGELOG.md               # Version history and migration logs
├── README.md                  # Project instructions and architecture rules
├── HANDOVER.md                # AI chat session state and context persistence
├── FILE_TREE.md               # Visual project file map (THIS FILE)
├── INIT.sh                    # Automated macOS bootstrapper & dev server launcher
├── INIT.bat                   # Automated Windows bootstrapper & dev server launcher
│
└── src/                       # 🧠 CORE SOURCE CODE DIRECTORY
    ├── main.jsx               # React 18 DOM mount bootstrapper
    ├── App.jsx                # Master Layout (16:9 Math, Theme Sync, & Root State)
    ├── index.css              # Global styles, [LOCKED] design rules, and themes
    │
    ├── bridge/                # 🔌 LOCAL HARDWARE BRIDGE DAEMON
    │   ├── package.json       # Node.js dependencies for ATEM communication
    │   └── server.js          # UDP-to-WebSocket bridge for physical switchers
    │
    ├── components/            # 🧱 REACT COMPONENT BLOCKS
    │   ├── UI/
    │   │   ├── Skeleton.jsx       # Shimmering grey loading placeholders
    │   │   ├── GlobalTooltip.jsx  # Description hover popup engine
    │   │   └── ErrorBoundary.jsx  # Crash trap for unstable hardware components
    │   │
    │   ├── Sidebar/
    │   │   ├── Sidebar.jsx        # Variant-supported Master Sidebar container
    │   │   ├── SearchBar.jsx      # IP validation, filtering, and search mechanics
    │   │   ├── DeviceList.jsx     # Device maps, group sections, and skeleton triggers
    │   │   ├── DeviceRow.jsx      # Individual device row view and inline editing
    │   │   ├── ColorDropdown.jsx  # DaVinci-styled muted color picker
    │   │   └── BottomActionBtn.jsx# 3-State Add/Delete/Confirm timeout button
    │   │
    │   ├── Multiview/
    │   │   ├── QuadrantGrid.jsx   # 2x2 grid math container
    │   │   └── Panel.jsx          # Dynamic panel container (Resolves Player vs Quadrant Skeletons)
    │   │
    │   ├── Panels/
    │   │   └── AtemConstellationBus.jsx # 10-Input PGM/PVW Switcher Panel (IP 192.168.10.240)
    │   │
    │   ├── VideoPlayer/
    │   │   ├── Player.jsx         # Video.js v8 initialization & YouTube API tech
    │   │   ├── OverlayDrawer.jsx  # Transparency sliders, wipe controls, and file pickers
    │   │   └── QualityMenu.jsx    # 4K/1080p/720p floating resolution drawer
    │   │   └── SnapshotEngine.js  # Offscreen canvas clipping and screenshot download math
    │   │
    │   └── Settings/
    │       └── SettingsModal.jsx  # DaVinci-style draggable tabbed preferences overlay
    │
    └── hooks/                 # ⚙️ CUSTOM LOGIC HOOKS
        ├── useDevices.js      # Core state model, IP regex checks, and simulated load hooks
        ├── useDragDrop.js     # HTML5 drag-and-drop physics for devices and quadrants
        └── useLocalStorage.js # Browser memory synchronization (Local Database wrapper)