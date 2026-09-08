# ATEM WEB MANAGER - Version History

## [v1.90.0] - Automated One-Liner Bootstrapping & Double-Click Launchers
- Upgraded `INIT.sh` (macOS) and `INIT.bat` (Windows) to automatically execute `npm run dev` upon successful setup.
- Documented native double-click execution flows (`.command` for Mac, `.bat` for Windows).
- Maintained documentation sync across README, CHANGELOG, and HANDOVER states.

## [v1.83.0] - Crash-Proof Error Boundaries & Safe ATEM Bridge Handling
- Created `ErrorBoundary.jsx` to trap component rendering exceptions.
- Upgraded `AtemConstellationBus.jsx` to gracefully handle offline WebSocket states.

## [v1.80.0] - ATEM 1 M/E Constellation HD Switcher Bus & Dynamic Panels
- Added `AtemConstellationBus.jsx` with 10 inputs per row (PGM/PVW) and CUT/AUTO transitions.
- Enforced strict hardware lock to IP `192.168.10.240`.

## [v1.75.0] - React / Vite Transition Baseline
- Monolithic HTML/JS strictly ported to React + Vite component architecture.