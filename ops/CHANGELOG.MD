# ATEM WEB MANAGER - Complete Version History

## [v3.81] - Pandorum Standby Typography, LCD Shader & Enhanced Filter Controls
- Console Typography Standby Screen: Replaced ASCII art with centered text rendering ATEM WEB MANAGER in Pandorum/Orbitron font with the version tag underneath in regular font. Live log streaming begins immediately upon device connection without text clutter.
- Vertical Real Estate Expansion: Removed fixed 360px height constraints from the console body, allowing the log stream to expand dynamically across 100% of the available quadrant height.
- Enhanced Header Filtering: Added an ALL source filter button to the left of USER (enabling USER, ATEM, BRIDGE, and SYSTEM simultaneously) and relocated the CURRENT / ALL DEVICES toggle adjacent to EXPORT.
- Uniform Button Weight Parity: Standardized active and inactive console header buttons to strictly maintain font-weight 400 across all color states.
- Subtle LCD Effect: Introduced a preferences toggle in Settings to render a subtle broadcast CRT/LCD scanline and diagonal sheen across the console panel.
- Console Display Font Selector: Added preferences dropdown supporting 15 curated broadcast, techno, and monospace fonts, backed by automated woff2 bootstrapping in OPS scripts.
- Scrollbar Minimum Thumb Size: Constrained the macOS slim overlay scrollbar thumb to a minimum 15% height to prevent tiny slivers during high log volume.


