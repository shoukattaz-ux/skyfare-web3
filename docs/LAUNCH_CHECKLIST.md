# Launch checklist (AdSense and Media.net)

Nothing below can be done by code alone. Tick in order. Approval is decided by the networks, not by this checklist.

## A. Identity and trust (30 min)
- [x] Publisher name (Waqas Khan) and contact email are pre-set. Confirm you read that mailbox daily; edit under Admin -> SEO & Legal if needed.
- [ ] Send a test message through /contact and confirm you see it under Admin -> Overview.
- [ ] (Optional) Add yourself as an Author with a short factual bio. Do not list qualifications you do not have.

## B. Content (the biggest factor)
- [~] All 15 guides are published (no review badge). Still recommended: review them per `docs/REVIEW_GUIDE.md`, add your own input, and mark Reviewed. Aim for **at least 10-15 published, reviewed guides**, several 800+ words, with your own input.
- [x] Destination/airline pages are expanded and live.
- [ ] Remove expired fares in Admin -> Flight Deals; keep dates accurate. Do not re-add "% off" claims you cannot prove.
- [ ] Confirm you have the right to use the six site images (or replace them with your own/licensed ones, with credits).
- [ ] Have the policy pages read by someone qualified in your jurisdiction.

## C. Deploy (1-2 h)
- [ ] Hosting with **HTTPS** and a real domain you own. `APP_URL` set to it. `TRUST_PROXY=1` behind one proxy.
- [ ] Persistent disk for `data/` and `uploads/`; schedule backups (Admin -> Users & Backups -> download).
- [ ] Change the generated admin password. Create a second admin as a spare.
- [ ] Visit /robots.txt, /sitemap.xml, a 404 URL (must show the 404 page), and a guide, on the live domain.
- [ ] Google Search Console: add the property, paste the verification code in Admin -> SEO & Legal, submit /sitemap.xml.

## D. Let it age and get real visitors
- [ ] Publish steadily (e.g. 1-2 reviewed guides a week) for several weeks before applying. Networks look for a real, maintained site.
- [ ] Get genuine visitors (search, social posts you write, communities where it is allowed). **Never buy traffic or click your own ads.**

## E. Apply
**Google AdSense**
- [ ] Sign up with the same Google account you use for Search Console. Add your domain.
- [ ] Admin -> Monetization: enter your publisher ID (`pub-...`) and save. This adds the official ownership meta tag and /ads.txt. **Leave the master switch OFF** while the site is under review.
- [ ] If you have visitors from the EEA, UK or Switzerland: set up a Google-certified consent tool (Google's Privacy & messaging) before turning ads on.
- [ ] After approval: create ad units in AdSense, paste each slot ID into Admin -> Monetization, tick Active, then turn the **master switch ON**.

**Media.net**
- [ ] Read Media.net's current eligibility rules (traffic location, language, content) before applying.
- [ ] After approval: enter the customer ID and each unit's crid/size; compare the loader with the code in your Media.net dashboard before enabling.

## F. After approval
- [ ] Keep ads to article pages (the site enforces this). Never add pop-ups, forced redirects or "click here" nudges near ads.
- [ ] Keep the corrections process real: answer messages, fix errors, update dates.
