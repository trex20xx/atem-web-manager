## [v2.60] - ATEM Fullscreen Layout Parity, DSK Integrations & Seamless Sidebar Math

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
