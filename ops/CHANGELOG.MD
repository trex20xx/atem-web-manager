# ATEM WEB MANAGER - Complete Version History

## [v2.06.0] - Synchronization & Full Rollup Release
- Consolidated all additions from v1.85 to v2.05 into a single clean push to synchronize GitHub across environments.
- Version bumped across App, Settings, Documentation, and Handover state.

## [v2.05.0] - Cross-Platform Parity, All-Caps Ops Standardization & Complete Handover
- Implemented background bridge server auto-launch inside macOS `INIT.SH` matching Windows `INIT.BAT`.
- Standardized all documentation and automation scripts inside `ops/` to ALL-CAPS naming.
- Cataloged `GIT_INSTRUCTIONS.MD` as the user's permanent Git reference manual inside `ops/`.
- Validated standardized React/Airbnb file-naming conventions (`PascalCase.jsx` for components, `camelCase.js` for hooks).
- Fortified `HANDOVER.MD` into a complete, standalone architectural memory specification for future AI sessions.

## [v2.04.0] - Operations Directory Refactoring & Workspace Cleanup
- Created dedicated `ops/` directory housing all documentation, handover states, and OS automation scripts.
- Updated all Windows `.bat` and macOS `.sh` scripts to operate seamlessly from `ops/` targeting project root.
- Removed duplicate and stray files (`src/hooks/Sidebar.jsx`, `src/components/Multiview/AtemConstellationBus.jsx`, `git_instructions.md`).
- Fixed Windows `.txt` extension on `bridge/package.json`.

## [v2.03.0] - Complete History Archive & Automated Bridge Startup
- Restored comprehensive historical changelog dating back to monolithic baseline (v1.72).
- Upgraded `INIT.bat` to concurrently spawn the embedded ATEM bridge server (`bridge/server.js`) on port 8080 alongside Vite.
- Ensured portable Node environment variables propagate cleanly to child bridge processes on Windows.

## [v2.02.0] - Cross-Platform Windows Batch Suite & Setup Sync
- Added Windows-native batch scripts (`INIT.bat`, `PUSH.bat`, `WIPE.bat`) matching macOS bash utilities.
- Embedded automatic path detection for portable Node.js on enterprise Windows environments.
- Synchronized multi-platform working directories and pull workflows.

## [v2.01.0] - Settings UI Restoration, Full-Collapse Sidebar, & Row Geometry Lock
- Changed Bottom Action Button font-weight from bold (700) to normal (500).
- Converted all edit-form fields (Name, IP, Group, Color, Description) to pill-rounded styling (`24px`).
- Added clear button (`×`) to Color Dropdown to reset color to transparent ("No Color").
- Restored minimalist range slider tracks/thumbs and monochrome toggles in Settings (removed all blue/colored elements).
- Set "Classic (Solid)" as the default sidebar variant.
- Made hamburger collapse toggle a perfect circular button (`border-radius: 50%`).
- Re-architected sidebar collapse to slide 100% off-screen with a floating top-left restore button.
- Mathematically aligned `.edit-btn` with 4px equidistant top, bottom, and right padding.
- Permanently locked Sidebar Devices, Groups, and Edit Panel designs under the locked element protocol.

## [v2.00.0] - Geometric Polish, Context Menus & Control Bar
- Solved `.edit-btn` padding geometry for pixel-perfect right alignment inside pill rows.
- Fixed right-click context menu to map exact Quadrant numbers (1-4) into target slots.
- Added Tally LED brightness slider to Settings.
- Improved sidebar collapse animation with smooth container width transitions.
- Restored device edit-form CSS (`.device-editing-inner`) to match group edit-form dark mode palette perfectly.
- Modernized top-right global icons into a unified floating glass pill container.

## [v1.99.0] - Switcher Layout Restoration & Context Routing
- Restored ATEM switcher panel CSS layout.
- Fixed right-click context menu items to map exact Quadrant numbers instead of slot indices.
- Added Tally LED brightness slider to Settings -> Multiview.
- Fixed Multiview 16:9 aspect ratio recalculation bug upon sidebar collapsing.
- Perfected `.edit-btn` sizing and right-padding geometry.
- Grouped top-right icons into a sleek, non-intrusive floating toolbar header.

## [v1.98.0] - Sidebar Collapse, Right-Click Context Menus & UI Polish
- Added Google AI Studio style collapse button to the sidebar header.
- Implemented smooth responsive expansion of Multiview quadrants when the sidebar collapses.
- Added right-click context menu on panels for 1-4 position swapping.
- Locked background quadrant numbers against text highlighting/selection (`user-select: none`).
- Unified search input placeholder typography with device list fonts.

## [v1.95.0] - Workspace Erase Utilities & Empty Directory Clone Fixes
- Added `WIPE.sh` to safely delete project folders using a verification token (`.atem_workspace_token`).
- Updated `INIT.sh` to safely bypass Git "destination path already exists and is not an empty directory" clone errors.

