#!/usr/bin/env bash
# =========================================================================
# ATEM WEB MANAGER - MASTER OPERATIONS SUITE (v2.43.0)
# =========================================================================
# Streamlined 4-action CLI: Auto-export on run, Evaluation pipeline, Wipe.

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
    echo "        ATEM WEB MANAGER - OPERATIONS SUITE (v2.43.0)                   "
    echo "        Active Branch: [$CURRENT_BRANCH]                                "
    echo "========================================================================="
    echo "  [1] RUN & EVALUATE - Auto-export codebase, start bridge + UI, evaluate "
    echo "  [2] WIPE           - Secure token check & workspace erasure           "
    echo "  [3] EXPORT         - Package full codebase into codebase.txt for AI   "
    echo "  [4] EXIT                                                              "
    echo "========================================================================="
    read -p "Select an option [1-4]: " OPTION
}

cleanup_bridge() {
    BRIDGE_PIDS=$(lsof -t -i:8080 2>/dev/null)
    if [ -n "$BRIDGE_PIDS" ]; then
        kill -9 $BRIDGE_PIDS 2>/dev/null
        echo "[INFO] Background bridge daemon terminated cleanly."
    fi
}

do_export_silent() {
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
            CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
            read -p "Enter commit description: " COMMIT_DESC
            COMMIT_DESC="${COMMIT_DESC:-feat: update iteration changes}"

            if [ "$CURRENT_BRANCH" = "main" ]; then
                git add -A
                git commit -m "$COMMIT_DESC"
                git push origin main
                echo "[SUCCESS] Pushed to main."
                read -p "Press Enter to continue..."
                return
            fi

            git add -A
            git commit -m "$COMMIT_DESC" 2>/dev/null
            git checkout main
            git pull origin main
            git merge "$CURRENT_BRANCH" -m "merge: fold verified $CURRENT_BRANCH into main"
            git push origin main
            git branch -d "$CURRENT_BRANCH" 2>/dev/null
            git push origin --delete "$CURRENT_BRANCH" 2>/dev/null
            echo "[SUCCESS] Iteration merged cleanly into 'main' and branch pruned."
            read -p "Press Enter to continue..."
            ;;
        2)
            read -p "Enter commit message: " COMMIT_MSG
            COMMIT_MSG="${COMMIT_MSG:-chore: save progress}"
            CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
            git add -A
            git commit -m "$COMMIT_MSG"
            git push -u origin "$CURRENT_BRANCH"
            echo "[SUCCESS] Pushed to origin/$CURRENT_BRANCH."
            read -p "Press Enter to continue..."
            ;;
        3)
            echo ""
            read -p "Are you sure you want to DISCARD all changes and revert? [y/N]: " REVERT_CONFIRM
            if [[ "$REVERT_CONFIRM" =~ ^[Yy]$ ]]; then
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

    # Auto-export codebase on every run
    echo "[INFO] Auto-exporting latest codebase to codebase.txt..."
    do_export_silent

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
    do_export_silent
    FILE_SIZE=$(ls -lh "$PROJECT_ROOT/codebase.txt" | awk '{print $5}')
    echo "[SUCCESS] Complete codebase saved to: codebase.txt ($FILE_SIZE)"
    echo "[INFO] Ready to upload directly to any AI chat session."
    read -p "Press Enter to continue..."
}

while true; do
    show_menu
    case "$OPTION" in
        1) do_init ;;
        2) do_wipe ;;
        3) do_export ;;
        4) exit 0 ;;
        *) echo "Invalid option. Select 1-4."; sleep 1 ;;
    esac
done