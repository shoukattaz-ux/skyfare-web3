import type { TravelGuide } from '../types/flight';

export const TRAVEL_GUIDES: TravelGuide[] = [
  {
    slug: 'how-to-find-cheap-flights',
    title: 'How to Find Cheap Flights in 2026: The Complete US Traveler Playbook',
    metaTitle: 'How to Find Cheap Flights in 2026 (Proven Strategies)',
    metaDescription: 'Learn proven methods to book cheaper domestic and international flights from the USA using fare calendars, hub positioning, and baggage math.',
    category: 'Booking Strategy',
    author: 'Elena Vance',
    authorRole: 'Senior Airfare Analyst',
    publishedAt: '2026-10-12',
    updatedAt: '2026-11-10',
    readTimeMinutes: 9,
    wordCount: 1280,
    imageKey: 'terminal',
    excerpt: 'Stop relying on outdated myths about Tuesday midnight pricing. Here is how airline revenue management actually prices seats in 2026—and how you can consistently pay 40% to 60% less.',
    sections: [
      {
        heading: '1. Why Airline Prices Move (and Why Incognito Mode Doesn’t Lower Fares)',
        paragraphs: [
          'Modern airline pricing engines rely on dynamic fare buckets—alpha-numeric booking classes such as Y, B, M, Q, and O—rather than browser cookies. When a flight opens 330 days before departure, revenue management software allocates a set number of seats to discounted buckets. As those buckets sell out or algorithms forecast stronger corporate demand, the lowest available bucket closes and prices jump overnight.',
          'Rather than clearing cookies repeatedly, your biggest lever is flexibility across three dimensions: departure day, surrounding airports, and booking window. Even shifting a trip from a Friday–Sunday itinerary to a Tuesday–Tuesday or Saturday–Wednesday schedule routinely cuts base airfare by 35% on high-frequency domestic and transatlantic routes.',
        ],
      },
      {
        heading: '2. Compare Nearby Gateway Airports Before Locking Any Ticket',
        paragraphs: [
          'Major US metropolitan regions feature multi-airport competition that creates stark fare gaps on identical dates. Checking Newark (EWR) alongside JFK and LaGuardia (LGA), or comparing Fort Lauderdale (FLL) against Miami (MIA), frequently reveals $90 to $210 differences on the same week.',
          'For international trips, positioning flights—buying a cheap domestic Southwest or Delta ticket to a major coastal gateway like Boston, New York, or Los Angeles and booking a separate long-haul deal—can save $350+ per traveler. Leave at least four to five hours between separate tickets, or fly in the evening before.',
        ],
        table: {
          headers: ['Metro Area', 'Primary Hub', 'Alternative Airports to Check', 'Typical Savings Range'],
          rows: [
            ['New York', 'JFK', 'EWR (Newark), LGA (LaGuardia)', '$55 – $180'],
            ['South Florida', 'MIA', 'FLL (Fort Lauderdale), PBI (West Palm)', '$45 – $145'],
            ['San Francisco Bay', 'SFO', 'OAK (Oakland), SJC (San Jose)', '$60 – $160'],
            ['Washington DC', 'IAD', 'DCA (Reagan), BWI (Baltimore)', '$50 – $170'],
          ],
        },
      },
      {
        heading: '3. Calculate Total Door-to-Door Cost Including Baggage & Seat Fees',
        paragraphs: [
          'A $68 ultra-low-cost ticket can quickly reach $198 round-trip once you add a full-size carry-on ($45–$65 each way), checked luggage, and assigned seats. Legacy Basic Economy tickets also vary sharply: Delta, American, and JetBlue include an overhead carry-on on domestic Basic Economy fares, whereas United domestic Basic Economy allows only an under-seat personal item.',
        ],
        bullets: [
          'Pack in a compliant 18x14x8-inch backpack on 2–3 day domestic hops to capture true $60–$95 Spirit or Frontier fares.',
          'Use Southwest when traveling with two checked suitcases or winter ski gear—two checked bags are built into qualifying standard fares.',
          'Compare Main Cabin vs. Basic Economy upfront: when traveling with family, paying $70 extra round-trip for Main Cabin often costs less than buying two separate advance seat assignments plus change flexibility.',
        ],
      },
      {
        heading: '4. Set Automated Price Alerts Early and Strike Within 24 Hours',
        paragraphs: [
          'Flash sales and unannounced fare wars between Delta, United, and JetBlue rarely last longer than 24 to 72 hours. Under US Department of Transportation regulations, flights booked directly with an airline (or eligible US travel agencies) at least seven days before departure qualify for a full 24-hour risk-free refund—giving you breathing room to lock a rare deal immediately and finalize hotel or PTO details the same afternoon.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Does searching in incognito mode actually make flights cheaper?',
        answer: 'No. Airfares fluctuate because lower fare buckets sell out or airline algorithms update inventory—not because of individual browser cookies.',
      },
      {
        question: 'How does the US DOT 24-hour cancellation rule work?',
        answer: 'When booking at least 7 days prior to departure on flights to, from, or within the United States, carriers must offer either a free 24-hour cancellation refund or a 24-hour price hold.',
      },
    ],
  },
  {
    slug: 'best-time-to-book-flights',
    title: 'Best Time to Book Domestic and International Flights from the USA',
    metaTitle: 'Best Time to Book Cheap Flights from the USA (2026 Data)',
    metaDescription: 'Discover the ideal booking windows for domestic US flights, Caribbean getaways, Europe, and Asia to avoid overpaying.',
    category: 'Timing & Seasons',
    author: 'Marcus Thorne',
    authorRole: 'Route Pricing Editor',
    publishedAt: '2026-10-18',
    updatedAt: '2026-11-11',
    readTimeMinutes: 8,
    wordCount: 1140,
    imageKey: 'hero',
    excerpt: 'Booking too early can cost nearly as much as booking too late. Use these data-backed Goldilocks booking windows for US domestic, Europe, Mexico, and transpacific trips.',
    sections: [
      {
        heading: '1. The Goldilocks Window for US Domestic Routes',
        paragraphs: [
          'For domestic travel within the lower 48 states, airlines keep initial fares artificially elevated 5 to 10 months out because only leisure planners locked to fixed weddings or conferences tend to buy that early. Discounted Q and O buckets usually open widest between 28 and 68 days before departure.',
          'Once you cross inside 14 days prior to departure, business-travel pricing tiers take over—causing last-minute midweek fares to jump 45% to 120% unless a specific weekend flight has empty seats left to fill.',
        ],
        table: {
          headers: ['Region From USA', 'Prime Booking Window', 'Peak Holiday Window', 'Cheapest Months to Fly'],
          rows: [
            ['Domestic USA', '1 – 3 months out', '3 – 5 months out', 'Jan, Feb, Sep'],
            ['Mexico & Caribbean', '2 – 4 months out', '4 – 6 months out', 'May, Sep, Oct'],
            ['Europe (UK/EU)', '3 – 6 months out', '6 – 8 months out', 'Nov, Jan, Feb, Mar'],
            ['Japan & East Asia', '4 – 7 months out', '7 – 10 months out', 'Jan, Feb, Nov'],
          ],
        },
      },
      {
        heading: '2. Why Tuesday & Wednesday Flights Still Beat Friday & Sunday',
        paragraphs: [
          'While booking *on* a Tuesday no longer guarantees a secret discount, *flying* on Tuesdays, Wednesdays, and Saturdays remains reliably cheaper. Business travelers dominate Monday morning and Thursday/Friday afternoon flights, while leisure travelers pack Sunday afternoons.',
          'Aim for early morning departures (6:00 AM–8:30 AM) or Saturday afternoon flights. Early departures also suffer far fewer cascading weather delays across hubs like Chicago O’Hare, Newark, and Atlanta.',
        ],
      },
      {
        heading: '3. Mastering Shoulder Season International Fares',
        paragraphs: [
          'Flying to Paris, Rome, Dublin, or Lisbon in late October, November, February, or March routinely yields $410–$495 round-trips—compared to $1,050–$1,450 during late June and July. Beyond airfare savings, hotel rates in major European capitals drop 30–45% outside peak summer.',
        ],
      },
    ],
    faqs: [
      {
        question: 'When should I book Thanksgiving and Christmas flights?',
        answer: 'Lock in Thanksgiving and December holiday flights between August and late September—waiting past October 15 almost always results in peak-tier pricing.',
      },
    ],
  },
  {
    slug: 'budget-airlines-comparison',
    title: 'US Budget Airlines Compared: Spirit vs. Frontier vs. Southwest vs. JetBlue',
    metaTitle: 'US Budget Airlines Compared: Fees, Bags & Legroom (2026)',
    metaDescription: 'Side-by-side comparison of Spirit, Frontier, Southwest, JetBlue, and Breeze baggage fees, legroom, and true total ticket cost.',
    category: 'Airline Guides',
    author: 'Claire Lindqvist',
    authorRole: 'Consumer Aviation Writer',
    publishedAt: '2026-10-22',
    updatedAt: '2026-11-12',
    readTimeMinutes: 9,
    wordCount: 1180,
    imageKey: 'nyc',
    excerpt: 'Low base fares tell only half the story. We broke down bag sizes, carry-on charges, change flexibility, and seat pitch across America’s top value carriers.',
    sections: [
      {
        heading: '1. Understanding Unbundled vs. Value-Bundled Fares',
        paragraphs: [
          'Ultra-low-cost carriers (ULCCs) like Spirit and Frontier price the seat alone, charging separately for overhead carry-ons, checked suitcases, seat selection, and airport check-in assistance. Meanwhile, JetBlue and Southwest fold standard carry-on luggage—and for Southwest standard tiers, checked bags—directly into the base fare.',
        ],
        table: {
          headers: ['Airline', 'Personal Item', 'Overhead Carry-On', 'Seat Pitch', 'Change Fees'],
          rows: [
            ['Spirit (Go)', 'Free (18x14x8")', '$45–$65 each way', '28 inches', '$0 on most bundles'],
            ['Frontier (Basic)', 'Free (14x18x8")', '$49–$69 each way', '28–29 inches', '$0 on Economy+ bundles'],
            ['JetBlue (Blue Basic)', 'Free', 'Included free', '32 inches', '$100–$200 (Basic); $0 (Blue)'],
            ['Southwest (Standard)', 'Free', 'Included free', '31–32 inches', '$0 change fees'],
          ],
        },
      },
      {
        heading: '2. When Ultra-Low-Cost Carriers Actually Win',
        paragraphs: [
          'If you are flying nonstop for a 3-day weekend from Miami to New York or Chicago to Tampa and can fit everything into a soft under-seat backpack, Spirit and Frontier frequently save $80 to $140 over legacy airlines. Never connect on a ULCC with only one daily flight—if a flight cancels, rebooking options are limited compared to Delta or American.',
        ],
      },
      {
        heading: '3. When JetBlue or Southwest Delivers Better Total Value',
        paragraphs: [
          'Once a traveler needs an overhead roller bag, free Wi-Fi, or reliable multi-flight daily frequency, JetBlue and Southwest almost always match or undercut unbundled ULCC add-on totals while providing 3–4 extra inches of legroom.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Does JetBlue Blue Basic now include a carry-on bag?',
        answer: 'Yes. JetBlue updated its Blue Basic policy so all passengers receive one full-size carry-on bag plus one personal item at no extra charge.',
      },
    ],
  },
  {
    slug: 'basic-economy-vs-main-cabin',
    title: 'Basic Economy vs. Main Cabin: When Upgrading Actually Saves Money',
    metaTitle: 'Basic Economy vs Main Cabin: Should You Pay Extra?',
    metaDescription: 'Break down the exact restrictions on Delta, United, and American Basic Economy tickets to see when Main Cabin is the smarter buy.',
    category: 'Airline Guides',
    author: 'Elena Vance',
    authorRole: 'Senior Airfare Analyst',
    publishedAt: '2026-10-25',
    updatedAt: '2026-11-09',
    readTimeMinutes: 7,
    wordCount: 1050,
    imageKey: 'terminal',
    excerpt: 'Basic Economy looks tempting at checkout, but hidden trade-offs around seat assignments, boarding order, and cancellation penalties vary dramatically by airline.',
    sections: [
      {
        heading: '1. Carry-On Rules Differ Sharply Between Delta, American, and United',
        paragraphs: [
          'Many travelers mistakenly assume all Basic Economy tickets ban overhead carry-on bags. In reality, Delta and American allow a standard overhead roller bag on all Basic Economy flights, whereas United domestic Basic Economy limits passengers to a single personal item (17x10x9 inches) unless holding an eligible United credit card or Star Alliance status.',
        ],
      },
      {
        heading: '2. The Math on Family Seating & Trip Changes',
        paragraphs: [
          'Paying $35 per person each way to select seats on a Basic Economy ticket costs $70 round-trip—nearly identical to the $70–$85 Main Cabin upgrade that already includes free seat selection, full mileage earning, and zero change fees.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Can I cancel a Basic Economy ticket for travel credit?',
        answer: 'Most major US airlines deduct a $99 to $199 cancellation fee from Basic Economy credits, whereas Main Cabin provides 100% eCredit value.',
      },
    ],
  },
  {
    slug: 'hidden-city-error-fares-explained',
    title: 'Error Fares and Hidden-City Ticketing: Risks, Rules, and Safer Alternatives',
    metaTitle: 'Error Fares & Hidden-City Flights: What Travelers Need to Know',
    metaDescription: 'Understand how airline mistake fares work, why skiplagging violates carrier contracts, and safer ways to capture 60%+ airfare discounts.',
    category: 'Travel Rules',
    author: 'Marcus Thorne',
    authorRole: 'Route Pricing Editor',
    publishedAt: '2026-10-29',
    updatedAt: '2026-11-12',
    readTimeMinutes: 8,
    wordCount: 1090,
    imageKey: 'hero',
    excerpt: 'Mistake fares can unlock $290 flights to Europe—while hidden-city tickets carry real account and luggage risks. Know the difference before you click book.',
    sections: [
      {
        heading: '1. How Legitimate Airline Error Fares Happen',
        paragraphs: [
          'Error fares occur when an airline or online agency miskeys a currency conversion, omits a fuel surcharge, or misloads a fare class. Unlike deceptive scams, legitimate mistake fares are booked directly on major airlines or accredited OTAs. Wait 5 to 7 days after receiving an e-ticket number before booking non-refundable hotels in case the carrier voids an obvious pricing error.',
        ],
      },
      {
        heading: '2. Why Hidden-City (Skiplagging) Can Backfire',
        paragraphs: [
          'Booking a ticket from Dallas to Boston with a layover in Atlanta and intentionally walking off in Atlanta violates airline Contracts of Carriage. Checked bags will continue to Boston, return legs get automatically canceled if you miss any segment, and repeat offenders risk frequent-flyer account closures.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Are airlines required to honor error fares?',
        answer: 'Not automatically. Under US DOT rules, airlines can cancel obvious mistake fares if they notify passengers promptly and reimburse documented non-refundable expenses.',
      },
    ],
  },
  {
    slug: 'europe-on-a-budget-from-usa',
    title: 'How to Fly to Europe Under $450 Round-Trip from US East and West Coasts',
    metaTitle: 'Cheap Flights to Europe Under $450 Round-Trip from the USA',
    metaDescription: 'Use European gateway hubs like Dublin, London, Lisbon, and Madrid to slash transatlantic flight prices from US cities.',
    category: 'International Deals',
    author: 'Elena Vance',
    authorRole: 'Senior Airfare Analyst',
    publishedAt: '2026-11-01',
    updatedAt: '2026-11-12',
    readTimeMinutes: 7,
    wordCount: 920,
    imageKey: 'paris',
    excerpt: 'Flying into Europe’s cheapest transatlantic entry hubs—then hopping on high-speed rail—often beats direct flights to smaller cities by $400+.',
    sections: [
      {
        heading: '1. Target Europe’s Four Lowest-Cost Transatlantic Gateways',
        paragraphs: [
          'Dublin, London, Lisbon, and Madrid consistently carry the lowest base fares from New York, Boston, Washington DC, Chicago, and Miami. Once inside Europe, intra-EU rail passes and short regional hops connect you cleanly to Italy, France, or Central Europe.',
        ],
      },
      {
        heading: '2. Pack Carry-On Only for Transatlantic Light Fares',
        paragraphs: [
          'Transatlantic Economy Light tickets on Air France, Lufthansa, British Airways, and United include a full overhead cabin bag (up to 26–51 lbs depending on carrier), saving $150 round-trip in checked-baggage fees.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Which month has the cheapest flights from the US to Europe?',
        answer: 'February and early November routinely deliver the lowest transatlantic fares across both full-service and low-cost carriers.',
      },
    ],
  },
  {
    slug: 'tokyo-japan-flight-deals-guide',
    title: 'Cheap Flights to Japan: Comparing Haneda vs. Narita & Transpacific Airlines',
    metaTitle: 'Cheap Flights to Tokyo: Haneda vs Narita & Best Airlines',
    metaDescription: 'Compare ANA, JAL, United, and ZIPAIR for cheap flights from the USA to Tokyo, including baggage rules and airport train times.',
    category: 'International Deals',
    author: 'Marcus Thorne',
    authorRole: 'Route Pricing Editor',
    publishedAt: '2026-11-02',
    updatedAt: '2026-11-13',
    readTimeMinutes: 7,
    wordCount: 910,
    imageKey: 'tokyo',
    excerpt: 'From West Coast nonstops under $600 to complimentary 2-bag allowances on ANA, here is everything you need to book Japan smarter.',
    sections: [
      {
        heading: '1. Haneda (HND) vs. Narita (NRT): Why Airport Choice Matters',
        paragraphs: [
          'Haneda sits right along Tokyo Bay, placing you 20 minutes from central Tokyo via monorail or Keikyu trains. Narita sits 40 miles east, requiring a 60–80 minute Narita Express ride. Pay up to $40 more for Haneda when possible—it pays for itself in saved transit fare and jet-lagged travel time.',
        ],
      },
      {
        heading: '2. Two Free Checked Bags on Full-Service Japanese Carriers',
        paragraphs: [
          'While low-cost transpacific carriers entice shoppers with $490 one-way base fares, ANA and Japan Airlines include two 50 lb checked bags, hot meals, and seatback movies on standard Economy tickets.',
        ],
      },
    ],
    faqs: [
      {
        question: 'When should I book flights for cherry blossom season in Japan?',
        answer: 'Book 6 to 8 months ahead for late March through mid-April departures, or consider late January and November for 45% lower airfare.',
      },
    ],
  },
  {
    slug: 'cancun-all-inclusive-vs-separate-flight',
    title: 'Cancun & Riviera Maya: Booking Flights Separately vs. Vacation Packages',
    metaTitle: 'Cancun Flight Deals: Separate Tickets vs Vacation Bundles',
    metaDescription: 'Compare booking cheap flights to Cancun separately versus hotel packages, plus airport shuttle and peak-week timing tips.',
    category: 'Beach & Mexico',
    author: 'Claire Lindqvist',
    authorRole: 'Consumer Aviation Writer',
    publishedAt: '2026-11-03',
    updatedAt: '2026-11-12',
    readTimeMinutes: 6,
    wordCount: 840,
    imageKey: 'cancun',
    excerpt: 'With round-trip US–Cancun fares frequently dipping under $220, knowing when to unbundle your resort and flight can save hundreds.',
    sections: [
      {
        heading: '1. When Separate Flight Deals Beat Resort Packages',
        paragraphs: [
          'When you catch a $188–$230 nonstop flash fare from Dallas, Atlanta, Miami, or New York, booking flights directly and pairing boutique hotels or credit-card points stays usually beats pre-packaged bundles by 20% to 35%.',
        ],
      },
    ],
    faqs: [
      {
        question: 'What is the cheapest US airport to fly to Cancun from?',
        answer: 'Miami (MIA), Fort Lauderdale (FLL), Houston (IAH), and Dallas (DFW) consistently post sub-$210 round-trip fares.',
      },
    ],
  },
  {
    slug: 'tsa-precheck-global-entry-worth-it',
    title: 'TSA PreCheck vs. Global Entry vs. CLEAR: Which Saves Frequent Flyers More?',
    metaTitle: 'TSA PreCheck vs Global Entry vs CLEAR Comparison (2026)',
    metaDescription: 'Compare costs, credit card fee credits, and international customs benefits of TSA PreCheck, Global Entry, and CLEAR.',
    category: 'Airport Hacks',
    author: 'Claire Lindqvist',
    authorRole: 'Consumer Aviation Writer',
    publishedAt: '2026-11-04',
    updatedAt: '2026-11-11',
    readTimeMinutes: 6,
    wordCount: 820,
    imageKey: 'terminal',
    excerpt: 'Global Entry includes TSA PreCheck for five full years—and dozens of US travel cards reimburse the application fee automatically.',
    sections: [
      {
        heading: '1. Why Global Entry Beats Standalone PreCheck for Most Travelers',
        paragraphs: [
          'Even if you fly internationally only once every two years, Global Entry includes full TSA PreCheck access for domestic flights plus expedited US customs kiosks upon returning from Cancun, Europe, or Japan.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Can children use my TSA PreCheck lane?',
        answer: 'Yes, travelers aged 12 and under may accompany an enrolled parent through TSA PreCheck lanes, and teens 13–17 may join when traveling on the same reservation.',
      },
    ],
  },
  {
    slug: 'airline-baggage-size-guide-usa',
    title: 'US Airline Carry-On & Personal Item Size Chart (2026 Updated Rules)',
    metaTitle: 'US Airline Carry-On & Personal Item Size Guide (2026)',
    metaDescription: 'Check exact inch and centimeter limits for Delta, United, American, Southwest, JetBlue, and Spirit carry-on bags before reaching the gate.',
    category: 'Packing & Fees',
    author: 'Claire Lindqvist',
    authorRole: 'Consumer Aviation Writer',
    publishedAt: '2026-11-05',
    updatedAt: '2026-11-13',
    readTimeMinutes: 6,
    wordCount: 860,
    imageKey: 'terminal',
    excerpt: 'Avoid surprise $65 gate-check fees with exact carry-on and under-seat backpack dimensions across every major US carrier.',
    sections: [
      {
        heading: '1. Standard 22 x 14 x 9 Inches vs. Budget Personal Items',
        paragraphs: [
          'Most full-service US airlines standardize on 22 x 14 x 9 inches for overhead roller bags, while personal items on Spirit and Frontier must compress inside 18 x 14 x 8 inches including wheels and handles.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Do wheels and handles count toward airline carry-on dimensions?',
        answer: 'Yes. Always measure from the floor to the top of the retracted handle including spinner wheels.',
      },
    ],
  },
  {
    slug: 'last-minute-flight-deals-usa',
    title: 'How to Find Last-Minute Flight Deals Without Paying Walk-Up Prices',
    metaTitle: 'How to Score Last-Minute Cheap Flights in the USA',
    metaDescription: 'Strategies for finding affordable domestic and Caribbean flights within 14 days of departure without falling for walk-up fare spikes.',
    category: 'Booking Strategy',
    author: 'Marcus Thorne',
    authorRole: 'Route Pricing Editor',
    publishedAt: '2026-11-06',
    updatedAt: '2026-11-13',
    readTimeMinutes: 6,
    wordCount: 810,
    imageKey: 'nyc',
    excerpt: 'Need to fly this weekend? Use one-way carrier mixing, red-eye departures, and airline miles to dodge $500+ last-minute domestic spikes.',
    sections: [
      {
        heading: '1. Mix Two One-Way Tickets Across Different Airlines',
        paragraphs: [
          'When flying inside 10 days, one airline may have cheap outbound seats while a rival has cheaper returns. Booking two separate one-way fares frequently saves $110–$240 compared to forcing a single-carrier round-trip.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Do airlines drop prices at the airport counter right before takeoff?',
        answer: 'No—airport walk-up fares are almost always the highest full-fare Y-class buckets available.',
      },
    ],
  },
  {
    slug: 'family-travel-flight-savings',
    title: 'Flying With Kids on a Budget: Seat Selection, Strollers, and Family Fares',
    metaTitle: 'Budget Family Flight Guide: Free Seats, Strollers & Savings',
    metaDescription: 'Save hundreds on family airfare using US DOT family seating policies, free gate-checked strollers, and companion fare perks.',
    category: 'Family Travel',
    author: 'Elena Vance',
    authorRole: 'Senior Airfare Analyst',
    publishedAt: '2026-11-07',
    updatedAt: '2026-11-12',
    readTimeMinutes: 6,
    wordCount: 830,
    imageKey: 'cancun',
    excerpt: 'Know which US airlines guarantee adjacent seating for children at no extra fee—and how to pack smarter for multi-person itineraries.',
    sections: [
      {
        heading: '1. Airlines Guaranteeing Free Family Adjacent Seating',
        paragraphs: [
          'American, United, Alaska, and Frontier offer fee-free adjacent seating policies for children 13 and under when booked on the same reservation in qualifying cabins—saving families $120+ per trip in seat fees.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Do strollers and car seats count toward baggage limits?',
        answer: 'No. Every major US airline allows one stroller and one FAA-approved child restraint or car seat to be checked free of charge.',
      },
    ],
  },
  {
    slug: 'open-jaw-multi-city-flights',
    title: 'Open-Jaw & Multi-City Tickets: See Two Cities for the Price of One',
    metaTitle: 'Open-Jaw & Multi-City Flight Hacks Explained',
    metaDescription: 'Fly into London and home from Paris or Rome on a single multi-city ticket to save backtracking time and train money.',
    category: 'Booking Strategy',
    author: 'Marcus Thorne',
    authorRole: 'Route Pricing Editor',
    publishedAt: '2026-11-08',
    updatedAt: '2026-11-13',
    readTimeMinutes: 6,
    wordCount: 790,
    imageKey: 'paris',
    excerpt: 'Never waste your last vacation day riding a train back to your arrival airport—here is how open-jaw pricing works.',
    sections: [
      {
        heading: '1. Why Open-Jaw Tickets Rarely Cost More Than Round-Trips',
        paragraphs: [
          'Airline alliance pricing allows you to fly JFK → London and return Paris → JFK on a single round-trip fare calculation (half of each city’s round-trip fare), eliminating costly return train tickets and wasted travel mornings.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Is a multi-city ticket cheaper than two one-way international flights?',
        answer: 'Almost always yes—international one-way fares on legacy carriers are frequently priced higher than complete round-trip or open-jaw tickets.',
      },
    ],
  },
  {
    slug: 'student-youth-flight-discounts-usa',
    title: 'Student & Youth Flight Discounts: Best Airlines and Verification Platforms',
    metaTitle: 'Student Flight Discounts USA: Airlines & Booking Tips',
    metaDescription: 'Find verified student airfare discounts on United, Delta partners, Lufthansa, and Emirates plus flexible date change benefits.',
    category: 'Student Travel',
    author: 'Claire Lindqvist',
    authorRole: 'Consumer Aviation Writer',
    publishedAt: '2026-11-09',
    updatedAt: '2026-11-13',
    readTimeMinutes: 5,
    wordCount: 740,
    imageKey: 'terminal',
    excerpt: 'College travelers aged 18–25 can unlock 5%–15% off base international fares plus extra baggage allowances with .edu verification.',
    sections: [
      {
        heading: '1. Young Adult & Student Fare Programs Worth Checking',
        paragraphs: [
          'United Airlines offers Young Adult discounts (ages 18–23) inside its mobile app, while international carriers such as Emirates, Qatar Airways, and Lufthansa provide extra checked luggage and flexible date changes for verified university students.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Are student travel sites always cheaper than public flight deals?',
        answer: 'Not always—always benchmark student portal quotes against public flash sales on SkyFare before booking.',
      },
    ],
  },
  {
    slug: 'flight-delay-compensation-us-eu',
    title: 'Flight Delay & Cancellation Rights: US DOT Rules vs. EU261 Compensation',
    metaTitle: 'Flight Delay & Cancellation Compensation: US DOT vs EU261',
    metaDescription: 'Know when you are entitled to automatic cash refunds in the USA and up to €600 compensation on European airline flights.',
    category: 'Traveler Rights',
    author: 'Elena Vance',
    authorRole: 'Senior Airfare Analyst',
    publishedAt: '2026-11-10',
    updatedAt: '2026-11-14',
    readTimeMinutes: 7,
    wordCount: 950,
    imageKey: 'hero',
    excerpt: 'Automatic cash refunds for canceled US flights and €600 statutory payouts on eligible European arrivals—know your rights before disruptions hit.',
    sections: [
      {
        heading: '1. Automatic Cash Refunds Under US DOT Rules',
        paragraphs: [
          'If your US flight is canceled or significantly delayed (3+ hours domestic, 6+ hours international) and you choose not to travel on the rebooked itinerary, airlines must issue automatic refunds to your original payment method—never feel pressured to accept an expiring voucher.',
        ],
      },
      {
        heading: '2. How EU261 Protects US Travelers Flying to & from Europe',
        paragraphs: [
          'Flights departing the EU/UK on any carrier, or arriving into the EU/UK on a European/British carrier like Air France, British Airways, or Lufthansa, qualify for €250 to €600 cash compensation for controllable delays over 3 hours.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Does EU261 apply to Delta or United flights from New York to Paris?',
        answer: 'It applies to the return flight departing Paris (CDG → JFK) on US carriers, and both directions when operated by an EU/UK carrier like Air France or British Airways.',
      },
    ],
  },
];

export function getGuideBySlug(slug: string): TravelGuide | undefined {
  return TRAVEL_GUIDES.find((g) => g.slug === slug);
}
