# Shared comment previews (ui38)

The comment button uses the same preview interaction as the holiday-shipping notes: hover/focus to read, leave/Escape to dismiss, click to open the existing editor. Touch uses tap/outside tap plus an explicit Edit/Add button. Zero and nonzero counts use gray and blue icons. Text is inserted with textContent, not HTML. Previews do not fetch, write, migrate or delete records.

## Coverage

- Five seasonal events: schedule and forecast comments, including the Excel-style forecast redraw. Empty draft product rows do not get a comment button until they have an ID.
- Pear/persimmon: shipping timeline, deadline calendar and editor, sales-end calendar, order/ship record comments.
- Crab: auction, deadline, order/ship record comments.
- Pear and crab bulletin post replies and document comments, legacy sorting and crab document views.
- Support request replies; unread tracking and original reply callbacks are unchanged.
- Operations calendar already consolidated comments into notes; holiday shipping retains its existing tooltip and confirmed-row locks. Plain memo/product-note fields are not converted into comments.

## Integration and persistence

`shared/comment-preview.js/css` provides `TearlumComments.register(selector, read, edit)` and `panel(node, read, title)`. Providers close over the page's original in-memory records, including closure-scoped maps. No extra API client or polling. Native dialog panels move the original controls (no clone), retain IDs and remain descendants of the original post. Existing add/edit/delete handlers and endpoints remain authoritative. MutationObservers only decorate new rendered buttons and update counts. Comment icon children do not trigger their parent record/date handlers. Desktop preview is pointer-transparent; long entries remain available in the editor. Touch preview supports scrolling.

Forecast comment buttons are restored after the Excel enhancer replaces table rows. The forecast serializer and sales row serializer preserve existing comment arrays rather than replacing them with an empty array when unrelated product fields are saved. New products still start with no comments. Author/date fields in original stored comments are retained. No Worker or schema changes.

## Verification

Mocked all Worker requests and external libraries. Tested widths 1440, 390, 320; zero/multiple/string/object comments; escaped HTML; hover dismissal; touch editor; original add/delete callbacks and save payload preservation. No production records were edited during testing.