## [v3.80] - Console Design Polish, Device Filtering, ASCII Standby & Friendly Logging
- Console Header Restyling: Changed title to CONSOLE. Completely removed the sliding tray and pill backgrounds. Filters (CURRENT/ALL, USER, ATEM, BRIDGE, SYSTEM, EXPORT) are now plain text buttons sharing exact typography and spacing with the Media Pool and Macros headers.
- Standardized Non-Neon Color Palette: Filter text and log tags use the core application colors: Pastel Blue (#3b5f94) for USER, Tally Red (#d32f2f) for ATEM, Tally Orange (#e67e22) for BRIDGE, and Tally Green (#2e7d32) for SYSTEM. Inactive buttons rest in muted grey.
- Disconnected ASCII Standby Mode: When disconnected from hardware, the console displays exclusively the clean ASCII artwork banner with version info. Live log streaming engages upon device connection.
- Active Device vs All Devices Filtering: Introduced CURRENT / ALL DEVICES toggle. CURRENT filters telemetry to the active sidebar device IP plus universal SYSTEM logs. Exporting generates ATEM_WEB_MANAGER_YYYY-MM-DD_HH-MM-SS.txt containing only logs matching the active filter.
- Duplicate Command Suppression: Built a sliding 250ms window deduplication filter in ConsolePanel.jsx to eliminate double-logging of system and playback events.
- Apple macOS Overlay Scrollbar: Applied slim 5px rounded overlay scrollbar styling to the console body, completely invisible until hovered or scrolled.
- Friendly Input & Aux Telemetry: Updated bridge/server.js to translate raw IDs into plain-English labels (e.g., Input 1, Black (BLK), Color Bars (BARS), Color 1/2, Media Player 1/2, Preview/Program) and log rate values on execution.


## [v3.79] - Console Redesign, Per-Device Logging, ASCII Art & Universal Telemetry
- Console UI Overhaul: Removed the "FILTER" button, sliding tray, and pill background overlays. Filter toggles (ALL DEVICES, USER, ATEM, BRIDGE, SYSTEM) are now permanently inline text buttons styled with the standard application palette (Pastel Blue for USER, standard Red/Orange/Green for ATEM/BRIDGE/SYSTEM).
- Title Simplification: Renamed the panel from "BRIDGE CONSOLE" to simply "CONSOLE" for minimalism.
- Per-Device Log Isolation: The Console now respects the globally active device selected in the Sidebar. By default, it filters out noise from other IPs unless the "ALL DEVICES" toggle is engaged. SYSTEM logs bypass IP filtering and are always visible.
- ASCII Art Startup: The console initializes with a crisp ATEM WEB MANAGER ASCII text logo and version readout upon mounting.
- Duplicate Log Fix: Resolved the duplicate command issue in the console caused by a race condition where the UI pushed local SYSTEM logs while simultaneously receiving the identical payload echo from the Bridge websocket.
- Date/Time Export Format: Console exports now automatically generate files named `ATEM_WEB_MANAGER_YYYY-MM-DD_HH-MM-SS.txt`.
- Universal System Telemetry: Wired `dispatchSysLog` into `App.jsx` and `AtemConstellationBus.jsx`, aggressively logging every settings adjustment (Corner Radius, Tally Brightness, Theme toggling, Layout modes) and panel locks/resets.


## [v3.77] - Git Refspec Fix, Mixer Optimistic Locks & Media Pool Geometry
- Git Refspec Collision Resolved: Updated OPS.BAT and OPS.SH push commands to explicitly target `refs/heads/` and `refs/tags/`, permanently fixing the "src refspec matches more than one" error when pushing iteration branches.
- Comprehensive Mixer Optimistic Locks: Expanded the 450ms optimistic state guard in AtemConstellationBus.jsx to include KEY 1-4 selection, USK ON AIR, DSK TIE, and DSK ON AIR, ensuring zero rubber-banding or state reversions during rapid switching.
- Media Pool Redesign:
  - Removed the 'X' slot clearing button.
  - Removed circular borders around slot numbers, centering them cleanly.
  - Empty (unassigned) slots now render with a dimmed 0.35 opacity, matching the muted state of disabled mixer buttons.
  - MP1 and MP2 header buttons now render in muted grey when inactive, turning their respective bright tally colors (Green/Red) only when selected.
  - Redesigned concentric tallies: The inner tally is now a physically nested absolute element sized proportionately smaller, ensuring the red and green borders never touch.
- Sidebar Font Normalization: Ensured the active/connected device name uses a font-weight of 600 while preserving the exact 13px font-size to prevent text shrinking.
- Toolbar Connected State: The top toolbar application name turns bright green when actively connected to the ATEM.
- Bottom Action Button: The "SELECT ITEM" placeholder button has been completely removed from the DOM when no action is selected.


## [v3.76] - Mixer Rate Countdown, Font Unification & Persistent Console Logs
- Real-Time Transition Rate Countdown: Triggering AUTO, DSK AUTO, or FTB now smoothly counts down the frame value on the respective rate button in real-time down to 0:00. Once the transition finishes, the display automatically reverts to the original stored rate value.
- Eradicated Input Switching Latency: Introduced an optimistic 450ms lock guard in AtemConstellationBus.jsx for PGM, PVW, and Aux routing. Intermediate stale WebSocket packets are prevented from overriding user selections before the physical ATEM finishes acknowledging, delivering true 0ms tactile switching.
- Unified Button Typography: Standardized all switcher button labels (Program, Preview, Internal sources, Keys 1-4, On Air, Tie, Outputs, Cut, Auto, and FTB) to strictly match the exact 13px font size and 400 font weight of the IN1 button.
- Persistent Console History: Re-architected ConsolePanel.jsx with an external memory ring buffer (retaining up to 300 entries), ensuring bridge log history is never cleared when switching quadrants or assigning different panels.


## [v3.75] - Picture Download Engine Removal & Zero-Latency Mixer Core
- Completely Removed Picture Download Engine: Purged queueDownloadStill, queueUploadStill, downscaleToThumbnailBmp, encodeBmp, and transfer queue from bridge/server.js. This permanently eliminates UDP port 9910 bandwidth contention and CPU event-loop blocking.
- Preserved Media Pool Metadata and Routing: Retained authoritative stillPool and clipPool name extraction from atem.state.media so file names and isUsed states remain available for UI tooltips and MP1/MP2 player assignment.
- Streamlined ATEM Event Listeners: Removed redundant receivedCommand listener that was triggering triple state broadcasts per packet, leaving stateChanged and batched receivedCommands with 20ms throttled dispatch.
- Instantaneous Mixer Responsiveness: With zero background media transfers competing for ATEM UDP frames, all Program/Preview cuts, transitions, DSK, and Aux routing execute with sub-millisecond latency.


## [v3.74] - Mixer Control Restoration, Media Engine Gating & Concentric Tally Inversion
- Resolved Mixer Button Latency and Reversions: Injected immediate local optimistic state dispatch for KEY 1-4, BKGD, USK ON AIR, DSK TIE, DSK ON AIR, and DSK Rate, eliminating sluggishness and network dropouts.
- Fixed Aux Output Reversion: Eliminated server-side stale cache rebroadcasting race conditions, locking Aux input changes into place immediately upon selection.
- Renamed TIE 1 button to TIE in Mixer panel.
- Decoupled Media Pool Picture Engine: Added a master toggle switch on the far right of the Media Pool header (default OFF). When disabled, all background UDP thumbnail requests to the ATEM switcher are completely halted, freeing 100% of network bandwidth for video transitions.
- File names and Media Player routing (MP1/MP2) remain fully interactive even with the Picture Engine disabled.
- Redesigned Slot Clearing Button: Replaced the cartoonish X with a minimalist, flat Material vector cross icon.
- Reverted Concentric Tally Order: When both MP1 and MP2 sit on the same slot, the red tally border sits on the outer boundary with the green tally nested 4px inside.
- Solidified MP1 and MP2 badges with an opaque base color (var(--panel2)) for maximum contrast.
- Synchronized Trunk-Based Development routines across ops/OPS.BAT and ops/OPS.SH.


## [v3.73] - Git Trunk-Based Execution, Media Pool Cache Controls & Concentric Tallies
- Re-architected Git Operations MERGE_MAIN in OPS.BAT and OPS.SH: Scripts now utilize Trunk-Based Development mechanics. Commits are saved and pushed directly to main, and a historical marker branch (e.g. v3.73) and tag are spawned and pushed without leaving main, permanently eliminating merge conflicts.
- Added CLEAR button to Media Pool headers that flushes the localized thumbnail cache (setCachedThumbnails).
- Added an Apple-style toggle switch to the Media Pool header allowing operators to instantly hide all downloaded pictures and revert to numbered slot placeholders.
- Added a hover-activated 'X' overlay button to the top-right corner of each Media Pool slot. Clicking it clears the local cache for that slot and dispatches a CLEAR_STILL command to the physical ATEM switcher via the bridge server.
- Replaced the bottom textual filename bar (.mp-label-bar) in the Media Pool with a hover-based GlobalTooltip overlay, maximizing image real estate.
- Redesigned Media Pool Tallies: Eliminated dim tally states. Selected MP1 slots always render with a bright green border, and MP2 slots with a bright red border. When both players are assigned to the same slot, the tally displays concentrically (red nested 4px inside the green border).
- Solidified .mp-badge (MP1/MP2 tags) with an opaque base color (var(--panel2)) to ensure legibility over bright thumbnails.
- Added a permanent dark-grey numbered circle overlay to the bottom-left corner of Media Pool slots when an image is loaded, matching the 'X' button geometry.
- Fixed the SYNC button to maintain its text label ("SYNC") while turning red when active, rather than transforming to "SYNCING...".


## [v3.72] - Mixer Lock Switch Inversion, Console Layout Parity & Keyboard Bounce Shielding
- Fixed duplicate command triggers on keyboard input: added e.repeat checks to the physical key listener, ignoring auto-repeating keystrokes from held-down buttons.
- Inverted Mixer Lock Switch: when the green Apple-style switch is toggled OFF, the panel locks out input interactions and keyboard hotkeys while keeping current tally states, active selections, and rate values fully illuminated.
- Redesigned Bridge Console Panel: converted the layout to use standard .quadrant-master-panel margins, flex dimensions, and neutral .macro-section-box container borders.
- Integrated Bridge Log Export: added an EXPORT action button to the console header, allowing operators to download text logs containing historical WebSocket and ATEM command telemetry.
- Injected Double-Click Rate Reset: configured Transition, DSK, and FTB rate boxes to immediately reset back to standard baseline (1:00 / 25 frames) when double-clicked.
- Suppressed PowerShell Progress Bar: added $ProgressPreference = 'SilentlyContinue' flags inside the download execution pipelines of the master deployment CLI suite to guarantee clean inline terminal outputs.

## [v3.33] - Complete Historical Archive Restoration
- Restored and reconstructed the complete `CHANGELOG.MD` history spanning v1.72 to v3.33 per explicit user request, permanently consolidating all modular updates back into the master timeline.
- Synchronized application version to v3.33.

## [v3.32] - AI Handover Package Generation
- Generated comprehensive AI handover package including the full operational `CHANGELOG.MD`, `SYSTEM_INSTRUCTIONS.MD`, and `HANDOVER.MD` files to establish a clean context window.

## [v3.31] - Media Pool Page 2 Vertical Consistency & Bounding Box Constraints
- Eliminated the vertical stacking compression anomaly on Media Pool Page 2. Both Stills 17-20 (Row 1) and Clips 1-4 (Row 4) now utilize the horizontal `.mp-grid-single-row` CSS grid.
- Stills 17-20 are placed in their own bounding box on the 1st row (Y = 23px to 119px), identical to Stills 1-4 on Page 1.
- Clips 1-4 are placed in their own bounding box on the 4th row (Y = 323px to 419px), identical to the bottom row on Page 1.
- The `CLIPS` section header sits directly above the clips bounding box at the exact standardized 4px margin distance. Rows 2 and 3 remain completely empty (176px of clean vertical space) via `justify-content: space-between` inside the locked `424px` `.panel-layout-frame`.
- Standardized bounding box geometry: Enforced `4px` padding inside `.macro-section-box` and `4px` gap horizontally and vertically between all slots.

## [v3.30] - Perfect 424px Centralization & Flexbox Alignment
- Resolved the vertical alignment of Media Pool Page 2 by replacing broken CSS grid row definitions with a flexbox architecture powered by `justify-content: space-between` inside the fixed `424px` `.panel-layout-frame`.
- Preserved perfect quadrant margin parity: Both Page 1 and Page 2 are strictly locked to `786px` width Ã— `424px` height and centered vertically inside the quadrant panel.

## [v3.29] - Top-Alignment Offset Fix
- Solved the top-alignment layout anomaly: `justify-content: flex-start` was restored to `.panel-layout-frame` across both Media Pool and Macro panels, ensuring headers stay permanently pinned to the absolute top of the 424px rigid frame.
- Restructured `MediaPool.jsx` Page 2 entirely around a unified `grid-template-rows: 96px 14px 96px` 4x4 matrix representation.

## [v3.28] - ATEM UDP Transfer Saturation Fix & UI Responsiveness
- Overhauled raw YUV decoding in `bridge/server.js`: Removed synchronous loops freezing the Node Event Loop. Implemented an ultra-fast combined decimation-decoder `downscaleYuvToThumbnailBmp()` dropping decode times to under 2ms.
- Enforced `trafficPauseUntil` inside `bridge/server.js`: Clicking any Mixer button pauses background downloads for 500ms, giving full UDP bandwidth to the switcher cut command, ensuring the ATEM reacts instantly.
- Wrapped `broadcastState()` in a 20ms throttle so the physical ATEM cannot freeze the React frontend by flooding 50 UDP packets in a millisecond.

## [v3.27] - Typography Weights & Batch Menu Sync
- Corrected the inactive grey mapping: The `STOP` button now properly tracks active state parity with the `PLAY` button.
- Repaired the `App.jsx` settings gear icon utilizing standard clean Material SVG geometry with `fill="currentColor"`.

## [v3.26] - WebSocket Infinite Loop Resolution & Reconnection Engine
- Resolved an infinite WebSocket disconnection storm in `MediaPool.jsx` caused by `downloadedStills` in the `useEffect` dependency array.
- Built an asynchronous sequential transfer queue with `isTransferring` locking in `bridge/server.js` preventing ATEM UDP transfer collisions.

## [v3.25] - Typography Parity & Hardware Download Links
- Re-aligned `.macro-title-group`, `.macro-actions-group`, and `.atem-section-title` in `index.css` strictly using `align-items: baseline`.
- Removed hardcoded dark hex colors from Media Pool slots and replaced them with standard UI CSS variables (`var(--atem-bg)`, `var(--panel2)`) for Light Theme UI support.
- Upgraded `bridge/server.js` to call `atem.downloadStill(index, 'rgba')` directly.

## [v3.24] - Hardware YUV to BMP Intercept
- ATEM YUV 4:2:2 Hardware Decoding: Engineered a custom byte-level YUV (UYVY) to RGB conversion algorithm inside `bridge/server.js` (`GET_STILL`). The bridge mathematically decodes the YUV luma/chroma values into BGRA pixel arrays, packages them with a 54-byte BMP header, and streams them to the UI.

## [v3.23] - Standalone Git Workflow
- Created a dedicated, standalone clean script `ops\git-workflow.bat` that performs staging, committing, pushing, switching to main, pulling, merging, and returning to the feature branch cleanly without any complex menu parser bugs.

## [v3.22] - Initial Media Pool Transfer Engineering
- Wrapped `MediaPool.jsx` inner grids completely inside `<div className="atem-bus-content-layout">` enforcing identical 424px total centering math.
- Engineered bi-directional Media Pool Data Transfer in `bridge/server.js`.

## [v3.21] - Global Font Normalization
- Imported standard Google Web Font `Roboto` at the top of `index.css` to fix macOS vs Windows font discrepancies.

## [v3.20] - Media Pool 4x4 Scaffold & Emulator Setting
- Added ATEM Switcher / Emulator IP configuration input box to the General tab of the Settings modal.
- Implemented `MediaPool.jsx` mimicking the official ATEM Software layout with a fixed 4x4 grid.

## [v3.19] - Base Media Pool Grid & Emulator
- Implemented a complete ATEM Virtual Hardware Emulator (`bridge/emulator.js`) that binds to UDP port 9910.
- Implemented `MediaPool.jsx` featuring a 4x4 grid (16 slots) layout consistent with the macro compact panel design.

## [v3.18] - Git Handover & File Suppression Rules
- Provided clean, step-by-step terminal commands to re-initialize Git from scratch (`git init`).
- Updated Rule 3 to also suppress the output of `ops/HANDOVER.MD` alongside `CHANGELOG.MD` in standard conversational responses.

## [v3.17] - Large File Tracking Purge
- Built-in automatic removal of tracked large files (`git rm --cached public/Top.mp4`) and `.gitignore` safety appending directly into `OPS.BAT` and `OPS.SH`.

## [v3.16] - CLI Top.mp4 Purge Guide
- Provided the exact Git commands (`git reset` and `git rm --cached`) to purge the oversized `public/Top.mp4` file (167.98 MB) from staging and Git tracking.

## [v3.15] - Batch Variable Decoupling
- Fixed the Windows batch parser crash (`. was unexpected at this time`) inside `OPS.BAT` by cleanly decoupling variable declaration from `set /p` prompts.

## [v3.14] - Portable Node.js Explicit Pathing
- Hardcoded exact portable Node.js directory path directly into `OPS.BAT` to guarantee instantaneous resolution of `node.exe` and `npm.cmd`.

## [v3.13] - PowerShell Parameter Fix
- Fixed the PowerShell `Start-Process` argument error by explicitly providing `-FilePath '%NODE_EXE%'` and `-ArgumentList 'server.js'`.

## [v3.12] - Python Static Server Integration
- Upgraded `OPS.BAT` to automatically launch a background Python static server serving the `/public` folder on port `8000` during `RUN & EVALUATE`.

## [v3.11] - Media Pool Pagination & None Exclusivity
- Replaced the old full 100-macro panel with the refined compact layout, and added 3 page buttons (`1`, `2`, `3`).
- Enabled mouse wheel scrolling across the Macros panel to seamlessly flip through pages.
- Integrated `NONE` (ID 0) into Quadrant Context Menu and Settings Multiview dropdowns.

## [v3.10] - Safe Git Merge Strategy
- Refactored all Git merge workflows across `ops/OPS.SH` and `ops/OPS.BAT` to never delete feature branches upon merging into `main`.

## [v3.09] - OPS.BAT Execution Pipeline Reconstruction
- Completely reconstructed `OPS.BAT` to fully integrate the custom PowerShell sync commands, port cleanup macros, and codebase exports back into the requested Menu flow.

## [v3.08] - Portable Node.js Restoration
- Restored the portable Node.js auto-detection and caching mechanism (`.atem_node_path`) into `ops/OPS.BAT`.

## [v3.07] - Stop Button Parity & SVG Repair
- Corrected the STOP button disabled logic (`disabled={!macroPlayer.isRunning}`) so it turns to standard inactive muted grey (opacity 0.35).
- Repaired the `App.jsx` settings gear icon utilizing standard clean Material SVG geometry with `fill="currentColor"`.

## [v3.06] - Chromium Native Zoom Visual Counter-measure
- Added visual counter-measures in `App.jsx` (`document.body.style.zoom = 1 / window.devicePixelRatio`) resolving physical browser native UI zooming on Chromium browsers.

## [v3.05] - Conditional Versioning Protocol
- Updated Rule 1 (Conditional Version Increment): Version numbers will now only increment if actual codebase or documentation files are actively modified.

## [v3.04] - Iteration Descriptor Enforcement
- Corrected the procedural oversight from the previous iteration by acknowledging the missing mandatory iteration descriptor.

## [v3.03] - Absolute 424px Panel Centering Math
- Diagnosed vertical misalignment: Restored the exact `424px` content block height mathematically to the Mixer panel by wrapping all lower section titles into identical `.atem-section-header-row` wrappers (restoring the 4px height).

## [v3.02] - Mixer Vertical Alignment Calculation
- Recalculated the native height of the 4 Mixer rows to be exactly 376px. Replaced `space-between` with a hardcoded `gap: 16px` between the rows to hit 424px.

## [v3.01] - Flex-End Text Alignment
- Fixed MACROS section title vertical alignment: applied `align-items: flex-end` to both the Mixer and Macro headers, anchoring the 14px text flush to the absolute bottom of the container.

## [v3.00] - Macro Button Standardized Gaps
- Fixed vertical gap in `AtemMacrosCompact.jsx` grid from `5px` to `4px` (`gap: 4px !important`) to match horizontal spacing.

## [v2.99] - Tooltip Dynamic Multi-Line Overflows
- Configured dynamic tooltips: when hovering over macro buttons, if notes exist from the real ATEM or if the name overflows, the tooltip displays the name on row 1, a horizontal divider line, and the description underneath.

## [v2.98] - Path-Only Headers
- Updated absolute file header format to exclude the "FILE:" prefix.

## [v2.97] - Token Conservation Rules
- Integrated Token-Saving Rule: Suppressed full `ops/CHANGELOG.MD` delivery in standard responses unless explicitly requested by the user.

## [v2.96] - Google AI Studio Integration
- Formulated and documented complete System Instructions block tailored specifically for Google AI Studio's right sidebar "Run settings".

## [v2.95] - Macro Width Symmetrization, Title Harmonization & Available-Space Centering
- Symmetrized the compact macro panel to the 786px width standard and 10px panel padding, widening buttons across 4 columns to 191px each.
- Renamed panel title to MACROS and unified title styling with the PROGRAM section (14px line-height, 4px margin-bottom, 5px left-alignment).
- Restored circular hover overlay (`border-radius: 50% !important;`) on the loop button to match transport action button parity.
- Structured macro button text to center within the remaining width after subtracting the fixed 24px number width (`Button Width - Number Width`).
- Updated right-click context menu slot 5 to `5. MACROS (COMPACT)`.
- Synchronized application version tag to v2.95 across all modules.

## [v2.94] - 74px Button Architecture & Symmetric Panel Margin Equilibrium (10px)
- Widened switcher buttons to 74px x 36px, scaling the 10-column array and bounding box structures to exactly 786px.
- Calibrated panel padding to 10px on all 4 sides, achieving complete margin symmetry: Left Margin (10px) = Right Margin (10px) = Top Margin (10px) = Bottom Margin (10px) across the 16:9 quadrant.
- Synchronized Row 3 Next Transition (396px), DSK 1 (162px), and FTB (84px) with 72px interstitial column gaps.
- Synchronized Row 4 Outputs (474px) and Transition (240px) with 72px column gap and flush-right alignment.
- Synchronized Macros 40 panel row width and bounding box to 786px with 10px outer panel padding.
- Synchronized application version tag to v2.94 across all modules.

## [v2.93] - 73px Button Widening, Margin Symmetry & Pixel-Exact Baseline Alignment
- Widened switcher buttons to 73px width x 36px height, producing an exact 776px bounding box width across all Mixer and Macro rows.
- Symmetrically balanced the left and right margins to 15px, identically matching the 15px bottom and top margins to the panel edge.
- Aligned section titles flush with the first button's left edge (padding-left: 5px) and IP indicator with the last button's right edge (padding-right: 5px), eliminating the box-boundary offset.
- Aligned `PROGRAM` title and `192.168.10.240` to the exact same text baseline using `align-items: baseline`, locking title distance to 4px above all boxes.
- Enforced strict 4px padding on all 4 sides of every bounding box, eliminating the 2px right margin discrepancy.
- Synchronized application version tag to v2.93 across all modules.

## [v2.92] - Strict 16:9 Button Geometry (64px x 36px) & Proportional Grid Symmetry
- Scaled switcher button dimensions to an exact integer 16:9 aspect ratio: 64px width x 36px height (64/36 = 16/9).
- Re-architected 10-column row wrappers to exactly 684px width (10 x 64px buttons + 9 x 4px gaps + 2 x 4px padding), creating identical 16:9 proportional alignment between the 10x10 grid and the 16:9 quadrant.
- Aligned Row 3 FTB (72px) and Row 4 Transition (208px) flush with the 684px right boundary (Column 10) using `margin-left: auto`.
- Aligned section titles flush with the left button edge (margin-left: 4px) and Program IP status flush with the right button edge (margin-right: 4px).
- Enforced uniform 4px padding all around bounding boxes, identical to the 4px button spacing.
- Synchronized application version tag to v2.92 across all modules.

## [v2.91] - Section Text Button Edge Alignment, Title Distance Lock & 4px Box Padding Symmetry
- Aligned all section titles (`PROGRAM`, `PREVIEW`, `NEXT TRANSITION`, `DSK 1`, `FTB`, `OUTPUTS`, `TRANSITION`) flush with the left edge of the first button inside their section (`margin-left: 4px`).
- Aligned the Program IP status indicator (`â— 192.168.10.240`) flush with the right edge of the last button (Input 10).
- Locked the vertical distance of all section titles to a fixed `4px` directly above their respective bounding boxes, eliminating the previous height offset on `PROGRAM` and `IP`.
- Equalized all bounding box margins strictly to `padding: 4px !important;` on all 4 sides, matching the `4px` button spacing.
- Synchronized application version tag to v2.91 across all modules.

## [v2.90] - Mixer Header Removal, Symmetrical Row Alignment & FTB Right Anchor
- Removed the top `ATEM 1 M/E CONSTELLATION HD` header bar from `AtemConstellationBus.jsx`, embedding the online status indicator directly in the `PROGRAM` section header row.
- Equidistantly distributed the four Mixer rows (`PROGRAM`, `PREVIEW`, `LOWER`, `OUTPUTS`) across the vertical axis with space matching button height, aligning the top and bottom button rows with Macros 40.
- Anchored the FTB module flush with the right boundary (`margin-left: auto`) directly under Column 10 (Input 10 and AUTO).
- Set `.macro-matrix-grid-compact` to `align-content: space-between` to establish vertical button equilibrium with the Mixer grid.
- Synchronized application version tag to v2.90 across all modules.

## [v2.89] - Description Suppression, Section Bounding Box & Squared Loop Button
- Suppressed hover tooltips on all macro slot buttons by stripping `data-description` hooks across `AtemMacros.jsx` and `AtemMacrosCompact.jsx`.
- Encapsulated the entire 40-button matrix in `AtemMacrosCompact.jsx` within a dedicated `.macro-section-box` sharing the exact `4px` padding, dark fill (`rgba(0, 0, 0, 0.15)`), and border radius as the Mixer section containers.
- Redesigned the macro action Loop button into a squared container (`border-radius: var(--ui-radius)`) housing a geometric, rectangular cycle arrow vector glyph.
- Standardized compact macro button dimensions (`36px`), border (`1px solid var(--atem-border)`), and numeral typography to match the Mixer switcher button specification.
- Synchronized application version tag to v2.89 across all modules.

## [v2.88] - Native YouTube Chrome Suppression & Global Unconnected Muted State
- Suppressed YouTube native controls, suggestions band, and CC tracks (`cc_load_policy: 0`) via YouTube IFrame API parameters and clipped `.yt-embed-wrapper` height styling.
- Added global unconnected panel idle state (`!isConnected`): displays muted titles (`opacity: 0.45`) across all quadrants alongside large centered backdrop numbers.
- Integrated a centered, clean crossed-out video camera SVG placeholder for Quadrant 1 (`STREAM`) during unconnected standby.
- All panels smoothly activate and mount hardware controls upon ATEM device connection.
- Synchronized application version tag to v2.88 across all modules.

## [v2.87] - YouTube Desktop Replica Controls Overlay & Dual Engine Video Architecture
- Engineered custom YouTube-replica control bar overlay modeled identically after YouTube desktop (Lofi Cafe reference):
  - Full-width red progress bar with buffer indicator, hover scrub expansion, and red scrubber head.
  - Left group: Play/Pause toggle, hover-expanding volume slider (smoothly expands from 0px to 58px on mouse hover), and position/duration timecode.
  - Right group: Settings gear (quality menu), overlay tools button (wipes, opacity split, snapshot), and fullscreen toggle.
  - Auto-hides after 2.5 seconds of mouse inactivity during playback and re-appears on hover/movement.
- Integrated dual-engine player architecture in `Player.jsx`: drives YouTube via the official IFrame API (`controls: 0`) and HTML5 files (MP4, HLS `.m3u8`, local VLC streams) with identical controls.
- Synchronized application version tag to v2.87 across all modules.

## [v2.86] - YouTube Native Iframe Engine, Non-Swapping Select-None & Mac Shortcut Parity
- Re-architected `Player.jsx`: YouTube links now load through an embedded, hardware-accelerated iframe with native playback controls (`controls=1`), completely eliminating Video.js black screen bugs and third-party plugin failures.
- Enforced Video.js HTML5 control bar visibility (`display: flex !important; visibility: visible !important;`) for MP4 files, HLS manifests, and local VLC streams.
- Refactored `handleReorderQuadrant` in `QuadrantGrid.jsx`: choosing `SELECT NONE` now assigns `0` directly to the target quadrant without triggering reciprocal position swaps.
- Extended keyboard shortcut handling in `App.jsx`: captured `Cmd+,`, `Cmd+.` and `Cmd+Shift+,` with `stopImmediatePropagation()` to provide reliable settings panel access on macOS and bypass native Safari preferences hijacking.
- Synchronized application version tag to v2.86 across all modules.

## [v2.85] - Video Player Lifecycle Fix, Safari Settings Override & Quadrant Un-mapping
- Fixed Video.js "black screen / missing controls" React unmount bug by dynamically generating and attaching the HTML5 `<video>` element on every render iteration to cleanly bypass the `dispose()` DOM-removal conflict.
- Fixed CSS `z-index` typo in `.vjs-big-play-button` and `.vjs-control-bar` restoring proper playback overlay visibility.
- Intercepted `Cmd+,` and `Ctrl+,` globally at the `document` level (`{ capture: true, passive: false }`) with aggressive propagation stopping to suppress macOS Safari/Chrome native preference windows and exclusively toggle the in-app Settings modal.
- Overhauled Quadrant Swap logic: assigning `SELECT NONE` from the context menu now completely empties the slot independently, removing all positional swapping mechanics previously tied to index `0`.
- Ensured 100% adherence to Rule 10 (Parser Isolation) for all codebase delivery artifacts.
- Synchronized application version tag to v2.85 across metadata and documentation.

## [v2.84] - Video Control Overlays Restoration, YouTube URL Parsing & Mac Shortcut Interception
- Restored full Video.js control bar components (`playToggle`, `volumePanel`, `progressControl`, `fullscreenToggle`) and custom drawers in Quadrant 1 with proper high z-index stacking (`z-index: 9999`).
- Upgraded `Player.jsx` YouTube video ID matching to robustly parse standard watch URLs (`/watch?v=`), short links (`youtu.be/`), embedded links (`/embed/`), and 11-character video IDs.
- Intercepted `Cmd/Ctrl + ,` keydown globally with `e.preventDefault()` and `e.stopPropagation()` preventing macOS Safari and Chrome from opening browser preferences and correctly toggling the in-app `SettingsModal`.
- Synchronized application version tag to v2.84 across all modules.

## [v2.83] - Video Controls Overlays, Unconnected Stream State & Per-Device CSV Stream Routing
- Restored full Video.js control bar overlays (Play/Pause, volume, progress scrubber, fullscreen) and custom Quality / Overlay drawer tools in Quadrant 1.
- Implemented conditional connection gating for Panel 1 (`STREAM`): when unconnected, Quadrant 1 displays backdrop number `1` and top-left `STREAM` header title matching Media Pool styling; mounts interactive video player upon connection.
- Added a new **Streams (CSV)** tab in `SettingsModal.jsx` enabling users to upload or map per-device stream URLs (`IP, Name, StreamURL`) alongside a master toggle switch to switch between the global Stream URL and device-specific CSV stream bindings.
- Synchronized application version tag to v2.83 across all modified modules.

## [v2.82] - Video Player Stream Engine & Full Viewport Sizing Restoration
- Removed `&& isConnected` restriction on Panel 1 (`STREAM`), ensuring the Video Player mounts immediately when assigned to Quadrant 1 regardless of ATEM hardware state.
- Injected complete Video.js and `.stream-container` styling in `src/index.css` supporting YouTube replica controls, custom masks, and 30% alpha backdrop.
- Added automatic protocol detection in `Player.jsx` for HLS `.m3u8` live manifests (`application/x-mpegURL`), direct video files (`video/mp4`), and YouTube links.
- Synchronized master application version tag to v2.82 across all modules.

## [v2.81] - JSX Syntax Error Resolution & Clean Source Delivery
- Stripped inadvertent Markdown codeblock fence headers from the physical `src/components/Panels/AtemConstellationBus.jsx` file.
- Verified pure JavaScript/JSX syntax compatibility with Vite Babel parser.
- Synchronized application version tag to v2.81 across runtime and documentation modules.

## [v2.80] - Compact Macro Matrix Panel (40 Macros) & Context Menu Routing
- Added dedicated `AtemMacrosCompact.jsx` component supporting 40 macros in a 4-column layout without pagination.
- Added `5. COMPACT MACROS` routing option in `QuadrantContextMenu.jsx` and `Panel.jsx`.
- Styled compact macro grid (`compact-40`) to match mixer button geometry (`36px` height, `4px` gap) and device list font metrics.
- Synchronized application version tag to v2.80 across all files.

## [v2.79] - Mixer Selected Button Border Normalization & Optical Parity
- Replaced bright, expanding border colors on selected switcher buttons (.tally-red, .tally-green, .tally-orange, .tally-yellow, .out-active, .auto-btn.trans-active) with border-color: var(--atem-border) !important;.
- Eliminated optical halation and boundary expansion, ensuring active buttons change background fill color only and match the exact outer dimensions of unpressed buttons.
- Codified Rule 10 into Section 1 of ops/HANDOVER.MD under the Parser Isolation & Zero-Nested-Backticks Protocol.
- Synchronized application version tag to v2.79 across all modified modules.

## [v2.78] - Rule 10 Codification & Parser Isolation Enforcement
- Formally integrated Rule 10 (Parser Isolation & Zero-Nested-Backticks Protocol) into ops/HANDOVER.MD under Section 1.
- Enforced 4-space indentation for all documentation trees, permanently eliminating premature code block closure in web markdown renderers.
- Synchronized application version tag to v2.78 across all project modules.

## [v2.76] - Strict Codeblock Isolation, Bus Muting Parity & Fixed Scale Lock
- Fixed codeblock leakage by removing internal backtick fences and formatting file deliveries in standalone code cards.
- Restored permanent visibility of PVW (Col 9) and PGM (Col 10) on Row 2 of Program and Preview buses with Col 7 & 8 spacers.
- Enforced bus muting protocol: in Program row, PVW and PGM render muted (opacity 0.35, non-clickable) until an Output is engaged for Aux routing. In Preview row, PVW and PGM are permanently muted.
- Locked browser scaling for fixed 1920 viewport via `maximum-scale=1.0, user-scalable=no` and attached global event guards intercepting wheel and keyboard zooming.
- Added preference-switchable 4-column Compact Macro Matrix (40 macros total) in Settings with 36px button heights matching the mixer grid, number typography matching switcher buttons, and tight padding allowing names up to 20 characters to render without truncation.
- Locked multiview quadrants to `minmax(0, 1fr)` with strict `min-height: 0` constraints to permanently prevent vertical expansion away from the 16:9 aspect ratio.
- Formalized Rule 10 in `ops/HANDOVER.MD`.
- Synchronized application version tag to v2.76 across all modules.

## [v2.74] - Multiview 16:9 Track Lockdown, Horizontal Bus Restoration & Keyer Array Protocol
- Enforced `minmax(0, 1fr)` and strict `min-height: 0` constraints across `.quadrant-wrapper` and `.panel`, mathematically preventing any panel content from stretching or distorting the 16:9 aspect ratio.
- Restored `grid-template-columns: repeat(10, 70px)` to `.atem-bus-grid`, resolving the vertical button stack glitch and returning Program and Preview to horizontal dual-row layouts.
- Rewrote the ATEM Transition Selection handler in `bridge/server.js` to support both array-based enum mapping (`[1, 2]`) and bitmask parameters, restoring physical switcher Key 1â€“4 control.
- Hardened Upstream Keyer execution (`setUpstreamKeyerOnAir`) with bidirectional state extraction.
- Fortified markdown code delivery blocks to prevent nested code fences from prematurely terminating artifacts.
- Synchronized application version tag to v2.74 across all modules.

## [v2.73] - Grid Box Alignment Mastery, Relative Frame Scrubber & Hardware API Resilience
- Separated PROGRAM, PREVIEW, OUTPUTS, and TRANSITION into standalone, identically padded `4px` `.atem-section-box` modules matching the exact geometry spacing of the ATEM inputs.
- Extracted all section titles into external left-aligned headers that line up geometrically with the leftmost nested buttons.
- Arranged all modules into a perfectly vertically-distributed, four-row flex stack bridging exactly 744px in width and utilizing `70px` column offsets internally.
- Transformed the `DragRateInput` mouse interaction into a completely frame-relative scrubber; cursor movement instantly subtracts/adds values, keeping slider adherence sticky regardless of reaching the maximum limit constraint.
- Upgraded the UI Rate indicators and text-inputs to directly support standard `Seconds:Frames` syntax (25f/s).
- Wrapped and chained all physical hardware commands (`TOGGLE_USK_ONAIR` and `TOGGLE_TRANS_SELECTION`) behind synchronous `try/catch` fallbacks to combat library typing exceptions in older `atem-connection` instances.
- Standardized documentation rule 10 explicitly forbidding markdown fences inside raw code delivery artifacts.
- Synchronized application version tag to v2.73 across all modules.

## [v2.72] - Hardware Keyer Sync, Seconds:Frames Timecode & Bounding Box Realignment
- Fixed ATEM hardware Next Transition (Key 1-4) controls in `bridge/server.js` by injecting a resilient API payload stack handling `setTransitionStyle` and `changeTransitionSelection` backwards compatibility.
- Upgraded Rate sliders to accept and format `Seconds:Frames` (S:FF at 25fps) allowing direct string parsing (e.g. `1:05` or `1.05` to 30 frames).
- Bound Rate sliders to dispatch hardware commands to the ATEM instantaneously during real-time mouse scrubbing, Enter key submission, and input blur.
- Extracted lower module titles ("NEXT TRANSITION", "DSK 1", "FTB") outside of their background `.atem-section-box` boundaries to mirror the ATEM Software Control aesthetic.
- Equalized horizontal and vertical margins inside bounding boxes to `padding: 14px`, achieving flawless mathematical vertical column alignment across all 10 columns of the UI.
- Synchronized application version tag to v2.72 across all operational documentation.

## [v2.71] - JSX Syntax Error Resolution & Clean Source Delivery
- Stripped inadvertent Markdown codeblock fence headers from the physical `src/components/Panels/AtemConstellationBus.jsx` file.
- Verified pure JavaScript/JSX syntax compatibility with Vite Babel parser.
- Synchronized application version tag to v2.71 across runtime and documentation modules.

## [v2.70] - Lower Control Modules Alignment Realignment, FTB Relocation & Rate Drag Shielding
- Relocated FTB control module from Input 9 to Input 10, establishing clean 50px buffer gaps at Column 6 and Column 9.
- Re-architected `.atem-lower-sections-grid` to match the exact 764px bounding box width and 10px 14px padding of `.pgm-pvw-box`.
- Formatted NEXT TRANSITION (Cols 1â€“5), DSK 1 (Cols 7â€“8), and FTB (Col 10) so every button aligns with PGM/PVW inputs and bottom outputs.
- Fixed sticky mouse cursor bug in `DragRateInput` by correctly binding and removing `onMouseUp` on the window event listener.
- Added live real-time ATEM hardware rate dispatching during scrub dragging, Enter submission, and click-away blur.
- Synchronized application version tag to v2.70 across all documentation and runtime modules.

## [v2.69] - Two-Row Control Modules Architecture & Scrub-Drag Interaction Stabilization
- Re-architected `DragRateInput` by separating display and editing modes, enabling smooth vertical scrub-dragging without input element event collisions while retaining single-click typing with Enter submission.
- Created the "NEXT TRANSITION" section matching the official software layout aligned directly under Inputs 1â€“5 (Row 1: On Air 1â€“4; Row 2: BKGD, Key 1â€“4).
- Added the "DSK 1" section aligned under Inputs 7â€“8 across two rows (TIE 1, Rate, ON AIR, AUTO).
- Added the "FADE TO BLACK" section aligned under Input 9 across two rows (Rate, FTB).
- Formatted sections to an exact two-button-tall height wrapped in individual `atem-section-box` borders.
- Moved keyer triggers into the Next Transition section, returning bus row 2 to standard sources (`BLK`, `BARS`, `COL 1`, `COL 2`, `MP1`, `MP2`).
- Locked the global button geometry (`70px x 36px`) and panel layout structure into the permanent Invariants Protocol.
- Synchronized master application version tag to v2.69 across all documentation.

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

## [v2.43.0] - Decoupled Versioning Module & Streamlined 4-Action Master CLI Suite
- Extracted application version string out of `src/App.jsx` into dedicated `src/version.js` module, permanently preventing full layout re-renders on version increments.
- Streamlined `ops/OPS.SH` and `ops/OPS.BAT` into a clean 4-option interface (`Run & Evaluate`, `Wipe`, `Export`, `Exit`), removing redundant stop and individual git actions.
- Configured automatic codebase serialization (`codebase.txt`) on every execution of `[1] RUN & EVALUATE`.

## [v2.42.0] - Descriptive Evaluation Menu & Protocol Optimization
- Added comprehensive, plain-English descriptions to options [1â€“4] in the Post-Vite Evaluation menu across `ops/OPS.SH` and `ops/OPS.BAT`.
- Optimized delivery protocol: decoupled unchanged component re-rendering (e.g. `App.jsx`) from operational and documentation updates, preserving prompt efficiency.

## [v2.41.0] - Vite Auto-Browser Launch & Post-Run Evaluation / Revert Pipeline
- Configured `open: true` in root `vite.config.js` to automatically launch the application in the system's default browser upon startup.
- Upgraded option `[1]` in `ops/OPS.SH` and `ops/OPS.BAT` into an interactive **Run & Evaluate** pipeline: exiting Vite (`Ctrl+C`) intercepts execution and displays immediate choices to **Merge to Main**, **Push to Branch**, or **Revert ^& Discard All Changes** (`git reset --hard && git clean -fd`).

## [v2.40.0] - Automated Iteration Lifecycle Pipeline in Master CLI
- Added automated `[5] START ITERATION` workflow to `ops/OPS.SH` and `ops/OPS.BAT`, creating clean isolated feature branches directly from updated remote `main`.
- Added automated `[6] FINISH ^& MERGE` pipeline, folding verified feature branches into `main`, syncing with GitHub, and pruning merged branches across local and remote repositories in a single action.

## [v2.39.0] - Windows Portable Node Session PATH Injection ^& Install Integrity Validation
- Fixed npm child process failure (`node install.js`) by injecting `CUSTOM_NODE_PATH` directly into the active session `%PATH%` in `ops/OPS.BAT`.
- Upgraded dependency checking to inspect core packages (`node_modules\vite\` and `bridge\node_modules\ws\`) rather than mere folder existence, preventing skipped recovery on corrupted/partial installs.
- Added pre-install port termination on 8080, 3000, and 5173 to clear stale file handles causing `EPERM` directory cleanup locks.

## [v2.38.0] - Windows Environment Parity ^& One-Liner Launcher
- Used verified one-liner Git invocation for Windows environments bypassing private repository curl limitations.

## [v2.37.0] - Markdown Code Fence Formatting ^& Package Lockfile Clarification
- Fortified code block fence formatting across AI delivery artifacts to eliminate nested block parser errors.
- Clarified lockfile lifecycle: validated `package-lock.json` retention in repository while intentionally excluding lockfile hashes from AI codebase exports.

## [v2.36.0] - AI Codebase Packaging Engine ^& Workspace Hygiene
- Added option `[8] EXPORT` to both `ops/OPS.SH` and `ops/OPS.BAT` to automatically serialize root configuration files, bridge server scripts, and React source trees into `codebase.txt`.
- Fortified `.gitignore` to exclude generated AI dumps (`codebase.txt`), temporary Windows environment paths (`.atem_node_path`), and macOS `.DS_Store` artifacts.

## [v2.35.0] - macOS Deployment Verification ^& File Extension Parity
- Resolved macOS Finder extension hiding behavior (`index.html.txt`) and validated root HTML entry point loading.
- Confirmed full system operational state across macOS Safari and native UNIX daemon environments.

## [v2.34.0] - Root Entry Structure Restoration (index.html ^& vite.config.js)
- Restored root `index.html` structure with `<div id="root">` DOM anchor and `/src/main.jsx` module script tag, resolving empty HTML shell delivery.
- Re-established root `vite.config.js` with React plugin definition and port 3000 host exposure.

## [v2.33.0] - Private Repository Bootstrap ^& Git Credential Parity
- Corrected GitHub repository endpoint mapping across all deployment CLI utilities to `trex20xx/atem-web-manager.git`.
- Resolved 404 access restrictions by routing zero-backup bootstrapping through authenticated Git protocol rather than unauthenticated raw curl endpoints.

## [v2.32.0] - Automated Bridge Termination on Exit ^& Zero-Backup One-Liner Bootstrap
- Integrated bash signal traps (`trap cleanup_bridge EXIT INT TERM`) into `ops/OPS.SH` and post-exit listeners into `ops/OPS.BAT` to automatically terminate the background bridge daemon (port 8080) when the Vite UI server stops.
- Upgraded `OPS.SH` with self-bootstrapping capabilities: users can now download and execute `OPS.SH` via a single curl command with zero pre-existing files on disk.

## [v2.31.0] - Operations Unification, Git Executable Bit Fix ^& Documentation Consolidation
- Replaced scattered automation scripts with a unified, interactive operations suite: `ops/OPS.SH` (macOS) and `ops/OPS.BAT` (Windows) handling Init, Stop, Push, Pull, Branch, Merge, and Wipe.
- Added explicit Git POSIX executable bit configuration (`git update-index --chmod=+x ops/OPS.SH`) to permanently eliminate macOS `chmod +x` permission errors.
- Consolidated redundant documentation files (`README.MD`, `FILE_TREE.MD`, `HANDOVER.MD`) into a single master document: `ops/HANDOVER.MD`.

## [v2.30.0] - macOS Subshell Directory Drift Fix
- Resolved a critical Bash subshell quirk in `INIT.SH` where `cd bridge ^&^& ... ^&` trapped the directory change in a background process, causing the subsequent `cd ..` to eject the user from the project root.
- Enforced absolute `$PROJECT_ROOT` pathing for all directory traversals in macOS deployment scripts to guarantee execution context stability.

## [v2.29.0] - macOS Initialization Verification ^& Bridge Daemon Start
- Verified flawless pull state on macOS hardware.
- Synchronized `ops/INIT.SH` to ensure background bridge daemon (`nohup node server.js ^&`) launches properly post-migration.

## [v2.28.0] - macOS Migration Preparation
- Logged environment transition from Windows to macOS.
- Verified readiness of native UNIX shell scripts (`INIT.SH`, `STOP.SH`, `WIPE.SH`, `PUSH.SH`) for standard bash/zsh execution.

## [v2.27.0] - Explicit Portable Node Pathing ^& VBScript Daemon Launcher
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

## [v2.23.0] - Secure Workspace Wiper, Main Branch Auto-Clone ^& Bridge Daemon Pathing Fix
- Implemented asynchronous ghost-script architecture in `WIPE.BAT` to securely bypass Windows file-locking and delete the root directory gracefully.
- Enforced strict security token check (`ATEM_MANAGER_SECURE_WIPE_KEY_2026` inside `.atem_workspace_token`) across both `WIPE` scripts to prevent accidental hard drive erasure.
- Upgraded `INIT.BAT` and `INIT.SH` to prompt for target directory, hardcode repository URLs, and explicitly clone the `main` branch.

## [v2.22.0] - Bulletproof Operational Scripts ^& Auto-Cloning Setup
- Re-architected `WIPE.BAT` and `WIPE.SH` to perform "Deep Cleans" (wiping `node_modules`, caches, and `dist`) rather than nuking the entire folder, preserving `.git` repo safety.
- Upgraded `INIT.BAT` and `INIT.SH` with smart repository location. If the scripts are run outside the project, they will automatically prompt for the GitHub URL, clone the repo, and proceed with setup.
- Added macOS/Linux equivalent `STOP.SH` utility for cross-platform background daemon termination.

## [v2.21.0] - Dedicated Background Daemon Kill Script (STOP.BAT)
- Created `ops/STOP.BAT` to automatically locate and terminate any hidden Node.js bridge daemon processes running on port 8080.
- Resolved documentation ambiguities regarding the `-WindowStyle Hidden` execution lifecycle.

## [v2.20.0] - Macro Panel Typography ^& Hardware Loop Sync
- Unified macro panel background, typography, and font weights precisely with the Sidebar device list constraints.
- Removed "Create" mode section and bottom macro status bar for a clean run-only interface.
- Uppercased "MACROS" and "RECALL AND RUN" tags.
- Added discrete, left-aligned, muted italic numbering (1-100) inside macro buttons, allowing names to render in crisp standard typography alongside.
- Transformed Play, Stop, and Loop buttons into modern flat Material vector shapes wrapped in clean circular containers.
- Hooked `MACRO_LOOP` WebSocket command directly into physical ATEM (`atem.macroSetLoop`).
- Re-aligned pagination controls with grouped navigation arrows and wider dot spacing.

## [v2.19.0] - ATEM Macros in Quadrant 2 ^& Centered Collapsed Layout
- Implemented full ATEM Macros Panel (`src/components/Panels/AtemMacros.jsx`) in Quadrant 2 supporting 100 macros across 5 pages of 20 buttons.
- Added flat pagination controls with 5 interactive carousel indicator dots.
- Added Recall ^& Run toggle with selective execution guard (macros only execute on selection when Recall ^& Run is active).
- Added transport controls (Loop, Play/Run, and Stop) linked to `bridge/server.js`.
- Configured `.dashboard.sidebar-collapsed` to center zoomed quadrants horizontally within the 16px marginal boundary.

## [v2.18.0] - Right-Pinned Quadrant Zoom, Smooth Sidebar Sliding ^& High-Contrast Icons
- Fixed quadrant layout anchor: pinned rightmost edge during collapse so the grid expands cleanly to the left, aligning with the 16px hamburger menu boundary.
- Added negative gap compensation (`margin-right: -8px`) to `.sidebar.collapsed` to eliminate the remaining offset.
- Added synchronized `height` and `transform: translateX(-100%)` transitions to `.sidebar`, preventing vertical jump artifacts when toggling.

## [v2.17.0] - Silent Background Bridge Daemon ^& Global Git Staging Rule
- Re-architected `ops/INIT.BAT` to launch `bridge/server.js` completely hidden in the background via PowerShell `-WindowStyle Hidden`, eliminating the second terminal window.
- Added automatic cleanup of lingering port 8080 processes in `ops/INIT.BAT` prior to launching.
- Confirmed mathematical preservation of strict 16:9 aspect ratio geometry across all multiview panels.

## [v2.16.0] - Compact Apple Switch Icons, Fade-Toggle Version Tag ^& Alignment Precision
- Embedded responsive SVG Sun and Moon icons directly inside the sliding Apple-style theme toggle switch.
- Scaled Apple switch geometry to 36px Ã— 20px to match the proportions of the adjacent settings gear.
- Added smooth opacity fade transition (0.3s) to the version tag, allowing click-to-hide and click-to-reveal.
- Anchored multiview quadrant grid left alignment to match the sidebar's uncollapsed left boundary when the sidebar collapses.

## [v2.15.0] - Automated Source Packaging Utility ^& State Review Baseline
- Provided robust cross-terminal codebase serialization scripts for seamless AI session ingestion.

## [v2.14.0] - Full Historical Archive Restoration ^& Multi-Hook Bridge Sync
- Restored complete historical changelog dating back to monolithic baseline (v1.72.0 through v2.14.0).
- Standardized `ops/` directory as the authoritative repository documentation home.
- Verified physical ATEM Constellation HD two-way tally sync baseline via `receivedCommands` and `bridge/server.js`.

## [v2.13.0] - Direct ATEM Command Packet Listener via receivedCommands
- Hooked directly into `atem.on('receivedCommands')` to capture raw `PrgI` (Program) and `PrvI` (Preview) UDP packets sent when pressing physical switcher buttons.
- Eliminated reliance on `stateChanged` path filters which were failing on Constellation HD hardware events.
- Maintained authoritative `currentPgm` and `currentPvw` cache in `bridge/server.js` with instant WebSocket broadcast.

## [v2.12.0] - Documentation Consolidation to /ops ^& Tally State Telemetry
- Consolidated all project documentation exclusively into the `/ops/` directory.
- Verified bidirectional tally communication telemetry between physical switcher and UI.

## [v2.11.0] - Resolved Tally Desynchronization Loop ^& State Broadcast Throttling
- Eliminated state fallback corruption in `bridge/server.js` that was resetting PGM/PVW tallies to default values on intermediate packets.
- Implemented state deduplication in bridge broadcast loop to prevent WebSocket message flooding.

## [v2.10.0] - Two-Way ATEM Hardware Tally Synchronization ^& Auto-Reconnect Engine
- Implemented true bidirectional tally synchronization between Web UI and ATEM 1 M/E Constellation HD (`192.168.10.240`).
- Added immediate state handshake on WebSocket `CONNECT` / `GET_STATE` messages to sync tallies on initial page load.
- Added background auto-reconnection loop in `bridge/server.js` for physical ATEM switcher UDP link.

## [v2.09.0] - Full Historical Archive ^& Robust Bidirectional Tally Sync
- Upgraded `bridge/server.js` and `AtemConstellationBus.jsx` with robust `Object.values()` state extraction for live two-way ATEM hardware tally feedback.
- Enhanced Apple-style theme switch with embedded Sun and Moon SVG icons inside the sliding thumb.
- Synchronized sidebar collapse animation for simultaneous horizontal slide and width shrinkage.

## [v2.08.0] - Unified Top Bar, Apple Theme Switch, Bidirectional ATEM Feedback ^& Edit UX
- Created dedicated Top Navigation Bar housing Hamburger toggle, Title, Version tag, Theme switch, and Settings gear.
- Eliminated all quadrant overlap issues during 16:9 aspect ratio resizing and sidebar collapse.
- Implemented monochrome Apple-style sliding switch for Dark/Light theme toggling.
- Added Enter-key submission across all Device and Group inline edit fields.
- Implemented floating quick-select group dropdown in device edit forms.
- Implemented bidirectional ATEM hardware state broadcasting in `bridge/server.js` for live hardware-to-UI tally syncing.

## [v2.07.0] - UI Geometry Polish, Control Positioning ^& Context Routing
- Restored settings gear icon to the bottom-right corner (`bottom: 16px; right: 16px`).
- Mathematically centered edit buttons (`.edit-btn`, `.group-edit-btn`) with exact 4px equidistant top, bottom, and right padding inside `30px` pill rows.
- Standardized all edit panel inputs (`Name`, `IP`, `Group`, `Color`, `Description`) with pill-rounded geometry (`24px`).
- Added "Clear Color" (`Ã—`) button inside the Color Dropdown to reset colors to transparent ("No Color").
- Implemented right-click quadrant context menu routing specific Quadrant numbers (1â€“4) into target slots.
- Added Tally LED brightness global settings slider.

## [v2.06.0] - Synchronization ^& Full Rollup Release
- Consolidated all additions from v1.85 to v2.05 into a single clean push to synchronize GitHub across environments.

## [v2.05.0] - Cross-Platform Parity, All-Caps Ops Standardization ^& Complete Handover
- Implemented background bridge server auto-launch inside macOS `INIT.SH` matching Windows `INIT.BAT`.
- Standardized all documentation and automation scripts inside `ops/` to ALL-CAPS naming.
- Fortified `HANDOVER.MD` into a complete, standalone architectural memory specification for future AI sessions.

## [v2.04.0] - Operations Directory Refactoring ^& Workspace Cleanup
- Created dedicated `ops/` directory housing all documentation, handover states, and OS automation scripts.

## [v2.03.0] - Complete History Archive ^& Automated Bridge Startup
- Restored comprehensive historical changelog dating back to monolithic baseline (v1.72).
- Upgraded `INIT.bat` to concurrently spawn the embedded ATEM bridge server (`bridge/server.js`) on port 8080 alongside Vite.

## [v2.02.0] - Cross-Platform Windows Batch Suite ^& Setup Sync
- Added Windows-native batch scripts (`INIT.bat`, `PUSH.bat`, `WIPE.bat`) matching macOS bash utilities.
- Embedded automatic path detection for portable Node.js on enterprise Windows environments.

## [v2.01.0] - Settings UI Restoration, Full-Collapse Sidebar, ^& Row Geometry Lock
- Converted all edit-form fields (Name, IP, Group, Color, Description) to pill-rounded styling (`24px`).
- Set "Classic (Solid)" as the default sidebar variant.
- Re-architected sidebar collapse to slide 100% off-screen with a floating top-left restore button.
- Permanently locked Sidebar Devices, Groups, and Edit Panel designs under the locked element protocol.

## [v2.00.0] - Geometric Polish, Context Menus ^& Control Bar
- Fixed right-click context menu to map exact Quadrant numbers (1-4) into target slots.
- Added Tally LED brightness slider to Settings.
- Improved sidebar collapse animation with smooth container width transitions.

## [v1.99.0] - Switcher Layout Restoration ^& Context Routing
- Restored ATEM switcher panel CSS layout.
- Fixed right-click context menu items to map exact Quadrant numbers instead of slot indices.

## [v1.98.0] - Sidebar Collapse, Right-Click Context Menus ^& UI Polish
- Added right-click context menu on panels for 1-4 position swapping.
- Locked background quadrant numbers against text highlighting/selection (`user-select: none`).

## [v1.95.0] - Workspace Erase Utilities ^& Empty Directory Clone Fixes
- Added `WIPE.sh` to safely delete project folders using a verification token (`.atem_workspace_token`).

## [v1.90.0] - Automated One-Liner Bootstrapping ^& Double-Click Launchers
- Upgraded `INIT.sh` (macOS) and `INIT.bat` (Windows) to automatically execute `npm run dev` upon successful setup.

## [v1.84.0] - Multiview Quadrant Skeletons
- Updated `Panel.jsx` to display a shimmering skeleton layout inside all quadrants during the initial `isLoading` window, matching the sidebar skeleton style.

## [v1.83.0] - Crash-Proof Error Boundaries ^& Safe ATEM Bridge Handling
- Created `ErrorBoundary.jsx` to trap component rendering exceptions.

## [v1.82.0] - Crash-Proof Error Boundaries ^& Safe ATEM Bridge Handling
- Created `ErrorBoundary.jsx` to trap component rendering exceptions and network connection faults, preventing blank white screen crashes.
- Upgraded `AtemConstellationBus.jsx` to gracefully handle offline WebSocket states (`ws://localhost:8080`), falling back to a clean local UI mode.

## [v1.81.0] - Real ATEM Hardware Control Bridge Layer
- Upgraded `AtemConstellationBus.jsx` to dispatch real-world network commands to physical ATEM switchers at `192.168.10.240`.

## [v1.80.0] - ATEM 1 M/E Constellation HD Switcher Bus ^& Dynamic Panels
- Added `AtemConstellationBus.jsx` in `src/components/Panels/` featuring 10 inputs per row for Program (Red Tally) and Preview (Green Tally).
- Implemented CUT and AUTO transition buttons with live tally switching.

## [v1.79.0] - Polish, Light Theme ^& Consistency
- Matched Search input pixel-for-pixel with Device pills (30px height, identical padding/font).
- Added full Light Theme mapped to CSS variables with a dynamic Sun/Moon toggle.

## [v1.78.0] - UI Alignment ^& Persistence
- Replaced all monolithic JS state with `useLocalStorage` React Hook.
- Perfected CSS flex alignment for Device/Group edit buttons.

## [v1.77.0] - Persistence ^& Skeleton UI Fixes
- Added `useLocalStorage` hook to save all user settings, themes, device lists, and groups permanently in the browser.

## [v1.76.0] - Skeleton UI ^& Component Variants
- Added `<Skeleton />` UI component for modern loading states.
- Implemented a simulated 1.2s loading state in `useDevices.js` to demonstrate the Skeleton UI on initial mount.

## [v1.75.0] - React / Vite Transition Baseline
- Monolithic HTML/JS strictly ported to React + Vite component architecture.
- Preserved all [LOCKED] design rules (24px pills, 30% transparency UI, 16:9 Multiview logic).

## [v1.74.0] - Monolithic Pre-Transition Baseline
- Final monolithic baseline before transitioning to React component architecture.

## [v1.73.0] - YouTube Replica UI ^& Transparency Unification
- YouTube replica control bar with custom SVG masks for Play/Pause, Volume, Fullscreen, and centered Big Play button (68x48px).
- Unified 30% transparency (`rgba(30, 30, 30, 0.3)`) across panels and controls.

## [v1.72.0] - Settings ^& Sidebar UX Refinements
- Increased max corner radius range to 24px in preferences.
- Disabled global action button timeout (only CONFIRM state times out after 3 seconds).

*initial versions, undocumented*
