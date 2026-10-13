/** Original Salad Stats logo: a bowl with three rising leaves that double as a growth chart. */
export function BrandMark({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} role="img" aria-label="Salad Stats">
      <ellipse cx="14" cy="20" rx="4.2" ry="7.5" transform="rotate(-28 14 20)" fill="#53a626" />
      <ellipse cx="34" cy="17.5" rx="4.4" ry="9" transform="rotate(26 34 17.5)" fill="#8cc63f" />
      <ellipse cx="24" cy="14" rx="4.8" ry="11" fill="#b2d530" />
      <path d="M24 6.5 V24" stroke="#1f4f22" strokeOpacity="0.35" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M5 25.5 H43 A19 19 0 0 1 5 25.5 Z" className="fill-[#1f4f22] dark:fill-[#e8eee4]" />
      <path d="M11 31 H37" className="stroke-[#b2d530]" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  )
}

export function BrandLogo({ size = 'md' }: { size?: 'md' | 'lg' }) {
  const lg = size === 'lg'
  return (
    <span className="inline-flex items-center gap-2">
      <BrandMark className={lg ? 'w-12 h-12' : 'w-9 h-9'} />
      <span className="flex flex-col leading-none text-left">
        <span className={`font-bold tracking-tight text-primary dark:text-foreground ${lg ? 'text-3xl' : 'text-xl'}`}>salad</span>
        <span className={`font-mono font-semibold uppercase text-[#53a626] dark:text-primary ${lg ? 'text-xs tracking-[0.32em] mt-1' : 'text-[9px] tracking-[0.3em] mt-0.5'}`}>stats</span>
      </span>
    </span>
  )
}
