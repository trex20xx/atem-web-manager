#!/usr/bin/env bash
# =========================================================================
# ATEM WEB MANAGER - MASTER OPERATIONS SUITE (v2.32.0)
# =========================================================================
# Self-bootstrapping CLI with signal traps for automatic daemon termination.

REPO_URL="https://github.com/robertmirt/ATEM_WEB_MANAGER.git"
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
    echo "        ATEM WEB MANAGER - OPERATIONS SUITE (v2.32.0)                   "
    echo "        Active Branch: [$CURRENT_BRANCH]                                "
    echo "========================================================================="
    echo "  [1] INIT    - Install dependencies, start bridge, and launch UI       "
    echo "  [2] STOP    - Terminate background ATEM bridge daemon (Port 8080)     "
    echo "  [3] PUSH    - Stage all files, commit, and push to active branch      "
    echo "  [4] PULL    - Pull latest changes from remote for active branch       "
    echo "  [5] BRANCH  - Create and switch to a new Git branch                   "
    echo "  [6] MERGE   - Merge a specified branch into your current branch       "
    echo "  [7] WIPE    - Secure token check & complete project directory erasure "
    echo "  [8] EXIT                                                              "
    echo "========================================================================="
    read -p "Select an option [1-8]: " OPTION
}

do_init() {
    echo ""
    echo "[INFO] Verifying workspace..."

    # 1. Auto-Clone if project is missing
    if [ ! -f "$PROJECT_ROOT/package.json" ]; then
        echo "[INFO] Project files not detected in current directory."
        read -p "Enter installation target directory [$PROJECT_ROOT]: " USER_DIR
        PROJECT_ROOT="${USER_DIR:-$PROJECT_ROOT}"
        
        echo "[INFO] Cloning 'main' branch from $REPO_URL..."
        git clone -b main "$REPO_URL" "$PROJECT_ROOT"
        if [ $? -ne 0 ]; then
            echo "[ERROR] Git clone failed. Check your internet connection."
            read -p "Press Enter to continue..."
            return
        fi
    fi

    cd "$PROJECT_ROOT" || exit 1

    # 2. Verify Node
    if ! command -v node &> /dev/null; then
        echo "[ERROR] Node.js is not installed or not in PATH."
        read -p "Press Enter to continue..."
        return
    fi

    # 3. Install Frontend Dependencies
    if [ ! -d "$PROJECT_ROOT/node_modules" ]; then
        echo "[INFO] Installing frontend dependencies..."
        npm install
    fi

    # 4. Install Bridge Dependencies
    if [ ! -d "$PROJECT_ROOT/bridge/node_modules" ]; then
        echo "[INFO] Installing bridge dependencies..."
        cd "$PROJECT_ROOT/bridge" && npm install
        cd "$PROJECT_ROOT" || exit 1
    fi

    # 5. Terminate Lingering Bridge on Port 8080
    PIDS=$(lsof -t -i:8080 2>/dev/null)
    if [ -n "$PIDS" ]; then
        echo "[INFO] Terminating old bridge instance..."
        kill -9 $PIDS 2>/dev/null
    fi

    # 6. Launch Bridge Daemon in Background
    echo "[INFO] Starting ATEM Hardware Bridge (Background Daemon)..."
    cd "$PROJECT_ROOT/bridge" || exit 1
    nohup node server.js > /dev/null 2>&1 &
    cd "$PROJECT_ROOT" || exit 1

    # 7. Setup Trap: Auto-terminate bridge daemon when Vite exits (Ctrl+C)
    cleanup_bridge() {
        echo ""
        echo "[INFO] Vite UI stopped. Terminating background bridge daemon..."
        BRIDGE_PIDS=$(lsof -t -i:8080 2>/dev/null)
        if [ -n "$BRIDGE_PIDS" ]; then
            kill -9 $BRIDGE_PIDS 2>/dev/null
            echo "[SUCCESS] Bridge daemon terminated cleanly."
        fi
    }
    trap cleanup_bridge EXIT INT TERM

    # 8. Launch Vite Development Server
    echo "[INFO] Starting Vite UI Application..."
    npm run dev

    # Reset signal traps after clean exit
    trap - EXIT INT TERM
    cleanup_bridge
}

do_stop() {
    echo ""
    echo "[INFO] Hunting for running ATEM bridge processes on Port 8080..."
    PIDS=$(lsof -t -i:8080 2>/dev/null)
    if [ -z "$PIDS" ]; then
        echo "[INFO] No bridge daemon currently running on Port 8080."
    else
        kill -9 $PIDS 2>/dev/null
        echo "[SUCCESS] Background bridge daemon terminated."
    fi
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

do_branch() {
    echo ""
    read -p "Enter name for new branch: " BRANCH_NAME
    if [ -z "$BRANCH_NAME" ]; then
        echo "[ABORT] Branch name cannot be empty."
        read -p "Press Enter to continue..."
        return
    fi
    git checkout -b "$BRANCH_NAME"
    echo "[SUCCESS] Switched to new branch: $BRANCH_NAME"
    read -p "Press Enter to continue..."
}

do_merge() {
    echo ""
    CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
    echo "[INFO] Currently on branch: $CURRENT_BRANCH"
    git branch -a
    echo ""
    read -p "Enter the branch name you wish to merge INTO $CURRENT_BRANCH: " SOURCE_BRANCH
    if [ -z "$SOURCE_BRANCH" ]; then
        echo "[ABORT] Branch name cannot be empty."
        read -p "Press Enter to continue..."
        return
    fi
    git merge "$SOURCE_BRANCH"
    echo "[INFO] Merge operation completed."
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

    # Terminate active processes
    PIDS=$(lsof -t -i:8080 -i:5173 2>/dev/null)
    if [ -n "$PIDS" ]; then kill -9 $PIDS 2>/dev/null; fi

    cd /tmp || exit 1
    rm -rf "$PROJECT_ROOT"
    echo "[SUCCESS] Project directory completely erased from drive."
    exit 0
}

while true; do
    show_menu
    case "$OPTION" in
        1) do_init ;;
        2) do_stop ;;
        3) do_push ;;
        4) do_pull ;;
        5) do_branch ;;
        6) do_merge ;;
        7) do_wipe ;;
        8) exit 0 ;;
        *) echo "Invalid option. Select 1-8."; sleep 1 ;;
    esac
done