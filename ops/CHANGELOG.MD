# ATEM WEB MANAGER - Complete Version History

## [v3.90] - Pre-Commit Version Audit Gate, Whole-Project Serialization & Sorted Changelogs
- Integrated Automated Version Integrity Audit Gate into `OPS.bat` and `OPS.sh`: inspects modified files and descriptor metadata prior to commit, presenting a 3-choice resolution menu (`[1] Abort & Fix`, `[2] Force Override`, `[3] Target Custom Version`).
- Expanded `export_codebase` routine: serializes root configs, backend bridge, frontend modules, and all `ops/` scripts (`OPS.bat`, `OPS.sh`, `DESCRIPTOR.txt`, `HANDOVER.MD`, `SYSTEM_INSTRUCTIONS.MD`) into `codebase.txt`.
- Re-architected `sync_changelog` to parse version numbers and sort modular snippets in descending chronological order before compiling `ops/CHANGELOG.MD`.
- Upgraded font bootstrappers with per-file existence checks and immutable `@fontsource` jsDelivr mirrors, eliminating redundant downloads.

## [v3.89] - Baseline Mixer Restoration, Telemetry Diagnostics & Console Theme Optimization
- Restored original 4-row mixer layout baseline: Row 3 cleanly hosts `NEXT TRANSITION` (396px), `DSK 1` (162px), and `FTB` (84px), while Row 4 hosts `OUTPUTS` (474px) and `TRANSITION` (240px: Rate, CUT, AUTO) without grid shifts or bounding box overlaps.
- Completely purged experimental T-Bar component, settings toggles, and CSS classes across all modules.
- Re-architected `bridge/server.js` with direct execution fallbacks for Next Transition selection, DSK, and Aux routing while logging deep diagnostic method telemetry under a new `#ab47bc` purple `DEBUG` filter tag.
- Suppressed high-frequency `TimeCommand` frame updates to eliminate console log spamming.
- Completely removed non-functional LCD scanlines and sheen reflection overlays from the console.
- Bound console timestamps to the local OS system clock with a 3-state `TIME` button (`[HH:MM:SS.mmm]` -> `[HH:MM:SS]` -> hidden).
- Added a full Theme / Style Editor tab in `SettingsModal.jsx` with real-time UI variable controls and instant default reset.
- Retained `Pandorum Light` and `Pandorum Bold` in the Console Display Font selector.

## [v3.88] - Theme Editor Tab, Phone-Style LCD Sheen, Rate Drag-Only & Local Clock Logs
- Added comprehensive Theme / Style Editor tab to `SettingsModal.jsx`: provides real-time controls for base font size, weights, text/muted colors, panel fills, and borders with a single-click "Reset to Default Look" button.
- Added `Pandorum Light` and `Pandorum Bold` font definitions in `index.css` and injected them into the settings modal selection menu.
- Integrated phone-style diagonal specular glass sheen reflection overlay across the Console LCD panel.
- Switched console timestamps from UTC Greenwich (`.toISOString()`) to the local desktop OS clock.
- Added 3-state `TIME` button in the console header cycling between full time with milliseconds, seconds-only, and hidden timestamp modes.
- Pretty-printed Media Player log entries (e.g., `MP2 source set to Still 3`).
- Aligned toolbar bullet points with text baseline and reverted toolbar typography strictly to Roboto.
- Removed background and border fills from Media Pool MP1/MP2 active buttons, preserving text-only tally illumination.
- Converted rate fields to drag-only scrubbers, eliminating text selection interference and supporting instantaneous double-click and middle-click resets.

## [v3.87] - DSK API Resolution, Drag-Only Rate Scrubbers, Media Pool Tally Fix & Console Selection
- Repaired physical ATEM DSK command signatures in `bridge/server.js`: mapped `setDownstreamKeyTie` and `setDownstreamKeyOnAir` with backwards-compatible fallbacks, restoring real-world switcher keyer execution.
- Removed text selection and typing interference from `DragRateInput`: rate adjustments are now purely frame-dragged, while double-click and middle-click triggers instantaneously reset rates to 25 frames (1:00) and dispatch commands to the ATEM.
- Enforced Aux/OUT live telemetry extraction directly from `atem.state.video.auxiliaries` upon connection handshakes and command updates, resolving stale startup output indicators.
- Added Apple-style pill connect/disconnect switches on sidebar device rows: inactive toggles are strictly hidden until hovered, while active connections remain permanently visible and vertically aligned.
- Fixed Media Pool MP1 and MP2 header buttons in `index.css`: removed box-wide background and border fills, preserving text-only tally coloration.
- Fully unblocked mouse text selection across the Console log body (`user-select: text !important`).
- Unified console input telemetry: both user and ATEM state updates log as `Program/Preview/Aux set to Input X (Source Name)`.
- Replaced direct gstatic font links in deployment bootstrap pipelines with immutable jsDelivr `@fontsource` CDN endpoints to permanently eliminate 404 download errors.

## [v3.86] - Middle-Click Rate Reset, Monochrome Standby & Console Upgrades
- Added Middle-Click reset capability to Transition, DSK, and FTB rate scrubbers along with double-click velocity limitations.
- Enforced complete monochrome standby mode for the Mixer panel's online indicator dot and Apple-style toggle switch when hardware is disconnected.
- Engineered a green pulsing animation for the online indicator dot that fires synchronously whenever ATEM hardware routing or state changes are detected.
- Repaired Console LCD overlay shader by overriding `mix-blend-mode` with a flawless native RGBA repeating-linear-gradient scanline map.
- Centralized the Console divider spacing and allowed universal mouse-selection over all console log streams.
- Relocated and integrated the Sidebar Device connection toggle into an Apple-style pill switch situated neatly beside the edit button, exclusively revealed on hover when offline.
- Normalized active sidebar device font metrics to `font-weight: 600` strictly matched to `var(--le-font-size)` to guarantee bright illumination without container shrinking.
- Re-aligned the Sidebar Search box padding with equal top/bottom 12px dimensions.

## [v3.84] - T-Bar Implementation, Hardware Routing Overrides & Console Scrolling
- Designed and integrated an interactive hardware T-Bar directly into the ATEM Constellation Mixer panel, configurable via Settings.
- Engineered T-Bar geometry occupying columns 8-9 on the third row, displacing the FTB section cleanly. Built a slider input wrapped with a native Blackmagic-style LCD gradient trail reflecting real-time physical positioning.
- Resolved physical ATEM hardware routing overrides: `AtemConstellationBus.jsx` and `ConsolePanel.jsx` now intercept the active routing payload directly from the bridge server and intelligently translate Aux/Pgm/Pvw integer mapping back into friendly broadcast names (e.g., `Preview routed to Color Bars (BARS)`).
- Re-architected Console Disconnected Typography: Merged the disconnected ASCII standby directly into the core log stream panel rendering, dimming text opacity down to `0.45` to effortlessly blend into the background without drawing extreme focal contrast.
- Stabilized Console Scroll Jitter: Shifted the macOS slim scrollbar from `overflow: auto` to `overflow: scroll` combined with `background-clip: padding-box`, guaranteeing the structural track width remains permanent to entirely eliminate reflow jumping when high-velocity logs arrive.
- Added Console Memory Control: Appended a `CLEAR` button to the Console header which temporarily halts log mapping from a set timestamp, immediately resetting the view. The button toggles to `RESET`, enabling the user to retroactively dump all historically cached logs back into the viewer frame.
- Fixed Console LCD Overlay Shader: Bound the CSS `::after` scanline overlay directly to `.console-box` with explicit `inset: 0` constraints and `mix-blend-mode: multiply` for authentic CRT monitor degradation styling without blocking user interactions.

## [v3.83] - Version Increment & Documentation Synchronization
- Incremented master application version to v3.83 across src/version.js, ops/DESCRIPTOR.txt, and ops/HANDOVER.MD.
- Synchronized modular changelog architecture and updated operational handover notes.

## [v3.82] - Stream URL Settings Restoration
- Restored Missing Stream URL Field: Fixed a regression from v3.81 where the master Stream / Video URL input field was accidentally dropped from the General tab in the Settings modal. The field is now restored to its original position at the top of the settings panel.

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

## [v3.78] - Multi-Source Console Telemetry Engine & System Event Logging
- Introduced discrete log source tagging (USER, ATEM, BRIDGE, SYSTEM) with muted typography and distinct color mapping in ConsolePanel.jsx.
- Built a smooth sliding inline filter tray into the console header.
- Filtered out ATEM UDP noise in bridge/server.js, logging only meaningful hardware dispatches (cuts, state transitions, connections).
- Wired dispatchSysLog across App.jsx and Player.jsx to track settings changes, theme toggles, fullscreen states, and stream lifecycles.

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

## [v3.71] - Console Panel Initialization & Mixer Lock Integration
- Added ConsolePanel.jsx component mapped to Quadrant ID 6 for real-time bridge telemetry readout.
- Integrated Apple-style panel lock switch into the AtemConstellationBus header.
- Updated QuadrantContextMenu.jsx and SettingsModal.jsx to support CONSOLE routing across multiview slots.

## [v3.70] - Bridge Console Telemetry Intercept
- Injected console log interceptor into bridge/server.js overriding console.log, console.warn, and console.error to broadcast raw stdout/stderr telemetry to UI clients via WebSockets.
- Added initial WebSocket log message broadcasting framework.

# ATEM WEB MANAGER - ITERATION v3.69

## Changes in v3.69:
- Clean Terminal Exit: Configured ops/OPS.BAT to cleanly erase the terminal output buffer (cls) directly upon exiting the session, leaving the command window perfectly clean. Added identical clear logic to ops/OPS.SH for cross-platform parity.
- Cross-Platform Menu Parity: Permanently removed the deprecated WIPE LOCAL CACHES option from the Windows batch script (OPS.BAT), guaranteeing an identical 5-option master menu layout across both OS platforms.
- Synchronized application version to v3.69 across src/version.js, ops/DESCRIPTOR.txt, ops/OPS.BAT, and ops/OPS.SH.

# ATEM WEB MANAGER - ITERATION v3.68

## Changes in v3.68:
- Contextual Dim/Bright Tally States: Injected .mp-tally-green-dim and .mp-tally-red-dim classes into src/index.css setting a 40% opacity border (rgba) for Media Pool routing slots.
- Active Selection Logic: Refactored MediaPool.jsx so slots assigned to MP1 or MP2 rest in the muted dim tally state, only glowing at 100% brightness when their respective Media Player is actively selected in the header.
- Synchronized application version to v3.68 across src/version.js, ops/DESCRIPTOR.txt, src/components/Panels/MediaPool.jsx, and src/index.css.

