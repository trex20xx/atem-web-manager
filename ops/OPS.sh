#!/usr/bin/env bash
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
        echo "================================================================="
        echo " [SECURITY ABORT] Missing token: .atem_workspace_token not found!"
        echo " Wipe refused to prevent deleting unintended directories."
        echo "================================================================="
        read -p "Press Enter to continue..."
        return 1
    fi

    FOUND_KEY=$(head -n 1 "$TOKEN_FILE" | tr -d '\r\n')
    if [ "$FOUND_KEY" != "$REQUIRED_KEY" ]; then
        echo ""
        echo "================================================================="
        echo " [SECURITY ABORT] Invalid security key inside .atem_workspace_token!"
        echo " Wipe refused to prevent deleting unintended directories."
        echo "================================================================="
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
    if [ -z "$DETECTED_VER" ]; then DETECTED_VER="v3.40"; fi

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
            echo "================================================================="
            echo " [WARNING] Descriptor version mismatch!"
            echo " src/version.js:      $DETECTED_VER"
            echo " ops/DESCRIPTOR.txt:  $FILE_VER"
            echo "================================================================="
            echo " [1] Enter commit message manually"
            echo " [2] Abort to download/replace ops/DESCRIPTOR.txt"
            echo "================================================================="
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
    echo "================================================================="
    echo "             TOTAL WORKSPACE WIPE & RE-CLONE PROTOCOL            "
    echo "================================================================="
    echo " WARNING: This will completely destroy this folder and clone a"
    echo " fresh copy from GitHub. Run this ONLY when you want a clean reset."
    echo "================================================================="

    REPO_URL=$(git config --get remote.origin.url 2>/dev/null)
    if [ -z "$REPO_URL" ]; then
        REPO_URL="https://github.com/trex20xx/atem-web-manager.git"
    fi

    PARENT_DIR="$(dirname "$PROJECT_ROOT")"
    FOLDER_NAME="$(basename "$PROJECT_ROOT")"

    echo " Remote Repository: $REPO_URL"
    echo " Target Folder:     $PROJECT_ROOT"
    echo "================================================================="
    read -p " Type 'RECLONE' to execute (or press Enter to cancel): " CONFIRM

    if [ "$CONFIRM" != "RECLONE" ]; then
        echo ">>> Wipe and re-clone aborted. <<<"
        read -p "Press Enter to continue..."
        return
    fi

    cleanup_bridge
    echo ">>> Spawning detached ghost wiper & re-cloner..."

    nohup bash -c "
        sleep 1
        kill \$(lsof -t -i:8080 -i:3000 -i:8000) 2>/dev/null
        if [ ! -f '$PROJECT_ROOT/.atem_workspace_token' ]; then
            echo '[GHOST ABORT] Security token missing from target directory!'
            exit 1
        fi
        rm -rf '$PROJECT_ROOT'
        cd '$PARENT_DIR'
        git clone '$REPO_URL' '$FOLDER_NAME'
        echo '>>> Fresh clone complete. Workspace is ready.'
    " >/dev/null 2>&1 &

    exit 0
}

github_operations() {
    while true; do
        CURRENT_BRANCH=$(git branch --show-current 2>/dev/null)
        if [ -z "$CURRENT_BRANCH" ]; then CURRENT_BRANCH="unknown"; fi

        clear
        echo "================================================================="
        echo "                      GITHUB OPERATIONS                          "
        echo "================================================================="
        echo " Active Branch: $CURRENT_BRANCH"
        echo "-----------------------------------------------------------------"
        echo "  [1] MERGE TO MAIN        - Auto-branch, commit, push branch, tag,"
        echo "                             and merge into main (all preserved)."
        echo ""
        echo "  [2] PUSH TO BRANCH       - Commit and push working progress"
        echo "                             to active branch without merging."
        echo ""
        echo "  [3] SWITCH BRANCH        - View branch list with commit descriptions"
        echo "                             and checkout older versions."
        echo ""
        echo "  [4] CREATE NEW BRANCH    - Create and switch to a new branch."
        echo ""
        echo "  [5] REVERT & DISCARD     - Reset active branch back to clean"
        echo "                             HEAD state (git reset --hard & clean)."
        echo ""
        echo "  [6] RETURN TO MENU       - Return to main operations menu."
        echo "================================================================="
        read -p " Select Git action (1-6): " GCHOICE

        case $GCHOICE in
            1)
                resolve_commit_msg || continue
                git rm --cached public/Top.mp4 2>/dev/null

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
                git add -A
                git commit -m "$RESOLVED_MSG"
                git push -u origin "$CURRENT_BRANCH"
                echo ">>> Committed and pushed to '$CURRENT_BRANCH'. <<<"
                read -p "Press Enter to continue..."
                ;;
            3)
                clear
                echo "================================================================="
                echo "                    AVAILABLE BRANCHES & HISTORY                  "
                echo "================================================================="
                echo ""
                git for-each-ref --sort=-committerdate refs/heads/ --format="  [branch] %(refname:short) :: %(subject) (%(committerdate:relative))"
                git for-each-ref --sort=-committerdate refs/tags/ --format="  [tag]    %(refname:short) :: %(subject) (%(committerdate:relative))"
                echo ""
                echo "================================================================="
                read -p "Enter branch or tag to checkout (or press Enter to cancel): " TARGET_BRANCH
                if [ -n "$TARGET_BRANCH" ]; then
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
                echo ">>> Discarding uncommitted changes..."
                git reset --hard HEAD
                git clean -fd
                read -p "Press Enter to continue..."
                ;;
            6)
                return
                ;;
            *)
                ;;
        esac
    done
}

