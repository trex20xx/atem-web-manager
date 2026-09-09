# ATEM WEB MANAGER - MASTER AI HANDOVER SPECIFICATION
**Current Version:** v2.06
**Architecture:** React 18, Vite, Native CSS Variables (No Tailwind/SCSS), Componentized Hooks, Cross-Platform OS Automation (macOS & Windows), UDP/WebSocket Hardware Bridge (`atem-connection`).

---

## 1. STRICT RULES OF ENGAGEMENT (PERMANENT PROTOCOL)
1. **INCREMENT VERSION:** Increment the version number in comments, UI tags, and documentation with EVERY single iteration.
2. **NO UNREQUESTED CHANGES:** Never modify existing functionality, logic, or design unless explicitly requested by the user.
3. **MAINTAIN ALL COMMENTS & COMPLETE HISTORY:** Never trim, truncate, or delete historical changelog entries or architectural comments. Retain all records from v1.72 onwards.
4. **FULL FILES ONLY:** Always provide 100% complete files ready to copy-paste. Never output code snippets, partial diffs, or instructions asking the user to replace portions manually.
5. **GIT / GITHUB WORKFLOW:** Provide Git commands to stage, commit, and push changes **ONLY AFTER** the user confirms that changes are verified and working in the browser.
6. **NAMING CONVENTIONS:**
   - Files in `ops/` MUST always be ALL-CAPS (`CHANGELOG.MD`, `README.MD`, `HANDOVER.MD`, `FILE_TREE.MD`, `GIT_INSTRUCTIONS.MD`, `*.BAT`, `*.SH`).
   - React components in `src/components/` MUST use `PascalCase.jsx`.
   - Custom hooks in `src/hooks/` MUST use `camelCase.js`.
   - Config files, styles, and utilities use standard `lowercase` (`package.json`, `index.css`, `server.js`).
7. **[LOCKED] ELEMENTS PROTOCOL:**
   - **Corner Radii:** Buttons use `--pill-radius: 24px`. Panels use `--panel-radius: 9px` (slider range 0–24px).
   - **Video Player UI:** Exact YouTube replica layout using custom SVG masks, STRICT 30% transparency (`background-color: rgba(30, 30, 30, 0.3)`).
   - **Video Progress Bar:** Sits on top of the pill; detaches to span 100% viewport width at screen bottom in fullscreen mode.
   - **Multiview 16:9 Aspect Ratio:** The 2x2 grid container MUST maintain a strict 16:9 aspect ratio at all times, calculated dynamically via viewport math in `App.jsx`.
   - **Hardware-Locked IP:** The `AtemConstellationBus.jsx` panel is locked exclusively to IP `192.168.10.240`. It must refuse to connect to or render for any other IP.
   - **Sidebar Devices, Groups & Edit Panels Design:**
     - Row height is strictly `30px` (`--device-row-height`).
     - Row padding is asymmetrical `padding: 0 4px 0 10px;` so that the `22px` circular edit button has exactly **4px equidistant clearance on top, bottom, and right**.
     - All edit fields (`Name`, `IP`, `Group`, `Color`, `Description`) strictly use pill geometry (`border-radius: var(--pill-radius)`).
     - Color dropdown features a clear button (`×`) resetting assigned color to transparent ("No Color").
     - Action button font weight is strictly `500` (not bold).
   - **Settings Modal Design:** Pure monochrome minimalism (no green/blue accents on toggles or range slider tracks).

---

## 2. ARCHITECTURAL MAP & FUNCTIONAL BREAKDOWN

### A. Core Master Layout (`src/App.jsx`)
- Computes strict 16:9 aspect ratio math dynamically based on viewport dimensions.
- Handles smooth sidebar collapse: when collapsed, `sidebarWidth = 0` and the Multiview grid zooms/scales outward to fill screen width.
- Houses top-left floating restore button (`.sidebar-restore-btn`) to expand the sidebar when collapsed.
- Houses top-right unified floating tools pill (`.global-tools-pill`) with Sun/Moon theme toggle and Settings gear.
- Injects global CSS variables (`--panel-radius`, `--tally-opacity`, `--theme`).

### B. State Management & Local Database (`src/hooks/useLocalStorage.js` & `useDevices.js`)
- `useLocalStorage`: Automatically synchronizes all user preferences, quadrant order, themes, custom IP entries, and groups to the browser's `window.localStorage`.
- `useDevices`: Manages the device list model (16 default IPs + custom entries), selection states, validation regex for IPs, inline editing buffers, and simulated 1.2s loading state.

