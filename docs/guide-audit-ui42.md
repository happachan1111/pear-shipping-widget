# Guide audit — portal-ui42

## Scope
- Reviewed all 10 embedded guides against current UI routes, calendar handlers, shared comment previews, parcel controls, and holiday autosave state logic.
- Synced the corresponding Notion guide pages with current instructions; existing launch links now use the portal rather than obsolete v73/v75 wrappers.
- Guide changes only: no application records, storage schemas, or customer-response template contents were changed.

## Corrections
- Calendar: header Add is hidden; add using the day + in desktop month view. Agenda/mobile has no new-entry control in the current implementation. Documented this limitation rather than claiming an unavailable action.
- Seasonal guides: operational schedules use 備考, not an independent comment editor.
- Shared comment previews: hover to view, click to edit; touch users tap then 編集・追加. Existing save buttons and persistence remain unchanged.
- Holiday: autosave, 表に反映, conditional safe retry, confirmation locks, notes bubbles and print instructions aligned with current code. Removed duplicate H1 and corrected print scaling explanation.
- Parcel: Notion guide no longer instructs users to enter removed mark controls; region-scoped vendor and preview instructions now match embedded guide.
- Home: launch cards, notices, support unread indicator and foldouts documented consistently.
- Added explicit separation between tool instructions and Notion customer-response drafts. These are external Notion links, not a new AI reply/automatic sending feature. Notion permissions are unchanged.
- Notion links in guide rendering now remain clickable, opening a new tab with noopener/noreferrer. Non-allowlisted links remain plain text.

## Checks
- `node --check support/guides.js` and `support/guides-data.js`.
- `PLAYWRIGHT_MODULE=/data/browser-tests/node_modules/playwright-core MARKED_TEST_FILE=/data/guide-audit/marked.min.js node tests/guides-current-ui.cjs`
- 10 guides, 1440px desktop and 390px mobile selection/rendering; key instructions and approved Notion link behavior checked.
- Executable/unrelated URLs do not render as clickable links. All requests intercepted. Zero live API requests or writes.
- Full customer-data operation tests were not run for this documentation-only update.
