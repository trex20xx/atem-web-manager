# ATEM WEB MANAGER - Version History

## [v1.84.0] - Multiview Quadrant Skeletons
- Updated `Panel.jsx` to display a shimmering skeleton layout inside all quadrants during the initial `isLoading` window, matching the sidebar skeleton style.
- Synchronized version tags and documentation across README, HANDOVER, and FILE_TREE.

## [v1.83.0] - Crash-Proof Error Boundaries & Safe ATEM Bridge Handling
- Created `ErrorBoundary.jsx` to trap component rendering exceptions.
- Fixed `useRef` import bug inside `AtemConstellationBus.jsx`.

## [v1.80.0] - ATEM 1 M/E Constellation HD Switcher Bus & Dynamic Panels
- Added `AtemConstellationBus.jsx` with 10 inputs per row (PGM/PVW) and CUT/AUTO transitions.
- Enforced strict hardware lock to IP `192.168.10.240`.

## [v1.75.0] - React / Vite Transition Baseline
- Monolithic HTML/JS strictly ported to React + Vite component architecture.