# Oxlint adapter: fresh approval replay

**Decision:** do **not** approve the current project-local adapter's `complete role-dependency` claim. Approve the bounded migration and its one package-test portability repair; the support claim remains **deferred** until the required final-tree rows below pass and are recorded against the committed final source revision.

The dogfood checkout was read-only throughout: `uets-to-task` is clean at `806a18680a5f4c2f6d4fcb0ae8f5cfd4785c6cd2` on `dogfood/write-righting-adapter-replay`.

## Evidence capture and boundary

Command (project root):

```sh
npx righting inspect --json > /tmp/righting-replay/inspect.json
shasum -a 256 /tmp/righting-replay/inspect.json
```

Capture SHA-256: `bfb18a555bb2d79c4026c9b553687af39daedaa623ce77cb48017fcf81cc4e7b`.

The capture is the JSON below (exact, apart from pretty whitespace); it establishes `ok:true`, valid `righting.json`, inspection schema `1`, and contract version `1`. `adapter.status:"unknown"` is explicitly **not** activation evidence.

```json
{"schemaVersion":1,"command":"inspect","ok":true,"policy":{"path":"righting.json","status":"valid"},"adapter":{"status":"unknown"},"contract":{"contractVersion":1,"preset":"volatility@1","roles":["Client","Manager","Engine","ResourceAccess","Resource","Utility"],"configured":{"coverage":["src/**/*.{ts,tsx}"],"aliases":[{"name":"page","role":"Client","filenameSuffixes":[".page."],"directorySegments":["routes"]},{"name":"component","role":"Client","filenameSuffixes":[".component."],"directorySegments":["components"]},{"name":"lib","role":"Utility","filenameSuffixes":[],"directorySegments":["lib"]}],"generated":{"filenameMarkers":[".gen."],"directorySegments":[]},"protectedDependencies":[],"variations":["pureEngines"],"overrides":[{"name":"client-composition","from":"Client","to":"Client","effect":"allow","reason":"Pages and components compose other client-facing components in the approved project structure."}],"scopes":[],"compositionRoots":["router","routeTree","worker"],"guidance":{"domainVocabulary":"CONTEXT.md"}},"effective":{"allowedDependencies":{"Client":["Manager","Utility","Client"],"Manager":["Engine","ResourceAccess","Utility"],"Engine":["Utility"],"ResourceAccess":["Resource","Utility"],"Resource":["Utility"],"Utility":["Utility"]},"conventions":{"roles":{"Client":{"filenameSuffixes":[".client.",".page.",".component."],"directorySegments":["clients","routes","components"]},"Manager":{"filenameSuffixes":[".manager."],"directorySegments":["managers"]},"Engine":{"filenameSuffixes":[".engine."],"directorySegments":["engines"]},"ResourceAccess":{"filenameSuffixes":[".access."],"directorySegments":["access"]},"Resource":{"filenameSuffixes":[".resource."],"directorySegments":["resources"]},"Utility":{"filenameSuffixes":[".utility."],"directorySegments":["utilities","lib"]}},"tests":{"filenameMarkers":[".test.",".spec."],"directorySegments":["test","tests","__tests__"]},"generated":{"filenameMarkers":[".generated.",".gen."],"directorySegments":["generated"]},"compositionRoots":["composition-root","router","routeTree","worker"]},"policyRuleIds":["righting/role-dependency","righting/unresolved-local-import","righting/unclassified-source","righting/ambiguous-source","righting/test-dependency","righting/cross-context-dependency","righting/shared-to-context-dependency","righting/ambiguous-scope"],"protectedDependencyRules":[],"scopeRules":[],"scopeClassification":null,"capabilities":[{"id":"role-dependency","applies":true,"coverage":"statically-enforceable","policyRuleIds":["righting/role-dependency","righting/unresolved-local-import","righting/unclassified-source","righting/ambiguous-source","righting/test-dependency"],"establishes":["configured-role-dependency-boundaries","unresolved-local-import-is-forbidden"],"doesNotEstablish":["files-outside-coverage","runtime-dependency-behavior"]},{"id":"manager-interaction","applies":true,"coverage":"partially-checkable","policyRuleIds":["righting/role-dependency"],"establishes":["direct-manager-import-is-forbidden"],"doesNotEstablish":["queued-interaction-semantics"]},{"id":"protected-dependency","applies":false,"coverage":"statically-enforceable","policyRuleIds":["righting/role-dependency"],"establishes":["configured-resource-and-utility-package-classification"],"doesNotEstablish":["external-service-runtime-behavior","utility-package-access-restriction"]},{"id":"context-firewall","applies":false,"coverage":"statically-enforceable","policyRuleIds":["righting/cross-context-dependency","righting/shared-to-context-dependency","righting/ambiguous-scope"],"establishes":["cross-context-source-import-is-forbidden","shared-to-context-source-import-is-forbidden"],"doesNotEstablish":["cross-context-runtime-behavior"]},{"id":"design-judgment","applies":true,"coverage":"guidance-only","policyRuleIds":[],"establishes":[],"doesNotEstablish":["role-responsibility","real-volatility","contract-quality","runtime-behavior","use-case-validity"]}],"evidenceLimits":["files-outside-coverage","matched-files-are-inspection-evidence","runtime-behavior","maintainer-approval","adapter-activation"]}},"evidence":{"sourceSummary":{"covered":76,"roles":{"Client":23,"Manager":11,"Engine":24,"ResourceAccess":12,"Resource":0,"Utility":1},"tests":28,"compositionRoots":4,"unclassified":0,"ambiguous":0},"sourceViolations":[]}}
```

