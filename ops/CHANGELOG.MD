# ATEM WEB MANAGER - Complete Version History

## [v2.68] - macOS Parity Audit & POSIX CLI Hardening (OPS.SH)
- Synchronized `ops/OPS.SH` with `ops/OPS.BAT`, adding interactive iteration description / commit message prompts on finish and merge.
- Replaced BSD awk multi-line parsing with POSIX `head` and `tail` operations for robust modular changelog merging on macOS.
- Hardened macOS port cleanup with unified `lsof` process termination across ports 8080 and 3000.
- Added automatic Apple Silicon (`/opt/homebrew/bin`) and Intel (`/usr/local/bin`) Node.js PATH discovery.
- Standardized `printf` string serialization in `export_codebase` to eliminate BSD `echo -e` escape artifacts.
- Synchronized master application version tag to v2.68 across all metadata and documentation.


## [v2.67] - Strict Grid Realignment, Rate Drag Shielding & Bottom Row Symmetry
- Restructured the bottom control row into the exact same 10-column grid (`repeat(10, 70px)`) as the buses above: OUT 1â€“6 (Cols 1â€“6), Spacer (Col 7), Rate (Col 8), CUT (Col 9 under Input 9), and AUTO (Col 10 under Input 10).
- Applied `width: fit-content; margin: 0 auto;` to `.pgm-pvw-box` to tightly wrap the bus grid with zero spillover.
- Suppressed HTML5 quadrant drag-event collisions on the Rate button during click-and-drag adjustments.
- Aligned Rate input font family, size (`var(--le-font-size)`), and weight (`var(--device-font-weight)`) with switcher button numbers while preserving the orange highlight.
- Aligned uppercase "PROGRAM" and "PREVIEW" labels flush with the leftmost edge of Input 1.
- Synchronized master application version tag to v2.67.


## [v2.66] - Bottom Row Integration, Autorun Logic Isolation & Aux Routing Repair
- Brought back CUT and AUTO buttons, placing them in-line with the bottom OUTS row, justified to the right.
- Added a standalone rate button in-line with CUT and AUTO matching button dimensions (`70px x 36px`), allowing vertical drag-to-adjust, direct typing, and Enter-key submission for the auto transition rate.
- Aligned "PROGRAM" and "PREVIEW" labels directly with the leftmost button edge in clean uppercase typography.
- Fixed Macro Autorun logic: when Autorun is OFF, clicking a macro strictly selects it (never triggers it); when Autorun is ON, clicking runs it immediately.
- Updated the Autorun tooltip to display `AUTORUN MACRO: ON` or `AUTORUN MACRO: OFF` dynamically.
- Investigated and repaired physical ATEM Aux routing by implementing bidirectional parameter fallbacks with explicit asynchronous acknowledgement in `bridge/server.js`.
- Restored round circle hover overlays across all top bar buttons and added a matching pill hover overlay to the version tag.
- Restored the green online connection indicator ball directly in front of the IP address in the header.
- Synchronized master application version tag to v2.66.


## [v2.65] - Streamlined ATEM Switcher Layout, Fixed Button Geometry & Bridge Watchdog
- Removed all transitional and secondary control matrices (Next Transition, Transition Style, DSK, and Fade to Black).
- Replaced side labels with top-aligned "Program" and "Preview" headers matching official ATEM Software styling.
- Locked switcher button geometry universally to `width: 70px; height: 36px`, calculating maximum fit on 1920px screens with revealed sidebars and keeping the 10-column array strictly centered on quadrant scaling.
- Sized all six `OUT` buttons to the exact same `70px x 36px` dimensions, aligning them with the first six input columns and removing the "OUTS" text prefix.
- Restored the green online connection indicator dot preceding the hardware IP in the panel header.
- Added a bidirectional fallback execution pathway for `setAuxSource` in `bridge/server.js` to eliminate hardware routing drops.
- Integrated an automated background watchdog in `bridge/server.js` that inspects port 3000 and terminates the daemon automatically if Vite stops.
- Synchronized master application version tag to v2.65 across all documentation.


## [v2.64] - Clean Version Module Restoration & Parsing Repair
- Restored `src/version.js` to pure JavaScript export syntax, eliminating Markdown changelog text that triggered Vite parser syntax exceptions.
- Synchronized master application version tag to v2.64 across metadata and documentation.


## [v2.63] - Master Changelog Restoration
- Restored the complete historical archive in `ops/CHANGELOG.MD` spanning v1.72 through v2.63, fixing the missing v1.72â€“v2.50 entries.
- Synchronized master application version tag to v2.63.

## [v2.62] - Dual-Row Bus Routing, Active Transition Control Arrays & Drag Rates
- Transformed PGM and PVW into dedicated `.atem-section-box` architectures bordered uniformly.
- Re-architected input matrices to a dual-row CSS Grid paradigm (Inputs 1-10 on row one; internal sources on row two), matching official layout parity.
- Re-located "PROGRAM" and "PREVIEW" labels to the top of their respective bus groupings.
- Restored the green `online` indicator dot directly preceding the header IP.
- Stacked Next Transition, Transition Style, DSK 1, and Fade to Black control matrices strictly into two-button-high containers underneath the PVW bus.
- Refined `.rate-box` containers into `44px x 32px` rigid dimensions matching standard switcher buttons.
- Replaced native number spin inputs with a `DragRateInput` component across Transition, DSK, and FTB rates allowing vertical drag value scaling.
- Injected backend handlers and frontend dispatches for `SET_TRANS_STYLE`, `TOGGLE_TRANS_SELECTION`, `TOGGLE_PREV_TRANS`, and `TOGGLE_USK_ONAIR` ensuring complete control matrix hardware integration.
- Standardized all titles within control boxes to uppercase typography tracking.
- Synced master tags to v2.62.