### C. Sidebar & Action Button Logic (`src/components/Sidebar/`)
- Search Bar validates IP format (`regex`) or group strings. Typing an unknown IP sets action state to `ADD`. Typing an existing group sets it to `DELETE`.
- Bottom Action Button follows strict 3-state logic: `SELECT ITEM` (disabled) -> `ADD`/`DELETE` -> `CONFIRM`. ONLY the `CONFIRM` state has a 3-second timeout that reverts to base state. Font weight is normal (500).
- Sidebar hover logic: Action button shows when hovering the sidebar (`onMouseEnter` / `onMouseLeave`).
- Edit buttons (`.edit-btn`, `.group-edit-btn`) appear on row hover with exact 4px equidistant padding.

### D. Multiview Grid & Dynamic Panels (`src/components/Multiview/` & `src/components/Panels/`)
- `QuadrantGrid.jsx`: Manages the 2x2 layout, passing drag-drop handlers and context menu callbacks.
- `Panel.jsx`: Dynamic content resolver:
  - Quadrant 1: Renders Video.js Player when an online device exists.
  - Quadrant 3: Renders `AtemConstellationBus.jsx` ONLY when the connected device IP is `192.168.10.240`.
  - Right-click context menu (`QuadrantContextMenu.jsx`): Allows reassigning any Quadrant ID (1–4) into the clicked slot.
  - Background numbers (`.panel-muted-num`): Strictly non-selectable (`user-select: none; pointer-events: none;`).
- `AtemConstellationBus.jsx`: Authentic broadcast switcher panel with 10 inputs per row:
  - Row 1: Program (PGM) with illuminated Red tallies.
  - Row 2: Preview (PVW) with illuminated Green tallies.
  - Transitions: CUT (instant swap) and AUTO (smooth timed tally transition).
  - WebSockets Bridge Client: Connects to `ws://localhost:8080` to send commands to real hardware. Wrapped in `ErrorBoundary.jsx` so offline bridge states enter local simulation mode instead of crashing.

### E. Video Player & Overlays (`src/components/VideoPlayer/`)
- Video.js v8 core with YouTube tech order.
- Exact YouTube pill UI with 30% transparency (`rgba(30, 30, 30, 0.3)`).
- Wipe drawer using CSS `clip-path: inset(...)` with horizontal/vertical sliders and reverse toggles.
- Snapshot Engine: Offscreen 1920x1080 canvas using `ctx.drawImage` and clip math to download composite screenshots as PNG.
- Quality drawer: Floating 30% transparent menu restricted to 4K, 1080p, 720p.

### F. Settings Modal (`src/components/Settings/SettingsModal.jsx`)
- DaVinci Resolve style dark-mode draggable window invoked via Gear button or `Cmd/Ctrl + ,`.
- Tabs: General (Theme, Radii, Tally Brightness, Toggles) and Multiview (2x2 visual slot assignments, Quadrant Drag toggle).
- Completely monochromatic UI: sliders use white circle thumbs on transparent tracks; toggles use neutral grey/white indicators.

### G. Embedded Hardware Bridge (`bridge/`)
- Node.js server (`bridge/server.js`) utilizing `atem-connection` and `ws`.
- Translates browser WebSocket commands on `ws://localhost:8080` into native UDP packets sent to the physical ATEM switcher at `192.168.10.240:9910`.

---

## 3. OPERATIONS TOOLKIT (`ops/`)
All DevOps, testing, and lifecycle scripts are maintained in lockstep for both macOS (`.SH`) and Windows (`.BAT`):
- **`INIT.BAT` / `INIT.SH`:** Automated setup; installs frontend & bridge dependencies, auto-starts the ATEM bridge server on port 8080, and starts Vite.
- **`PUSH.BAT` / `PUSH.SH`:** Prompts for commit message, stages all changes (`git add -A`), commits, and pushes to `origin main`.
- **`WIPE.BAT` / `WIPE.SH`:** Verifies `.atem_workspace_token` with key `ATEM_MANAGER_SECURE_WIPE_KEY_2026`, prompts for confirmation, and completely deletes the workspace directory.
- **`CLEANUP.BAT` / `CLEANUP.SH`:** Normalizes all file names in `ops/` to ALL-CAPS and purges stray duplicates.