#!/usr/bin/env bash

# =============================================================================
# ATEM WEB MANAGER - UNIFIED MASTER OPERATIONS SUITE (macOS/Linux) (v3.87)
# =============================================================================
# This CLI manages the end-to-end development lifecycle:
# 1. Self-contained Node.js runtime resolution and integrity verification.
# 2. Dual-package dependency installations and local broadcast font bootstrapping.
# 3. Background hardware bridge daemon management with automated port cleanup.
# 4. Consolidated GitHub Operations menu via Trunk-Based Development.
# 5. Standard interactive text prompts with Enter submission and empty-Enter cancellation.
# 6. Token-guarded workspace cleaning and silent scratch re-cloning via ghost scripts.
# 7. Clean terminal exit logic.
# =============================================================================

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT" || exit 1

export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8

# =============================================================================
# CORE FUNCTIONS
# =============================================================================

cleanup_ports() {
    for port in 8080 3000 8000; do
        pid=$(lsof -ti tcp:$port -sTCP:LISTEN 2>/dev/null)
        if [ ! -z "$pid" ]; then
            kill -9 $pid 2>/dev/null
        fi
    done
}

trap cleanup_ports EXIT INT TERM

verify_token() {
    TOKEN_FILE="$PROJECT_ROOT/.atem_workspace_token"
    REQUIRED_KEY="ATEM_MANAGER_SECURE_WIPE_KEY_2026"

    if [ ! -f "$TOKEN_FILE" ]; then
        echo ""
        echo "-----------------------------------------------------------------"
        echo " [SECURITY ABORT] Missing token: .atem_workspace_token not found!"
        echo " Wipe refused to prevent deleting unintended drive directories."
        echo "-----------------------------------------------------------------"
        read -p "Press Enter to continue..."
        return 1
    fi

    FOUND_KEY=$(cat "$TOKEN_FILE" 2>/dev/null | tr -d '\r\n')
    if [ "$FOUND_KEY" != "$REQUIRED_KEY" ]; then
        echo ""
        echo "-----------------------------------------------------------------"
        echo " [SECURITY ABORT] Invalid security key inside .atem_workspace_token!"
        echo " Wipe refused to prevent deleting unintended drive directories."
        echo "-----------------------------------------------------------------"
        read -p "Press Enter to continue..."
        return 1
    fi

    if [ -z "$PROJECT_ROOT" ] || [ "$PROJECT_ROOT" == "/" ]; then
        echo "[SECURITY ABORT] Dangerous target: PROJECT_ROOT is root."
        read -p "Press Enter to continue..."
        return 1
    fi

    return 0
}

setup_node_env() {
    if ! command -v node &> /dev/null; then
        if [ -x "/opt/homebrew/bin/node" ]; then
            export PATH="/opt/homebrew/bin:$PATH"
        elif [ -x "/usr/local/bin/node" ]; then
            export PATH="/usr/local/bin:$PATH"
        else
            echo "[ERROR] Node.js not found. Please install Node.js."
            exit 1
        fi
    fi
}

