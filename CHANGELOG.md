# ATEM WEB MANAGER - Version History

## [v1.82.0] - Crash-Proof Error Boundaries & Safe ATEM Bridge Handling
- Created `ErrorBoundary.jsx` to trap component rendering exceptions and network connection faults, preventing blank white screen crashes.
- Upgraded `AtemConstellationBus.jsx` to gracefully handle offline WebSocket states (`ws://localhost:8080`), falling back to a clean local UI mode instead of throwing fatal errors.

## [v1.81.0] - Real ATEM Hardware Control Bridge Layer
- Upgraded `AtemConstellationBus.jsx` to dispatch real-world network commands to physical ATEM switchers at `192.168.10.240`.
- Integrated WebSocket/REST bridge client logic to interface with local ATEM communication daemons.

## [v1.80.0] - ATEM 1 M/E Constellation HD Switcher Bus & Dynamic Panels
- Added `AtemConstellationBus.jsx` in `src/components/Panels/` featuring 10 inputs per row for Program (Red Tally) and Preview (Green Tally).
- Enforced strict hardware lock: Constellation panel operates EXCLUSIVELY with IP `192.168.10.240`.