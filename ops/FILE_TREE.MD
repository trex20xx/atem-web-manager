# ATEM WEB MANAGER - PROJECT FILE TREE (v2.23.0)

ATEM_WEB_MANAGER/
├── .atem_workspace_token
├── package.json               
├── vite.config.js             
├── index.html                 
├── ops/                       
│   ├── CHANGELOG.MD           
│   ├── README.MD              
│   ├── HANDOVER.MD            
│   ├── FILE_TREE.MD           
│   ├── INIT.BAT               
│   ├── STOP.BAT               
│   ├── PUSH.BAT               
│   ├── WIPE.BAT               
│   ├── INIT.SH                
│   ├── STOP.SH                
│   ├── PUSH.SH                
│   └── WIPE.SH                
├── bridge/                    
│   ├── package.json           
│   └── server.js              
└── src/                       
    ├── main.jsx               
    ├── App.jsx                
    ├── index.css              
    ├── components/            
    │   ├── UI/                # Skeleton, GlobalTooltip, ErrorBoundary, QuadrantContextMenu
    │   ├── Sidebar/           # Sidebar, SearchBar, DeviceList, DeviceRow, ColorDropdown, BottomActionBtn
    │   ├── Multiview/         # QuadrantGrid, Panel (Routes Q1 Player, Q2 Macros, Q3 Switcher)
    │   ├── Panels/            # AtemConstellationBus.jsx, AtemMacros.jsx (Hardware-locked)
    │   ├── VideoPlayer/       # Player, OverlayDrawer, QualityMenu, SnapshotEngine
    │   └── Settings/          # SettingsModal
    └── hooks/                 # useDevices, useDragDrop, useLocalStorage