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
