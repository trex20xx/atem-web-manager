# ATEM WEB MANAGER - Complete Version History

## [v2.30.0] - macOS Subshell Directory Drift Fix
- Resolved a critical Bash subshell quirk in `INIT.SH` where `cd bridge && ... &` trapped the directory change in a background process, causing the subsequent `cd ..` to eject the user from the project root.
- Enforced absolute `$PROJECT_ROOT` pathing for all directory traversals in macOS deployment scripts to guarantee execution context stability.

## [v2.29.0] - macOS Initialization Verification & Bridge Daemon Start
- Verified flawless pull state on macOS hardware.
- Synchronized `ops/INIT.SH` to ensure background bridge daemon (`nohup node server.js &`) launches properly post-migration, rectifying missing service from legacy bootstrapper execution.

## [v2.28.0] - macOS Migration Preparation
- Logged environment transition from Windows to macOS.
- Verified readiness of native UNIX shell scripts (`INIT.SH`, `STOP.SH`, `WIPE.SH`, `PUSH.SH`) for standard bash/zsh execution.

## [v2.27.0] - Explicit Portable Node Pathing & VBScript Daemon Launcher
- Replaced PowerShell background execution in `INIT.BAT` with a dynamically generated VBScript (`atem_bridge_launcher.vbs`) to guarantee 100% hidden execution and flawless handling of spaces in file paths.
- Enforced strict explicit paths for `node.exe` and `npm.cmd` when a custom portable Node.js directory is provided.
- Fixed bridge daemon launch failures caused by missing `-WorkingDirectory` contexts in background processes.

## [v2.26.0] - Auto-Detect Portable Node.js Engine
- Upgraded `INIT.BAT` with smart detection for portable (non-global) Node.js installations.
- Implemented an interactive prompt to capture custom `node.exe` paths (e.g., NVM or extracted binaries) if global `node -v` fails.
- Added persistent path caching via `.atem_node_path` so the user is only prompted once.

## [v2.25.0] - Strict Delayed Expansion Validation
- Replaced volatile `if errorlevel 1` checks with strict `if !ERRORLEVEL! NEQ 0` delayed expansion evaluation in `INIT.BAT` to prevent inherited error codes from failing the Node.js validation check.

## [v2.24.0] - Robust Node Execution Validation in Auto-Clone Initialization
- Replaced volatile `where node` verification in `INIT.BAT` with bulletproof `call node -v` execution checking to bypass delayed expansion artifacts.
- Added pre-clone Git environment verification to gracefully intercept clone failures.
- Harmonized error output and cross-platform checks across `INIT.BAT` and `INIT.SH`.

## [v2.23.0] - Secure Workspace Wiper, Main Branch Auto-Clone & Bridge Daemon Pathing Fix
- Implemented asynchronous ghost-script architecture in `WIPE.BAT` to securely bypass Windows file-locking and delete the root directory gracefully.
- Enforced strict security token check (`ATEM_MANAGER_SECURE_WIPE_KEY_2026` inside `.atem_workspace_token`) across both `WIPE` scripts to prevent accidental hard drive erasure.
- Upgraded `INIT.BAT` and `INIT.SH` to prompt for target directory, hardcode repository URLs, and explicitly clone the `main` branch.
- Fixed background daemon initialization failure by explicitly injecting `-WorkingDirectory '%PROJECT_ROOT%\bridge'` into the PowerShell invocation array.

## [v2.22.0] - Bulletproof Operational Scripts & Auto-Cloning Setup
- Re-architected `WIPE.BAT` and `WIPE.SH` to perform "Deep Cleans" (wiping `node_modules`, caches, and `dist`) rather than nuking the entire folder, preserving `.git` repo safety.
- Upgraded `INIT.BAT` and `INIT.SH` with smart repository location. If the scripts are run outside the project, they will automatically prompt for the GitHub URL, clone the repo, and proceed with setup.
- Added macOS/Linux equivalent `STOP.SH` utility for cross-platform background daemon termination.
- Upgraded `PUSH.BAT` and `PUSH.SH` styling and execution paths.

## [v2.21.0] - Dedicated Background Daemon Kill Script (STOP.BAT)
- Created `ops/STOP.BAT` to automatically locate and terminate any hidden Node.js bridge daemon processes running on port 8080.
- Resolved documentation ambiguities regarding the `-WindowStyle Hidden` execution lifecycle.
- Confirmed strict validation of 100% full file outputs without partial annotations.

