#!/bin/bash
# =============================================================================
# ATEM WEB MANAGER - UNIFIED MASTER OPERATIONS SUITE (macOS / Linux) (v2.69)
# =============================================================================
# Usage: bash ops/OPS.SH  (Execute from project root or ops/)
# =============================================================================

set -e

# Establish Project Root context
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [[ "$(basename "$SCRIPT_DIR")" == "ops" ]]; then
    PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
else
    PROJECT_ROOT="$SCRIPT_DIR"
fi
cd "$PROJECT_ROOT"

# Ensure OPS.SH retains POSIX executable bit
chmod +x "$PROJECT_ROOT/ops/OPS.SH" 2>/dev/null || true

# Discover Node / npm across standard macOS locations (Apple Silicon / Intel / NVM)
setup_node_env() {
    if command -v node >/dev/null 2>&1 && command -v npm >/dev/null 2>&1; then
        return 0
    fi

    if [ -x "/opt/homebrew/bin/node" ]; then
        export PATH="/opt/homebrew/bin:$PATH"
        return 0
    fi

    if [ -x "/usr/local/bin/node" ]; then
        export PATH="/usr/local/bin:$PATH"
        return 0
    fi

    if [ -f "$PROJECT_ROOT/.atem_node_path" ]; then
        CACHED_DIR=$(cat "$PROJECT_ROOT/.atem_node_path" | tr -d '\r\n')
        if [ -x "$CACHED_DIR/node" ]; then
            export PATH="$CACHED_DIR:$PATH"
            return 0
        fi
    fi

    echo ""
    echo "================================================================="
    echo "                 NODE.JS ENVIRONMENT REQUIRED                    "
    echo "================================================================="
    echo " 'node' and 'npm' were not detected in your current PATH."
    echo " Please enter the directory containing your node binary:"
    echo " (e.g. /opt/homebrew/bin or /Users/name/.nvm/versions/node/v20/bin)"
    echo "================================================================="
    read -p " Node.js directory: " USER_DIR
    USER_DIR=$(echo "$USER_DIR" | tr -d '"' | tr -d "'")

    if [ -x "$USER_DIR/node" ]; then
        echo "$USER_DIR" > "$PROJECT_ROOT/.atem_node_path"
        export PATH="$USER_DIR:$PATH"
        echo "[OK] Node.js path saved to .atem_node_path"
    else
        echo "[ERROR] 'node' executable not found in '$USER_DIR'."
        exit 1
    fi
}

# Auto-install dependencies if cloning into a clean machine
check_dependencies() {
    if [ ! -d "$PROJECT_ROOT/node_modules" ]; then
        echo ">>> Fresh clone detected. Installing frontend dependencies..."
        npm install
    fi

    if [ ! -d "$PROJECT_ROOT/bridge/node_modules" ]; then
        echo ">>> Installing hardware bridge dependencies..."
        (cd "$PROJECT_ROOT/bridge" && npm install)
    fi
}

# Kill lingering background daemons on ports 8080 (bridge) and 3000 (vite)
cleanup_ports() {
    local pids
    pids=$(lsof -ti tcp:8080,tcp:3000 2>/dev/null || true)
    if [ -n "$pids" ]; then
        echo "$pids" | xargs kill -9 2>/dev/null || true
    fi
}

