# ATEM WEB MANAGER

## STRICT RULES OF ENGAGEMENT
1. **INCREMENT VERSION:** Update version numbers in comments and UI with every iteration.
2. **NO UNREQUESTED CHANGES:** Never modify existing functionality, logic, or design unless explicitly requested.
3. **GIT / GITHUB WORKFLOW:** Always provide the code to do whatever changes are necessary in Git + GitHub — **BUT ONLY AFTER CONFIRMING THE CHANGES ARE GOOD**.
4. **COMPONENTIZE:** Write clean, isolated, reusable React components.
5. **[LOCKED] ELEMENTS:** Never alter corner radii (`24px` pills), Video.js 30% transparency rules, YouTube SVG replicas, or the strictly enforced 16:9 Multiview scaling math.
6. **FULL FILES ONLY:** ALWAYS provide full updated files when changes are made. NOT snippets. Don't ask the user to replace parts of the files. The user wants to copy-paste the entire updated file.
7. **HANDOVER PROTOCOL:** Use the `HANDOVER.md` file to transfer context to new AI chat sessions to bypass token limits.
8. **HARDWARE-IP LOCK PROTOCOL:** Dedicated hardware switcher panels must strictly check for authorized device IPs before mounting (e.g. Constellation HD locked to `192.168.10.240`).

## FOLDER STRUCTURE
atem-web-manager/
├── package.json               # Dependencies
├── vite.config.js             # Vite bundler config
├── index.html                 # Empty HTML shell
├── CHANGELOG.md               # Version history tracking
├── README.md                  # Project rules
├── HANDOVER.md                # Context state for new AI chat sessions
│
└── src/                       
    ├── main.jsx               # React bootstrapper
    ├── App.jsx                # Master Layout (16:9 Math + Root State)
    ├── index.css              # Global CSS & Design Variables
    │
    ├── components/            
    │   ├── UI/
    │   │   ├── Skeleton.jsx           # Shimmering loading placeholders
    │   │   └── GlobalTooltip.jsx      # Description hover engine
    │   ├── Sidebar/
    │   │   ├── Sidebar.jsx            # Variant-supported Master Sidebar
    │   │   ├── SearchBar.jsx          # IP validation & Search UI
    │   │   ├── DeviceList.jsx         # Device arrays, drag-drop zones
    │   │   ├── DeviceRow.jsx          # Individual Device View/Edit state
    │   │   ├── ColorDropdown.jsx      # Custom Muted Color selector
    │   │   └── BottomActionBtn.jsx    # 3-State Action timeout logic
    │   │
    │   ├── Multiview/
    │   │   ├── QuadrantGrid.jsx       # 2x2 Grid mapping
    │   │   └── Panel.jsx              # Dynamic Panel Container
    │   │
    │   ├── Panels/
    │   │   └── AtemConstellationBus.jsx # 10-Input PGM/PVW Switcher Panel
    │   │
    │   ├── VideoPlayer/
    │   │   ├── Player.jsx             # Video.js YouTube API logic
    │   │   ├── OverlayDrawer.jsx      # Transparency & Wipe UI
    │   │   ├── QualityMenu.jsx        # Resolution switcher
    │   │   └── SnapshotEngine.js      # Hidden Canvas clipping math
    │   │
    │   └── Settings/
    │       └── SettingsModal.jsx      # DaVinci-style draggable popup
    │
    └── hooks/                 
        ├── useDevices.js      # Global state, validation, & simulated loading
        ├── useDragDrop.js     # HTML5 Drag and Drop logic
        └── useLocalStorage.js # Browser memory persistence wrapper