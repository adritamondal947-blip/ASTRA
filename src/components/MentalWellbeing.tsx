import { useState, useEffect } from 'react';
import imgContinueArrow from '../assets/figma/imgContinueArrow.svg';
import type { EnvironmentType } from './EnvironmentCards';
import { getTheme } from '../utils/themeTokens';
import { getEnvironmentData } from '../data/environmentData';
import { formatProfileMissionProgress } from '../data/measurementConfig';
import { useMeasurements } from '../data/measurementStore';

interface MentalWellbeingProps {
  currentEnv?: EnvironmentType;
  isCalibrated?: boolean;
}

export function MentalWellbeing({ currentEnv = 'Spacecraft' }: MentalWellbeingProps) {
  const theme = getTheme(currentEnv);
  const envData = getEnvironmentData(currentEnv);
  const { activeProfile } = useMeasurements();
  const profileId = activeProfile?.id ?? 'local-profile';
  const astronautName = activeProfile?.fullName ?? 'Astronaut';

  const [selectedMood, setSelectedMood] = useState<string | null>(envData.sleepMental.currentMood);
  const [wellbeingMessage, setWellbeingMessage] = useState<string | null>(null);

  // Modal states for user-requested actions
  const [showQuietTimeModal, setShowQuietTimeModal] = useState(false);
  const [quietDuration, setQuietDuration] = useState('15 min');
  const [quietProtocol, setQuietProtocol] = useState('tactical');
  const [quietNotice, setQuietNotice] = useState<string | null>(null);

  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportType, setSupportType] = useState<'ai' | 'peer' | 'surgeon'>('ai');
  const [explicitShareConsent, setExplicitShareConsent] = useState(false);
  const [supportNotice, setSupportNotice] = useState<string | null>(null);

  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowQuietTimeModal(false);
        setShowSupportModal(false);
        setShowHistoryModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSaveWellbeing = () => {
    if (!selectedMood) return;
    setWellbeingMessage(`Well-being check-in saved: "${selectedMood}" with ${envData.sleepMental.sleepDurationHours}h ${envData.sleepMental.sleepDurationMinutes}m sleep logged.`);
    setTimeout(() => setWellbeingMessage(null), 5000);
  };

  const handleAddQuietTime = () => {
    const protocolLabel =
      quietProtocol === 'tactical'
        ? 'Tactical Box Breathing'
        : quietProtocol === 'light'
        ? 'Blue-Light Depletion'
        : 'Habitat Acoustic Masking';
    setQuietNotice(`Scheduled ${quietDuration} quiet time (${protocolLabel}) in daily routine.`);
    setShowQuietTimeModal(false);
    setTimeout(() => setQuietNotice(null), 6000);
  };

  const handleSubmitSupport = () => {
    const targetLabel =
      supportType === 'ai'
        ? 'Autonomous AI Medical Guidance'
        : supportType === 'peer'
        ? 'Crew Commander Peer Debrief'
        : 'Ground Flight Surgeon';
    const privacyNotice = explicitShareConsent
      ? 'Telehealth dossier shared with Ground Medical flight surgeon.'
      : 'Record kept in browser-local prototype storage for this profile.';
    setSupportNotice(`Support action initiated with ${targetLabel}. ${privacyNotice}`);
    setShowSupportModal(false);
    setTimeout(() => setSupportNotice(null), 7000);
  };

  return (
    <div className="flex flex-col gap-4 w-full animate-fadeIn">
      {/* Title & Subtitle */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className={`text-[12px] font-mono px-2 py-0.5 rounded ${theme.tagBadge}`}>
            PSYCHOLOGICAL TELEMETRY · {envData.environmentDisplayName.toUpperCase()}
          </span>
          <span className="text-[11px] font-mono text-[#8ba7c2]">
            {formatProfileMissionProgress(activeProfile, currentEnv, envData.missionEpoch)}
          </span>
        </div>
        <h1 className="text-[26px] sm:text-[28px] font-semibold tracking-tight" style={{ color: theme.textPrimary }}>
          Mental Well-being & Cognitive Acuity
        </h1>
        <p className="text-[14px]" style={{ color: theme.textSecondary }}>
          Circadian rhythm tracking, cognitive workload, and psychological resilience for {envData.locationLabel}.
        </p>
      </div>

      {/* Priority Banner */}
      <div className={`w-full ${theme.bannerSurface} rounded-[16px] px-4 py-3 flex flex-col gap-0.5`}>
        <span className="text-[11px] font-semibold tracking-wider uppercase" style={{ color: theme.accent }}>
          PHASE PRIORITY · {envData.phasePriorityTitle}
        </span>
        <p className="text-[15px]" style={{ color: theme.textPrimary }}>
          {envData.phasePriorityText}
        </p>
      </div>

      {/* Top Operational Row (Mood check + Recovery guidance) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
        
        {/* Card 1: Private Mood Check-in */}
        <div className={`${theme.cardSurface} rounded-[18px] p-5 flex flex-col justify-between min-h-[390px]`}>
          <div className="flex flex-col gap-1.5">
            <h2 className="text-[19px] sm:text-[20px] font-semibold" style={{ color: theme.textPrimary }}>
              How are you feeling?
            </h2>
            <span className="text-[12px] font-medium tracking-wide uppercase" style={{ color: theme.textSecondary }}>
              SELF-REPORT · {envData.environmentDisplayName.toUpperCase()} PRIVATE CHECK-IN
            </span>

            {/* 3 Mood Action Buttons */}
            <div className="grid grid-cols-3 gap-2.5 pt-2">
              {['Low energy', 'Okay', 'Feeling good'].map((mood) => {
                const isSelected = selectedMood === mood;
                return (
                  <button
                    type="button"
                    key={mood}
                    onClick={() => setSelectedMood(mood)}
                    className="h-[44px] px-2 rounded-[10px] text-[13px] font-semibold transition-all border flex items-center justify-center cursor-pointer"
                    style={{
                      backgroundColor: isSelected
                        ? `${theme.accent}25`
                        : theme.inputBg,
                      borderColor: isSelected ? theme.accent : `${theme.accent}30`,
                      color: isSelected ? theme.accent : theme.textPrimary,
                    }}
                  >
                    <span className="truncate">{mood}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[13.5px] font-medium" style={{ color: theme.accent }}>
                {selectedMood ? `Current selection: ${selectedMood}` : 'No mood selected'}
              </span>
              <span className="text-[11.5px] font-mono" style={{ color: theme.textMuted }}>
                Stress index: {envData.sleepMental.stressScorePct}%
              </span>
            </div>

            {/* Sleep & recovery block */}
            <div className="pt-2 border-t mt-1 flex flex-col gap-1" style={{ borderColor: theme.cardBorderHex }}>
              <div className="flex items-center justify-between">
                <span className="text-[13px]" style={{ color: theme.textSecondary }}>Sleep & recovery</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded" style={{ backgroundColor: `${theme.accent}20`, color: theme.accent }}>
                  {envData.sleepMental.sleepEfficiencyPct}% efficiency
                </span>
              </div>
              <p className="text-[20px] font-semibold" style={{ color: theme.textPrimary }}>
                {envData.sleepMental.sleepDurationHours} h {envData.sleepMental.sleepDurationMinutes} min · goal {envData.sleepMental.sleepGoalHours} h
              </p>
              <p className="text-[12px]" style={{ color: theme.textSecondary }}>
                {envData.sleepMental.sleepNote}
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={!selectedMood}
            onClick={handleSaveWellbeing}
            className={`w-full sm:w-[360px] h-[56px] rounded-[16px] px-5 flex items-center justify-center gap-3 transition-all cursor-pointer ${
              selectedMood ? theme.buttonPrimary : 'bg-white/5 border border-white/20 text-white/40 cursor-not-allowed'
            } font-semibold text-[15px] mt-3`}
          >
            <span>Save well-being check-in</span>
            <img src={imgContinueArrow} alt="" className="w-5 h-5 shrink-0" />
          </button>
        </div>

        {/* Card 2: Mental Recovery Guidance */}
        <div className={`${theme.cardSurface} rounded-[18px] p-5 flex flex-col justify-between min-h-[390px]`}>
          <div className="flex flex-col gap-1.5">
            <h2 className="text-[19px] sm:text-[20px] font-semibold" style={{ color: theme.textPrimary }}>
              Autonomous psychological resilience
            </h2>
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-medium tracking-wide uppercase" style={{ color: theme.textSecondary }}>
                COMM LATENCY: {envData.sleepMental.commDelayLabel}
              </span>
              <span className="text-[11px] font-mono text-[#ffd48a]">
                Workload: {envData.sleepMental.cognitiveWorkloadPct}%
              </span>
            </div>
            <p className="text-[17px] font-medium leading-snug pt-1" style={{ color: theme.textPrimary }}>
              {envData.sleepMental.isolationProtocol}
            </p>

            {/* 3 Step Protocol */}
            <div className="flex flex-col gap-2 pt-2 text-[14px]" style={{ color: theme.textPrimary }}>
              <p><strong className="font-mono mr-2" style={{ color: theme.accent }}>01</strong> Calibrate diurnal lighting to {envData.environmentDisplayName} mission phase.</p>
              <p><strong className="font-mono mr-2" style={{ color: theme.accent }}>02</strong> Practice 5-minute autonomous tactical breathing to lower cortisol.</p>
              <p><strong className="font-mono mr-2" style={{ color: theme.accent }}>03</strong> Sync with crew peer debrief before entering private quarters.</p>
            </div>
          </div>

          {quietNotice && (
            <div
              className="p-2.5 rounded-lg text-[12px] font-mono border mt-2 animate-fadeIn"
              style={{
                backgroundColor: `${theme.accent}15`,
                borderColor: `${theme.accent}40`,
                color: theme.accent,
              }}
            >
              ✓ {quietNotice}
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowQuietTimeModal(true)}
            className="text-[14px] font-semibold hover:underline text-left cursor-pointer pt-3 flex items-center gap-1.5"
            style={{ color: theme.accent }}
          >
            <span>Add quiet time to your routine</span>
            <span>›</span>
          </button>
        </div>

      </div>

      {/* Bottom Operational Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
        
        {/* When to Ask for Support */}
        <div className={`${theme.cardSurface} rounded-[18px] p-5 flex flex-col justify-between min-h-[240px]`}>
          <div className="flex flex-col gap-2">
            <h3 className="text-[18px] font-semibold" style={{ color: theme.textPrimary }}>When to escalate support</h3>
            <p className="text-[14px] leading-relaxed" style={{ color: theme.textSecondary }}>
              If circadian fatigue, sleep debt (&gt;4h) or high cognitive workload interfere with mission tasks, engage autonomous medical AI guidance and notify onboard commander.
            </p>
            <p className="text-[13px] leading-relaxed pt-1" style={{ color: theme.warning }}>
              Direct Earth flight surgeon audio link status: {envData.commLinkStatus} ({envData.commLinkDetails}).
            </p>
            {supportNotice && (
              <div
                className="p-2.5 rounded-lg text-[12px] font-mono border mt-1 animate-fadeIn"
                style={{
                  backgroundColor: `${theme.accent}15`,
                  borderColor: `${theme.accent}40`,
                  color: theme.accent,
                }}
              >
                ✓ {supportNotice}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => setShowSupportModal(true)}
            className="text-[14px] font-semibold hover:underline text-left cursor-pointer pt-2 flex items-center gap-1.5"
            style={{ color: theme.accent }}
          >
            <span>Open support actions</span>
            <span>›</span>
          </button>
        </div>

        {/* Private Record */}
        <div className={`${theme.cardSurface} rounded-[18px] p-5 flex flex-col justify-between min-h-[240px]`}>
          <div className="flex flex-col gap-2">
            <h3 className="text-[18px] font-semibold" style={{ color: theme.textPrimary }}>Your check-in record</h3>
            <span className="text-[14px] font-medium" style={{ color: theme.accent }}>
              {wellbeingMessage || `Active state: ${envData.sleepMental.currentMood} · ${envData.sleepMental.sleepDurationHours}h ${envData.sleepMental.sleepDurationMinutes}m sleep logged`}
            </span>
            <p className="text-[13.5px] leading-relaxed" style={{ color: theme.textSecondary }}>
              {envData.sleepMental.provenance}. Encrypted astronaut medical record stored on local habitat server.
            </p>
            <p className="text-[12px]" style={{ color: theme.textMuted }}>
              Energy level: {envData.sleepMental.energyLevelSelfReport}/5 (Baseline: {envData.sleepMental.energyBaseline}/5)
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowHistoryModal(true)}
            className="text-[14px] font-semibold hover:underline text-left cursor-pointer pt-2 flex items-center gap-1.5"
            style={{ color: theme.accent }}
          >
            <span>Review health history</span>
            <span>›</span>
          </button>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: ADD QUIET TIME TO YOUR ROUTINE                                   */}
      {/* ========================================================================= */}
      {showQuietTimeModal && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-5 animate-fadeIn"
          onClick={() => setShowQuietTimeModal(false)}
        >
          <div
            className={`w-full max-w-[500px] ${theme.cardSurface} rounded-[22px] p-5 sm:p-6 flex flex-col gap-4 border shadow-2xl relative`}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="quiet-time-title"
          >
            <div className="flex items-start justify-between border-b pb-3" style={{ borderColor: theme.cardBorderHex }}>
              <div>
                <span className={`text-[10.5px] font-mono px-2 py-0.5 rounded ${theme.tagBadge}`}>
                  RECOVERY PROTOCOL · {envData.environmentDisplayName.toUpperCase()}
                </span>
                <h2 id="quiet-time-title" className="text-[20px] font-semibold mt-1" style={{ color: theme.textPrimary }}>
                  Add quiet time to your routine
                </h2>
                <p className="text-[12.5px]" style={{ color: theme.textSecondary }}>
                  Schedule private restorative downtime to lower cortisol and maintain cognitive performance.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowQuietTimeModal(false)}
                className="w-8 h-8 rounded-lg border flex items-center justify-center text-[14px] cursor-pointer"
                style={{ backgroundColor: theme.inputBg, borderColor: `${theme.accent}40`, color: theme.textPrimary }}
              >
                ✕
              </button>
            </div>

            {/* Duration selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium" style={{ color: theme.textPrimary }}>Select duration:</label>
              <div className="grid grid-cols-4 gap-2">
                {['5 min', '10 min', '15 min', '20 min'].map((dur) => (
                  <button
                    key={dur}
                    type="button"
                    onClick={() => setQuietDuration(dur)}
                    className="h-[38px] rounded-lg text-[13px] font-semibold border transition-all cursor-pointer"
                    style={{
                      backgroundColor: quietDuration === dur ? `${theme.accent}25` : theme.inputBg,
                      borderColor: quietDuration === dur ? theme.accent : `${theme.accent}30`,
                      color: quietDuration === dur ? theme.accent : theme.textPrimary,
                    }}
                  >
                    {dur}
                  </button>
                ))}
              </div>
            </div>

            {/* Protocol selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium" style={{ color: theme.textPrimary }}>Select protocol:</label>
              <div className="flex flex-col gap-2">
                {[
                  { id: 'tactical', label: '01 Tactical Box Breathing', desc: '4s inhale · 4s hold · 4s exhale · 4s hold. Lowers sympathetic tone.' },
                  { id: 'light', label: '02 Blue-Light Depletion', desc: 'Dimmable circadian lighting transition to signal melatonin release.' },
                  { id: 'acoustic', label: '03 Habitat Acoustic Masking', desc: 'Active noise cancellation against ECLSS fans and pumps.' },
                ].map((item) => (
                  <label
                    key={item.id}
                    className="p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all"
                    style={{
                      backgroundColor: quietProtocol === item.id ? `${theme.accent}20` : theme.inputBg,
                      borderColor: quietProtocol === item.id ? theme.accent : `${theme.accent}30`,
                    }}
                  >
                    <input
                      type="radio"
                      name="quietProtocol"
                      checked={quietProtocol === item.id}
                      onChange={() => setQuietProtocol(item.id)}
                      className="mt-1"
                    />
                    <div className="flex flex-col">
                      <span className="text-[13.5px] font-semibold" style={{ color: quietProtocol === item.id ? theme.accent : theme.textPrimary }}>
                        {item.label}
                      </span>
                      <span className="text-[12px]" style={{ color: theme.textSecondary }}>
                        {item.desc}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <p className="text-[11.5px]" style={{ color: theme.textMuted }}>
              Rest routine is synchronized locally with the {envData.locationLabel} diurnal clock.
            </p>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowQuietTimeModal(false)}
                className="px-4 h-[42px] rounded-xl border text-[13px] font-medium cursor-pointer"
                style={{ backgroundColor: theme.inputBg, borderColor: `${theme.accent}40`, color: theme.textSecondary }}
              >
                Close / Return
              </button>
              <button
                type="button"
                onClick={handleAddQuietTime}
                className={`px-5 h-[42px] rounded-xl text-[13px] font-semibold cursor-pointer shadow-md ${theme.buttonPrimary}`}
              >
                Add to routine
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: OPEN SUPPORT ACTIONS                                             */}
      {/* ========================================================================= */}
      {showSupportModal && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-5 animate-fadeIn"
          onClick={() => setShowSupportModal(false)}
        >
          <div
            className={`w-full max-w-[540px] ${theme.cardSurface} rounded-[22px] p-5 sm:p-6 flex flex-col gap-4 border shadow-2xl relative max-h-[92vh] overflow-y-auto`}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="support-actions-title"
          >
            <div className="flex items-start justify-between border-b pb-3" style={{ borderColor: theme.cardBorderHex }}>
              <div>
                <span className={`text-[10.5px] font-mono px-2 py-0.5 rounded ${theme.tagBadge}`}>
                  CREW SUPPORT · {envData.environmentDisplayName.toUpperCase()}
                </span>
                <h2 id="support-actions-title" className="text-[20px] font-semibold mt-1" style={{ color: theme.textPrimary }}>
                  Open support actions
                </h2>
                <p className="text-[12.5px]" style={{ color: theme.textSecondary }}>
                  Confidential psychological support, peer check-in, and autonomous AI triage.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowSupportModal(false)}
                className="w-8 h-8 rounded-lg border flex items-center justify-center text-[14px] cursor-pointer"
                style={{ backgroundColor: theme.inputBg, borderColor: `${theme.accent}40`, color: theme.textPrimary }}
              >
                ✕
              </button>
            </div>

            {/* Support Type selection */}
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-medium" style={{ color: theme.textPrimary }}>Choose support modality:</label>
              {[
                {
                  id: 'ai',
                  title: 'Autonomous AI Medical Guidance',
                  meta: 'Instantaneous response · Zero comm latency',
                  desc: 'Private real-time cognitive and sleep countermeasure recommendations computed locally in habitat.',
                },
                {
                  id: 'peer',
                  title: 'Crew Commander Peer Debrief',
                  meta: 'Onboard habit check-in',
                  desc: 'Schedule private debrief with mission commander before night sleep window.',
                },
                {
                  id: 'surgeon',
                  title: 'Ground Flight Surgeon Consult',
                  meta: `Earth ground link · Latency: ${envData.sleepMental.commDelayLabel}`,
                  desc: 'Queue secure voice note or written query to NASA Mission Control flight surgeon.',
                },
              ].map((item) => (
                <label
                  key={item.id}
                  className="p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all"
                  style={{
                    backgroundColor: supportType === item.id ? `${theme.accent}20` : theme.inputBg,
                    borderColor: supportType === item.id ? theme.accent : `${theme.accent}30`,
                  }}
                >
                  <input
                    type="radio"
                    name="supportType"
                    checked={supportType === item.id}
                    onChange={() => setSupportType(item.id as 'ai' | 'peer' | 'surgeon')}
                    className="mt-1"
                  />
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[14px] font-semibold" style={{ color: supportType === item.id ? theme.accent : theme.textPrimary }}>
                        {item.title}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded" style={{ backgroundColor: `${theme.accent}20`, color: theme.accent }}>
                        {item.meta.split('·')[0].trim()}
                      </span>
                    </div>
                    <span className="text-[12px]" style={{ color: theme.textSecondary }}>{item.desc}</span>
                  </div>
                </label>
              ))}
            </div>

            {/* Privacy opt-in sharing checkbox */}
            <div
              className="p-3.5 rounded-xl border flex flex-col gap-2"
              style={{
                backgroundColor: explicitShareConsent ? 'rgba(41, 200, 239, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                borderColor: explicitShareConsent ? theme.accent : `${theme.accent}30`,
              }}
            >
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={explicitShareConsent}
                  onChange={(e) => setExplicitShareConsent(e.target.checked)}
                  className="mt-1 w-4 h-4 accent-cyan-400"
                />
                <div className="flex flex-col">
                  <span className="text-[13px] font-semibold" style={{ color: theme.textPrimary }}>
                    Explicitly share my psychological check-in history with Ground Medical Flight Surgeon
                  </span>
                  <span className="text-[11.5px] mt-0.5" style={{ color: theme.textSecondary }}>
                    Privacy rule: This check-in remains in this browser profile. {profileId} | Authentication and encryption are not implemented in this prototype.
                  </span>
                </div>
              </label>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSupportModal(false)}
                className="px-4 h-[42px] rounded-xl border text-[13px] font-medium cursor-pointer"
                style={{ backgroundColor: theme.inputBg, borderColor: `${theme.accent}40`, color: theme.textSecondary }}
              >
                Close / Return
              </button>
              <button
                type="button"
                onClick={handleSubmitSupport}
                className={`px-5 h-[42px] rounded-xl text-[13px] font-semibold cursor-pointer shadow-md ${theme.buttonPrimary}`}
              >
                Submit support request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
                    LOCAL PROFILE | {profileId}
      {/* ========================================================================= */}
      {showHistoryModal && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-5 animate-fadeIn"
          onClick={() => setShowHistoryModal(false)}
        >
          <div
            className={`w-full max-w-[620px] ${theme.cardSurface} rounded-[22px] p-5 sm:p-6 flex flex-col gap-4 border shadow-2xl relative max-h-[92vh] overflow-y-auto`}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="history-modal-title"
          >
            <div className="flex items-start justify-between border-b pb-3" style={{ borderColor: theme.cardBorderHex }}>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${theme.tagBadge}`}>
                    LOCAL HEALTH ARCHIVE
                  </span>
                  <span className="text-[11px] font-mono text-emerald-400">
                    LOCAL PROFILE | {profileId}
                  </span>
                </div>
                <h2 id="history-modal-title" className="text-[20px] font-semibold mt-1" style={{ color: theme.textPrimary }}>
                  Review health history
                </h2>
                <p className="text-[12.5px]" style={{ color: theme.textSecondary }}>
                  Longitudinal 7-day psychological telemetry, sleep efficiency, and cognitive workload for {astronautName}. SIMULATED DEMONSTRATION VALUES.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="w-8 h-8 rounded-lg border flex items-center justify-center text-[14px] cursor-pointer"
                style={{ backgroundColor: theme.inputBg, borderColor: `${theme.accent}40`, color: theme.textPrimary }}
              >
                ✕
              </button>
            </div>

            {/* Local Storage Privacy Banner */}
            <div
              className="p-3 rounded-xl text-[12px] flex items-center justify-between border"
              style={{
                backgroundColor: 'rgba(56, 225, 240, 0.08)',
                borderColor: `${theme.accent}30`,
              }}
            >
              <span style={{ color: theme.textPrimary }}>
                <strong>Data Privacy:</strong> Stored in browser-local prototype storage for profile {profileId}. Encryption, authentication, and automatic transmission are not implemented.
              </span>
              <span className="text-[10.5px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 ml-2 shrink-0">
                LOCAL ONLY
              </span>
            </div>

            {/* 7-Day History Table */}
            <div className="overflow-x-auto border rounded-xl" style={{ borderColor: theme.cardBorderHex }}>
              <table className="w-full text-left text-[12.5px]">
                <thead className="border-b" style={{ borderColor: theme.cardBorderHex, backgroundColor: 'rgba(255,255,255,0.03)' }}>
                  <tr>
                    <th className="p-2.5 font-semibold" style={{ color: theme.textPrimary }}>Mission Interval</th>
                    <th className="p-2.5 font-semibold" style={{ color: theme.textPrimary }}>Sleep</th>
                    <th className="p-2.5 font-semibold" style={{ color: theme.textPrimary }}>Efficiency</th>
                    <th className="p-2.5 font-semibold" style={{ color: theme.textPrimary }}>Mood</th>
                    <th className="p-2.5 font-semibold" style={{ color: theme.textPrimary }}>Workload</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: theme.cardBorderHex }}>
                  {[
                    {
                      label: currentEnv === 'Moon' ? 'LMD 14 (Today)' : currentEnv === 'Mars' ? 'Sol 84 (Today)' : 'Flight Day 42 (Today)',
                      sleep: `${envData.sleepMental.sleepDurationHours}h ${envData.sleepMental.sleepDurationMinutes}m`,
                      eff: `${envData.sleepMental.sleepEfficiencyPct}%`,
                      mood: envData.sleepMental.currentMood,
                      workload: `${envData.sleepMental.cognitiveWorkloadPct}%`,
                    },
                    {
                      label: currentEnv === 'Moon' ? 'LMD 13' : currentEnv === 'Mars' ? 'Sol 83' : 'Flight Day 41',
                      sleep: '7h 10m',
                      eff: '91%',
                      mood: 'Feeling good',
                      workload: '62%',
                    },
                    {
                      label: currentEnv === 'Moon' ? 'LMD 12' : currentEnv === 'Mars' ? 'Sol 82' : 'Flight Day 40',
                      sleep: '6h 35m',
                      eff: '85%',
                      mood: 'Okay',
                      workload: '71%',
                    },
                    {
                      label: currentEnv === 'Moon' ? 'LMD 11' : currentEnv === 'Mars' ? 'Sol 81' : 'Flight Day 39',
                      sleep: '7h 45m',
                      eff: '94%',
                      mood: 'Feeling good',
                      workload: '58%',
                    },
                    {
                      label: currentEnv === 'Moon' ? 'LMD 10' : currentEnv === 'Mars' ? 'Sol 80' : 'Flight Day 38',
                      sleep: '5h 50m',
                      eff: '79%',
                      mood: 'Low energy',
                      workload: '78%',
                    },
                    {
                      label: currentEnv === 'Moon' ? 'LMD 09' : currentEnv === 'Mars' ? 'Sol 79' : 'Flight Day 37',
                      sleep: '7h 20m',
                      eff: '90%',
                      mood: 'Okay',
                      workload: '65%',
                    },
                    {
                      label: currentEnv === 'Moon' ? 'LMD 08' : currentEnv === 'Mars' ? 'Sol 78' : 'Flight Day 36',
                      sleep: '6h 55m',
                      eff: '88%',
                      mood: 'Feeling good',
                      workload: '60%',
                    },
                  ].map((row, i) => (
                    <tr key={i} className={i === 0 ? 'font-medium' : ''} style={{ backgroundColor: i === 0 ? `${theme.accent}12` : 'transparent' }}>
                      <td className="p-2.5 font-mono" style={{ color: i === 0 ? theme.accent : theme.textPrimary }}>{row.label}</td>
                      <td className="p-2.5" style={{ color: theme.textSecondary }}>{row.sleep}</td>
                      <td className="p-2.5 font-mono" style={{ color: theme.accent }}>{row.eff}</td>
                      <td className="p-2.5" style={{ color: theme.textPrimary }}>{row.mood}</td>
                      <td className="p-2.5 font-mono" style={{ color: theme.textSecondary }}>{row.workload}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className={`px-5 h-[42px] rounded-xl text-[13px] font-semibold cursor-pointer shadow-md ${theme.buttonPrimary}`}
              >
                Close / Return
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer NASA Disclaimer */}
      <div className="pt-2 text-[12px]" style={{ color: theme.textMuted }}>
        <p>{envData.dataProvenanceDisclaimer}</p>
        <p style={{ color: theme.warning }}>Illustrative data, not NASA operational measurements. Not a validated diagnostic or treatment system.</p>
      </div>
    </div>
  );
}