## [v2.20.0] - Macro Panel Typography & Hardware Loop Sync
- Unified macro panel background, typography, and font weights precisely with the Sidebar device list constraints.
- Removed "Create" mode section and bottom macro status bar for a clean run-only interface.
- Uppercased "MACROS" and "RECALL AND RUN" tags.
- Added discrete, left-aligned, muted italic numbering (1-100) inside macro buttons, allowing names to render in crisp standard typography alongside.
- Transformed Play, Stop, and Loop buttons into modern flat Material vector shapes wrapped in clean circular containers.
- Hooked `MACRO_LOOP` WebSocket command directly into physical ATEM (`atem.macroSetLoop`).
- Re-aligned pagination controls with grouped navigation arrows and wider dot spacing.
- Bound `.macro-slot-btn` heights to 100% so they automatically flex and fit available quadrant height uniformly.

## [v2.19.0] - ATEM Macros in Quadrant 2 & Centered Collapsed Layout
- Implemented full ATEM Macros Panel (`src/components/Panels/AtemMacros.jsx`) in Quadrant 2 supporting 100 macros across 5 pages of 20 buttons.
- Added flat pagination controls with 5 interactive carousel indicator dots.
- Added Recall & Run toggle with selective execution guard (macros only execute on selection when Recall & Run is active).
- Added transport controls (Loop, Play/Run, and Stop) linked to `bridge/server.js`.
- Configured `.dashboard.sidebar-collapsed` to center zoomed quadrants horizontally within the 16px marginal boundary.

## [v2.18.0] - Right-Pinned Quadrant Zoom, Smooth Sidebar Sliding & High-Contrast Icons
- Fixed quadrant layout anchor: pinned rightmost edge during collapse so the grid expands cleanly to the left, aligning with the 16px hamburger menu boundary.
- Added negative gap compensation (`margin-right: -8px`) to `.sidebar.collapsed` to eliminate the remaining offset.
- Added synchronized `height` and `transform: translateX(-100%)` transitions to `.sidebar`, preventing vertical jump artifacts when toggling.
- Replaced low-contrast icons with crisp, solid jet-black Sun and Moon vector icons centered on the white thumb circle.

## [v2.17.0] - Silent Background Bridge Daemon & Global Git Staging Rule
- Re-architected `ops/INIT.BAT` to launch `bridge/server.js` completely hidden in the background via PowerShell `-WindowStyle Hidden`, eliminating the second terminal window.
- Added automatic cleanup of lingering port 8080 processes in `ops/INIT.BAT` prior to launching.
- Confirmed mathematical preservation of strict 16:9 aspect ratio geometry across all multiview panels.
- Updated Rule 6 across repository documentation to permanently enforce `git add -A` (all files) staging at the end of every response.

## [v2.16.0] - Compact Apple Switch Icons, Fade-Toggle Version Tag & Alignment Precision
- Embedded responsive SVG Sun and Moon icons directly inside the sliding Apple-style theme toggle switch.
- Scaled Apple switch geometry to 36px × 20px to match the proportions of the adjacent settings gear.
- Added smooth opacity fade transition (0.3s) to the version tag, allowing click-to-hide and click-to-reveal.
- Fixed search bar width alignment by removing the redundant nested wrapper, achieving exact parity with device pill highlights.
- Anchored multiview quadrant grid left alignment to match the sidebar's uncollapsed left boundary when the sidebar collapses.

## [v2.15.0] - Automated Source Packaging Utility & State Review Baseline
- Provided robust cross-terminal codebase serialization scripts for seamless AI session ingestion.
- Synchronized repository documentation and handover status to v2.15.0.
- Maintained active working baseline of ATEM bidirectional tally synchronization.

## [v2.14.0] - Full Historical Archive Restoration & Multi-Hook Bridge Sync
- Restored complete historical changelog dating back to monolithic baseline (v1.72.0 through v2.14.0).
- Standardized `ops/` directory as the authoritative repository documentation home.
- Verified physical ATEM Constellation HD two-way tally sync baseline via `receivedCommands` and `bridge/server.js`.
- Synchronized styling definitions and layout tokens across `src/index.css`.

## [v2.13.0] - Direct ATEM Command Packet Listener via receivedCommands
- Hooked directly into `atem.on('receivedCommands')` to capture raw `PrgI` (Program) and `PrvI` (Preview) UDP packets sent when pressing physical switcher buttons.
- Eliminated reliance on `stateChanged` path filters which were failing on Constellation HD hardware events.
- Maintained authoritative `currentPgm` and `currentPvw` cache in `bridge/server.js` with instant WebSocket broadcast.
- Ensured explicit numeric coercion on client `setPgmInput` and `setPvwInput` state updates.

