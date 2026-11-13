import type { EnvironmentType } from '../components/EnvironmentCards';

export interface ThemeTokens {
  name: EnvironmentType;
  // Backgrounds & Overlays
  pageBackground: string;
  readabilityVeil: string;
  backgroundImage: string;
  
  // Card Surfaces & Glassmorphism
  cardBg: string;
  cardGlassStyle: React.CSSProperties;
  cardBorder: string;
  cardBorderHex: string;
  cardShadow: string;
  cardSurface: string; // Ready-to-use Tailwind class combination
  bannerSurface: string;
  
  // Typography Colors
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  
  // Accent & Highlights
  accent: string;
  accentPale: string;
  accentGlow: string;
  warning: string;
  
  // Interactive & UI Controls
  buttonPrimary: string;
  buttonSecondary: string;
  inputBg: string;
  tagBadge: string;
  
  // Navigation Tokens
  navSelectedBg: string;
  navSelectedBorder: string;
  navSelectedMarker: string;
  navItemActive: string;
  navItemInactive: string;
  
  // 3D Model Shading
  modelColor: number;
  modelEmissive: number;
  modelEmissiveIntensity: number;
  modelRoughness: number;
  modelMetalness: number;
  modelOpacity: number;
  modelKeyLight: number;
  modelFillLight: number;
  modelRimLight: number;
}

