# カレンダーの日付操作と空欄取引先行（ui26）

## 日付クリックの実装

共通実装は `shared/calendar.js` の `openEmptyDate()` と `dateDialog()`。
`.day[data-date]` の空白部分をクリック／タップ、またはフォーカスして Enter・Space を押すと、指定日で既存の入力フォームを開く。クリックだけでは保存しない。

| 画面 | ポータルからの実際の接続先 | 処理 |
| --- | --- | --- |
| 梨・柿 受注締切 | `mothers-day/pear-deadline-tabs-v50.html` → `pear-deadline-calendar-v47.html` | 日付を入力しフォームへ移動 |
| 梨・柿 販売終了見込み | `mothers-day/pear-sales-tabs-v50.html` → `pear-sales-calendar-v47.html` | 日付を入力しフォームへ移動 |
| 梨・柿 発注・出荷件数 | `orders/index.html`（互換入口 `index-v56.html` も同じ本体へ接続）→ `legacy/orders-base.html` | 既存の日付ダイアログ |
| カニ せり情報 | `crab-auction/index.html` | 日付を入力しフォームへ移動。月外の日付も対応 |
| カニ 受注・発注締切 | `crab-deadline/index.html` → `legacy/deadline-base.html` | `openAdd(day)`。選択中の受注／発注を引き継ぐ |
| カニ 発注・出荷件数 | `crab-orders/index.html` → `legacy/orders-base.html` | 共通の日付ダイアログ |
| 梨・柿 出荷時期（月表示の互換画面） | `mothers-day/pear-calendar-v46.html` | 開始日・終了日を指定日にしフォームへ移動 |
| 梨 受注締切（単独入口） | `deadline/index.html` → `legacy/deadline-base.html` | `openAdd(day)` |

ポータルの「出荷時期」は現在 `index.html` → `legacy/timeline-base.html` の期間バー表示。これは月表示カレンダーではないため、既存のバー編集・コメント操作と表示構成を維持する。

- `.event`／`.entry`／`.item` の既存予定は元の編集・詳細処理を利用。
- コメント・メモ・集計ボタンは日付追加の処理対象外。
- カニせり情報の既存予定は詳細画面 →「編集する」の導線を維持。
- 保存・削除のAPI、データ形式、既存予定の内容は変更しない。

## 長期休暇の空欄取引先

`portal/holiday-shipping.js` の `isBlankSupplierRow()` と `drawGrid()` 内 `renderTable()` で、取引先名が空文字・空白のみ・null等の行を**表示時だけ**スキップする。

- `plan.sheets[0].cells` の行を削除・詰め直さない。
- 元の行番号・セル内容・色・備考・結合位置を保持する。
- 結合セルの表示上の行数だけを、表示される行数に合わせる。
- 保存時に空欄行を除去する処理は追加しない。

## 検証

本番の共有データには書き込まず、全Worker通信を模擬APIに置換して確認。

- 画面幅1440px／390pxで空白日クリック・キーボード操作、指定日の入力、フォーム表示、クリック時の書き込みなし。
- 既存予定の編集と元のIDの保持。
- ポータルの入れ子画面から各カレンダーへ接続。
- 山陰／沖縄 × GW／お盆／年末年始 × PC／スマートフォンの12通りで、空欄3行（空文字・空白・null）と入力済みセル・色・結合セルを用意。
- 別の表示行を編集 → 明示的に保存 → 再読み込みし、編集したセル以外の保存データ全体が一致することと、空欄行が引き続き非表示であることを比較。
