import { 
  X, 
  Settings, 
  Thermometer, 
  Wind, 
  ShieldCheck, 
  Moon, 
  Sun, 
  Monitor, 
  RefreshCw, 
  Check,
  Smartphone
} from 'lucide-react';
import { TempUnit, SpeedUnit, AQIStandard, ThemePreference } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tempUnit: TempUnit;
  onSelectTempUnit: (unit: TempUnit) => void;
  speedUnit: SpeedUnit;
  onSelectSpeedUnit: (unit: SpeedUnit) => void;
  aqiStandard: AQIStandard;
  onSelectAqiStandard: (standard: AQIStandard) => void;
  themePref: ThemePreference;
  onSelectThemePref: (theme: ThemePreference) => void;
  onForceRefresh: () => void;
  isRefreshing: boolean;
}

export function SettingsModal({
  isOpen,
  onClose,
  tempUnit,
  onSelectTempUnit,
  speedUnit,
  onSelectSpeedUnit,
  aqiStandard,
  onSelectAqiStandard,
  themePref,
  onSelectThemePref,
  onForceRefresh,
  isRefreshing,
}: SettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-slate-900 border border-white/10 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Settings size={18} />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-white">App Settings</h2>
              <p className="text-xs text-slate-400">Configure units, telemetry & preferences</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close settings"
          >
            <X size={20} />
          </button>
        </div>

        {/* Setting 1: Temperature Unit */}
        <div className="space-y-2">
          <label className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Thermometer size={14} className="text-amber-400" /> Temperature Unit
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onSelectTempUnit('C')}
              className={`py-2.5 px-4 rounded-xl text-sm font-medium transition-all flex items-center justify-between border ${
                tempUnit === 'C'
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 font-bold shadow-sm'
                  : 'bg-slate-950/60 text-slate-300 border-white/5 hover:border-white/20'
              }`}
            >
              <span>Celsius (°C)</span>
              {tempUnit === 'C' && <Check size={16} />}
            </button>
            <button
              onClick={() => onSelectTempUnit('F')}
              className={`py-2.5 px-4 rounded-xl text-sm font-medium transition-all flex items-center justify-between border ${
                tempUnit === 'F'
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 font-bold shadow-sm'
                  : 'bg-slate-950/60 text-slate-300 border-white/5 hover:border-white/20'
              }`}
            >
              <span>Fahrenheit (°F)</span>
              {tempUnit === 'F' && <Check size={16} />}
            </button>
          </div>
        </div>

        {/* Setting 2: Wind Speed Unit */}
        <div className="space-y-2">
          <label className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Wind size={14} className="text-teal-400" /> Wind Velocity
          </label>
          <div className="grid grid-cols-3 gap-2 font-mono">
            {(['km/h', 'mph', 'm/s'] as SpeedUnit[]).map((unit) => (
              <button
                key={unit}
                onClick={() => onSelectSpeedUnit(unit)}
                className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all border text-center ${
                  speedUnit === unit
                    ? 'bg-teal-500/20 text-teal-300 border-teal-400 shadow-sm'
                    : 'bg-slate-950/60 text-slate-400 border-white/5 hover:border-white/20'
                }`}
              >
                {unit}
              </button>
            ))}
          </div>
        </div>

        {/* Setting 3: AQI Calculation Standard */}
        <div className="space-y-2">
          <label className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-400" /> Air Quality Standard
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onSelectAqiStandard('us')}
              className={`py-2.5 px-4 rounded-xl text-xs font-medium transition-all flex items-center justify-between border ${
                aqiStandard === 'us'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400 font-bold shadow-sm'
                  : 'bg-slate-950/60 text-slate-300 border-white/5 hover:border-white/20'
              }`}
            >
              <span>US EPA (0-500)</span>
              {aqiStandard === 'us' && <Check size={16} />}
            </button>
            <button
              onClick={() => onSelectAqiStandard('european')}
              className={`py-2.5 px-4 rounded-xl text-xs font-medium transition-all flex items-center justify-between border ${
                aqiStandard === 'european'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400 font-bold shadow-sm'
                  : 'bg-slate-950/60 text-slate-300 border-white/5 hover:border-white/20'
              }`}
            >
              <span>European Index</span>
              {aqiStandard === 'european' && <Check size={16} />}
            </button>
          </div>
        </div>

        {/* Setting 4: Theme */}
        <div className="space-y-2">
          <label className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Moon size={14} className="text-indigo-400" /> Appearance Theme
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => onSelectThemePref('dark')}
              className={`py-2 px-3 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 border ${
                themePref === 'dark'
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-400 font-bold shadow-sm'
                  : 'bg-slate-950/60 text-slate-400 border-white/5 hover:border-white/20'
              }`}
            >
              <Moon size={13} />
              <span>Dark</span>
            </button>
            <button
              onClick={() => onSelectThemePref('light')}
              className={`py-2 px-3 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 border ${
                themePref === 'light'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-400 font-bold shadow-sm'
                  : 'bg-slate-950/60 text-slate-400 border-white/5 hover:border-white/20'
              }`}
            >
              <Sun size={13} />
              <span>Light</span>
            </button>
            <button
              onClick={() => onSelectThemePref('auto')}
              className={`py-2 px-3 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 border ${
                themePref === 'auto'
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 font-bold shadow-sm'
                  : 'bg-slate-950/60 text-slate-400 border-white/5 hover:border-white/20'
              }`}
            >
              <Monitor size={13} />
              <span>Auto</span>
            </button>
          </div>
        </div>

        {/* Setting 5: Manual Data Sync Button */}
        <div className="pt-2 border-t border-white/10 space-y-2">
          <button
            onClick={() => {
              onForceRefresh();
              onClose();
            }}
            disabled={isRefreshing}
            className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold flex items-center justify-center gap-2 border border-white/10 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin text-cyan-400' : 'text-cyan-400'} />
            <span>{isRefreshing ? 'Syncing Telemetry...' : 'Force Sync Real-Time Data'}</span>
          </button>
          <div className="flex items-center justify-center gap-1 text-[11px] text-slate-500 font-mono">
            <Smartphone size={12} />
            <span>deuxweather Mobile Edition v2.5</span>
          </div>
        </div>
      </div>
    </div>
  );
}
