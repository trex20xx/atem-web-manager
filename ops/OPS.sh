#!/usr/bin/env bash
# =============================================================================
# ATEM WEB MANAGER - UNIFIED MASTER OPERATIONS SUITE (macOS / POSIX) (v3.44)
# =============================================================================
# Manages runtime resolution, Vite + bridge daemon execution, consolidated
# GitHub Operations menu, instant ESC key navigation, and release tagging.
# =============================================================================

cd "$(dirname "$0")/.." || exit
PROJECT_ROOT="$(pwd)"

LOCAL_NODE_DIR="$PROJECT_ROOT/bin/node"

if [ -f "$LOCAL_NODE_DIR/bin/node" ] && [ -f "$LOCAL_NODE_DIR/lib/node_modules/npm/bin/npm-cli.js" ]; then
    export PATH="$LOCAL_NODE_DIR/bin:$PATH"
    NODE_CMD="$LOCAL_NODE_DIR/bin/node"
    NPM_CMD="$LOCAL_NODE_DIR/bin/npm"
else
    export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"
    NODE_CMD="node"
    NPM_CMD="npm"
fi

cleanup_bridge() {
    kill $(lsof -t -i:8080) 2>/dev/null
    kill $(lsof -t -i:3000) 2>/dev/null
    kill $(lsof -t -i:8000) 2>/dev/null
}

trap cleanup_bridge EXIT INT TERM

verify_token() {
    TOKEN_FILE="$PROJECT_ROOT/.atem_workspace_token"
    REQUIRED_KEY="ATEM_MANAGER_SECURE_WIPE_KEY_2026"

    if [ ! -f "$TOKEN_FILE" ]; then
        echo ""
        echo "-----------------------------------------------------------------"
        echo " [SECURITY ABORT] Missing token: .atem_workspace_token not found!"
        echo " Wipe refused to prevent deleting unintended directories."
        echo "-----------------------------------------------------------------"
        read -p "Press Enter to continue..."
        return 1
    fi

    FOUND_KEY=$(head -n 1 "$TOKEN_FILE" | tr -d '\r\n')
    if [ "$FOUND_KEY" != "$REQUIRED_KEY" ]; then
        echo ""
        echo "-----------------------------------------------------------------"
        echo " [SECURITY ABORT] Invalid security key inside .atem_workspace_token!"
        echo " Wipe refused to prevent deleting unintended directories."
        echo "-----------------------------------------------------------------"
        read -p "Press Enter to continue..."
        return 1
    fi

    if [ -z "$PROJECT_ROOT" ] || [ "$PROJECT_ROOT" = "/" ] || [ "$PROJECT_ROOT" = "$HOME" ]; then
        echo "[SECURITY ABORT] Dangerous target: PROJECT_ROOT is system root or home."
        read -p "Press Enter to continue..."
        return 1
    fi

    return 0
}

resolve_commit_msg() {
    DESC_FILE="$PROJECT_ROOT/ops/DESCRIPTOR.txt"
    DETECTED_VER=$(grep -o "v[0-9]\+\.[0-9]\+" src/version.js | head -n 1)
    if [ -z "$DETECTED_VER" ]; then DETECTED_VER="v3.44"; fi

    if [ -f "$DESC_FILE" ]; then
        FILE_VER=$(head -n 1 "$DESC_FILE" | tr -d '\r\n')
        FILE_MSG=$(tail -n +2 "$DESC_FILE" | sed '/^[[:space:]]*$/d')

        if [ "$FILE_VER" = "$DETECTED_VER" ] && [ -n "$FILE_MSG" ]; then
            RESOLVED_MSG="$FILE_MSG"
            echo "[DESCRIPTOR VERIFIED] Ingested message for $FILE_VER:"
            echo "\"$FILE_MSG\""
            return 0
        else
            echo ""
            echo "-----------------------------------------------------------------"
            echo " [WARNING] Descriptor version mismatch!"
            echo " src/version.js:      $DETECTED_VER"
            echo " ops/DESCRIPTOR.txt:  $FILE_VER"
            echo "-----------------------------------------------------------------"
            echo " [1] Enter commit message manually"
            echo " [2] Abort to download/replace ops/DESCRIPTOR.txt"
            echo "-----------------------------------------------------------------"
            read -p " Select (1-2): " MISMATCH_CHOICE
            if [ "$MISMATCH_CHOICE" != "1" ]; then
                return 1
            fi
        fi
    fi

    read -p "Enter iteration description / commit message: " RESOLVED_MSG
    if [ -z "$RESOLVED_MSG" ]; then RESOLVED_MSG="feat: iteration update ($DETECTED_VER)"; fi
    return 0
}

