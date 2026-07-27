## Outcome
candidate

The existing approved Orders/Returns design is preserved. The repository paths are used only to verify its current realization, not to derive a replacement boundary.

## Evidence
- **Authoritative design record:** `docs/dogfood.md:3-7` says this fixture starts after approval and explicitly records two chosen contexts, `orders` and `returns`, plus approved `shared` and unscoped `application` paths. `docs/dogfood.md:13-14` records that a direct Orders-to-Returns workflow import was rejected and repaired through the approved shared `return-status` utility. `dogfood/orders-and-returns/righting.json:13-18` is the exact project policy implementing those choices. `docs/dogfood.md:18` correctly notes that Righting itself cannot witness the external approval.
- **Design evidence:** Orders contains order creation, total calculation, persistence, and refund-status behavior (`dogfood/orders-and-returns/src/orders/workflow/create-order.ts:1-6`, `src/orders/rules/calculate-total.ts:1-5`, `src/orders/gateway/orders-gateway.ts:1-5`, and `src/orders/workflow/refund-order.ts:1-5`). Returns exposes and accepts a return (`src/returns/screen/return-screen.ts:1-5` and `src/returns/workflow/accept-return.ts:1-3`). The application composes the two entry points without merging their models (`src/application/main.ts:1-4`). These source observations support the approved boundary but do not approve it.
- **Relationship evidence:** The checked-in repair test deliberately injects an Orders workflow import of the Returns workflow and expects `righting/cross-context-dependency`, then restores the shared-utility repair and expects CI to pass (`test/dogfood.test.ts:103-113`). This supports static isolation between the approved contexts and intentional composition/integration outside them.
- **Repository realization:** the approved globs exactly cover all 12 current TypeScript source files. No file matches two scope globs, and no covered file is unmatched. Current imports are intra-context, context-to-shared, or unscoped composition-root-to-context imports. Neither shared file imports a context.
- **Current terrain:** established contexts with a small, clean path realization, an intentional unscoped composition root, and an approved shared area. This is a dogfood fixture rather than rich production-domain evidence (`docs/dogfood.md:3`).
- **Counterevidence and uncertainty:** `refund-order.ts` lives in Orders while Returns owns return acceptance, and `shared/utility/return-status.ts` has Returns-flavored language while currently being consumed only by Orders. Those facts could indicate future model overlap or misplaced sharing, but they are not a material contradiction: the authoritative record explicitly documents this exact repair and sharing decision (`docs/dogfood.md:13-14`). Users, business outcomes, organizational ownership, change authority, schemas, deployment boundaries, and independently changing models are undocumented. No `CONTEXT.md`, `CONTEXT-MAP.md`, relevant ADR, product/use-case record, ownership record, or schema was available in the target. The requested root `plan.md` and `progress.md` were also absent at the exact supplied paths.
- **Recommendation:** preserve the approved two-context model. Confidence is **medium**: approval and current static realization are explicit and consistent, but strategic purpose, ownership, and domain language are only sparsely documented. A conservative alternative would be one coarse order/return-lifecycle context if future business evidence shows one model and one change authority; current authoritative records do not justify replacing the approved split with that alternative.
- **Inspected material:** root and target `AGENTS.md`; `docs/agents/domain.md`; `docs/dogfood.md`; `docs/policy-language.md`; `docs/capabilities.md`; the target policy, package/TypeScript/ESLint configuration, suppression file, all 12 current `src/**/*.ts` files, `test/dogfood.test.ts`, and relevant Git history for the fixture and policy.

## Approval
Existing project-owned approval is sufficient for this known-context replay: `docs/dogfood.md:3-7` records the project as post-approval and identifies the exact Orders, Returns, shared, and application choices; `righting.json:13-18` contains them; and `test/dogfood.test.ts:67-113` calls and exercises the policy as approved. No material contradictory evidence was found, so redundant maintainer approval is not requested.

The approval establishes the two named context identities, their static isolation, the shared and unscoped treatments, and the exact globs. Context owner/change authority remains `unknown`; the record does not identify a team or person.

## Approved design
- **Orders** — Purpose: serve order-side work, including creating, totaling, saving, and reporting refund status. Users/jobs are not documented; the code exposes an order screen as its entry point. Responsibilities and owned language evidenced in source are `Order`, `Create Order`, `Total`, `Save/Write Order`, and `Refund Order`. Owner/change authority: `unknown`. Current code fit: **inside**, with all seven files under the exact approved Orders scope. Confidence: **medium**, because the approved identity and implementation are explicit but strategic user/outcome documentation is absent.
- **Returns** — Purpose: serve the return-acceptance journey independently from Orders. Users/jobs are not documented; the code exposes a return screen as its entry point. Responsibilities and owned language evidenced in source are `Return`, `Accept Return`, and `Accepted`. Owner/change authority: `unknown`. Current code fit: **inside**, with both files under the exact approved Returns scope. Confidence: **medium**, for the same reason.
- **Permitted sharing:** `src/shared/**` is approved as context-independent shared source. It currently provides formatted amount and return-status utilities. Orders consumes both; Returns currently consumes neither. The name `return-status` is counterevidence to genericity, but the authoritative repair record explicitly approves it as shared and the file has no context import.
- **Relationships:** direct static Orders-to-Returns and Returns-to-Orders influence is forbidden; models are isolated rather than shared or translated by a direct context import. Orders currently consumes a shared status capability. The unscoped application composition root imports both context screens and invokes them (`src/application/main.ts:1-4`). No named DDD relationship is assigned because the evidence does not establish one, and utility reuse alone is not a Shared Kernel.