Coverage is deliberately only `src/**/*.{ts,tsx}`. `public/service-worker.js`, migrations, connector Python, SQL, assets, and deployment/configuration files are outside this static claim; no coverage expansion is proposed.

## What is installed now, and why it is not approvable

* Normal target lint is `oxlint --deny-warnings --report-unused-disable-directives .`; it passed (exit 0). The old local focused test `npx vitest run --config vitest.config.ts tools/righting-oxlint-plugin.test.ts` also passed (4 tests).
* `.oxlintrc.json` activates `./tools/righting-oxlint-plugin.mjs`; its support note claims complete `role-dependency`, but its four tests do not run every shipped conformance family. In particular they do not prove the target's `pureEngines` variation/override, all configured aliases, separate declared coverage, or the complete package artifact/consumer gate.
* The declared/locked dependency is old archive `vendor/righting-0.1.0-569b9eb.tgz` (`0d9a62bc…`), which does **not** ship `docs/adapter-conformance.md` or `righting/oxlint`. Runtime `node_modules/righting` is instead a mutable symlink to `/Users/kgnugur/Codes/Personal/righting-software-tooling`; its source is not the lock-selected artifact. This is an activation/reproducibility failure, not a policy failure.

## Candidate and required repair

Candidate source baseline is immutable Righting commit `b6aa8f7c6381a0a98934f6c5ec3b20ea3b583629` (`Add pinned supported Oxlint adapter`). It supplies public `righting/oxlint`, its conformance document, `docs/oxlint.md`, a pinned exact host tuple, and an adapter that consumes only CLI inspection output. `src/oxlint.ts`, Oxlint tests, support docs, and package manifest have no delta from that commit through candidate HEAD `66d9c4e6…`.

The candidate adapter tests passed: all 11 focused native tests and the packed-consumer test. The full suite exposed one genuine portability defect when run from a clean `/tmp` materialization: `test/init.test.ts` compared a lexical `/private/tmp/...` path with a resolved `/tmp/...` symlink target. It is unrelated to adapter runtime, but blocks the required package-full-test gate.

**Required candidate change (only):** in `righting-software-tooling/test/init.test.ts`, import `realpathSync` and compare both sides of the skills symlink assertion through `realpathSync`:

```ts
assert.equal(
  realpathSync(resolve(dirname(link), readlinkSync(link))),
  realpathSync(resolve(packagedSkillsDirectory, skill)),
);
```

A clean materialization of exactly `b6aa8f7…` plus that edit passed `npm test` (49/49), `npm run typecheck`, and `npm run build`. Packaged runtime contents are unchanged by this test-only repair.

