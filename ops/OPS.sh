#!/usr/bin/env bash
# =========================================================================
# ATEM WEB MANAGER - MASTER OPERATIONS SUITE (v2.42.0)
# =========================================================================
# Interactive CLI with Descriptive Post-Vite Evaluation, Merge & Revert.

REPO_URL="https://github.com/trex20xx/atem-web-manager.git"
TOKEN_KEY="ATEM_MANAGER_SECURE_WIPE_KEY_2026"

# Detect project root or default to local clone path
if [ -f "$(pwd)/package.json" ]; then
    PROJECT_ROOT="$(pwd)"
elif [ -f "$(dirname "${BASH_SOURCE[0]}")/../package.json" ]; then
    PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
else
    PROJECT_ROOT="$(pwd)/ATEM_WEB_MANAGER"
fi

cd "$PROJECT_ROOT" 2>/dev/null

show_menu() {
    clear
    CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "not-cloned")
    echo "========================================================================="
    echo "        ATEM WEB MANAGER - OPERATIONS SUITE (v2.42.0)                   "
    echo "        Active Branch: [$CURRENT_BRANCH]                                "
    echo "========================================================================="
    echo "  [1] RUN & EVALUATE  - Start bridge + UI, then Merge or Revert on exit "
    echo "  [2] STOP            - Terminate background ATEM bridge daemon         "
    echo "  [3] PUSH            - Stage all files, commit, and push active branch "
    echo "  [4] PULL            - Pull latest changes from remote for active branch"
    echo "  [5] START ITERATION - Create & switch to a new feature branch from main"
    echo "  [6] FINISH & MERGE  - Merge active feature branch into main & cleanup "
    echo "  [7] WIPE            - Secure token check & workspace erasure          "
    echo "  [8] EXPORT          - Package full codebase into codebase.txt for AI  "
    echo "  [9] EXIT                                                              "
    echo "========================================================================="
    read -p "Select an option [1-9]: " OPTION
}

cleanup_bridge() {
    BRIDGE_PIDS=$(lsof -t -i:8080 2>/dev/null)
    if [ -n "$BRIDGE_PIDS" ]; then
        kill -9 $BRIDGE_PIDS 2>/dev/null
        echo "[INFO] Background bridge daemon terminated cleanly."
    fi
}

do_evaluate() {
    echo ""
    echo "========================================================================="
    echo "                    ITERATION EVALUATION & NEXT STEPS                    "
    echo "========================================================================="
    echo "  How did your changes look in the browser? Choose an action below:      "
    echo ""
    echo "  [1] MERGE TO MAIN (Success - Feature Complete)"
    echo "      -> Stages and commits your work, switches to 'main', pulls latest,"
    echo "         merges this branch into 'main', pushes to GitHub, and deletes"
    echo "         the temporary feature branch. Use this when the feature is DONE."
    echo ""
    echo "  [2] PUSH TO BRANCH (Success - Work in Progress)"
    echo "      -> Stages, commits, and pushes your work to your current branch"
    echo "         on GitHub without merging into 'main'. Use this to save progress."
    echo ""
    echo "  [3] REVERT & DISCARD (Failed - Scrap Changes)"
    echo "      -> Permanently undoes all modifications and deletes new untracked"
    echo "         files, resetting your workspace back to the last clean commit."
    echo "         Use this when an experiment broke or you want to start over."
    echo ""
    echo "  [4] RETURN TO MENU (Keep Files As-Is)"
    echo "      -> Leaves your local files exactly as they are without committing,"
    echo "         pushing, or reverting, and returns to the operations menu."
    echo "========================================================================="
    read -p "Choose an evaluation action [1-4]: " EVAL_CHOICE

    case "$EVAL_CHOICE" in
        1)
            do_finish_iteration
            ;;
        2)
            do_push
            ;;
        3)
            echo ""
            read -p "Are you sure you want to DISCARD all changes and revert? [y/N]: " REVERT_CONFIRM
            if [[ "$REVERT_CONFIRM" =~ ^[Yy]$ ]]; then
                echo "[INFO] Reverting all modified files and cleaning untracked files..."
                git reset --hard HEAD
                git clean -fd
                echo "[SUCCESS] Workspace reverted to clean state."
            else
                echo "[ABORT] Revert cancelled."
            fi
            read -p "Press Enter to continue..."
            ;;
        4)
            echo "[INFO] Changes kept. Returning to menu."
            sleep 1
            ;;
        *)
            echo "Invalid option. Returning to menu."
            sleep 1
            ;;
    esac
}

