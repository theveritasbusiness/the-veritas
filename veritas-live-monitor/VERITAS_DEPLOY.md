# Veritas Live Deploy

`veritas-live-monitor/` is the dedicated app workspace for the real monitor product.

Use it as a separate deploy from the main news site.

Recommended shape:

1. Keep the current site on Netlify.
2. Deploy `veritas-live-monitor/` as its own app on a dedicated host such as `live.your-domain`.
3. Point `VITE_LIVE_MONITOR_URL` in the main site to that live-monitor host.
4. Run the monitor stack with its own API and cache layer, because the exact World Monitor experience depends on its own routes, seeders, and map/data services.

This workspace was copied in so the product can be branded and evolved inside the Veritas repo without changing the lightweight news frontend.
