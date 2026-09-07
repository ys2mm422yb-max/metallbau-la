# Larasser Metallbau – Launch checklist

This repository is still a public development/demo environment. Never store passwords, API keys, mail credentials or customer-private data here.

## Prepared in this branch

- [x] Production-oriented title, meta description, canonical URL, Open Graph basics and LocalBusiness structured data prepared.
- [x] `noindex,nofollow` intentionally remains on the demo.
- [x] `robots.txt` intentionally blocks crawling before launch.
- [x] `sitemap.xml` prepared for the production domain.
- [x] Branded `404.html` added.
- [x] Common legacy content redirects prepared in `_redirects`.
- [x] Contact form prepared for a later HTTPS form endpoint, including multipart uploads, file limits, validation, loading/error/success states and a honeypot.
- [x] No form/API secrets are stored in GitHub.
- [x] Public project images are localized into `assets/source/` by the one-time migration workflow so the new site no longer depends on the old IONOS image URLs.

## Blockers before the real domain is switched

- [ ] Decide final hosting provider.
- [ ] Configure the real HTTPS form endpoint in `launch-config.js` or the final hosting environment and send real test submissions to `info@larasser-metallbau.de`.
- [ ] Confirm how uploaded files are handled, retained and deleted by the selected form provider.
- [ ] Update/finalize the privacy policy for the actual hosting provider and contact-form processing.
- [ ] Migrate and approve local Impressum and Datenschutz pages before the old IONOS site is removed. Current links still point to the existing public IONOS pages.
- [ ] Client approval of public wording, project photos and final contact details.
- [ ] Confirm the preferred public email address and any source contradictions before production.
- [ ] Configure production redirects in the syntax supported by the final host if it does not support Netlify-style `_redirects`.
- [ ] Test `www.larasser-metallbau.de` and apex `larasser-metallbau.de`, HTTPS and redirect behavior.
- [ ] Run final Desktop Chromium, Android Chromium and iPhone WebKit QA on the production URL.
- [ ] Only after production tests pass: change `<meta name="robots">` to `index,follow` and change `robots.txt` from `Disallow: /` to `Allow: /`.
- [ ] After the live site is backed up and verified, make this repository private or remove the public development repository if desired.

## Important

Do not cancel or alter the current IONOS mail/domain setup until the new website is live and the existing mail flow has been independently verified.
