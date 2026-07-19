# Orders/Returns dogfood record

This is a candid worked record for `dogfood/orders-and-returns`, not an onboarding route or a recommended project architecture. Clean packed-route fixtures own first-run assertions; this project starts after approval with its own TypeScript package, policy, ESLint flat config, native suppression, and CI script. `test/dogfood.test.ts` replays its packed-artifact integration, debt-adoption, and repair loop.

## Approved choices

The project chose two contexts, `orders` and `returns`, plus `shared` and unscoped `application` paths. Its approved aliases are `Screen` (Client), `Workflow` (Manager), `Rules` (Engine), `Gateway` (ResourceAccess), `Api` (Resource), and `Shared` (Utility). It enables `contextFirewall` and has no role-edge overrides. The exact choices live in its `righting.json`; they are evidence for this project only.

## Integration and repair evidence

1. The existing modern flat config keeps its `lint` script unchanged while adding `eslintConfig()`.
2. The pre-existing `legacy-order` Manager dependency is captured as approved native `righting/role-dependency` debt and accepted with an explicit migration reason.
3. A new Orders refund workflow initially made a direct Returns workflow import. The normal lint loop reported `righting/cross-context-dependency`.
4. The repair instead uses the shared `return-status` Utility. The normal baseline and unchanged CI then pass.

## Friction and limits

Approval occurred outside Righting; the package cannot witness it. The flat-config adapter requires existing lint and resolver support, and native legacy-debt adoption requires a separate decision. Inspection reports declared policy and capability mappings but cannot show adapter activation. Static source checks do not prove runtime behavior, use-case validity, contract quality, real volatility, or queued Manager interaction semantics.

The project still has open refinement questions around advisory design-review usefulness, adapter performance at scale, composition-root scope, baseline identity, and future adapters. These are product questions, not instructions for adopters.