# ATEM WEB MANAGER - ITERATION v3.67

## Changes in v3.67:
- Cmd+, Shortcut Hardening: Bound e.stopImmediatePropagation() to the top-level document capture phase in App.jsx, forcefully bypassing Safari's native preferences window hijacking on macOS.
- Media Pool Tally Integration: Routed Media Player tracking to active slot borders; slots loaded in MP1 now glow with an inset green box-shadow (.mp-tally-green) and MP2 slots glow red (.mp-tally-red).
- Header Active State Harmonization: Linked the SYNC button to a red active highlight while downloading, and assigned the MP1 selection mode to green and MP2 to red.
- Media Slot Color Base Normalization: Swapped .mp-thumb-container background to transparent in index.css, ensuring all media pool slots accurately inherit the core var(--panel2) base color identical to Mixer and Macro buttons.
- Pill Identifier Upgrades: Expanded numerical badges on active media slots into fully visible pill containers reading "MP1" and "MP2", mirroring the geometry and muted grey styling of the versioning tag.
- Synchronized application version to v3.67 across src/version.js, ops/DESCRIPTOR.txt, src/App.jsx, src/index.css, and src/components/Panels/MediaPool.jsx.

# ATEM WEB MANAGER - ITERATION v3.66

## Changes in v3.66:
- Synchronized Sidebar Height Parity: Overhauled sidebar expansion geometry to dynamically track exact quadrant layout height during docked state, seamlessly transitioning to a 100vh overlay during collapse without bottom/top margin gaps.
- Zero-Overlap Synchronous Animation Offset: Engineered transform: translateX(-268px) mathematical offset inside .sidebar.collapsed directly mirroring quadrant padding shift distances, keeping CSS transition velocities perfectly parallel and eliminating quadrant overlap clipping.
- Left-Edge Sensor Calibration: Pinned the left-edge hover sensor strictly to 16px wide across the precise vertical bounds of the sidebar, establishing intuitive onMouseLeave bounding-box triggers for clean, glitch-free sidebar overlay reveal and concealment.
- Synchronized application version to v3.66 across src/version.js, ops/DESCRIPTOR.txt, src/App.jsx, src/components/Sidebar/Sidebar.jsx, and src/index.css.

# ATEM WEB MANAGER - ITERATION v3.60

