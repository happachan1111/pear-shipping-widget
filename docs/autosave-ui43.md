# ui43: first three manual-save areas

## Scope
- Five seasonal events: item forecast and invoice-history table edits now debounce for 1 second. This records history only; it does not issue external invoices.
- Parcel/product editor: valid edits debounce for 1 second, stay open after saving, and show shared-master save status. Editor inputs pause during a write. Existing hidden mark values and optimistic updatedAt checks remain.
- Normal save buttons are hidden in these areas; retry is offered only after a failed pre-write read. Deletion, comments, posting, uploading and external issuance remain explicit.
- No calendar autosave was added. Operations, pear/crab schedule/deadline/sales-end/order/auction editors remain follow-up work. Holiday-shipping and card autosave implementations are unchanged.

## Safety
- Validate required fields and numbers; Japanese IME composition does not trigger a write.
- Serial seasonal writes; stable ID for a new row, then PUT for subsequent changes.
- Read before writing, compare the original baseline, preserve comments/unknown memo keys/noneditable fields, then read back and verify before showing saved.
- Updating our own cached baseline never silently refreshes another stale row's baseline without its inputs.
- Failed/uncertain writes are not automatically resent. Input remains on screen, and reload/check guidance is shown. No silent saved indicator on failure.
- Parent wrapper exposes pending state to portal navigation; beforeunload guards pending edits.
- This is not a transactional cross-user lock: the orders API has no atomic compare-and-swap. There is still a race between checking and writing; simultaneous edits to the same row should be avoided. Parcel API retains its existing server timestamp check.
- Notion and app guides updated. Saved edits are shared immediately; closing an editor is not an undo operation.

## Validation
All browser requests intercepted, service workers blocked, writes in memory only. No live API mutations.
- tests/more-autosave.cjs: debounce, five events, invoice, required fields, new POST then PUT, input during write, conflict, failure/retry, uncertain response, preview, IME, hidden mark/comments/unknown-field preservation.
- tests/more-autosave-integration.cjs: actual v84 extension chain, desktop/mobile, five events, wrapper pending delegation; autosave produces no new page errors.
- Actual-wrapper offline startup has 1–2 generic Failed to fetch rejections before editing. Reproduced with previous ui42 wrapper (BASELINE=1); not claimed fixed by this change. Subsequent tested autosaves complete. Live API save/readback is unverified because previous workspace access was blocked; production records were not used for tests.
- Existing card input-stability and all 20 guide navigation checks retained.
