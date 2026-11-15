import { createContext, useContext } from 'react';
import type { AdPlacementConfig, MonetizationSettings, SiteGeneralSettings } from '../types/flight';

export interface SiteConfig {
  general?: SiteGeneralSettings;
  monetization?: MonetizationSettings;
  adPlacements: AdPlacementConfig[];
}

export const SiteConfigContext = createContext<SiteConfig>({ adPlacements: [] });
export const useSiteConfig = () => useContext(SiteConfigContext);
