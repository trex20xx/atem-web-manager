atem-web-manager/
│
├── package.json               # Lists your dependencies (React, Video.js, Vite, etc.)
├── vite.config.js             # Configuration for the Vite build tool
├── index.html                 # The empty HTML shell that loads React (v1.75 baseline)
│
└── src/                       # 🧠 THIS IS WHERE ALL OUR CODE LIVES
    ├── main.jsx               # The React 18 bootstrapper that mounts the app to the DOM
    ├── App.jsx                # The master layout (holds Sidebar + Quadrants + Modal, manages [LOCKED] 16:9 math)
    ├── index.css              # Global CSS (Themes, STRICT [LOCKED] radii & 30% transparency UI rules)
    │
    ├── components/            # 🧱 THE LEGO BLOCKS
    │   ├── Sidebar/
    │   │   ├── Sidebar.jsx            # The master layout container for the left-side UI
    │   │   ├── SearchBar.jsx          # Input logic, regex IP validation, and dynamic action states
    │   │   ├── DeviceList.jsx         # Loops the groups, handles drag drop zones, and renders rows
    │   │   ├── DeviceRow.jsx          # Individual device UI and inline editing form (View/Edit modes)
    │   │   ├── ColorDropdown.jsx      # The custom UI dropdown mapping to the muted colors array
    │   │   └── BottomActionBtn.jsx    # The strict 3-State Add/Delete/Confirm button timeout logic
    │   │
    │   ├── Multiview/
    │   │   ├── QuadrantGrid.jsx       # The mathematical 2x2 grid housing the 4 panels
    │   │   └── Panel.jsx              # Individual draggable quadrant UI and logic
    │   │
    │   ├── VideoPlayer/
    │   │   ├── Player.jsx             # Master Video.js initialization, YouTube tech, & memory retention
    │   │   ├── OverlayDrawer.jsx      # Wipe math sliders, direction toggles, and opacity tools UI
    │   │   ├── QualityMenu.jsx        # Floating 30% transparent drawer for 4K/1080p/720p swapping
    │   │   └── SnapshotEngine.js      # Pure JS isolated hidden canvas rendering & wipe math
    │   │
    │   └── Settings/
    │       └── SettingsModal.jsx      # The DaVinci-style draggable, tabbed preferences overlay
    │
    └── hooks/                 # ⚙️ CUSTOM LOGIC (Invisible math)
        ├── useDevices.js      # Handles adding/deleting/saving IPs in memory and 3-second button timeouts
        └── useDragDrop.js     # Manages HTML5 drag-and-drop physics for both groups and quadrants


        Testing my first Git commit.