do_init() {
    echo ""
    echo "[INFO] Verifying workspace..."

    if [ ! -f "$PROJECT_ROOT/package.json" ]; then
        echo "[INFO] Project files not detected in current directory."
        read -p "Enter installation target directory [$PROJECT_ROOT]: " USER_DIR
        PROJECT_ROOT="${USER_DIR:-$PROJECT_ROOT}"
        
        echo "[INFO] Cloning 'main' branch from $REPO_URL..."
        git clone -b main "$REPO_URL" "$PROJECT_ROOT"
        if [ $? -ne 0 ]; then
            echo "[ERROR] Git clone failed. Check your connection/authentication."
            read -p "Press Enter to continue..."
            return
        fi
    fi

    cd "$PROJECT_ROOT" || exit 1

    if ! command -v node &> /dev/null; then
        echo "[ERROR] Node.js is not installed or not in PATH."
        read -p "Press Enter to continue..."
        return
    fi

    if [ ! -d "$PROJECT_ROOT/node_modules" ]; then
        echo "[INFO] Installing frontend dependencies..."
        npm install
    fi

    if [ ! -d "$PROJECT_ROOT/bridge/node_modules" ]; then
        echo "[INFO] Installing bridge dependencies..."
        cd "$PROJECT_ROOT/bridge" && npm install
        cd "$PROJECT_ROOT" || exit 1
    fi

    PIDS=$(lsof -t -i:8080 2>/dev/null)
    if [ -n "$PIDS" ]; then
        kill -9 $PIDS 2>/dev/null
    fi

    echo "[INFO] Starting ATEM Hardware Bridge (Background Daemon)..."
    cd "$PROJECT_ROOT/bridge" || exit 1
    nohup node server.js > /dev/null 2>&1 &
    cd "$PROJECT_ROOT" || exit 1

    echo "[INFO] Starting Vite UI Application (Auto-opening browser)..."
    echo "[NOTE] When finished reviewing in browser, press Ctrl+C in this terminal to Evaluate."
    echo ""

    trap ' ' INT
    npm run dev
    trap - INT

    cleanup_bridge
    do_evaluate
}

do_stop() {
    echo ""
    echo "[INFO] Hunting for running ATEM bridge processes on Port 8080..."
    cleanup_bridge
    read -p "Press Enter to continue..."
}

do_push() {
    echo ""
    read -p "Enter your commit message: " COMMIT_MSG
    if [ -z "$COMMIT_MSG" ]; then
        echo "[ABORT] Commit message cannot be empty."
        read -p "Press Enter to continue..."
        return
    fi
    CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
    git add -A
    git commit -m "$COMMIT_MSG"
    git push -u origin "$CURRENT_BRANCH"
    echo "[SUCCESS] Pushed changes to origin/$CURRENT_BRANCH."
    read -p "Press Enter to continue..."
}

do_pull() {
    echo ""
    CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
    echo "[INFO] Pulling latest changes from origin/$CURRENT_BRANCH..."
    git pull origin "$CURRENT_BRANCH"
    read -p "Press Enter to continue..."
}

do_start_iteration() {
    echo ""
    echo "[INFO] Starting a new isolated feature iteration..."
    read -p "Enter new iteration branch name (e.g. feature/v2.42-next): " BRANCH_NAME
    if [ -z "$BRANCH_NAME" ]; then
        echo "[ABORT] Branch name cannot be empty."
        read -p "Press Enter to continue..."
        return
    fi

    echo "[1/3] Switching to 'main' branch..."
    git checkout main
    echo "[2/3] Pulling latest updates from GitHub..."
    git pull origin main
    echo "[3/3] Creating and switching to branch '$BRANCH_NAME'..."
    git checkout -b "$BRANCH_NAME"
    echo "[SUCCESS] You are now safely working on branch [$BRANCH_NAME]!"
    read -p "Press Enter to continue..."
}