## [v1.90.0] - Automated One-Liner Bootstrapping & Double-Click Launchers
- Upgraded `INIT.sh` (macOS) and `INIT.bat` (Windows) to automatically execute `npm run dev` upon successful setup.
- Documented native double-click execution flows (`.command` for Mac, `.bat` for Windows).
- Maintained documentation sync across README, CHANGELOG, and HANDOVER states.

## [v1.84.0] - Multiview Quadrant Skeletons
- Updated `Panel.jsx` to display a shimmering skeleton layout inside all quadrants during the initial `isLoading` window, matching the sidebar skeleton style.
- Synchronized version tags and documentation across README, HANDOVER, and FILE_TREE.

## [v1.83.0] - Crash-Proof Error Boundaries & Safe ATEM Bridge Handling
- Created `ErrorBoundary.jsx` to trap component rendering exceptions.
- Fixed `useRef` import bug inside `AtemConstellationBus.jsx`.

## [v1.82.0] - Crash-Proof Error Boundaries & Safe ATEM Bridge Handling
- Created `ErrorBoundary.jsx` to trap component rendering exceptions and network connection faults, preventing blank white screen crashes.
- Upgraded `AtemConstellationBus.jsx` to gracefully handle offline WebSocket states (`ws://localhost:8080`), falling back to a clean local UI mode instead of throwing fatal errors.

## [v1.81.0] - Real ATEM Hardware Control Bridge Layer
- Upgraded `AtemConstellationBus.jsx` to dispatch real-world network commands to physical ATEM switchers at `192.168.10.240`.
- Integrated WebSocket/REST bridge client logic to interface with local ATEM communication daemons.

## [v1.80.0] - ATEM 1 M/E Constellation HD Switcher Bus & Dynamic Panels
- Added `AtemConstellationBus.jsx` in `src/components/Panels/` featuring 10 inputs per row for Program (Red Tally) and Preview (Green Tally).
- Implemented CUT and AUTO transition buttons with live tally switching.
- Enforced strict hardware lock: Constellation panel operates EXCLUSIVELY with IP `192.168.10.240`.

## [v1.79.0] - Polish, Light Theme & Consistency
- Changed settings Gear icon to standard SVG.
- Removed floating sidebar border and group divider lines for cleaner UI.
- Matched Search input pixel-for-pixel with Device pills (30px height, identical padding/font).
- Added Global Tooltip React Component to display hover descriptions.
- Added full Light Theme mapped to CSS variables with a dynamic Sun/Moon toggle.
- Fixed Safari Mac specific drag-and-drop gradient rendering bug using `translateZ(0)` hardware acceleration.
- Added user preference to enable/disable Multiview Quadrant dragging.

## [v1.78.0] - UI Alignment & Persistence
- Replaced all monolithic JS state with `useLocalStorage` React Hook.
- Perfected CSS flex alignment for Device/Group edit buttons.
- Updated Color Dropdown to match DaVinci UI.
- Removed arbitrary timeout on Sidebar Hover button.

## [v1.77.0] - Persistence & Skeleton UI Fixes
- Added `useLocalStorage` hook to save all user settings, themes, device lists, and groups permanently in the browser.
- Fixed Skeleton UI visibility by applying a universal high-contrast rgba background (`rgba(255, 255, 255, 0.08)`).

## [v1.76.0] - Skeleton UI & Component Variants
- Added `<Skeleton />` UI component for modern loading states.
- Implemented a simulated 1.2s loading state in `useDevices.js` to demonstrate the Skeleton UI on initial mount.
- Added "Component Variant" architecture to the `Sidebar` (Classic Solid vs. Floating Glass designs).
- Updated `SettingsModal` to allow live toggling of the new Sidebar variants.

## [v1.75.0] - React / Vite Transition Baseline
- Monolithic HTML/JS strictly ported to React + Vite component architecture.
- Preserved all [LOCKED] design rules (24px pills, 30% transparency UI, 16:9 Multiview logic).
- Segregated business logic into custom React Hooks (`useDevices.js`, `useDragDrop.js`).

## [v1.74.0] - Monolithic Pre-Transition Baseline
- Final monolithic baseline before transitioning to React component architecture.
- Full structural integrity and 16:9 mathematical scaling verified.

## [v1.73.0] - YouTube Replica UI & Transparency Unification
- YouTube replica control bar with custom SVG masks for Play/Pause, Volume, Fullscreen, and centered Big Play button (68x48px).
- Red progress bar spanning top of pill and expanding to 100% in fullscreen.
- Unified 30% transparency (`rgba(30, 30, 30, 0.3)`) across panels and controls.
- Volume slider expansion to eliminate clipping.
- Quality labels simplified to 4K, 1080p, 720p (480p removed).

## [v1.72.0] - Settings & Sidebar UX Refinements
- Increased max corner radius range to 24px in preferences.
- Disabled global action button timeout (only CONFIRM state times out after 3 seconds).
- Added automatic deselection of sidebar items when clicking empty space.