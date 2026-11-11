# Midway Construction & Dirtwork website

Static site (plain HTML, CSS and JavaScript, no build step), built by Eagle Web Creation.

- `main` deploys to the preview at https://midway.eaglewebcreation.com
- `staging` is the test copy

The site is a **preview**: every page carries `noindex` (meta tag and the `X-Robots-Tag` header in `.htaccess`), and the estimate form on `/contact` sends nothing. Before launch on Midway's own domain: remove both noindex lines, swap the domain in canonical tags, schema, `sitemap.xml`, `robots.txt` and `llms.txt`, and wire up the form.

Town and area names appear only on `/faq` and in the hidden LocalBusiness schema (plus the shop's street address as contact info).