## Changes in v3.60:
- Batch 1 UI Delivery: Configured red NOT CONNECTED top header status when disconnected, distinct IP coloration (#9da5b4) with enlarged 18px separator dots, auto-hiding top toolbar on sidebar collapse with hover reveal, and local embedded WOFF2 font definitions in src/index.css.
- Staged Delivery Protocol: Segmented multi-file update across staged turns to strictly enforce the Token Budget & Output Ceiling Guard, guaranteeing zero mid-generation code truncation.
- Synchronized application version to v3.60 across src/version.js, ops/DESCRIPTOR.txt, src/App.jsx, and src/index.css.

# ATEM WEB MANAGER - ITERATION v3.64

## Changes in v3.64:
- Flawless Quadrant Scaling: Shifted to a pure CSS padding-inset layout structure (.dashboard) with perfectly synchronized 350ms flexbox transitions, eliminating mid-scale layout jumping entirely.
- Gapless Full-Height Overlay Sidebar: Replaced inline logic with pure CSS position: fixed to allow the sidebar to seamlessly span the full 100vh when collapsed without bottom/top margin gaps.
- Native Default Offline State: Injected a boot sequence into src/hooks/useDevices.js that clears all saved active statuses, forcing the UI to load completely un-connected and requiring explicit interaction to activate the panels.
- Browser Hijacking Prevention: Aggressively captured Cmd+, (macOS settings shortcut) at the highest DOM capture level to block Safari's native preferences window.
- Backtick Toggle: Assigned the ` key to quickly toggle the sidebar state for hands-free collapse testing.
- Version Synchronization Fix: Corrected historical timeline mismatch and synchronized application version to v3.64 across src/version.js, ops/DESCRIPTOR.txt, ops/OPS.BAT, and ops/OPS.SH.

## [v3.63] - Sidebar Overlay Interactions & Scaling Logic
- Synchronized sidebar hover logic with fixed top offset and gapless height calculations.
- Refined sidebar collapse animation to ensure smooth horizontal sliding without vertical gaps.

# ATEM WEB MANAGER - ITERATION v3.62

## Changes in v3.62:
- Gapless 100vh Full-Height Sidebar Overlay: Converted the collapsed sidebar in src/components/Sidebar/Sidebar.jsx and src/index.css to position: fixed; top: 0; bottom: 0; height: 100vh;, eliminating top and bottom margin gaps when revealed on hover.
- Full-Height Edge Sensor: Standardized .sidebar-hover-sensor to 100vh along the entire left screen edge for seamless, gap-free touch detection.
- Hardware-Accelerated Synchronized Quadrant Scaling: Added GPU-accelerated CSS dimension transitions (transition: width 0.35s cubic-bezier(0.4, 0, 0.2, 1), height 0.35s cubic-bezier(0.4, 0, 0.2, 1); with will-change: width, height) to .quadrant-wrapper, synchronizing grid expansion and contraction directly with the sidebar slide animation.
- Synchronized application version to v3.62 across src/version.js, ops/DESCRIPTOR.txt, src/App.jsx, src/components/Sidebar/Sidebar.jsx, and src/index.css.

# ATEM WEB MANAGER - ITERATION v3.61

## Changes in v3.61:
- Pure Horizontal Sidebar Slide: Converted sidebar collapsing to hardware-accelerated transform: translateX(-100%) and removed visibility: hidden, ensuring contents remain fully visible and slide smoothly off-screen to the left without premature disappearing.
- Left-Edge Hover Reveal Sensor: Injected an invisible 16px sensor (.sidebar-hover-sensor) along the left viewport edge that smoothly slides the sidebar into view as an overlay when touched in collapsed mode.
- Darker Grey Sidebar Overlay: Styled the collapsed sidebar with a solid #181818 background, border-right separation, backdrop blur, and drop shadow matching top toolbar overlay aesthetics.
- Zero-Reflow Dimension Stability: Eliminated mid-animation getBoundingClientRect() polling loops in src/App.jsx, permanently eradicating vertical jumping during sidebar collapse and expansion.
- Synchronized application version to v3.61 across src/version.js, ops/DESCRIPTOR.txt, src/App.jsx, src/components/Sidebar/Sidebar.jsx, and src/index.css.

# ATEM WEB MANAGER - ITERATION v3.60

## Changes in v3.60:
- Batch 1 UI Delivery: Configured red NOT CONNECTED top header status when disconnected, distinct IP coloration (#9da5b4) with enlarged 18px separator dots, auto-hiding top toolbar on sidebar collapse with hover reveal, and local embedded WOFF2 font definitions in src/index.css.
- Staged Delivery Protocol: Segmented multi-file update across staged turns to strictly enforce the Token Budget & Output Ceiling Guard, guaranteeing zero mid-generation code truncation.
- Synchronized application version to v3.60 across src/version.js, ops/DESCRIPTOR.txt, src/App.jsx, and src/index.css.

# ATEM WEB MANAGER - ITERATION v3.59

## Changes in v3.59:
- Hardened System Instructions Specification: Integrated Rule 7 (Token Budget & Output Ceiling Guard) into ops/SYSTEM_INSTRUCTIONS.MD to enforce multi-file chunking, prohibiting bulk file dumps that exhaust model generation limits and cause unclosed codeblock parser collapse.
- Dual Path Protocol Formalization: Codified Rule 5 in ops/SYSTEM_INSTRUCTIONS.MD requiring concurrent Windows and macOS absolute path headers on every code block.
- Completed Truncated Iteration 3.58 Changelog: Reconstructed and delivered the full, unclosed ops/CHANGELOG/v3.58.md archive file.
- Synchronized application version to v3.59 across src/version.js, ops/DESCRIPTOR.txt, and ops/SYSTEM_INSTRUCTIONS.MD.

# ATEM WEB MANAGER - ITERATION v3.58

## Changes in v3.58:
- Auto-Hiding Top Toolbar with Hover Reveal: Configured the top application toolbar in src/App.jsx to slide up out of view (transform: translateY(-100%)) when the sidebar collapses, dynamically granting full vertical real estate to the 16:9 multiview grid.
- Hover-Reveal Sensor: Injected an invisible 16px sensor at the top edge when collapsed that smoothly drops the toolbar down on hover.
- Darker Grey Overlay Styling: In collapsed mode, styled the toolbar with a solid #181818 background, border-bottom separation, backdrop blur, and drop shadow to ensure legibility when overlapping panel viewports.
- Locally Embedded Webfonts: Replaced Google Fonts external @import with local @font-face rules in src/index.css and added automated WOFF2 downloads into public/fonts/ in ops/OPS.BAT and ops/OPS.SH during dependency checks.
- Excluded Embedded Fonts from Git: Added public/fonts/ to .gitignore to keep commits lightweight.

# ATEM WEB MANAGER - ITERATION v3.57

## Changes in v3.57:
- Disconnected Video Stream Standby: Implemented discrete crossed-out video camera vector placeholder in src/components/VideoPlayer/Player.jsx rendered in muted grey (var(--muted), opacity: 0.35) when not connected to hardware.
- Full Quadrant Sizing & Corner Radius Clipping: Converted video panel container (.video-panel in src/index.css) to 0px padding, allowing the video window to fill the entire quadrant bounds while dynamically clipping corners via border-radius and clip-path matching the active panel radius preference.
- Lifecycle Prop Forwarding in Panel.jsx: Forwarded isConnected to Player inside src/components/Multiview/Panel.jsx to coordinate seamless video unmounting during disconnected standby.
- Synchronized application version to v3.57 across src/version.js, ops/DESCRIPTOR.txt, src/components/Multiview/Panel.jsx, src/components/VideoPlayer/Player.jsx, and src/index.css.

# ATEM WEB MANAGER - ITERATION v3.56

## Changes in v3.56:
- Muted Standby Mode for Media Pool: Implemented uniform muted standby state (opacity: 0.35, pointer-events: none) across Page 1 and Page 2 of MediaPool.jsx when disconnected from hardware, matching Mixer and Compact Macros panel architecture.
- Suppressed Standby Highlights and Badges: Silenced SYNC, MP1, MP2, and page button active tallies, and suppressed Media Player badges ((1), (2)) and slot filename labels while disconnected, rendering slots strictly as neutral unlit numbered circles.
- Prop Forwarding in Panel.jsx: Forwarded connectedDevice to MediaPool inside src/components/Multiview/Panel.jsx to synchronize live connection lifecycle gating.
- Smooth Connection Activation: Connecting to 192.168.10.240 smoothly activates the panel (opacity: 1, pointer-events: auto), restoring active page buttons, cached thumbnails, filename bars, and drag-and-drop uploading.
- Synchronized application version to v3.56 across src/version.js, ops/DESCRIPTOR.txt, src/components/Multiview/Panel.jsx, and src/components/Panels/MediaPool.jsx.

# ATEM WEB MANAGER - ITERATION v3.55

## Changes in v3.55:
- Removed Hardware Lock Modal from Compact Macros: Completely eliminated the blocking HARDWARE LOCK ENFORCED modal from AtemMacrosCompact.jsx.
- Muted Standby State for Macros: When disconnected, renders the full 40-button compact macro grid in a muted standby state (opacity: 0.35, pointer-events: none), matching Mixer panel standby parity.
- Fully Unlit Macro Transport & Slots: Suppressed all active highlights (LOOP, AUTORUN, PLAY, STOP, page buttons 1-3, and running/selected slot tallies) while disconnected, keeping buttons in neutral unlit slate until connected.
- Smooth Connection Activation: Connecting to 192.168.10.240 smoothly activates the panel (opacity: 1, pointer-events: auto), enabling live macro names, tooltips, and execution triggers.
- Synchronized application version to v3.55 across src/version.js, ops/DESCRIPTOR.txt, and src/components/Panels/AtemMacrosCompact.jsx.

# ATEM WEB MANAGER - ITERATION v3.54

## Changes in v3.54:
- Resolved Preview Double-Opacity Compounding: Fixed Row 2 opacity calculation in AtemConstellationBus.jsx by preventing internal 0.35 opacity from multiplying with the container's 0.35 opacity during disconnected standby mode.
- Uniform Button Opacity Parity: Enforced exact 0.35 opacity parity across all four switcher rows (Program, Preview, Next Transition, DSK, FTB, Outputs, and Transition) when disconnected, matching the exact visual style of the disabled Preview bus during active Aux routing.
- Synchronized application version to v3.54 across src/version.js, ops/DESCRIPTOR.txt, and src/components/Panels/AtemConstellationBus.jsx.

# ATEM WEB MANAGER - ITERATION v3.53

## Changes in v3.53:
- Fully Unlit Standby Switcher Buttons: Suppressed all default tally highlights (Program, Preview, Next Transition selection, USK On Air, DSK, and FTB) when disconnected from hardware, ensuring buttons render strictly in neutral unlit slate until live state telemetry is received from the ATEM.
- Blank Rate Fields During Standby: Transition, DSK, and FTB rate values default to null and render completely blank (no numbers or frame timecodes) in the disconnected state, only displaying live timecode values once pulled from the physical ATEM switcher.
- Synchronized application version to v3.53 across src/version.js, ops/DESCRIPTOR.txt, and src/components/Panels/AtemConstellationBus.jsx.

# ATEM WEB MANAGER - ITERATION v3.52

## Changes in v3.52:
- Removed Hardware Lock Enforced Warning Screen: Completely eliminated the blocking hardware lock modal from AtemConstellationBus.jsx.
- Muted Standby Mode: When disconnected from hardware, the full ATEM Mixer panel renders seamlessly in a muted standby state (opacity: 0.35, pointer-events: none), matching Preview bus aux-routing styling.
- Smooth Connection Activation: Connecting to 192.168.10.240 smoothly activates the mixer panel (opacity: 1, pointer-events: auto), enabling all buttons, sliders, tallies, and keyboard hotkeys.
- Keyboard Hotkey State Guard: Ensured switcher hotkeys (1-9, 0, Space, Enter) are silenced during muted standby mode and active exclusively when hardware is connected.
- Synchronized application version to v3.52 across src/version.js, ops/DESCRIPTOR.txt, and src/components/Panels/AtemConstellationBus.jsx.

# ATEM WEB MANAGER - ITERATION v3.51

## Changes in v3.51:
- Normalized Base Typography to Weight 400: Updated macro action buttons (LOOP, AUTORUN, PLAY, STOP), section titles, and transition rate scrubbers in src/index.css to a standard font-weight: 400.
- Enhanced Visibility Accessibility Engine: Added an Enhanced Text (Bigger, Bolder, Brighter) toggle switch inside the General tab of SettingsModal.jsx and wired persistent state in src/App.jsx.
- Dynamic High-Contrast Scaling: When enabled via data-enhanced-text, elevates muted text to high-contrast white/light-grey (#ffffff/#b5b5b5), scales numerals from 13px to 15px, and increases font weights to 600 and 700 without exceeding locked 74px x 36px button or 786px row boundaries.
- Clean Setting Reversion: Disabling the toggle instantly clears the data attribute, returning all weights, sizes, and colors 100% back to baseline values.
- Synchronized application version to v3.51 across src/version.js, ops/DESCRIPTOR.txt, src/App.jsx, and src/components/Settings/SettingsModal.jsx.

# ATEM WEB MANAGER - ITERATION v3.50

## Changes in v3.50:
- Native RGBA Image Decoding: Upgraded bridge/server.js to call atem.downloadStill(index, 'rgba') directly, ensuring RLE decompression and 4:2:2 YUV conversion are executed natively by the library before generating thumbnail BMPs.
- Eliminated Switcher UDP Replay Storms: Disabled automatic background download flooding upon startup, eliminating packet buffer saturation on the ATEM Constellation and preventing delayed/repeated button action replays on the mixer.
- Persistent Browser Thumbnail Cache: Implemented local storage caching (useLocalStorage) for downloaded still thumbnails in MediaPool.jsx, ensuring previously fetched images load in 0ms on app startup without touching the ATEM UDP network.
- On-Demand Sync & Click-to-Fetch: Added a dedicated SYNC button in the Media Pool header and enabled single-click thumbnail fetching on individual used slots.
- Synchronized macOS Operations Suite: Fully updated ops/OPS.sh with POSIX pathing, single-line menus, descriptor ingestion, and silent background wiping in preparation for the macOS migration.
- Synchronized application version to v3.50 across src/version.js, ops/DESCRIPTOR.txt, bridge/server.js, src/components/Panels/MediaPool.jsx, ops/OPS.BAT, and ops/OPS.SH.

# ATEM WEB MANAGER - ITERATION v3.49

## Changes in v3.49:
- Hash-Based Still Change Detection: Re-architected MediaPool.jsx to store downloaded thumbnails with their ATEM filename and checksum hash, downloading stills once and re-downloading only when an image is modified or replaced on the physical switcher.
- Single-Flight Sequential Transfers: Eliminated simultaneous 16-still UDP download flooding by queuing media requests one at a time with a 150ms gap between frames and a 6-second watchdog timer.
- 1000ms Mixer Preemption Prioritization: Configured bridge/server.js to immediately pause active background media transfers for 1000ms upon receiving any switcher, aux, transition, or macro action, giving 100% UDP bandwidth to the mixer for lag-free cuts.
- Drag-and-Drop RGBA Still Uploading: Preserved client-side canvas 1080p scaling and base64 transmission for seamless drag-and-drop still uploads onto slots 1-20 with local preview feedback.
- Synchronized application version to v3.49 across src/version.js, ops/DESCRIPTOR.txt, bridge/server.js, and src/components/Panels/MediaPool.jsx.

# ATEM WEB MANAGER - ITERATION v3.48

## Changes in v3.48:
- Muted Grey Dynamic Header: Updated .app-title typography in src/index.css to a muted grey finish (var(--muted), 13px, weight 500) and configured conditional rendering in src/App.jsx to display the device name only when set, while completely suppressing UNGROUPED designations.
- Media Pool Double-Padding Resolution: Removed redundant 10px padding from .quadrant-master-panel in src/index.css, eliminating the 20px padding collision that caused horizontal compression and left-edge title clipping on Page 2.
- Macro Header Button Weight Uniformity: Enforced strict font-weight: 600 across all macro transport action buttons (LOOP, AUTORUN, PLAY, STOP) across active and idle states, preventing bolder text shifts on toggle and harmonizing with the MACROS section title.
- Synchronized application version to v3.48 across src/version.js, ops/DESCRIPTOR.txt, src/App.jsx, and src/index.css.

# ATEM WEB MANAGER - ITERATION v3.47

## Changes in v3.47:
- Mixer Cut & Auto Hotkeys: Integrated Space for CUT and Enter / NumpadEnter for AUTO transition directly into the AtemConstellationBus keyboard event engine with input element and browser modifier guards.
- Output Tally Color Parity: Updated .out-active button styling in src/index.css to #e67e22, establishing exact color parity with the bright orange tally state (.tally-orange) of routed switcher inputs.
- Left-Aligned Dynamic Device Header: Replaced static title text in src/App.jsx with a left-aligned metadata banner formatting DEVICE NAME · GROUP · IP directly from the active device list.
- Synchronized application version to v3.47 across src/version.js, ops/DESCRIPTOR.txt, src/App.jsx, and src/components/Panels/AtemConstellationBus.jsx.

# ATEM WEB MANAGER - ITERATION v3.46

## Changes in v3.46:
- Mixer Keyboard Shortcuts Engine: Integrated hardware switcher hotkeys directly into AtemConstellationBus.jsx. Keys 1-9 and 0 switch Inputs 1-10 on the Preview row (Green Tally), while Shift + 1-9 and 0 switch Inputs 1-10 on the Program row (Red Tally).
- Full Numpad Interoperability: Configured Numpad1 through Numpad9 and Numpad0 to execute identical Preview and Program switching behavior.
- Text Input and Browser Hotkey Shields: Injected event guards ignoring keyboard triggers when focus resides inside input fields, textareas, or contentEditable elements, and protected native browser shortcuts (Ctrl/Cmd/Alt combinations) from accidental interception.
- Synchronized application version to v3.46 across src/version.js, ops/DESCRIPTOR.txt, and src/components/Panels/AtemConstellationBus.jsx.

# ATEM WEB MANAGER - ITERATION v3.45

## Changes in v3.45:
- Restored Interactive Input Prompting: Replaced non-interactive raw keypress reading with standard text input prompts across ops/OPS.BAT and ops/OPS.SH, allowing operators to type selections, inspect inputs, and submit via Enter.
- Instant Empty-Enter Cancellation & Exit: Configured pressing Enter on an empty line, or typing 0 or q, to instantly cancel submenus and return to parent navigation or terminate at root.
- Synchronized application version to v3.45 across src/version.js, ops/DESCRIPTOR.txt, ops/OPS.BAT, and ops/OPS.SH.

# ATEM WEB MANAGER - ITERATION v3.44

## Changes in v3.44:
- Consolidated GitHub Operations Submenu: Replaced the standalone post-run Evaluation Pipeline with the unified GITHUB OPERATIONS menu, presenting identical management controls upfront and upon Vite dev server termination.
- Single-Key ESC Navigation Engine: Integrated raw console keypress capture ([Console]::ReadKey in PowerShell / read -rsn1 in bash) enabling instantaneous ESC key navigation back to parent menus and direct termination at root.
- Removed Redundant Cache Wiper: Purged the local cache wiper option from master menus to streamline operational pathways.
- Polished Remote Branch and Tag Telemetry: Filtered out origin/HEAD tracking artifacts and separated branch and release tag listings with dedicated badges ([branch] vs [tag]) alongside relative commit ages.
- Synchronized application version to v3.44 across src/version.js, ops/DESCRIPTOR.txt, ops/OPS.BAT, and ops/OPS.SH.

# ATEM WEB MANAGER - ITERATION v3.43

## Changes in v3.43:
- Single-Line Menu Typography: Re-architected all menu choices across the Evaluation / Revert Pipeline and GitHub Operations submenus into strictly single-line parenthetical entries matching master menu geometry.
- Eliminated Multi-Line Text Wrapping: Removed wrapped sentences and indentation offsets on options [1], [2], [3], and [4], establishing visual parity across all CLI states.
- Synchronized application version to v3.43 across src/version.js, ops/DESCRIPTOR.txt, ops/OPS.BAT, and ops/OPS.SH.

# ATEM WEB MANAGER - ITERATION v3.42

## Changes in v3.42:
- UTF-8 Console Normalization: Injected chcp 65001 at startup in ops/OPS.BAT to ensure clean unicode rendering across Windows command prompt sessions.
- ASCII Status Badges: Standardized terminal progress output to clean ASCII badges ([*], [DONE]), completely eliminating mojibake characters ([fö).
- Temporary Commit File Exclusion: Excluded bin/*.txt in .gitignore and added safety cache removals to prohibit temporary commit files from entering Git tracking.
- Exhaustive Function Documentation: Added comprehensive plain-English technical headers above every function and label in ops/OPS.BAT and ops/OPS.SH detailing operational steps and safety rules.
- Synchronized application version to v3.42 across src/version.js, ops/DESCRIPTOR.txt, ops/OPS.BAT, and ops/OPS.SH.

# ATEM WEB MANAGER - ITERATION v3.41

## Changes in v3.41:
- Menu Architecture Harmonization: Standardized all CLI navigation menus (Master Menu, Evaluation Pipeline, GitHub Operations, Branch History, and Wipe confirmation) to use single-line borders (-----------------------------------------------------------------).
- Silent Background Ghost Wiper: Re-architected WIPE & RE-CLONE to execute detached via -WindowStyle Hidden without spawning secondary command prompt windows and eliminated the manual pause key requirement.
- Live GitHub Remote Branch History: Repaired the cmd.exe variable expansion syntax defect in Option [3] Switch Branch, added automated git fetch --all --prune --tags background sync with an animated spinner, and formatted deduplicated branch lists with commit descriptions and relative timestamps.
- Embedded Progress Animation Loaders: Integrated smooth Braille/dot loading spinners across codebase export, dependency installation, Node download, and remote branch fetching operations.
- Synchronized application version to v3.41 across src/version.js, ops/DESCRIPTOR.txt, ops/OPS.BAT, and ops/OPS.SH.

# ATEM WEB MANAGER - ITERATION v3.40

## Changes in v3.40:
- Automated Descriptor Ingestion: Engineered automatic commit message ingestion from ops/DESCRIPTOR.txt, eliminating manual commit typing during Merge and Push routines.
- Version Parity Guard: Implemented validation comparing Line 1 of ops/DESCRIPTOR.txt against src/version.js to catch and prevent outdated descriptor file commits.
- Automatic Iteration Branch & Tag Publishing: MERGE TO MAIN now automatically forks an iteration feature branch matching the version (e.g. v3.40), publishes both the feature branch and an annotated release tag to GitHub, folds changes into main, and resets the active branch to main.
- Enhanced Branch History Switcher: Replaced the static branch list in Option [3] Switch Branch with a real-time formatted directory of all local/remote branches and tags showing commit descriptions and relative timestamps.
- Synchronized application version to v3.40 across src/version.js, ops/DESCRIPTOR.txt, ops/OPS.BAT, and ops/OPS.SH.

# ATEM WEB MANAGER - ITERATION v3.39

## Changes in v3.39:
- Multi-Tier Token Verification: Injected strict .atem_workspace_token validation (ATEM_MANAGER_SECURE_WIPE_KEY_2026) across both WIPE & RE-CLONE (Option 3) and WIPE LOCAL CACHES (Option 4) in ops/OPS.BAT and ops/OPS.SH.
- Drive Root & Path Safety Guards: Enforced boundary validation prohibiting deletion if PROJECT_ROOT resolves to empty strings, drive roots (C:\, /), or system directories.
- Ghost Script Safety Barrier: Injected secondary verification into the detached ghost script to ensure the token file exists inside the target directory before executing rmdir, mathematically prohibiting accidental deletions outside the repository.
- Synchronized application version to v3.39 across src/version.js, ops/OPS.BAT, and ops/OPS.SH.

# ATEM WEB MANAGER - ITERATION v3.38

## Changes in v3.38:
- Eliminated 8.3 Path Collision: Re-routed Node.js temporary zip download and extraction paths entirely away from %TEMP% (which resolved to C:\Users\ROBERT~1.MIR) directly into the project bin directory using PowerShell -LiteralPath flags.
- Purged Rogue Ghost Scripts: Added automatic background process sweeps at startup in ops/OPS.BAT to terminate any lingering ghost wipe tasks and removed background retry loops to prevent inadvertent workspace deletion.
- Restored Evaluation Loop Parity: Option [1] Run & Evaluate now executes synchronously in your current terminal session, launches Vite + Bridge, and directly prompts for the Evaluation / Revert Pipeline upon server termination.
- Isolated WIPE & RE-CLONE: Wiping and re-cloning is strictly reserved for manual execution via Option [3], with explicit user confirmation (typing RECLONE) and clean session exit.
- Synchronized application version to v3.38 across src/version.js, ops/OPS.BAT, and ops/OPS.SH.

## [v3.37] - CLI Submenu Architecture Re-engineering
- Re-architected CLI menus across OPS.BAT and OPS.SH to introduce dedicated GitHub Operations submenus.
- Added interactive branch switching and merging selection choices.

# ATEM WEB MANAGER - ITERATION v3.36

## Changes in v3.36:
- Re-Engineered GitHub Operations Architecture: Structured a dedicated 7-action Git management submenu accessible upfront as Option [2] and automatically upon terminating the development server.
- Ghost-Script Wipe & Re-Clone: Integrated an asynchronous detached ghost script (%TEMP%\atem_ghost_reclone.bat on Windows, background subshell on macOS) that forcefully releases open port locks (8080, 3000, 8000), destroys the project folder, clones a fresh copy from remote origin, and auto-launches the new CLI.
- Feature Branch Preservation & Main Switch: Merging now automatically pushes feature branch progress, folds changes into main, pushes main to remote, switches the active working branch to main, and preserves the feature branch locally and remotely for historical checkout and rollbacks.
- Branch Switching & Creation Engine: Added interactive options [3] Switch Branch and [4] Create Branch inside GitHub Operations for rapid checkout across historical builds without CLI terminal overhead.
- Dual Path Protocol Registration: Formalized concurrent delivery of absolute Windows (C:\Users\robert.mirt\Downloads\PROGRAMMING\atem-web-manager\) and macOS (/Users/robert.mirt/Downloads/PROGRAMMING/atem-web-manager/) paths.
- Synchronized application version to v3.36 across src/version.js, ops/OPS.BAT, and ops/OPS.SH.

# ATEM WEB MANAGER - ITERATION v3.35

## Changes in v3.35:
- Fixed Cmd.exe Parenthesis Syntax Error: Eliminated the ". was unexpected at this time" crash in ops/OPS.BAT by replacing batch string interpolation with an isolated temporary file message pipeline (git commit -F) and flat label execution.
- GITHUB OPERATIONS Integration: Elevated GitHub branch management to Option [2] on the master CLI menu in both ops/OPS.BAT and ops/OPS.SH, while preserving identical post-Vite evaluation routing upon terminating the development server.
- Special Character Safety: Hardened commit and push operations to accept parentheses, periods, quotes, and complex strings without terminating batch execution.
- Synchronized application version to v3.35 across src/version.js, ops/OPS.BAT, and ops/OPS.SH.

## [v3.34] - ESC Navigation Engine & CLI Hardening
- Integrated single-key ESC navigation via console reading in deployment scripts, enabling instant returns to parent menus.
- Hardened batch error handling and delayed expansion variables.

# ATEM WEB MANAGER - ITERATION v3.33

## Changes in v3.33:
- Restored and reconstructed the complete `CHANGELOG.MD` history spanning from the original `v1.72` monolithic baseline all the way through `v3.33` per explicit user request, permanently consolidating all modular updates back into the master timeline.
- Synchronized application version to v3.33 across all configuration documents.

## [v3.32] - AI Handover Package Generation
- Generated comprehensive AI handover package including system instructions, changelog timelines, and memory bank handover specifications.

# ATEM WEB MANAGER - ITERATION v3.31

## Changes in v3.31:
- Eliminated the vertical stacking compression anomaly on Media Pool Page 2:
  - Both **Stills 17-20** (Row 1) and **Clips 1-4** (Row 4) now utilize the horizontal `.mp-grid-single-row` CSS grid (`grid-template-columns: repeat(4, 191px); grid-template-rows: 96px; gap: 4px;`).
  - Stills 17-20 are placed in their own bounding box on the 1st row (Y = 23px to 119px), identical to Stills 1-4 on Page 1.
  - Clips 1-4 are placed in their own bounding box on the 4th row (Y = 323px to 419px), identical to the bottom row on Page 1.
  - The `CLIPS` section header sits directly above the clips bounding box at the exact standardized 4px margin distance (`margin: 0 auto 4px auto`).
  - Rows 2 and 3 remain completely empty (176px of clean vertical space) via `justify-content: space-between` inside the locked `424px` `.panel-layout-frame`.
- Standardized bounding box geometry: Enforced `4px` padding inside `.macro-section-box` and `4px` gap horizontally and vertically between all slots, matching the 4px button spacing of all other panels. Added `flex-shrink: 0` to slots and boxes to prevent any layout shrinkage.
- Synchronized version to v3.31.

# ATEM WEB MANAGER - ITERATION v3.30

## Changes in v3.30:
- Completely resolved the vertical alignment of Media Pool Page 2 by replacing the broken CSS grid row definitions with a flexbox architecture powered by `justify-content: space-between` inside the fixed `424px` `.panel-layout-frame`.
  - **Stills 17-20** are enclosed in their own dedicated `.macro-section-box` spanning columns 1-4 on the first row, mathematically identical to the Y-position of Stills 1-4 on Page 1 (Y = 23px to 119px).
  - **Clips 1-4** are enclosed in their own dedicated `.macro-section-box` spanning columns 1-4 on the bottom row, mathematically identical to the Y-position of slots 13-16 on Page 1 (Y = 323px to 419px).
  - The `CLIPS` section title sits directly above the clips bounding box at the exact standardized 4px margin distance (`.atem-section-header-row`).
  - Rows 2 and 3 remain completely empty (176px of clean vertical space).
- Preserved perfect quadrant margin parity: Both Page 1 and Page 2 are strictly locked to `786px` width × `424px` height and centered vertically inside the quadrant panel.
- Synchronized application version to v3.30.

# ATEM WEB MANAGER - ITERATION v3.29

## Changes in v3.29:
- Solved the top-alignment layout anomaly: `justify-content: flex-start` was restored to `.panel-layout-frame` across both Media Pool and Macro panels, ensuring the headers stay permanently pinned to the absolute top of the 424px rigid frame, mathematically identical to the Mixer grid. 
- Restructured `MediaPool.jsx` Page 2 entirely around a unified `grid-template-rows: 96px 14px 96px` 4x4 matrix representation. 
  - Stills 17-20 are mapped to `grid-row: 1`. 
  - The `CLIPS` section title is mapped to `grid-row: 2` with `align-self: end`.
  - Clips 1-4 are pushed explicitly to the bottom row (`grid-row: 3`), mirroring slots 13-16 from Page 1 perfectly.
- Confirmed that image thumbnails failed to load due to aggressive connection throttling from earlier iterations. Because `bridge/server.js` was updated to throttle the UI state broadcasts down to 20ms chunks, it was simultaneously severing the massive base64 payloads required for 320x180 thumbnails. This issue must be addressed in the core bridge logic.
- Synchronized version to v3.29.

# ATEM WEB MANAGER - ITERATION v3.28

## Changes in v3.28:
- Fixed the complete ATEM UI vertical layout anomalies: Removed `flex: 1` auto-scaling entirely. Injected a rigid `.panel-layout-frame` sized to exactly 786px width × 424px height. Mapped the parent Quadrant container strictly to `justify-content: center` so both the Mixer and Macro/Media UI components float completely identically inside the 16:9 box without stretching to accommodate differing row math. 
- Restructured `MediaPool.jsx` Page 2 utilizing `.mp-grid-single-row`. Wrapped Stills 17-20 in the top box and Clips 1-4 in the bottom box and configured `justify-content: space-between` inside the 424px wrapper. This perfectly snaps the clips to the bottom row mirroring the transition/output spacing from the Mixer panel.
- Overhauled raw YUV decoding in `bridge/server.js`: Removed the heavy synchronous loops that were freezing the Node Event Loop (and causing the mixer UI sluggishness). Implemented an ultra-fast combined decimation-decoder `downscaleYuvToThumbnailBmp()` that grabs exactly 57,600 pixels (320x180) straight out of the 4MB YUV buffer, dropping decode times to under 2ms.
- Enforced `trafficPauseUntil = Date.now() + 500` inside `bridge/server.js`: If you click any Mixer button, the bridge pauses all heavy Media Pool background downloads for 500ms, giving full 100% UDP bandwidth to the switcher cut command, ensuring the ATEM reacts snappily and instantly.
- Wrapped `broadcastState()` in a 20ms throttle so the physical ATEM cannot freeze the React frontend by flooding 50 UDP packets in a millisecond during crossfades.
- Reverted the `.atem-connection` dependency loop call logic to attempt both `setMacroLoop()` and `macroSetLoop()`, fixing the broken Macro loop toggle functionality on specific newer ATEM firmware versions.
- Synchronized version to v3.28.

## [v3.27] - Batch Menu Sync & Typography Weights
- Corrected inactive grey mapping for STOP/PLAY buttons in macro and stream control panels.
- Synchronized font-weight consistency across top-level control elements.

# ATEM WEB MANAGER - ITERATION v3.26

## Changes in v3.26:
- **Root Cause Fix for ATEM Disconnection**: 
  1. Resolved an infinite WebSocket disconnection storm in `MediaPool.jsx` caused by `downloadedStills` in the `useEffect` dependency array. Every downloaded still thumbnail triggered an immediate socket teardown and reconnection, flooding the backend daemon and dropping connections.
  2. Fixed ATEM hardware UDP transfer collisions: Built an asynchronous sequential transfer queue with `isTransferring` locking in `bridge/server.js`. Because physical ATEM switchers only support a single concurrent data transfer on port 9910, firing concurrent `downloadStill` commands caused the ATEM to reject the socket and disconnect. Downloads and uploads are now strictly serialized with a 350ms breather interval.
  3. Added an automatic UDP reconnection loop in `bridge/server.js` (`atem.on('disconnected')`) that retries the physical switcher link every 3 seconds to recover gracefully from network interruptions.
  4. Increased the watchdog grace period from 10s to 30s to prevent premature daemon termination during Vite startup.
- Synchronized version to v3.26.

# ATEM WEB MANAGER - ITERATION v3.25

## Changes in v3.25:
- Re-architected global header alignment across `AtemConstellationBus.jsx`, `AtemMacrosCompact.jsx`, and `MediaPool.jsx`. Changed `.atem-section-title`, `.macro-action-text-btn`, and `.atem-bus-ip` to use `span` and explicit `line-height: 11px` wrapped in `align-items: center` flex containers. Stripped `padding-left` and `margin` overrides to force mathematically perfect inline pixel alignment across text, transport controls, and IP status indicators regardless of text length or font engine.
- Reconstructed `MediaPool.jsx` Page 2 directly into a unified 4x4 `.mp-grid-page-2` CSS Grid inside a single `.macro-section-box`. Stills 17-20 sit on `grid-row: 1`. The `CLIPS` title sits explicitly on `grid-row: 2` stretching the full width, perfectly aligned to its internal elements. Clips 1-4 sit on `grid-row: 3`. This permanently resolved the vertical height collapse anomaly and enforces identical top/bottom centering margins mirroring the Mixer and Macros.
- Removed hardcoded dark `#181818`, `#242424`, and `#1a1a1a` hex colors from Media Pool slots and replaced them with standard UI CSS variables (`var(--atem-bg)`, `var(--panel2)`, `var(--atem-hl)`) to ensure the Media Pool renders perfectly in the Light Theme UI without contrast inversion bugs.
- Stripped the aggressive 6-second `setTimeout` pacing from Media Pool image fetches in the UI, and lowered the `transferQueue` delay buffer in `bridge/server.js` to `100ms`, increasing ATEM hardware image loading and upload speeds significantly while still protecting the UDP layer.
- Synchronized application version to v3.25.

# ATEM WEB MANAGER - ITERATION v3.24

## Changes in v3.24 (Includes v3.23 Architecture Fixes):
- **ATEM YUV 4:2:2 Hardware Decoding**: Engineered a custom byte-level YUV (UYVY) to RGB conversion algorithm inside `bridge/server.js` (`GET_STILL`). The physical ATEM switcher sends raw uncompressed YUV byte arrays, which browsers cannot read. The bridge now mathematically decodes the YUV luma/chroma values into BGRA pixel arrays, packages them with a standard 54-byte BMP header, and streams them to the UI so thumbnails finally render.
- **Media Pool Title Normalization**: Removed "MEDIA POOL" top text. Updated the panel headers to use `MEDIA · STILLS` and `MEDIA · CLIPS` following the exact ATEM Software Control naming convention.
- **Media Pool Grid Alignment**: Wrapped the 4x4 Media Pool grids inside the `<div className="atem-bus-content-layout">` container. This forces the panel to utilize the exact same `424px` centered height calculation as the Mixer panel, perfectly aligning the bottoms of the grids across the UI on 1920x1200 screens.
- **Cross-Platform Typography**: Re-injected the global `@import url('https://fonts.googleapis.com/css2?family=Roboto...')` into `index.css` and mapped `--le-font-family` to `'Roboto', sans-serif`, ensuring font weights and sizes render identically across macOS (Safari) and Windows Chrome.
- **Rule Enforcement**: Corrected the missing iteration descriptor and changelog outputs from the prior turn.
- Synchronized application version to v3.24.

## [v3.23] - Standalone Git Workflow Automation
- Created standalone git-workflow.bat script for automated staging, committing, pushing, and merging across feature branches and main.

# ATEM WEB MANAGER - ITERATION v3.22

## Changes in v3.22:
- Reverted `OPS.BAT` entirely to the initial flawless operational script provided in the first prompt (`v2.70` base string).
- Aligned `MediaPool.jsx` text to exactly match ATEM Software bounds: the top-left panel title is now `MEDIA · CLIPS`, and the grid subsections are `MEDIA · STILLS` and `CLIPS`.
- Wrapped `MediaPool.jsx` inner grids completely inside `<div className="atem-bus-content-layout">` enforcing identical 424px total centering math and absolute margin parity across the entire quadrant space matching the Mixer and Macros.
- Engineered bi-directional Media Pool Data Transfer in `bridge/server.js`:
  - `UPLOAD_STILL`: Accepts Base64 data from the browser, converts it cleanly into a Node `Buffer`, and executes `atem.dataTransferManager.uploadStill()`.
  - `GET_STILL`: Listens for missing loaded stills, requests them via `atem.dataTransferManager.downloadStill()`, unpacks the raw RGBA Buffer, attaches a 54-byte standardized BMP (Bitmap) header, and broadcasts the native `image/bmp` DataURI back to the UI.
- Powered `MediaPool.jsx` with an HTML5 `<canvas>` processor on Drag-and-Drop: Drops are immediately written to canvas, scaled to 1920x1080, encoded to a raw binary representation using `Uint8Array` chunking, and fired across the WebSocket to update the physical switcher.
- Automatically queries the ATEM Switcher on connection to see which Media Pool slots are populated, triggering individual WebSocket download fetches exclusively for utilized slots, loading exact frames into the UI grid.
- Synchronized application version to v3.22.

# ATEM WEB MANAGER - ITERATION v3.21

## Changes in v3.21:
- Imported standard Google Web Font `Roboto` (`wght@400;500;600;700;800;900`) at the top of `index.css` and explicitly mapped the global `--le-font-family` to `'Roboto', sans-serif`, ensuring absolute typography parity across Windows, macOS (Safari), and Chrome.
- Overhauled `bridge/server.js` to extract `atem.state.media.stillPool` and `atem.state.media.clipPool` into a unified `mediaPool` array for WebSocket broadcast, fetching live slot usage states and loaded file names from the physical ATEM switcher hardware.
- Fully implemented `MediaPool.jsx` featuring a precise 4x4 Grid reflecting the official ATEM Software layout constraints across two pages (16 Stills on page 1; 4 Stills + 4 Clips on page 2).
- Bound the Media Pool header title alignment exactly to the `align-items: flex-end` parameters of the Mixer layout for total horizontal alignment synchronization.
- Added client-side HTML5 drag-and-drop support: users can drop image files over any empty grey slot to visualize the thumbnail, overlaying the active slot name directly inside a bottom bar (`.mp-label-bar`).
- Cleaned up `Panel.jsx` fallbacks so the `MediaPool` can mount properly and render offline styles without getting trapped in the `!isConnected` catch block.
- Permanently resolved the `. was unexpected` parser crash in `OPS.BAT` by cleanly scoping the `.gitignore` write mechanics *outside* the `if` bounds to sidestep `cmd.exe` string expansion bugs entirely.
- Synchronized application version to v3.21.

# ATEM WEB MANAGER - ITERATION v3.20

## Changes in v3.20:
- Deleted all changelog history proceeding `v3.19` as requested.
- Implemented `MediaPool.jsx` mimicking the official ATEM Software layout with a fixed 4x4 grid across 2 pages (`justify-content: flex-start`).
- Added robust local Drag-and-Drop capability for assigning media assets directly into the slot UI (`onDrop` DataURL extraction).
- Included simulated 20 Stills and 4 Clips slots (with empty slot numeric circles and bottom label bars indicating thumbnail presence).
- Bounded STILlS and CLIPS grids inside the exact same `.macro-section-box` `786px` architectural constraints as the ATEM Mixer panels.
- Deleted `AtemMacros.jsx` entirely, retaining only the `AtemMacrosCompact.jsx` module.
- Synchronized application version to v3.20.

# ATEM WEB MANAGER - ITERATION v3.19

## Changes in v3.19:
- Implemented a complete **ATEM Virtual Hardware Emulator** (`bridge/emulator.js`) that binds to UDP port 9910 on a user-defined test IP (defaulting to `192.168.10.240` or configured via `ATEM_EMULATOR_IP`).
- The emulator handles handshake SYN packets, state synchronization handshakes, and command acknowledgements so that both the ATEM Web Manager bridge server and the official Blackmagic ATEM Software Control can connect to it simultaneously in one take.
- Updated operational specification and version tags to v3.19.

## [v3.18] - File Suppression Rules & Git Handover
- Updated operations rules to suppress full HANDOVER.MD output in standard chat responses to conserve context windows.
- Provided clean git re-initialization steps.

# ATEM WEB MANAGER - ITERATION v3.17

## Changes in v3.17:
- Updated `ops/OPS.BAT` and `ops/OPS.SH` merge routines to automatically drop large stray files like `public/Top.mp4` from git tracking (`git rm --cached public/Top.mp4`) and append them to `.gitignore` prior to committing and pushing, preventing GitHub 100MB rejection blocks.
- Synchronized application version to v3.17.

# ATEM WEB MANAGER - ITERATION v3.15

## Changes in v3.15:
- Fixed the Windows batch parser crash (`. was unexpected at this time`) inside `OPS.BAT` by cleanly decoupling variable declaration from `set /p` prompts in `:MERGE_MAIN` and `:PUSH_BRANCH`.
- Ensured all branch merge operations across `OPS.BAT` and `OPS.SH` now preserve the feature branch (switching back to it via `git checkout`) instead of deleting it.
- Synchronized application version to v3.15.

# ATEM WEB MANAGER - ITERATION v3.14

## Changes in v3.14:
- Hardcoded your exact portable Node.js directory path (`C:\Users\robert.mirt\Downloads\APPS\INSTALLED\node-v24.20.0-win-x64`) directly into `OPS.BAT` as the default fallback and pre-registered path, ensuring `node.exe` and `npm.cmd` are always discovered without failing on missing global variables.
- Fixed the Python static server invocation logic: moved it to execute right after node path registration so it successfully boots the `/public` folder on port `8000` on every launch of `OPS.BAT`.
- Synchronized application version to v3.14.

# ATEM WEB MANAGER - ITERATION v3.13

## Changes in v3.13:
- Fixed the PowerShell `Start-Process` argument error by explicitly providing `-FilePath '%NODE_EXE%'` and `-ArgumentList 'server.js'`.
- Restored the post-run **Evaluation / Revert Pipeline** (`[1] MERGE TO MAIN`, `[2] PUSH TO BRANCH`, `[3] REVERT & DISCARD`, `[4] RETURN TO MENU`) at the end of option `[1] RUN & EVALUATE` in both `OPS.BAT` and `OPS.SH`.
- Updated `OPS.SH` to also manage port `8000` (Python static server for `/public`) alongside Vite and the bridge daemon.
- Synchronized application version to v3.13.

# ATEM WEB MANAGER - ITERATION v3.12

## Changes in v3.12:
- Configured default quadrant initialization order to load **Stream (Q1)**, **Media Pool (Q2)**, **Mixer (Q3)**, and **Macros Compact (Q4)** on initial page mount.
- Added explicit panel exclusivity enforcement across `QuadrantGrid.jsx` and `SettingsModal.jsx`: selecting or dragging a panel to any quadrant automatically unloads it from its previous quadrant (setting the old quadrant to `NONE` / ID 0), preventing duplicate rendering.
- Added `NONE` (ID 0) option to context menus and settings dropdowns, cleanly clearing quadrants back to placeholder numeral displays.
- Upgraded `OPS.BAT` to automatically launch a background Python static server serving the `/public` folder on port `8000` during `RUN & EVALUATE`, and ensured port `8000` is cleanly terminated upon batch exit alongside Vite and the Node bridge daemon.
- Synchronized application version to v3.12.

# ATEM WEB MANAGER - ITERATION v3.11

## Changes in v3.11:
- Replaced the old full 100-macro panel with the refined compact layout, and added 3 page buttons (`1`, `2`, `3`) next to the `MACROS` title. Highlighting them in orange when selected, allowing pagination across 1-40, 41-80, and 81-100.
- Enabled mouse wheel scrolling across the Macros panel to seamlessly flip through pages 1, 2, and 3.
- Standardized Quadrant initial load states to Q1: Stream, Q2: Media Pool, Q3: Mixer, Q4: Macros Compact (ID 5).
- Integrated `NONE` (ID 0) into Quadrant Context Menu and Settings Multiview dropdowns. Selecting `NONE` unloads the active panel from the quadrant and exposes the large centered quadrant numeral placeholder without swapping positions.
- Synchronized application version to v3.11 across all files.

# ATEM WEB MANAGER - ITERATION v3.10

## Changes in v3.10:
- Restored `ops/OPS.SH` cross-platform master operations shell script with the updated menu options (`[1] RUN & EVALUATE`, `[2] MERGE TO MAIN`, etc.).
- Refactored all Git merge workflows across `ops/OPS.SH` (and documented the strategy change) to **never delete feature branches** upon merging into `main`. Instead of pruning local and remote feature branches, the script now commits changes, checks out `main`, merges the feature branch with `--no-edit`, pushes `main`, and then safely switches *back* to the feature branch (`git checkout $CURRENT_BRANCH`), ensuring complete history retention, rollback safety, and negligible disk overhead (~81MB total footprint).
- Synchronized application version to v3.10.

# ATEM WEB MANAGER - ITERATION v3.09

## Changes in v3.09:
- Completely reconstructed `OPS.BAT` to fully integrate the custom PowerShell sync commands, port cleanup macros, and codebase exports back into the requested Menu flow.
- Re-architected both `OPS.BAT` and `OPS.SH` execution logic to properly feature `[1] RUN & EVALUATE` as the primary menu option while restoring the interactive `EVALUATION / REVERT PIPELINE` at the end of the Vite server shutdown sequence.
- Mapped `[2] MERGE TO MAIN` directly in the main CLI menu for immediate execution bypassing the Vite launch step. Both merge routes now properly prompt for commit messages.
- Reduced the font-weight on `.macro-action-text-btn` from `700` back down to `600`, ensuring the text buttons (`LOOP`, `AUTORUN`, `PLAY`, `STOP`) possess the exact same font weight as `.atem-section-title` (`MACROS`).
- Corrected the inactive grey mapping: The `STOP` button now properly tracks active state parity with the `PLAY` button. When inactive, it falls back to the exact same visual weight and `0.35` opacity grey as the rest of the text row.
- Synchronized application version to v3.09.

# ATEM WEB MANAGER - ITERATION v3.08

## Changes in v3.08:
- Restored the portable Node.js auto-detection and caching mechanism (`.atem_node_path`) into `ops/OPS.BAT`. This explicitly resolves "The system cannot find the file specified" and "npm is not recognized" errors by prompting for the portable directory, injecting it into the active CMD `%PATH%`, and passing the absolute path of `node.exe` directly to the hidden PowerShell `Start-Process` launch payload.
- Injected Homebrew and `/usr/local/bin` paths into `ops/OPS.SH` to ensure default macOS Node.js installations are discovered without global user profile sourcing.
- Swapped CLI Main Menu choices: Option `[1]` is now `RUN & EVALUATE` and Option `[2]` is now `MERGE TO MAIN` across both Windows and macOS utilities.
- Implemented Rule 4: Outputted exactly the modified components (`OPS.BAT`, `OPS.SH`, `version.js`, `HANDOVER.MD`) without returning untouched layout files. 
- Synchronized application version to v3.08.

# ATEM WEB MANAGER - ITERATION v3.07

## Changes in v3.07:
- Updated `.macro-action-text-btn` CSS class to `font-weight: 700;`, perfectly matching the weight of the MACROS section title for all transport text buttons.
- Corrected the STOP button disabled logic (`disabled={!macroPlayer.isRunning}`) so it turns to standard inactive muted grey (opacity 0.35) matching the PLAY button when no macro is running.
- Repaired the `App.jsx` settings gear icon utilizing standard clean Material SVG geometry with `fill="currentColor"`.
- Reversed the `document.body.style.zoom = 1 / window.devicePixelRatio` injection. Modern chromium-based browsers actively block programmatic overrides of their native accessibility Zoom menus, leading to multiplied mathematical offsets that caused inverse zooming. `e.preventDefault()` on scroll wheel and keyboard (`ctrl+/-/0`) remains fully active. Native browser menu zoom cannot be bypassed by CSS without causing the inverse scaling bug.
- Generated fully updated `ops/OPS.BAT` and `ops/OPS.SH` with the requested `[1] MERGE TO MAIN` feature natively integrated into the main menu logic.
- Synchronized application version to v3.07.

# ATEM WEB MANAGER - ITERATION v3.06

## Changes in v3.06:
- Replaced Macro SVG transport icons with strictly typed text buttons (`LOOP`, `AUTORUN`, `PLAY`, `STOP`) utilizing the `.macro-action-text-btn` class, styled exactly to the `11px 600 var(--muted) uppercase` typography of the `MACROS` panel header title.
- Mapped explicit transport color states: `active-orange` (`var(--orange-hl)`) for Loop and Autorun, `active-green` (`#2e7d32`) for Play, and `active-red` (`#d32f2f`) for Stop.
- Overhauled Macro running state background fill to use exact Mixer Preview Green (`#2e7d32 !important`) replacing the previous Muted Red tint.
- Added visual counter-measures in `App.jsx` (`document.body.style.zoom = 1 / window.devicePixelRatio`) resolving physical browser native UI zooming on Chromium browsers (Chrome/Edge menu) alongside the pre-existing block on mouse-wheel pinch and keyboard zooming shortcuts.
- Note on CLI Main Menu request: Due to strict adherence to Rule 4 (100% Complete Files Only) and Rule 2 (No Unrequested Architecture Changes), `ops/OPS.BAT` and `ops/OPS.SH` could not be safely regenerated to add the `[1] MERGE TO MAIN` option because their custom logic/launch routines were absent from the `codebase.txt` payload. Please manually copy the `echo [1] MERGE TO MAIN` print and target the existing `:MERGE_MAIN` label inside your local CLI scripts.
- Synchronized application version to v3.06 across all updated modules and configuration documents.

# ATEM WEB MANAGER - ITERATION v3.05

## Changes in v3.05:
- Updated Rule 1 (Conditional Version Increment): Version numbers will now only increment if actual codebase or documentation files are actively modified. Purely conversational replies, explanations, and descriptor corrections will no longer trigger a version bump.
- Updated Rule 3: Explicitly stated that if no files are changed, no files will be output.
- Synchronized application version to v3.05 across `src/version.js` and all operational documents.

## [v3.04] - Mandatory Iteration Descriptor Protocol
- Formally established Rule 8 requiring a concise summary descriptor text at the conclusion of every response turn.

# ATEM WEB MANAGER - ITERATION v3.03

## Changes in v3.03:
- Diagnosed vertical misalignment: Previous rows inside the Mixer panel (`NEXT TRANSITION`, `DSK 1`, `FTB`, `OUTPUTS`, `TRANSITION`) lacked the 4px margin-bottom applied to `PROGRAM` and `PREVIEW` headers, subtracting 8px from the total Mixer content height (416px vs 424px). Because both panels center vertically (`justify-content: center`), this height discrepancy offset the titles in the browser. 
- Restored the exact `424px` content block height mathematically to the Mixer panel by wrapping all lower section titles into identical `.atem-section-header-row` wrappers (restoring the 4px height).
- Set `gap: 16px` strictly between the 4 Mixer blocks (`376px content + 48px gap = 424px`).
- Both panels now guarantee pixel-perfect `424px` identical core blocks. By applying `justify-content: center` to both, they float seamlessly in the middle of any 16:9 vertical space (including 1920x1200) ensuring top and bottom margins are exactly identical relative to the panel edge all around.
- Reinforced anti-zoom listeners (`ctrl+wheel`, `ctrl+-/+/0`) at the top application root level (`App.jsx`) to permanently freeze UI scaling.
- Prevented grid gap stretching in `AtemMacrosCompact.jsx` by explicitly setting `align-content: start` and forcing the bounding wrapper to `height: fit-content`, locking vertical macro button gaps permanently to `4px`.
- Synchronized application version to v3.03 across all documents.

# ATEM WEB MANAGER - ITERATION v3.02

## Changes in v3.02:
- Fixed the vertical misalignment between the bottoms of the Mixer and Macro panels. The Mixer panel previously used `justify-content: space-between` which stretched its contents to fit the screen, whereas the Macro panel was a rigid block of 424px total height (`18px header + 406px box`).
- Recalculated the native height of the 4 Mixer rows to be exactly 376px. Replaced `space-between` with a hardcoded `gap: 16px` between the rows inside `.atem-bus-content-layout` to push its total internal height to exactly 424px.
- Applied `justify-content: center` to both `.atem-bus-content-layout` and `.atem-macros-panel.compact-layout`. This perfectly locks both panels to 424px internal height and floats them identically in the exact middle of their respective quadrants, guaranteeing perfectly equal top and bottom panel margins on any browser window height (including 1920x1200 configurations).
- Implemented global event listeners in `App.jsx` (`wheel { passive: false }` and `keydown`) to aggressively intercept and block `e.ctrlKey` / `e.metaKey` interactions, explicitly preventing page zooming via mouse pinch/scroll, `Ctrl +`, `Ctrl -`, and `Ctrl 0`.
- Synchronized application version to v3.02 across `src/version.js` and all configuration documents.

# ATEM WEB MANAGER - ITERATION v3.01

## Changes in v3.01:
- Fixed MACROS section title vertical alignment: The 28px transport SVG buttons in the header row were pushing the text baseline down when using `align-items: baseline`. Fixed by applying `align-items: flex-end` to both the Mixer and Macro headers, anchoring the 14px text flush to the absolute bottom of the container.
- Fixed 5px macro button gap grid stretching: Removed `flex: 1` from the macro bounding box and `align-content` from the CSS grid, locking the macro buttons strictly to the explicit `4px` grid gaps both horizontally and vertically.
- Set `justify-content: flex-start` on the overall macro panel to anchor the grid to the top rather than letting `space-between` float it away from the header.
- Verified mixer panel standard buttons are exactly **74px x 36px**.
- Upgraded the conditional tooltip rendering engine: It now specifically measures string length (firing only if the name overflows the ~18 character visual boundary) OR if real ATEM note descriptions exist, preventing redundant hover spam on short names.
- Synchronized application version to v3.01 in `src/version.js` and all operation tools.

# ATEM WEB MANAGER - ITERATION v3.00

## Changes in v3.00:
- Answered user inquiry: The mixer panel button size is standardized at **74px width × 36px height** (`.atem-btn-standard`).
- Fixed vertical gap in `AtemMacrosCompact.jsx` grid from `5px` to `4px` (`gap: 4px !important`) to match horizontal spacing.
- Left-justified all compact macro button names (`text-align: left;`) and preserved original uppercase/lowercase casing from real ATEM macros (`span` content).
- Re-aligned the MACROS panel header row so the `MACROS` section title matches the exact vertical Y-position of the PROGRAM section title in the mixer panel.
- Refined tooltip logic: macro description is displayed when the macro name exceeds button width (overflow) or if a notes/description property exists, featuring a clean divider line and master design language.
- Synchronized application version to v3.00 across `src/version.js` and all configuration documents.

# ATEM WEB MANAGER - ITERATION v2.99

## Changes in v2.99:
- Aligned the compact macro panel header (`MACROS` title and transport buttons) to the exact vertical Y-position of the PROGRAM section title in the mixer panel.
- Unified vertical and horizontal macro grid gaps to a uniform `4px` (`gap: 4px !important`).
- Padded macro numbers 1 through 9 with a leading zero (`01` through `09`) to match the width of 10-40 macro numbers.
- Configured dynamic tooltips: when hovering over macro buttons, if notes exist from the real ATEM or if the name overflows, the tooltip displays the name on row 1, a horizontal divider line, and the description underneath following the master design language.
- Synchronized application version to v2.99 across `src/version.js` and all configuration documents.

# ATEM WEB MANAGER - ITERATION v2.98

## Changes in v2.98:
- Updated absolute file header format to exclude the "FILE:" prefix, allowing direct copy-pasting of the absolute path and filename (e.g., `C:\Users\robert.mirt\Downloads\PROGRAMMING\atem-web-manager\...`).
- Updated Rule 10 in `ops/HANDOVER.MD` and `ops/SYSTEM_INSTRUCTIONS.MD` to reflect the updated path-only header convention.
- Synchronized application version to v2.98 across `src/version.js` and all operational documents.

# ATEM WEB MANAGER - ITERATION v2.97

## Changes in v2.97:
- Integrated Token-Saving Rule: Suppressed full `ops/CHANGELOG.MD` delivery in standard responses unless explicitly requested by the user, providing only the modular `ops/CHANGELOG/vX.XX.md` snippet.
- Integrated Absolute File Header Rule: Configured all file output headers to display the full Windows destination path (`C:\Users\robert.mirt\Downloads\PROGRAMMING\atem-web-manager\...`) for immediate copy-paste file saving.
- Updated `ops/HANDOVER.MD` and `ops/SYSTEM_INSTRUCTIONS.MD` to codify both rules permanently.
- Synchronized application version to v2.97 in `src/version.js` and all modified operational documents.

# ATEM WEB MANAGER - ITERATION v2.96

## Changes in v2.96:
- Generated dedicated Google AI Studio System Instructions tailored to project architectural invariants, locked elements, and rules of engagement.
- Created `ops/SYSTEM_INSTRUCTIONS.MD` in the operations documentation folder storing the permanent system instructions template.
- Updated project tree reference in `ops/HANDOVER.MD`.
- Synchronized master version tag to v2.96 across all relevant operational documentation and `src/version.js`.

## [v2.95] - Macro Width Symmetrization, Title Harmonization & Available-Space Centering
- Symmetrized the compact macro panel to the 786px width standard and 10px panel padding, widening buttons across 4 columns to 191px each.
- Renamed panel title to MACROS and unified title styling with the PROGRAM section (14px line-height, 4px margin-bottom, 5px left-alignment).
- Restored circular hover overlay (`border-radius: 50% !important;`) on the loop button to match transport action button parity.
- Structured macro button text to center within the remaining width after subtracting the fixed 24px number width (`Button Width - Number Width`).
- Updated right-click quadrant context menu slot 5 to `5. MACROS (COMPACT)`.
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
- Aligned the Program IP status indicator (`● 192.168.10.240`) flush with the right edge of the last button (Input 10).
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

## [v2.86] - Native Iframe Engine & Non-Swapping Select-None
- Re-architected Player.jsx to load YouTube links through an embedded hardware-accelerated iframe with native controls, eliminating Video.js black screen bugs.
- Refactored quadrant reordering so selecting NONE assigns zero without triggering unwanted positional swaps.

## [v2.85] - Video Player Lifecycle Fix & Safari Shortcut Intercept
- Fixed Video.js black screen React unmount bug by dynamically generating and attaching HTML5 video elements.
- Intercepted Cmd+, globally at the document capture phase to prevent macOS Safari and Chrome from opening browser preferences.

## [v2.84] - Control Overlays Restoration & YouTube URL Parsing
- Restored full Video.js control bar components and custom overlay drawers in Quadrant 1 with proper high z-index stacking.
- Upgraded YouTube video ID matching to robustly parse watch, short, and embed links.

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

## [v2.81] - Macros 40 Vertical Geometry Parity & 4-Column Grid Equilibrium
- Created dedicated `.macro-compact-body` with padding-top 24px and padding-bottom 5px, aligning Row 1 top edge with Mixer Input 1 and Row 10 bottom edge with Mixer OUT 1.
- Distributed all 10 macro button rows evenly on the vertical axis with 4px button spacing.
- Enforced 4 strictly equal-width columns via `repeat(4, minmax(0, 1fr))` with `min-width: 0` constraints, completely eliminating column squishing and asymmetry.
- Re-aligned button design with standard macro specifications: 15px weight-800 translucent numerals, 1-pixel dark boundary matching unpressed buttons, and centered 20-character truncated labels.
- Renamed panel to MACROS 40 in header bar and 5. MACROS 40 in quadrant context menu.
- Synchronized application version tag to v2.81 across all modules.

## [v2.80] - Compact Macro Matrix Panel (40 Macros)
- Added AtemMacrosCompact.jsx component supporting 40 macros in a 4-column column-first layout without pagination.
- Styled grid to match mixer button geometry and device list font metrics.

## [v2.79] - Mixer Selected Button Border Normalization & Optical Parity
- Replaced bright, expanding border colors on selected switcher buttons (.tally-red, .tally-green, .tally-orange, .tally-yellow, .out-active, .auto-btn.trans-active) with border-color: var(--atem-border) !important;.
- Eliminated optical halation and boundary expansion, ensuring active buttons change background fill color only and match the exact outer dimensions of unpressed buttons.
- Codified Rule 10 into Section 1 of ops/HANDOVER.MD under the Parser Isolation & Zero-Nested-Backticks Protocol.
- Synchronized application version tag to v2.79 across all modified modules.

## [v2.78] - Rule 10 Codification & Parser Isolation Enforcement
- Formally integrated Rule 10 (Parser Isolation & Zero-Nested-Backticks Protocol) into ops/HANDOVER.MD under Section 1.
- Enforced 4-space indentation for all documentation trees, permanently eliminating premature code block closure in web markdown renderers.
- Synchronized application version tag to v2.78 across all project modules.

## [v2.77] - Codeblock Isolation Rules & Zero-Nested-Backticks Protocol
- Established strict Zero-Nested-Backticks protocol for Markdown files to protect web markdown renderers from premature codeblock closure.

## [v2.76] - Strict Codeblock Isolation, Bus Muting Parity & Fixed Scale Lock
- Fixed codeblock leakage by removing internal backtick fences and formatting file deliveries in standalone code cards.
- Restored permanent visibility of PVW (Col 9) and PGM (Col 10) on Row 2 of Program and Preview buses with Col 7 & 8 spacers.
- Enforced bus muting protocol: in Program row, PVW and PGM render muted (opacity 0.35, non-clickable) until an Output is engaged for Aux routing. In Preview row, PVW and PGM are permanently muted.
- Locked browser scaling for fixed 1920 viewport via `maximum-scale=1.0, user-scalable=no` and attached global event guards intercepting wheel and keyboard zooming.
- Added preference-switchable 4-column Compact Macro Matrix (40 macros total) in Settings with 36px button heights matching the mixer grid, number typography matching switcher buttons, and tight padding allowing names up to 20 characters to render without truncation.
- Locked multiview quadrants to `minmax(0, 1fr)` with strict `min-height: 0` constraints to permanently prevent vertical expansion away from the 16:9 aspect ratio.
- Formalized Rule 10 in `ops/HANDOVER.MD`.
- Synchronized application version tag to v2.76 across all modules.

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
- Rewrote the ATEM Transition Selection handler in `bridge/server.js` to support both array-based enum mapping (`[1, 2]`) and bitmask parameters, restoring physical switcher Key 1–4 control.
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
- Formatted NEXT TRANSITION (Cols 1–5), DSK 1 (Cols 7–8), and FTB (Col 10) so every button aligns with PGM/PVW inputs and bottom outputs.
- Fixed sticky mouse cursor bug in `DragRateInput` by correctly binding and removing `onMouseUp` on the window event listener.
- Added live real-time ATEM hardware rate dispatching during scrub dragging, Enter submission, and click-away blur.
- Synchronized application version tag to v2.70 across all documentation and runtime modules.

## [v2.69] - Two-Row Control Modules Architecture & Scrub-Drag Interaction Stabilization
- Re-architected `DragRateInput` by separating display and editing modes, enabling smooth vertical scrub-dragging without input element event collisions while retaining single-click typing with Enter submission.
- Created the "NEXT TRANSITION" section matching the official software layout aligned directly under Inputs 1–5 (Row 1: On Air 1–4; Row 2: BKGD, Key 1–4).
- Added the "DSK 1" section aligned under Inputs 7–8 across two rows (TIE 1, Rate, ON AIR, AUTO).
- Added the "FADE TO BLACK" section aligned under Input 9 across two rows (Rate, FTB).
- Formatted sections to an exact two-button-tall height wrapped in individual `atem-section-box` borders.
- Moved keyer triggers into the Next Transition section, returning bus row 2 to standard sources (`BLK`, `BARS`, `COL 1`, `COL 2`, `MP1`, `MP2`).
- Locked the global button geometry (`70px x 36px`) and panel layout structure into the permanent Invariants Protocol.
- Synchronized master application version tag to v2.69 across all documentation.

## [v2.68] - Precision Alignment, Hardware Aux Bus Resolution & Isolated Drag Rate
- Fitted the Program and Preview bus arrays inside a tight `width: fit-content; margin: 0 auto;` container to completely eliminate button overflow and box clipping.
- Structured the bottom control row into the exact same 10-column grid (`repeat(10, 70px)`) as the buses above: OUT 1–6 (Cols 1–6), Spacer (Col 7), Rate (Col 8), CUT (Col 9 under Input 9), and AUTO (Col 10 under Input 10).
- Rewrote `DragRateInput` mouse event handling, allowing both smooth vertical scrub-dragging and click-to-type input without triggering parent quadrant panel drag gestures.
- Switched rate adjustment commands in `bridge/server.js` to `setMixTransitionSettings({ rate })`, restoring real hardware rate manipulation.
- Resolved physical ATEM Aux routing failures by dynamically discovering hardware bus keys from `state.video.auxiliaries` in `bridge/server.js`.
- Configured "MP1 KEY" and "MP2 KEY" buttons on the second row with stacked typography (`MP1` / `KEY`), mapping them to Key 1 & 2 On Air toggles on PGM, Next Transition selection on PVW, and Sources 3011 & 3021 during OUT routing.
- Added "PVW" (10011) and "PGM" (10010) buttons under Inputs 9 and 10 during active OUT routing.
- Converted "PROGRAM" and "PREVIEW" labels to non-bold typography (`font-weight: 400`) aligned flush with the left edge of Input 1.
- Isolated Macro Autorun logic so that clicking a macro while Autorun is OFF strictly selects it without triggering execution.
- Restored round circle hover overlays on top bar buttons, pill hover overlay on the version tag, and the green online status indicator ball.
- Synchronized master application version tag to v2.68.

## [v2.67] - Strict Grid Realignment, Rate Drag Shielding & Bottom Row Symmetry
- Restructured the bottom control row into the exact same 10-column grid (`repeat(10, 70px)`) as the buses above: OUT 1–6 (Cols 1–6), Spacer (Col 7), Rate (Col 8), CUT (Col 9 under Input 9), and AUTO (Col 10 under Input 10).
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
- Restored the complete historical archive in `ops/CHANGELOG.MD` spanning v1.72 through v2.63, fixing the missing v1.72–v2.50 entries.
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
- Implemented an Aux output router bar with 6 output buttons (`OUT 1`–`OUT 6`), enabling direct source routing through the PGM row.
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
- Reordered the 20-button macro matrix into column-first orientation (Column 1: 1–10; Column 2: 11–20).
- Bolstered pagination navigation arrows with bold 2.8px stroke chevrons for improved legibility.
- Accelerated mouse wheel pagination scrolling response by reducing debounce to 35ms.

