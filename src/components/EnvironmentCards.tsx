import imgSpacecraftEnvironment from '../assets/figma/imgAstraMissionEnvironmentDesktop.png';
import imgLunarEnvironment from '../assets/figma/imgLunarResearchStation.png';
import imgMarsEnvironment from '../assets/figma/imgMarsSettlement.png';
import imgEnvironmentIcon from '../assets/figma/imgEnvironmentIcon.svg';
import imgEnvironmentIcon1 from '../assets/figma/imgEnvironmentIcon1.svg';
import imgGroup1 from '../assets/figma/imgGroup1.svg';
import imgSelectionCheckmark from '../assets/figma/imgSelectionCheckmark.svg';

export type EnvironmentType = 'Spacecraft' | 'Moon' | 'Mars';

interface EnvironmentCardsProps {
  selectedEnv: EnvironmentType;
  onSelect: (env: EnvironmentType) => void;
}

const cards: {
  id: EnvironmentType;
  name: string;
  description: string;
  image: string;
  icon: string;
  step: string;
  cardTone: string;
  selectedTone: string;
  overlayTone: string;
}[] = [
  {
    id: 'Spacecraft',
    name: 'Spacecraft / In Transit',
    description: 'Launch / Orbit / Deep-space transit / Return',
    image: imgSpacecraftEnvironment,
    icon: imgEnvironmentIcon,
    step: '1. Select environment',
    cardTone: 'bg-[rgba(7,29,54,0.96)] border-[rgba(71,115,149,0.8)] hover:border-[#38e1f0]/70',
    selectedTone: 'border-[#24e0f5] shadow-[0_0_20px_rgba(0,207,255,0.28)]',
    overlayTone: 'from-[rgba(7,29,54,0.96)]',
  },
  {
    id: 'Moon',
    name: 'Lunar Surface',
    description: 'Moon surface operations / Lunar habitat operations',
    image: imgLunarEnvironment,
    icon: imgEnvironmentIcon1,
    step: '2. Select environment',
    cardTone: 'bg-[rgba(20,25,32,0.96)] border-[rgba(148,163,184,0.58)] hover:border-[#d7c28a]/70',
    selectedTone: 'border-[#d7c28a] shadow-[0_0_20px_rgba(215,194,138,0.22)]',
    overlayTone: 'from-[rgba(20,25,32,0.98)]',
  },
  {
    id: 'Mars',
    name: 'Mars Surface',
    description: 'Mars surface operations / Mars habitat operations',
    image: imgMarsEnvironment,
    icon: imgGroup1,
    step: '3. Select environment',
    cardTone: 'bg-[rgba(38,24,23,0.97)] border-[rgba(180,104,74,0.62)] hover:border-[#e68a5c]/75',
    selectedTone: 'border-[#e68a5c] shadow-[0_0_20px_rgba(230,138,92,0.24)]',
    overlayTone: 'from-[rgba(38,24,23,0.98)]',
  },
];

export function EnvironmentCards({ selectedEnv, onSelect }: EnvironmentCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 w-full">
      {cards.map((card) => {
        const selected = selectedEnv === card.id;
        return (
          <button
            type="button"
            key={card.id}
            onClick={() => onSelect(card.id)}
            aria-pressed={selected}
            className={`group relative cursor-pointer text-left rounded-[20px] overflow-hidden border-2 transition-all duration-200 flex flex-col min-h-[252px] sm:min-h-[280px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#020b20] ${card.cardTone} ${selected ? card.selectedTone : ''}`}
          >
            <span className="h-[132px] sm:h-[148px] w-full relative overflow-hidden bg-black/40 shrink-0">
              <img
                src={card.image}
                alt=""
                className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
              />
              <span className={`absolute inset-0 bg-gradient-to-t ${card.overlayTone} via-transparent to-black/10`} />
              {selected && (
                <span className="absolute top-3 left-3 bg-black/65 border border-white/45 rounded-full px-2.5 py-1 flex items-center gap-1.5 shadow-md backdrop-blur-sm">
                  <img src={imgSelectionCheckmark} alt="" className="w-4 h-4" />
                  <span className="text-[12px] font-semibold text-white">Selected</span>
                </span>
              )}
            </span>

            <span className="flex-1 p-4 pt-3 flex flex-col justify-between gap-3 w-full">
              <span className="flex flex-col gap-2">
                <span className="flex items-center gap-2.5">
                  <img src={card.icon} alt="" className="w-6 h-6 shrink-0" />
                  <span className="text-[17px] sm:text-[18px] font-semibold text-[#ecf5ff] leading-tight">
                    {card.name}
                  </span>
                </span>
                <span className="text-[13px] sm:text-[14px] text-[#dcebfa] leading-snug">
                  {card.description}
                </span>
              </span>
              <span className="text-[12px] font-medium text-[#c5d4e3]">{card.step}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