check_dependencies() {
    if [ ! -d "$PROJECT_ROOT/node_modules/vite" ]; then
        echo ""
        echo "-----------------------------------------------------------------"
        echo "      FRESH CLONE DETECTED - INSTALLING FRONTEND DEPENDENCIES     "
        echo "-----------------------------------------------------------------"
        npm install
    fi

    if [ ! -d "$PROJECT_ROOT/bridge/node_modules" ]; then
        echo ""
        echo "-----------------------------------------------------------------"
        echo "      INSTALLING ATEM BRIDGE BACKEND DEPENDENCIES                "
        echo "-----------------------------------------------------------------"
        cd "$PROJECT_ROOT/bridge" || exit 1
        npm install
        cd "$PROJECT_ROOT" || exit 1
    fi

    if [ ! -f "$PROJECT_ROOT/public/fonts/roboto-400.woff2" ]; then
        echo ""
        echo "-----------------------------------------------------------------"
        echo "     DOWNLOADING EMBEDDED BROADCAST FONTS INTO PROJECT (OFFLINE)   "
        echo "-----------------------------------------------------------------"
        mkdir -p "$PROJECT_ROOT/public/fonts"
        echo "  [*] Downloading broadcast fonts from immutable jsDelivr CDN..."
        curl -s -L -o "$PROJECT_ROOT/public/fonts/roboto-400.woff2" "https://cdn.jsdelivr.net/npm/@fontsource/roboto@5.0.13/files/roboto-latin-400-normal.woff2"
        curl -s -L -o "$PROJECT_ROOT/public/fonts/roboto-500.woff2" "https://cdn.jsdelivr.net/npm/@fontsource/roboto@5.0.13/files/roboto-latin-500-normal.woff2"
        curl -s -L -o "$PROJECT_ROOT/public/fonts/roboto-700.woff2" "https://cdn.jsdelivr.net/npm/@fontsource/roboto@5.0.13/files/roboto-latin-700-normal.woff2"
        curl -s -L -o "$PROJECT_ROOT/public/fonts/roboto-900.woff2" "https://cdn.jsdelivr.net/npm/@fontsource/roboto@5.0.13/files/roboto-latin-900-normal.woff2"
        curl -s -L -o "$PROJECT_ROOT/public/fonts/pandorum.woff2" "https://cdn.jsdelivr.net/npm/@fontsource/orbitron@5.0.12/files/orbitron-latin-700-normal.woff2"
        curl -s -L -o "$PROJECT_ROOT/public/fonts/orbitron.woff2" "https://cdn.jsdelivr.net/npm/@fontsource/orbitron@5.0.12/files/orbitron-latin-400-normal.woff2"
        curl -s -L -o "$PROJECT_ROOT/public/fonts/oxanium.woff2" "https://cdn.jsdelivr.net/npm/@fontsource/oxanium@5.0.8/files/oxanium-latin-400-normal.woff2"
        curl -s -L -o "$PROJECT_ROOT/public/fonts/vt323.woff2" "https://cdn.jsdelivr.net/npm/@fontsource/vt323@5.0.8/files/vt323-latin-400-normal.woff2"
        curl -s -L -o "$PROJECT_ROOT/public/fonts/rajdhani.woff2" "https://cdn.jsdelivr.net/npm/@fontsource/rajdhani@5.0.8/files/rajdhani-latin-400-normal.woff2"
        curl -s -L -o "$PROJECT_ROOT/public/fonts/audiowide.woff2" "https://cdn.jsdelivr.net/npm/@fontsource/audiowide@5.0.8/files/audiowide-latin-400-normal.woff2"
        curl -s -L -o "$PROJECT_ROOT/public/fonts/share-tech-mono.woff2" "https://cdn.jsdelivr.net/npm/@fontsource/share-tech-mono@5.0.8/files/share-tech-mono-latin-400-normal.woff2"
        curl -s -L -o "$PROJECT_ROOT/public/fonts/black-ops-one.woff2" "https://cdn.jsdelivr.net/npm/@fontsource/black-ops-one@5.0.8/files/black-ops-one-latin-400-normal.woff2"
        echo "  [DONE] Broadcast fonts bootstrapped successfully."
    fi
}

