import { useState } from 'react';
import { 
  Wind, 
  ShieldCheck, 
  ShieldAlert, 
  HeartPulse,
  Fan,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { CurrentAQIData, AQIStandard } from '../types';
import { getAQILevel, getPollutantDetails } from '../utils/weatherUtils';

export interface AQICommandCenterProps {
  aqiData: CurrentAQIData;
  standard?: AQIStandard;
  variant?: 'expanded' | 'compact-widget';
}

export function AQICommandCenter({ aqiData, standard = 'us', variant = 'expanded' }: AQICommandCenterProps) {
  const [selectedPollutant, setSelectedPollutant] = useState<string | null>(null);
  const [isCompactView, setIsCompactView] = useState(variant === 'compact-widget');
  
  const usAqi = Math.round(aqiData.us_aqi ?? 0);
  const euroAqi = Math.round(aqiData.european_aqi ?? 0);
  
  const displayAqi = standard === 'european' ? euroAqi : usAqi;
  const aqiInfo = getAQILevel(usAqi);
  const pollutants = getPollutantDetails(aqiData);

  const clampedAqi = Math.min(300, Math.max(0, usAqi));
  const strokeDashoffset = 220 - (220 * (clampedAqi / 300));

  return (
    <div className="w-full max-w-md mx-auto px-4 py-2 relative z-20">
      
      {/* iOS/Android Widget Container with Glassmorphism */}
      <div 
        id="aqi-command-center"
        className="rounded-3xl p-5 bg-slate-900/85 backdrop-blur-2xl border border-white/10 shadow-2xl space-y-3.5 relative overflow-hidden transition-all duration-300"
      >
        {/* Subtle dynamic glow */}
        <div 
          className="absolute -right-12 -top-12 w-36 h-36 rounded-full blur-[60px] opacity-15 pointer-events-none"
          style={{ backgroundColor: aqiInfo.color }}
        />

        {/* Header */}
        <div className="flex items-center justify-between gap-2 pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Wind size={16} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-semibold text-sm text-white">Air Quality Index</h3>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-teal-500/15 text-teal-300 border border-teal-500/30 uppercase">
                  Widget
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                {standard === 'european' ? 'European AQI Index' : 'US EPA Index (PM2.5/PM10)'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div 
              className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase flex items-center gap-1 border shadow-sm"
              style={{
                backgroundColor: aqiInfo.bgColor,
                borderColor: aqiInfo.borderColor,
                color: aqiInfo.color,
              }}
            >
              {usAqi <= 50 ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
              <span>{aqiInfo.level}</span>
            </div>

            <button
              onClick={() => setIsCompactView(!isCompactView)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              title="Toggle Widget Details"
            >
              {isCompactView ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
            </button>
          </div>
        </div>

        {/* Gauge & Metrics Block */}
        <div className="flex items-center justify-between gap-4 p-3.5 rounded-2xl bg-slate-950/60 border border-white/5 shadow-inner">
          {/* Radial SVG Gauge */}
          <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
            <svg className="w-24 h-24 -rotate-90 transform" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="35"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="7"
                fill="transparent"
                strokeDasharray="220"
                strokeDashoffset="55"
                strokeLinecap="round"
              />
              <circle
                cx="50"
                cy="50"
                r="35"
                stroke={aqiInfo.color}
                strokeWidth="7"
                fill="transparent"
                strokeDasharray="220"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display font-black text-2xl text-white">
                {displayAqi}
              </span>
              <span className="text-[9px] font-mono text-slate-400 uppercase font-semibold">
                {standard === 'european' ? 'EU AQI' : 'US AQI'}
              </span>
            </div>
          </div>

          {/* Advice Summary */}
          <div className="flex-1 space-y-1.5 text-xs">
            <p className="text-slate-300 leading-snug text-[11px] font-medium">
              {aqiInfo.advice}
            </p>
            <div className="flex items-center gap-2 pt-1 text-[11px] font-mono">
              <div className="flex items-center gap-1 text-slate-400">
                <HeartPulse size={12} className="text-pink-400" />
                <span>{aqiInfo.outdoorStatus}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-mono">
              <Fan size={12} className="text-cyan-400" />
              <span className={aqiInfo.ventilationRecommended ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                {aqiInfo.ventilationRecommended ? 'Open Windows OK' : 'Keep Windows Closed'}
              </span>
            </div>
          </div>
        </div>

        {/* 6 Pollutants Matrix (Expandable) */}
        {!isCompactView && (
          <div className="space-y-2 pt-1 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-0.5">
              <span>Pollutant Concentrations</span>
              <span>Tap for details</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {pollutants.map((p) => {
                const isSelected = selectedPollutant === p.formula;
                return (
                  <div
                    key={p.formula}
                    onClick={() => setSelectedPollutant(isSelected ? null : p.formula)}
                    className={`p-2.5 rounded-2xl transition-all cursor-pointer border ${
                      isSelected 
                        ? 'bg-slate-800/95 border-cyan-400/50 shadow-md ring-1 ring-cyan-400/20' 
                        : 'bg-slate-950/60 border-white/5 hover:border-white/15'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white font-mono">{p.formula}</span>
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase ${p.statusBg} ${p.statusColor}`}>
                        {p.status}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between mt-1">
                      <span className="font-mono font-bold text-sm text-white">
                        {p.value} <span className="text-[9px] font-normal text-slate-400">{p.unit}</span>
                      </span>
                      <span className="text-[9px] font-mono text-slate-500">
                        {p.pctOfMax}%
                      </span>
                    </div>

                    <div className="w-full h-1 rounded-full bg-slate-800 mt-1.5 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-700 ${
                          p.status === 'Good' ? 'bg-emerald-400' :
                          p.status === 'Moderate' ? 'bg-amber-400' :
                          p.status === 'Unhealthy' ? 'bg-rose-400' : 'bg-purple-500'
                        }`}
                        style={{ width: `${p.pctOfMax}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
