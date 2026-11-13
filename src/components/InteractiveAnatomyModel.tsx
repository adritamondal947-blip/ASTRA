export type BodyView = 'anterior' | 'posterior';

export type BodyRegionId =
  | 'brain'
  | 'heart'
  | 'lungs'
  | 'spine'
  | 'muscles'
  | 'digestive';

export interface BodyRegionData {
  id: BodyRegionId;
  name: string;
  system: string;
  view: BodyView;
  status: 'Nominal' | 'Attention needed' | 'Monitoring';
  statusColor: string;
  measurements: { label: string; value: string; baseline: string }[];
  trends: string;
  alerts: string[];
  lastUpdated: string;
  description: string;
  recommendations: string[];
}

export const BODY_REGIONS: Record<BodyRegionId, BodyRegionData> = {
  brain: {
    id: 'brain',
    name: 'Brain & Nervous System',
    system: 'Central & Peripheral Nervous System',
    view: 'anterior',
    status: 'Nominal',
    statusColor: '#04e5d4',
    measurements: [
      { label: 'Intracranial Pressure (ICP)', value: '11.8 mmHg', baseline: '10.5 mmHg' },
      { label: 'Cognitive Speed Index', value: '98.2%', baseline: '100%' },
      { label: 'Circadian Phase Shift', value: '+22 min', baseline: '0 min' },
    ],
    trends: 'Stable across Flight Days 30-42. Minimal microgravity cephalad headache frequency reported.',
    alerts: ['No acute neurological alerts', 'Routine intraocular pressure scan due Flight Day 45'],
    lastUpdated: '14:35 UTC · Sensor simulated',
    description: 'Monitors microgravity fluid redistribution, Spaceflight-Associated Neuro-ocular Syndrome (SANS) risk, cognitive workload, and sleep latency.',
    recommendations: [
      'Maintain 8-hour designated circadian lighting cycle',
      'Log subjective mental clarity during afternoon checklist',
      'Use lower-body negative pressure (LBNP) chamber if tension persists'
    ]
  },
  heart: {
    id: 'heart',
    name: 'Heart & Cardiovascular System',
    system: 'Cardiopulmonary & Circulatory',
    view: 'anterior',
    status: 'Nominal',
    statusColor: '#04e5d4',
    measurements: [
      { label: 'Resting Heart Rate', value: '68 bpm', baseline: '65 bpm' },
      { label: 'Blood Pressure', value: '118 / 76 mmHg', baseline: '116 / 74 mmHg' },
      { label: 'Cardiac Output', value: '4.9 L/min', baseline: '5.1 L/min' },
      { label: 'Stroke Volume', value: '72 mL', baseline: '78 mL' },
    ],
    trends: 'Slight cardiovascular deconditioning typical of Flight Day 42. Heart rate variability (HRV) remains within safe bounds.',
    alerts: ['Arrhythmia screening: Clear', 'Aerobic ergometer load scheduled at 17:00 UTC'],
    lastUpdated: '14:35 UTC · Continuous wearable',
    description: 'Tracks cardiac remodeling, orthostatic tolerance reserves, and stroke volume adaptation to reduced hydrostatic pressure gradients.',
    recommendations: [
      '30 min cycle ergometer interval at 75% VO2 max',
      'Electrolyte intake: 1 hydration pouch post-exercise',
      'Re-check seated arterial pressure after rest period'
    ]
  },
  lungs: {
    id: 'lungs',
    name: 'Lungs & Respiratory System',
    system: 'Pulmonary Dynamics',
    view: 'anterior',
    status: 'Nominal',
    statusColor: '#04e5d4',
    measurements: [
      { label: 'Blood Oxygen (SpO2)', value: '98%', baseline: '98%' },
      { label: 'Breathing Rate', value: '14 / min', baseline: '14 / min' },
      { label: 'End-Tidal CO2', value: '38 mmHg', baseline: '39 mmHg' },
      { label: 'Cabin ppO2', value: '21.3 kPa', baseline: '21.0 kPa' },
    ],
    trends: 'Pulmonary compliance optimal. Ambient cabin scrubbing keeps CO2 below 2.5 mmHg threshold.',
    alerts: ['Dust filter check nominal', 'No bronchospasm detected'],
    lastUpdated: '14:35 UTC · Sensor simulated',
    description: 'Assesses ventilation-perfusion ratios, cabin air toxicity exposure, and pulmonary micro-particle filtration.',
    recommendations: [
      'Inspect personal crew quarters airflow diffuser',
      'Report any dry cough or throat irritation following EVA/regolith sim'
    ]
  },
  spine: {
    id: 'spine',
    name: 'Spine & Skeletal Framework',
    system: 'Axial Musculoskeletal & Bone Matrix',
    view: 'posterior',
    status: 'Attention needed',
    statusColor: '#ffd48a',
    measurements: [
      { label: 'Spinal Elongation', value: '+3.4 cm', baseline: '0.0 cm' },
      { label: 'Lumbar T-Score Est.', value: '-0.8%', baseline: '0.0%' },
      { label: 'Discomfort Level', value: 'Mild stiffness (3/10)', baseline: '0/10' },
      { label: 'Intervertebral Expansion', value: '+8.2%', baseline: 'Normal' },
    ],
    trends: 'Expected microgravity spinal decompressional elongation. Mild paraspinal muscular hypertonicity following sleep restraint use.',
    alerts: ['Attention needed: Lower-back stiffness reported', 'Bone mineral density loss trend active'],
    lastUpdated: '14:37 UTC · Self-report & sensor',
    description: 'Microgravity eliminates axial spinal compression, leading to intervertebral disc hyper-hydration, spinal lengthening, and risk of lumbar strain.',
    recommendations: [
      'Conduct 10 min gentle axial mobility and pelvic tilts',
      'Adjust sleep restraint harness tension to neutral posture',
      'Avoid sudden twisting under high-mass cargo handling'
    ]
  },
  muscles: {
    id: 'muscles',
    name: 'Major Musculature & Postural Chain',
    system: 'Skeletal Muscle & Neuromuscular Coordination',
    view: 'posterior',
    status: 'Attention needed',
    statusColor: '#ffd48a',
    measurements: [
      { label: 'Calf Muscle Volume', value: '-1.4%', baseline: 'Baseline' },
      { label: 'Quadriceps Power Output', value: '94%', baseline: '100%' },
      { label: 'Grip Strength', value: '44 kg', baseline: '45 kg' },
    ],
    trends: 'Gradual slow-twitch postural muscle atrophy in soleus and gastrocnemius counteracted by daily ARED workouts.',
    alerts: ['Scheduled resistance session at 17:00 UTC', 'Hamstring flexibility check due'],
    lastUpdated: '14:30 UTC · Pre-flight benchmark model',
    description: 'Postural anti-gravity muscles experience reduced mechanical loading in zero-g, necessitating high-resistance concentric/eccentric loading.',
    recommendations: [
      'ARED protocol: Squats 4x10, Heel raises 3x15 at 75% 1RM',
      'High-protein post-workout nutritional ration',
      'Foam roller myofascial release on calf compartments'
    ]
  },
  digestive: {
    id: 'digestive',
    name: 'Digestive & Gastrointestinal System',
    system: 'Enteric & Metabolic Dynamics',
    view: 'anterior',
    status: 'Nominal',
    statusColor: '#04e5d4',
    measurements: [
      { label: 'Hydration Balance', value: '2.4 L / day', baseline: '2.5 L / day' },
      { label: 'Gastric Motility', value: 'Normal', baseline: 'Normal' },
      { label: 'Microbiome Stability Index', value: '88%', baseline: '92%' },
      { label: 'Caloric Intake Today', value: '2,150 kcal', baseline: '2,800 kcal' },
    ],
    trends: 'Space motion sickness symptoms fully resolved. Gastrointestinal transit time normalized.',
    alerts: ['Hydration check passed ✓', 'Evening nutritional pouch pending'],
    lastUpdated: '13:45 UTC · Self-report log',
    description: 'Monitors gastrointestinal motility, metabolic assimilation, hydration levels, and gut microbiome resilience under prolonged space conditions.',
    recommendations: [
      'Complete remaining 400 mL electrolyte intake before sleep cycle',
      'Ensure dietary fiber intake meets 30g daily goal'
    ]
  }
};