The two fresh, clean source materializations of the packaged runtime produced the same `righting-0.1.0.tgz` SHA-256:

```
1a28c6fa36405aca14a2a86fae57c602c438ddf731176ab9e69261922e7ce029
```

The archive contains `package/dist/src/oxlint.js`, `package/docs/oxlint.md`, `package/docs/adapter-conformance.md`, and `package/package.json`; its public export is `"./oxlint":"./dist/src/oxlint.js"`. Tested tuple: Righting/adapter `0.1.0`, inspection/contract `1/1`, Oxlint `1.75.0`, Micromatch `4.0.8`, Node `26.5.0`.

## Exact proposed scope

### Righting source repository

| Action | Path | Change |
|---|---|---|
| Modify | `test/init.test.ts` | The one `realpathSync` portability repair above; commit it as the final candidate revision. |

### Dogfood repository

| Action | Path | Change |
|---|---|---|
| Add | `vendor/righting-0.1.0-oxlint-final.tgz` | Exact SHA-256 `1a28c6fa36405aca14a2a86fae57c602c438ddf731176ab9e69261922e7ce029`. |
| Delete | `vendor/righting-0.1.0-569b9eb.tgz` | Retire the archive without the Oxlint export/conformance document. |
| Modify | `package.json` | Set `devDependencies.righting` to `file:vendor/righting-0.1.0-oxlint-final.tgz`; retain exact `oxlint:1.75.0`. |
| Modify | `package-lock.json` | Regenerate solely for that literal file locator and its resulting integrity. |
| Modify | `.oxlintrc.json` | Replace `"./tools/righting-oxlint-plugin.mjs"` with `{"name":"righting","specifier":"righting/oxlint"}`. Keep the five enabled stable rule IDs and `respectEslintDisableDirectives:false`. |
| Delete | `tools/righting-oxlint-plugin.mjs` | Retired local runtime; replacement is packaged public entry point. |
| Delete | `tools/righting-oxlint-plugin.test.ts` | Retired proof; replacement is package `test/oxlint.test.ts` and `test/packed-oxlint.test.ts`. |
| Delete | `tools/righting-oxlint-adapter.md` | Retired record; replacement is shipped `node_modules/righting/docs/oxlint.md`. |

No product source, `righting.json`, generated route tree, suppression directive, or coverage change is proposed. The existing `oxlint-disable-next-line righting/role-dependency` debt remains exact native debt. The `respectEslintDisableDirectives:false` setting is retained because generated `src/routeTree.gen.ts` has a generator-owned `/* eslint-disable */`; Oxlint-specific Righting directives remain checked by the normal command.

## Evidence ledgers

### Passed

| Class | Evidence | Command/result |
|---|---|---|
| Contract input | Capture above | `npx righting inspect --json`: exit 0; valid schema/contract 1; 76 covered, 0 unclassified/ambiguous. |
| Current target activation | Local plugin load | `npm run lint`: exit 0. This proves only current local activation. |
| Current local regression | Existing local adapter test | Vitest focused command: 4/4 pass. Insufficient for claim. |
| Candidate package conformance | Public Oxlint entry | Candidate `node --test dist/test/oxlint.test.js`: 11/11 pass, including all role edges, forms/resolution, aliases, variations, coverage, classification, test/generated/root, suppression. |
| Candidate clean consumer | Public package entry | Candidate `node --test dist/test/packed-oxlint.test.js`: 1/1 pass; allowed normal lint exit 0 and deliberate forbidden exit 1 with `righting/role-dependency`. |
| Candidate final source | Full validation after sole repair | Clean final-source materialization: `npm test` 49/49, typecheck/build exit 0. |
| Proposed target activation | Isolated proposed tree using the digest-pinned tarball | `npm run lint`: exit 0; injected `replay-manager.manager.ts → replay-view.client.ts`: exit 1, literal `righting/role-dependency: Manager cannot depend on Client.` |

### Required before the support claim

