import { useState } from 'react';
import { 
  Wind, 
  ShieldCheck, 
  ShieldAlert, 
  HeartPulse,
  Fan
} from 'lucide-react';
import { CurrentAQIData, AQIStandard } from '../types';
import { getAQILevel, getPollutantDetails } from '../utils/weatherUtils';

interface AQICommandCenterProps {
  aqiData: CurrentAQIData;
  standard?: AQIStandard;
}

export function AQICommandCenter({ aqiData, standard = 'us' }: AQICommandCenterProps) {
  const [selectedPollutant, setSelectedPollutant] = useState<string | null>(null);
  
  const usAqi = Math.round(aqiData.us_aqi ?? 0);
  const euroAqi = Math.round(aqiData.european_aqi ?? 0);
  
  const displayAqi = standard === 'european' ? euroAqi : usAqi;
  const aqiInfo = getAQILevel(usAqi);
  const pollutants = getPollutantDetails(aqiData);

  const clampedAqi = Math.min(300, Math.max(0, usAqi));
  const strokeDashoffset = 220 - (220 * (clampedAqi / 300));

  return (
    <div className="w-full max-w-md mx-auto px-4 py-2 relative z-20">
      <div 
        id="aqi-command-center"
        className="rounded-2xl p-4 sm:p-5 bg-slate-900/80 border border-white/10 shadow-lg space-y-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-2 pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Wind size={16} />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-white">Air Quality</h3>
              <p className="text-[11px] text-slate-400 font-mono">
                {standard === 'european' ? 'European AQI Index' : 'US EPA Index (PM2.5/PM10)'}
              </p>
            </div>
          </div>

          <div 
            className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase flex items-center gap-1 border"
            style={{
              backgroundColor: aqiInfo.bgColor,
              borderColor: aqiInfo.borderColor,
              color: aqiInfo.color,
            }}
          >
            {usAqi <= 50 ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
            <span>{aqiInfo.level}</span>
          </div>
        </div>

        {/* Gauge & Metrics Block */}
        <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-slate-950/60 border border-white/5">
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
              <span className="text-[9px] font-mono text-slate-400 uppercase">
                {standard === 'european' ? 'EU AQI' : 'US AQI'}
              </span>
            </div>
          </div>

          {/* Advice Summary */}
          <div className="flex-1 space-y-1.5 text-xs">
            <p className="text-slate-300 leading-snug text-[11px]">
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
              <span className={aqiInfo.ventilationRecommended ? 'text-emerald-400' : 'text-rose-400'}>
                {aqiInfo.ventilationRecommended ? 'Open Windows OK' : 'Keep Windows Closed'}
              </span>
            </div>
          </div>
        </div>

        {/* 6 Pollutants Matrix */}
        <div className="grid grid-cols-2 gap-2">
          {pollutants.map((p) => {
            const isSelected = selectedPollutant === p.formula;
            return (
              <div
                key={p.formula}
                onClick={() => setSelectedPollutant(isSelected ? null : p.formula)}
                className={`p-2.5 rounded-xl transition-all cursor-pointer border ${
                  isSelected 
                    ? 'bg-slate-800/90 border-cyan-400/50 shadow-sm' 
                    : 'bg-slate-950/60 border-white/5 hover:border-white/15'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white">{p.formula}</span>
                  <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase ${p.statusBg} ${p.statusColor}`}>
                    {p.status}
                  </span>
                </div>

                <div className="flex items-baseline justify-between mt-1">
                  <span className="font-mono font-bold text-sm text-white">
                    {p.value} <span className="text-[9px] font-normal text-slate-400">{p.unit}</span>
                  </span>
                  <span className="text-[9px] font-mono text-slate-500">
                    {p.pctOfMax}% cap
                  </span>
                </div>

                <div className="w-full h-1 rounded-full bg-slate-800 mt-1.5 overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${
                      p.status === 'Good' ? 'bg-emerald-400' :
                      p.status === 'Moderate' ? 'bg-amber-400' :
                      p.status === 'Unhealthy' ? 'bg-rose-400' : 'bg-purple-500'
                    }`}
                    style={{ width: `${p.pctOfMax}%` }}
                  />
                </div>

                {isSelected && (
                  <p className="mt-1.5 text-[10px] text-slate-300 border-t border-white/10 pt-1 leading-tight">
                    {p.description}
                  </p>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
