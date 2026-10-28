# Holiday shipping auto-save (ui40)

## Scope
Only portal/holiday-shipping: confirmed/unconfirmed toggles, committed cell/name/note
changes, colors, supplier insertion, period changes, new-year creation. Other tools
retain their existing save modes. Viewing, selecting/copying colors, opening/cancelling
a dialog and printing never initiate a write.

## Scheduling and UI
- changed() debounces committed changes for 900ms; rapid edits coalesce.
- An open cell/supplier/period/year dialog postpones saving until it closes. Draft
  fields are not auto-submitted. Existing validation and destructive confirmations remain.
- Save is serialized with the existing busy lock, including readback. No plan switch
  or editing during that interval; normal controls are restored in finally.
- Footer shows pending/saving/saved/failed/conflict/uncertain. The normal Save button is removed in ui41.
  Retry is shown only for safe pre-write read failures when retry is actionable.
- Leaving/reloading before completion warns; there is no unload beacon or blind retry.

## Data safety
- Preserve record IDs, memo version 1, all hidden cells, styles, merges, notes and
  optional confirmation metadata. No data migration, cleanup, or seed writes on view.
- Fresh read + fingerprint comparison blocks known conflicts before writing. The
  existing server does not implement atomic compare-and-set: simultaneous requests
  between preflight and write are not guaranteed to be excluded. Readback still
  verifies the exact snapshot; no claim of cross-device atomic locking is made.
- Dirty remains true until a successful write AND matching readback. Any failure
  after a write attempt is uncertain (including network rejection or failed HTTP
  response), blocks further writes, keeps the plan and navigation guard, and asks
  for backup then Update. Never automatically retry POST/PUT.
- A preflight read failure keeps local changes and pauses automatic saving until
  explicit Retry. Known conflicts pause editing and saving until deliberate discard/update.
- Changing selection cancels the timer; the existing explicit discard confirmation
  remains. Peer changes still require Update/F5; this patch adds no polling or auto-refresh.

## Validation
Use only fully intercepted browser tests with an in-memory shared store. Cover
multiple independent users/regions/years, debounce/retry-only controls, modal draft
protection, slow writes, preflight failures, uncertain writes/readback, conflicts,
blank-row preservation, confirmation locks, region switching and print output.
Production APIs must not be used for test writes.

Run (Playwright and its browser must be installed):
```sh
node tests/holiday-autosave-matrix.cjs
node tests/holiday-autosave-behavior.cjs
node tests/holiday-autosave-failures.cjs
```
Optional PLAYWRIGHT_MODULE and CHROMIUM_PATH select an existing installation.
Screenshots go to TEST_OUTPUT_DIR or the OS temporary directory. Tests intercept
all network requests and never write to production.
