# ATEM WEB MANAGER - Complete Version History

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

## [v2.09.0] - UI Precision, Apple Switch Icons, & Two-Way ATEM Tallies
- Aligned search field width precisely with sidebar device pill highlights.
- Embedded SVG Sun and Moon icons directly inside the sliding Apple-style theme toggle switch, sizing it to match the settings gear.
- Fixed Multiview quadrant alignment and scaling behavior when toggling the sidebar.
- Fixed two-way ATEM tally feedback loop in `bridge/server.js`.
- Standardized ATEM switcher button typography to use device font and removed subtext.
- Made version tag click behavior toggle cleanly between visible and hidden states.
- Synchronized sidebar slide and vertical quadrant zoom transitions to occur simultaneously.
- Redesigned right-click quadrant context menu to use pill styling and device typography.

## [v2.08.0] - Unified Top Bar, Apple Theme Switch, Bidirectional ATEM Feedback & Edit UX
- Created dedicated Top Navigation Bar housing Hamburger toggle, Title, Version tag, Theme switch, and Settings gear.
- Eliminated all quadrant overlap issues during 16:9 aspect ratio resizing and sidebar collapse.
- Implemented tactile, monochrome Apple-style sliding switch for Dark/Light theme toggling.