# ATEM WEB MANAGER - Complete Version History

## [v3.82] - Stream URL Settings Restoration
- Restored Missing Stream URL Field: Fixed a regression from v3.81 where the master Stream / Video URL input field was accidentally dropped from the General tab in the Settings modal. The field is now restored to its original position.

## [v3.81] - Pandorum Standby Typography, LCD Shader & Enhanced Filter Controls
- Console Typography Standby Screen: Replaced ASCII art with centered text rendering ATEM WEB MANAGER in Pandorum/Orbitron font with the version tag underneath.
- Vertical Real Estate Expansion: Removed fixed 360px height constraints from the console body.
- Enhanced Header Filtering: Added an ALL source filter button to the left of USER and relocated the CURRENT / ALL DEVICES toggle adjacent to EXPORT.
- Subtle LCD Effect: Introduced a preferences toggle in Settings to render a subtle broadcast CRT/LCD scanline effect across the console panel.
- Console Display Font Selector: Added preferences dropdown supporting 15 curated broadcast fonts.

## [v3.80] - Console Design Polish, Device Filtering & Friendly Logging
- Console Header Restyling: Changed title to CONSOLE. Completely removed the sliding tray and pill backgrounds in favor of inline text buttons.
- Standardized Palette: Filters use core app colors (Pastel Blue for USER, Red for ATEM, Orange for BRIDGE, Green for SYSTEM).
- Active Device vs All Devices Filtering: CURRENT filters telemetry to the active sidebar device IP.
- Friendly Input Telemetry: Updated bridge/server.js to translate raw IDs into plain-English labels (e.g., Input 1, Black, Color Bars, Program).

## [v3.79] - Console Redesign, Universal Telemetry & Date/Time Exports
- Console UI Overhaul: Removed neon styling, updated export files to ATEM_WEB_MANAGER_YYYY-MM-DD_HH-MM-SS.txt.
- Universal System Telemetry: Wired dispatchSysLog into App.jsx for settings adjustments (Radius, Theme, Tally).

## [v3.78] - Multi-Source Console Telemetry Engine
- Introduced discrete log source tagging (USER, ATEM, BRIDGE, SYSTEM) with muted typography and distinct color mapping.
- Built a smooth sliding inline filter tray into the console header.
- Filtered out ATEM UDP noise, logging only actionable hardware state changes.

## [v3.77] - Git Refspec Fix & Media Pool Geometry
- Resolved Git push refspec collision in OPS scripts using explicit refs/heads/ and refs/tags/.
- Redesigned Media Pool layout: empty slots dimmed to 0.35 opacity, numbers centered, clear 'X' button removed.
- Concentric tallies use a distinct nested geometry to prevent border overlap.

## [v3.76] - Mixer Rate Countdown & Font Unification
- Added real-time frame countdown to 0:00 on AUTO/DSK/FTB transition triggers.
- Unified all switcher button typography to strictly match the IN1 button (13px, weight 400).
- Console panel preserves log stream history in a global memory ring buffer.

## [v3.75] - Zero-Latency Mixer Core
- Completely stripped background picture download engine and YUV/BMP decoding loops from bridge/server.js to eradicate UDP port 9910 saturation.

## [v3.74] - Optimistic UI Feedback
- Restored instant responsive control to KEY 1-4, TIE, ON AIR, and Aux Routing via optimistic local dispatch.
- Relocated master Picture Engine toggle to far right of Media Pool.

## [v3.73] - Trunk-Based Git Operations
- Re-engineered OPS.BAT and OPS.SH Git workflows to use linear Trunk-Based Development, eliminating branch merge conflicts on main.
- Overhauled Media Pool with local cache CLEAR button and hover tooltip descriptions.

## [v3.72] - Lock Switch Inversion & Keyboard Bounce Guard
- Fixed keyboard repeat bouncing in AtemConstellationBus by checking e.repeat.
- Swapped the Mixer Lock Switch: OFF state now locks input controls while maintaining active tally displays.

## [v3.71] - Console Panel Initialization
- Added ConsolePanel.jsx mapped to Quadrant ID 6.
- Integrated Apple-style panel lock switch into the Mixer header.

## [v3.70] - Bridge Console Telemetry Intercept
- Injected console log interceptor into bridge/server.js, broadcasting raw stdout/stderr telemetry to the UI via WebSockets.

## [v3.69] - Clean Terminal Exit
- Configured OPS CLI to execute clean terminal buffer erasure (cls/clear) upon session termination.

## [v3.68] - Contextual Dim/Bright Tallies
- Injected dim tally states (40% opacity) for Media Pool routing slots when unselected in the header.

## [v3.67] - Safari Shortcut Bypass
- Captured Cmd+, at top-level DOM to bypass native macOS Safari preference windows.

## [v3.66] - Zero-Overlap Synchronous Offset
- Engineered transform offset matching quadrant padding to eliminate sidebar overlap clipping.

## [v3.64] - Flawless Quadrant Scaling
- Shifted to pure CSS padding-inset layout structure with perfectly synchronized 350ms flexbox transitions.

## [v3.63] - Sidebar Overlay Interactions
- Synchronized sidebar hover logic with fixed top offset and gapless height calculations.

## [v3.62] - Hardware-Accelerated Scaling
- Added GPU-accelerated CSS dimension transitions to quadrant wrappers.

## [v3.61] - Pure Horizontal Sidebar Slide
- Converted sidebar to hardware-accelerated transform: translateX(-100%).

## [v3.60] - Not Connected Banner
- Configured red NOT CONNECTED top header status.

## [v3.59] - Hardened System Instructions
- Integrated Output Ceiling Guard to prevent AI parser codeblock collapse.

## [v3.58] - Auto-Hiding Toolbar
- Configured top toolbar to slide up out of view when sidebar collapses.

## [v3.57] - Disconnected Video Standby
- Implemented discrete crossed-out video camera placeholder for offline video streams.

## [v3.37] - CLI Submenu Architecture
- Re-architected CLI menus to include dedicated GitHub Operations submenus.

## [v3.34] - ESC Navigation Engine
- Integrated single-key ESC navigation via console reading in deployment scripts.

## [v3.33] - Historical Archive Restoration
- Restored complete CHANGELOG.MD history per user request.

## [v3.32] - AI Handover Generation
- Generated comprehensive AI handover package including system instructions and handover files.

## [v3.27] - Typography Weights & Batch Sync
- Corrected inactive grey mapping for STOP/PLAY buttons.

## [v3.23] - Standalone Git Workflow
- Created standalone git-workflow.bat for isolated feature branching.

## [v3.18] - File Suppression Rules
- Updated rules to suppress HANDOVER.MD output in standard responses.

## [v3.04] - Iteration Descriptor Enforcement
- Formally established Mandatory Iteration Descriptor protocol.

## [v2.86] - Native Iframe Engine
- Switched YouTube player to native Iframe API to eliminate Video.js black screen bugs.

## [v2.85] - Safari Shortcut Hijacking Fix
- Added stopImmediatePropagation to global keyboard hooks.

## [v2.84] - YouTube URL Parsing
- Rebuilt URL parser to support youtu.be, embed, and watch?v= links.

## [v2.80] - Compact Macro Matrix
- Engineered AtemMacrosCompact.jsx 40-button matrix panel matching mixer dimensions.

## [v2.77] - Codeblock Isolation Rules
- Established Zero-Nested-Backticks protocol for Markdown files to protect web parsers.