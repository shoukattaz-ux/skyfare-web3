/**
 * Default text for the trust / legal pages. These describe what the site actually does today.
 * They are stored in the database (legal_pages) and can be edited in Admin -> SEO & Legal.
 *
 * Supported markup: "## " / "### " headings, "- " bullet lists, **bold**, [text](url) links.
 * Tokens {{siteName}}, {{supportEmail}} and {{publisherLine}} are filled in at render time.
 *
 * IMPORTANT: these are plain-language policies, not legal advice. Have them reviewed by a
 * qualified person for your jurisdiction before relying on them.
 */

// Bump this number whenever the seed text changes in a way that should be installed on
// existing databases (previous text is always copied to legal_pages_backup first).
export const LEGAL_SEED_VERSION = 2;

export interface LegalSeedPage {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  content: string;
}

export const LEGAL_SEED: LegalSeedPage[] = [
  {
    slug: 'about',
    title: 'About {{siteName}}',
    metaTitle: 'About SkyFare | Independent Airfare Guides and Deal Roundups',
    metaDescription:
      'What SkyFare is, what it publishes, how it earns money, and what it does not do. An independent guide to US airfare, not a booking site.',
    content: `## What this site is

{{siteName}} is an independent publication about flying in and out of the United States. It has two parts:

- **Guides.** Written explainers on subjects such as when to book, how baggage fees add up, what a Basic Economy fare really includes, and what rights passengers have after a delay or cancellation.
- **Deal roundups.** A hand-maintained list of example fares, each showing the airline, route, dates, baggage allowance, and the date the price was recorded, with a link to the booking site where the fare was seen.

## What this site is not

- We are **not** an airline, a travel agent, or an online booking site. We do not sell tickets, hold your money, or see your payment details.
- We do **not** run a live fare search. Airline prices change many times a day. A fare shown here is a snapshot taken on the date shown on its card, and it may already be gone or higher when you click through. The price on the booking site at checkout is the only price that counts.
- We do not claim any airline, booking site or data provider endorses us.

## How we earn money

Some booking links are affiliate links: if you buy through one, the booking site may pay us a commission at no extra cost to you. The site may also show third-party display advertising, only after you have agreed to advertising cookies. Details are on the [Advertising and Affiliate Disclosure](/affiliate-disclosure) page. Money from affiliates or advertisers does not buy a better placement in a guide, and it does not change what we write.

## How content is made

See our [Editorial Policy](/editorial-policy) for how guides and fare entries are written, checked and updated, and our [Corrections Policy](/corrections-policy) for how to tell us about a mistake and what happens next.

## Who runs it

{{publisherLine}}

## Contact

Write to [{{supportEmail}}](mailto:{{supportEmail}}) or use the [contact form](/contact). Corrections, privacy requests and partnership questions all go to the same address.`,
  },
  {
    slug: 'editorial-policy',
    title: 'Editorial Policy',
    metaTitle: 'Editorial Policy | How SkyFare Guides and Fares Are Prepared',
    metaDescription:
      'How SkyFare researches, writes, reviews, dates and updates its airfare guides and fare entries, and how advertising is kept separate from editorial decisions.',
    content: `## Purpose

This page explains how content on {{siteName}} is prepared, so you can judge how much weight to give it.

## Guides

- **Scope.** We publish about flying from US airports: booking timing, airline fees and policies, airport and security programs, and passenger rights.
- **Sources.** Statements about airline rules, fees and government programs should be checked against the primary source, such as the airline's own fare rules and baggage pages, the US Department of Transportation, the TSA, or the European Commission. Where a guide depends on a figure that changes, it should say so and name where to check.
- **Review status.** Each guide moves through these states in our publishing system: Draft, Pending Review, Needs Revision, Reviewed, Published. A guide is only marked **Reviewed** after a person has checked it against the checklist below. When a guide is marked Reviewed, that is shown on the page together with the date. A guide without that mark has not yet been through a recorded review, and you should check its details with the airline before relying on them.
- **Tools.** Drafts may be prepared with software tools, including AI-assisted writing tools. A draft prepared that way is treated like any other unreviewed draft: it is not described as reviewed until a person has verified its facts.
- **Dates.** Every guide shows when it was first published and when it was last meaningfully updated. We do not change the "updated" date for cosmetic edits.
- **No invented material.** We do not publish made-up personal experiences, quotes, testimonials, statistics or credentials.

## Pre-publication checklist

Before a guide is marked Reviewed, the reviewer confirms that:

- the facts and figures were checked against a primary source,
- the text is original and not copied from another site,
- it is useful, complete and on topic, with no padding or repeated sections,
- the writing is clear and the grammar is correct,
- any claim that might date quickly is flagged or has a date attached,
- images are relevant and we have the right to use them,
- nothing in it is misleading, and
- any commercial link in it is disclosed.

## Fare entries

Fare entries are example prices recorded by hand on the date shown on each card, together with the baggage allowance, number of stops and travel dates. They are snapshots, not live quotes, and not offers from us. See the [Disclaimer](/disclaimer).

## Independence from advertising

Advertisers and affiliate partners do not review or approve our content, and they cannot pay to change a guide. Advertising is labelled and kept apart from article text. See the [Advertising and Affiliate Disclosure](/affiliate-disclosure).

## Feedback and corrections

Each guide has a "Was this helpful?" control, and you can write to us at any time at [{{supportEmail}}](mailto:{{supportEmail}}). See the [Corrections Policy](/corrections-policy).`,
  },
  {
    slug: 'corrections-policy',
    title: 'Corrections Policy',
    metaTitle: 'Corrections Policy | Reporting an Error on SkyFare',
    metaDescription:
      'How to report a factual error or an outdated fare on SkyFare, how quickly we aim to respond, and how corrections are recorded.',
    content: `## Reporting a problem

If you think something here is wrong, outdated or misleading, email [{{supportEmail}}](mailto:{{supportEmail}}) or use the [contact form](/contact). Please include the page address and, if you can, a link to the source that shows the correct information.

## What we do

1. We read every report that includes enough detail to check.
2. We verify the point against a primary source, for example the airline's published rules.
3. If the page is wrong, we fix it, and update the "last updated" date.
4. If the change affects what a reader would decide, we say so on the page, with the date, instead of silently rewriting it.
5. If a fare entry has expired or is no longer available, we remove it or mark it as ended.

We aim to look at reports within a few working days. We cannot promise a fixed response time, and we cannot reply to every message that does not need a response.

## What we cannot do

We cannot change an airline's fare, refund a ticket, or resolve a booking dispute. Those are matters between you and the airline or the booking site you bought from. Our [Disclaimer](/disclaimer) explains the limits of what a fare entry on this site means.`,
  },
  {
    slug: 'privacy',
    title: 'Privacy Policy',
    metaTitle: 'Privacy Policy | SkyFare',
    metaDescription:
      'What personal data SkyFare collects, why, which third parties (advertising and analytics) may set cookies, how long data is kept, and how to exercise your privacy rights.',
    content: `## Who is responsible

{{publisherLine}}

Questions about this policy or your data: [{{supportEmail}}](mailto:{{supportEmail}}).

## What we collect and why

- **Contact form.** If you write to us, we store your name, email address, subject and message so we can answer and keep a record of the exchange.
- **Email lists and price alerts.** These forms are only shown when email delivery has been switched on for the site. If you use them, we store your email address and, for an alert, the route and price limit you chose, in order to send you what you asked for.
- **Basic page statistics.** If you allow analytics, the site records a page address, an event type (such as "pageview") and a timestamp. This first-party record has no name, no IP address and no cookie attached to it.
- **Google Analytics 4.** Only if the site operator has entered a measurement ID and you have accepted analytics, Google Analytics loads and sets cookies that report how the site is used. Google acts on its own terms for that data: see [how Google uses data from sites that use its services](https://policies.google.com/technologies/partner-sites).
- **Advertising.** Only if the operator has switched advertising on and you have accepted advertising cookies, the site loads ad code from Google AdSense and/or Media.net. Those companies and their partners may set or read cookies and use identifiers such as your IP address and browser details to show and measure ads, and, if you allowed personalisation, to tailor them. See "Advertising and your choices" below.
- **Our own server logs.** Like most websites, our hosting records technical details of each request (IP address, time, address requested, browser type) for security and troubleshooting. These are kept for a limited period set by the host.

We do not sell your personal information for money, and we do not knowingly collect data from children under 13.

## Storage in your browser

The site keeps a few items in your browser's local storage: your light/dark preference, deals you chose to save, and your cookie choices. Sign-in cookies exist only for site administrators. Nothing in this list is used for advertising.

## Advertising and your choices

When advertising is active, a banner on your first visit asks you to accept or decline advertising and analytics. Ad code is not loaded until you accept, and you can change your mind at any time with **Cookie settings** in the footer. If you decline, no ads are requested and no ad cookies are set by us.

You can also use the industry opt-out tools, for example [Google Ads Settings](https://adssettings.google.com), [aboutads.info](https://optout.aboutads.info/) or [youronlinechoices.eu](https://www.youronlinechoices.eu/), and your browser's cookie controls. Opting out of personalised ads does not remove ads altogether.

## How long we keep data

- Contact messages: until we have dealt with them, and then for as long as needed to keep a record of the exchange; you can ask us to delete yours.
- Email addresses: until you ask to be removed.
- Page statistics: in aggregate form while they remain useful.

## Who receives data

Our hosting provider, and, where switched on and accepted by you, Google (analytics, AdSense) and Media.net. If we later add a service that receives personal data, this page will be updated before it goes live.

## Your rights

Depending on where you live (for example under the GDPR/UK GDPR in Europe or UK, or the California Consumer Privacy Act and similar US state laws), you may have the right to access, correct, delete or export the personal data we hold about you, to object to or restrict some processing, to withdraw consent, and to complain to a data protection authority. To use any of these rights, email [{{supportEmail}}](mailto:{{supportEmail}}) from the address you used with us. We may need to confirm it is you before acting.

## Security

We use HTTPS-only session cookies for administrators, hashed passwords, access checks on every administrative action, and rate limits on forms. No system is perfectly secure, and we cannot guarantee absolute security.

## Changes

If this policy changes in a way that matters, the date at the top of the page will change. Earlier wording is kept on file.`,
  },
  {
    slug: 'cookie-policy',
    title: 'Cookie Policy',
    metaTitle: 'Cookie Policy | SkyFare',
    metaDescription:
      'Which cookies and browser storage SkyFare uses, which are optional, and how to change or withdraw your cookie choices at any time.',
    content: `## Summary

{{siteName}} sets nothing for analytics or advertising until you say yes. You can change your answer at any time with **Cookie settings** in the footer.

## The three categories

### Essential storage (always on)

Browser local storage that makes the site work: your light/dark preference, deals you saved, and a record of your cookie choice. For administrators there is also a sign-in session cookie. No tracking or advertising use.

### Analytics (optional, off until you accept)

- A first-party counter that stores a page address, an event type and a time. No cookie and no personal identifier.
- Google Analytics 4, **only** if the site operator has entered a measurement ID. It sets cookies such as \`_ga\` to count visits and see how pages are used.

### Advertising (optional, off until you accept)

Only if advertising has been switched on by the operator. If you accept, Google AdSense and/or Media.net may set or read cookies and other identifiers to deliver, limit the frequency of, and measure ads. Their own policies govern what they do: [Google](https://policies.google.com/technologies/partner-sites), [Media.net](https://www.media.net/privacy-policy).

## Changing your choice

Use **Cookie settings** in the footer to reopen the choices. You can also delete cookies and local storage in your browser settings. After you withdraw consent, ad and analytics scripts are not loaded on later page views; cookies already set may remain until you clear them or they expire.

See also the [Privacy Policy](/privacy).`,
  },
  {
    slug: 'terms',
    title: 'Terms of Use',
    metaTitle: 'Terms of Use | SkyFare',
    metaDescription:
      'Terms for using SkyFare: what the site offers, that it is not a booking service, third-party links, acceptable use, and limits on liability.',
    content: `## Using this site

By using {{siteName}} you agree to these terms. If you do not agree, please do not use the site.

## What the site provides

Information about air travel, plus links to third-party booking sites. We are not an airline or travel agent, we do not sell tickets, and any purchase you make is a contract between you and the airline or the booking site. Their terms apply to that purchase.

## Information is general

Guides and fare entries are provided for general information. Rules, fees and prices change, may differ by passenger and itinerary, and may be out of date. Check the airline's current rules and the booking site's price before you buy. Nothing here is legal, financial or travel-insurance advice. See the [Disclaimer](/disclaimer).

## Third-party links and advertising

We link to sites we do not control and may show third-party advertising. We are not responsible for their content, availability, prices or practices.

## Acceptable use

Do not: scrape the site at a rate that harms it; attempt to break into the admin area or interfere with its operation; use the forms to send spam or unlawful material; or copy our guides in bulk to republish elsewhere. Short quotations with a link back are welcome.

## Intellectual property

Text, layout and original graphics are owned by the site operator or used under licence. Airline names and logos belong to their owners and appear only to identify the carrier.

## No warranty and limit of liability

The site is provided "as is" and "as available". To the extent the law allows, we are not liable for loss arising from your use of or reliance on the site, including a fare changing, a deal ending, or a third-party site being unavailable. Nothing in these terms limits liability that cannot be limited by law.

## Changes and contact

We may update these terms; the continued use of the site after a change means you accept it. Questions: [{{supportEmail}}](mailto:{{supportEmail}}).`,
  },
  {
    slug: 'affiliate-disclosure',
    title: 'Advertising and Affiliate Disclosure',
    metaTitle: 'Advertising and Affiliate Disclosure | SkyFare',
    metaDescription:
      'How SkyFare earns money: affiliate links to booking sites and labelled display advertising, and how that is kept separate from editorial content.',
    content: `## Affiliate links

Many "View deal" buttons and some links in guides lead to third-party booking sites. Where we are signed up with the site's affiliate programme, the link carries a tracking code. If you buy after clicking, the site may pay us a commission. **You pay the same price either way.** Affiliate links are marked \`rel="sponsored nofollow"\`.

We do not guarantee that any particular booking site is the cheapest, and which sites we link to is not decided by who pays most.

## Display advertising

The site may show display ads from Google AdSense and/or Media.net. Ads are labelled "Advertisement" and sit apart from article text. They are loaded only after you accept advertising cookies. We do not use pop-ups, pop-unders, forced redirects, or ads that look like navigation.

## Editorial independence

Advertisers and affiliate partners do not see or approve our content, and a commercial relationship does not change what a guide says. Read more in our [Editorial Policy](/editorial-policy).

## Questions

[{{supportEmail}}](mailto:{{supportEmail}})`,
  },
  {
    slug: 'disclaimer',
    title: 'Disclaimer',
    metaTitle: 'Disclaimer | SkyFare',
    metaDescription:
      'Fares on SkyFare are dated snapshots, not live quotes. Prices, baggage rules and availability change; confirm everything with the airline before you buy.',
    content: `## Fares are snapshots

A fare entry shows a price that was recorded by hand on the date on its card, for one adult, in US dollars, for the dates and cabin shown. It is **not** a live quote, an offer from us, or a promise that the seat still exists. Taxes, carrier-imposed fees and optional extras such as seat selection or checked bags may not be included.

The only price that counts is the one on the booking site when you check out.

## Rules change

Baggage dimensions, fees, change and refund conditions and entry requirements differ by airline, fare type and route and change over time. Guides explain general principles and give examples; they cannot cover every situation. Check the airline's own pages before you travel, and check passport, visa, health and customs requirements with the relevant government.

## Not professional advice

Content here is not legal, financial, medical or insurance advice. Passenger-rights guides give general information, not a judgement on your claim.

## Other sites

We are not responsible for sites we link to. See the [Terms of Use](/terms).`,
  },
];
