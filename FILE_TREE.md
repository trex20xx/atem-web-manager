
---

### 3. `HANDOVER.md` (Full File - v1.90)
```markdown
# ATEM WEB MANAGER - AI HANDOVER STATE
**Current Version:** v1.90
**Architecture:** React 18, Vite, CSS Variables, Componentized Hooks, Automated Cross-Platform Bootstrappers.

## 1. STRICT RULES OF ENGAGEMENT
- **INCREMENT VERSION:** Update version numbers in comments and UI with every iteration.
- **NO UNREQUESTED CHANGES:** Never modify existing functionality, logic, or design unless explicitly requested.
- **FULL FILES ONLY:** ALWAYS provide full updated files when changes are made. NOT snippets. 
- **GIT / GITHUB WORKFLOW:** Provide code/commands to save changes in Git + GitHub ONLY AFTER confirmation.
- **[LOCKED] ELEMENTS:** Never alter corner radii, Video.js transparency, YouTube SVG masks, or 16:9 math.

## 2. RECENT UPDATES (v1.90 Context)
- Finalized cross-platform `INIT.sh` (macOS) and `INIT.bat` (Windows) scripts. Both scripts fully bootstrap the workspace, check dependencies, install packages, and automatically execute `npm run dev`.
- Synchronized documentation across README, CHANGELOG, and HANDOVER.

## 3. FILE TREE
atem-web-manager/
├── package.json               
├── vite.config.js             
├── index.html                 
├── CHANGELOG.md               
├── README.md                  
├── HANDOVER.md                
├── INIT.sh                    # Automated macOS Bootstrapper & Launcher
├── INIT.bat                   # Automated Windows Bootstrapper & Launcher
└── src/                       
    ├── main.jsx               
    ├── App.jsx                
    ├── index.css              
    ├── bridge/                # Node.js ATEM UDP-to-WebSocket bridge server
    ├── components/            # UI, Sidebar, Multiview, Panels, VideoPlayer, Settings
    └── hooks/                 # useDevices, useDragDrop, useLocalStorage