## [v2.61] - Unified Global Button Geometry, Rate Drag Controls & Master Switcher Layout
- Converted all `.top-bar-btn` hover overlays from squares back to pure `border-radius: 50%` circles.
- Re-engineered the ATEM Constellation Bus layout to maximize panel real estate: PGM and PVW buses are now stacked immediately above the stacked Transitions, DSK, and Fade to Black rows.
- Forced universal scaling on all switcher controls by implementing a strict `.atem-btn-standard` layout (`width: 44px; height: 32px`), completely mirroring the sizes of the 6 bottom OUTS buttons.
- Replaced native number spin-box inputs inside Transition/DSK/FTB control panels with a custom `DragRateInput` component, allowing seamless drag-up/drag-down frame rate adjustments.
- Confirmed the exact mapping parameters for the `setAuxSource` Bridge routing API to ensure physical hardware Aux bus assignment functions correctly.
- Synchronized application version tags to v2.61 across metadata and operations tools.

## [v2.60] - ATEM Fullscreen Layout Parity, DSK Integrations & Seamless Sidebar Math
- Re-architected ATEM Constellation UI into a responsive CSS Grid mirroring the exact fullscreen layout of the official ATEM Software Control (Buses left, Transitions middle, DSK/FTB right).
- Embedded full internal source rendering on a unified PGM/PVW sub-grid (Inputs 1-10 + BLK, BARS, COL1, COL2, MP1, MP2).
- Resolved vertical sidebar-jump glitch entirely by synchronizing explicit React mathematical dimension recalculations during the CSS `requestAnimationFrame` slide cycle.
- Fixed Aux Router API payload failures by explicitly parsing and dispatching proper integer mapped `setAuxSource` payloads directly to the bridge.
- Designed dynamic hardware-linked components for Next Transition, Transition Style, DSK 1, and Fade to Black complete with frame-rate inputs matching DaVinci styling.
- Bound all switcher source routing paths to output buses seamlessly when `OUT X` is active, circumventing standard PGM routing while highlighted.
- Aligned header font families, top-bar global alignments, and removed "HARDWARE LINKED" and "OUTS" tags for an ultra-clean professional UI.
- Upgraded the `GlobalTooltip` logic with responsive horizontal centering and window edge clamping mirroring Google AI Studio hover mechanics.
- Added `SELECT NONE` to quadrant routing, automatically restoring large muted quadrant ID numbers when unmapped.
- Synchronized application version tag to v2.60.

## [v2.59] - Master Switcher UI Overhaul, DSK & Fade-to-Black Hardware Integration
- Eliminated sidebar vertical jumping and jitter during collapse animation by enforcing strict flex-shrink sizing and visibility constraints.
- Adjusted global Top Bar alignment to vertically align settings, fullscreen, and theme toggles flawlessly.
- Completely re-architected the ATEM Constellation Bus layout into a true hardware replica: split into a left bus array and a right controls array.
- Appended official ATEM internal sources (`BLK`, `BARS`, `COL 1`, `COL 2`, `MP 1`, `MP 2`) onto the second row of the PGM/PVW arrays.
- Re-sized all switcher bus buttons to standard uniform dimensions (`32px` height) with responsive flex-grid scaling matching hardware parity.
- Embedded a full hardware-linked `TRANSITION` block featuring dynamic frame rate inputs mapped directly to the ATEM Mix Effects engine.
- Embedded a full hardware-linked `DSK 1` block featuring interactive `TIE`, `ON AIR`, and `AUTO` commands alongside dynamic key rate fields.
- Embedded a full hardware-linked `FADE TO BLACK` block capturing transitioning and fully-black fallback states with configurable execution rates.
- Integrated six dedicated left-justified `OUT` Aux Router buttons allowing direct mapping of PGM row inputs to physical ATEM outputs.
- Synchronized master application version tag to v2.59 across all files.

## [v2.58] - Pure Sliding Sidebar, Hardware-Synced Transition & Aux Output Router
- Removed premature opacity fade on sidebar collapse for pure horizontal sliding transitions.
- Resolved AUTO transition tally glitch by delegating lifecycle state transitions directly to the authoritative hardware packet telemetry.
- Standardized header vertical geometry (28px) across the ATEM, Macros, and Media Pool panels.
- Added a `SELECT NONE` option to `QuadrantContextMenu.jsx`, rendering centered numbers when slots are unpopulated.
- Embedded a Fullscreen toggle button in `App.jsx` top bar between theme and settings buttons.
- Integrated official ATEM internal sources into PGM and PVW buses (`BLK`, `BARS`, `COL 1`, `COL 2`, `MP 1`, `MP 2`).
- Implemented an Aux output router bar with 6 output buttons (`OUT 1`â€“`OUT 6`), enabling direct source routing through the PGM row.
- Added bidirectional `SET_AUX` WebSocket command handling and auxiliary telemetry broadcasting in `bridge/server.js`.
- Synchronized master application version tag to v2.58.

