# Angular library + showcase harness — setup steps

How this repo is wired so you can **edit the library and see changes instantly** in the
showcase app (no build/pack), and let **CI build, pack, and publish** the library on push.

Reproduce this on any new `ng-packagr` library workspace by following the steps below.

---

## 0. Starting point

An Angular workspace (`ng new --no-create-application`) containing two projects:

- `projects/ng-pdf-viewer-lib` — the library (`projectType: "library"`, built with `@angular/build:ng-packagr`)
- `projects/showcase` — an app used as the test harness (`projectType: "application"`)

Generate them if missing:

```bash
ng generate library ng-pdf-viewer-lib
ng generate application showcase
```

---

## 1. Point the showcase at the library **source** (the key trick)

By default the workspace maps the library import to the built output in `dist/`, so you must
`ng build` the lib before the app can see any change. Change the path alias in the root
`tsconfig.json` to point at the library's `public-api.ts` instead:

```jsonc
// tsconfig.json → compilerOptions.paths
"paths": {
  "ng-pdf-viewer-lib": ["./projects/ng-pdf-viewer-lib/src/public-api.ts"]
}
```

Now the showcase imports the library as `ng-pdf-viewer-lib` but resolves to raw source.
`ng serve` recompiles on every lib edit — **no build, no `npm pack`, no `npm link`.**

> Everything you want to consume from the app must be exported from `public-api.ts`.
> If you add a public type/component, add its `export * from './lib/...'` line there.

---

## 2. Build the test harness in the showcase app

Replace the generated `projects/showcase/src/app/app.ts` with a component that imports the
library and exercises its inputs. Ours renders `<ng-pdf-viewer-lib>` with live controls for
`src`, `height`, and `theme` (see the file for the full example). Key points:

- Import from the alias, not a relative path: `import { NgPdfViewerLib } from 'ng-pdf-viewer-lib';`
- Add it to the component `imports` array (standalone — no NgModule).
- Drive inputs with `signal()`s bound to form controls.

Run it:

```bash
npm start          # ng serve → http://localhost:4200
```

Edit anything under `projects/ng-pdf-viewer-lib/src` and the harness hot-reloads.

---

## 3. Build & pack scripts (used locally and by CI)

These already exist in `package.json`:

```jsonc
"build:lib":       "ng build ng-pdf-viewer-lib",
"build:lib:prod":  "ng build ng-pdf-viewer-lib --configuration production",
"pack:lib":        "npm run build:lib:prod && cd dist/ng-pdf-viewer-lib && npm pack",
"publish:lib":     "npm run build:lib:prod && cd dist/ng-pdf-viewer-lib && npm publish"
```

You only run these when you want a real tarball. Day-to-day development never needs them.

---

## 4. GitHub Actions

Two workflows, both run on **GitHub-hosted runners** — you do **not** need a self-hosted or
local runner.

**`lib.yml` (CI)** — runs on every push/PR to `main`:
`npm ci` → `npm run build:lib:prod` → `npm pack` → uploads the `.tgz` artifact.
This catches a broken build before you ever try to release.

**`release.yml` (manual release)** — you trigger it yourself:
GitHub → **Actions** → **Release library** → **Run workflow**. Pick the bump type
(`patch` / `minor` / `major`), or tick **dry-run** to build+pack without publishing. It then:

1. bumps the version in the library's `package.json`
2. builds + packs
3. publishes to **GitHub Packages** (`npm.pkg.github.com`)
4. commits the bump, tags it, pushes
5. creates a GitHub Release with the tarball attached

No local runner, no manual version editing, no tagging by hand.

### Publishing target: GitHub Packages (not npmjs.com)

The library publishes to **GitHub Packages**, so **no npm token / secret is needed** — the
workflow authenticates with the built-in `GITHUB_TOKEN` (it requests `packages: write`).

Two things make this work, already configured:

- `projects/ng-pdf-viewer-lib/package.json` has
  `"publishConfig": { "registry": "https://npm.pkg.github.com" }`.
- The package **scope must equal the GitHub account that owns the repo** — here `@dovernh`
  (your GitHub username, `github.com/dovernh`). If you move the repo to an org, rename the
  scope to that org.

The published package appears under the repo's **Packages** section on GitHub.

### Installing the library (for consumers)

GitHub Packages is authenticated even for public packages, so anyone installing it (including
you, in another project) needs an `.npmrc` telling npm where the `@dovernh` scope lives:

```ini
# .npmrc in the consuming project
@dovernh:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

`GITHUB_TOKEN` here is a **personal access token** (classic, with `read:packages`) exported in
your shell — or in CI, the job's built-in token. Then `npm install @dovernh/ng-pdf-viewer-lib`.

### Prefer to release from your machine instead?

You can skip Actions and publish locally. Authenticate npm to GitHub Packages once
(`npm login --registry=https://npm.pkg.github.com --scope=@dovernh`, using a PAT with
`write:packages` as the password), then:

```bash
npm version patch --prefix projects/ng-pdf-viewer-lib   # bump
npm run publish:lib                                     # build + publish (uses publishConfig)
git push --follow-tags
```

The workflow just automates exactly these steps.

---

## Summary of what to touch when

| Task                                | What you do                                                       |
| ----------------------------------- | ----------------------------------------------------------------- |
| Develop / test the library          | `npm start`, edit lib source, browser hot-reloads                 |
| Add something to the library's API  | export it from `public-api.ts`                                    |
| Verify a production build locally   | `npm run pack:lib`                                                |
| Ship to consumers                   | Actions → **Release library** → Run workflow (pick patch/minor/major) |
