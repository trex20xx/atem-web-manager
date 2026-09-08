# ATEM WEB MANAGER

## STRICT RULES OF ENGAGEMENT
1. **INCREMENT VERSION:** Update version numbers in comments and UI with every iteration.
2. **NO UNREQUESTED CHANGES:** Never modify existing functionality, logic, or design unless explicitly requested.
3. **GIT / GITHUB WORKFLOW:** Always provide the code to do whatever changes are necessary in Git + GitHub — **BUT ONLY AFTER CONFIRMING THE CHANGES ARE GOOD**.
4. **COMPONENTIZE:** Write clean, isolated, reusable React components.
5. **[LOCKED] ELEMENTS:** Never alter corner radii (`24px` pills), Video.js 30% transparency rules, YouTube SVG replicas, or the strictly enforced 16:9 Multiview scaling math.
6. **FULL FILES ONLY:** ALWAYS provide full updated files when changes are made. NOT snippets. 
7. **HANDOVER PROTOCOL:** Use the `HANDOVER.md` file to transfer context to new AI chat sessions.
8. **HARDWARE-IP LOCK PROTOCOL:** Dedicated hardware switcher panels must strictly check for authorized device IPs before mounting.

## QUICK START (ONE-LINER / DOUBLE-CLICK)
- **Mac Terminal One-Liner:**
  ```bash
  mkdir -p ~/Downloads/VSCODE/PROGRAMMING/ATEM_WEB_MANAGER && cd ~/Downloads/VSCODE/PROGRAMMING/ATEM_WEB_MANAGER && git clone https://github.com/trex20xx/atem-web-manager.git . && chmod +x INIT.sh && ./INIT.sh