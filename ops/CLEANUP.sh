#!/usr/bin/env bash
# =========================================================================
# ATEM WEB MANAGER - MACOS WORKSPACE STANDARDIZER (v2.05)
# =========================================================================
clear
echo "================================================================="
echo "       ATEM WEB MANAGER - MACOS WORKSPACE STANDARDIZATION"
echo "================================================================="

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$SCRIPT_DIR/.."
cd "$ROOT_DIR" || exit

mkdir -p ops

# Move & Normalize to ALL-CAPS
[ -f "CHANGELOG.md" ] && mv -f "CHANGELOG.md" "ops/CHANGELOG.MD"
[ -f "ops/CHANGELOG.md" ] && mv -f "ops/CHANGELOG.md" "ops/CHANGELOG.MD"

[ -f "README.md" ] && mv -f "README.md" "ops/README.MD"
[ -f "ops/README.md" ] && mv -f "ops/README.md" "ops/README.MD"

[ -f "HANDOVER.md" ] && mv -f "HANDOVER.md" "ops/HANDOVER.MD"
[ -f "ops/HANDOVER.md" ] && mv -f "ops/HANDOVER.md" "ops/HANDOVER.MD"

[ -f "FILE_TREE.md" ] && mv -f "FILE_TREE.md" "ops/FILE_TREE.MD"
[ -f "ops/FILE_TREE.md" ] && mv -f "ops/FILE_TREE.md" "ops/FILE_TREE.MD"

[ -f "git_instructions.md" ] && mv -f "git_instructions.md" "ops/GIT_INSTRUCTIONS.MD"
[ -f "ops/git_instructions.md" ] && mv -f "ops/git_instructions.md" "ops/GIT_INSTRUCTIONS.MD"

[ -f "INIT.sh" ] && mv -f "INIT.sh" "ops/INIT.SH"
[ -f "ops/INIT.sh" ] && mv -f "ops/INIT.sh" "ops/INIT.SH"

[ -f "INIT.bat" ] && mv -f "INIT.bat" "ops/INIT.BAT"
[ -f "ops/INIT.bat" ] && mv -f "ops/INIT.bat" "ops/INIT.BAT"

[ -f "PUSH.sh" ] && mv -f "PUSH.sh" "ops/PUSH.SH"
[ -f "ops/PUSH.sh" ] && mv -f "ops/PUSH.sh" "ops/PUSH.SH"

[ -f "PUSH.bat" ] && mv -f "PUSH.bat" "ops/PUSH.BAT"
[ -f "ops/PUSH.bat" ] && mv -f "ops/PUSH.bat" "ops/PUSH.BAT"

[ -f "WIPE.sh" ] && mv -f "WIPE.sh" "ops/WIPE.SH"
[ -f "ops/WIPE.sh" ] && mv -f "ops/WIPE.sh" "ops/WIPE.SH"

[ -f "WIPE.bat" ] && mv -f "WIPE.bat" "ops/WIPE.BAT"
[ -f "ops/WIPE.bat" ] && mv -f "ops/WIPE.bat" "ops/WIPE.BAT"

# Fix bridge package.json.txt if present
[ -f "bridge/package.json.txt" ] && mv -f "bridge/package.json.txt" "bridge/package.json"

# Remove stray duplicates
rm -f "src/hooks/Sidebar.jsx"
rm -f "src/components/Multiview/AtemConstellationBus.jsx"

# Ensure executable flags
chmod +x ops/*.SH 2>/dev/null

echo "================================================================="
echo "   MACOS STANDARDIZATION COMPLETE!"
echo "================================================================="