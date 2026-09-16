#!/usr/bin/env bash
cd "$(dirname "$0")/.." || exit
PROJECT_ROOT="$(pwd)"

LOCAL_NODE_DIR="$PROJECT_ROOT/bin/node"

if [ -f "$LOCAL_NODE_DIR/bin/node" ]; then
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

wipe_reclone() {
    clear
    echo "================================================================="
    echo "             TOTAL WORKSPACE WIPE & RE-CLONE PROTOCOL            "
    echo "================================================================="
    echo " WARNING: This will completely destroy this folder, terminate all"
    echo " port locks, and clone a fresh copy from GitHub."
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
    read -p " Type 'RECLONE' to execute: " CONFIRM

    if [ "$CONFIRM" != "RECLONE" ]; then
        echo ">>> Wipe and re-clone aborted. <<<"
        read -p "Press Enter to continue..."
        return
    fi

    cleanup_bridge
    echo ">>> Spawning detached ghost wiper & re-cloner..."

    nohup bash -c "
        sleep 2
        kill \$(lsof -t -i:8080 -i:3000 -i:8000) 2>/dev/null
        rm -rf '$PROJECT_ROOT'
        cd '$PARENT_DIR'
        git clone '$REPO_URL' '$FOLDER_NAME'
        cd '$PROJECT_ROOT'
        chmod +x ops/OPS.sh
        ./ops/OPS.sh
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
        echo "  [1] MERGE TO MAIN        - Merge current branch into 'main',"
        echo "                             push to GitHub, and switch to main"
        echo "                             (preserves feature branch history)."
        echo ""
        echo "  [2] PUSH TO BRANCH       - Commit and push working progress"
        echo "                             to active branch without merging."
        echo ""
        echo "  [3] SWITCH BRANCH        - Switch/checkout any existing branch"
        echo "                             (to test or revert to older versions)."
        echo ""
        echo "  [4] CREATE NEW BRANCH    - Create and switch to a new branch."
        echo ""
        echo "  [5] WIPE & RE-CLONE      - Erase workspace and re-clone fresh"
        echo "                             from GitHub via detached ghost script."
        echo ""
        echo "  [6] REVERT & DISCARD     - Reset active branch back to clean"
        echo "                             HEAD state (git reset --hard & clean)."
        echo ""
        echo "  [7] RETURN TO MENU       - Return to main operations menu."
        echo "================================================================="
        read -p " Select Git action (1-7): " GCHOICE

        case $GCHOICE in
            1)
                read -p "Enter iteration description / commit message: " CMSG
                if [ -z "$CMSG" ]; then CMSG="feat: iteration update"; fi
                
                git rm --cached public/Top.mp4 2>/dev/null

                if [ "$CURRENT_BRANCH" == "main" ]; then
                    git add -A
                    git commit -m "$CMSG"
                    git push origin main
                    echo ">>> Main branch updated and pushed. <<<"
                else
                    git add -A
                    git commit -m "$CMSG"
                    git push origin "$CURRENT_BRANCH"
                    git checkout main
                    git pull origin main
                    git merge "$CURRENT_BRANCH" --no-edit
                    git push origin main
                    echo ">>> Feature merged into main. Branch '$CURRENT_BRANCH' preserved. <<<"
                    echo ">>> Active branch is now 'main'. <<<"
                fi
                read -p "Press Enter to continue..."
                ;;
            2)
                read -p "Enter commit message: " CMSG
                if [ -z "$CMSG" ]; then CMSG="wip: evaluation checkpoint"; fi
                git rm --cached public/Top.mp4 2>/dev/null
                git add -A
                git commit -m "$CMSG"
                git push origin "$CURRENT_BRANCH"
                echo ">>> Committed and pushed to '$CURRENT_BRANCH'. <<<"
                read -p "Press Enter to continue..."
                ;;
            3)
                echo ""
                echo "Available branches:"
                git branch -a
                echo ""
                read -p "Enter branch name to checkout (or press Enter to cancel): " TARGET_BRANCH
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
                wipe_reclone
                ;;
            6)
                echo ">>> Discarding uncommitted changes..."
                git reset --hard HEAD
                git clean -fd
                read -p "Press Enter to continue..."
                ;;
            7)
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
    echo "ATEM WEB MANAGER - OPERATIONS SUITE (v3.36)"
    echo "========================================================================="
    echo "[1] RUN & EVALUATE     - Launch Vite Frontend & Node Bridge Daemon"
    echo "[2] GITHUB OPERATIONS  - Merge, Push, Switch, Branch, Re-clone"
    echo "[3] WIPE & RE-CLONE    - Ghost-Script Fresh Git Clone from Scratch"
    echo "[4] WIPE LOCAL CACHES  - Clear node_modules, dist, and build caches"
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