| Gate | Exact final evidence | Observed |
|---|---|---|
| Final candidate identity | Commit the one test edit, record its SHA; run full suite from that committed revision. | pending |
| Artifact identity | Pack twice from two fresh materializations of that committed revision; both must equal the literal archive SHA above. | pending |
| Dogfood final tree | Apply exactly the scope table; install from lock with `npm ci`; assert public export, tar digest, normal lint, deliberate stable finding, focused/package records, `npm run check`, and `git diff --check`. | pending |
| Support record | Confirm installed `node_modules/righting/docs/oxlint.md` is shipped and unchanged, and append the final candidate revision, archive digest, target revision, capture SHA, commands, exits, and limits. | pending |

## Final-tree commands (literal, machine-asserting)

Run these **after the listed adds/changes/deletes**, from `/Users/kgnugur/Codes/Personal/uets-to-task`. They materialize an isolated copy of that final tree, not the mutable installed symlink.

```sh
set -euo pipefail
cd /Users/kgnugur/Codes/Personal/uets-to-task
test "$(shasum -a 256 vendor/righting-0.1.0-oxlint-final.tgz | awk '{print $1}')" = 1a28c6fa36405aca14a2a86fae57c602c438ddf731176ab9e69261922e7ce029
test ! -e vendor/righting-0.1.0-569b9eb.tgz
test ! -e tools/righting-oxlint-plugin.mjs
test ! -e tools/righting-oxlint-plugin.test.ts
test ! -e tools/righting-oxlint-adapter.md
node -e 'const x=require("./.oxlintrc.json"); if(JSON.stringify(x.jsPlugins)!==JSON.stringify([{name:"righting",specifier:"righting/oxlint"}])) process.exit(1); for(const r of ["righting/role-dependency","righting/unresolved-local-import","righting/unclassified-source","righting/ambiguous-source","righting/test-dependency"]) if(x.rules[r]!=="error") process.exit(1)'
npm ci --ignore-scripts
node -e 'const p=require("./node_modules/righting/package.json"); if(p.exports["./oxlint"]!=="./dist/src/oxlint.js") process.exit(1)'
test -f node_modules/righting/docs/oxlint.md
test -f node_modules/righting/docs/adapter-conformance.md
npm run lint
npm run check
git diff --check
```

```sh
set -euo pipefail
rm -rf /tmp/uets-righting-final-consumer
mkdir -p /tmp/uets-righting-final-consumer
rsync -a --delete --exclude=.git --exclude=node_modules /Users/kgnugur/Codes/Personal/uets-to-task/ /tmp/uets-righting-final-consumer/
cd /tmp/uets-righting-final-consumer
npm ci --ignore-scripts
npm run lint
printf 'export const value = 1;\n' > src/replay-view.client.ts
printf 'import { value } from "./replay-view.client"; export { value };\n' > src/replay-manager.manager.ts
set +e
./node_modules/.bin/oxlint src/replay-manager.manager.ts > /tmp/uets-righting-final-consumer/forbidden.out 2>&1
status=$?
set -e
test "$status" = 1
grep -F 'righting/role-dependency: Manager cannot depend on Client.' /tmp/uets-righting-final-consumer/forbidden.out
```

## Approval request and limits

**Approve now:** the exact Righting test portability repair and the exact dogfood migration scope above, anchored to the named archive digest and public `righting/oxlint` entry point.

**Do not approve yet:** the package/target `complete role-dependency` support claim. It becomes approvable only after every required row is observed against the committed final candidate and final dogfood tree.

If then approved, the claim is only `role-dependency`: it establishes `configured-role-dependency-boundaries` and `unresolved-local-import-is-forbidden` through the five listed stable IDs. `manager-interaction` establishes only direct Manager-import prohibition, not queued semantics. `protected-dependency`, `context-firewall`, and `design-judgment` are unsupported here; files outside coverage and runtime behavior remain outside static evidence. Resolution is limited to relative paths and string `package.json#imports` targets; TypeScript paths, bundler aliases, conditional/array imports targets, package exports, multi-policy workspaces, and Oxlint versions other than `1.75.0` are not claimed.
