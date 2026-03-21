# Veritas Live Deploy

`veritas-live-monitor/` is the dedicated app workspace for the real monitor product.

Use it as a separate deploy from the main news site.

Recommended shape:

1. Keep the current site on Netlify.
2. Deploy `veritas-live-monitor/` as its own Netlify app using:
   Root directory: `veritas-live-monitor`
   Build command: `npm run build`
   Publish directory: `dist`
3. The main site now proxies `/live` to `https://veritas-live-monitor.netlify.app`.
4. If you choose a different Netlify subdomain, update the root `/_redirects` file to match it.
5. Run the monitor stack with its own API and cache layer, because the exact World Monitor experience depends on its own routes, seeders, and map/data services.

This workspace was copied in so the product can be branded and evolved inside the Veritas repo without changing the lightweight news frontend.
