# ATEM WEB MANAGER

## STRICT RULES OF ENGAGEMENT
1. **INCREMENT VERSION:** Update version numbers in comments and UI with every iteration.
2. **NO UNREQUESTED CHANGES:** Never modify existing functionality, logic, or design unless explicitly requested.
3. **MAINTAIN ALL COMMENTS & COMPLETE HISTORY:** Never trim or delete past changelog entries or architectural comments. Retain all historical records from v1.72 onwards.
4. **GIT / GITHUB WORKFLOW:** Always provide the code to do whatever changes are necessary in Git + GitHub — **BUT ONLY AFTER CONFIRMING THE CHANGES ARE GOOD**.
5. **COMPONENTIZE:** Write clean, isolated, reusable React components.
6. **NAMING CONVENTIONS:**
   - Files in `ops/` are strictly ALL-CAPS (`*.MD`, `*.BAT`, `*.SH`).
   - React components in `src/components/` use `PascalCase.jsx`.
   - Custom hooks in `src/hooks/` use `camelCase.js`.
7. **[LOCKED] ELEMENTS PROTOCOL:**
   - Pill radius: `24px` | Panel radius: `9px` (max `24px`).
   - Video.js UI: 30% transparency (`rgba(30, 30, 30, 0.3)`) and custom SVG YouTube masks.
   - Multiview Quadrants: Strict 16:9 aspect ratio at all times.
   - ATEM Constellation Panel: Hardware-locked to IP `192.168.10.240`.
   - Sidebar Devices, Groups, and Inline Edit Panels geometry and styling.
8. **FULL FILES ONLY:** ALWAYS provide full updated files when changes are made. NOT snippets.
9. **HANDOVER PROTOCOL:** Use `ops/HANDOVER.MD` to transfer context to new AI chat sessions.

## QUICK START & UTILITIES (OPERATING FROM `ops/`)
- **Windows:**
  - Setup & Launch (Frontend + ATEM Bridge): Double-click `ops\INIT.BAT`
  - Push changes: Double-click `ops\PUSH.BAT`
  - Wipe project: Double-click `ops\WIPE.BAT`
  - Normalize file structure: Double-click `ops\CLEANUP.BAT`
- **Mac:**
  - Setup & Launch: `./ops/INIT.SH`
  - Push changes: `./ops/PUSH.SH`
  - Wipe project: `./ops/WIPE.SH`
  - Normalize file structure: `./ops/CLEANUP.SH`