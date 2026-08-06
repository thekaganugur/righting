import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const testDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryDirectory = resolve(testDirectory, "../..");
const packagedResources = [
  "dist/src/cli.js",
  "dist/src/policy.js",
  "dist/src/capabilities.js",
  "dist/src/oxlint.js",
  "skills/righting-integrate/SKILL.md",
  "skills/righting-integrate/ESLINT.md",
  "skills/righting-adapter-authoring/SKILL.md",
  "skills/righting-adapter-authoring/APPROVAL.md",
  "skills/righting-deep-modules/SKILL.md",
  "skills/righting-volatility-review/SKILL.md",
  "skills/righting-volatility-review/LANGUAGE.md",
  "skills/righting-volatility-review/method-checklist.md",
  "skills/righting-volatility-review/HTML-REPORT.md",
  "skills/righting-module-design/SKILL.md",
  "skills/righting-module-design/DEEPENING.md",
  "skills/righting-module-design/DESIGN-IT-TWICE.md",
  "skills/righting-module-design/agents/openai.yaml",
  "skills/righting-domain-modeling/SKILL.md",
  "skills/righting-domain-modeling/CONTEXT-FORMAT.md",
  "skills/righting-domain-modeling/ADR-FORMAT.md",
  "skills/righting-domain-modeling/agents/openai.yaml",
  "README.md",
  "THIRD_PARTY_NOTICES.md",
  "docs/manual-maintainer.md",
  "docs/agent-assisted.md",
  "docs/adapter-conformance.md",
  "docs/policy-language.md",
  "docs/capabilities.md",
  "docs/eslint.md",
  "docs/oxlint.md",
  "docs/evidence/oxlint-inspection.json",
  "docs/evidence/oxlint-protected-inspection.json",
  "docs/evidence/oxlint-native-executions.json",
  "docs/legacy-debt.md",
  "docs/dogfood.md",
];

function run(command: string, arguments_: string[], cwd = repositoryDirectory) {
  return spawnSync(command, arguments_, { cwd, encoding: "utf8" });
}

test("the integration skill keeps unsupported source treatments visible", () => {
  const skill = readFileSync(resolve(repositoryDirectory, "skills/righting-integrate/SKILL.md"), "utf8");
  const syntheticGeneratedPath = "source/catalog/catalog-map.auto.ts";

  assert.match(
    skill,
    /generated source[\s\S]*active generated convention[\s\S]*righting\/unclassified-source/,
    syntheticGeneratedPath,
  );
  assert.match(
    skill,
    /do not[\s\S]*(role|composition root)[\s\S]*hide[\s\S]*generated treatment/i,
    syntheticGeneratedPath,
  );
  assert.match(skill, /version-controlled file inventory[\s\S]*outside coverage/, "public/catalog-worker.js");
  assert.match(
    skill,
    /uncommitted or untracked[\s\S]*ask which snapshot[\s\S]*stop[\s\S]*resume[\s\S]*only after[\s\S]*confirms/i,
  );
  assert.match(skill, /composition-root token[\s\S]*non-test[\s\S]*maintainer statement/, "source/launchpad.test.ts");
  assert.match(
    skill,
    /contract[\s\S]*evidence[\s\S]*JSON[\s\S]*working evidence[\s\S]*raw inspection output only on request/i,
    "source/catalog.client.ts",
  );
  assert.match(skill, /decision brief[\s\S]*exact candidate `righting\.json`[\s\S]*totals[\s\S]*material/i);
});

test("retired architecture-design workflows are not packaged", () => {
  assert.equal(existsSync(resolve(repositoryDirectory, "skills/righting-design-review")), false);
  assert.equal(existsSync(resolve(repositoryDirectory, "skills/righting-volatility-review/CONTRACT-DESIGN.md")), false);
});

test("packaged skill names use the Righting namespace and match their directories", () => {
  const directories = readdirSync(resolve(repositoryDirectory, "skills"), { withFileTypes: true }).filter((entry) =>
    entry.isDirectory(),
  );

  for (const directory of directories) {
    assert.match(directory.name, /^righting-/, directory.name);
    const skill = readFileSync(resolve(repositoryDirectory, "skills", directory.name, "SKILL.md"), "utf8");
    assert.equal(skill.match(/^---\nname: ([^\n]+)/)?.[1], directory.name);
  }
});

