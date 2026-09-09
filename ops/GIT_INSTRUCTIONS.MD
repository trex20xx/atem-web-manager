GIT INSTRUCTIONS
================

MENTAL MODEL
------------
Git = Version control system on your computer.
GitHub = Online hosting and backup for Git repositories.

Typical flow:

Code -> git add -> git commit -> git push -> GitHub


COMMON COMMANDS
---------------
Check status:

    git status

Add all changes:

    git add .

Create a commit:

    git commit -m "Describe what you changed"

Upload to GitHub:

    git push

Download latest changes:

    git pull

View history:

    git log --oneline

See GitHub remote:

    git remote -v

See file differences:

    git diff


BRANCHES
--------
Show current branch:

    git branch

Example:

    * main

Show all branches:

    git branch -a

Create and switch to a new branch:

    git checkout -b feature-name

or

    git switch -c feature-name

Switch to main:

    git checkout main

or

    git switch main

Delete a finished branch:

    git branch -d feature-name


FEATURE BRANCH WORKFLOW
-----------------------
Create branch:

    git checkout -b feature-dark-mode

Work and commit:

    git add .
    git commit -m "Add dark mode"

Go back to main:

    git checkout main

Merge:

    git merge feature-dark-mode

Delete branch:

    git branch -d feature-dark-mode


EMERGENCY COMMANDS
------------------
Discard changes to one file:

    git restore README.md

Discard all uncommitted changes:

    git restore .

WARNING: This permanently removes uncommitted changes.


GITHUB SETUP
------------
Create a repository on GitHub.

Connect local repository:

    git remote add origin https://github.com/USERNAME/REPO.git

Push for the first time:

    git push -u origin main


DAILY SOLO-DEVELOPER WORKFLOW
-----------------------------
1. Check changes:

    git status

2. Add changes:

    git add .

3. Commit:

    git commit -m "Describe what you changed"

4. Push:

    git push


GOOD COMMIT MESSAGES
--------------------
Good:

    git commit -m "Add camera discovery"
    git commit -m "Fix PTZ control bug"
    git commit -m "Improve device search"

Avoid:

    git commit -m "stuff"
    git commit -m "fix"


CURRENT PROJECT STATUS
----------------------
Repository root:

    atem-web-manager

Current branch:

    main

Default branch for future repositories:

    main

node_modules should NOT be committed.
Use .gitignore to exclude:

    node_modules/
    dist/
    .env
    .env.local
    .vscode/


BEST PRACTICE
-------------
For a solo React/Vite project:

- Stay mostly on main.
- Commit often.
- Push regularly.
- Create branches only for large features, risky changes, or experiments.
- Make a commit before major refactors.