## [v2.57] - ATEM Switcher Design Harmonization, Transition Relocation & Sidebar Reveal Fix
- Restored the interactive commit message/iteration prompt in `ops/OPS.BAT` under `:MERGE_MAIN`.
- Resolved sidebar expansion layout compression by locking child container widths and setting `visibility: hidden` when collapsed.
- Unified ATEM switcher header typography (14px bold, `opacity: 0.8`) with the Macros panel and removed the header divider.
- Removed the "HARDWARE LINKED" badge and bottom transition status bar.
- Cleaned the switcher IP indicator to display strictly `192.168.10.240` without parenthetical status text.
- Standardized PGM/PVW labels and switcher buttons to use the 13px device list font family and weights.
- Restyled CUT and AUTO transition buttons to match switcher input pills, repositioning them directly beneath PVW inputs 9 and 10 with margin separation.
- Synchronized master application version tag to v2.57.

## [v2.56] - Google AI Studio Tooltip Engine, Quadrant Routing & Transport Order
- Redesigned Auto-Run icon with a circular chase-play vector glyph and reordered header transport buttons to: Loop, Auto-Run, Play, Stop.
- Re-engineered `GlobalTooltip.jsx` to match Google AI Studio: anchored directly beneath target elements, horizontally centered, with edge-clamping and a dark pill container (`border-radius: 8px`).
- Removed individual row hover mini-buttons from macro slots to preserve row minimalism and visual clarity.
- Refactored macro button click handler to alternate between running and stopping when clicked while selected.
- Renamed quadrant right-click context menu slots to `1. STREAM`, `2. MEDIA POOL`, `3. MIXER`, and `4. MACROS`, updating `Panel.jsx` component routing.
- Synchronized master application version tag to v2.56 across all components.

## [v2.55] - Silent Background Daemon, Macro Hover Actions & Discrete Number Blending
- Injected `-WindowStyle Hidden` into PowerShell `Start-Process` inside `ops/OPS.BAT`, permanently hiding the background bridge daemon console window.
- Restored orange highlights (`#ff9436`) across active header transport buttons.
- Replaced the Auto-Run icon with a double-play vector glyph sized exactly to the 17px Play button and labeled as "Auto-Run".
- Added mini transport control buttons (Loop, Play, Stop) on the right edge of each populated macro row, appearing only on hover.
- Softened macro number opacity to `rgba(255, 255, 255, 0.12)` to match the discrete backdrop blending style of the quadrant panels.
- Documented project path resolution and `.atem_node_path` environment caching invariants in `ops/HANDOVER.MD`.
- Synchronized application version tag to v2.55 across metadata and documentation.

## [v2.54] - Portable Node.js Auto-Detection & Session PATH Injection
- Restored intelligent detection and persistent caching (`.atem_node_path`) for portable Node.js environments in `ops/OPS.BAT`.
- Injected portable directory directly into active session `%PATH%` and resolved explicit `%NODE_CMD%` and `%NPM_CMD%` execution paths.
- Updated background daemon launcher to invoke `%NODE_CMD%` directly within PowerShell `Start-Process`, preventing "The system cannot find the file specified" errors.
- Synchronized master application version tag to v2.54 across metadata and documentation.

## [v2.53] - Atomic Codebase Serialization & Batch Parenthesis Syntax Fix
- Replaced iterative `Add-Content` stream operations in `ops/OPS.BAT` with an atomic in-memory `.NET` collection written via `[System.IO.File]::WriteAllLines`, permanently resolving Windows `Stream was not readable` file-lock errors.
- Fixed `cmd.exe` syntax abort (`in was unexpected at this time`) caused by unescaped parentheses inside the `:RUN_EVAL` daemon startup echo statement prematurely closing the `if exist` block.
- Standardized `for /f "delims="` evaluation in `ops/OPS.BAT` for bulletproof git branch detection.
- Synchronized master application version tag to v2.53 across metadata and documentation.

## [v2.52] - Batch Command-Line Escaping Fix & Structural Label Refactor
- Eliminated all cmd.exe quote-parity corruption by replacing inner double quotes with single quotes (`'...'`) across all PowerShell commands in `ops/OPS.BAT`.
- Replaced PowerShell `!` negation operator with `-not` to prevent variable mangling under batch script parsing.
- Refactored evaluation menu choices into isolated labels (`:MERGE_MAIN`, `:PUSH_BRANCH`, `:REVERT_DISCARD`) and removed `EnableDelayedExpansion` completely.
- Replaced `netstat` and `taskkill` calls with a dedicated single-string PowerShell process-termination command.
- Synchronized application version tag to v2.52 across all documentation and runtime modules.

## [v2.51] - Windows CLI Syntax Repair & Streamlined Inline Execution Engine
- Resolved `cmd.exe` token parser crash in `ops/OPS.BAT` caused by caret-continued multi-line PowerShell executions in `:SYNC_CHANGELOG` and `:EXPORT_CODEBASE`.
- Replaced PowerShell `-in` operator with regex match `^\.(js|jsx|css)$` to permanently eliminate cmd keyword collision (`in was unexpected at this time`).
- Flattened PowerShell commands in `OPS.BAT` into single-string executions to guarantee safe batch parameter passing and error-free execution.
- Synchronized application version tag to v2.51 across metadata and documentation.