sync_changelog() {
    local master="ops/CHANGELOG.MD"
    if [ ! -f "$master" ]; then
        echo "# ATEM WEB MANAGER - Complete Version History" > "$master"
    fi

    for md in ops/CHANGELOG/*.md; do
        [ -e "$md" ] || continue
        tag=$(grep -oE '\[v[0-9]+(\.[0-9]+)*\]' "$md" | head -n 1)
        if [ -n "$tag" ]; then
            if ! grep -Fq "$tag" "$master"; then
                echo "[OPS] Merging $tag into $master..."
                content=$(cat "$md")
                header=$(head -n 1 "$master")
                rest=$(tail -n +2 "$master")
                printf "%s\n\n%s\n\n%s\n" "$header" "$content" "$rest" > "$master.tmp"
                mv "$master.tmp" "$master"
            fi
        fi
    done
}

export_codebase() {
    echo ""
    echo "-----------------------------------------------------------------"
    echo "        SERIALIZING CODEBASE FOR AI HANDOVER (codebase.txt)       "
    echo "-----------------------------------------------------------------"
    OUT="codebase.txt"
    > "$OUT"
    echo "  [*] Serializing project modules..."
    for file in index.html vite.config.js package.json; do
        if [ -f "$file" ]; then
            printf "=== FILE: %s === \n" "$file" >> "$OUT"
            cat "$file" >> "$OUT"
            printf "\n \n" >> "$OUT"
        fi
    done
    if [ -d "bridge" ]; then
        for file in bridge/*; do
            if [ -f "$file" ] && [ "$(basename "$file")" != "package-lock.json" ]; then
                printf "=== FILE: %s === \n" "$file" >> "$OUT"
                cat "$file" >> "$OUT"
                printf "\n \n" >> "$OUT"
            fi
        done
    fi
    if [ -d "src" ]; then
        find src -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" \) | while read -r file; do
            printf "=== FILE: %s === \n" "$file" >> "$OUT"
            cat "$file" >> "$OUT"
            printf "\n \n" >> "$OUT"
        done
    fi
    echo "  [DONE] Serialized workspace to codebase.txt"
}

resolve_commit_msg() {
    COMMIT_TMP="$PROJECT_ROOT/bin/.commit_msg.txt"
    DESC_FILE="$PROJECT_ROOT/ops/DESCRIPTOR.txt"
    mkdir -p "$PROJECT_ROOT/bin"
    
    DETECTED_VER=$(grep -oE 'v[0-9]+\.[0-9]+' src/version.js | head -n 1)
    if [ -z "$DETECTED_VER" ]; then
        DETECTED_VER="v3.87"
    fi

    if [ ! -f "$DESC_FILE" ]; then
        manual_prompt
        return $?
    fi

    FILE_VER=$(head -n 1 "$DESC_FILE" | tr -d '\r\n')
    FILE_MSG=$(tail -n +2 "$DESC_FILE" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')

    if [ "$FILE_VER" == "$DETECTED_VER" ] && [ -n "$FILE_MSG" ]; then
        echo "$FILE_MSG" > "$COMMIT_TMP"
        echo "[DESCRIPTOR VERIFIED] Ingested message for $FILE_VER:"
        echo "\"$FILE_MSG\""
        return 0
    else
        echo "[VERSION MISMATCH] DESCRIPTOR.txt ($FILE_VER) does not match version.js ($DETECTED_VER)"
        echo ""
        echo "-----------------------------------------------------------------"
        echo "  [WARNING] Descriptor file version does not match src/version.js!"
        echo "  src/version.js:      $DETECTED_VER"
        echo "-----------------------------------------------------------------"
        echo "  [1] Enter commit description manually"
        echo "  [2] Abort to download/replace ops/DESCRIPTOR.txt"
        echo "-----------------------------------------------------------------"
        read -p " Select (1-2, or Enter to abort): " MISMATCH_CHOICE
        if [ "$MISMATCH_CHOICE" == "1" ]; then
            manual_prompt
            return 0
        fi
        return 1
    fi
}

manual_prompt() {
    echo ""
    read -p "Enter iteration description / commit message: " msg
    if [ -z "$msg" ]; then
        msg="feat: iteration update ($DETECTED_VER)"
    fi
    echo "$msg" > "$COMMIT_TMP"
    return 0
}

# =============================================================================
# MENUS
# =============================================================================

run_eval() {
    setup_node_env
    check_dependencies
    sync_changelog
    cleanup_ports
    export_codebase

    if [ -f "bridge/server.js" ]; then
        echo ">>> Starting ATEM Hardware Bridge Daemon on Port 8080 in background..."
        cd "$PROJECT_ROOT/bridge" || exit 1
        nohup node server.js >/dev/null 2>&1 &
        cd "$PROJECT_ROOT" || exit 1
    fi

    echo ">>> Starting Frontend Server on Port 3000 with auto-launch..."
    npm run dev

    cleanup_ports
    github_ops
}

github_ops() {
    while true; do
        cleanup_ports
        CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)
        if [ -z "$CURRENT_BRANCH" ]; then
            CURRENT_BRANCH="unknown"
        fi

        clear
        echo "-----------------------------------------------------------------"
        echo "                      GITHUB OPERATIONS                          "
        echo "-----------------------------------------------------------------"
        echo " Active Branch: $CURRENT_BRANCH"
        echo "-----------------------------------------------------------------"
        echo "  [1] MERGE TO MAIN     (Publish branch, tag, and merge into main)"
        echo "  [2] PUSH TO BRANCH    (Checkpoint progress on active branch)"
        echo "  [3] SWITCH BRANCH     (View branch history and checkout version)"
        echo "  [4] CREATE NEW BRANCH (Create and checkout new feature branch)"
        echo "  [5] WIPE & RE-CLONE   (Token-Verified Total Scratch Re-Clone)"
        echo "  [6] REVERT & DISCARD  (Discard uncommitted changes and clean)"
        echo "  [7] RETURN TO MENU    (Return to main operations menu)"
        echo "-----------------------------------------------------------------"
        read -p " Select Git action (1-7, or press Enter/0 to return): " GCHOICE

        case "$GCHOICE" in
            1) merge_main ;;
            2) push_branch ;;
            3) switch_branch ;;
            4) create_branch ;;
            5) wipe_reclone ;;
            6) revert_discard ;;
            7|0|q|"") break ;;
            *) ;;
        esac
    done
}

merge_main() {
    echo ""
    resolve_commit_msg
    if [ $? -ne 0 ]; then return; fi

    git rm --cached public/Top.mp4 2>/dev/null
    git rm --cached bin/.commit_msg.txt 2>/dev/null

    if [ "$CURRENT_BRANCH" == "main" ]; then
        git add -A
        git commit -F "$COMMIT_TMP"
        rm -f "$COMMIT_TMP" 2>/dev/null
        echo "[BRANCHING] Spawning marker branch '$DETECTED_VER'..."
        git branch "$DETECTED_VER" 2>/dev/null
        echo "[TAGGING] Tagging release '$DETECTED_VER'..."
        git tag -a "$DETECTED_VER" -m "Release $DETECTED_VER" 2>/dev/null
        echo "[PUSHING] Pushing main, branch, and tags to GitHub..."
        git push -u origin main
        git push origin refs/heads/"$DETECTED_VER"
        git push origin refs/tags/"$DETECTED_VER" 2>/dev/null
        echo ""
        echo "-----------------------------------------------------------------"
        echo " Iteration successfully published:"
        echo " - Commits saved and pushed directly to 'main'."
        echo " - Marker branch '$DETECTED_VER' published."
        echo " - Release tag '$DETECTED_VER' published."
        echo " - Active working branch remains 'main'."
        echo "-----------------------------------------------------------------"
        read -p "Press Enter to continue..."
        return
    fi

    git add -A
    git commit -F "$COMMIT_TMP"
    rm -f "$COMMIT_TMP" 2>/dev/null
    echo "[PUSHING] Publishing '$CURRENT_BRANCH' to GitHub..."
    git push -u origin refs/heads/"$CURRENT_BRANCH"
    echo "[MERGING] Folding '$CURRENT_BRANCH' into main..."
    git checkout main
    git pull origin main 2>/dev/null
    git merge "$CURRENT_BRANCH" --no-edit
    git push origin main
    echo "[TAGGING] Tagging release '$DETECTED_VER'..."
    git tag -a "$DETECTED_VER" -m "Release $DETECTED_VER" 2>/dev/null
    git push origin refs/tags/"$DETECTED_VER" 2>/dev/null
    echo "[RETURNING] Switching back to feature branch '$CURRENT_BRANCH'..."
    git checkout "$CURRENT_BRANCH"
    echo ""
    echo "-----------------------------------------------------------------"
    echo " Iteration successfully published:"
    echo " - Feature branch '$CURRENT_BRANCH' updated and pushed."
    echo " - Changes merged into 'main' and pushed."
    echo " - Release tag '$DETECTED_VER' published."
    echo " - Active working branch returned to '$CURRENT_BRANCH'."
    echo "-----------------------------------------------------------------"
    read -p "Press Enter to continue..."
}

push_branch() {
    echo ""
    resolve_commit_msg
    if [ $? -ne 0 ]; then return; fi

    git rm --cached public/Top.mp4 2>/dev/null
    git rm --cached bin/.commit_msg.txt 2>/dev/null
    git add -A
    git commit -F "$COMMIT_TMP"
    rm -f "$COMMIT_TMP" 2>/dev/null

    git push -u origin refs/heads/"$CURRENT_BRANCH"
    echo ">>> Committed and pushed to branch '$CURRENT_BRANCH'. <<<"
    read -p "Press Enter to continue..."
}

switch_branch() {
    clear
    echo "-----------------------------------------------------------------"
    echo "                    AVAILABLE BRANCHES & HISTORY                  "
    echo "-----------------------------------------------------------------"
    echo ""
    echo "  [*] Fetching latest branch telemetry from GitHub..."
    git fetch --all --prune --tags >/dev/null 2>&1
    
    echo ""
    git for-each-ref --sort=-committerdate refs/heads/ refs/remotes/origin/ --format='%(refname:short)|%(subject)|%(committerdate:relative)' | awk -F'|' '!seen[gensub(/^origin\//,"",1,$1)]++ { printf "  [branch] %-12s :: %s (%s)\n", gensub(/^origin\//,"",1,$1), $2, $3 }'
    git for-each-ref --sort=-*creatordate refs/tags/ --format='%(refname:short)|%(subject)|%(*committerdate:relative)' | awk -F'|' '{ printf "  [tag]    %-12s :: %s (%s)\n", $1, $2, $3 }'
    echo ""
    echo "-----------------------------------------------------------------"
    read -p " Enter branch or tag to checkout (or press Enter/0 to cancel): " TARGET_BRANCH

    if [ -z "$TARGET_BRANCH" ] || [ "$TARGET_BRANCH" == "0" ] || [[ "${TARGET_BRANCH,,}" == "q" ]]; then
        return
    fi
    git checkout "$TARGET_BRANCH"
    read -p "Press Enter to continue..."
}

create_branch() {
    echo ""
    read -p " Enter new feature branch name (or press Enter to cancel): " NEW_BRANCH
    if [ -z "$NEW_BRANCH" ] || [ "$NEW_BRANCH" == "0" ]; then return; fi
    git checkout -b "$NEW_BRANCH"
    echo ">>> Switched to new branch '$NEW_BRANCH'. <<<"
    read -p "Press Enter to continue..."
}

revert_discard() {
    echo ">>> Discarding all uncommitted changes and cleaning workspace..."
    git reset --hard HEAD
    git clean -fd
    echo ">>> Workspace clean and reverted. <<<"
    read -p "Press Enter to continue..."
}

wipe_reclone() {
    verify_token
    if [ $? -ne 0 ]; then return; fi

    echo ""
    echo "-----------------------------------------------------------------"
    echo "             TOTAL WORKSPACE WIPE & RE-CLONE PROTOCOL             "
    echo "-----------------------------------------------------------------"
    echo " WARNING: This will completely destroy this folder and clone a"
    echo " fresh copy from GitHub. Run this ONLY when you want a clean reset."
    echo "-----------------------------------------------------------------"

    REPO_URL=$(git config --get remote.origin.url 2>/dev/null)
    if [ -z "$REPO_URL" ]; then
        REPO_URL="https://github.com/trex20xx/atem-web-manager.git"
    fi

    PARENT_DIR=$(dirname "$PROJECT_ROOT")
    FOLDER_NAME=$(basename "$PROJECT_ROOT")

    echo " Remote Repository: $REPO_URL"
    echo " Target Folder:     $PROJECT_ROOT"
    echo "-----------------------------------------------------------------"
    read -p " Type 'RECLONE' to execute (or press Enter to cancel): " WIPE_CONFIRM
    if [ "$WIPE_CONFIRM" != "RECLONE" ]; then
        echo ">>> Wipe and re-clone aborted. <<<"
        read -p "Press Enter to continue..."
        return
    fi

    cleanup_ports

    GHOST_SH="/tmp/atem_ghost_reclone_$$.sh"
    cat <<EOF > "$GHOST_SH"
#!/usr/bin/env bash
sleep 2
if [ ! -f "$PROJECT_ROOT/.atem_workspace_token" ]; then
    rm -f "\$0"
    exit 0
fi
rm -rf "$PROJECT_ROOT" >/dev/null 2>&1
cd "$PARENT_DIR"
git clone "$REPO_URL" "$FOLDER_NAME" >/dev/null 2>&1
rm -f "\$0"
exit 0
EOF
    chmod +x "$GHOST_SH"

    echo ">>> Starting silent background wipe and fresh re-clone..."
    nohup "$GHOST_SH" >/dev/null 2>&1 &
    echo ">>> Session closing. Your workspace is being freshly re-cloned."
    sleep 2
    exit 0
}

# =============================================================================
# MAIN LOOP
# =============================================================================
while true; do
    clear
    echo "-----------------------------------------------------------------"
    echo "           ATEM WEB MANAGER - MASTER OPERATIONS CLI (v3.87)       "
    echo "-----------------------------------------------------------------"
    echo "  [1] RUN & EVALUATE     (Vite + Daemon, Auto-Export & Evaluation)"
    echo "  [2] GITHUB OPERATIONS  (Merge to Main, Push Branch, Switch)"
    echo "  [3] WIPE & RE-CLONE    (Token-Verified Total Scratch Re-Clone)"
    echo "  [4] EXPORT CODEBASE    (Serialize workspace to codebase.txt)"
    echo "  [5] EXIT               (Terminate session)"
    echo "-----------------------------------------------------------------"
    read -p " Select action (1-5, or press Enter/0 to exit): " CHOICE

    case "$CHOICE" in
        1) run_eval ;;
        2) github_ops ;;
        3) wipe_reclone ;;
        4) export_codebase; read -p "Press Enter to continue..." ;;
        5|0|q|"") break ;;
        *) ;;
    esac
done

cleanup_ports
clear
exit 0