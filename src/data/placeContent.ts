import type { AirlineInfo, DestinationInfo } from '../types/flight';

/**
 * Evergreen text for destination and airline pages.
 * Rules: geography, airport roles, alliance membership and seasonal patterns that change slowly;
 * no fares, fees or bag allowances (those change, so readers are sent to the airline); no invented statistics.
 * Entry-document rules are never stated, only pointed to the official government source.
 */
type DestText = Pick<DestinationInfo, 'summary' | 'airportTips' | 'cheapestMonths' | 'bestDaysToFly' | 'faqs'> & { overview: string[] };

const entry = 'Entry rules for US passport holders, including passport validity and any online authorisation, change; check the destination country\'s official government site before you buy.';

export const DESTINATION_TEXT: Record<string, DestText> = {
  'new-york': {
    summary: 'New York City is served by three major airports, so airlines compete hard for passengers and it is worth pricing all three.',
    airportTips: 'JFK and LaGuardia are in Queens and Newark is in New Jersey. Each has rail, subway or bus links to Manhattan, so compare the ground journey and cost, not only the fare.',
    cheapestMonths: 'Often outside school holidays and the year-end period; confirm with a fare calendar for your dates',
    bestDaysToFly: 'Midweek is often quieter than Friday and Sunday; test your own dates',
    overview: [
      'LaGuardia mainly handles domestic and short-haul flights, while JFK and Newark carry most of the long-haul international traffic. Which one is cheapest changes by route and by day, so searching all three at once is the simplest way to find a lower fare.',
      'Demand is highest in summer and around the December holidays, when hotels also cost more. Winter can be cold and snowy, which occasionally disrupts flights, so allow extra time for connections and consider a morning departure. Public transport from each airport is the cheapest way into the city, and taxis and ride-hailing are available at all three.',
    ],
    faqs: [
      { question: 'Which New York airport should I choose?', answer: 'Compare all three for your dates. The best choice depends on your route, the fare and how easily you can reach your final destination from each airport.' },
      { question: 'How do I get from the airport to Manhattan?', answer: 'Each airport has public-transport options plus taxis and ride-hailing. Check the airport operator\'s official page for current routes and prices.' },
      { question: 'When is the best time to find a lower fare?', answer: 'Fares vary by season and demand. A flexible-date search for your route shows the pattern better than a general rule.' },
    ],
  },
  cancun: {
    summary: 'Cancun is a leading beach destination on Mexico\'s Caribbean coast, served by one large international airport.',
    airportTips: 'The airport is a short drive from the Hotel Zone and farther from Playa del Carmen and Tulum. Use official airport transport or a transfer arranged through your hotel rather than unsolicited offers in the terminal.',
    cheapestMonths: 'Often outside the winter peak and school holidays; the Atlantic hurricane season runs roughly June to November',
    bestDaysToFly: 'Midweek flights are often quieter; test your own dates',
    overview: [
      'Cancun International Airport (CUN) receives flights from many US cities and also serves the wider Riviera Maya. The resorts are spread along the coast, so check how far your hotel is from the airport before you book, as transfers can be long and add to the cost.',
      'Winter is the busiest and usually the most expensive season; the summer and early autumn months are often cheaper but fall within the Atlantic hurricane season, so consider flexible fares and travel insurance. ' + entry,
    ],
    faqs: [
      { question: 'Is it better to book a package or a flight alone?', answer: 'It depends on the dates, the hotel and what is included. Price both ways, as described in our Cancun package guide.' },
      { question: 'How far is Playa del Carmen from the airport?', answer: 'It is a drive of a few dozen miles south of Cancun airport. Check current transfer times and prices with your hotel or an official airport service.' },
      { question: 'What documents do I need?', answer: entry },
    ],
  },
  tokyo: {
    summary: 'Tokyo has two international airports: Haneda, close to the city, and Narita, farther east.',
    airportTips: 'Both airports connect to central Tokyo by train. Haneda is closer; Narita takes longer. Check the last trains and buses if you land late at night.',
    cheapestMonths: 'Often outside the spring cherry-blossom weeks, the autumn foliage season and major holidays',
    bestDaysToFly: 'Fares vary by route; compare several departure days',
    overview: [
      'Which airport an airline uses depends on the route and can change by season. Haneda is generally quicker to reach from the city centre, while Narita often has more choice of airlines and fares. Add the ground transfer time and cost to your comparison rather than choosing on the flight price alone.',
      'Spring cherry blossoms and autumn colours are very popular times to visit, and flights and hotels for those weeks fill early. The rainy season in early summer and the hot, humid late summer are quieter. ' + entry,
    ],
    faqs: [
      { question: 'Should I fly into Haneda or Narita?', answer: 'Haneda is closer to central Tokyo; Narita is farther. Compare the fare, arrival time and transfer for your itinerary.' },
      { question: 'When should I book for cherry-blossom season?', answer: 'Early. Demand is high, so look well ahead and set a price alert for your dates.' },
      { question: 'What documents do I need?', answer: entry },
    ],
  },
  paris: {
    summary: 'Paris has two main airports, Charles de Gaulle to the north-east and Orly to the south.',
    airportTips: 'Charles de Gaulle handles most long-haul flights and has rail links to the city. Orly is smaller and closer to the south of Paris. Check the current train, metro and bus options on the official airport pages.',
    cheapestMonths: 'Often outside the summer peak and the year-end holidays',
    bestDaysToFly: 'Compare several departure days; fares vary by route',
    overview: [
      'Most flights from the US arrive at Charles de Gaulle, with Orly used by some routes and carriers. The two airports are on opposite sides of the city, so check which one your fare uses and how it connects to your hotel.',
      'Summer is the busiest period and spring and autumn are popular and milder. Winter is quieter, apart from the weeks around Christmas and New Year. France is in the Schengen area, so rules for entry and for the length of your stay apply. ' + entry,
    ],
    faqs: [
      { question: 'Which Paris airport is better?', answer: 'Charles de Gaulle serves most long-haul flights; Orly is smaller. Choose by fare, schedule and access to your accommodation.' },
      { question: 'How do I reach central Paris?', answer: 'There are train, bus and taxi options from the main airports. Check the official airport and transport pages for current routes and prices.' },
      { question: 'What documents do I need?', answer: entry },
    ],
  },
  miami: {
    summary: 'Miami and Fort Lauderdale are two large airports about half an hour apart, and comparing both can reveal a lower fare.',
    airportTips: 'Miami International (MIA) is closest to Miami and the cruise port; Fort Lauderdale (FLL) is north of the city and often convenient for Fort Lauderdale and Palm Beach. Check the drive time to your hotel at each.',
    cheapestMonths: 'Often outside the winter peak; the Atlantic hurricane season runs roughly June to November',
    bestDaysToFly: 'Midweek is often quieter; test your own dates',
    overview: [
      'South Florida is served by several airlines at each airport, and fares differ between them from day to day. Searching Miami and Fort Lauderdale together is a simple way to widen your options.',
      'Winter is the peak season for visitors, with milder weather than much of the country. Summer is hot and humid with afternoon storms, and early autumn falls in hurricane season, so consider flexible fares and read the cancellation terms. Many cruises depart from the area, so allow generous time if you are connecting to a ship.',
    ],
    faqs: [
      { question: 'Miami or Fort Lauderdale?', answer: 'Compare fares at both and the travel time from each to where you are staying.' },
      { question: 'When is hurricane season?', answer: 'The Atlantic season runs roughly from June to November. Choose flexible fares and check cancellation terms.' },
      { question: 'Is the airport close to the cruise port?', answer: 'Miami International is relatively close to PortMiami. Check current transfer times and allow plenty of time.' },
    ],
  },
  london: {
    summary: 'London is served by several airports, with Heathrow and Gatwick the best known for transatlantic flights.',
    airportTips: 'Heathrow is to the west and Gatwick to the south. Both have rail links to central London. Check the current routes, prices and journey times on the official airport and rail pages.',
    cheapestMonths: 'Often outside the summer peak and the weeks around Christmas and New Year',
    bestDaysToFly: 'Compare several departure days; fares vary by route',
    overview: [
      'Heathrow is the largest airport and is used by many transatlantic airlines; Gatwick also has long-haul services. Other airports around London handle mainly European routes. Check which airport your itinerary uses and how it connects to where you are staying, since the airports are far apart.',
      'London is busiest in summer and around the December holidays; spring and autumn can be pleasant and are often less crowded. The weather is changeable all year, so pack for rain. The United Kingdom is outside the Schengen area and has its own entry rules for visitors, including electronic travel authorisation for some nationalities. ' + entry,
    ],
    faqs: [
      { question: 'Heathrow or Gatwick?', answer: 'Compare the fare and the journey to your accommodation. Both have rail links to the centre.' },
      { question: 'How do I get into the city?', answer: 'There are train, metro and bus options. Check the official pages for current services and prices.' },
      { question: 'What documents do I need?', answer: entry },
    ],
  },
  'los-angeles': {
    summary: 'Greater Los Angeles has several airports, so it is worth comparing Los Angeles International with the smaller airports nearby.',
    airportTips: 'LAX is the largest and handles most long-haul flights. Burbank and John Wayne (Orange County) are smaller and can be easier to use for some destinations. Traffic can be heavy, so plan the ground journey with care.',
    cheapestMonths: 'Often outside the summer peak and holiday periods',
    bestDaysToFly: 'Midweek is often quieter; test your own dates',
    overview: [
      'LAX has services across the US and to Asia, Europe, Latin America and Australia, which makes it a major gateway. Smaller airports in the region can offer shorter queues and, on some routes, lower fares, so searching them together is worthwhile.',
      'The region has a mild climate for much of the year, so visitors arrive in every season; school holidays and summer are the busiest. Distances are large and public transport is limited compared with some cities, so most visitors use rental cars, ride-hailing or airport shuttles. Allow extra time for traffic when you connect to an early or late flight.',
    ],
    faqs: [
      { question: 'Should I consider airports other than LAX?', answer: 'Yes. Burbank and Orange County can be convenient and sometimes cheaper. Compare fares and the drive to your destination.' },
      { question: 'How do I get from LAX into the city?', answer: 'Options include shuttles, ride-hailing, rental cars and some public transport. Check the official airport page for the current choices.' },
      { question: 'When is the busiest time to travel?', answer: 'Summer and school holidays are generally the busiest. A fare calendar for your dates shows the effect on price.' },
    ],
  },
  rome: {
    summary: 'Rome\'s main international airport is Fiumicino, to the south-west of the city, with Ciampino as a smaller second airport.',
    airportTips: 'Fiumicino has a direct train to the central railway station and bus and taxi services. Check the official airport and rail pages for current times and prices.',
    cheapestMonths: 'Often outside the summer peak and major holidays',
    bestDaysToFly: 'Compare several departure days; fares vary by route',
    overview: [
      'Fiumicino (FCO) is where most flights from the US arrive. Ciampino is used mainly by low-cost carriers on European routes. Check which airport your fare uses and how it connects to your accommodation.',
      'Spring and autumn are popular for sightseeing and the weather is milder, while midsummer can be very hot and crowded. Major religious holidays and special events can raise prices and crowds, so check the calendar for your dates. Italy is part of the Schengen area, and entry rules apply. ' + entry,
    ],
    faqs: [
      { question: 'How do I get from the airport to the centre?', answer: 'Fiumicino has a direct train to central Rome, plus bus and taxi options. Check official pages for current services.' },
      { question: 'When is the best time to visit?', answer: 'Spring and autumn are popular for milder weather; summer is hotter and busier. Choose to suit your priorities and budget.' },
      { question: 'What documents do I need?', answer: entry },
    ],
  },
  honolulu: {
    summary: 'Honolulu, on the island of Oahu, is Hawaii\'s main gateway and a domestic destination for US travellers.',
    airportTips: 'Daniel K. Inouye International Airport (HNL) is the main arrival point. Rental cars, shuttles and ride-hailing are available, and interisland flights connect to the other islands.',
    cheapestMonths: 'Often outside the winter peak and the summer school holidays',
    bestDaysToFly: 'Midweek is often quieter; test your own dates',
    overview: [
      'Flights from the US mainland are long, and the time difference can be significant, so many travellers plan a few extra rest days at each end. If you intend to visit more than one island, compare a multi-city or open-jaw ticket with separate interisland flights.',
      'Winter and summer are the busiest seasons for visitors, and accommodation is priced accordingly. Because Hawaii is part of the United States, travel from the mainland does not require a passport for US citizens, though you will need photo identification. Check the state\'s current travel and agricultural-inspection requirements before you fly.',
    ],
    faqs: [
      { question: 'Do I need a passport?', answer: 'US citizens flying from the mainland generally need photo identification, not a passport. Check current requirements with the airline.' },
      { question: 'Is it cheaper to fly to a different island?', answer: 'Sometimes. Compare fares into each island and the cost of interisland flights.' },
      { question: 'Do I need a rental car?', answer: 'It depends on where you stay and what you plan to do. Consider shuttles and public transport in Honolulu.' },
    ],
  },
  seattle: {
    summary: 'Seattle-Tacoma International (SEA) is the Pacific Northwest\'s main airport and a gateway to Alaska and Asia.',
    airportTips: 'SEA is south of the city and connects to downtown by light rail, with taxis, ride-hailing and shuttles also available. Check the official pages for current services.',
    cheapestMonths: 'Often outside the summer peak; Alaska cruise season is roughly May to September',
    bestDaysToFly: 'Midweek is often quieter; test your own dates',
    overview: [
      'Seattle is a hub for a major West Coast carrier and has services across the US, to Alaska and to Asia, so there are many options. If your trip combines Seattle with Alaska or Canada, compare a multi-city ticket with separate bookings.',
      'Summer is typically dry and the busiest time to visit; the rest of the year is cooler and wetter. Cruise passengers heading to Alaska use the city in large numbers during the season, which can raise hotel prices. The airport can be busy at peak hours, so allow extra time at security.',
    ],
    faqs: [
      { question: 'How do I get from SEA to downtown?', answer: 'Light rail, taxis, ride-hailing and shuttles are available. Check the official airport page for current options.' },
      { question: 'When is the busiest season?', answer: 'Summer, especially with Alaska cruises. A fare calendar for your dates shows the effect on price.' },
      { question: 'Is a multi-city ticket worthwhile?', answer: 'If you are combining Seattle with another place, price it against separate tickets and see our multi-city guide.' },
    ],
  },
  dublin: {
    summary: 'Dublin Airport is Ireland\'s main international gateway and offers US border preclearance for flights to the United States.',
    airportTips: 'The airport is north of the city and connects by bus, coach and taxi. If you are flying home to the US, allow extra time for preclearance, which is done before departure.',
    cheapestMonths: 'Often outside the summer peak and major events',
    bestDaysToFly: 'Compare several departure days; fares vary by route',
    overview: [
      'Dublin has direct flights to a number of US cities and is a popular first stop for visiting Ireland. The airport offers US preclearance, which means you pass US immigration and customs in Dublin before you board, so you arrive in the United States as a domestic passenger. Allow plenty of time for this when flying home.',
      'The climate is mild and changeable throughout the year. Summer and major events such as festivals and sports fixtures are the busiest times. Ireland is outside the Schengen area and has its own entry rules. ' + entry,
    ],
    faqs: [
      { question: 'What is US preclearance?', answer: 'You complete US immigration and customs checks at Dublin before departure. Allow extra time and check the airport\'s guidance.' },
      { question: 'How do I get into the city?', answer: 'Bus, coach and taxi services are available. Check official pages for current options.' },
      { question: 'What documents do I need?', answer: entry },
    ],
  },
  lisbon: {
    summary: 'Lisbon\'s airport is unusually close to the city centre and is a popular gateway to Portugal and the Iberian Peninsula.',
    airportTips: 'The airport is a short journey from the centre and connects by metro, bus and taxi. Check the official pages for current options.',
    cheapestMonths: 'Often outside the summer peak and major holidays',
    bestDaysToFly: 'Compare several departure days; fares vary by route',
    overview: [
      'Lisbon has services from several US cities, and because the airport is near the centre, the transfer is usually short and inexpensive compared with many European capitals. Check the schedule, as some transatlantic services run only on certain days or seasons.',
      'Spring and autumn are mild and popular; midsummer can be hot and crowded. Winter is mild but wetter. Portugal is in the Schengen area, so rules on entry and length of stay apply. ' + entry,
    ],
    faqs: [
      { question: 'How far is the airport from the centre?', answer: 'It is relatively close. Check official pages for the current metro, bus and taxi options.' },
      { question: 'When is the best time to visit?', answer: 'Spring and autumn are popular for mild weather; summer is hotter and busier.' },
      { question: 'What documents do I need?', answer: entry },
    ],
  },
};

