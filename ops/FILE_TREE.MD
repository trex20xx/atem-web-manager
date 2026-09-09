# ATEM WEB MANAGER - PROJECT FILE TREE (v2.09)

ATEM_WEB_MANAGER/
├── package.json               
├── vite.config.js             
├── index.html                 
├── CHANGELOG.MD               
├── README.MD                  
├── HANDOVER.MD                
├── FILE_TREE.MD               
├── ops/                       
│   ├── CHANGELOG.MD           
│   ├── README.MD              
│   ├── HANDOVER.MD            
│   ├── FILE_TREE.MD           
│   ├── INIT.BAT               
│   ├── PUSH.BAT               
│   ├── WIPE.BAT               
│   ├── INIT.SH                
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
    │   ├── UI/                # Skeleton, GlobalTooltip, ErrorBoundary, QuadrantContextMenu (Pill Styled)
    │   ├── Sidebar/           # Sidebar, SearchBar, DeviceList, DeviceRow, ColorDropdown, BottomActionBtn
    │   ├── Multiview/         # QuadrantGrid, Panel
    │   ├── Panels/            # AtemConstellationBus.jsx (Two-way tally sync, device font)
    │   ├── VideoPlayer/       # Player, OverlayDrawer, QualityMenu, SnapshotEngine
    │   └── Settings/          # SettingsModal
    └── hooks/                 # useDevices, useDragDrop, useLocalStorage