# ティアラムポータル

Existing tools share one lightweight navigation shell. Public URL: https://happachan1111.github.io/pear-shipping-widget/portal/

## Scope and safety
- Only portal/ files are new. No seasonal, Cloudflare, master, or existing parcel source is edited.
- Original seasonal v84.html is loaded unchanged, including original tool/menu buttons and all extension scripts.
- Sidebar fixed on desktop, collapsible with a persistent メニュー button. Mobile uses the same button for a drawer.
- No operations notices module, no new feature/data modules, no automatic expansion of public data scope.
- Existing tool URLs, data stores, authentication and permissions remain unchanged.
- No secrets, no API tokens, no customer data in portal source.

## Performance
- Home loads no embedded tool and makes no API requests.
- At most one tool iframe is mounted. Switching removes the previous tool (and its nested frames/timers), never loads all seasonal events in the background.
- No polling, MutationObserver, service worker, prefetch, third-party libraries, remote fonts or cache-busting timers in portal code.
- Stable original asset URLs allow the browser's existing cache behavior.
- Optional existing navigation listeners are detached on each switch.
- A 20-second loading notice offers the original URL and manual retry; it does not automatically retry writes or repeatedly reload.
- No promise of zero lag: original module processing, network and device performance still apply.

## Navigation
Home: #home. Seasonal: #mother, #father, #aged, #valentine, #white, #pear, #crab. Parcel: #koguchisu-sanin, #koguchisu-okinawa.
Internal tool navigation stays present to preserve features. This first integration adds a shared sidebar rather than rewriting individual tools. On tool switch any unsaved input is subject to the original tool's save/leave behavior; save work before switching.

## 運営カレンダー (v2)
- `#calendar`: 母の日、父の日、敬老の日、バレンタイン、ホワイトデーを統合。既存の共有 API / record_type / ID を利用する。移行や初期データの自動登録は行わない。
- 元の版に埋め込まれている父・敬老・バレホワの初期予定28件を `calendar-seeds.json` に保持。共有データに同じIDがあれば共有データを優先する。初期予定の編集はユーザーが保存したときだけ同じIDで共有データに登録する。
- 初期予定の削除時は `portal_schedule_exclusion` レコードに元IDを保存して、運営カレンダーでの再出現を防ぐ（旧単独URLの初期データには手を加えない）。通常の共有予定は既存DELETEを使う。
- 更新前の再取得で競合を検出。未知のメモ項目・コメントを保持する。コメントの追加・削除は予定の保存で反映。
- スマホは読みやすい日付別一覧、PCは月表示／一覧。読み込みは初回・手動更新・保存後のみ、定期ポーリングなし。サポートメニューも押したときだけ読み込む。
- ポータルの季節イベントは左メニューに予測・カード／伝票発行を分離。ポータル内だけイベントタブとメインタブ、個別スケジュールを非表示にする。元の季節イベントのファイルや単独URLは変更しない。梨・柿／カニは上部のイベント切替だけ非表示にし、ツール独自の操作は残す。
