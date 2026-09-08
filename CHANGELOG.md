# ATEM WEB MANAGER - Version History

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

## [v1.76.0] - Skeleton UI & Component Variants
- Added `<Skeleton />` UI component for modern loading states.
- Implemented a simulated 1.2s loading state in `useDevices.js`.
- Added "Component Variant" architecture to the `Sidebar`.

## [v1.75.0] - React / Vite Transition Baseline
- Monolithic HTML/JS strictly ported to React + Vite component architecture.