wipe_reclone() {
    verify_token || return

    clear
    echo "-----------------------------------------------------------------"
    echo "             TOTAL WORKSPACE WIPE & RE-CLONE PROTOCOL            "
    echo "-----------------------------------------------------------------"
    echo " WARNING: This will completely destroy this folder and clone a"
    echo " fresh copy from GitHub. Run this ONLY when you want a clean reset."
    echo "-----------------------------------------------------------------"

    REPO_URL=$(git config --get remote.origin.url 2>/dev/null)
    if [ -z "$REPO_URL" ]; then
        REPO_URL="https://github.com/trex20xx/atem-web-manager.git"
    fi

    PARENT_DIR="$(dirname "$PROJECT_ROOT")"
    FOLDER_NAME="$(basename "$PROJECT_ROOT")"

    echo " Remote Repository: $REPO_URL"
    echo " Target Folder:     $PROJECT_ROOT"
    echo "-----------------------------------------------------------------"
    read -p " Type 'RECLONE' to execute (or press Enter to cancel): " CONFIRM

    if [ "$CONFIRM" != "RECLONE" ]; then
        echo ">>> Wipe and re-clone aborted. <<<"
        read -p "Press Enter to continue..."
        return
    fi

    cleanup_bridge
    echo ">>> Starting silent background wipe and fresh re-clone..."

    nohup bash -c "
        sleep 1
        kill \$(lsof -t -i:8080 -i:3000 -i:8000) 2>/dev/null
        if [ ! -f '$PROJECT_ROOT/.atem_workspace_token' ]; then
            exit 1
        fi
        rm -rf '$PROJECT_ROOT'
        cd '$PARENT_DIR'
        git clone '$REPO_URL' '$FOLDER_NAME' >/dev/null 2>&1
    " >/dev/null 2>&1 &

    echo ">>> Session closing. Your workspace is being freshly re-cloned."
    sleep 2
    exit 0
}

github_operations() {
    while true; do
        CURRENT_BRANCH=$(git branch --show-current 2>/dev/null)
        if [ -z "$CURRENT_BRANCH" ]; then CURRENT_BRANCH="unknown"; fi

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
        read -rsn1 -p " Select Git action (1-7, or ESC to return): " GCHOICE
        echo ""

        if [ "$GCHOICE" = $'\e' ] || [ "$GCHOICE" = "7" ]; then
            return
        fi

        case $GCHOICE in
            1)
                resolve_commit_msg || continue
                git rm --cached public/Top.mp4 2>/dev/null
                git rm --cached bin/.commit_msg.txt 2>/dev/null

                if [ "$CURRENT_BRANCH" = "main" ]; then
                    echo "[BRANCHING] Creating feature branch '$DETECTED_VER' from main..."
                    git checkout -b "$DETECTED_VER" 2>/dev/null
                    git add -A
                    git commit -m "$RESOLVED_MSG"
                    echo "[PUSHING] Publishing feature branch '$DETECTED_VER' to GitHub..."
                    git push -u origin "$DETECTED_VER"
                    git tag -a "$DETECTED_VER" -m "Release $DETECTED_VER" 2>/dev/null
                    git push origin --tags 2>/dev/null
                    echo "[MERGING] Switching to main and folding '$DETECTED_VER' into main..."
                    git checkout main
                    git pull origin main 2>/dev/null
                    git merge "$DETECTED_VER" --no-edit
                    git push origin main
                else
                    git add -A
                    git commit -m "$RESOLVED_MSG"
                    git push -u origin "$CURRENT_BRANCH"
                    git tag -a "$DETECTED_VER" -m "Release $DETECTED_VER" 2>/dev/null
                    git push origin --tags 2>/dev/null
                    git checkout main
                    git pull origin main 2>/dev/null
                    git merge "$CURRENT_BRANCH" --no-edit
                    git push origin main
                fi
                echo ">>> Iteration merged into main and pushed. Branch preserved on GitHub. <<<"
                echo ">>> Active working branch is now 'main'. <<<"
                read -p "Press Enter to continue..."
                ;;
            2)
                resolve_commit_msg || continue
                git rm --cached public/Top.mp4 2>/dev/null
                git rm --cached bin/.commit_msg.txt 2>/dev/null
                git add -A
                git commit -m "$RESOLVED_MSG"
                git push -u origin "$CURRENT_BRANCH"
                echo ">>> Committed and pushed to '$CURRENT_BRANCH'. <<<"
                read -p "Press Enter to continue..."
                ;;
            3)
                clear
                echo "-----------------------------------------------------------------"
                echo "                    AVAILABLE BRANCHES & HISTORY                  "
                echo "-----------------------------------------------------------------"
                echo ""
                printf "  [*] Fetching latest branch telemetry from GitHub..."
                git fetch --all --prune --tags >/dev/null 2>&1
                printf "\r                                                          \r"
                git for-each-ref --sort=-committerdate refs/heads/ refs/remotes/origin/ --format="%(refname:short)|%(subject)|%(committerdate:relative)" | awk -F'|' '!seen[$1]++ { if ($1 ~ /HEAD/ || $1 ~ /^origin$/) next; gsub(/^origin\//,"",$1); printf "  [branch] %-12s :: %s (%s)\n", $1, $2, $3 }'
                git for-each-ref --sort=-*creatordate refs/tags/ --format="%(refname:short)|%(subject)|%(*committerdate:relative)" | awk -F'|' '!seen[$1]++ { printf "  [tag]    %-12s :: %s (%s)\n", $1, $2, $3 }'
                echo ""
                echo "-----------------------------------------------------------------"
                read -p "Enter branch or tag to checkout (or press ESC to cancel): " TARGET_BRANCH
                if [ -n "$TARGET_BRANCH" ] && [ "$TARGET_BRANCH" != $'\e' ]; then
                    git checkout "$TARGET_BRANCH"
                    read -p "Press Enter to continue..."
                fi
                ;;
            4)
                read -p "Enter new feature branch name: " NEW_BRANCH
                if [ -n "$NEW_BRANCH" ]; then
                    git checkout -b "$NEW_BRANCH"
                    echo ">>> Switched to new branch '$NEW_BRANCH'. <<<"
                    read -p "Press Enter to continue..."
                fi
                ;;
            5)
                wipe_reclone
                ;;
            6)
                echo ">>> Discarding uncommitted changes..."
                git reset --hard HEAD
                git clean -fd
                read -p "Press Enter to continue..."
                ;;
            *)
                ;;
        esac
    done
}

