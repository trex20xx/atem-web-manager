# ATEM WEB MANAGER - Complete Version History

## [v3.83] - Version Increment & Documentation Synchronization
- Incremented master application version to v3.83 across src/version.js, ops/DESCRIPTOR.txt, and ops/HANDOVER.MD.
- Synchronized modular changelog architecture and updated operational handover notes.


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
