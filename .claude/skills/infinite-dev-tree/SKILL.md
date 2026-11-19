---
name: infinite-dev-tree
description: Create, set up, sync, list or remove a git worktree for Infinite Table development, with the untracked .env.local files, the /plans link, the pnpm installs and the library build in place, so the dev servers and tests work in it right away
when_to_use: When the user asks for a new worktree, a separate checkout or a parallel branch for work in this repo, to make an existing worktree usable (missing node_modules, missing .env.local, tests timing out on data), to find the ports a checkout's dev servers run on, or to remove / clean up / list worktrees
argument-hint: <branch> [--base <ref>] | setup [<path>] | remove <branch> | list | sync
---

# Infinite Table worktrees

All the work is done by `scripts/worktree.mjs`. Untracked files are copied from the **main checkout** (`git worktree list` shows it first).

Arguments: `$ARGUMENTS`

## Create

```bash
node scripts/worktree.mjs create <branch> [--base <ref>] [--path <dir>] [--no-install] [--no-build]
```

- If the arguments are just a branch name, use `create` with it. If there's no branch name, ask for one.
- The default location is `<repo>-worktrees/<branch>` next to the main checkout, e.g. `~/code/infinite-table-worktrees/my-branch`.
- An existing local branch is checked out. If `origin/<branch>` exists, the new branch tracks it. Otherwise a new branch starts from `--base`, which defaults to the main checkout's current branch.
- A branch named `www` exists on the remote, so `www/<anything>` cannot be created. Use another prefix for website branches (`docs/`, `home/`).

`create` runs `git worktree add` and then does what `setup` does.

## Setup (an existing worktree)

Worktrees made by T3 Code, Cursor or plain `git worktree add` start without the untracked files and without `node_modules`. From inside that worktree:

```bash
node scripts/worktree.mjs setup [--no-install] [--no-build]
```

or `node scripts/worktree.mjs setup <worktree path>` from anywhere. It:

1. Copies files that git doesn't track from the main checkout. It never overwrites a file that already exists:
   - every untracked env file (`.env`, `.env.local`, `.env.*`), in any folder of the repo: license key, data URL, tokens. Never print their contents.
   - untracked files under `.claude` (`settings.local.json`)
2. Links `/plans` to the main checkout's `plans` folder (a private nested git repo, where `AGENTS.md` and the plans live). Plans saved in a worktree land in that one repo: commit and push them from there.
3. Runs `pnpm install` at the root, which installs every folder (see below). It takes well under a minute: packages are hard-linked from the global pnpm store.
4. Runs `pnpm run build`: `source/dist` and `source/dist-vue`. The examples app returns 500 for every page without `source/dist/theme/*.css`, the Vue examples read `source/dist-vue`, and the docs site bundles `source/dist`. About a minute. `--no-build` skips it (e.g. for a docs-content-only change that doesn't run the site).

Run it in the foreground and report the worktree path and the copied files.

A worktree on a branch from before the switch to pnpm (no `scripts/install-all.mjs`) only gets steps 1 and 2: merge master into it, or install with npm as before.

## Installing

Every folder with a `pnpm-lock.yaml` (root, `source`, `examples`, `www`, `www/dataserver`, `devtools`, `devtools-ui`, `devtools-www`, `vue-playground`) is its own pnpm project with its own flat `node_modules`. `pnpm install` at the root installs all of them (its postinstall runs `scripts/install-all.mjs`). Never use `npm install` / `npm ci` there (a preinstall check stops it); `npm run <script>` is fine.

- Add or update a dependency inside its folder: `pnpm -C examples add <pkg>`. Commit that folder's `pnpm-lock.yaml`.
- `node scripts/install-all.mjs --only source,examples` installs some folders, `--clean` removes all `node_modules`, `--check` verifies the setup (each folder has a copy of the root `pnpm-workspace.yaml`: keep them identical).
- `data-server`, `www/functions/*`, `solid-*` are not part of this and still use npm.

## Dev servers and ports

Start servers through the package scripts (they go through `scripts/with-ports.mjs`). Only start them if the task needs them, and stop them when done.

```bash
pnpm -C www run serve:data     # local data server
pnpm -C examples run dev       # React + Vue test apps and the test-runner sidecar
pnpm -C examples run test      # build both apps, serve them, run Playwright
pnpm -C www run dev            # docs site
```

Ports are picked when a command starts its servers (`scripts/dev-ports.cjs`). Each service has a default. If a default is taken, typically by the same server of another checkout, the services that command starts move up together by 100, and again until a free set is found. So several checkouts can run servers and tests at once, and whoever starts first gets the defaults.

| service | default | next |
|---|---|---|
| examples (React) | 5555 | 5655 |
| examples (Vue) | 5556 | 5656 |
| vue-playground | 5557 | 5657 |
| test runner | 5599 | 5699 |
| docs site, static export (`serve-build`) | 3000 | 3100 |
| docs site (`next dev`) | 3001 | 3101 |
| data server (`serve:data`) | 3002 | 3102 |
| devtools-www | 3456 | 3556 |

Every command that starts servers prints a `[ports]` line per service with its URL (and a note when it is not the default), so read the port from the output. Where this checkout's servers run is also kept in `.dev-ports.json`, and that is how later commands find them:

```bash
node scripts/with-ports.mjs --print                                   # this checkout's ports, and which servers are running
node -p "require('./scripts/dev-ports.cjs').getPort('examples')"      # one of them
```

- Never assume 5555 / 3002 belong to this checkout: read the port. Playwright (`examples/playwright.config.ts`) does, so no local config file is needed.
- Servers started by separate commands end up together: a new command first tries the set that this checkout's running servers are in.
- `examples/.env.local` points `NEXT_PUBLIC_BASE_URL` at `http://localhost:3002/...`. The scripts redirect it to wherever this checkout's data server runs (or will run), for the dev servers and for test builds. If another checkout's data server has 3002, the examples expect this checkout's own on the next port: start `serve:data` here too. A URL set in the environment, or one that isn't the local data server, is left alone.
- `serve:data` restarts this checkout's data server if it is already running. It never stops another checkout's server: it takes the next port instead.
- Never stop a process by port number (`kill-port`, `lsof -t | xargs kill`) without checking that it belongs to this checkout: it may be another checkout's server.
- Commands started without the package scripts (`npx next dev -p …`) get neither a free port nor the data URL redirect.

## Sync

```bash
node scripts/worktree.mjs sync [<worktree path>]
```

Copies the env files and links `/plans` again, for example after a new `.env.local` appears in the main checkout. Only files missing in the worktree are copied.

## List / remove

```bash
node scripts/worktree.mjs list
node scripts/worktree.mjs remove <branch|path> [--delete-branch] [--force]
```

`remove` refuses when the worktree has uncommitted changes or untracked files other than the copied local files. In that case, show the user the list it prints and ask before re-running with `--force`. Delete the branch only when the user asks (`--delete-branch`). Stop that worktree's dev servers before removing it.

## Rules

- Don't remove worktrees with `rm -rf`, and don't remove one you didn't create unless the user asks.
- Don't commit or push in a worktree unless told to.