test("packaged architecture skills read the applicable domain documents before exploration", () => {
  for (const path of [
    "skills/righting-module-design/SKILL.md",
    "skills/righting-domain-modeling/SKILL.md",
    "skills/righting-volatility-review/SKILL.md",
  ]) {
    const skill = readFileSync(resolve(repositoryDirectory, path), "utf8");
    assert.match(skill, /before explor/i, path);
    assert.match(skill, /CONTEXT-MAP\.md[\s\S]*CONTEXT\.md/i, path);
    assert.match(skill, /relevant[^\n]*ADR/i, path);
  }
});

test("the volatility review hands selected discovery to deep-module design", () => {
  const review = readFileSync(resolve(repositoryDirectory, "skills/righting-volatility-review/SKILL.md"), "utf8");
  const checklist = readFileSync(
    resolve(repositoryDirectory, "skills/righting-volatility-review/method-checklist.md"),
    "utf8",
  );
  const report = readFileSync(resolve(repositoryDirectory, "skills/righting-volatility-review/HTML-REPORT.md"), "utf8");

  assert.match(review, /schema: volatility-candidate\/v1/);
  assert.match(review, /decision: selected \| rejected/);
  assert.match(review, /righting-deep-modules/);
  assert.match(review, /Speculative[\s\S]*cannot be the top recommendation/i);
  assert.match(review, /Stop before designing an Interface/i);
  assert.doesNotMatch(review, /CONTRACT-DESIGN\.md/);
  assert.doesNotMatch(review, /### 3\. Grilling loop/);
  assert.match(checklist, /handed to `righting-deep-modules`/i);
  assert.doesNotMatch(checklist, /Which candidate should we explore\?/);
  assert.match(report, /candidate hypothes/i);
  assert.match(report, /responsibility labels[\s\S]*not final Interface members/i);
  assert.doesNotMatch(report, /PlaceOrder|Price\(items\)|Debit\(account\)/);
  assert.doesNotMatch(report, /After: 3–5 atomic business verbs/);
});

test("module skills expose one review, one workflow, and one vocabulary layer", () => {
  const review = readFileSync(resolve(repositoryDirectory, "skills/righting-volatility-review/SKILL.md"), "utf8");
  const workflow = readFileSync(resolve(repositoryDirectory, "skills/righting-deep-modules/SKILL.md"), "utf8");
  const vocabulary = readFileSync(resolve(repositoryDirectory, "skills/righting-module-design/SKILL.md"), "utf8");
  const alternatives = readFileSync(resolve(repositoryDirectory, "skills/righting-module-design/DESIGN-IT-TWICE.md"), "utf8");
  const readme = readFileSync(resolve(repositoryDirectory, "README.md"), "utf8");

  assert.match(review, /stopping before Interface design/i);
  assert.match(review, /righting-deep-modules/);

  assert.match(workflow, /\.\.\/righting-volatility-review\/SKILL\.md/);
  assert.match(workflow, /\.\.\/righting-module-design\/SKILL\.md/);
  assert.match(workflow, /review-only[\s\S]*righting-volatility-review[\s\S]*stop/i);
  assert.match(workflow, /existing selected[\s\S]*volatility-candidate\/v1[\s\S]*do not rerun/i);
  assert.match(workflow, /grilling gate/i);
  assert.match(workflow, /facts[\s\S]*repository[\s\S]*decisions[\s\S]*maintainer/i);
  assert.match(workflow, /one question[\s\S]*recommended answer/i);
  assert.match(workflow, /draft dedicated Architecture Module document/i);
  assert.match(workflow, /target module root[\s\S]*each current or new file[\s\S]*Righting role/i);
  assert.match(workflow, /migration slice[^\n]*target module root[^\n]*every moved or new file[^\n]*Righting role/i);
  assert.match(workflow, /code-level facade[\s\S]*real caller/i);
  assert.match(workflow, /validate[\s\S]*maintainer accepts[\s\S]*docs\/architecture/i);
  assert.match(workflow, /Stop before[\s\S]*application code/i);

  assert.match(vocabulary.match(/^description: ([^\n]+)/m)?.[1] ?? "", /vocabulary layer/i);
  assert.match(vocabulary, /scale-agnostic/i);
  assert.match(vocabulary, /Architecture Module[\s\S]*volatility and change ownership/i);
  assert.match(vocabulary, /accepted[\s\S]*one project-conventional module root[\s\S]*folder or package/i);
  assert.match(vocabulary, /responsibility or knowledge[\s\S]*volatility[\s\S]*shared location[\s\S]*independent/i);
  assert.match(vocabulary, /volatility justifies[\s\S]*module root[\s\S]*navigable and enforceable/i);
  assert.match(vocabulary, /one conceptual Interface[\s\S]*facets/i);
  assert.match(vocabulary, /does not own[\s\S]*discovery[\s\S]*acceptance[\s\S]*migration/i);

  assert.match(alternatives, /supplied[\s\S]*domain-specific constraints/i);
  assert.match(alternatives, /configuration[\s\S]*performance semantics/i);
  assert.match(alternatives, /delegation[\s\S]*unavailable[\s\S]*sequentially/i);
  assert.match(readme, /righting-volatility-review[\s\S]*review-only/i);
  assert.match(readme, /righting-deep-modules[\s\S]*end-to-end workflow/i);
  assert.match(readme, /righting-module-design[\s\S]*vocabulary layer/i);
});

test("third-party notices retain the license for copied and adapted skills", () => {
  const notice = readFileSync(resolve(repositoryDirectory, "THIRD_PARTY_NOTICES.md"), "utf8");

  assert.match(notice, /https:\/\/github\.com\/mattpocock\/skills/);
  assert.match(notice, /2ab958093e83e0ec752e6c1c5932da465bf23e0c/);
  assert.match(notice, /skills\/righting-module-design/);
  assert.match(notice, /skills\/righting-domain-modeling/);
  assert.match(notice, /skills\/righting-volatility-review/);
  assert.match(notice, /Copyright \(c\) 2026 Matt Pocock/);
  assert.match(notice, /Permission is hereby granted, free of charge/);
  assert.match(notice, /subject to the following conditions/);
  assert.match(notice, /copyright notice and this permission notice shall be included in all/);
  assert.match(notice, /THE SOFTWARE IS PROVIDED "AS IS"/);
  assert.match(notice, /IN NO EVENT SHALL THE[\s\S]*AUTHORS OR COPYRIGHT HOLDERS BE LIABLE/);
  assert.match(notice, /root \[`LICENSE`\]\(LICENSE\)/);
});

test("the packed package publishes every onboarding reference without the retired docs command", () => {
  const packageDirectory = mkdtempSync(resolve(tmpdir(), "righting-package-docs-"));

  try {
    const packed = run("npm", ["pack", "--json", "--ignore-scripts", "--pack-destination", packageDirectory]);
    assert.equal(packed.status, 0, packed.stderr);
    const filename = (JSON.parse(packed.stdout) as Array<{ filename: string }>)[0]?.filename;
    if (filename === undefined) {
      throw new Error("npm pack did not report a tarball");
    }

    const tarball = resolve(packageDirectory, filename);
    const listed = run("tar", ["-tzf", tarball]);
    assert.equal(listed.status, 0, listed.stderr);
    const files = new Set(listed.stdout.trim().split("\n").map((path) => path.replace(/^package\//, "")));

    for (const resource of packagedResources) {
      assert.ok(files.has(resource), `${resource} is missing from the package`);
    }
    assert.equal(files.has("dist/src/docs.js"), false);
    assert.equal(files.has("dist/src/baseline.js"), false);
    assert.equal(files.has("dist/src/suppressions.js"), false);
    assert.equal(files.has("docs/agents/issue-tracker.md"), false);
    assert.equal(files.has("docs/agents/domain.md"), false);
    assert.equal(files.has("skills/righting-eslint/SKILL.md"), false);

    const consumerDirectory = resolve(packageDirectory, "consumer");
    mkdirSync(consumerDirectory);
    writeFileSync(resolve(consumerDirectory, "package.json"), '{"name":"consumer","private":true}\n');
    const installed = run("npm", ["install", "--save-dev", "--ignore-scripts", tarball], consumerDirectory);
    assert.equal(installed.status, 0, installed.stderr);
    const initialized = run("npx", ["righting", "init"], consumerDirectory);
    assert.equal(initialized.status, 0, initialized.stderr);
    assert.equal(existsSync(resolve(consumerDirectory, "node_modules/eslint")), false);
    assert.equal(existsSync(resolve(consumerDirectory, "node_modules/eslint-plugin-boundaries")), false);
    assert.equal(existsSync(resolve(consumerDirectory, "node_modules/oxlint")), false);
    assert.equal(existsSync(resolve(consumerDirectory, "node_modules/oxc-resolver")), true);

    const extracted = run("tar", ["-xzf", tarball, "-C", packageDirectory]);
    assert.equal(extracted.status, 0, extracted.stderr);
    for (const resource of packagedResources) {
      const contents = readFileSync(resolve(packageDirectory, "package", resource), "utf8");
      assert.doesNotMatch(contents, /righting docs/);
      assert.doesNotMatch(contents, /righting baseline/);
    }
    const eslintReference = readFileSync(resolve(packageDirectory, "package/docs/eslint.md"), "utf8");
    assert.match(eslintReference, /normalized contract[\s\S]*does not establish[\s\S]*adapter/i);
    assert.match(eslintReference, /--suppress-rule righting\/role-dependency/);
    assert.match(eslintReference, /--prune-suppressions/);
    const oxlintReference = readFileSync(resolve(packageDirectory, "package/docs/oxlint.md"), "utf8");
    assert.match(oxlintReference, /righting\/oxlint/);
    assert.match(oxlintReference, /Oxlint exactly `1\.75\.0`/);
    assert.match(oxlintReference, /inspection schema 1[\s\S]*normalized contract version 2/i);
    assert.match(oxlintReference, /protected-dependency[\s\S]*supported/i);
    assert.match(oxlintReference, /Oxc Resolver: `11\.24\.2`/);
    assert.match(oxlintReference, /design-judgment[\s\S]*Establishes: none[\s\S]*Does not establish:[\s\S]*policy-rule IDs: none/i);
    assert.match(oxlintReference, /target fixture tree revision: `[0-9a-f]{40}`/i);
    assert.match(oxlintReference, /oxlint-native-executions\.json[\s\S]*exact native commands/i);
    assert.match(oxlintReference, /Observed validation outcomes:[\s\S]*npm test[\s\S]*passed/i);
    const nativeEvidence = JSON.parse(
      readFileSync(resolve(packageDirectory, "package/docs/evidence/oxlint-native-executions.json"), "utf8"),
    ) as {
      inspectionCaptures: Record<string, string>;
      families: Record<string, { command: string; exitStatus: number; inspectionSha256: string }[]>;
    };
    assert.deepEqual(Object.keys(nativeEvidence.families).sort(), [
      "canonical-and-alias-classification",
      "declared-coverage",
      "default-role-edges",
      "generated-source-and-composition-roots",
      "policy-variations-and-protected-dependencies",
      "source-classification-violations",
      "static-dependency-forms",
      "test-source-treatment",
    ]);
    for (const executions of Object.values(nativeEvidence.families)) {
      assert.ok(executions.length > 0);
      for (const execution of executions) {
        assert.match(execution.command, /^node_modules\/.bin\/oxlint /);
        assert.ok(execution.exitStatus === 0 || execution.exitStatus === 1);
        const capture = nativeEvidence.inspectionCaptures[execution.inspectionSha256];
        assert.ok(capture !== undefined);
        assert.equal(createHash("sha256").update(capture).digest("hex"), execution.inspectionSha256);
        assert.equal((JSON.parse(capture) as { ok: boolean }).ok, true);
      }
    }
    const retainedInspections = Object.values(nativeEvidence.inspectionCaptures).map(
      (capture) => JSON.parse(capture) as { contract: { configured: { variations: string[]; overrides: object[] } } },
    );
    assert.ok(
      retainedInspections.some(
        ({ contract }) =>
          contract.configured.variations.includes("clientReadsAccess") &&
          contract.configured.variations.includes("pureEngines") &&
          contract.configured.overrides.length === 1,
      ),
      "the native ledger must retain the exact variation-and-override inspection input",
    );
    const integrationSkill = readFileSync(
      resolve(packageDirectory, "package/skills/righting-integrate/SKILL.md"),
      "utf8",
    );
    assert.match(integrationSkill, /chooses ESLint[\s\S]*read `ESLINT\.md` completely/i);
    assert.match(
      integrationSkill,
      /direct request to activate ESLint[\s\S]*valid normalized contract[\s\S]*maintainer-approved[\s\S]*skip the policy-candidate evidence work/i,
    );
    assert.match(integrationSkill, /inspection cannot establish approval[\s\S]*without repeating candidate derivation/i);
    assert.match(integrationSkill, /incomplete or invalid[\s\S]*do not load ESLint guidance[\s\S]*policy flow/i);
    const eslintWorkflow = readFileSync(
      resolve(packageDirectory, "package/skills/righting-integrate/ESLINT.md"),
      "utf8",
    );
    assert.doesNotMatch(eslintWorkflow, /^---/);
    assert.match(eslintWorkflow, /ask the maintainer[\s\S]*before running[\s\S]*--suppress-rule/i);
    assert.match(eslintWorkflow, /new findings[\s\S]*unchanged lint command/i);
    const adapterSkill = readFileSync(
      resolve(packageDirectory, "package/skills/righting-adapter-authoring/SKILL.md"),
      "utf8",
    );
    assert.match(adapterSkill, /righting inspect --json/);
    assert.doesNotMatch(adapterSkill, /righting\/contract/);
    assert.match(adapterSkill, /docs\/adapter-conformance\.md/);
    assert.match(adapterSkill, /stable[\s\S]*righting\/\*/i);
    assert.match(adapterSkill, /compose[\s\S]*(native|established)/i);
    for (const phrase of ["narrowest useful seam", "resolver-only", "complete-plugin", "replace overlapping owned behavior"]) {
      assert.match(adapterSkill, new RegExp(phrase, "i"));
    }
    assert.doesNotMatch(adapterSkill, /\b(?:eslint|oxlint)\b/i);
    assert.match(adapterSkill, /approved candidate artifacts[\s\S]*activation or upgrade/i);
    assert.match(adapterSkill, /APPROVAL\.md[\s\S]*completely[\s\S]*explicit approval/i);
    const approvalGuidance = readFileSync(
      resolve(packageDirectory, "package/skills/righting-adapter-authoring/APPROVAL.md"),
      "utf8",
    );
    assert.match(approvalGuidance, /package-conformance and target-activation ledgers/i);
    assert.match(approvalGuidance, /passed[\s\S]*observed exit[\s\S]*required[\s\S]*observed: pending/i);
    assert.match(approvalGuidance, /fresh materializations[\s\S]*both digests/i);
    assert.match(approvalGuidance, /isolated consumers[\s\S]*proposed final tree/i);
    const resolverGuidance = adapterSkill.slice(
      adapterSkill.indexOf("## 3. Choose the compose/own seam"),
      adapterSkill.indexOf("## 4. Implement through the native entry point"),
    );
    for (const phrase of [
      "total outcome",
      "resolved local target",
      "resolved external dependency",
      "host builtin",
      "unresolved with a reason",
      "dependency-path mapping",
      "project-root selection",
      "snapshot lifetime",
      "long-lived processes",
      "multi-root behavior",
    ]) {
      assert.match(resolverGuidance, new RegExp(phrase, "i"));
    }
    assert.match(resolverGuidance, /local-like[\s\S]*remain local[\s\S]*fail closed/i);
    assert.match(resolverGuidance, /overlapping[\s\S]*host precedence[\s\S]*unsupported[\s\S]*broader/i);
    const conformanceReference = readFileSync(
      resolve(packageDirectory, "package/docs/adapter-conformance.md"),
      "utf8",
    );
    assert.match(conformanceReference, /ESLint compiles[\s\S]*Oxlint interprets[\s\S]*black-box conformance/);
    const conformanceGuidance = adapterSkill.slice(
      adapterSkill.indexOf("## 5. Run black-box conformance"),
      adapterSkill.indexOf("## 6. Leave an honest support record"),
    );
    assert.match(conformanceGuidance, /allowed and forbidden/);
    for (const phrase of ["family ledger", "registration set", "registrations match that ledger"]) {
      assert.match(conformanceGuidance, new RegExp(phrase, "i"));
    }
    assert.match(conformanceGuidance, /every canonical role[\s\S]*filename and directory conventions[\s\S]*every configured alias/i);
    assert.match(conformanceGuidance, /both directions[\s\S]*coverage boundary/i);
    assert.match(adapterSkill, /policy-ID-specific suppression/i);
    assert.match(adapterSkill, /collapsed suppression granularity/i);
    const supportGuidance = adapterSkill.slice(adapterSkill.indexOf("## 6. Leave an honest support record"));
    assert.match(supportGuidance, /exact host[\s\S]*runtime version/i);
    assert.match(supportGuidance, /establishes[\s\S]*doesNotEstablish[\s\S]*policyRuleIds/i);
    assert.match(supportGuidance, /scenario family[\s\S]*fixture[\s\S]*native command[\s\S]*exit status/i);
    assert.match(supportGuidance, /adapter version recorded[\s\S]*equals[\s\S]*artifact's version/i);
    for (const phrase of ["performance claim", "representative benchmark", "regression budget"]) {
      assert.match(supportGuidance, new RegExp(phrase, "i"));
    }
    assert.match(supportGuidance, /clean[\s\S]*(packed|released)[\s\S]*public installation locator/i);
    for (const resource of ["dist/src/policy.js", "dist/src/policy.d.ts", "docs/policy-language.md", "docs/capabilities.md"]) {
      const contents = readFileSync(resolve(packageDirectory, "package", resource), "utf8");
      assert.doesNotMatch(contents, /eslint|suppression-file/i, `${resource} leaks adapter mechanics into the core contract`);
    }
  } finally {
    rmSync(packageDirectory, { recursive: true, force: true });
  }
});
