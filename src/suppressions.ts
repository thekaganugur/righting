export type LegacyDebt = Record<string, Record<string, number>>;

type JsonRecord = Record<string, unknown>;

function record(value: unknown, description: string): JsonRecord {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(`${description} must be a JSON object.`);
  }

  return value as JsonRecord;
}

// This is also the rule ID ESLint stores in eslint-suppressions.json.
const roleDependencyRule = "righting/role-dependency";

export function normalizeEslintSuppressions(value: unknown): LegacyDebt {
  const suppressions = record(value, "eslint-suppressions.json");
  const debt: LegacyDebt = {};

  for (const [file, valueByRule] of Object.entries(suppressions)) {
    const rules = record(valueByRule, `eslint-suppressions.json entry "${file}"`);
    const suppression = rules[roleDependencyRule];
    if (suppression === undefined) {
      continue;
    }

    const count = record(suppression, `eslint-suppressions.json ${file} ${roleDependencyRule}`).count;
    if (typeof count !== "number" || !Number.isInteger(count) || count < 1) {
      throw new Error(`eslint-suppressions.json ${file} ${roleDependencyRule} count must be a positive integer.`);
    }
    debt[file] = { [roleDependencyRule]: count };
  }

  return debt;
}
