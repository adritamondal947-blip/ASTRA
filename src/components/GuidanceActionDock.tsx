import imgLockedConfirmation from '../assets/figma/imgLockedConfirmation.svg';
import type { EnvironmentType } from './EnvironmentCards';

interface GuidanceActionDockProps {
  canContinue: boolean;
  selectedPhase: string | null;
  isConfirmed: boolean;
  onContinue: () => void;
  selectedEnv?: EnvironmentType;
}

export function GuidanceActionDock({
  canContinue,
  selectedPhase,
  isConfirmed,
  onContinue,
  selectedEnv = 'Spacecraft',
}: GuidanceActionDockProps) {
  const isMoon = selectedEnv === 'Moon';
  const isMars = selectedEnv === 'Mars';

  const cardBg = isMoon
    ? 'bg-[rgba(21,28,39,0.84)] border border-[rgba(140,207,255,0.38)] shadow-[0px_10px_24px_0px_rgba(8,15,28,0.46)]'
    : isMars
    ? 'bg-[rgba(28,18,22,0.92)] border border-[rgba(255,157,113,0.42)] shadow-xl'
    : 'bg-[rgba(8,34,62,0.93)] border border-[rgba(55,122,156,0.8)] shadow-lg';

  const continueActiveStyle = isMoon
    ? 'bg-gradient-to-r from-[#1e4570] to-[#2573a6] border-2 border-[#8ccfff] text-white shadow-[0_0_20px_rgba(140,207,255,0.4)]'
    : isMars
    ? 'bg-gradient-to-r from-[#702922] to-[#a64332] border-2 border-[#ff9d71] text-white shadow-[0_0_20px_rgba(255,157,113,0.4)]'
    : 'bg-gradient-to-r from-[#09829f] to-[#0cb7d4] border-2 border-[#38e1f0] text-white shadow-[0_0_20px_rgba(56,225,240,0.5)]';

  return (
    <section className="flex flex-col lg:flex-row gap-5 items-stretch w-full">
      {/* Why does this matter card */}
      <div className={`flex-1 ${cardBg} backdrop-blur-md rounded-[16px] p-[18px] py-3.5 flex flex-col justify-between gap-1.5`}>
        <span className="text-[15px] font-semibold text-[#f1d58b]">
          Why does this matter?
        </span>
        <p className="text-[14.5px] text-[#d5e5f5] leading-snug">
          Your environment and phase shape gravity, radiation and health risks. ASTRA adapts its guidance to your confirmed mission context.
        </p>
        <span className="text-[13.5px] font-semibold text-[#bedcea]">
          Your Health. Our Mission.
        </span>
      </div>

      {/* Continue Action Button */}
      <div className="w-full lg:w-[530px] shrink-0 flex flex-col gap-2.5 items-center">
        <button
          type="button"
          disabled={!canContinue}
          onClick={onContinue}
          className={`w-full h-[62px] rounded-[16px] px-4 flex items-center justify-center gap-3 transition-all ${
            canContinue
              ? `${continueActiveStyle} font-semibold text-[16px] cursor-pointer hover:brightness-110 active:scale-[0.99]`
              : 'bg-[#18334b] border border-[#648199] text-[#c0cfde] font-semibold text-[16px] cursor-not-allowed opacity-80'
          }`}
        >
          <span>Confirm Mission Environment & Continue</span>
          {!canContinue ? (
            <img src={imgLockedConfirmation} alt="Locked" className="w-5 h-5 shrink-0 opacity-80" />
          ) : (
            <span className="text-xl">➔</span>
          )}
        </button>

        <p className="text-[14px] text-[#d0e3f3] text-center">
          {!selectedPhase
            ? 'Select your current mission phase to continue.'
            : !isConfirmed
            ? 'Please confirm the checkbox above to enable continuing.'
            : 'Ready to proceed to your operational health dashboard.'}
        </p>
      </div>
    </section>
  );
}

