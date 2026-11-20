# Releases: how a version reaches production

Read this with `docs/AGENTS.md`. It says where code is built, where it is released, and who does each step.

## The three rules

1. **master is integration.** Every merged change lands on `master` first. It is tested and it is the place the next version is built. **master is never production.** Nothing is installed or deployed from a branch.
2. **Production is a semver tag.** A release is a git tag: `v1.0.0`, or a release candidate while 1.0 is not out (`v1.0.0-rc.25` is the latest one today). Dependents install a tag, never a branch (see the "Versions" section of `README.md`).
3. **No long-lived production branch.** There is no `production` or `stable` branch. A tag is the record.

## Who does what

- **Code** prepares a release in a PR, when Marcos or Hub asks. The release PR does the steps in `README.md` "Versions", up to but not including the tag: set `version` in `package.json`, add the CHANGELOG entry, `npm run build`, and commit `dist/`. Code never tags.
- **Hub** merges the release PR under the merge gate (`docs/AGENTS.md`), then **cuts the tag**: `git tag v<version>` on the merge commit on `master`, then `git push origin v<version>`. Hub cuts tags only from `master`, and only after the merge gate passes and the downstream check is done.
- **Marcos** decides when a release is needed, and approves any rule change to this file.

## What a dependent does

- Dependents pin by tag. `marccent-blocks` already does (`package.json`, `#v<version>`). `marccent-patterns` and `marccent-kits` pin by commit today; they move to a tag pin. Each move is a task in `docs/tasks/<repo>/`, with `Give to: Code in <repo>`. The task says: pin to the latest tag that exists when Code starts, rebuild, run the repo's checks.
- After a tag is cut, Hub runs the downstream check (`npm run affected`, `npm run status`) and writes one task per active dependent that needs the new tag.

## Hotfix: a fix for a released version while master has moved on

Use this only when a released tag needs a fix and `master` already has changes that would ship with the fix.

1. Hub creates the branch `release/<major>.x` from the tag (for example `release/1.x` from `v1.0.0`). Hub does this; it is a branch, not a change to code.
2. Code opens the fix PR **against `release/<major>.x`**, with one goal, and the checks the repo names.
3. Hub merges it under the merge gate, then cuts the next patch tag on the release branch (`v1.0.1`).
4. The same fix is then opened as a PR against `master`, so it is not lost. Code does that PR; Hub merges it.

`release/<major>.x` is deleted only when its major is no longer supported. That decision is Marcos's.

## Version rules

- Before 1.0: release candidates (`v1.0.0-rc.N`). They are tags like any other.
- From 1.0: semver, as `README.md` "What a version promises" says. The CHANGELOG names each release and its issues.

## Checks before a tag

- The release PR is merged, CI is green on the merge commit on `master`.
- `npm test` and `npm run build` on that commit, and `git diff --exit-code -- dist` shows nothing.
- The tag name equals `v` plus the `version` in `package.json`.

## Open points (not settled here)

- `docs/PRODUCT-LINE.md` section 6 ("Release") says the 1.0.0 release is the last step before the freeze ends. It does not say which branch a release comes from. This file says: from `master`, by tag.
- The architecture plan (a claude.ai artifact, linked from the project) was not readable from this repo, so this file was not checked against it.