while true; do
    clear
    echo "-------------------------------------------------------------------------"
    echo "ATEM WEB MANAGER - OPERATIONS SUITE (v3.44)"
    echo "-------------------------------------------------------------------------"
    echo "[1] RUN & EVALUATE     - Launch Vite Frontend & Node Bridge Daemon"
    echo "[2] GITHUB OPERATIONS  - Merge to Main, Push Branch, Switch"
    echo "[3] WIPE & RE-CLONE    - Token-Verified Total Scratch Re-Clone"
    echo "[4] EXPORT CODEBASE    - Serialize codebase to codebase.txt"
    echo "[5] EXIT               - Terminate session"
    echo "-------------------------------------------------------------------------"
    read -rsn1 -p "Select an option (1-5, or ESC to exit): " choice
    echo ""

    if [ "$choice" = $'\e' ] || [ "$choice" = "5" ]; then
        cleanup_bridge
        exit 0
    fi

    case $choice in
        1)
            echo ""
            echo "[RUN & EVALUATE] Starting services..."

            if [ -d "public" ]; then
                nohup python3 -m http.server 8000 --directory public > /dev/null 2>&1 &
            fi
            
            if [ ! -d "node_modules/vite" ]; then
                echo "Installing frontend dependencies..."
                "$NPM_CMD" install
            fi
            
            if [ ! -d "bridge/node_modules" ]; then
                echo "Installing bridge dependencies..."
                cd bridge && "$NPM_CMD" install && cd ..
            fi

            cleanup_bridge
            
            if [ -d "public" ]; then
                nohup python3 -m http.server 8000 --directory public > /dev/null 2>&1 &
            fi

            nohup "$NODE_CMD" bridge/server.js > /dev/null 2>&1 &
            "$NPM_CMD" run dev
            cleanup_bridge

            github_operations
            ;;
        2)
            github_operations
            ;;
        3)
            wipe_reclone
            ;;
        4)
            echo ""
            echo "[EXPORT] Serializing codebase..."
            out="codebase.txt"
            > "$out"
            for f in index.html vite.config.js package.json; do
                if [ -f "$f" ]; then
                    echo "=== FILE: $f ===" >> "$out"
                    cat "$f" >> "$out"
                    echo "" >> "$out"
                fi
            done
            if [ -d "bridge" ]; then
                for f in bridge/*; do
                    if [ -f "$f" ] && [ "$(basename "$f")" != "package-lock.json" ]; then
                        echo "=== FILE: $f ===" >> "$out"
                        cat "$f" >> "$out"
                        echo "" >> "$out"
                    fi
                done
            fi
            if [ -d "src" ]; then
                find src -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" \) | while read -r f; do
                    echo "=== FILE: $f ===" >> "$out"
                    cat "$f" >> "$out"
                    echo "" >> "$out"
                done
            fi
            echo "Codebase exported to codebase.txt"
            read -p "Press Enter to continue..."
            ;;
        *)
            ;;
    esac
done