do_finish_iteration() {
    echo ""
    CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
    read -p "Enter commit description: " COMMIT_DESC
    COMMIT_DESC="${COMMIT_DESC:-feat: update iteration changes}"

    if [ "$CURRENT_BRANCH" = "main" ]; then
        echo "[INFO] Committing and pushing directly to 'main'..."
        git add -A
        git commit -m "$COMMIT_DESC"
        git push origin main
        echo "[SUCCESS] Pushed to main."
        read -p "Press Enter to continue..."
        return
    fi

    echo "[1/5] Staging work on $CURRENT_BRANCH..."
    git add -A
    git commit -m "$COMMIT_DESC" 2>/dev/null

    echo "[2/5] Switching to 'main'..."
    git checkout main

    echo "[3/5] Pulling latest main..."
    git pull origin main

    echo "[4/5] Merging '$CURRENT_BRANCH' into 'main'..."
    git merge "$CURRENT_BRANCH" -m "merge: fold verified $CURRENT_BRANCH into main"

    echo "[5/5] Pushing updated 'main' to GitHub..."
    git push origin main

    echo "[INFO] Cleaning up finished branch '$CURRENT_BRANCH'..."
    git branch -d "$CURRENT_BRANCH" 2>/dev/null
    git push origin --delete "$CURRENT_BRANCH" 2>/dev/null

    echo "[SUCCESS] Iteration merged cleanly into 'main' and branch pruned."
    read -p "Press Enter to continue..."
}

do_wipe() {
    echo ""
    echo "[SECURITY] Verifying workspace token..."
    TOKEN_FILE="$PROJECT_ROOT/.atem_workspace_token"
    if [ ! -f "$TOKEN_FILE" ]; then
        echo "[ERROR] Security token '$TOKEN_FILE' missing! Wipe aborted."
        read -p "Press Enter to continue..."
        return
    fi
    KEY=$(cat "$TOKEN_FILE")
    if [ "$KEY" != "$TOKEN_KEY" ]; then
        echo "[ERROR] Security token mismatch! Wipe aborted."
        read -p "Press Enter to continue..."
        return
    fi
    echo "[WARNING] Token verified. The entire project directory will be PERMANENTLY ERASED."
    echo "Target: $PROJECT_ROOT"
    read -p "Type 'DELETE' to confirm complete workspace destruction: " CONFIRM
    if [ "$CONFIRM" != "DELETE" ]; then
        echo "[ABORT] Wipe cancelled by user."
        read -p "Press Enter to continue..."
        return
    fi

    cleanup_bridge
    PIDS=$(lsof -t -i:5173 -i:3000 2>/dev/null)
    if [ -n "$PIDS" ]; then kill -9 $PIDS 2>/dev/null; fi

    cd /tmp || exit 1
    rm -rf "$PROJECT_ROOT"
    echo "[SUCCESS] Project directory completely erased from drive."
    exit 0
}

do_export() {
    echo ""
    echo "[INFO] Packaging complete codebase into codebase.txt..."
    OUTPUT_FILE="$PROJECT_ROOT/codebase.txt"
    > "$OUTPUT_FILE"

    for f in "index.html" "vite.config.js" "package.json"; do
        if [ -f "$PROJECT_ROOT/$f" ]; then
            echo "=== FILE: $f ===" >> "$OUTPUT_FILE"
            cat "$PROJECT_ROOT/$f" >> "$OUTPUT_FILE"
            echo -e "\n" >> "$OUTPUT_FILE"
        fi
    done

    for f in "bridge/package.json" "bridge/server.js"; do
        if [ -f "$PROJECT_ROOT/$f" ]; then
            echo "=== FILE: $f ===" >> "$OUTPUT_FILE"
            cat "$PROJECT_ROOT/$f" >> "$OUTPUT_FILE"
            echo -e "\n" >> "$OUTPUT_FILE"
        fi
    done

    if [ -d "$PROJECT_ROOT/src" ]; then
        find "$PROJECT_ROOT/src" -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" \) | sort | while read -r file; do
            rel_path="${file#$PROJECT_ROOT/}"
            echo "=== FILE: $rel_path ===" >> "$OUTPUT_FILE"
            cat "$file" >> "$OUTPUT_FILE"
            echo -e "\n" >> "$OUTPUT_FILE"
        done
    fi

    FILE_SIZE=$(ls -lh "$OUTPUT_FILE" | awk '{print $5}')
    echo "[SUCCESS] Complete codebase saved to: codebase.txt ($FILE_SIZE)"
    echo "[INFO] Ready to upload directly to any AI chat session."
    read -p "Press Enter to continue..."
}

while true; do
    show_menu
    case "$OPTION" in
        1) do_init ;;
        2) do_stop ;;
        3) do_push ;;
        4) do_pull ;;
        5) do_start_iteration ;;
        6) do_finish_iteration ;;
        7) do_wipe ;;
        8) do_export ;;
        9) exit 0 ;;
        *) echo "Invalid option. Select 1-9."; sleep 1 ;;
    esac
done