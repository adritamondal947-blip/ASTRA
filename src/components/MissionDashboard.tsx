import { HomepageAnatomyViewer } from './HomepageAnatomyViewer';
import imgLunarResearchStation from '../assets/figma/imgLunarResearchStation.png';
import imgMarsSettlement from '../assets/figma/imgMarsSettlement.png';
import imgLunarHotspotIceBluePulse from '../assets/figma/imgLunarHotspotIceBluePulse.svg';
import imgLunarHotspotIceBluePulse1 from '../assets/figma/imgLunarHotspotIceBluePulse1.svg';
import type { EnvironmentType } from './EnvironmentCards';
import { getEnvironmentData } from '../data/environmentData';
import { formatProfileMissionProgress } from '../data/measurementConfig';
import { useMeasurements } from '../data/measurementStore';
import { formatMeasurementDate } from '../data/measurementConfig';

interface MissionDashboardProps {
  currentEnv: EnvironmentType;
  onNavigateToScreen: (screenId: string) => void;
}

export function MissionDashboard({ currentEnv, onNavigateToScreen }: MissionDashboardProps) {
  const envData = getEnvironmentData(currentEnv);
  const { records, symptomRecords, activeProfile } = useMeasurements();
  const profileId = activeProfile?.id ?? ''; 
  const latestHeartRate = records.find((record) => record.profileId === profileId && record.environment === currentEnv && record.metric === 'heartRate');
  const currentHeartRate = latestHeartRate?.value ?? envData.vitals.heartRate.current;
  const reportedSymptoms = symptomRecords.filter((record) => record.profileId === profileId && record.environment === currentEnv);
  const isMoon = currentEnv === 'Moon';
  const isMars = currentEnv === 'Mars';

  // Environment-specific accent colors and styling tokens
  const accentColor = isMoon ? '#8ccfff' : isMars ? '#ff9d71' : '#29c8ef';
  const borderEdge = isMoon
    ? 'border-[rgba(140,207,255,0.38)]'
    : isMars
    ? 'border-[rgba(255,157,113,0.42)]'
    : 'border-[rgba(40,87,118,0.85)]';
  const cardBg = isMoon
    ? 'bg-[rgba(21,28,39,0.84)] shadow-[0px_10px_24px_0px_rgba(8,15,28,0.46)]'
    : isMars
    ? 'bg-[rgba(28,18,22,0.92)] shadow-xl'
    : 'bg-[rgba(6,27,54,0.94)] shadow-lg';

  const checkPct = Math.round((envData.todayHealthChecksComplete / envData.todayHealthChecksTotal) * 100);

  return (
    <div className="flex flex-col gap-4 w-full animate-fadeIn" data-name={isMoon ? 'ASTRA · Lunar Surface · Mission Dashboard' : 'ASTRA · Mission Dashboard'}>
      
      {/* ========================================================================= */}
      {/* 1. SURFACE MISSION PANORAMA HERO (Exact Figma Frame 54:345 for Lunar)    */}
      {/* ========================================================================= */}
      {isMoon ? (
        <div className="relative w-full h-[236px] rounded-[20px] overflow-hidden border border-[rgba(140,207,255,0.38)] shadow-[0px_10px_24px_0px_rgba(8,15,28,0.46)] flex flex-col justify-between p-6">
          <img
            src={imgLunarResearchStation}
            alt="Lunar Research Station"
            className="absolute inset-0 w-full h-full object-cover object-[center_35%] pointer-events-none"
          />
          {/* Directional Glassmorphic Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-[rgba(8,15,28,0.92)] via-[rgba(8,15,28,0.48)] to-transparent pointer-events-none" />

          {/* Top telemetry tag */}
          <div className="relative z-10 flex items-center justify-between">
            <span className="font-['Manrope'] text-[11px] font-semibold text-[#b6f0ff] tracking-[1.7px] uppercase">
              LUNAR RESEARCH / HEALTH OPERATIONS
            </span>
            <span className="font-['Manrope'] text-[11px] font-mono px-2.5 py-0.5 rounded bg-[#0e2034]/80 text-[#8ccfff] border border-[#8ccfff]/40">
              {envData.environmental.gravityLabel}
            </span>
          </div>

          {/* Center Titles */}
          <div className="relative z-10 flex flex-col gap-1 max-w-[680px]">
            <h1 className="font-['Manrope'] font-semibold text-[30px] sm:text-[34px] text-[#e5edf5] leading-tight drop-shadow-[0px_2px_8px_rgba(8,15,28,0.85)]">
              Mission Dashboard
            </h1>
            <p className="font-['Manrope'] text-[14px] sm:text-[15px] text-[#e5edf5]/90">
              Your health, in context. Focus on what needs your attention.
            </p>
          </div>

          {/* Bottom Caption */}
          <div className="relative z-10 text-[10.5px] font-['Manrope'] text-[#e5edf5]/70">
            Illustrative lunar research habitat · concept visualization
          </div>
        </div>
      ) : isMars ? (
        <div className="relative w-full h-[200px] rounded-[20px] overflow-hidden border border-[rgba(255,180,95,0.42)] shadow-xl flex flex-col justify-between p-6">
          <img
            src={imgMarsSettlement}
            alt="Mars Settlement"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[rgba(28,15,18,0.92)] via-[rgba(28,15,18,0.52)] to-transparent pointer-events-none" />
          <div className="relative z-10 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#ffd4b2] tracking-[1.7px] uppercase">
              MARS SURFACE / HABITAT HEALTH OPERATIONS
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#381a1a]/80 text-[#ff9d71] border border-[#ff9d71]/40">
              {envData.environmental.gravityLabel}
            </span>
          </div>
          <div className="relative z-10 flex flex-col gap-1 max-w-[680px]">
            <h1 className="font-semibold text-[30px] text-[#e5edf5]">
              Mission Dashboard
            </h1>
            <p className="text-[14px] text-[#e5edf5]/90">
              Long-delay communications & habitat health telemetry.
            </p>
          </div>
          <div className="relative z-10 text-[10.5px] text-[#e5edf5]/70">
            Illustrative Mars settlement · Jezero Crater station
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#0b354b] text-[#29c8ef] border border-[#29c8ef]/40">
              {envData.environmental.gravityLabel}
            </span>
            <span className="text-[11px] font-mono text-[#8ba7c2]">
              {formatProfileMissionProgress(activeProfile, currentEnv, envData.missionEpoch)}
            </span>
          </div>
          <h1 className="text-[26px] sm:text-[28px] font-semibold text-[#eaf4ff] tracking-tight">
            Spacecraft / In Transit · Mission Dashboard
          </h1>
          <p className="text-[14px] text-[#b5c8df]">
            Your health, in context. Focus on what needs your attention.
          </p>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. MISSION PHASE PRIORITY BANNER (Exact Figma Node 39:2434 for Lunar)     */}
      {/* ========================================================================= */}
      <div className={`w-full rounded-[18px] px-5 py-3.5 flex flex-col gap-0.5 border ${borderEdge} ${cardBg}`}>
        <span
          className="text-[11px] font-['Manrope'] font-semibold tracking-wider uppercase"
          style={{ color: accentColor }}
        >
          PHASE PRIORITY · {envData.phasePriorityTitle}
        </span>
        <p className="text-[15px] text-[#e5edf5] font-['Manrope'] font-normal">
          {envData.phasePriorityText}
        </p>
      </div>

      {!activeProfile?.isDemo && records.every((record) => record.profileId !== profileId) && reportedSymptoms.length === 0 && <div className={`rounded-xl border px-4 py-3 text-xs` + ' ' + borderEdge + ' ' + cardBg} style={{ color: accentColor }}>SIMULATED DASHBOARD SCENARIO - No profile-specific vital measurements or symptom reports are saved yet. No live sensor connection is active.</div>}

      {/* ========================================================================= */}
      {/* 3. MAIN OPERATIONAL WORKSPACE GRID (12 Cols)                             */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 w-full">
        
        {/* Left Column (Overall Health + Quick Jumps) -> 3 cols */}
        <div className="lg:col-span-3 flex flex-col gap-3">
          {/* Overall Health Status Card */}
          <div className={`rounded-[18px] p-4 flex flex-col gap-1 border ${borderEdge} ${cardBg}`}>
            <span className="text-[11px] font-['Manrope'] font-semibold text-[#a9b5c3] tracking-wider uppercase">
              OVERALL HEALTH
            </span>
            <span className="text-[21px] font-['Manrope'] font-semibold text-[#f2b65d] leading-tight">
              {envData.overallHealthHeadline}
            </span>
            <div className="text-[12px] text-[#e5edf5] leading-snug pt-1">
              <p>No emergency signal in this demo.</p>
              <p className="text-[#a9b5c3]">{envData.overallHealthSubtext}</p>
            </div>
          </div>

          {/* Quick Jump Status Buttons */}
          <button
            type="button"
            onClick={() => onNavigateToScreen('Vital Signs')}
            className={`rounded-[18px] p-3 text-left transition-all cursor-pointer border ${borderEdge} ${cardBg} hover:border-[#8ccfff]`}
          >
            <p className="text-[13px] font-['Manrope'] font-semibold text-[#e5edf5]">Heart & Circulation</p>
            <p className="text-[12px] font-['Manrope'] text-[#a9b5c3]">
              {currentHeartRate} bpm · baseline {envData.vitals.heartRate.baseline}
            </p>
          </button>

          <button
            type="button"
            onClick={() => onNavigateToScreen('Body Assessment')}
            className={`rounded-[18px] p-3 text-left transition-all cursor-pointer border ${borderEdge} ${cardBg} hover:border-[#8ccfff]`}
          >
            <p className="text-[13px] font-['Manrope'] font-semibold text-[#e5edf5]">Muscle & Bone</p>
            <p className="text-[12px] font-['Manrope'] text-[#f2b65d]">
              {envData.body.primaryFocusRegionName} focus
            </p>
          </button>

          <button
            type="button"
            onClick={() => onNavigateToScreen('Mental Well-being')}
            className={`rounded-[18px] p-3 text-left transition-all cursor-pointer border ${borderEdge} ${cardBg} hover:border-[#8ccfff]`}
          >
            <p className="text-[13px] font-['Manrope'] font-semibold text-[#e5edf5]">Sleep & Recovery</p>
            <p className="text-[12px] font-['Manrope'] text-[#f2b65d]">
              {envData.sleepMental.sleepDurationHours} h {envData.sleepMental.sleepDurationMinutes} min · goal {envData.sleepMental.sleepGoalHours} h
            </p>
          </button>

          <button
            type="button"
            onClick={() => onNavigateToScreen('Mental Well-being')}
            className={`rounded-[18px] p-3 text-left transition-all cursor-pointer border ${borderEdge} ${cardBg} hover:border-[#8ccfff]`}
          >
            <p className="text-[13px] font-['Manrope'] font-semibold text-[#e5edf5]">Mental Well-being</p>
            <p className="text-[12px] font-['Manrope'] text-[#a9b5c3]">
              Crew check-in planned ({envData.sleepMental.currentMood})
            </p>
          </button>

          <button
            type="button"
            onClick={() => onNavigateToScreen('Risk Assessment')}
            className={`rounded-[18px] p-3 text-left transition-all cursor-pointer border ${borderEdge} ${cardBg} hover:border-[#8ccfff]`}
          >
            <p className="text-[13px] font-['Manrope'] font-semibold text-[#e5edf5]">Environmental Exposure</p>
            <p className="text-[12px] font-['Manrope'] text-[#a9b5c3]">
              {envData.environmental.dustParticulateLevel.split('·')[0].trim()} · {envData.environmental.radiationDailyMsv} mSv/d
            </p>
          </button>
        </div>

        {/* Center Column (3D Medical Body Card with Knee Hotspots) -> 5 cols */}
        <div className={`lg:col-span-5 rounded-[18px] p-5 flex flex-col justify-between relative shadow-[0px_10px_24px_0px_rgba(8,15,28,0.46)] overflow-hidden min-h-[460px] border ${borderEdge} ${cardBg}`}>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-['Manrope'] font-semibold tracking-wider uppercase" style={{ color: accentColor }}>
                BODY OVERVIEW · {envData.body.primaryFocusRegionName.toUpperCase()}
              </span>
              <p className="text-[12px] font-['Manrope'] text-[#a9b5c3]">
                {isMoon ? 'Illustration - not a body scan' : 'Full-body 3D anatomical model · realistic natural proportions'}
              </p>
            </div>
            {!isMoon && (
              <span
                className="text-[11px] font-mono px-2 py-0.5 rounded border"
                style={{
                  backgroundColor: '#0b354b',
                  color: accentColor,
                  borderColor: `${accentColor}60`
                }}
              >
                3D DIGITAL TWIN
              </span>
            )}
          </div>

          {/* Interactive Full-Body 3D Viewer */}
          <div className="relative w-full h-[330px] my-1 flex items-center justify-center">
            <HomepageAnatomyViewer
              onOpenBodyAssessment={() => onNavigateToScreen('Body Assessment')}
              currentEnv={currentEnv}
            />

            {/* Hotspots & Popout Badge */}
            {isMoon ? (
              <>
                {/* Dual Ice-Blue Knee Hotspots from Figma (Nodes 54:689 and 54:698) */}
                <div
                  className="absolute pointer-events-none z-20 flex items-center gap-5"
                  style={{ top: '64%', left: '50%', transform: 'translate(-50%, -50%)' }}
                >
                  <img
                    src={imgLunarHotspotIceBluePulse}
                    alt=""
                    className="w-7 h-7 animate-pulse drop-shadow-[0_0_8px_#8ccfff]"
                  />
                  <img
                    src={imgLunarHotspotIceBluePulse1}
                    alt=""
                    className="w-7 h-7 animate-pulse drop-shadow-[0_0_8px_#8ccfff]"
                  />
                </div>

                {/* Popout Badge for Knees & Ankles (Figma Node 39:6124) */}
                <button
                  type="button"
                  onClick={() => onNavigateToScreen('Body Assessment')}
                  className="absolute right-4 bottom-8 z-20 bg-[rgba(21,28,39,0.92)] hover:bg-[#1a2538] border border-[#8ccfff] rounded-[16px] px-3.5 py-2 text-left cursor-pointer transition-all shadow-[0px_10px_12px_rgba(8,15,28,0.46)]"
                >
                  <p className="text-[13px] font-semibold text-[#b6f0ff] font-['Manrope'] leading-tight">
                    {envData.body.defaultHotspotLabel}
                  </p>
                  <p className="text-[11px] text-[#b6f0ff]/80 font-['Manrope']">
                    {envData.body.defaultHotspotSubtext}
                  </p>
                </button>
              </>
            ) : isMars ? (
              <button
                type="button"
                onClick={() => onNavigateToScreen('Body Assessment')}
                className="absolute right-2 bottom-3 z-20 bg-[rgba(38,18,22,0.95)] hover:bg-[#4a2228] border border-[rgba(255,157,113,0.5)] rounded-[12px] p-2.5 text-left cursor-pointer transition-all shadow-lg animate-pulse"
              >
                <p className="text-[12.5px] font-semibold text-[#ffd48a]">{envData.body.defaultHotspotLabel}</p>
                <p className="text-[11px] text-[#fcedea]">{envData.body.defaultHotspotSubtext}</p>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onNavigateToScreen('Body Assessment')}
                className="absolute right-2 bottom-3 z-20 bg-[rgba(11,43,67,0.95)] hover:bg-[#14476e] border border-[rgba(40,87,118,0.85)] rounded-[10px] p-2 text-left cursor-pointer transition-all shadow-lg animate-pulse"
              >
                <p className="text-[12.5px] font-semibold text-[#ffd48a]">{envData.body.defaultHotspotLabel}</p>
                <p className="text-[11px] text-[#eaf4ff]">{envData.body.defaultHotspotSubtext}</p>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => onNavigateToScreen('Body Assessment')}
            className="text-[13.5px] font-['Manrope'] font-semibold hover:underline text-left cursor-pointer pt-2 flex items-center gap-1.5"
            style={{ color: accentColor }}
          >
            <span>Open body assessment</span>
            <span>›</span>
          </button>
        </div>

        {/* Right Column (Active Alerts + Exercise) -> 4 cols */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Active Alerts Card */}
          <div className={`rounded-[18px] p-4 flex flex-col justify-between min-h-[220px] border ${isMoon ? 'border-[#f2b65d]' : borderEdge} ${cardBg}`}>
            {reportedSymptoms.length > 0 ? <div className="flex flex-col gap-2">
              <h3 className="text-[18px] font-['Manrope'] font-semibold text-[#e5edf5]">Reported symptoms</h3>
              <span className="text-[12px] font-semibold text-[#f2b65d] tracking-wider uppercase">{reportedSymptoms.length} saved self-report{reportedSymptoms.length === 1 ? '' : 's'} ? {envData.environmentDisplayName}</span>
              {reportedSymptoms.slice(0, 3).map((record) => <div key={record.id} className="border-l-2 pl-2" style={{ borderColor: accentColor }}><p className="text-[14px] font-medium text-[#e5edf5]">{record.regionName} ? {record.symptomType}</p><p className="text-[12px] text-[#a9b5c3]">{record.severity} ? {record.intensity}/10</p></div>)}
              <button type="button" onClick={() => onNavigateToScreen('Medical Guidance')} className="text-[14px] font-['Manrope'] font-semibold hover:underline text-left cursor-pointer pt-1" style={{ color: accentColor }}>View symptom guidance</button>
              <button type="button" onClick={() => onNavigateToScreen('Reports')} className="text-[12px] font-['Manrope'] hover:underline text-left cursor-pointer" style={{ color: accentColor }}>Open all records</button>
            </div> : <>
              <div className="flex flex-col gap-1.5">
                <h3 className="text-[18px] font-['Manrope'] font-semibold text-[#e5edf5]">Active alerts</h3>
                <span className="text-[12px] font-['Manrope'] font-semibold text-[#f2b65d] tracking-wider uppercase">{envData.activeAlert.severity} ? {envData.activeAlert.timestamp}</span>
                <p className="text-[16px] font-['Manrope'] font-medium text-[#e5edf5] leading-snug">{envData.activeAlert.headline}</p>
                <p className="text-[13.5px] font-['Manrope'] text-[#a9b5c3] leading-snug">{envData.activeAlert.description}</p>
              </div>
              <button type="button" onClick={() => onNavigateToScreen(envData.activeAlert.actionScreen)} className="text-[14px] font-['Manrope'] font-semibold hover:underline text-left cursor-pointer pt-2" style={{ color: accentColor }}>{envData.activeAlert.recommendedAction} ?</button>
            </>}
          </div>

          {/* Exercise & Recovery Card */}
          <div className={`rounded-[18px] p-4 flex flex-col justify-between min-h-[180px] border ${borderEdge} ${cardBg}`}>
            <div className="flex flex-col gap-1.5">
              <h3 className="text-[18px] font-['Manrope'] font-semibold text-[#e5edf5]">Exercise & recovery</h3>
              <p className="text-[14.5px] font-['Manrope'] font-medium text-[#e5edf5]">
                {envData.exercise.prescription}
              </p>
              <p className="text-[12px] font-['Manrope'] text-[#a9b5c3]">
                {envData.exercise.notes}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateToScreen('Medical Guidance')}
              className="text-[14px] font-['Manrope'] font-semibold hover:underline text-left cursor-pointer pt-2"
              style={{ color: accentColor }}
            >
              View today’s routine ›
            </button>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 4. BOTTOM PROGRESS & BASELINE ROW (3 Cards)                              */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full pt-1">
        
        {/* Card 1: Today's Health Checks */}
        <div className={`rounded-[18px] p-4 flex flex-col justify-between min-h-[220px] border ${borderEdge} ${cardBg}`}>
          <div className="flex flex-col gap-2">
            <h3 className="text-[17px] font-['Manrope'] font-semibold text-[#e5edf5]">Today’s health checks</h3>
            <span className="text-[14.5px] font-['Manrope'] font-medium" style={{ color: accentColor }}>
              {envData.todayHealthChecksComplete} of {envData.todayHealthChecksTotal} checks complete · {checkPct}%
            </span>

            <div className="w-full h-[6px] bg-[rgba(169,181,195,0.16)] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${checkPct}%`, backgroundColor: accentColor }}
              />
            </div>

            <div className="text-[12.5px] font-['Manrope'] text-[#a9b5c3] flex flex-col gap-0.5 pt-1">
              <p style={{ color: accentColor }}>✓ Morning vitals</p>
              <p style={{ color: accentColor }}>✓ Sleep log &nbsp;&nbsp; ✓ Hydration check</p>
              <p className="text-[#f2b65d]">○ Body check &nbsp;&nbsp; {checkPct > 60 ? '✓ Well-being' : '○ Well-being'}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigateToScreen('Body Assessment')}
            className="text-[14px] font-['Manrope'] font-semibold hover:underline text-left cursor-pointer pt-2"
            style={{ color: accentColor }}
          >
            Continue health check ›
          </button>
        </div>

        {/* Card 2: Next Scheduled Health Check */}
        <div className={`rounded-[18px] p-4 flex flex-col justify-between min-h-[220px] border ${borderEdge} ${cardBg}`}>
          <div className="flex flex-col gap-1">
            <h3 className="text-[17px] font-['Manrope'] font-semibold text-[#e5edf5]">Next health check</h3>
            <span
              className="text-[38px] font-['Manrope'] font-semibold tracking-tight leading-none my-1"
              style={{ color: accentColor }}
            >
              {envData.nextHealthCheckMinutes} min
            </span>
            <span className="text-[11px] font-['Manrope'] text-[#a9b5c3]">
              Snapshot countdown · not a live timer
            </span>
            <p className="text-[13px] font-['Manrope'] text-[#e5edf5] pt-1">
              {envData.nextHealthCheckTitle}
            </p>
            <p className="text-[12px] font-['Manrope'] text-[#a9b5c3]">
              {envData.nextHealthCheckSubtext}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateToScreen('Vital Signs')}
            className="text-[14px] font-['Manrope'] font-semibold hover:underline text-left cursor-pointer pt-2"
            style={{ color: accentColor }}
          >
            Open daily schedule ›
          </button>
        </div>

        {/* Card 3: Personal Baseline Comparison */}
        <div className={`rounded-[18px] p-4 flex flex-col justify-between min-h-[220px] border ${borderEdge} ${cardBg}`}>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between pb-1 border-b border-[rgba(140,207,255,0.2)]">
              <h3 className="text-[17px] font-['Manrope'] font-semibold text-[#e5edf5]">
                {isMoon ? 'Compared with your baseline' : 'Personal baseline'}
              </h3>
              <span className="text-[10px] font-['Manrope'] text-[#a9b5c3] uppercase tracking-wider">
                Now &nbsp;&nbsp;|&nbsp;&nbsp; Usual
              </span>
            </div>

            <div className="flex items-center justify-between text-[12.5px] font-['Manrope']">
              <span className="text-[#a9b5c3]">Resting heart</span>
              <span className="font-semibold text-[#e5edf5]">
                {currentHeartRate} bpm &nbsp;<span className="text-[#8ba7c2] font-normal">/ {envData.vitals.heartRate.baseline}</span>
              </span>
            </div>

            <div className="flex items-center justify-between text-[12.5px] font-['Manrope']">
              <span className="text-[#a9b5c3]">Sleep</span>
              <span className="font-semibold text-[#f2b65d]">
                {envData.sleepMental.sleepDurationHours}h {envData.sleepMental.sleepDurationMinutes}m &nbsp;<span className="text-[#8ba7c2] font-normal">/ {envData.sleepMental.sleepGoalHours}h 00m</span>
              </span>
            </div>

            <div className="flex items-center justify-between text-[12.5px] font-['Manrope']">
              <span className="text-[#a9b5c3]">Energy · self-report</span>
              <span className="font-semibold text-[#e5edf5]">
                {envData.sleepMental.energyLevelSelfReport} / 5 &nbsp;<span className="text-[#8ba7c2] font-normal">/ {envData.sleepMental.energyBaseline} / 5</span>
              </span>
            </div>

            <div className="pt-1 text-[11px] font-['Manrope'] text-[#a9b5c3] leading-snug">
              <p>{latestHeartRate ? `Manual heart-rate entry · ${formatMeasurementDate(latestHeartRate.measuredAt)}` : 'SIMULATED sample values · no live sensor feed'}</p>
              <p>Trends depend on the past 14 days.</p>
            </div>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 5. CLINICAL PROVENANCE & DEMO DISCLAIMER (Figma Node 54:556)             */}
      {/* ========================================================================= */}
      <div className="pt-2 text-[11.5px] font-['Manrope'] text-[#a9b5c3] leading-relaxed">
        <p>{envData.dataProvenanceDisclaimer}</p>
        <p className="text-[#a9b5c3]/80">
          Illustrative data, not NASA operational measurements. Not a validated diagnostic or treatment system.
        </p>
      </div>
    </div>
  );
}
