import { useState, useEffect } from 'react';
import { useMeasurements } from '../data/measurementStore';
import { AstraLogo } from './AstraLogo';

// Regular icons
import imgHomeIcon from '../assets/figma/imgHomeIcon.svg';
import imgBodyAssessmentIcon from '../assets/figma/imgBodyAssessmentIcon.svg';
import imgVitalSignsIcon from '../assets/figma/imgVitalSignsIcon.svg';
import imgMentalWellbeingIcon from '../assets/figma/imgMentalWellbeingIcon.svg';
import imgRiskAssessmentIcon from '../assets/figma/imgRiskAssessmentIcon.svg';
import imgMedicalGuidanceIcon from '../assets/figma/imgMedicalGuidanceIcon.svg';
import imgHealthAnalyticsIcon from '../assets/figma/imgHealthAnalyticsIcon.svg';
import imgReportsIcon from '../assets/figma/imgReportsIcon.svg';
import imgSettingsIcon from '../assets/figma/imgSettingsIcon.svg';
import imgSettingsIcon1 from '../assets/figma/imgSettingsIcon1.svg';

// Active icons
import imgHomeIconActive from '../assets/figma/imgHomeIconActive.svg';
import imgBodyAssessmentIconActive from '../assets/figma/imgBodyAssessmentIconActive.svg';
import imgVitalSignsIconActive from '../assets/figma/imgVitalSignsIconActive.svg';
import imgMentalWellbeingIconActive from '../assets/figma/imgMentalWellbeingIconActive.svg';
import imgRiskAssessmentIconActive from '../assets/figma/imgRiskAssessmentIconActive.svg';
import imgMedicalGuidanceIconActive from '../assets/figma/imgMedicalGuidanceIconActive.svg';
import imgHealthAnalyticsIconActive from '../assets/figma/imgHealthAnalyticsIconActive.svg';
import imgReportsIconActive from '../assets/figma/imgReportsIconActive.svg';
import imgSettingsIconActive from '../assets/figma/imgSettingsIconActive.svg';

import type { EnvironmentType } from './EnvironmentCards';
import { getTheme } from '../utils/themeTokens';
import { getEnvironmentData } from '../data/environmentData';
import { formatProfileMissionProgress } from '../data/measurementConfig';

interface MissionNavigationProps {
  activeScreen?: string;
  isCalibrated?: boolean;
  onNavigate?: (screen: string) => void;
  onLogout?: () => void;
  devMode?: boolean;
  currentEnv?: EnvironmentType;
}