type AirText = Pick<AirlineInfo, 'summary' | 'carryOnPolicy' | 'checkedBagFee' | 'changePolicy' | 'bookingTip'> & { overview: string[]; site: string };
const bags = (site: string) => `Allowances differ by fare and route and change over time. Read the baggage page on ${site} for the exact fare you are buying.`;
const fees = (site: string) => `Fees depend on route, fare and when you pay. See the fees page on ${site}.`;
const changes = 'Change and refund terms depend on the fare you choose. Read the fare rules before you pay.';
const tip = 'Compare the cheapest fare with the next one up for your own trip: add the bags, seat selection and flexibility you need, then compare totals.';

export const AIRLINE_TEXT: Record<string, AirText> = {
  delta: {
    site: 'delta.com',
    summary: 'A large US network carrier and a founding member of the SkyTeam alliance, with major hubs in Atlanta, New York, Detroit, Minneapolis, Salt Lake City, Seattle, Los Angeles and Boston.',
    carryOnPolicy: bags('delta.com'), checkedBagFee: fees('delta.com'), changePolicy: changes, bookingTip: tip,
    overview: ['Delta sells several fare levels, from a restricted entry fare to fully flexible tickets, and what each includes can change. The differences that matter most are usually seat selection, baggage and the cost of changing your plans.', 'As a SkyTeam member it connects with partner airlines, which can help on itineraries that continue beyond the US, such as to Europe or Asia. If you travel on a ticket that includes a partner flight, check the baggage and check-in rules for each segment.'],
  },
  united: {
    site: 'united.com',
    summary: 'A large US network carrier and a member of the Star Alliance, with major hubs in Chicago, Newark, Houston, Denver, San Francisco, Washington Dulles and Los Angeles.',
    carryOnPolicy: bags('united.com'), checkedBagFee: fees('united.com'), changePolicy: changes, bookingTip: tip,
    overview: ['United flies a wide network from its hubs, including many long-haul routes. Its fares range from a restricted entry level to flexible tickets, and baggage and change terms differ by fare.', 'As a Star Alliance member it works with partners such as ANA, which can help when you are planning a trip to Asia or Europe. Always check baggage and check-in rules for every airline on a multi-carrier ticket.'],
  },
  american: {
    site: 'aa.com',
    summary: 'A large US network carrier and a member of the oneworld alliance, with major hubs in Dallas-Fort Worth, Charlotte, Chicago, Miami, Philadelphia, Phoenix, Washington and New York.',
    carryOnPolicy: bags('aa.com'), checkedBagFee: fees('aa.com'), changePolicy: changes, bookingTip: tip,
    overview: ['American operates one of the largest networks in the United States, with many connections through its hubs. It sells an entry-level fare with restrictions and several higher fares with more flexibility.', 'As a oneworld member it partners with airlines such as British Airways, which can help on transatlantic itineraries. Compare the total cost, including baggage and seat selection, before you decide which fare to buy.'],
  },
  southwest: {
    site: 'southwest.com',
    summary: 'A large US domestic carrier known for a point-to-point network rather than a traditional hub-and-spoke model, with a smaller number of international destinations.',
    carryOnPolicy: bags('southwest.com'), checkedBagFee: fees('southwest.com'), changePolicy: changes, bookingTip: tip,
    overview: ['Southwest sells its fares directly on its own website and does not appear in every comparison site, so check it separately. Its policies on baggage, seating and changes have been revised in recent years, so read the current terms rather than relying on older articles.', 'It flies mostly within the US and to nearby international destinations, and does not belong to a major global alliance. If your trip continues overseas, plan it as separate bookings and allow generous time for connections.'],
  },
  jetblue: {
    site: 'jetblue.com',
    summary: 'A US airline with a strong presence in New York, Boston and Florida and transatlantic service from some US cities, not part of a major global alliance.',
    carryOnPolicy: bags('jetblue.com'), checkedBagFee: fees('jetblue.com'), changePolicy: changes, bookingTip: tip,
    overview: ['JetBlue offers several fare levels, from an entry fare with restrictions to flexible options, and what is included differs between them. Check baggage, seat selection and change terms on its site for the fare you are about to buy.', 'It focuses on routes along the East Coast, to the Caribbean and Latin America, and some transatlantic routes. Because it is not in a major alliance, trips that continue beyond its network involve separate bookings or specific partners, so check protection for missed connections.'],
  },
  alaska: {
    site: 'alaskaair.com',
    summary: 'A US airline based in Seattle, with a strong West Coast network, and a member of the oneworld alliance.',
    carryOnPolicy: bags('alaskaair.com'), checkedBagFee: fees('alaskaair.com'), changePolicy: changes, bookingTip: tip,
    overview: ['Alaska flies extensively along the West Coast and to Alaska, Hawaii and other US destinations. Its fares include an entry level with restrictions and several higher levels, with differences in baggage, seat selection and changes.', 'As a oneworld member it connects with partner airlines on routes beyond its own network. If you combine Alaska with a partner on one ticket, check the baggage and check-in rules for every segment.'],
  },
  'british-airways': {
    site: 'britishairways.com',
    summary: 'The UK\'s flag carrier, based at London Heathrow, and a member of the oneworld alliance with many transatlantic services.',
    carryOnPolicy: bags('britishairways.com'), checkedBagFee: fees('britishairways.com'), changePolicy: changes, bookingTip: tip,
    overview: ['British Airways flies from many US cities to London and connects onward across Europe and beyond. Its long-haul fares include entry-level options with fewer inclusions and fuller fares with more flexibility, so compare what you actually need.', 'Tickets to London can include taxes and charges that are significant, so look at the total price rather than the headline. If you are connecting at Heathrow, allow enough time for the transfer, which can involve moving between terminals.'],
  },
  'air-france': {
    site: 'airfrance.us',
    summary: 'The French flag carrier, based at Paris Charles de Gaulle, and a member of the SkyTeam alliance with many transatlantic services.',
    carryOnPolicy: bags('airfrance.us'), checkedBagFee: fees('airfrance.us'), changePolicy: changes, bookingTip: tip,
    overview: ['Air France flies from a number of US cities to Paris and connects onward across Europe, Africa and Asia. Its long-haul fares include lighter options and more inclusive ones, so check baggage, seat selection and change terms for the fare you are buying.', 'It works with its alliance partners, including Delta, so some itineraries combine the two carriers. If you connect in Paris, allow adequate time for immigration and for changing terminals, particularly on separate tickets.'],
  },
  ana: {
    site: 'ana.co.jp',
    summary: 'A major Japanese airline and a member of the Star Alliance, flying between the US and Tokyo and connecting onward across Japan and Asia.',
    carryOnPolicy: bags('ana.co.jp'), checkedBagFee: fees('ana.co.jp'), changePolicy: changes, bookingTip: tip,
    overview: ['ANA operates flights from several US cities to Tokyo, using both of the city\'s major airports on different routes. Check which airport your flight uses, since it affects the journey into the city and your connection options.', 'It connects with partner airlines in the Star Alliance, which can help on a trip combining the US, Japan and other parts of Asia. Baggage allowances on international tickets can differ from domestic ones, so read the terms for the exact fare.'],
  },
  spirit: {
    site: 'spirit.com',
    summary: 'A US low-cost carrier that sells a base fare for the seat and charges separately for extras, a model known as unbundled or ultra-low-cost.',
    carryOnPolicy: bags('spirit.com'), checkedBagFee: fees('spirit.com'), changePolicy: changes,
    bookingTip: 'Price the whole trip with the bags and seats you need before comparing it with a full-service fare. Check the airline\'s current route map and status, since low-cost networks change.',
    overview: ['Low-cost carriers can offer low base fares, but a carry-on bag, a checked bag and seat selection are often charged separately, and the cost can differ depending on when and how you pay. Compare the total, not the headline.', 'Because these airlines often fly a route only once or twice a day, a cancellation can leave you waiting. Read the airline\'s own policy on disruptions and check that its network and schedule currently serve your route.'],
  },
};
