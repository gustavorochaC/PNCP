import { Search, ActivitySquare, Settings, User } from "lucide-react"

interface AppSidebarProps {
  currentView: 'search' | 'monitor'
  onNavigate: (view: 'search' | 'monitor') => void
}

export function AppSidebar({ currentView, onNavigate }: AppSidebarProps) {
  return (
    <aside
      className="group relative flex h-screen w-14 hover:w-[210px] flex-col shrink-0 overflow-hidden transition-[width] duration-200 ease-in-out bg-[#0f172a] border-r border-white/5"
      style={{ zIndex: 10 }}
    >
      {/* Logo */}
      <div className="flex h-12 shrink-0 items-center gap-3 px-3.5 border-b border-white/5">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-blue-600 text-white font-bold text-xs tracking-widest select-none">
          PN
        </div>
        <span className="whitespace-nowrap text-sm font-semibold text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          PNCP Suite
        </span>
      </div>

      {/* Nav */}
      <div className="flex flex-1 flex-col gap-0.5 overflow-hidden py-3 px-2">
        {/* Section label */}
        <p className="px-1.5 mb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-500 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          Ferramentas
        </p>

        <button
          type="button"
          title="Busca de Editais"
          onClick={() => onNavigate('search')}
          className={`flex items-center gap-3 rounded-md px-2 py-2 w-full text-left transition-colors ${
            currentView === 'search'
              ? 'border-l-2 border-blue-500 bg-blue-950/60 text-blue-300'
              : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
          }`}
        >
          <Search className="size-4 shrink-0" />
          <span className="whitespace-nowrap text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            Busca de Editais
          </span>
        </button>

        <button
          type="button"
          title="Monitor de APIs"
          onClick={() => onNavigate('monitor')}
          className={`flex items-center gap-3 rounded-md px-2 py-2 w-full text-left transition-colors ${
            currentView === 'monitor'
              ? 'border-l-2 border-blue-500 bg-blue-950/60 text-blue-300'
              : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
          }`}
        >
          <ActivitySquare className="size-4 shrink-0" />
          <span className="whitespace-nowrap text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            Monitor de APIs
          </span>
        </button>

        <div
          title="Em breve…"
          className="flex items-center gap-3 rounded-md px-2 py-2 text-slate-600 cursor-default opacity-45"
        >
          <Settings className="size-4 shrink-0" />
          <span className="whitespace-nowrap text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            Em breve…
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-white/5 px-2 py-3">
        <a
          href="#"
          title="Conta"
          className="flex items-center gap-3 rounded-md px-2 py-2 text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-colors"
        >
          <User className="size-4 shrink-0" />
          <span className="whitespace-nowrap text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            Conta
          </span>
        </a>
      </div>
    </aside>
  )
}