export function MissionNavigation({
  activeScreen = 'Dashboard',
  onNavigate,
  onLogout,
  currentEnv = 'Spacecraft',
}: MissionNavigationProps) {
  const theme = getTheme(currentEnv);
  const envData = getEnvironmentData(currentEnv);
  const { activeProfile } = useMeasurements();
  const missionProgress = formatProfileMissionProgress(activeProfile, currentEnv, envData.missionEpoch);
  const isMoon = currentEnv === 'Moon';
  const isMars = currentEnv === 'Mars';

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };
    if (isMobileMenuOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isMobileMenuOpen]);

  // Standardized ASTRA 9 Navigation Items across all mission environments
  const navItems = [
    { name: 'Dashboard', screen: 'Dashboard', defaultIcon: imgHomeIcon, activeIcon: imgHomeIconActive },
    { name: 'Body Assessment', screen: 'Body Assessment', defaultIcon: imgBodyAssessmentIcon, activeIcon: imgBodyAssessmentIconActive },
    { name: 'Vital Signs', screen: 'Vital Signs', defaultIcon: imgVitalSignsIcon, activeIcon: imgVitalSignsIconActive },
    { name: 'Mental Well-being', screen: 'Mental Well-being', defaultIcon: imgMentalWellbeingIcon, activeIcon: imgMentalWellbeingIconActive },
    { name: 'Health Analytics', screen: 'Health Analytics', defaultIcon: imgHealthAnalyticsIcon, activeIcon: imgHealthAnalyticsIconActive },
    { name: 'Risk Assessment', screen: 'Risk Assessment', defaultIcon: imgRiskAssessmentIcon, activeIcon: imgRiskAssessmentIconActive },
    { name: 'Medical Guidance', screen: 'Medical Guidance', defaultIcon: imgMedicalGuidanceIcon, activeIcon: imgMedicalGuidanceIconActive },
    { name: 'Reports', screen: 'Reports', defaultIcon: imgReportsIcon, activeIcon: imgReportsIconActive },
    { name: 'Settings', screen: 'Settings', defaultIcon: imgSettingsIcon, activeIcon: imgSettingsIconActive },
  ];

  const handleItemClick = (screen: string) => {
    onNavigate?.(screen);
    setIsMobileMenuOpen(false);
  };

  const isScreenMatching = (screen: string) => {
    if (screen === 'Dashboard' || screen === 'Home') {
      return activeScreen === 'Dashboard' || activeScreen === 'Home';
    }
    return activeScreen === screen;
  };

  const activeItemLabel = navItems.find((item) => isScreenMatching(item.screen))?.name || activeScreen;

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. COMPACT MOBILE / TABLET PORTRAIT BAR (< lg screens, e.g. 390x844)       */}
      {/* ========================================================================= */}
      <div className={`w-full lg:hidden ${theme.cardSurface} rounded-[18px] px-3.5 py-2.5 flex items-center justify-between gap-3 shadow-md`}>
        {/* Brand & Active Screen Pill */}
        <div
          className="flex items-center gap-2 cursor-pointer min-w-0"
          onClick={() => handleItemClick('Dashboard')}
        >
          <AstraLogo variant="symbol" className="w-[30px] h-[30px] shrink-0" imgClassName="w-[30px] h-[30px]" />
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span
                className="font-['Inter'] font-semibold text-[17px] tracking-[4px] leading-none"
                style={{ color: theme.textPrimary }}
              >
                ASTRA
              </span>
              <span
                className="text-[9.5px] font-mono px-1.5 py-0.5 rounded uppercase font-semibold"
                style={{ backgroundColor: `${theme.accent}20`, color: theme.accent }}
              >
                {envData.environmentDisplayName.split(' ')[0]}
              </span>
            </div>
            <span className="text-[12px] truncate font-medium mt-0.5" style={{ color: theme.textSecondary }}>
              {activeItemLabel}
            </span>
          </div>
        </div>

        {/* Accessible Mobile Menu Button (min 44px touch target) */}
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-expanded={isMobileMenuOpen}
          aria-label="Toggle navigation destinations menu"
          className="h-[44px] px-3.5 rounded-xl border flex items-center gap-2 text-[13px] font-semibold transition-all cursor-pointer shrink-0"
          style={{
            backgroundColor: isMobileMenuOpen ? `${theme.accent}30` : theme.inputBg,
            borderColor: isMobileMenuOpen ? theme.accent : `${theme.accent}40`,
            color: theme.textPrimary,
          }}
        >
          <span className="text-[15px]">{isMobileMenuOpen ? '✕' : '☰'}</span>
          <span>{isMobileMenuOpen ? 'Close' : 'Menu'}</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 2. COLLAPSIBLE MOBILE MENU DRAWER OVERLAY (< lg screens)                   */}
      {/* ========================================================================= */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-3 sm:p-5 lg:hidden animate-fadeIn"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className={`w-full max-w-[420px] max-h-[92vh] overflow-y-auto ${theme.cardSurface} rounded-[22px] p-4 sm:p-5 flex flex-col justify-between gap-4 border shadow-2xl mt-2`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: theme.cardBorderHex }}>
              <div className="flex items-center gap-2.5">
                <AstraLogo variant="symbol" className="w-[32px] h-[32px] shrink-0" imgClassName="w-[32px] h-[32px]" />
                <div>
                  <span className="font-['Inter'] font-semibold text-[19px] tracking-[5px] leading-none" style={{ color: theme.textPrimary }}>
                    ASTRA
                  </span>
                  <p className="text-[11px]" style={{ color: theme.textSecondary }}>
                    {envData.locationLabel}
                  </p>
                </div>
              </div>

              {/* Close Button (44px touch target) */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close menu"
                className="w-10 h-10 rounded-xl border flex items-center justify-center text-[15px] font-semibold cursor-pointer transition-colors"
                style={{
                  backgroundColor: theme.inputBg,
                  borderColor: `${theme.accent}40`,
                  color: theme.textPrimary,
                }}
              >
                ✕
              </button>
            </div>

            {/* Mobile Navigation List (44px touch targets) */}
            <nav className="flex flex-col gap-1 w-full text-[13.5px]">
              {navItems.map((item) => {
                const isItemActive = isScreenMatching(item.screen);
                const iconSrc = isItemActive ? item.activeIcon : item.defaultIcon;

                return (
                  <button
                    type="button"
                    key={item.name}
                    onClick={() => handleItemClick(item.screen)}
                    className={`w-full flex items-center gap-3 h-[44px] px-3.5 rounded-[12px] text-[13px] font-medium transition-all text-left cursor-pointer ${
                      isItemActive ? theme.navItemActive : theme.navItemInactive
                    }`}
                  >
                    <img
                      src={iconSrc}
                      alt=""
                      className={`w-[18px] h-[18px] shrink-0 ${isItemActive ? 'opacity-100' : 'opacity-70'}`}
                    />
                    <span className="truncate">{item.name}</span>
                  </button>
                );
              })}
            </nav>

            {/* Mobile Drawer Telemetry Footer */}
            <div className="pt-3 border-t flex flex-col gap-2" style={{ borderColor: theme.cardBorderHex }}>
              <div className="flex items-center justify-between text-[11.5px]" style={{ color: theme.textSecondary }}>
                <span>Mission: {envData.environmentDisplayName}</span>
                <span className="font-mono text-[#ffd48a]">{formatProfileMissionProgress(activeProfile, currentEnv, envData.missionEpoch)}</span>
              </div>
              <button
                type="button"
                onClick={() => handleItemClick('Settings')}
                className={`w-full h-[40px] px-3.5 rounded-xl border flex items-center justify-center gap-2 text-[12.5px] font-medium cursor-pointer ${theme.buttonSecondary}`}
              >
                <img src={imgSettingsIcon1} alt="" className="w-4 h-4 opacity-75" />
                <span>Mission Settings</span>
              </button>
              {onLogout && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full h-[38px] px-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-200 flex items-center justify-center gap-2 text-[12px] font-medium cursor-pointer transition"
                >
                  <svg className="w-4 h-4 text-rose-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Log Out (Crew Sign Off)</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. DESKTOP PERMANENT SIDEBAR (>= lg screens, 208px fixed width)           */}
      {/* ========================================================================= */}
      <aside className={`hidden lg:flex w-[208px] shrink-0 ${theme.cardSurface} rounded-[22px] flex-col justify-between p-3.5 pt-6 pb-4`}>
        <div className="flex flex-col gap-3.5">
          {/* ASTRA Brand Lockup */}
          <div className="flex flex-col items-center gap-0.5 pb-1 cursor-pointer" onClick={() => onNavigate?.('Dashboard')}>
            <div className="flex items-center gap-2">
              <AstraLogo variant="symbol" className="w-[36px] h-[36px] shrink-0" imgClassName="w-[36px] h-[36px]" />
              <span
                className="font-['Inter'] font-semibold text-[23px] tracking-[6px] leading-none pl-1"
                style={{ color: theme.textPrimary }}
              >
                ASTRA
              </span>
            </div>
            <span
              className="text-[11px] font-['Manrope'] font-normal tracking-wide mt-1"
              style={{ color: theme.textSecondary }}
            >
              Space Health Intelligence
            </span>
          </div>

          {/* Primary Navigation Menu */}
          <nav className="flex flex-col gap-1 w-full text-[13px] font-['Manrope']">
            {navItems.map((item) => {
              const isItemActive = isScreenMatching(item.screen);
              const iconSrc = isItemActive ? item.activeIcon : item.defaultIcon;

              return (
                <button
                  type="button"
                  key={item.name}
                  onClick={() => onNavigate?.(item.screen)}
                  className={`w-full flex items-center gap-2.5 h-[38px] px-3 rounded-[12px] text-[12.5px] transition-all text-left cursor-pointer ${
                    isItemActive ? theme.navItemActive : theme.navItemInactive
                  }`}
                >
                  <img
                    src={iconSrc}
                    alt=""
                    className={`w-[17px] h-[17px] shrink-0 transition-opacity ${
                      isItemActive ? 'opacity-100' : 'opacity-70'
                    }`}
                  />
                  <span className="truncate">{item.name}</span>
                </button>
              );
            })}
          </nav>

          {/* Environment-Themed Operational Notice */}
          <div className="pt-2 px-1">
            <p
              className="text-[11px] font-['Manrope'] font-bold uppercase tracking-wider"
              style={{ color: isMoon ? '#f2b65d' : isMars ? '#ff9d71' : '#29c8ef' }}
            >
              ILLUSTRATIVE DEMO
            </p>
            <p
              className="text-[11.5px] font-['Manrope'] leading-snug"
              style={{ color: theme.textSecondary }}
            >
              Prototype interface - no live sensor connection
            </p>
          </div>
        </div>

        {/* Lower Mission Telemetry Widget */}
        <div
          className="flex flex-col gap-2 pt-3 border-t mt-2 font-['Manrope']"
          style={{ borderColor: theme.cardBorderHex }}
        >
          <div className="flex flex-col gap-0.5 text-[12px]">
            <span style={{ color: theme.textSecondary }} className="text-[11px]">Mission</span>
            <span className="text-[13.5px] font-semibold" style={{ color: theme.textPrimary }}>
              ASTRA · {envData.environmentDisplayName}
            </span>
            <span className="text-[12px]" style={{ color: theme.textSecondary }}>{missionProgress}</span>
            
            <div className="w-full h-[5px] bg-white/10 rounded-full overflow-hidden mt-1">
              <div
                className="h-full rounded-full"
                style={{
                  width: isMoon ? '46%' : isMars ? '18%' : '23%',
                  backgroundColor: theme.accent,
                }}
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-white/[0.06]">
            <button
              type="button"
              onClick={() => onNavigate?.('Settings')}
              className="flex items-center gap-2 cursor-pointer transition-colors text-[12px] text-left hover:text-white"
              style={{ color: theme.textSecondary }}
            >
              <img src={imgSettingsIcon1} alt="" className="w-4 h-4 opacity-75" />
              <span>Settings</span>
            </button>

            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                title="Log out from terminal"
                className="flex items-center gap-1 cursor-pointer text-[11px] text-[#8fa7c9] hover:text-rose-300 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Logout</span>
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
