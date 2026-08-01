import { createRequire } from "node:module";
import { roles, type NormalizedContract, type SourceClassification } from "./policy.js";

const { isMatch } = createRequire(import.meta.url)("micromatch") as {
  isMatch(path: string, patterns: string | readonly string[]): boolean;
};

function matchesMarker(filename: string, markers: readonly string[]): boolean {
  return markers.some((marker) => filename.includes(marker));
}

function matchesSegment(segments: readonly string[], conventions: readonly string[]): boolean {
  return conventions.some((convention) => segments.includes(convention));
}

export function classifySource(contract: NormalizedContract, sourcePath: string): SourceClassification {
  const path = sourcePath.replaceAll("\\", "/").replace(/^\.\//, "");
  if (!isMatch(path, contract.configured.coverage)) {
    return { kind: "outside-coverage" };
  }
  const parts = path.split("/");
  const filename = parts.at(-1) ?? path;
  const directories = parts.slice(0, -1);
  const test =
    matchesMarker(filename, contract.effective.conventions.tests.filenameMarkers) ||
    matchesSegment(directories, contract.effective.conventions.tests.directorySegments);
  const generated =
    matchesMarker(filename, contract.effective.conventions.generated.filenameMarkers) ||
    matchesSegment(directories, contract.effective.conventions.generated.directorySegments);
  const matches = roles.filter((role) => {
    const convention = contract.effective.conventions.roles[role];
    return matchesMarker(filename, convention.filenameSuffixes) || matchesSegment(directories, convention.directorySegments);
  });
  if (matches.length > 1) {
    return { kind: "violation", ruleId: "righting/ambiguous-source", roles: matches };
  }
  if (matches.length === 1) {
    return { kind: "role", role: matches[0]!, test, generated, editable: !generated };
  }
  const basename = filename.includes(".") ? filename.slice(0, filename.indexOf(".")) : filename;
  if (contract.effective.conventions.compositionRoots.includes(basename)) {
    return { kind: "composition-root", test, generated, editable: !generated };
  }
  if (test && !generated) {
    return { kind: "test", generated: false, editable: true };
  }
  return { kind: "violation", ruleId: "righting/unclassified-source" };
}