export const THEMES: Record<EnvironmentType, ThemeTokens> = {
  Moon: {
    name: 'Moon',
    pageBackground: '#080f1c',
    readabilityVeil: 'linear-gradient(180deg, rgba(8,15,28,0.2) 0%, rgba(8,15,28,0.55) 47%, rgba(8,15,28,0.92) 100%)',
    backgroundImage: '/src/assets/figma/imgLunarResearchStation.png',
    
    // Charcoal translucent glass with fine silver sheen
    cardBg: 'rgba(21, 28, 39, 0.84)',
    cardGlassStyle: {
      backgroundImage: 'linear-gradient(90deg, rgba(169, 181, 195, 0.15) 0%, rgba(21, 28, 39, 0.12) 100%), linear-gradient(90deg, rgba(21, 28, 39, 0.84) 0%, rgba(21, 28, 39, 0.84) 100%)',
      boxShadow: '0px 10px 24px 0px rgba(8,15,28,0.46), inset 0px 1px 1px 0px rgba(182,240,255,0.1)',
    },
    cardBorder: 'border-[rgba(140,207,255,0.38)]',
    cardBorderHex: 'rgba(140, 207, 255, 0.38)',
    cardShadow: 'shadow-[0px_10px_24px_0px_rgba(8,15,28,0.46)]',
    cardSurface: 'bg-[rgba(21,28,39,0.84)] border border-[rgba(140,207,255,0.38)] shadow-[0px_10px_24px_0px_rgba(8,15,28,0.46)] backdrop-blur-md',
    bannerSurface: 'bg-[rgba(21,28,39,0.88)] border border-[rgba(140,207,255,0.38)] shadow-md backdrop-blur-md',
    
    textPrimary: '#e5edf5',
    textSecondary: '#a9b5c3',
    textMuted: '#7a889b',
    
    accent: '#8ccfff',
    accentPale: '#b6f0ff',
    accentGlow: 'rgba(140, 207, 255, 0.25)',
    warning: '#f2b65d',
    
    buttonPrimary: 'bg-[#152336] hover:bg-[#1a2d45] border border-[#8ccfff] text-[#e5edf5] shadow-[0_0_12px_rgba(140,207,255,0.25)]',
    buttonSecondary: 'bg-[rgba(21,28,39,0.6)] hover:bg-[rgba(21,28,39,0.9)] border border-[rgba(140,207,255,0.25)] text-[#a9b5c3] hover:text-[#e5edf5]',
    inputBg: 'bg-[#0f1724] border border-[rgba(140,207,255,0.35)] text-[#e5edf5]',
    tagBadge: 'bg-[#0e2034] text-[#8ccfff] border border-[#8ccfff]/40',
    
    navSelectedBg: 'linear-gradient(90deg, rgba(140, 207, 255, 0.3) 0%, rgba(57, 175, 255, 0.1) 100%), linear-gradient(90deg, rgba(21, 28, 39, 0.84) 0%, rgba(21, 28, 39, 0.84) 100%)',
    navSelectedBorder: '#8ccfff',
    navSelectedMarker: '#8ccfff',
    navItemActive: 'bg-[rgba(21,28,39,0.92)] border border-[#8ccfff] text-[#e5edf5] font-semibold shadow-[0_0_12px_rgba(140,207,255,0.2)]',
    navItemInactive: 'text-[#a9b5c3] hover:text-[#e5edf5] hover:bg-white/5 border border-transparent',
    
    // Silver-grey holographic 3D model for Lunar
    modelColor: 0xd0e2f2,
    modelEmissive: 0x18283a,
    modelEmissiveIntensity: 0.5,
    modelRoughness: 0.32,
    modelMetalness: 0.15,
    modelOpacity: 0.82,
    modelKeyLight: 0xf1f5f9,
    modelFillLight: 0x8ccfff,
    modelRimLight: 0xb6f0ff,
  },

  Spacecraft: {
    name: 'Spacecraft',
    pageBackground: '#020b20',
    readabilityVeil: 'linear-gradient(180deg, rgba(2,11,32,0.2) 0%, rgba(2,11,32,0.6) 50%, rgba(2,11,32,0.92) 100%)',
    backgroundImage: '/src/assets/figma/imgAstraMissionEnvironmentDesktop.png',
    
    cardBg: 'rgba(6, 27, 54, 0.92)',
    cardGlassStyle: {
      backgroundImage: 'linear-gradient(90deg, rgba(40, 87, 118, 0.25) 0%, rgba(6, 27, 54, 0.4) 100%), linear-gradient(90deg, rgba(6, 27, 54, 0.94) 0%, rgba(6, 27, 54, 0.94) 100%)',
      boxShadow: '0px 10px 24px 0px rgba(2,7,20,0.5), inset 0px 1px 1px 0px rgba(41,200,239,0.15)',
    },
    cardBorder: 'border-[rgba(40,87,118,0.85)]',
    cardBorderHex: 'rgba(40, 87, 118, 0.85)',
    cardShadow: 'shadow-lg',
    cardSurface: 'bg-[rgba(6,27,54,0.94)] border border-[rgba(40,87,118,0.85)] shadow-lg backdrop-blur-md',
    bannerSurface: 'bg-[rgba(6,27,54,0.92)] border border-[rgba(40,87,118,0.8)] shadow-md backdrop-blur-md',
    
    textPrimary: '#eaf4ff',
    textSecondary: '#b5c8df',
    textMuted: '#8ba7c2',
    
    accent: '#29c8ef',
    accentPale: '#c7f4ff',
    accentGlow: 'rgba(41, 200, 239, 0.3)',
    warning: '#ffd48a',
    
    buttonPrimary: 'bg-[#0b354b] hover:bg-[#124b6d] border border-[#29c8ef]/70 text-[#eaf4ff] shadow-[0_0_12px_rgba(41,200,239,0.3)]',
    buttonSecondary: 'bg-[rgba(6,27,54,0.6)] hover:bg-[rgba(6,27,54,0.9)] border border-[rgba(40,87,118,0.5)] text-[#b5c8df] hover:text-[#eaf4ff]',
    inputBg: 'bg-[#09223e] border border-[rgba(40,87,118,0.8)] text-[#eaf4ff]',
    tagBadge: 'bg-[#0b354b] text-[#29c8ef] border border-[#29c8ef]/40',
    
    navSelectedBg: 'rgba(11, 53, 75, 0.92)',
    navSelectedBorder: '#29c8ef',
    navSelectedMarker: '#29c8ef',
    navItemActive: 'bg-[rgba(11,53,75,0.92)] border border-[#29c8ef] text-[#eaf4ff] font-semibold shadow-[0_0_10px_rgba(41,200,239,0.25)]',
    navItemInactive: 'text-[#acbed5] hover:text-[#ecf5ff] hover:bg-white/5 border border-transparent',
    
    // Deep cyan holographic 3D model for Spacecraft
    modelColor: 0x29c8ef,
    modelEmissive: 0x0a4b73,
    modelEmissiveIntensity: 0.55,
    modelRoughness: 0.25,
    modelMetalness: 0.1,
    modelOpacity: 0.82,
    modelKeyLight: 0x29c8ef,
    modelFillLight: 0x04e5d4,
    modelRimLight: 0x5eead4,
  },

  Mars: {
    name: 'Mars',
    pageBackground: '#150c0e',
    readabilityVeil: 'linear-gradient(180deg, rgba(21,12,14,0.2) 0%, rgba(21,12,14,0.58) 50%, rgba(21,12,14,0.94) 100%)',
    backgroundImage: '/src/assets/figma/imgMarsSettlement.png',
    
    cardBg: 'rgba(28, 18, 22, 0.92)',
    cardGlassStyle: {
      backgroundImage: 'linear-gradient(90deg, rgba(196, 91, 54, 0.2) 0%, rgba(28, 18, 22, 0.4) 100%), linear-gradient(90deg, rgba(28, 18, 22, 0.94) 0%, rgba(28, 18, 22, 0.94) 100%)',
      boxShadow: '0px 10px 24px 0px rgba(20,5,8,0.55), inset 0px 1px 1px 0px rgba(255,157,113,0.15)',
    },
    cardBorder: 'border-[rgba(255,157,113,0.42)]',
    cardBorderHex: 'rgba(255, 157, 113, 0.42)',
    cardShadow: 'shadow-xl',
    cardSurface: 'bg-[rgba(28,18,22,0.92)] border border-[rgba(255,157,113,0.42)] shadow-xl backdrop-blur-md',
    bannerSurface: 'bg-[rgba(32,18,22,0.92)] border border-[rgba(255,157,113,0.42)] shadow-md backdrop-blur-md',
    
    textPrimary: '#fcedea',
    textSecondary: '#d8b5ad',
    textMuted: '#9e7b73',
    
    accent: '#ff9d71',
    accentPale: '#ffd4b2',
    accentGlow: 'rgba(255, 157, 113, 0.3)',
    warning: '#f2b65d',
    
    buttonPrimary: 'bg-[#3b1c1e] hover:bg-[#4d2427] border border-[#ff9d71]/70 text-[#fcedea] shadow-[0_0_12px_rgba(255,157,113,0.3)]',
    buttonSecondary: 'bg-[rgba(28,18,22,0.6)] hover:bg-[rgba(28,18,22,0.9)] border border-[rgba(255,157,113,0.3)] text-[#d8b5ad] hover:text-[#fcedea]',
    inputBg: 'bg-[#221316] border border-[rgba(255,157,113,0.4)] text-[#fcedea]',
    tagBadge: 'bg-[#381a1a] text-[#ff9d71] border border-[#ff9d71]/40',
    
    navSelectedBg: 'rgba(48, 22, 25, 0.92)',
    navSelectedBorder: '#ff9d71',
    navSelectedMarker: '#ff9d71',
    navItemActive: 'bg-[rgba(48,22,25,0.92)] border border-[#ff9d71] text-[#fcedea] font-semibold shadow-[0_0_12px_rgba(255,157,113,0.25)]',
    navItemInactive: 'text-[#d8b5ad] hover:text-[#fcedea] hover:bg-white/5 border border-transparent',
    
    // Amber-bronze holographic 3D model for Mars
    modelColor: 0xffa57d,
    modelEmissive: 0x4d1e12,
    modelEmissiveIntensity: 0.55,
    modelRoughness: 0.28,
    modelMetalness: 0.12,
    modelOpacity: 0.82,
    modelKeyLight: 0xffc4a3,
    modelFillLight: 0xff7b54,
    modelRimLight: 0xffd4b2,
  },
};

export function getTheme(env: EnvironmentType = 'Spacecraft'): ThemeTokens {
  return THEMES[env] || THEMES.Spacecraft;
}