## [v2.50] - Macro Panel Palette Optimization, Column Layout & Token-Saving Modular Changelog Engine
- Implemented modular changelog architecture with automated runtime synchronization inside `ops/OPS.SH` and `ops/OPS.BAT`, eliminating redundant full-history chat payloads while preventing duplicate merges.
- Switched application version tag formatting from three-number semantic notation to two-segment `vX.XX` notation (v2.50).
- Unified "MACROS" title font color with sidebar device names (`var(--text)` at 0.8 opacity).
- Removed horizontal border line beneath Macro Panel header for a seamless transition into the button matrix.
- Replaced macro running color with Muted Red (`#8a4b48`) matching the sidebar device dropdown palette.
- Replaced macro selected state with a subtle, flat grey highlight (`#404040`), removing all orange fills.
- Redesigned Recall & Run icon to a clean double-play vector arrow matching standard play sizing.
- Added GlobalTooltip hover descriptions on all transport buttons and dynamically enabled tooltips for macro names that exceed button width boundaries.
- Reordered the 20-button macro matrix into column-first orientation (Column 1: 1â€“10; Column 2: 11â€“20).
- Bolstered pagination navigation arrows with bold 2.8px stroke chevrons for improved legibility.
- Accelerated mouse wheel pagination scrolling response by reducing debounce to 35ms.

## [v2.49.0] - Inline Control Bar, Autoplay Vector Glyph & Crisp Numbers
- Consolidated the Macro Panel header and transport toolbar into a single in-line row to conserve vertical space and expand macro slot heights.
- Replaced the textual "RECALL AND RUN" tag with a dual-arrow motion trail autoplay vector glyph positioned directly to the left of the loop button.
- Added right-click toggle support on the Recall & Run button to freely switch between the autoplay glyph and full textual pill representation.
- Flattened macro numbers to non-italic, non-debossed crisp numerals (15px, weight 800) matching quadrant standard typography.
- Synchronized application version tag to v2.49.0.

## [v2.48.0] - Pastel Palette Alignment, Hover Overlays & Fast Wheel Navigation
- Re-scaled "RECALL AND RUN" to exact 13px device row font size and added matching pill hover background overlay.
- Aligned macro slot label typography, boldness, size, weight (400), and color directly to sidebar device rows.
- Re-introduced italic styling to the debossed 15px macro slot numbering.
- Tuned wheel scrolling responsiveness to 65ms debounce with a lowered delta threshold for much faster page flipping.
- Mapped selected macro states, engaged transport controls, and active recall triggers to the device dropdown's Pastel Orange (`#a66332`).
- Mapped running macro states to the device dropdown's Pastel Green (`#487540`).

## [v2.47.0] - Macro Panel Visual Hierarchy, Flat Statuses & Scrub Navigation
- Refactored debossed macro slot numbering to use quadrant typography metrics (Segoe UI, weight 800, non-italic) in high-contrast light grey with debossed text shading.
- Enlarged "MACROS" title to 14px bold (weight 700) to firmly anchor the panel within the established architectural typography hierarchy.
- Replaced the loop icon with a modern curved-arrow glyph and enlarged all transport action button SVGs to 17px.
- Unified transport action button idle states to muted grey and mapped active/engaged states exclusively to orange highlights.
- Removed the toggle dot from "RECALL AND RUN", bolded the label (weight 700), and mapped active state directly to orange highlight.
- Replaced disabled pagination arrow `not-allowed` cursor behavior with `cursor: default` and suppressed tooltips when reaching page limits.
- Added mouse click-and-drag horizontal scrubbing across pagination dots and enabled panel-wide mouse wheel pagination scrolling.
- Stripped all outlines and borders from macro slot buttons for an ultra-flat design.
- Replaced pulsating macro animations with solid uniform color fills (orange for selected, green for running) matching ATEM switcher bus tally buttons.

## [v2.46.0] - Macro Panel Typography Alignment, Flat Material Controls & Stop Trigger
- Left-justified the "MACROS" title and unified typography, color, size (13px), and font-weight (400) directly with the Sidebar device rows.
- Styled "RECALL AND RUN" label to match Sidebar device row metrics and upgraded the toggle dot to a monochrome active-white dot matching pagination styling.
- Streamlined transport action buttons (Loop, Play, Stop) to flat monochrome Material Design vectors with no initial border and a circular hover overlay.
- Upgraded macro slot numbering to a larger 15px bold italic format (weight 900) featuring a subtle negative-embossed shadow treatment.
- Enforced uppercase rendering and sidebar-matched typography across all macro names.
- Removed default circle backgrounds and borders from pagination navigation arrows in favor of circle hover overlays.
- Implemented smart macro stop execution: clicking the active macro a second time or clicking an empty slot triggers an immediate stop and clears selection.

## [v2.45.0] - AI Session Handover Milestone & Foundation Protection
- Formalized Handover Protocol for incoming AI chat sessions utilizing `HANDOVER.MD`, `codebase.txt`, and `CHANGELOG.MD`.
- Documented criticality of `src/main.jsx` DOM bootstrap engine to prevent accidental deletion.
- Confirmed repository naming stability (`atem-web-manager`) across GitHub and local cross-platform clones.
- Synchronized version tag to v2.45.0 across application metadata.