interface InteractiveAnatomyModelProps {
  selectedRegion: BodyRegionId;
  onSelectRegion: (id: BodyRegionId) => void;
  bodyView: BodyView;
  onToggleView: (view: BodyView) => void;
}

export function InteractiveAnatomyModel({
  selectedRegion,
  onSelectRegion,
  bodyView,
  onToggleView,
}: InteractiveAnatomyModelProps) {
  const isAnterior = bodyView === 'anterior';

  return (
    <div className="relative w-full flex flex-col items-center">
      {/* View Toggle Bar (Anterior / Posterior) */}
      <div className="flex items-center gap-2 mb-3 bg-[#0a233f]/80 p-1 rounded-xl border border-[rgba(41,200,239,0.3)] shadow-inner">
        <button
          type="button"
          onClick={() => onToggleView('anterior')}
          className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            isAnterior
              ? 'bg-[#29c8ef] text-[#020b20] shadow-[0_0_8px_rgba(41,200,239,0.5)]'
              : 'text-[#d5e5f5] hover:text-white'
          }`}
        >
          Anterior (Front)
        </button>
        <button
          type="button"
          onClick={() => onToggleView('posterior')}
          className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            !isAnterior
              ? 'bg-[#29c8ef] text-[#020b20] shadow-[0_0_8px_rgba(41,200,239,0.5)]'
              : 'text-[#d5e5f5] hover:text-white'
          }`}
        >
          Posterior (Back)
        </button>
      </div>

      {/* SVG Interactive Canvas */}
      <div className="relative w-full max-w-[340px] aspect-[896/1200] max-h-[500px] flex items-center justify-center">
        <svg
          viewBox="0 0 400 560"
          className="w-full h-full select-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Holographic Cyan Glow Filter */}
            <filter id="cyanGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Amber Alert Glow Filter */}
            <filter id="amberGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Body wireframe grid pattern */}
            <pattern id="scannerGrid" width="16" height="16" patternUnits="userSpaceOnUse">
              <path d="M 16 0 L 0 0 0 16" fill="none" stroke="rgba(41, 200, 239, 0.08)" strokeWidth="0.8" />
            </pattern>
          </defs>

          {/* Holographic Background Grid Silhouette */}
          <rect x="0" y="0" width="400" height="560" fill="url(#scannerGrid)" rx="16" />

          {/* Outer Holographic Body Contour Silhouette */}
          <path
            d={
              isAnterior
                ? "M 200 40 C 185 40 174 52 174 72 C 174 88 182 100 186 106 C 160 116 138 132 130 156 L 110 240 L 96 320 L 88 350 C 85 360 92 368 100 365 C 108 362 118 340 124 315 L 140 245 C 144 265 146 300 150 330 L 155 420 L 152 510 C 151 525 162 535 174 535 C 184 535 190 522 192 505 L 196 425 L 200 370 L 204 425 L 208 505 C 210 522 216 535 226 535 C 238 535 249 525 248 510 L 245 420 L 250 330 C 254 300 256 265 260 245 L 276 315 C 282 340 292 362 300 365 C 308 368 315 360 312 350 L 304 320 L 290 240 L 270 156 C 262 132 240 116 214 106 C 218 100 226 88 226 72 C 226 52 215 40 200 40 Z"
                : "M 200 40 C 185 40 174 52 174 72 C 174 88 182 100 186 106 C 160 116 138 132 130 156 L 110 240 L 96 320 L 88 350 C 85 360 92 368 100 365 C 108 362 118 340 124 315 L 140 245 C 144 265 146 300 150 330 L 155 420 L 152 510 C 151 525 162 535 174 535 C 184 535 190 522 192 505 L 196 425 L 200 370 L 204 425 L 208 505 C 210 522 216 535 226 535 C 238 535 249 525 248 510 L 245 420 L 250 330 C 254 300 256 265 260 245 L 276 315 C 282 340 292 362 300 365 C 308 368 315 360 312 350 L 304 320 L 290 240 L 270 156 C 262 132 240 116 214 106 C 218 100 226 88 226 72 C 226 52 215 40 200 40 Z"
            }
            fill="rgba(8, 28, 52, 0.4)"
            stroke="rgba(41, 200, 239, 0.35)"
            strokeWidth="1.6"
          />

          {/* Internal Anatomical Reference Lines (Circulatory & Skeletal wireframe) */}
          <path
            d="M 200 106 L 200 330 M 174 150 L 226 150 M 165 200 L 235 200 M 170 260 L 230 260 M 165 330 L 235 330"
            fill="none"
            stroke="rgba(41, 200, 239, 0.15)"
            strokeWidth="1"
            strokeDasharray="3 3"
          />

          {/* ------------------------------------------------------------- */}
          {/* REGION 1: BRAIN & NERVOUS SYSTEM                              */}
          {/* ------------------------------------------------------------- */}
          <g
            id="region-brain"
            onClick={() => onSelectRegion('brain')}
            className="cursor-pointer group"
          >
            <ellipse
              cx="200"
              cy="70"
              rx="22"
              ry="24"
              className={`transition-all duration-300 ${
                selectedRegion === 'brain'
                  ? 'fill-[#04e5d4]/40 stroke-[#04e5d4] stroke-[2.5]'
                  : 'fill-[#29c8ef]/15 stroke-[#29c8ef]/60 stroke-[1.4] hover:fill-[#29c8ef]/30 hover:stroke-[#29c8ef]'
              }`}
              filter={selectedRegion === 'brain' ? 'url(#cyanGlow)' : undefined}
            />
            {/* Brain convolutions */}
            <path
              d="M 190 60 Q 200 55 210 60 Q 215 70 205 76 Q 195 82 205 88"
              fill="none"
              stroke={selectedRegion === 'brain' ? '#ddfbff' : 'rgba(41, 200, 239, 0.6)'}
              strokeWidth="1.2"
            />
            {/* Callout Indicator Tag */}
            <circle cx="200" cy="70" r="3" fill="#04e5d4" />
          </g>

          {/* ------------------------------------------------------------- */}
          {/* ANTERIOR VIEW SPECIFIC REGIONS                                */}
          {/* ------------------------------------------------------------- */}
          {isAnterior && (
            <>
              {/* REGION 2: LUNGS & RESPIRATORY SYSTEM */}
              <g
                id="region-lungs"
                onClick={() => onSelectRegion('lungs')}
                className="cursor-pointer group"
              >
                {/* Left Lung */}
                <path
                  d="M 175 140 C 160 145 150 165 152 195 C 154 215 170 220 180 215 C 182 185 180 155 175 140 Z"
                  className={`transition-all duration-300 ${
                    selectedRegion === 'lungs'
                      ? 'fill-[#04e5d4]/40 stroke-[#04e5d4] stroke-[2.2]'
                      : 'fill-[#29c8ef]/15 stroke-[#29c8ef]/60 stroke-[1.2] hover:fill-[#29c8ef]/30'
                  }`}
                  filter={selectedRegion === 'lungs' ? 'url(#cyanGlow)' : undefined}
                />
                {/* Right Lung */}
                <path
                  d="M 225 140 C 240 145 250 165 248 195 C 246 215 230 220 220 215 C 218 185 220 155 225 140 Z"
                  className={`transition-all duration-300 ${
                    selectedRegion === 'lungs'
                      ? 'fill-[#04e5d4]/40 stroke-[#04e5d4] stroke-[2.2]'
                      : 'fill-[#29c8ef]/15 stroke-[#29c8ef]/60 stroke-[1.2] hover:fill-[#29c8ef]/30'
                  }`}
                  filter={selectedRegion === 'lungs' ? 'url(#cyanGlow)' : undefined}
                />
                {/* Bronchial Tree */}
                <path
                  d="M 200 135 L 200 155 M 200 155 L 170 180 M 200 155 L 230 180"
                  fill="none"
                  stroke={selectedRegion === 'lungs' ? '#ddfbff' : 'rgba(41, 200, 239, 0.5)'}
                  strokeWidth="1.2"
                />
              </g>

              {/* REGION 3: HEART & CARDIOVASCULAR */}
              <g
                id="region-heart"
                onClick={() => onSelectRegion('heart')}
                className="cursor-pointer group"
              >
                <path
                  d="M 198 165 C 190 155 178 162 182 175 C 186 188 198 202 202 208 C 206 202 218 188 222 175 C 226 162 214 155 206 165 C 204 167 200 167 198 165 Z"
                  className={`transition-all duration-300 ${
                    selectedRegion === 'heart'
                      ? 'fill-[#04e5d4]/50 stroke-[#04e5d4] stroke-[2.4]'
                      : 'fill-[#29c8ef]/20 stroke-[#29c8ef]/70 stroke-[1.4] hover:fill-[#29c8ef]/40'
                  }`}
                  filter={selectedRegion === 'heart' ? 'url(#cyanGlow)' : undefined}
                />
                {/* Heart pulse ring */}
                <circle
                  cx="202"
                  cy="182"
                  r="6"
                  fill="none"
                  stroke="#04e5d4"
                  strokeWidth="1.5"
                  className="animate-ping origin-center"
                />
              </g>

              {/* REGION 4: DIGESTIVE ORGANS */}
              <g
                id="region-digestive"
                onClick={() => onSelectRegion('digestive')}
                className="cursor-pointer group"
              >
                {/* Stomach / Abdominal Viscera */}
                <path
                  d="M 175 225 C 168 235 170 265 180 275 C 195 285 215 285 225 275 C 235 265 235 235 225 225 C 215 218 185 218 175 225 Z"
                  className={`transition-all duration-300 ${
                    selectedRegion === 'digestive'
                      ? 'fill-[#04e5d4]/40 stroke-[#04e5d4] stroke-[2.2]'
                      : 'fill-[#29c8ef]/15 stroke-[#29c8ef]/60 stroke-[1.2] hover:fill-[#29c8ef]/30'
                  }`}
                  filter={selectedRegion === 'digestive' ? 'url(#cyanGlow)' : undefined}
                />
                <path
                  d="M 185 240 Q 200 248 215 240 Q 205 260 195 260"
                  fill="none"
                  stroke={selectedRegion === 'digestive' ? '#ddfbff' : 'rgba(41, 200, 239, 0.4)'}
                  strokeWidth="1.2"
                />
              </g>
            </>
          )}

          {/* ------------------------------------------------------------- */}
          {/* POSTERIOR (BACK) VIEW SPECIFIC REGIONS                        */}
          {/* ------------------------------------------------------------- */}
          {!isAnterior && (
            <>
              {/* REGION 5: SPINE & SKELETAL SYSTEM */}
              <g
                id="region-spine"
                onClick={() => onSelectRegion('spine')}
                className="cursor-pointer group"
              >
                {/* Vertebral Column Path */}
                <path
                  d="M 200 95 L 200 325"
                  fill="none"
                  stroke={selectedRegion === 'spine' ? '#ffd48a' : '#ffd48a'}
                  strokeWidth="6"
                  strokeLinecap="round"
                  filter={selectedRegion === 'spine' ? 'url(#amberGlow)' : undefined}
                />
                {/* Individual Lumbar Vertebrae Marks */}
                {[110, 130, 150, 170, 190, 210, 230, 250, 270, 290, 310].map((y) => (
                  <rect
                    key={y}
                    x="193"
                    y={y}
                    width="14"
                    height="6"
                    rx="2"
                    fill={selectedRegion === 'spine' ? '#ffd48a' : '#eaf4ff'}
                    stroke="#020b20"
                    strokeWidth="1"
                  />
                ))}

                {/* Lumbar Focus Callout (Mild stiffness) */}
                <circle
                  cx="200"
                  cy="260"
                  r="12"
                  fill="none"
                  stroke="#ffd48a"
                  strokeWidth="2"
                  className="animate-ping"
                />
                <circle cx="200" cy="260" r="5" fill="#ffd48a" />
              </g>

              {/* REGION 6: MAJOR POSTERIOR MUSCULATURE */}
              <g
                id="region-muscles"
                onClick={() => onSelectRegion('muscles')}
                className="cursor-pointer group"
              >
                {/* Latissimus Dorsi & Gluteals */}
                <path
                  d="M 155 160 C 170 170 170 220 160 250 C 150 250 145 220 145 190 Z"
                  className={`transition-all duration-300 ${
                    selectedRegion === 'muscles'
                      ? 'fill-[#ffd48a]/40 stroke-[#ffd48a] stroke-[2]'
                      : 'fill-[#29c8ef]/10 stroke-[#29c8ef]/40 stroke-[1] hover:fill-[#ffd48a]/20'
                  }`}
                />
                <path
                  d="M 245 160 C 230 170 230 220 240 250 C 250 250 255 220 255 190 Z"
                  className={`transition-all duration-300 ${
                    selectedRegion === 'muscles'
                      ? 'fill-[#ffd48a]/40 stroke-[#ffd48a] stroke-[2]'
                      : 'fill-[#29c8ef]/10 stroke-[#29c8ef]/40 stroke-[1] hover:fill-[#ffd48a]/20'
                  }`}
                />
                {/* Gastrocnemius / Calves */}
                <ellipse
                  cx="170"
                  cy="460"
                  rx="10"
                  ry="25"
                  className={`transition-all duration-300 ${
                    selectedRegion === 'muscles'
                      ? 'fill-[#ffd48a]/40 stroke-[#ffd48a] stroke-[2]'
                      : 'fill-[#29c8ef]/10 stroke-[#29c8ef]/40 stroke-[1] hover:fill-[#ffd48a]/20'
                  }`}
                />
                <ellipse
                  cx="230"
                  cy="460"
                  rx="10"
                  ry="25"
                  className={`transition-all duration-300 ${
                    selectedRegion === 'muscles'
                      ? 'fill-[#ffd48a]/40 stroke-[#ffd48a] stroke-[2]'
                      : 'fill-[#29c8ef]/10 stroke-[#29c8ef]/40 stroke-[1] hover:fill-[#ffd48a]/20'
                  }`}
                />
              </g>
            </>
          )}

          {/* Lower Limbs Grounded Coordinate Scale */}
          <line x1="140" y1="545" x2="260" y2="545" stroke="rgba(41,200,239,0.3)" strokeWidth="1" />
          <text x="200" y="555" fill="rgba(182,240,255,0.7)" fontSize="8" textAnchor="middle" fontFamily="monospace">
            ANATOMICAL REFERENCE · 1.0G / 0.0G
          </text>
        </svg>
      </div>

      {/* Quick Organ Selector Chips */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3 w-full max-w-[380px]">
        {(Object.keys(BODY_REGIONS) as BodyRegionId[]).map((id) => {
          const region = BODY_REGIONS[id];
          const isSelected = selectedRegion === id;
          return (
            <button
              type="button"
              key={id}
              onClick={() => {
                onSelectRegion(id);
                if (region.view !== bodyView) {
                  onToggleView(region.view);
                }
              }}
              className={`px-2.5 py-1 text-[11.5px] rounded-full border transition-all cursor-pointer flex items-center gap-1 ${
                isSelected
                  ? 'bg-[#0b354b] border-[#29c8ef] text-[#29c8ef] font-semibold shadow-[0_0_8px_rgba(41,200,239,0.4)]'
                  : 'bg-[rgba(10,33,59,0.7)] border-[#40688a]/50 text-[#b5c8df] hover:border-[#29c8ef]/50 hover:text-white'
              }`}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: region.statusColor }}
              />
              <span>{region.name.split('&')[0].trim()}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
