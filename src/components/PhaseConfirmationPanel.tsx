import imgRadioOutline from '../assets/figma/imgRadioOutline.svg';
import imgSelectedRadioMark from '../assets/figma/imgSelectedRadioMark.svg';
import type { EnvironmentType } from './EnvironmentCards';
import { PHASES_BY_ENV } from '../data/environmentData';

interface PhaseConfirmationPanelProps {
  selectedEnv: EnvironmentType;
  selectedPhase: string | null;
  onSelectPhase: (phaseId: string) => void;
  isConfirmed: boolean;
  onConfirmChange: (confirmed: boolean) => void;
}

export function PhaseConfirmationPanel({
  selectedEnv,
  selectedPhase,
  onSelectPhase,
  isConfirmed,
  onConfirmChange,
}: PhaseConfirmationPanelProps) {
  const isMoon = selectedEnv === 'Moon';
  const isMars = selectedEnv === 'Mars';
  const panelBg = isMoon
    ? 'bg-[rgba(21,28,39,0.84)] border-[rgba(140,207,255,0.38)] shadow-[0px_10px_24px_0px_rgba(8,15,28,0.46)]'
    : isMars
    ? 'bg-[rgba(28,18,22,0.92)] border-[rgba(255,157,113,0.42)] shadow-xl'
    : 'bg-[rgba(6,26,50,0.94)] border-[rgba(55,122,156,0.8)] shadow-xl';
  const accentColor = isMoon ? '#8ccfff' : isMars ? '#ff9d71' : '#38e1f0';

  return (
    <section className={`${panelBg} border backdrop-blur-md rounded-[18px] p-[18px] flex flex-col gap-3`}>
      <div className="flex items-center justify-between">
        <h2 className="text-[19px] sm:text-[20px] font-semibold text-[#ecf5ff]">
          2 / Confirm your mission phase
        </h2>
        <span
          className="text-[12px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-full border"
          style={{
            color: accentColor,
            borderColor: `${accentColor}50`,
            backgroundColor: `${accentColor}15`,
          }}
        >
          REQUIRED
        </span>
      </div>

      <p className="text-[14.5px] text-[#ccdfef]">
        <span className="font-medium" style={{ color: accentColor }}>{selectedEnv}</span> · select the phase you are currently in.
      </p>

      {/* Dynamic Phase Choices */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full">
        {PHASES_BY_ENV[selectedEnv].map((phase) => {
          const isSelected = selectedPhase === phase.id;
          return (
            <button
              type="button"
              key={phase.id}
              onClick={() => onSelectPhase(phase.id)}
              className={`relative flex items-center justify-between px-3.5 h-[56px] rounded-[10px] border transition-all text-left cursor-pointer ${
                isSelected
                  ? isMoon
                    ? 'bg-[#151c27] border-2 border-[#8ccfff] shadow-[0_0_12px_rgba(140,207,255,0.35)]'
                    : isMars
                    ? 'bg-[#2b171c] border-2 border-[#ff9d71] shadow-[0_0_12px_rgba(255,157,113,0.35)]'
                    : 'bg-[#0c2945] border-2 border-[#38e1f0] shadow-[0_0_12px_rgba(56,225,240,0.35)]'
                  : 'bg-[#0c2945]/90 border border-[#6688a5] hover:border-[#8bb4da]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="relative w-[22px] h-[22px] shrink-0">
                  <img src={imgRadioOutline} alt="" className="w-full h-full" />
                  {isSelected && (
                    <img
                      src={imgSelectedRadioMark}
                      alt=""
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3"
                    />
                  )}
                </div>
                <span className="text-[15px] font-medium text-[#ecf5ff]">{phase.label}</span>
              </div>
              <span className="text-[13px] font-medium text-[#a9c5dd] bg-white/5 px-2 py-0.5 rounded">
                {phase.number}
              </span>
            </button>
          );
        })}
      </div>

      {/* Confirmation Checkbox */}
      <label
        className={`flex items-center gap-3 h-[50px] px-3.5 rounded-[10px] transition-all ${
          !selectedPhase
            ? 'bg-[rgba(11,37,62,0.4)] opacity-60 cursor-not-allowed'
            : isConfirmed
            ? isMoon
              ? 'bg-[rgba(21,28,39,0.9)] border border-[#8ccfff]/70 cursor-pointer'
              : isMars
              ? 'bg-[rgba(38,20,24,0.9)] border border-[#ff9d71]/70 cursor-pointer'
              : 'bg-[rgba(10,58,85,0.8)] border border-[#38e1f0]/70 cursor-pointer'
            : 'bg-[rgba(11,37,62,0.7)] border border-[#708ba2]/50 hover:border-[#708ba2] cursor-pointer'
        }`}
      >
        <input
          type="checkbox"
          disabled={!selectedPhase}
          checked={isConfirmed}
          onChange={(e) => onConfirmChange(e.target.checked)}
          className="w-5 h-5 rounded border border-[#708ba2] accent-[#38e1f0] bg-transparent cursor-pointer"
        />
        <span className="text-[14.5px] font-medium text-[#d5e5f5]">
          I confirm this is my current environment and mission phase.
        </span>
      </label>
    </section>
  );
}