## Domain documents
None written or changed. This was a read-only replay. The existing project-owned record is `docs/dogfood.md`; no application or policy file was modified.

## Migration advice
- Make no context move or split now: the current source realization exactly matches the approved scopes and has no cross-context or shared-to-context violation.
- Treat `src/shared/utility/return-status.ts` as the first semantic reassessment point if return status gains behavior or context-specific meaning. Decide its owner from business language before moving it; if it becomes Returns-owned, introduce an explicit integration/translation seam rather than restoring a direct Orders workflow import.
- Keep `src/application/main.ts` as intentional unscoped composition/integration. Do not use `unscoped` to hide uncertain domain code.
- `src/orders/workflow/legacy-order.ts` has separately approved/suppressed Manager-to-Client role debt (`eslint-suppressions.json:2-5`; `docs/dogfood.md:11-12`). It does not contradict the context boundary, but it should remain visible and be removed independently when feasible.
- Safe validation sequence after any future semantic or path change: reclassify every covered file, check shared source for context imports, run `npx righting inspect --json`, run the normal lint command, run typecheck/CI, and separately reapprove the complete policy if policy adoption changes.

## Context firewall
**Exact candidate fragment (unchanged from the approved policy):**

```json
{
  "variations": ["contextFirewall"],
  "scopes": [
    { "kind": "context", "name": "orders", "path": "src/orders/**" },
    { "kind": "context", "name": "returns", "path": "src/returns/**" },
    { "kind": "shared", "path": "src/shared/**" },
    { "kind": "unscoped", "path": "src/application/**" }
  ]
}
```

All existing policy fields were retained. The temporary `righting.json` was a byte-identical copy of `dogfood/orders-and-returns/righting.json` (SHA-256 `53067311c7e6c802caaa9e9bcfe0639a08a7bf749c7b3ade4067cd4ffa3f358e`); the fragment above is therefore validated in the complete current policy, not in isolation.

**Temporary-mirror validation:** a mirror at `/var/folders/0g/nvztjn4d1pv5hxlz9py_nynm0000gn/T/righting-orders-replay.Naio8U` contained copied `src/`, the temporary policy, and access to the already installed dependencies. From that mirror, `npx righting inspect --json` exited `0` with `ok: true`, policy status `valid`, 12 covered sources, 0 unclassified, 0 ambiguous, and `sourceViolations: []`. It reported `context-firewall` as applicable and statically enforceable, with `righting/cross-context-dependency`, `righting/shared-to-context-dependency`, and `righting/ambiguous-scope`. The mirror was deleted afterward.

**Current-file classifications:**

| Current source file | Scope classification | Source classification |
|---|---|---|
| `src/application/main.ts` | intentional `unscoped` | composition root |
| `src/orders/api/orders-api.ts` | context `orders` | Resource |
| `src/orders/gateway/orders-gateway.ts` | context `orders` | ResourceAccess |
| `src/orders/rules/calculate-total.ts` | context `orders` | Engine |
| `src/orders/screen/order-screen.ts` | context `orders` | Client |
| `src/orders/workflow/create-order.ts` | context `orders` | Manager |
| `src/orders/workflow/legacy-order.ts` | context `orders` | Manager |
| `src/orders/workflow/refund-order.ts` | context `orders` | Manager |
| `src/returns/screen/return-screen.ts` | context `returns` | Client |
| `src/returns/workflow/accept-return.ts` | context `returns` | Manager |
| `src/shared/utility/format-amount.ts` | `shared` | Utility |
| `src/shared/utility/return-status.ts` | `shared` | Utility |

Ambiguous scope paths: **none**. Unmatched covered paths: **none**. Shared-to-context imports: **none**. Direct context-to-different-context imports: **none**. Observed firewall violations: **none**.

Additional safe checks against the current target were read-only: `npm run typecheck` exited `0`, and `npm run lint` exited `0` with `ESLint: No issues found`. The checked-in temporary-fixture test also provides counterfactual enforcement evidence: its injected Orders-to-Returns import must fail with `righting/cross-context-dependency` (`test/dogfood.test.ts:103-109`).

## Capability limits
`contextFirewall` can establish configured static cross-context and shared-to-context source-import restrictions. It does not establish runtime behavior, data or deployment isolation, organizational ownership, migration completion, or the quality of the context design. It also does not prove use-case validity, real volatility, queued interaction semantics, adapter activation, or behavior outside configured coverage. Inspection reports adapter activation as `unknown`; the successful normal lint run is separate evidence that the current ESLint path executed without reported issues.

A later policy-adoption workflow must revalidate and obtain approval for the complete `righting.json`.

## Next step
Preserve this candidate and the approved semantic split. Resume the caller's workflow from this result; revisit bounded-context design only if new business/ownership evidence materially contradicts Orders/Returns separation or makes `return-status` context-owned rather than intentionally shared.
