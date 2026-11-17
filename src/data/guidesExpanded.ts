import type { TravelGuide } from '../types/flight';

/**
 * Full-length rewrites of the guides that were too thin to publish.
 *
 * Editorial rules used for every text below:
 *  - evergreen explanation and method, not volatile figures: no airline fee, bag-size or fare amounts are
 *    stated as current fact; readers are told where to confirm them;
 *  - any numbers in examples are explicitly hypothetical round numbers ("suppose ...");
 *  - no personal experiences, quotes, testimonials, statistics or credentials are invented.
 *
 * These are DRAFTS for human review: they are installed as "Pending review" and cannot go public until a
 * person has checked them and ticked the checklist in Admin -> Posts & Guides (see docs/REVIEW_GUIDE.md).
 */
export const EXPANDED_GUIDES: Record<string, Partial<TravelGuide>> = {

  'how-to-find-cheap-flights': {
    title: 'How to Find Cheap Flights: A Practical Guide for US Travelers',
    metaTitle: 'How to Find Cheap Flights: A Practical Guide for US Travelers',
    metaDescription:
      'Practical, low-risk ways to find a lower airfare: how prices move, flexible dates, nearby airports, the true cost with bags, price alerts and the US 24-hour cancellation rule.',
    excerpt:
      'There is no secret day or trick that guarantees a low fare, but a handful of habits reliably help. Here is how fares move and how to use that to your advantage.',
    sections: [
      {
        heading: 'Why prices move',
        paragraphs: [
          'Airlines sell seats in groups of fare levels, and software adjusts how many seats are offered at each level as the flight fills and as the departure date approaches. When the cheapest level sells out, the lowest available price jumps. That is why the same flight can cost different amounts on different days, and why prices can go up or down without warning.',
          'Browser cookies and "incognito mode" are not what moves prices. If a fare changes between searches, the likelier reason is that inventory or demand changed. What you can control is flexibility: which days you fly, which airports you use, and when you decide to buy.',
        ],
      },
      {
        heading: 'Be flexible about the days',
        paragraphs: [
          'Demand is not even across the week. Many routes are busier at the start and end of the working week and on Sunday evenings, and can be quieter in between, but this differs by route, so test it rather than assume it. Use a flexible-date or calendar view on a fare comparison site to see prices across several days at once, and shift your trip by a day or two if the difference is meaningful.',
        ],
      },
      {
        heading: 'Compare nearby airports',
        paragraphs: [
          'Large cities often have more than one airport, and different airlines favour different ones. Price the trip from each and to each, then add what it costs in time and money to reach the airport. A fare that is lower by a modest amount may not be worth a long, expensive journey to a farther airport.',
        ],
      },
      {
        heading: 'Count the whole price',
        paragraphs: [
          'A low base fare can come with extra charges for bags, seats and changes. Before you buy, add what you will actually need and compare totals, not headlines. Our guide to comparing budget and full-service airlines walks through the method.',
        ],
        bullets: [
          'Carry-on and checked bag fees, each way.',
          'Seat selection, if you need to sit together.',
          'Change and cancellation terms, if your plans might move.',
          'The cost and time of reaching the airport.',
        ],
      },
      {
        heading: 'Use price alerts and set a target',
        paragraphs: [
          'If your dates are not urgent, watch the route for a week or two. Notice what the range looks like, decide what a good price is for you, and buy when it appears. Many comparison sites let you track a route and email you when it changes. Setting a target stops you from either panic-buying or waiting indefinitely.',
        ],
      },
      {
        heading: 'Know your cancellation protection',
        paragraphs: [
          'For flights to, from or within the United States, US rules require airlines to either hold a reservation at the quoted fare for 24 hours or allow you to cancel within 24 hours of booking for a full refund, where the booking is made at least a week before departure. That gives you room to lock in a price you like and think it over. Check the current wording on the US Department of Transportation website, and read the specific airline\'s own policy.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Does searching in incognito mode make flights cheaper?',
        answer: 'There is no reliable evidence that it does. Fares change because inventory and demand change, not because of your browser.',
      },
      {
        question: 'How does the US DOT 24-hour rule work?',
        answer: 'For bookings made at least seven days before departure on flights to, from or within the US, airlines must either hold the fare for 24 hours or allow free cancellation within 24 hours of booking. Check the DOT site for the current rule.',
      },
      {
        question: 'Is there a best day of the week to buy?',
        answer: 'Not a reliable one. Focus on flexible travel days and a target price instead.',
      },
    ],
  },

  'best-time-to-book-flights': {
    title: 'When to Book Flights: Understanding Booking Windows and Seasons',
    metaTitle: 'When to Book Flights: Booking Windows and Seasons Explained',
    metaDescription:
      'How booking timing works: why very early and very late bookings can both cost more, how seasons and holidays change the picture, and a simple method to find your own best moment to buy.',
    excerpt:
      'Book too early and you may pay more than necessary; book too late and prices often climb. Here is how to think about timing without relying on a magic number.',
    sections: [
      {
        heading: 'There is no single best day',
        paragraphs: [
          'Articles often name an exact number of weeks before departure as the cheapest time to buy. In practice the best moment depends on the route, the season, the airline and what other travellers are doing. Treat any fixed rule with caution, including any in this guide, and use the method below to find the pattern for your own trip.',
        ],
      },
      {
        heading: 'The general shape of the curve',
        paragraphs: [
          'For many routes, prices tend to be high when seats are first released, ease in the middle period, and rise as the departure date approaches and the cheaper fare levels sell out. Long-haul and holiday travel usually rewards earlier planning, while short, flexible domestic trips can often wait longer. This is a tendency rather than a rule, and some flights break it.',
        ],
      },
      {
        heading: 'Seasons and holidays',
        paragraphs: [
          'Demand swings with school holidays, public holidays and local events, and fares follow. Peak periods generally need earlier booking; quieter shoulder periods, the weeks between peak and off-peak, are often cheaper and less crowded. Check the dates of holidays at both ends of your trip. If your dates are fixed to a major holiday, start watching fares early and do not expect last-minute bargains.',
        ],
      },
      {
        heading: 'Find your own pattern',
        paragraphs: [
          'Pick the route you care about and look at it regularly for a few weeks, noting the price and the days left before departure. Many comparison sites will chart the price or notify you of changes. When you see a price at the low end of the range you have observed, and it fits your budget, buy. If you are comparing more than one route, this approach works for each.',
        ],
        bullets: [
          'Note the lowest and typical price you see for your dates.',
          'Decide your target price before the alert arrives.',
          'Allow for the time you need: visas, leave from work, and family plans.',
        ],
      },
      {
        heading: 'Protect yourself while you wait',
        paragraphs: [
          'If you are worried about waiting too long, consider a fare with flexible change terms, and remember the US cancellation window for bookings made well before departure (verify the current rule on the DOT website). If your plans are uncertain, the flexibility can be worth the higher price.',
        ],
      },
    ],
    faqs: [
      {
        question: 'When should I book Thanksgiving or Christmas flights?',
        answer: 'Holiday periods are high-demand, so planning earlier generally helps. Start watching prices well ahead and buy when a fare fits your budget.',
      },
      {
        question: 'Is it cheaper to book far in advance?',
        answer: 'Not always. Very early prices can be higher than the middle period for some routes. Track your route to see.',
      },
      {
        question: 'Does the day of the week matter?',
        answer: 'The days you fly can matter more than the day you buy. Compare a few travel days.',
      },
    ],
  },
  'budget-airlines-comparison': {
    title: 'Budget Airlines vs. Full-Service: How to Compare the Real Total Cost',
    metaTitle: 'Budget vs. Full-Service Airlines: Compare the Real Total Cost',
    metaDescription:
      'A low base fare is only part of the price. Learn how unbundled fares work and how to compare bags, seats and changes so you know the true total before you book.',
    excerpt:
      'A low base fare rarely tells you what a trip will cost. Here is a simple way to compare an unbundled budget fare with a full-service ticket, line by line.',
    sections: [
      {
        heading: 'What "unbundled" actually means',
        paragraphs: [
          'Most traditional airlines sell a ticket that already includes a seat, a carry-on and often a checked bag on longer routes. Ultra-low-cost carriers do the opposite: the base fare covers the seat on the plane and little else. A carry-on, a checked bag, choosing your seat, printing a boarding pass at the airport and even a bottle of water can each carry a separate charge.',
          'Neither model is better in general. The unbundled model is cheaper for people who genuinely need nothing extra, and more expensive for people who do. The skill is working out which group your particular trip puts you in before you pay.',
        ],
      },
      {
        heading: 'Build a total, not a headline',
        paragraphs: [
          'Open each airline\'s own baggage and fees page in a separate tab and write the same short list for every option you are considering. The prices on those pages change, which is why this guide does not quote them: use the figures on the day you book.',
        ],
        bullets: [
          'Base fare for every traveller, both directions.',
          'Carry-on that fits in the overhead bin (not just a small under-seat bag), each way.',
          'Checked bags, if you need any, each way. Many airlines charge less when you pay online ahead of time than at the airport.',
          'Seat selection, if it matters. Families and anyone who wants to sit together should price this in.',
          'Payment or booking fees, where they apply.',
          'The cost of changing or cancelling, if your plans might move.',
        ],
      },
      {
        heading: 'A worked example with made-up numbers',
        paragraphs: [
          'Suppose a budget airline offers a round trip at a base price of 90 and a full-service airline offers the same trip at 190. At first glance the budget ticket saves 100. Now add what you need: if the budget airline charges 40 each way for a carry-on and 15 each way to choose a seat, the budget total becomes 90 + 80 + 30 = 200, which is slightly more than the full-service fare that already included both.',
          'Change one assumption, though, and the answer flips. A traveller who can fit everything in a small backpack that satisfies the budget airline\'s free-bag rules, and does not care where they sit, pays only the base 90 and really does save 100. The numbers here are invented to show the method; your own comparison should use real prices.',
        ],
      },
      {
        heading: 'Where budget carriers tend to make sense',
        paragraphs: [
          'Short, direct trips with light luggage are the natural fit: a long weekend, a single backpack, one traveller, and a route the airline flies several times a day. If something goes wrong, you want a second flight available, which brings us to the part many comparisons skip.',
        ],
      },
      {
        heading: 'Where they tend to cost more than they look',
        paragraphs: [
          'Trips with checked luggage, several travellers who must sit together, tight connections, or fixed commitments at the other end (a wedding, a cruise departure) are riskier on carriers that fly a route only once or twice a day. If the only flight is cancelled you may wait a day or more, and some budget airlines do not rebook you on a rival carrier. Read the airline\'s own disruption policy before you rely on it.',
          'Also compare the whole journey, not only the flight. A cheaper airport that costs 40 more in ground transport each way has not saved you much.',
        ],
      },
      {
        heading: 'Sizes and rules: always check the source',
        paragraphs: [
          'Bag size limits, whether wheels and handles count, and what counts as a "personal item" differ by airline and can change. Measure your bag against the airline\'s published limits, not against a rule of thumb from an article, and take a photo of the page you relied on in case a gate agent disagrees.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Is the cheapest base fare ever the cheapest total?',
        answer:
          'Yes, when you need nothing beyond a seat and a small bag that fits the free allowance. The only way to know is to price your own trip with every extra you need.',
      },
      {
        question: 'Do I pay less if I add bags online instead of at the airport?',
        answer:
          'Many airlines charge more at the airport or the gate than when you add a bag during booking or online check-in. Confirm on the airline\'s fees page.',
      },
      {
        question: 'Should I worry about a single daily flight?',
        answer:
          'It is a risk worth pricing in. If your plans are inflexible, a carrier with more frequencies on the route gives you more options when something goes wrong.',
      },
    ],
  },

  'basic-economy-vs-main-cabin': {
    title: 'Basic Economy vs. Main Cabin: How to Tell Which Is Cheaper for Your Trip',
    metaTitle: 'Basic Economy vs. Main Cabin: Which Is Cheaper for You?',
    metaDescription:
      'Basic Economy trims seat choice, changes and sometimes bags. Learn what usually differs from the standard fare and how to decide whether the upgrade pays for itself.',
    excerpt:
      'Basic Economy looks cheaper at checkout, but the trade-offs differ by airline. Here is how to compare it with the standard fare for your own trip.',
    sections: [
      {
        heading: 'What Basic Economy is',
        paragraphs: [
          'Basic Economy is a restricted version of the standard economy fare that large airlines introduced to compete with budget carriers. You sit in the same cabin on the same plane, but the ticket comes with fewer included perks. The restrictions are set by each airline and revised from time to time, so the only reliable description of what you are buying is the "fare rules" or "what\'s included" page for that airline.',
        ],
      },
      {
        heading: 'The usual differences to look for',
        paragraphs: [
          'Although details vary, the same handful of items recur. Check each of them on the airline\'s own fare comparison screen during booking.',
        ],
        bullets: [
          'Seat selection: often unavailable until check-in, or available only for a fee. You may be assigned a seat separately from the people you travel with.',
          'Carry-on: some airlines include an overhead bag on Basic Economy and some limit you to one small item that fits under the seat. This is one of the biggest differences between carriers.',
          'Changes and cancellation: many Basic Economy fares are non-changeable or non-refundable, or allow it only for a fee or credit. Compare against the standard fare, which usually offers more flexibility.',
          'Boarding position: typically last, which matters if overhead space is tight.',
          'Upgrades and loyalty credit: may be excluded or earn less.',
        ],
      },
      {
        heading: 'Do the sum before you click',
        paragraphs: [
          'Take the price difference between Basic Economy and the standard fare for your exact flights. Then price the extras you would buy anyway: seat selection for everyone who needs to sit together, a carry-on if the airline charges for it on Basic fares, and a checked bag if you need one. In a hypothetical case where the standard fare costs 60 more in total and the extras you would add to the Basic ticket cost 70, the standard fare is the cheaper choice before you even consider flexibility.',
          'If you are travelling alone, with only a small bag, and do not mind a seat assigned at check-in, the Basic fare can come out ahead. The point is that the answer depends on the trip, not on a general rule.',
        ],
      },
      {
        heading: 'Flexibility has a price too',
        paragraphs: [
          'A ticket you cannot change is a bet that your plans will hold. If there is a realistic chance you will need to move the dates, the cost of a change or a lost fare can erase the saving. Before booking any fare, read what the airline says about changes, credits and refunds, and keep in mind that US rules give you a short window to cancel a booking made well before departure at no cost (see the guide on passenger rights for the details to verify).',
        ],
      },
      {
        heading: 'A quick decision checklist',
        paragraphs: [
          'Ask yourself four questions: do I need to sit with someone, do I need an overhead bag, might my plans change, and am I likely to want an upgrade? If the answer to any is yes, price the standard fare properly. If all four are no, Basic Economy is probably what it looks like: a lower price for a plainer ticket.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Can I choose my seat on a Basic Economy ticket?',
        answer: 'It depends on the airline. Some assign a seat at check-in, some sell seat selection. Check the fare details on the booking page.',
      },
      {
        question: 'Does Basic Economy include a carry-on bag?',
        answer: 'Policies differ between airlines and change over time. The airline\'s own baggage page for the fare you are buying is the only dependable answer.',
      },
      {
        question: 'Can I get a refund on a Basic Economy ticket?',
        answer: 'Often not beyond the legally required cancellation window, but terms vary. Read the fare rules before paying.',
      },
    ],
  },

  'hidden-city-error-fares-explained': {
    title: 'Error Fares and Hidden-City Ticketing: What They Are and the Risks',
    metaTitle: 'Error Fares and Hidden-City Tickets: What to Know First',
    metaDescription:
      'Mistake fares and hidden-city tickets sound like shortcuts, but they carry different risks. Learn how each works, what airlines say, and safer ways to find a low fare.',
    excerpt:
      'Mistake fares and hidden-city tickets are often mentioned together, yet they are very different. Here is how each works and what can go wrong.',
    sections: [
      {
        heading: 'Two different ideas often confused',
        paragraphs: [
          'An error fare (or mistake fare) is a price that an airline or booking site published by accident, for example because of a currency mix-up or a missing component of the price. A hidden-city ticket is something else entirely: a deliberately chosen itinerary in which you book a trip that continues past the place you actually want to go, and you get off at the connection. One is a pricing accident; the other is a tactic that airlines prohibit in their terms.',
        ],
      },
      {
        heading: 'How error fares appear and what happens next',
        paragraphs: [
          'When a very low price appears, it usually circulates quickly and then disappears once the airline notices. Whether the carrier honours tickets already sold depends on the airline, the situation and applicable consumer rules, so there is no guarantee either way. Some tickets are honoured; some are cancelled with a refund.',
          'That uncertainty is the main practical point. If you want to try for one, treat it as a free option rather than a plan: do not pay for non-refundable hotels, tours or time off work until the airline has confirmed the ticket, and do not use money you cannot afford to have tied up.',
        ],
      },
      {
        heading: 'What hidden-city ticketing is, and why airlines object',
        paragraphs: [
          'Suppose a flight from City A to City C is cheaper than a flight from City A to City B, even though the A–C trip connects through B. A traveller who actually wants to go to B might book A–C and leave the airport at B. Airlines say this breaks the contract you accept when you buy the ticket, because the price was set for the whole journey.',
          'The practical consequences are what matter to a traveller. Checked bags are normally tagged to the final destination, so they travel on without you. If you skip a segment, the remaining segments of the ticket are generally cancelled, which makes it unsuitable for a return trip booked on the same ticket. And airlines can respond to repeated use with consequences for a frequent-flyer account or a refusal to carry you in future. Read your airline\'s contract of carriage for its exact wording.',
        ],
      },
      {
        heading: 'Safer ways to bring a fare down',
        paragraphs: [
          'You rarely need either tactic. Being flexible on dates by a day or two, comparing nearby airports, checking a one-way on each of two airlines against a round trip on one, and setting a price alert on a route you care about are ordinary methods that carry no risk to your booking. See our guide to finding cheap flights for how to apply them.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Are airlines required to honour an error fare?',
        answer:
          'There is no single rule that applies in every case. Outcomes differ by airline and circumstance, which is why you should not commit non-refundable spending until the ticket is confirmed.',
      },
      {
        question: 'Is hidden-city ticketing illegal?',
        answer:
          'It is generally treated as a breach of the airline\'s contract of carriage rather than a crime, but the airline may cancel the remainder of the ticket or take action on your account. Check your airline\'s terms.',
      },
      {
        question: 'Why do my bags matter?',
        answer: 'Checked bags are usually tagged to the final destination on your ticket, so leaving the trip early would separate you from them.',
      },
    ],
  },

  'europe-on-a-budget-from-usa': {
    title: 'How to Find Cheaper Flights from the US to Europe',
    metaTitle: 'Cheaper Flights from the US to Europe: Practical Methods',
    metaDescription:
      'Practical ways to lower the cost of a transatlantic trip: flexible dates, shoulder seasons, alternative arrival cities, baggage rules and checking entry requirements.',
    excerpt:
      'Transatlantic fares vary a lot by season, airport and baggage rules. These methods help you find a lower fare without gambling on a deal that may not exist.',
    sections: [
      {
        heading: 'Start with when you travel',
        paragraphs: [
          'Demand for Europe peaks in the northern summer and around major holidays, and fares follow it. Flying in the shoulder seasons (roughly spring and autumn, with the exact months depending on the destination) often brings lower fares and thinner crowds, while deep winter can be cheaper still outside the holiday weeks. Use the flexible-date or calendar view on a fare comparison site to see how price changes across a whole month before you fix your dates.',
        ],
      },
      {
        heading: 'Be open about where you land',
        paragraphs: [
          'Airlines price routes, not countries, so the cheapest way to reach a region is sometimes through a different city than the one you first had in mind. Large hubs with lots of competition on the route tend to have more fare variety. If your real goal is a particular region, compare arrival cities across it and then price the train or a short low-cost flight onward. Add that onward cost to your comparison; a cheap transatlantic fare plus an expensive connection may not save anything.',
        ],
      },
      {
        heading: 'Understand what the fare includes',
        paragraphs: [
          'Many airlines sell a stripped-down long-haul fare that is cheaper than the standard one. What it leaves out varies by carrier: checked bags, seat selection, changes, sometimes even a full-size carry-on. Compare the fare you are about to buy with the next level up and decide whether the difference is worth it for you. If you will check a bag in any case, a fare that includes one may be the lower total.',
        ],
        bullets: [
          'Check the carry-on and checked-bag rules on the airline\'s own site for the exact fare.',
          'Look at the change and refund terms if your plans could move.',
          'Check whether your connection is on one ticket (protected if you miss it) or two (not).',
        ],
      },
      {
        heading: 'Book with a plan, not a deadline panic',
        paragraphs: [
          'Prices for popular summer dates tend to rise as departure approaches, while off-peak dates can be more forgiving. Rather than guess a "best day to buy", watch the route for a couple of weeks, note what a good price looks like, and buy when you see one inside your budget. For US purchases made directly with an airline at least a week before departure, a short free-cancellation window applies; verify the current rule on the US Department of Transportation website.',
        ],
      },
      {
        heading: 'Before you go: entry and paperwork',
        paragraphs: [
          'Passport validity rules, visa-free stay limits and any pre-travel authorisation can change. Check the official government sites of every country you will visit and of the country that issued your passport. Also check whether the airport you land at is the one you assumed: several cities have more than one.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Which month has the cheapest flights from the US to Europe?',
        answer:
          'It varies by route and year, but fares are commonly lower outside the summer peak and the year-end holidays. Use a flexible-date calendar for your own route to see the pattern.',
      },
      {
        question: 'Is it cheaper to fly into a different city and take a train?',
        answer: 'Sometimes. Add the onward ticket and the extra travel time to the comparison before deciding.',
      },
      {
        question: 'Do I need anything beyond a passport?',
        answer: 'Requirements differ by country and can change. Check the official government travel pages for your destination and for your passport country.',
      },
    ],
  },

  'tokyo-japan-flight-deals-guide': {
    title: 'Flights to Japan: Choosing Between Haneda and Narita, and What to Compare',
    metaTitle: 'Flights to Japan: Haneda vs. Narita and What to Compare',
    metaDescription:
      'How to compare flights from the US to Tokyo: the two airports, baggage allowances, seasons and getting into the city, with advice to confirm current details with airlines.',
    excerpt:
      'Tokyo has two major international airports, and the cheaper ticket is not always the cheaper trip. Here is what to weigh before you book.',
    sections: [
      {
        heading: 'Two airports, two trade-offs',
        paragraphs: [
          'Tokyo is served by Haneda (HND), which sits close to the city, and Narita (NRT), which is farther out in Chiba prefecture. Haneda is generally quicker to reach from central Tokyo; Narita is generally further away and relies on longer rail or bus rides. Which one a given airline uses can change by route and by season, so check the airports listed on your itinerary rather than assuming.',
          'A lower fare into the farther airport can be wiped out by longer, pricier ground transport and by arriving at a time when fewer trains run. Compare the arrival time against the last trains and buses and price the transfer as part of the trip.',
        ],
      },
      {
        heading: 'What to compare between airlines',
        paragraphs: [
          'Long-haul fares to Japan differ in more than price. Put the same four things side by side for every option you are considering:',
        ],
        bullets: [
          'Baggage allowance, for the exact fare you are buying. Allowances for international tickets often differ from domestic ones, and some airlines include more than others.',
          'Flight time and connections. A nonstop saves hours; a one-stop itinerary can be cheaper but adds risk of a missed connection.',
          'Change and refund terms, which matter more on long, expensive trips.',
          'Meals, entertainment and seat comfort, if they matter to you on a long flight.',
        ],
      },
      {
        heading: 'Choosing when to go',
        paragraphs: [
          'Spring cherry-blossom season and autumn foliage are famously popular, and flights and hotels for those weeks are usually in demand well in advance. If your dates are fixed to those periods, start looking early and set an alert. If you have flexibility, the weeks just outside them can be both calmer and cheaper. Peak Japanese holiday periods also raise demand, so check the calendar before choosing dates.',
        ],
      },
      {
        heading: 'Getting into the city',
        paragraphs: [
          'Both airports connect to central Tokyo by train, and buses and taxis are also available. Travel times and costs change, so check the airport\'s official transport page close to departure. If you land late at night, look up the final trains and buses first; taxis are available but can be costly.',
        ],
      },
      {
        heading: 'Paperwork',
        paragraphs: [
          'Check the Japanese government\'s entry requirements for your passport, including visa-free stay limits and any online arrival procedures, and your own country\'s passport-validity advice. Do this before you buy a ticket, not after.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Is Haneda always better than Narita?',
        answer: 'Haneda is usually closer to central Tokyo, but fares, schedules and your arrival time matter. Compare the whole journey, not just the airport.',
      },
      {
        question: 'When should I book for cherry-blossom season?',
        answer: 'Early. It is a high-demand period, so look well ahead and set a price alert for your dates.',
      },
      {
        question: 'Are bags included on flights to Japan?',
        answer: 'It depends on the airline and the fare. Check the baggage terms for the exact ticket before buying.',
      },
    ],
  },

  'cancun-all-inclusive-vs-separate-flight': {
    title: 'Cancun and the Riviera Maya: Package Deals or Book Flights and Hotel Separately?',
    metaTitle: 'Cancun: Vacation Package or Separate Flight and Hotel?',
    metaDescription:
      'How to decide between a Cancun package and booking flights and a hotel yourself: what packages include, the flexibility you give up, and a simple way to compare totals.',
    excerpt:
      'A package can be simple and good value, or a way to pay for things you will not use. Here is how to compare it with booking the pieces yourself.',
    sections: [
      {
        heading: 'What a package really is',
        paragraphs: [
          'A vacation package bundles a flight and a hotel, sometimes with transfers, food and drink. An all-inclusive resort goes further and includes most meals and drinks in the room price. Bundling can lower the headline price because sellers negotiate rates, but it also makes it harder to see what each part costs and often restricts changes.',
        ],
      },
      {
        heading: 'Compare like with like',
        paragraphs: [
          'Price the same trip three ways: the package, the flight alone plus the hotel alone, and, if you are considering an all-inclusive resort, the hotel plus an honest estimate of what you would spend on food and drink. Use the same dates, the same number of travellers and the same baggage assumptions in each. The only way to keep the comparison fair is to write each total down.',
        ],
        bullets: [
          'Flight: fare for every traveller, plus the baggage and seat fees you will really pay.',
          'Hotel: room rate, taxes and any mandatory resort fees listed at checkout.',
          'Transfers between the airport and the hotel, which can be a noticeable cost if not included.',
          'Food and drink: what you would spend eating out versus the inclusive price.',
        ],
      },
      {
        heading: 'When all-inclusive tends to suit people',
        paragraphs: [
          'Travellers who plan to eat and drink most of their meals at the resort, families who want predictable costs, and people who prefer not to plan their days around restaurants often find the inclusive model convenient. If you plan to spend most days exploring away from the resort, you may be paying for meals you will not eat.',
        ],
      },
      {
        heading: 'When booking separately tends to win',
        paragraphs: [
          'If you are flexible about dates and prepared to watch for a good fare, booking the flight yourself lets you take a lower price when it appears and choose the hotel on its own merits. It also gives you more control if your plans change, because the flight and the hotel have separate terms rather than one combined one. Check cancellation rules on both before you pay.',
        ],
      },
      {
        heading: 'Before you travel',
        paragraphs: [
          'Check your passport validity, any entry form the country requires, and your airline\'s baggage rules. Look at a map: the Cancun hotel zone, Playa del Carmen and other Riviera Maya towns are not next to each other, and transfer times differ. Read recent guest reviews on more than one site, and be wary of any package price that looks far below everything else.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Is an all-inclusive always better value?',
        answer: 'Not always. It depends on how much you would eat and drink at the resort and whether you plan to spend your days elsewhere.',
      },
      {
        question: 'Do packages restrict changes?',
        answer: 'Often more than separate bookings. Read the cancellation terms for the whole package before paying.',
      },
      {
        question: 'Are airport transfers included?',
        answer: 'Sometimes. Check the package details and price a transfer separately if it is not.',
      },
    ],
  },

  'tsa-precheck-global-entry-worth-it': {
    title: 'TSA PreCheck, Global Entry and CLEAR: Which Fits the Way You Travel?',
    metaTitle: 'TSA PreCheck vs. Global Entry vs. CLEAR: Which Fits You?',
    metaDescription:
      'How TSA PreCheck, Global Entry and CLEAR differ, who each suits, and how to decide whether a trusted-traveler program is worth the application effort for you.',
    excerpt:
      'Three programs promise shorter lines, but they do different things. Here is how they differ and how to tell whether any is worth it for the way you fly.',
    sections: [
      {
        heading: 'Three programs, three jobs',
        paragraphs: [
          'TSA PreCheck is a US government program that gives approved travellers access to a faster security screening lane at participating airports and airlines. Global Entry is run by US Customs and Border Protection; it speeds up the customs and immigration process when you arrive in the US from abroad, and its members are also eligible for TSA PreCheck. CLEAR is a private company that verifies your identity at the airport so you can move to the front of the document check, but it does not replace security screening itself.',
        ],
      },
      {
        heading: 'Who each tends to suit',
        paragraphs: [
          'If you fly within the US a few times a year and rarely leave the country, PreCheck is the focused choice. If you also travel abroad even occasionally, Global Entry usually covers both needs because it includes PreCheck. CLEAR is a paid subscription that makes the most sense for people who regularly pass through airports where it operates and where the identity-check queue is the slow part.',
        ],
      },
      {
        heading: 'Work out whether it pays for itself',
        paragraphs: [
          'Fees, membership length and the airports where each program operates change, so check them on the official pages (tsa.gov for PreCheck, ttp.cbp.gov for Global Entry) and on CLEAR\'s own site before you decide. Then do a simple estimate: how many times will you fly in the membership period, and how much time would you really save each time? If you fly rarely, a few minutes per trip may not justify the fee and the application effort. If you fly often, it probably does.',
          'Some travel credit cards reimburse the application fee for certain programs. If you already hold such a card, check the terms: it can change the calculation.',
        ],
      },
      {
        heading: 'What the application involves',
        paragraphs: [
          'You apply online, pay a fee, and attend an in-person appointment for fingerprinting and an interview. Appointment availability varies by location, so apply well before a trip rather than the week before. Once approved, you get a known-traveler number to add to your airline bookings so the PreCheck indicator can appear on your boarding pass.',
        ],
      },
      {
        heading: 'Things to know',
        paragraphs: [
          'PreCheck lanes are not guaranteed on every flight or at every checkpoint; eligibility can vary by airline, airport and day. Rules for children travelling with an enrolled adult have changed over time, so confirm the current policy with TSA before you travel with a family.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Does Global Entry include TSA PreCheck?',
        answer: 'Global Entry members are eligible to use TSA PreCheck, but you need to add your known-traveler number to your bookings.',
      },
      {
        question: 'Can children use my PreCheck lane?',
        answer: 'Rules for children travelling with an enrolled adult have changed over time. Check the current TSA guidance before you fly.',
      },
      {
        question: 'Does CLEAR replace security screening?',
        answer: 'No. CLEAR verifies your identity; you still go through security screening.',
      },
    ],
  },

  'airline-baggage-size-guide-usa': {
    title: 'Carry-On and Personal Item Sizes: How to Check Before You Fly',
    metaTitle: 'Carry-On and Personal Item Sizes: How to Check Your Airline',
    metaDescription:
      'Carry-on and personal item limits differ by airline and change. Learn what the terms mean, how to measure correctly and how to avoid surprise gate fees.',
    excerpt:
      'Bag limits differ by airline and fare. Rather than quote numbers that change, this guide shows how to measure and where to confirm the rule that applies to you.',
    sections: [
      {
        heading: 'Personal item, carry-on and checked bag',
        paragraphs: [
          'Airlines generally use three categories. A personal item is a small bag that must fit under the seat in front of you. A carry-on is a larger bag that goes in the overhead bin. A checked bag goes in the hold. Each airline sets its own limits for size and weight, and which categories are free depends on the airline and the fare you bought.',
        ],
      },
      {
        heading: 'Why you should not trust a general chart',
        paragraphs: [
          'Charts and tables of "standard" sizes go out of date, and airlines do change their rules. Many large airlines publish limits for overhead bags that are broadly similar, but budget carriers in particular can set a smaller allowance for the free personal item and charge for anything bigger. The only answer that counts is the one on the airline\'s own baggage page for the fare in your booking.',
        ],
      },
      {
        heading: 'How to measure properly',
        paragraphs: [
          'Measure the bag at its largest points, including wheels, handles, side pockets and any bulge when it is full. Many airlines count these in the total, and a bag that fits on paper can fail at the gate because of a handle. Measure three dimensions (height, width, depth) and compare each to the airline\'s limit. If you use a soft bag, pack it as you would for the trip and measure it again, because it grows when full.',
        ],
        bullets: [
          'Use a tape measure, not an estimate.',
          'Weigh it if the airline sets a weight limit as well as a size limit.',
          'Check the sizer at the airport if you are close to the limit.',
        ],
      },
      {
        heading: 'Avoiding gate fees',
        paragraphs: [
          'Charges for a bag that does not meet the rules are usually higher at the gate than if you had paid ahead. If you are unsure, the cheaper, calmer option is to pay for the bag in advance or to pack to a smaller size. Keep a screenshot of the rule you relied on from the booking confirmation or baggage page.',
        ],
      },
      {
        heading: 'If you connect between airlines',
        paragraphs: [
          'When a trip uses more than one airline, the strictest rule can apply to the whole journey. Check each airline\'s limits and plan around the smallest.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Do wheels and handles count toward the size limit?',
        answer: 'Most airlines count them. Measure the whole bag at its largest points and compare to the airline\'s stated limit.',
      },
      {
        question: 'Is a personal item the same as a carry-on?',
        answer: 'No. A personal item goes under the seat; a carry-on goes in the overhead bin. Free allowances for each differ by airline and fare.',
      },
      {
        question: 'Can rules change after I book?',
        answer: 'They can. Check the airline\'s baggage page again shortly before you fly.',
      },
    ],
  },

  'last-minute-flight-deals-usa': {
    title: 'Last-Minute Flights: How to Keep the Price Down When You Must Travel Soon',
    metaTitle: 'Last-Minute Flights: How to Keep the Price Down',
    metaDescription:
      'Need to fly soon? Practical, low-risk ways to lower a last-minute fare: flexible days, nearby airports, mixing one-way tickets and checking all your options.',
    excerpt:
      'Prices often rise as departure nears, but you still have options. Here are practical ways to bring a last-minute fare down without taking on needless risk.',
    sections: [
      {
        heading: 'Why last-minute fares are often higher',
        paragraphs: [
          'Airlines tend to raise the price of the remaining seats as a flight fills and as the departure date approaches, since late bookers are usually less price-sensitive. That is a general tendency rather than a rule, and some flights stay reasonable or even get cheaper if they are not selling. So do not assume the worst: check.',
        ],
      },
      {
        heading: 'Widen the search',
        paragraphs: [
          'Flexibility is the most reliable lever. Compare the day before and the day after, the early morning and late evening departures, and the other airports serving your city. Even a small shift can change the price noticeably. Use a flexible-date or calendar view where the site offers one.',
        ],
        bullets: [
          'Try each nearby airport for departure and for arrival.',
          'Compare midweek with weekend flights if you have the choice.',
          'Look at itineraries with a connection as well as nonstop ones, and weigh the risk of a missed connection.',
        ],
      },
      {
        heading: 'Consider two one-way tickets',
        paragraphs: [
          'Sometimes one airline has the better outbound price and another the better return. Booking two one-way tickets can beat a single round trip, though you lose the protection of a single booking: if you must change one leg, the other does not move with it. Compare the combined total with the round-trip and decide whether the saving is worth that trade-off.',
        ],
      },
      {
        heading: 'Check all the sellers',
        paragraphs: [
          'Look at the airline\'s own site as well as comparison sites. Some airlines run sales on their own channel, and some fees are clearer when you book directly. Whatever you book, make sure the baggage and change terms fit your trip, because a cheap fare with expensive extras may not be cheap.',
        ],
      },
      {
        heading: 'When you have loyalty points',
        paragraphs: [
          'If you hold airline miles or card points, compare a points booking with the cash price. Award prices can be very good or very poor depending on the route and date, and taxes and fees still apply, so run the numbers rather than assume.',
        ],
      },
      {
        heading: 'What not to do',
        paragraphs: [
          'Do not wait for a price drop at the airport counter; walk-up fares are usually not a bargain. Do not book on a site you do not recognise because the price looks low. And do not forget the cost of a missed day: a slightly higher fare on a more reliable flight can be the better value.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Do airlines drop prices at the airport right before takeoff?',
        answer: 'Do not count on it. Walk-up fares are generally not cheaper than booking online ahead of time.',
      },
      {
        question: 'Is a one-way ticket on each of two airlines safe?',
        answer: 'It can be cheaper, but the two bookings are independent. If one is disrupted, the other does not adjust, so consider the risk.',
      },
      {
        question: 'Should I look at nearby airports?',
        answer: 'Yes. Compare prices and the cost and time of getting to each airport.',
      },
    ],
  },

  'family-travel-flight-savings': {
    title: 'Flying With Children: Seats, Strollers and Keeping Costs Predictable',
    metaTitle: 'Flying With Children: Seats, Strollers and Costs',
    metaDescription:
      'Practical guidance for family flights: sitting together, baby and toddler rules, strollers and car seats, and how to compare the true cost of a fare for several travellers.',
    excerpt:
      'Family trips multiply every fee. This guide covers the questions to ask about seating, car seats and strollers, and how to price a trip for several people.',
    sections: [
      {
        heading: 'Sitting together',
        paragraphs: [
          'Airlines handle family seating in different ways, and policies change. Some assign adjacent seats for children automatically when you book together, some do so only on certain fares, and some charge for seat selection. Before you buy, read the airline\'s family-seating policy for the specific fare, and note what happens if no adjacent seats are available. Choosing seats at booking, where the airline allows it, is the most reliable way to avoid being separated.',
        ],
      },
      {
        heading: 'Price the whole family, not one ticket',
        paragraphs: [
          'A small fee repeated for every traveller on every leg becomes a large one. Write out the total for the family: fares, seat selection, carry-on and checked bags, and any fees for changes. Then compare a cheaper restricted fare with the standard fare using the same list. A fare that looks 20 cheaper per person may cost more once everyone\'s seat selection and a bag are added.',
        ],
      },
      {
        heading: 'Infants and toddlers',
        paragraphs: [
          'Rules for children under two differ between domestic and international travel and between airlines. Many airlines let a young child travel on an adult\'s lap on domestic flights, but a seat is often recommended for safety, and international lap-infant fares usually carry a fee. Check the airline\'s policy and any documentation it requires, such as proof of age.',
        ],
      },
      {
        heading: 'Car seats and strollers',
        paragraphs: [
          'Many airlines let you check a stroller and a car seat without charge, either at the ticket counter or at the gate, but practice varies, so confirm on the airline\'s site. If you plan to use a car seat on board, check that it is approved for aircraft use (look for the label) and that it fits the seat you are assigned. Consider a bag to protect gate-checked equipment.',
        ],
        bullets: [
          'Confirm whether a stroller can go all the way to the aircraft door.',
          'Check weight and size limits for the car seat on board.',
          'Pack the child\'s essentials in a carry-on, not in checked luggage.',
        ],
      },
      {
        heading: 'Make the day easier',
        paragraphs: [
          'Choose flight times that fit your child\'s routine where you can, leave generous time for connections, and pack snacks, a change of clothes and something to do. Check the airport\'s family facilities in advance if you will have a long wait.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Do strollers and car seats count toward baggage limits?',
        answer: 'Many airlines let you check them without charge, but policies vary. Confirm on the airline\'s website.',
      },
      {
        question: 'Will my child be seated next to me?',
        answer: 'It depends on the airline and fare. Choose seats at booking where possible and read the airline\'s family-seating policy.',
      },
      {
        question: 'Does a baby need their own ticket?',
        answer: 'Rules differ between airlines and for domestic and international flights. Check the airline\'s policy for infants.',
      },
    ],
  },

  'open-jaw-multi-city-flights': {
    title: 'Open-Jaw and Multi-City Tickets: How They Work and When They Help',
    metaTitle: 'Open-Jaw and Multi-City Flights: How They Work',
    metaDescription:
      'Open-jaw and multi-city tickets let you arrive in one city and leave from another. Learn how they are priced, when they save time or money and what to check before booking.',
    excerpt:
      'Flying into one city and home from another can save a day of backtracking. Here is how open-jaw and multi-city tickets work and how to price them.',
    sections: [
      {
        heading: 'What the terms mean',
        paragraphs: [
          'A round trip returns you to where you started. An open-jaw ticket is a round trip in which the outbound destination and the return origin differ: for example, you fly into one city and home from another. A multi-city ticket (sometimes "multi-destination") strings together three or more flights, such as home to city A, city A to city B, city B to home.',
        ],
      },
      {
        heading: 'Why they can be worthwhile',
        paragraphs: [
          'The main benefit is saved time and effort. If a trip is a route rather than a loop, you avoid retracing your steps by train or car to your arrival airport. The price benefit is not guaranteed: sometimes an open-jaw is priced close to a round trip, sometimes it costs more, and sometimes two separate one-way tickets are the cheapest option. The only way to know is to price each version.',
        ],
      },
      {
        heading: 'How to price all the options',
        paragraphs: [
          'Use the "multi-city" search on an airline or comparison site to enter your route, then compare the total with two other versions: a standard round trip, and two one-way tickets bought separately. Include the cost of any ground transport you would no longer need. If you are using separate tickets, add the risk that a delay on one will not be covered by the other.',
        ],
        bullets: [
          'Total for the multi-city or open-jaw ticket.',
          'Total for a round trip plus the ground transport to retrace your route.',
          'Total for two one-way tickets, with the loss of single-booking protection in mind.',
        ],
      },
      {
        heading: 'What to check before you book',
        paragraphs: [
          'Read the baggage rules for each segment, because they can differ between airlines when you combine carriers. Check how changes are handled: altering one part of a multi-segment ticket can affect the rest, and fees may apply. Make sure the connection times are realistic and that you understand which airline is responsible if a segment is disrupted.',
        ],
      },
      {
        heading: 'A simple example',
        paragraphs: [
          'Imagine a trip that begins in one city and ends in another a few hundred miles away. A round trip means a day of travel back to your arrival city. An open-jaw ticket flies you home from the second city, saving that day and the ticket or fuel to return. If the fare difference is smaller than the value of the saved day and cost, the open-jaw is the better choice, and you only find that out by comparing the quotes.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Is a multi-city ticket cheaper than two one-way tickets?',
        answer: 'Sometimes, sometimes not. Price both and compare, including the protection of a single booking.',
      },
      {
        question: 'Does an open-jaw ticket cost more than a round trip?',
        answer: 'It can be close in price or higher. Search both options for your dates.',
      },
      {
        question: 'Who helps if one segment is disrupted?',
        answer: 'On a single ticket the issuing airline is generally responsible. On separate tickets each airline handles only its own flight.',
      },
    ],
  },

  'student-youth-flight-discounts-usa': {
    title: 'Student and Youth Flight Discounts: What Exists and How to Check',
    metaTitle: 'Student and Youth Flight Discounts: What to Check',
    metaDescription:
      'Some airlines and travel services offer student or youth fares or extras. Learn what they usually include, how verification works, and how to confirm you are really getting a better deal.',
    excerpt:
      'Student and youth offers exist, but they change and are not always the cheapest option. Here is how to find them and test whether they are worth it.',
    sections: [
      {
        heading: 'What kinds of offers exist',
        paragraphs: [
          'Offers aimed at students and young adults come in a few forms: a reduced fare, an extra baggage allowance, more flexible change terms, or a lower fee on changes. Some airlines run them directly; some travel agencies specialise in them. What is offered, to whom and in which countries changes over time, so the airline\'s or agency\'s own page is the only reliable source.',
        ],
      },
      {
        heading: 'How verification usually works',
        paragraphs: [
          'To get a student fare you generally need to prove your status. That can mean using a school email address, uploading proof of enrolment, or verifying through a third-party service. Age-based youth fares usually require an ID at booking or at the airport. Read the conditions, including age limits and how long the proof is valid, before you rely on the fare.',
        ],
      },
      {
        heading: 'Always compare with the public fare',
        paragraphs: [
          'A student fare is not guaranteed to be the cheapest. Public sales, other airlines and nearby airports can undercut it. Price the same trip through at least two other channels and compare the totals including baggage and change terms. Sometimes the benefit is an extra bag or flexibility, which is worth more to you than a small cut in the base price.',
        ],
        bullets: [
          'Compare the student fare with the same flight at the public price.',
          'Check what is included: bags, changes, refund terms.',
          'Confirm the proof you will need, and when you will need it.',
        ],
      },
      {
        heading: 'Other ways to save on a budget',
        paragraphs: [
          'Flexible dates, off-peak travel, nearby airports and travelling light are available to everyone and often matter more than a status discount. If you study abroad, check whether your school offers travel support or partnerships. Beware of sites that promise large student discounts but are not clear about who sells the ticket.',
        ],
      },
      {
        heading: 'Protect yourself',
        paragraphs: [
          'Book through the airline or a reputable seller, keep your confirmation, and read the cancellation rules. If a seller asks for payment in an unusual way or will not tell you the airline, walk away.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Are student travel sites always cheaper?',
        answer: 'No. Compare with the airline\'s own price and other sellers for the same flight.',
      },
      {
        question: 'What proof will I need?',
        answer: 'It varies: a school email, proof of enrolment or an ID for age-based fares. Check the offer\'s conditions.',
      },
      {
        question: 'Do student fares include extra baggage?',
        answer: 'Some do. Confirm the baggage terms for the exact fare.',
      },
    ],
  },

  'flight-delay-compensation-us-eu': {
    title: 'Flight Delays and Cancellations: Your Rights in the US and Europe',
    metaTitle: 'Flight Delay and Cancellation Rights: US DOT and EU261',
    metaDescription:
      'What passengers can expect after a cancelled or badly delayed flight: US Department of Transportation refund rules, European EU261 compensation, and how to make a claim.',
    excerpt:
      'US and European rules protect passengers differently. Here is a plain-language summary of refunds, compensation and how to claim, with pointers to the official sources.',
    sections: [
      {
        heading: 'Two different systems',
        paragraphs: [
          'In the United States, the Department of Transportation (DOT) sets rules mainly about refunds and the treatment of passengers. In the European Union, Regulation 261/2004 (known as EU261) gives passengers a right to fixed compensation, as well as care and assistance, in defined situations. The United Kingdom has its own similar rules. The details below are a summary: always read the official text and the airline\'s own policy for your case, because rules are updated.',
        ],
      },
      {
        heading: 'US: refunds',
        paragraphs: [
          'US rules require airlines to refund passengers, in the original form of payment, when the airline cancels a flight or makes a significant change and the passenger chooses not to accept the alternative offered. DOT sets thresholds for what counts as a "significant" delay or change, and the thresholds differ between domestic and international flights. The refund should not depend on accepting a voucher. If you are offered a credit instead of a refund, you are generally entitled to ask for the money back. Check the DOT\'s current page on refunds for the exact definitions.',
          'Separately, a US rule gives travellers a short window to cancel a booking made directly with an airline for a flight at least a week away and receive a full refund. Verify the current conditions on the DOT site before relying on it.',
        ],
      },
      {
        heading: 'Europe: compensation under EU261',
        paragraphs: [
          'EU261 can apply to flights departing from an EU airport on any airline, and to flights arriving in the EU on an EU airline. For a long delay at arrival, or a cancellation with short notice, passengers may be entitled to a fixed payment whose size depends on the distance of the flight. Compensation is not owed when the disruption was caused by "extraordinary circumstances" outside the airline\'s control, such as severe weather or air traffic control restrictions; whether a particular cause qualifies is often disputed.',
          'Even where no compensation is due, the airline may owe care and assistance: meals, refreshments, communication and, where needed, accommodation, as well as the choice of a refund or rerouting.',
        ],
      },
      {
        heading: 'What to do when your flight is disrupted',
        paragraphs: [
          'Keep every document and take notes as events happen. Ask the airline in writing what it will offer and what it says caused the disruption.',
        ],
        bullets: [
          'Save your booking confirmation, boarding pass, and any messages from the airline.',
          'Record the scheduled and actual times, including when you arrived at your final destination.',
          'Keep receipts for reasonable expenses such as meals or a hotel and ask the airline about reimbursement.',
          'Claim from the airline that operated the flight, using its form, and keep a copy.',
          'If the airline refuses and you believe you are entitled, you can escalate to the relevant regulator or an official dispute body.',
        ],
      },
      {
        heading: 'A word on third-party claim companies',
        paragraphs: [
          'Claim companies handle claims for a share of the payout. They can be useful if you do not want to pursue a claim yourself, but you can always file directly with the airline at no cost. Read their fees and terms before you sign.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Does EU261 apply to US airlines flying from New York to Paris?',
        answer: 'EU261 generally covers flights departing from EU airports on any airline and flights arriving in the EU on EU airlines. A US carrier flying from New York to Paris is not covered by that rule alone, so check the official guidance.',
      },
      {
        question: 'Can I get cash instead of a voucher in the US?',
        answer: 'When the airline cancels or significantly changes your flight and you decline the alternative, you are generally entitled to a refund to your original payment method. Check the DOT\'s current rule.',
      },
      {
        question: 'Do I need to use a claims company?',
        answer: 'No. You can claim directly with the airline for free.',
      },
    ],
  },
};
