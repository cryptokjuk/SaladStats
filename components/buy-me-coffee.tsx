import { Coffee } from 'lucide-react'

export function BuyMeCoffee({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center gap-1.5 ${className}`}>
      <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">Want to support me?</p>
      <a
        href="https://buymeacoffee.com/cryptokj"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold bg-[#FFDD00] text-[#0a2133] shadow-sm hover:brightness-95 transition"
      >
        <Coffee className="w-3.5 h-3.5" />
        Buy me a coffee
      </a>
    </div>
  )
}