## [v2.12.0] - Documentation Consolidation to /ops & Tally State Telemetry
- Consolidated all project documentation exclusively into the `/ops/` directory.
- Verified bidirectional tally communication telemetry between physical switcher and UI.
- Upgraded bridge connection listeners and unblocked direct command execution.

## [v2.11.0] - Resolved Tally Desynchronization Loop & State Broadcast Throttling
- Eliminated state fallback corruption in `bridge/server.js` that was resetting PGM/PVW tallies to default values on intermediate packets.
- Implemented state deduplication in bridge broadcast loop to prevent WebSocket message flooding.
- Unblocked ATEM command dispatch pipeline and added error logging for asynchronous hardware commands.
- Added bidirectional logging telemetry across bridge terminal and browser client console.

## [v2.10.0] - Two-Way ATEM Hardware Tally Synchronization & Auto-Reconnect Engine
- Implemented true bidirectional tally synchronization between Web UI and ATEM 1 M/E Constellation HD (`192.168.10.240`).
- Added immediate state handshake on WebSocket `CONNECT` / `GET_STATE` messages to sync tallies on initial page load.
- Added background auto-reconnection loop in `bridge/server.js` for physical ATEM switcher UDP link.
- Added automatic client WebSocket retry loop in `AtemConstellationBus.jsx`.
- Enhanced status indicator to distinguish between WebSocket bridge connection and physical hardware link (`LIVE` vs. `STANDBY`).
- Protected ATEM command handlers against unhandled promise rejections on hardware disconnects.

## [v2.09.0] - Full Historical Archive & Robust Bidirectional Tally Sync
- Upgraded `bridge/server.js` and `AtemConstellationBus.jsx` with robust `Object.values()` state extraction for live two-way ATEM hardware tally feedback.
- Aligned search bar horizontal padding (8px) with device row highlights for perfect visual consistency.
- Enhanced Apple-style theme switch with embedded Sun and Moon SVG icons inside the sliding thumb.
- Enabled click-to-reveal on the version tag when hidden.
- Synchronized sidebar collapse animation for simultaneous horizontal slide and width shrinkage.
- Styled right-click quadrant context menus with pill-shaped item selection and matching device font.
- Removed small subtext from ATEM switcher buttons, replacing them with clean single-number labels.
- Maintained complete historical changelog archive (v1.72 through v2.09).

## [v2.08.0] - Unified Top Bar, Apple Theme Switch, Bidirectional ATEM Feedback & Edit UX
- Created dedicated Top Navigation Bar housing Hamburger toggle, Title, Version tag, Theme switch, and Settings gear.
- Eliminated all quadrant overlap issues during 16:9 aspect ratio resizing and sidebar collapse.
- Implemented monochrome Apple-style sliding switch for Dark/Light theme toggling.
- Synchronized version tag click behavior directly with the settings `showVersion` toggle state.
- Added Enter-key submission across all Device and Group inline edit fields.
- Implemented floating quick-select group dropdown in device edit forms.
- Re-styled ATEM switcher panel: matched background to quadrant palette, removed tally button glow, and hid background numbers when active.
- Implemented bidirectional ATEM hardware state broadcasting in `bridge/server.js` for live hardware-to-UI tally syncing.

## [v2.07.0] - UI Geometry Polish, Control Positioning & Context Routing
- Restored settings gear icon to the bottom-right corner (`bottom: 16px; right: 16px`).
- Re-anchored Sun/Moon theme toggle to the top-right corner.
- Eliminated unstyled top-left button artifact by providing clean CSS for collapse/restore controls.
- Mathematically centered edit buttons (`.edit-btn`, `.group-edit-btn`) with exact 4px equidistant top, bottom, and right padding inside `30px` pill rows.
- Standardized all edit panel inputs (`Name`, `IP`, `Group`, `Color`, `Description`) with pill-rounded geometry (`24px`).
- Unified dark mode palette across Device and Group edit forms (`.device-editing-inner` & `.group-editing-inner`).
- Added "Clear Color" (`×`) button inside the Color Dropdown to reset colors to transparent ("No Color").
- Restored custom minimalist range sliders and monochrome toggles in Settings (removed all native blue/colored fills).
- Implemented right-click quadrant context menu routing specific Quadrant numbers (1–4) into target slots.
- Added Tally LED brightness global settings slider.

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