## [v2.44.0] - Mandatory Iteration Descriptor Protocol
- Formally established Rule 6 requiring a dedicated summary descriptor text at the conclusion of each response.
- Verified operational decoupling of `src/version.js` preventing redundant component dumps.
- Synchronized master specification in `ops/HANDOVER.MD` to v2.44.0.

## [v2.43.0] - Decoupled Versioning Module & Streamlined 4-Option CLI Suite
- Extracted application version string out of `src/App.jsx` into dedicated `src/version.js` module, permanently preventing full layout re-renders on version increments.
- Streamlined `ops/OPS.SH` and `ops/OPS.BAT` into a clean 4-option interface (`Run & Evaluate`, `Wipe`, `Export`, `Exit`), removing redundant stop and individual git actions.
- Configured automatic codebase serialization (`codebase.txt`) on every execution of `[1] RUN & EVALUATE`.

## [v2.42.0] - Descriptive Evaluation Menu & Protocol Optimization
- Added comprehensive, plain-English descriptions to options [1â€“4] in the Post-Vite Evaluation menu across `ops/OPS.SH` and `ops/OPS.BAT`.
- Optimized delivery protocol: decoupled unchanged component re-rendering (e.g. `App.jsx`) from operational and documentation updates, preserving prompt efficiency.

## [v2.41.0] - Vite Auto-Browser Launch & Post-Run Evaluation / Revert Pipeline
- Configured `open: true` in root `vite.config.js` to automatically launch the application in the system's default browser upon startup.
- Upgraded option `[1]` in `ops/OPS.SH` and `ops/OPS.BAT` into an interactive **Run & Evaluate** pipeline: exiting Vite (`Ctrl+C`) intercepts execution and displays immediate choices to **Merge to Main**, **Push to Branch**, or **Revert & Discard All Changes** (`git reset --hard && git clean -fd`).

## [v2.40.0] - Automated Iteration Lifecycle Pipeline in Master CLI
- Added automated `[5] START ITERATION` workflow to `ops/OPS.SH` and `ops/OPS.BAT`, creating clean isolated feature branches directly from updated remote `main`.
- Added automated `[6] FINISH & MERGE` pipeline, folding verified feature branches into `main`, syncing with GitHub, and pruning merged branches across local and remote repositories in a single action.

