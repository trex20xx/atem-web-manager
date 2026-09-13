#!/usr/bin/env bash
cd "$(dirname "$0")/.." || exit

# Standard macOS/Linux package manager path injection
export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"

cleanup_bridge() {
    kill $(lsof -t -i:8080) 2>/dev/null
    kill $(lsof -t -i:3000) 2>/dev/null
    kill $(lsof -t -i:8000) 2>/dev/null
}

trap cleanup_bridge EXIT INT TERM

while true; do
    clear
    echo "========================================================================="
    echo "ATEM WEB MANAGER - OPERATIONS SUITE (v3.17)"
    echo "========================================================================="
    echo "[1] RUN & EVALUATE  - Launch Vite Frontend & Node Bridge Daemon"
    echo "[2] MERGE TO MAIN   - Merge this feature branch into 'main'"
    echo "[3] WIPE            - Securely clear caches, node_modules, and dist"
    echo "[4] EXPORT          - Serialize codebase to codebase.txt"
    echo "[5] EXIT            - Terminate"
    echo "========================================================================="
    read -p "Select an option (1-5): " choice

    case $choice in
        1)
            echo ""
            echo "[RUN & EVALUATE] Starting services..."

            if [ -d "public" ]; then
                nohup python3 -m http.server 8000 --directory public > /dev/null 2>&1 &
            fi
            
            if [ ! -d "node_modules/vite" ]; then
                echo "Installing frontend dependencies..."
                npm install
            fi
            
            if [ ! -d "bridge/node_modules" ]; then
                echo "Installing bridge dependencies..."
                cd bridge && npm install && cd ..
            fi

            echo "=== ATEM WEB MANAGER CODEBASE ===" > codebase.txt
            cat src/App.jsx >> codebase.txt 2>/dev/null
            cat src/index.css >> codebase.txt 2>/dev/null

            cleanup_bridge
            
            if [ -d "public" ]; then
                nohup python3 -m http.server 8000 --directory public > /dev/null 2>&1 &
            fi

            nohup node bridge/server.js > /dev/null 2>&1 &
            npm run dev
            cleanup_bridge

            CURRENT_BRANCH=$(git branch --show-current)
            echo ""
            echo "================================================================="
            echo "                  EVALUATION / REVERT PIPELINE                   "
            echo "================================================================="
            echo " Active Branch: $CURRENT_BRANCH"
            echo "-----------------------------------------------------------------"
            echo "  [1] MERGE TO MAIN   - Merge this feature branch into 'main'"
            echo "                        (preserves branch history on local/remote)."
            echo ""
            echo "  [2] PUSH TO BRANCH  - Keep working on this branch. Commit and"
            echo "                        push progress to GitHub without merging."
            echo ""
            echo "  [3] REVERT & DISCARD- Experiment failed. Reset codebase back to"
            echo "                        clean HEAD state (git reset --hard & clean)."
            echo ""
            echo "  [4] RETURN TO MENU  - Leave all files exactly as they are without"
            echo "                        committing or reverting."
            echo "================================================================="
            read -p " Select post-run action (1-4): " EVAL_CHOICE

            if [ "$EVAL_CHOICE" == "1" ]; then
                read -p "Enter iteration description / commit message: " CMSG
                if [ -z "$CMSG" ]; then CMSG="feat: iteration update"; fi
                
                git rm --cached public/Top.mp4 2>/dev/null
                echo "public/Top.mp4" >> .gitignore

                if [ "$CURRENT_BRANCH" == "main" ]; then
                    git add -A
                    git commit -m "$CMSG"
                    git push origin main
                else
                    git add -A
                    git commit -m "$CMSG"
                    git push origin "$CURRENT_BRANCH"
                    git checkout main
                    git pull origin main
                    git merge "$CURRENT_BRANCH" --no-edit
                    git push origin main
                    git checkout "$CURRENT_BRANCH"
                fi
                echo ">>> Feature successfully merged into main (branch preserved). <<<"
                read -p "Press Enter to continue..."
            elif [ "$EVAL_CHOICE" == "2" ]; then
                read -p "Enter commit message: " CMSG
                if [ -z "$CMSG" ]; then CMSG="wip: evaluation checkpoint"; fi
                git rm --cached public/Top.mp4 2>/dev/null
                echo "public/Top.mp4" >> .gitignore
                git add -A
                git commit -m "$CMSG"
                git push origin "$CURRENT_BRANCH"
                echo ">>> Committed and pushed to $CURRENT_BRANCH. <<<"
                read -p "Press Enter to continue..."
            elif [ "$EVAL_CHOICE" == "3" ]; then
                echo ">>> Discarding uncommitted changes..."
                git reset --hard HEAD
                git clean -fd
                read -p "Press Enter to continue..."
            fi
            ;;
        2)
            echo ""
            echo "[MERGE TO MAIN] Initiating..."
            read -p "Enter iteration description / commit message: " CMSG
            if [ -z "$CMSG" ]; then CMSG="feat: manual merge update"; fi
            
            git rm --cached public/Top.mp4 2>/dev/null
            echo "public/Top.mp4" >> .gitignore

            CURRENT_BRANCH=$(git branch --show-current)
            if [ "$CURRENT_BRANCH" == "main" ]; then
                git add -A
                git commit -m "%CMSG%"
                git push origin main
                echo "Main branch updated and pushed."
            else
                git add -A
                git commit -m "$CMSG"
                git push origin "$CURRENT_BRANCH"
                git checkout main
                git pull origin main
                git merge "$CURRENT_BRANCH" --no-edit
                git push origin main
                git checkout "$CURRENT_BRANCH"
            fi
            echo "Successfully merged $CURRENT_BRANCH into main (branch preserved)."
            read -p "Press Enter to continue..."
            ;;
        3)
            echo ""
            echo "[WIPE] Securing workspace..."
            if [ -f ".atem_workspace_token" * ]; then
                rm -rf node_modules
                rm -rf bridge/node_modules
                rm -rf dist
                rm -f codebase.txt
                echo "Workspace wiped successfully."
            else
                echo "Security token missing. Aborting wipe."
            fi
            read -p "Press Enter to continue..."
            ;;
        4)
            echo ""
            echo "[EXPORT] Serializing codebase..."
            echo "=== ATEM WEB MANAGER CODEBASE ===" > codebase.txt
            cat src/App.jsx >> codebase.txt 2>/dev/null
            cat src/index.css >> codebase.txt 2>/dev/null
            echo "Codebase exported to codebase.txt"
            read -p "Press Enter to continue..."
            ;;
        5)
            exit 0
            ;;
        *)
            ;;
    esac
done