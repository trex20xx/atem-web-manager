# ATEM WEB MANAGER

## STRICT RULES OF ENGAGEMENT
1. **INCREMENT VERSION:** Update version numbers in file headers, UI tags, and documentation in `ops/` (`ops/HANDOVER.MD`, `ops/CHANGELOG.MD`, `ops/README.MD`, `ops/FILE_TREE.MD`) with every iteration.
2. **NO UNREQUESTED CHANGES:** Never modify existing functionality, logic, or design unless explicitly requested.
3. **MAINTAIN ALL COMMENTS & COMPLETE HISTORY:** Retain all historical records and comments from v1.72 onwards without trimming or truncating.
4. **FULL FILES ONLY IN EVERY CHAT REPLY:** ALWAYS provide 100% complete updated files with each chat reply when updates occur. NEVER snippets, partial diffs, or back-references.
5. **DOCUMENTATION IN /OPS ONLY:** Maintain all project documentation exclusively within the `ops/` directory.
6. **AUTOMATIC GIT COMMIT & PUSH (ALL FILES):** Always provide `git add -A`, `git commit`, and `git push` commands with an informative commit descriptor at the end of every response.
7. **NO WAITING FOR CONFIRMATION:** Do not hold back Git commands waiting for confirmation; output them immediately. The user will test and flag any fixes.
8. **HANDOVER PROTOCOL:** Maintain and use `ops/HANDOVER.MD` across sessions.

## LOCKED DESIGN & ARCHITECTURAL INVARIANTS
- **Corner Radii:** Buttons `--pill-radius: 24px` | Panels `--panel-radius: 9px`
- **Video Player UI:** YouTube replica layout with SVG masks, STRICT 30% overlay transparency (`rgba(30, 30, 30, 0.3)`)
- **Multiview 16:9:** Strictly maintained aspect ratio under all resize/collapse states
- **Hardware Target IP:** Switcher and Macro panels strictly locked to `192.168.10.240`
- **Sidebar Dimensions:** Row height locked to `30px`, 4px equidistant edit button geometry
- **Top Bar:** Apple-style tactile slider with embedded SVG sun/moon icons matching settings gear; synchronized collapse/zoom animations

## QUICK START & UTILITIES (OPERATING FROM `ops/`)
- **Windows:** Setup: `ops\INIT.BAT` | Stop: `ops\STOP.BAT` | Wipe: `ops\WIPE.BAT` | Push: `ops\PUSH.BAT`
- **Mac:** Setup: `./ops/INIT.SH` | Stop: `./ops/STOP.SH` | Wipe: `./ops/WIPE.SH` | Push: `./ops/PUSH.SH`