## [v2.39.0] - Windows Portable Node Session PATH Injection & Install Integrity Validation
- Fixed npm child process failure (`node install.js`) by injecting `CUSTOM_NODE_PATH` directly into the active session `%PATH%` in `ops/OPS.BAT`.
- Upgraded dependency checking to inspect core packages (`node_modules\vite\` and `bridge\node_modules\ws\`) rather than mere folder existence, preventing skipped recovery on corrupted/partial installs.
- Added pre-install port termination on 8080, 3000, and 5173 to clear stale file handles causing `EPERM` directory cleanup locks.

## [v2.38.0] - Windows Environment Parity & One-Liner Launcher
- Established verified one-liner Git invocation for Windows environments bypassing private repository curl limitations.

## [v2.37.0] - Markdown Code Fence Formatting & Package Lockfile Clarification
- Fortified code block fence formatting across AI delivery artifacts to eliminate nested block parser errors.
- Clarified lockfile lifecycle: validated `package-lock.json` retention in repository while intentionally excluding lockfile hashes from AI codebase exports.

## [v2.36.0] - AI Codebase Packaging Engine & Workspace Hygiene
- Added option `[8] EXPORT` to both `ops/OPS.SH` and `ops/OPS.BAT` to automatically serialize root configuration files, bridge server scripts, and React source trees into `codebase.txt`.
- Fortified `.gitignore` to exclude generated AI dumps (`codebase.txt`), temporary Windows environment paths (`.atem_node_path`), and macOS `.DS_Store` artifacts.

## [v2.35.0] - macOS Deployment Verification & File Extension Parity
- Resolved macOS Finder extension hiding behavior (`index.html.txt`) and validated root HTML entry point loading.
- Confirmed full system operational state across macOS Safari and native UNIX daemon environments.

## [v2.34.0] - Root Entry Structure Restoration (index.html & vite.config.js)
- Restored root `index.html` structure with `<div id="root">` DOM anchor and `/src/main.jsx` module script tag, resolving empty HTML shell delivery.
- Re-established root `vite.config.js` with React plugin definition and port 3000 host exposure.

## [v2.33.0] - Private Repository Bootstrap & Git Credential Parity
- Corrected GitHub repository endpoint mapping across all deployment CLI utilities to `trex20xx/atem-web-manager.git`.
- Resolved 404 access restrictions by routing zero-backup bootstrapping through authenticated Git protocol rather than unauthenticated raw curl endpoints.

## [v2.32.0] - Automated Bridge Termination on Exit & Zero-Backup One-Liner Bootstrap
- Integrated bash signal traps (`trap cleanup_bridge EXIT INT TERM`) into `ops/OPS.SH` and post-exit listeners into `ops/OPS.BAT` to automatically terminate the background bridge daemon (port 8080) when the Vite UI server stops.
- Upgraded `OPS.SH` with self-bootstrapping capabilities: users can now download and execute `OPS.SH` via a single curl command with zero pre-existing files on disk.

## [v2.31.0] - Operations Unification, Git Executable Bit Fix & Documentation Consolidation
- Replaced scattered automation scripts with a unified, interactive operations suite: `ops/OPS.SH` (macOS) and `ops/OPS.BAT` (Windows) handling Init, Stop, Push, Pull, Branch, Merge, and Wipe.
- Added explicit Git POSIX executable bit configuration (`git update-index --chmod=+x ops/OPS.SH`) to permanently eliminate macOS `chmod +x` permission errors.
- Consolidated redundant documentation files (`README.MD`, `FILE_TREE.MD`, `HANDOVER.MD`) into a single master document: `ops/HANDOVER.MD`.

## [v2.30.0] - macOS Subshell Directory Drift Fix
- Resolved a critical Bash subshell quirk in `INIT.SH` where `cd bridge && ... &` trapped the directory change in a background process, causing the subsequent `cd ..` to eject the user from the project root.
- Enforced absolute `$PROJECT_ROOT` pathing for all directory traversals in macOS deployment scripts to guarantee execution context stability.

## [v2.29.0] - macOS Initialization Verification & Bridge Daemon Start
- Verified flawless pull state on macOS hardware.
- Synchronized `ops/INIT.SH` to ensure background bridge daemon (`nohup node server.js &`) launches properly post-migration.

## [v2.28.0] - macOS Migration Preparation
- Logged environment transition from Windows to macOS.
- Verified readiness of native UNIX shell scripts (`INIT.SH`, `STOP.SH`, `WIPE.SH`, `PUSH.SH`) for standard bash/zsh execution.

## [v2.27.0] - Explicit Portable Node Pathing & VBScript Daemon Launcher
- Replaced PowerShell background execution in `INIT.BAT` with a dynamically generated VBScript (`atem_bridge_launcher.vbs`) to guarantee 100% hidden execution and flawless handling of spaces in file paths.
- Enforced strict explicit paths for `node.exe` and `npm.cmd` when a custom portable Node.js directory is provided.

## [v2.26.0] - Auto-Detect Portable Node.js Engine
- Upgraded `INIT.BAT` with smart detection for portable (non-global) Node.js installations.
- Implemented an interactive prompt to capture custom `node.exe` paths (e.g., NVM or extracted binaries) if global `node -v` fails.
- Added persistent path caching via `.atem_node_path` so the user is only prompted once.

## [v2.25.0] - Strict Delayed Expansion Validation
- Replaced volatile `if errorlevel 1` checks with strict `if !ERRORLEVEL! NEQ 0` delayed expansion evaluation in `INIT.BAT` to prevent inherited error codes from failing the Node.js validation check.

## [v2.24.0] - Robust Node Execution Validation in Auto-Clone Initialization
- Replaced volatile `where node` verification in `INIT.BAT` with bulletproof `call node -v` execution checking to bypass delayed expansion artifacts.

## [v2.23.0] - Secure Workspace Wiper, Main Branch Auto-Clone & Bridge Daemon Pathing Fix
- Implemented asynchronous ghost-script architecture in `WIPE.BAT` to securely bypass Windows file-locking and delete the root directory gracefully.
- Enforced strict security token check (`ATEM_MANAGER_SECURE_WIPE_KEY_2026` inside `.atem_workspace_token`) across both `WIPE` scripts to prevent accidental hard drive erasure.
- Upgraded `INIT.BAT` and `INIT.SH` to prompt for target directory, hardcode repository URLs, and explicitly clone the `main` branch.

## [v2.22.0] - Bulletproof Operational Scripts & Auto-Cloning Setup
- Re-architected `WIPE.BAT` and `WIPE.SH` to perform "Deep Cleans" (wiping `node_modules`, caches, and `dist`) rather than nuking the entire folder, preserving `.git` repo safety.
- Upgraded `INIT.BAT` and `INIT.SH` with smart repository location. If the scripts are run outside the project, they will automatically prompt for the GitHub URL, clone the repo, and proceed with setup.
- Added macOS/Linux equivalent `STOP.SH` utility for cross-platform background daemon termination.

## [v2.21.0] - Dedicated Background Daemon Kill Script (STOP.BAT)
- Created `ops/STOP.BAT` to automatically locate and terminate any hidden Node.js bridge daemon processes running on port 8080.
- Resolved documentation ambiguities regarding the `-WindowStyle Hidden` execution lifecycle.

## [v2.20.0] - Macro Panel Typography & Hardware Loop Sync
- Unified macro panel background, typography, and font weights precisely with the Sidebar device list constraints.
- Removed "Create" mode section and bottom macro status bar for a clean run-only interface.
- Uppercased "MACROS" and "RECALL AND RUN" tags.
- Added discrete, left-aligned, muted italic numbering (1-100) inside macro buttons, allowing names to render in crisp standard typography alongside.
- Transformed Play, Stop, and Loop buttons into modern flat Material vector shapes wrapped in clean circular containers.
- Hooked `MACRO_LOOP` WebSocket command directly into physical ATEM (`atem.macroSetLoop`).
- Re-aligned pagination controls with grouped navigation arrows and wider dot spacing.

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

## [v2.17.0] - Silent Background Bridge Daemon & Global Git Staging Rule
- Re-architected `ops/INIT.BAT` to launch `bridge/server.js` completely hidden in the background via PowerShell `-WindowStyle Hidden`, eliminating the second terminal window.
- Added automatic cleanup of lingering port 8080 processes in `ops/INIT.BAT` prior to launching.
- Confirmed mathematical preservation of strict 16:9 aspect ratio geometry across all multiview panels.

## [v2.16.0] - Compact Apple Switch Icons, Fade-Toggle Version Tag & Alignment Precision
- Embedded responsive SVG Sun and Moon icons directly inside the sliding Apple-style theme toggle switch.
- Scaled Apple switch geometry to 36px Ã— 20px to match the proportions of the adjacent settings gear.
- Added smooth opacity fade transition (0.3s) to the version tag, allowing click-to-hide and click-to-reveal.
- Anchored multiview quadrant grid left alignment to match the sidebar's uncollapsed left boundary when the sidebar collapses.

## [v2.15.0] - Automated Source Packaging Utility & State Review Baseline
- Provided robust cross-terminal codebase serialization scripts for seamless AI session ingestion.

## [v2.14.0] - Full Historical Archive Restoration & Multi-Hook Bridge Sync
- Restored complete historical changelog dating back to monolithic baseline (v1.72.0 through v2.14.0).
- Standardized `ops/` directory as the authoritative repository documentation home.
- Verified physical ATEM Constellation HD two-way tally sync baseline via `receivedCommands` and `bridge/server.js`.

## [v2.13.0] - Direct ATEM Command Packet Listener via receivedCommands
- Hooked directly into `atem.on('receivedCommands')` to capture raw `PrgI` (Program) and `PrvI` (Preview) UDP packets sent when pressing physical switcher buttons.
- Eliminated reliance on `stateChanged` path filters which were failing on Constellation HD hardware events.
- Maintained authoritative `currentPgm` and `currentPvw` cache in `bridge/server.js` with instant WebSocket broadcast.

## [v2.12.0] - Documentation Consolidation to /ops & Tally State Telemetry
- Consolidated all project documentation exclusively into the `/ops/` directory.
- Verified bidirectional tally communication telemetry between physical switcher and UI.

## [v2.11.0] - Resolved Tally Desynchronization Loop & State Broadcast Throttling
- Eliminated state fallback corruption in `bridge/server.js` that was resetting PGM/PVW tallies to default values on intermediate packets.
- Implemented state deduplication in bridge broadcast loop to prevent WebSocket message flooding.

## [v2.10.0] - Two-Way ATEM Hardware Tally Synchronization & Auto-Reconnect Engine
- Implemented true bidirectional tally synchronization between Web UI and ATEM 1 M/E Constellation HD (`192.168.10.240`).
- Added immediate state handshake on WebSocket `CONNECT` / `GET_STATE` messages to sync tallies on initial page load.
- Added background auto-reconnection loop in `bridge/server.js` for physical ATEM switcher UDP link.

## [v2.09.0] - Full Historical Archive & Robust Bidirectional Tally Sync
- Upgraded `bridge/server.js` and `AtemConstellationBus.jsx` with robust `Object.values()` state extraction for live two-way ATEM hardware tally feedback.
- Enhanced Apple-style theme switch with embedded Sun and Moon SVG icons inside the sliding thumb.
- Synchronized sidebar collapse animation for simultaneous horizontal slide and width shrinkage.

## [v2.08.0] - Unified Top Bar, Apple Theme Switch, Bidirectional ATEM Feedback & Edit UX
- Created dedicated Top Navigation Bar housing Hamburger toggle, Title, Version tag, Theme switch, and Settings gear.
- Eliminated all quadrant overlap issues during 16:9 aspect ratio resizing and sidebar collapse.
- Implemented monochrome Apple-style sliding switch for Dark/Light theme toggling.
- Added Enter-key submission across all Device and Group inline edit fields.
- Implemented floating quick-select group dropdown in device edit forms.
- Implemented bidirectional ATEM hardware state broadcasting in `bridge/server.js` for live hardware-to-UI tally syncing.

## [v2.07.0] - UI Geometry Polish, Control Positioning & Context Routing
- Restored settings gear icon to the bottom-right corner (`bottom: 16px; right: 16px`).
- Mathematically centered edit buttons (`.edit-btn`, `.group-edit-btn`) with exact 4px equidistant top, bottom, and right padding inside `30px` pill rows.
- Standardized all edit panel inputs (`Name`, `IP`, `Group`, `Color`, `Description`) with pill-rounded geometry (`24px`).
- Added "Clear Color" (`Ã—`) button inside the Color Dropdown to reset colors to transparent ("No Color").
- Implemented right-click quadrant context menu routing specific Quadrant numbers (1â€“4) into target slots.
- Added Tally LED brightness global settings slider.

## [v2.06.0] - Synchronization & Full Rollup Release
- Consolidated all additions from v1.85 to v2.05 into a single clean push to synchronize GitHub across environments.

## [v2.05.0] - Cross-Platform Parity, All-Caps Ops Standardization & Complete Handover
- Implemented background bridge server auto-launch inside macOS `INIT.SH` matching Windows `INIT.BAT`.
- Standardized all documentation and automation scripts inside `ops/` to ALL-CAPS naming.
- Fortified `HANDOVER.MD` into a complete, standalone architectural memory specification for future AI sessions.

## [v2.04.0] - Operations Directory Refactoring & Workspace Cleanup
- Created dedicated `ops/` directory housing all documentation, handover states, and OS automation scripts.

## [v2.03.0] - Complete History Archive & Automated Bridge Startup
- Restored comprehensive historical changelog dating back to monolithic baseline (v1.72).
- Upgraded `INIT.bat` to concurrently spawn the embedded ATEM bridge server (`bridge/server.js`) on port 8080 alongside Vite.

## [v2.02.0] - Cross-Platform Windows Batch Suite & Setup Sync
- Added Windows-native batch scripts (`INIT.bat`, `PUSH.bat`, `WIPE.bat`) matching macOS bash utilities.
- Embedded automatic path detection for portable Node.js on enterprise Windows environments.

## [v2.01.0] - Settings UI Restoration, Full-Collapse Sidebar, & Row Geometry Lock
- Converted all edit-form fields (Name, IP, Group, Color, Description) to pill-rounded styling (`24px`).
- Set "Classic (Solid)" as the default sidebar variant.
- Re-architected sidebar collapse to slide 100% off-screen with a floating top-left restore button.
- Permanently locked Sidebar Devices, Groups, and Edit Panel designs under the locked element protocol.

## [v2.00.0] - Geometric Polish, Context Menus & Control Bar
- Fixed right-click context menu to map exact Quadrant numbers (1-4) into target slots.
- Added Tally LED brightness slider to Settings.
- Improved sidebar collapse animation with smooth container width transitions.

## [v1.99.0] - Switcher Layout Restoration & Context Routing
- Restored ATEM switcher panel CSS layout.
- Fixed right-click context menu items to map exact Quadrant numbers instead of slot indices.

## [v1.98.0] - Sidebar Collapse, Right-Click Context Menus & UI Polish
- Added right-click context menu on panels for 1-4 position swapping.
- Locked background quadrant numbers against text highlighting/selection (`user-select: none`).

## [v1.95.0] - Workspace Erase Utilities & Empty Directory Clone Fixes
- Added `WIPE.sh` to safely delete project folders using a verification token (`.atem_workspace_token`).

## [v1.90.0] - Automated One-Liner Bootstrapping & Double-Click Launchers
- Upgraded `INIT.sh` (macOS) and `INIT.bat` (Windows) to automatically execute `npm run dev` upon successful setup.

## [v1.84.0] - Multiview Quadrant Skeletons
- Updated `Panel.jsx` to display a shimmering skeleton layout inside all quadrants during the initial `isLoading` window, matching the sidebar skeleton style.

## [v1.83.0] - Crash-Proof Error Boundaries & Safe ATEM Bridge Handling
- Created `ErrorBoundary.jsx` to trap component rendering exceptions.

## [v1.82.0] - Crash-Proof Error Boundaries & Safe ATEM Bridge Handling
- Created `ErrorBoundary.jsx` to trap component rendering exceptions and network connection faults, preventing blank white screen crashes.
- Upgraded `AtemConstellationBus.jsx` to gracefully handle offline WebSocket states (`ws://localhost:8080`), falling back to a clean local UI mode.

## [v1.81.0] - Real ATEM Hardware Control Bridge Layer
- Upgraded `AtemConstellationBus.jsx` to dispatch real-world network commands to physical ATEM switchers at `192.168.10.240`.

## [v1.80.0] - ATEM 1 M/E Constellation HD Switcher Bus & Dynamic Panels
- Added `AtemConstellationBus.jsx` in `src/components/Panels/` featuring 10 inputs per row for Program (Red Tally) and Preview (Green Tally).
- Implemented CUT and AUTO transition buttons with live tally switching.

## [v1.79.0] - Polish, Light Theme & Consistency
- Matched Search input pixel-for-pixel with Device pills (30px height, identical padding/font).
- Added full Light Theme mapped to CSS variables with a dynamic Sun/Moon toggle.

## [v1.78.0] - UI Alignment & Persistence
- Replaced all monolithic JS state with `useLocalStorage` React Hook.
- Perfected CSS flex alignment for Device/Group edit buttons.

## [v1.77.0] - Persistence & Skeleton UI Fixes
- Added `useLocalStorage` hook to save all user settings, themes, device lists, and groups permanently in the browser.

## [v1.76.0] - Skeleton UI & Component Variants
- Added `<Skeleton />` UI component for modern loading states.
- Implemented a simulated 1.2s loading state in `useDevices.js` to demonstrate the Skeleton UI on initial mount.

## [v1.75.0] - React / Vite Transition Baseline
- Monolithic HTML/JS strictly ported to React + Vite component architecture.
- Preserved all [LOCKED] design rules (24px pills, 30% transparency UI, 16:9 Multiview logic).

## [v1.74.0] - Monolithic Pre-Transition Baseline
- Final monolithic baseline before transitioning to React component architecture.

## [v1.73.0] - YouTube Replica UI & Transparency Unification
- YouTube replica control bar with custom SVG masks for Play/Pause, Volume, Fullscreen, and centered Big Play button (68x48px).
- Unified 30% transparency (`rgba(30, 30, 30, 0.3)`) across panels and controls.

## [v1.72.0] - Settings & Sidebar UX Refinements
- Increased max corner radius range to 24px in preferences.
- Disabled global action button timeout (only CONFIRM state times out after 3 seconds).
