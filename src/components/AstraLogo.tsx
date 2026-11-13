import type { HTMLAttributes } from 'react';
import astraEmblemPng from '../assets/brand/astra-emblem.png';

export const ASTRA_EMBLEM_SRC = astraEmblemPng;

export interface AstraLogoProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'symbol' | 'primary' | 'lockup';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  alt?: string;
  imgClassName?: string;
}

const SIZE_MAP = {
  xs: { img: 'w-6 h-6', text: 'text-[15px] tracking-[3px]', sub: 'text-[9px] tracking-[1.5px]' },
  sm: { img: 'w-8 h-8', text: 'text-[18px] tracking-[4.5px]', sub: 'text-[10px] tracking-[2px]' },
  md: { img: 'w-10 h-10', text: 'text-[24px] tracking-[6px]', sub: 'text-[11px] tracking-[2.5px]' },
  lg: { img: 'w-14 h-14', text: 'text-[32px] tracking-[8px]', sub: 'text-[12px] tracking-[3px]' },
  xl: { img: 'w-20 h-20 sm:w-24 sm:h-24', text: 'text-[36px] sm:text-[44px] tracking-[10px]', sub: 'text-[13px] tracking-[4px]' },
};

/**
 * Centralized, reusable ASTRA brand mark.
 * - `variant="symbol"`: Displays the new astronaut-on-planet emblem.
 * - `variant="primary"` / `"lockup"`: Displays the emblem + ASTRA wordmark + optional subtitle.
 */
export function AstraLogo({
  variant = 'symbol',
  size = 'md',
  showSubtitle = true,
  alt = 'ASTRA Space Health Intelligence',
  className = '',
  imgClassName = '',
  ...rest
}: AstraLogoProps) {
  const currentSize = SIZE_MAP[size] || SIZE_MAP.md;

  if (variant === 'symbol') {
    return (
      <div className={`inline-flex items-center justify-center shrink-0 ${className}`} {...rest}>
        <img
          src={ASTRA_EMBLEM_SRC}
          alt={alt}
          className={`block shrink-0 object-contain drop-shadow-[0_0_12px_rgba(56,225,240,0.35)] ${currentSize.img} ${imgClassName}`}
        />
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-3 shrink-0 ${className}`} {...rest}>
      <img
        src={ASTRA_EMBLEM_SRC}
        alt=""
        aria-hidden="true"
        className={`block shrink-0 object-contain drop-shadow-[0_0_16px_rgba(56,225,240,0.4)] ${currentSize.img} ${imgClassName}`}
      />
      <div className="flex flex-col min-w-0">
        <span
          className={`font-['Inter'] font-semibold leading-none text-[#edf5ff] drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)] ${currentSize.text}`}
        >
          ASTRA
        </span>
        {showSubtitle && (
          <span
            className={`font-['Manrope'] font-medium uppercase text-[#a5c9f5] mt-1 leading-none ${currentSize.sub}`}
          >
            Space Health Intelligence
          </span>
        )}
      </div>
    </div>
  );
}