while true; do
    clear
    echo "========================================================================="
    echo "ATEM WEB MANAGER - OPERATIONS SUITE (v3.40)"
    echo "========================================================================="
    echo "[1] RUN & EVALUATE     - Launch Vite Frontend & Node Bridge Daemon"
    echo "[2] GITHUB OPERATIONS  - Merge to Main, Push Branch, Switch"
    echo "[3] WIPE & RE-CLONE    - Token-Verified Total Scratch Re-Clone"
    echo "[4] WIPE LOCAL CACHES  - Token-Verified Cache & Build Erasure"
    echo "[5] EXPORT CODEBASE    - Serialize codebase to codebase.txt"
    echo "[6] EXIT               - Terminate"
    echo "========================================================================="
    read -p "Select an option (1-6): " choice

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

            CURRENT_BRANCH=$(git branch --show-current 2>/dev/null)
            if [ -z "$CURRENT_BRANCH" ]; then CURRENT_BRANCH="unknown"; fi

            echo ""
            echo "================================================================="
            echo "                  EVALUATION / REVERT PIPELINE                   "
            echo "================================================================="
            echo " Active Branch: $CURRENT_BRANCH"
            echo "-----------------------------------------------------------------"
            echo "  [1] MERGE TO MAIN   - Commit, push feature branch, tag release,"
            echo "                        and merge into main (preserves history)."
            echo ""
            echo "  [2] PUSH TO BRANCH  - Checkpoint and push progress to active"
            echo "                        branch without merging into main."
            echo ""
            echo "  [3] REVERT & DISCARD- Discard uncommitted changes (git reset/clean)."
            echo ""
            echo "  [4] RETURN TO MENU  - Return to main operations menu."
            echo "================================================================="
            read -p " Select post-run action (1-4): " EVAL_CHOICE

            if [ "$EVAL_CHOICE" = "1" ]; then
                resolve_commit_msg || continue
                git rm --cached public/Top.mp4 2>/dev/null

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
            elif [ "$EVAL_CHOICE" = "2" ]; then
                resolve_commit_msg || continue
                git rm --cached public/Top.mp4 2>/dev/null
                git add -A
                git commit -m "$RESOLVED_MSG"
                git push -u origin "$CURRENT_BRANCH"
                echo ">>> Committed and pushed to '$CURRENT_BRANCH'. <<<"
                read -p "Press Enter to continue..."
            elif [ "$EVAL_CHOICE" = "3" ]; then
                echo ">>> Discarding uncommitted changes..."
                git reset --hard HEAD
                git clean -fd
                read -p "Press Enter to continue..."
            fi
            ;;
        2)
            github_operations
            ;;
        3)
            wipe_reclone
            ;;
        4)
            verify_token || continue
            echo ""
            echo "[WIPE CACHES] Clearing local build artifacts..."
            cleanup_bridge
            rm -rf node_modules
            rm -rf bridge/node_modules
            rm -rf dist
            rm -f codebase.txt
            echo ">>> Dependencies and build caches wiped clean. <<<"
            read -p "Press Enter to continue..."
            ;;
        5)
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
        6)
            cleanup_bridge
            exit 0
            ;;
        *)
            ;;
    esac
done