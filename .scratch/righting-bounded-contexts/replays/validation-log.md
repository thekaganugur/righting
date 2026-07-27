# Replay validation log

All replay and evaluator agents ran with fresh context and read-only project instructions. Saved final artifacts use stable names in this directory; run IDs preserve execution provenance.

## `../uets-to-task`

1. Replay parent run `48a35893-4667-49ab-b23c-124c8f7f9a70`, child 0 (fresh session `5f4250f5/run-0`), produced a complete `unresolved` result. Independent evaluator parent run `8adb2b73-b74a-4baa-a906-165a196893bc`, child 0 (fresh session `6d58d424/run-0`), found unsupported single-owner language and an incomplete conservative-alternative card.
2. The skill was tightened to prohibit ownership inference from singular roles or Git authorship and to require complete cards for alternative contexts. Replay run `7d81ae1f-c769-4d27-8612-253c3dce73f8` fixed those defects. Independent evaluator run `e0389b04-a978-4dd8-9654-7aea3391043b` then found incomplete relationship fields.
3. The skill was tightened to require separate relationship direction, influence, exchange in each direction, and model treatment, without collapsing distinct external parties. Replay run `27e98cf9-7bcb-42e1-9afb-4b2ab3b61c68` produced the saved [`uets-to-task.md`](uets-to-task.md). Independent evaluator run `5c11bc3a-7165-4057-89be-de699dcc2616` passed every rubric category in [`uets-to-task-evaluation.md`](uets-to-task-evaluation.md).

No synthetic fixture was added: the failures were instruction-following defects exposed by the live replay and were covered by tightening and rerunning the skill.

## `dogfood/orders-and-returns`

Known-context control replay parent run `48a35893-4667-49ab-b23c-124c8f7f9a70`, child 1 (fresh session `5f4250f5/run-1`), produced [`orders-and-returns.md`](orders-and-returns.md). Independent evaluator parent run `8adb2b73-b74a-4baa-a906-165a196893bc`, child 1 (fresh session `6d58d424/run-1`), passed every control category in [`orders-and-returns-evaluation.md`](orders-and-returns-evaluation.md), including preservation of approved semantic boundaries, exhaustive current-file classification, exact candidate validation, and capability-limit accuracy.
