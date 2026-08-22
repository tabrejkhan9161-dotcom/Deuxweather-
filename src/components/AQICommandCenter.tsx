import { useState } from 'react';
import { 
  Wind, 
  ShieldCheck, 
  ShieldAlert, 
  Info, 
  Activity, 
  CheckCircle2, 
  AlertTriangle,
  Fan,
  HeartPulse
} from 'lucide-react';
import { CurrentAQIData } from '../types';
import { getAQILevel, getPollutantDetails } from '../utils/weatherUtils';

interface AQICommandCenterProps {
  aqiData: CurrentAQIData;
}

export function AQICommandCenter({ aqiData }: AQICommandCenterProps) {
  const [selectedPollutant, setSelectedPollutant] = useState<string | null>(null);
  
  const usAqi = Math.round(aqiData.us_aqi ?? 0);
  const euroAqi = Math.round(aqiData.european_aqi ?? 0);
  const aqiInfo = getAQILevel(usAqi);
  const pollutants = getPollutantDetails(aqiData);

  // Gauge angle calculation (0 to 180 degrees)
  const clampedAqi = Math.min(350, Math.max(0, usAqi));
  const gaugePercent = (clampedAqi / 300) * 100;
  const strokeDashoffset = 283 - (283 * Math.min(100, gaugePercent)) / 100;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 relative z-20">
      <div 
        id="aqi-command-center"
        className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl relative overflow-hidden"
      >
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-300 shadow-[0_0_15px_rgba(20,184,166,0.3)]">
              <Wind size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-extrabold text-xl text-white tracking-tight">
                  AQI Command Center
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wide uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  REAL-TIME TELEMETRY
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Atmospheric particulate matter & chemical pollutant monitoring
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-400">EU AQI:</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-white/10 font-bold text-white">
              Level {euroAqi}
            </span>
          </div>
        </div>

        {/* Command Center Grid: Gauge & Health Advice on Left, Pollutants on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6">
          
          {/* Left Column: Radial Air Quality Gauge & Health Assessment */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 rounded-2xl bg-gradient-to-b from-slate-900/80 to-slate-950/90 border border-white/5 shadow-inner">
            
            {/* SVG Circular Radial Meter */}
            <div className="relative w-52 h-36 flex flex-col items-center justify-center">
              <svg className="w-48 h-48 -rotate-90 transform" viewBox="0 0 100 100">
                {/* Background arc track */}
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray="264"
                  strokeDashoffset="66"
                  strokeLinecap="round"
                />
                {/* Animated active gradient gauge arc */}
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke={aqiInfo.color}
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray="264"
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                  style={{
                    filter: `drop-shadow(0 0 8px ${aqiInfo.color})`,
                  }}
                />
              </svg>

              {/* Numerical readout in the center */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-widest">
                  US AQI
                </span>
                <span className="font-display font-black text-5xl text-white tracking-tight my-0.5">
                  {usAqi}
                </span>
                <span className="text-[11px] font-mono font-bold text-slate-400">
                  / 500 Index
                </span>
              </div>
            </div>

            {/* Dynamic Color-Coded Safety Badge */}
            <div 
              className="mt-4 px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-lg transition-all"
              style={{
                backgroundColor: aqiInfo.bgColor,
                borderColor: aqiInfo.borderColor,
                color: aqiInfo.color,
              }}
            >
              {usAqi <= 50 ? <ShieldCheck size={15} /> : <ShieldAlert size={15} />}
              <span>{aqiInfo.level} Safety Index</span>
            </div>

            {/* Narrative Health Guidance */}
            <div className="w-full mt-5 pt-4 border-t border-white/5 space-y-2.5 text-left">
              <p className="text-xs text-slate-300 leading-relaxed">
                {aqiInfo.advice}
              </p>

              <div className="space-y-1.5 pt-1">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <HeartPulse size={14} className="text-pink-400 shrink-0" />
                  <span className="font-medium text-slate-400">Outdoor Status:</span>
                  <span className="text-white truncate">{aqiInfo.outdoorStatus}</span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <Fan size={14} className="text-cyan-400 shrink-0" />
                  <span className="font-medium text-slate-400">Room Ventilation:</span>
                  <span className={aqiInfo.ventilationRecommended ? 'text-emerald-400' : 'text-rose-400'}>
                    {aqiInfo.ventilationRecommended ? 'Recommended' : 'Keep Windows Closed'}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Exact Pollutant Breakdown 6-Grid */}
          <div className="lg:col-span-7">
            <div className="flex items-center justify-between pb-3">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                Target Pollutant Matrix (µg/m³)
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                Click any metric for WHO info
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {pollutants.map((p) => {
                const isSelected = selectedPollutant === p.formula;
                return (
                  <div
                    key={p.formula}
                    onClick={() => setSelectedPollutant(isSelected ? null : p.formula)}
                    className={`p-3.5 rounded-xl transition-all cursor-pointer border ${
                      isSelected 
                        ? 'bg-slate-800/90 border-cyan-400/60 shadow-[0_0_16px_rgba(6,182,212,0.2)]' 
                        : 'glass-panel-interactive border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-display font-extrabold text-sm text-white">{p.formula}</span>
                          <span className="text-[11px] text-slate-400 font-medium truncate max-w-[120px]">{p.name}</span>
                        </div>
                      </div>
                      
                      <div className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${p.statusBg} ${p.statusColor}`}>
                        {p.status}
                      </div>
                    </div>

                    <div className="flex items-baseline justify-between mt-2">
                      <div className="font-mono font-black text-xl text-white">
                        {p.value} <span className="text-[11px] font-normal text-slate-400">{p.unit}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">
                        {p.pctOfMax}% of safety cap
                      </span>
                    </div>

                    {/* Progress indicator bar */}
                    <div className="w-full h-1.5 rounded-full bg-slate-800 mt-2 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-700 ${
                          p.status === 'Good' ? 'bg-emerald-400' :
                          p.status === 'Moderate' ? 'bg-amber-400' :
                          p.status === 'Unhealthy' ? 'bg-rose-400' : 'bg-purple-500'
                        }`}
                        style={{ width: `${p.pctOfMax}%` }}
                      />
                    </div>

                    {/* Expanded scientific explanation tooltip */}
                    {isSelected && (
                      <div className="mt-2.5 pt-2 border-t border-white/10 text-[11px] text-slate-300 leading-snug animate-in fade-in duration-200">
                        {p.description}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bottom WHO Guideline Footnote */}
            <div className="mt-3 p-3 rounded-xl bg-slate-900/60 border border-white/5 flex items-center gap-2 text-[11px] text-slate-400 font-mono">
              <Info size={14} className="text-cyan-400 shrink-0" />
              <span>
                Calibrated against World Health Organization (WHO) & US EPA air quality standard thresholds.
              </span>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
