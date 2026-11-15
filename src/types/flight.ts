export type ImageKey =
  | 'hero'
  | 'nyc'
  | 'cancun'
  | 'tokyo'
  | 'paris'
  | 'terminal';

export type CabinClass = 'Economy' | 'Premium Economy' | 'Business' | 'First';
export type TripCategory = 'domestic' | 'international';
export type DepartureWindow = 'Morning' | 'Afternoon' | 'Evening';

export interface FlightDeal {
  id: string;
  airlineSlug: string;
  airlineName: string;
  airlineCode: string;
  originCode: string;
  originCity: string;
  destinationCode: string;
  destinationCity: string;
  destinationSlug: string;
  country: string;
  category: TripCategory;
  price: number;
  originalPrice: number;
  discountPercent: number;
  departureDate: string;
  returnDate: string;
  tripType: 'Round-trip' | 'One-way';
  durationMinutes: number;
  durationLabel: string;
  stops: number;
  stopoverAirport?: string;
  departureTime: string;
  departureWindow: DepartureWindow;
  baggagePolicy: string;
  cabinClass: CabinClass;
  expiresAt: string;
  lastUpdated: string;
  isWeekendGetaway: boolean;
  isLastMinute: boolean;
  isTopWeekly: boolean;
  partnerName: 'Travelpayouts' | 'Expedia' | 'Skyscanner' | 'Amadeus Partner';
  affiliateUrl: string;
  imageKey: ImageKey;
  customImageUrl?: string;
  highlights: string[];
}

export interface DestinationInfo {
  slug: string;
  city: string;
  country: string;
  airportCodes: string[];
  category: TripCategory;
  imageKey: ImageKey;
  startingPrice: number;
  averagePrice: number;
  cheapestMonths: string;
  bestDaysToFly: string;
  flightTimeFromEast: string;
  flightTimeFromWest: string;
  summary: string;
  airportTips: string;
  faqs: { question: string; answer: string }[];
}

export interface AirlineInfo {
  slug: string;
  name: string;
  code: string;
  colorHex: string;
  accentHex: string;
  type: 'Full-Service' | 'Low-Cost' | 'International Flag Carrier';
  hubs: string[];
  carryOnPolicy: string;
  checkedBagFee: string;
  changePolicy: string;
  summary: string;
  bookingTip: string;
}

export interface GuideSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
  table?: {
    headers: string[];
    rows: string[][];
  };
}

export interface TravelGuide {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  category: string;
  tags?: string;
  status?: 'published' | 'draft';
  author: string;
  authorRole: string;
  publishedAt: string;
  updatedAt: string;
  readTimeMinutes: number;
  wordCount: number;
  imageKey: ImageKey;
  customImageUrl?: string;
  imageAlt?: string;
  reviewStatus?: string;
  reviewedAt?: string;
  excerpt: string;
  sections: GuideSection[];
  faqs: { question: string; answer: string }[];
}

export interface CategoryRecord {
  id: number;
  name: string;
  slug: string;
  description: string;
}

export interface AdPlacementConfig {
  slot_id: string;
  name: string;
  network: 'AdSense' | 'Media.net' | string;
  enabled: number;
  ad_unit_code: string;
  min_height: number;
  ad_size?: string;
}

export interface LegalPageRecord {
  slug: string;
  title: string;
  meta_title: string;
  meta_description: string;
  content_markdown: string;
  updated_at: string;
}

export interface MediaAssetRecord {
  id: string;
  filename: string;
  mime_type: string;
  size_bytes: number;
  alt_text: string;
  url: string;
  created_at: string;
}

export interface SiteGeneralSettings {
  siteName: string;
  tagline: string;
  supportEmail: string;
  publisherName?: string;
  companyAddress: string;
  emailAlertsEnabled?: boolean;
  defaultTitle: string;
  defaultDescription: string;
  gscVerificationCode: string;
  ga4MeasurementId: string;
}

export interface MonetizationSettings {
  adsEnabled?: boolean;
  adsensePublisherId: string;
  medianetCustomerId: string;
  medianetSiteId: string;
  adsTxtExtra?: string;
}

export interface MenuItem {
  label: string;
  path: string;
}

export interface HomepageConfig {
  heroTitle: string;
  heroSubtitle: string;
  showTopWeekly: boolean;
  showDestinations: boolean;
  showHowItWorks: boolean;
  showNewsletter: boolean;
  showFaqs: boolean;
}

export interface SiteBootstrap {
  deals: FlightDeal[];
  guides: TravelGuide[];
  categories: CategoryRecord[];
  adPlacements: AdPlacementConfig[];
  legalPages: LegalPageRecord[];
  general: SiteGeneralSettings;
  monetization: MonetizationSettings;
  menus: MenuItem[];
  homepage: HomepageConfig;
  authors?: { id: number; name: string; role: string; bio: string }[];
}

export interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'editor' | 'analyst';
  active: number;
  created_at: string;
}