# Synchronize modular iteration changelogs into master ops/CHANGELOG.MD
sync_changelog() {
    local master_file="ops/CHANGELOG.MD"
    local changelog_dir="ops/CHANGELOG"
    [ -d "$changelog_dir" ] || return 0

    if [ ! -f "$master_file" ]; then
        echo "# ATEM WEB MANAGER - Complete Version History" > "$master_file"
    fi

    for file in "$changelog_dir"/*.md; do
        [ -f "$file" ] || continue
        local vtag
        vtag=$(grep -oE '\[v[0-9]+(\.[0-9]+)*\]' "$file" | head -n 1 || true)
        if [ -n "$vtag" ]; then
            if ! grep -Fq "$vtag" "$master_file"; then
                echo "[OPS] Merging new changelog entry $vtag into $master_file..."
                local temp_file
                temp_file=$(mktemp)
                head -n 1 "$master_file" > "$temp_file"
                printf "\n" >> "$temp_file"
                cat "$file" >> "$temp_file"
                printf "\n" >> "$temp_file"
                tail -n +2 "$master_file" >> "$temp_file"
                mv "$temp_file" "$master_file"
            fi
        fi
    done
}

export_codebase() {
    echo ""
    echo "================================================================="
    echo "       SERIALIZING CODEBASE FOR AI HANDOVER (codebase.txt)       "
    echo "================================================================="
    OUTPUT_FILE="$PROJECT_ROOT/codebase.txt"
    > "$OUTPUT_FILE"

    for root_file in index.html vite.config.js package.json; do
        if [ -f "$PROJECT_ROOT/$root_file" ]; then
            printf "=== FILE: %s === \n" "$root_file" >> "$OUTPUT_FILE"
            cat "$PROJECT_ROOT/$root_file" >> "$OUTPUT_FILE"
            printf "\n \n\n" >> "$OUTPUT_FILE"
        fi
    done

    if [ -d "$PROJECT_ROOT/bridge" ]; then
        for bfile in "$PROJECT_ROOT/bridge"/*; do
            if [ -f "$bfile" ] && [ "$(basename "$bfile")" != "package-lock.json" ]; then
                printf "=== FILE: bridge/%s === \n" "$(basename "$bfile")" >> "$OUTPUT_FILE"
                cat "$bfile" >> "$OUTPUT_FILE"
                printf "\n \n\n" >> "$OUTPUT_FILE"
            fi
        done
    fi

    if [ -d "$PROJECT_ROOT/src" ]; then
        find "$PROJECT_ROOT/src" -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" \) | sort | while read -r src_file; do
            rel_path="${src_file#$PROJECT_ROOT/}"
            printf "=== FILE: %s === \n" "$rel_path" >> "$OUTPUT_FILE"
            cat "$src_file" >> "$OUTPUT_FILE"
            printf "\n \n\n" >> "$OUTPUT_FILE"
        done
    fi

    echo ">>> Successfully serialized workspace to codebase.txt <<<"
}

run_and_evaluate() {
    setup_node_env
    check_dependencies
    sync_changelog
    cleanup_ports
    export_codebase

    # Launch background bridge server
    if [ -f "$PROJECT_ROOT/bridge/server.js" ]; then
        echo ">>> Starting ATEM Hardware Bridge Daemon on Port 8080 in background..."
        (cd "$PROJECT_ROOT/bridge" && nohup node server.js >/dev/null 2>&1 &)
    fi

    echo ">>> Starting Frontend Server on Port 3000 with auto-launch..."
    set +e
    npm run dev
    set -e

    cleanup_ports

    local CURRENT_BRANCH
    CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

    echo ""
    echo "================================================================="
    echo "                  EVALUATION / REVERT PIPELINE                   "
    echo "================================================================="
    echo " Active Branch: $CURRENT_BRANCH"
    echo "-----------------------------------------------------------------"
    echo "  [1] MERGE TO MAIN   - Merge this feature branch into 'main',"
    echo "                        push to GitHub, and delete feature branch."
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

    case $EVAL_CHOICE in
        1)
            local CMSG=""
            read -p " Enter iteration description / commit message: " CMSG
            [ -z "$CMSG" ] && CMSG="feat: iteration update"

            if [ "$CURRENT_BRANCH" = "main" ]; then
                git add -A
                git commit -m "$CMSG" || true
                git push origin main
                echo ">>> Main branch updated and pushed. <<<"
            else
                git add -A
                git commit -m "$CMSG" || true
                git push origin "$CURRENT_BRANCH"
                git checkout main
                git pull origin main
                git merge "$CURRENT_BRANCH" --no-edit
                git push origin main
                git branch -d "$CURRENT_BRANCH"
                git push origin --delete "$CURRENT_BRANCH" 2>/dev/null || true
                echo ">>> Feature branch successfully merged into main and pruned. <<<"
            fi
            ;;
        2)
            local CMSG=""
            read -p " Enter commit message: " CMSG
            [ -z "$CMSG" ] && CMSG="wip: evaluation checkpoint"
            git commit -m "$CMSG" || true
            git push origin "$CURRENT_BRANCH"
            echo ">>> Committed and pushed to $CURRENT_BRANCH. <<<"
            ;;
        3)
            echo ">>> Discarding all uncommitted changes and cleaning workspace..."
            git reset --hard HEAD
            git clean -fd
            echo ">>> Workspace clean and reverted. <<<"
            ;;
        4)
            echo ">>> Returning to menu. Local changes left intact. <<<"
            ;;
        *)
            echo ">>> Invalid selection. Leaving files intact. <<<"
            ;;
    esac
}

secure_wipe() {
    echo ""
    echo "================================================================="
    echo "                  SECURE WORKSPACE WIPE PROTOCOL                 "
    echo "================================================================="
    TOKEN_FILE="$PROJECT_ROOT/.atem_workspace_token"
    REQUIRED_KEY="ATEM_MANAGER_SECURE_WIPE_KEY_2026"

    if [ ! -f "$TOKEN_FILE" ]; then
        echo "[ABORT] Security token missing: .atem_workspace_token not found."
        return 1
    fi

    FOUND_KEY=$(cat "$TOKEN_FILE" | tr -d '\r\n')
    if [ "$FOUND_KEY" != "$REQUIRED_KEY" ]; then
        echo "[ABORT] Invalid security key inside .atem_workspace_token."
        return 1
    fi

    read -p " Type 'WIPE' to completely destroy this project directory: " CONFIRM
    if [ "$CONFIRM" = "WIPE" ]; then
        cleanup_ports
        cd "$PROJECT_ROOT/.."
        rm -rf "$PROJECT_ROOT"
        echo ">>> Project workspace successfully erased. <<<"
        exit 0
    else
        echo ">>> Wipe aborted. <<<"
    fi
}

# Ensure background processes are cleaned up if the terminal window is closed or interrupted
trap cleanup_ports EXIT INT TERM

# Main Interactive Menu
while true; do
    echo ""
    echo "================================================================="
    echo "          ATEM WEB MANAGER - MASTER OPERATIONS CLI (v2.69)       "
    echo "================================================================="
    echo "  [1] RUN & EVALUATE  (Vite + Daemon, Auto-Export & Evaluation)"
    echo "  [2] WIPE            (Token-Verified Complete Directory Erasure)"
    echo "  [3] EXPORT          (Serialize workspace to codebase.txt)"
    echo "  [4] EXIT"
    echo "================================================================="
    read -p " Select action (1-4): " CHOICE

    case $CHOICE in
        1) run_and_evaluate ;;
        2) secure_wipe ;;
        3) export_codebase ;;
        4) 
            cleanup_ports
            echo ">>> Exiting master CLI. Goodbye! <<<"
            exit 0 
            ;;
        *) echo "[!] Invalid option. Please select 1-4." ;;
    esac
done