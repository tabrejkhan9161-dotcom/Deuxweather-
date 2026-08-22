import { useState } from 'react';
import { 
  Thermometer, 
  Wind, 
  Droplets, 
  Gauge, 
  Sun, 
  CloudRain, 
  Activity,
  Layers
} from 'lucide-react';
import { CurrentWeatherData, TempUnit, SpeedUnit } from '../types';
import { formatTemp, formatSpeed, getWindDirectionCompass, getWeatherCondition } from '../utils/weatherUtils';

export interface LiveMetricsBarProps {
  current: CurrentWeatherData;
  tempUnit: TempUnit;
  speedUnit: SpeedUnit;
  uvIndex?: number;
  /** Widget display variant: 'ticker' | 'compact-widget' | 'grid-widget' */
  variant?: 'ticker' | 'compact-widget' | 'grid-widget';
  isWidgetMode?: boolean;
}

export function LiveMetricsBar({ 
  current, 
  tempUnit, 
  speedUnit, 
  uvIndex = 0,
  variant = 'ticker'
}: LiveMetricsBarProps) {
  const [displayStyle, setDisplayStyle] = useState<'ticker' | 'widget'>(variant === 'grid-widget' ? 'widget' : 'ticker');
  const condition = getWeatherCondition(current.weather_code, current.is_day);
  const windCompass = getWindDirectionCompass(current.wind_direction_10m);
  const pressureVal = current.surface_pressure ? `${Math.round(current.surface_pressure)} hPa` : '1013 hPa';

  return (
    <div className="w-full max-w-md mx-auto px-4 py-1.5 relative z-20">
      
      {/* iOS/Android Widget Container with Glassmorphism */}
      <div 
        id="live-metrics-widget"
        className="group relative rounded-2xl sm:rounded-3xl bg-slate-900/85 backdrop-blur-2xl border border-white/10 shadow-xl overflow-hidden transition-all duration-300"
      >
        {/* Widget Top Bar / Ticker Toggle */}
        <div className="flex items-center justify-between px-3.5 py-1.5 border-b border-white/5 bg-slate-950/40">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-mono font-bold tracking-wider text-cyan-300 uppercase">
              Live Meteorological Telemetry
            </span>
          </div>

          <button
            onClick={() => setDisplayStyle(prev => prev === 'ticker' ? 'widget' : 'ticker')}
            className="flex items-center gap-1 text-[10px] font-mono text-slate-400 hover:text-cyan-300 transition-colors px-1.5 py-0.5 rounded-md hover:bg-white/5"
            title="Toggle Widget Layout"
          >
            <Layers size={11} />
            <span className="hidden sm:inline">{displayStyle === 'ticker' ? 'Widget View' : 'Strip View'}</span>
          </button>
        </div>

        {displayStyle === 'ticker' ? (
          /* Single-Line Fluid Horizontal Scroll Ticker */
          <div className="px-3.5 py-2.5 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-3.5 text-xs font-mono whitespace-nowrap select-none min-w-max">
              
              {/* Telemetry pulse icon */}
              <div className="flex items-center gap-1.5 text-cyan-400 font-bold tracking-wider uppercase pr-2.5 border-r border-white/10">
                <Activity size={13} className="animate-pulse text-cyan-400" />
                <span className="text-[10px]">SYNCED</span>
              </div>

              {/* Temperature */}
              <div className="flex items-center gap-1.5 text-slate-200">
                <Thermometer size={13} className="text-amber-400 shrink-0" />
                <span className="text-slate-400">Temp:</span>
                <span className="font-bold text-white">{formatTemp(current.temperature_2m, tempUnit)}</span>
              </div>

              <span className="text-white/15">|</span>

              {/* Feels Like */}
              <div className="flex items-center gap-1.5 text-slate-200">
                <span className="text-slate-400">Feels:</span>
                <span className="font-bold text-cyan-300">{formatTemp(current.apparent_temperature, tempUnit)}</span>
              </div>

              <span className="text-white/15">|</span>

              {/* Humidity */}
              <div className="flex items-center gap-1.5 text-slate-200">
                <Droplets size={13} className="text-blue-400 shrink-0" />
                <span className="text-slate-400">Humidity:</span>
                <span className="font-bold text-white">{current.relative_humidity_2m}%</span>
              </div>

              <span className="text-white/15">|</span>

              {/* Wind Speed & Compass */}
              <div className="flex items-center gap-1.5 text-slate-200">
                <Wind size={13} className="text-teal-400 shrink-0" />
                <span className="text-slate-400">Wind:</span>
                <span className="font-bold text-white">
                  {formatSpeed(current.wind_speed_10m, speedUnit)} {windCompass}
                </span>
              </div>

              <span className="text-white/15">|</span>

              {/* Pressure */}
              <div className="flex items-center gap-1.5 text-slate-200">
                <Gauge size={13} className="text-purple-400 shrink-0" />
                <span className="text-slate-400">Baro:</span>
                <span className="font-bold text-white">{pressureVal}</span>
              </div>

              <span className="text-white/15">|</span>

              {/* UV Index */}
              <div className="flex items-center gap-1.5 text-slate-200">
                <Sun size={13} className="text-amber-400 shrink-0" />
                <span className="text-slate-400">UV:</span>
                <span className="font-bold text-amber-300">{uvIndex.toFixed(1)}</span>
              </div>

              <span className="text-white/15">|</span>

              {/* Precipitation */}
              <div className="flex items-center gap-1.5 text-slate-200">
                <CloudRain size={13} className="text-sky-400 shrink-0" />
                <span className="text-slate-400">Rain:</span>
                <span className="font-bold text-white">{current.precipitation} mm</span>
              </div>

              <span className="text-white/15">|</span>

              {/* Sky Condition */}
              <div className="flex items-center gap-1.5 text-slate-200">
                <span className="text-slate-400">Sky:</span>
                <span className="font-bold text-cyan-200">{condition.label}</span>
              </div>

            </div>
          </div>
        ) : (
          /* Modular 4x2 Home Screen Widget Grid */
          <div className="p-3.5 grid grid-cols-4 gap-2 animate-in fade-in duration-200">
            <div className="p-2 rounded-xl bg-slate-950/60 border border-white/5 flex flex-col items-center text-center">
              <Thermometer size={14} className="text-amber-400 mb-1" />
              <span className="text-[9px] font-mono text-slate-400">TEMP</span>
              <span className="text-xs font-mono font-bold text-white mt-0.5">{formatTemp(current.temperature_2m, tempUnit)}</span>
            </div>

            <div className="p-2 rounded-xl bg-slate-950/60 border border-white/5 flex flex-col items-center text-center">
              <Droplets size={14} className="text-blue-400 mb-1" />
              <span className="text-[9px] font-mono text-slate-400">HUMID</span>
              <span className="text-xs font-mono font-bold text-white mt-0.5">{current.relative_humidity_2m}%</span>
            </div>

            <div className="p-2 rounded-xl bg-slate-950/60 border border-white/5 flex flex-col items-center text-center">
              <Wind size={14} className="text-teal-400 mb-1" />
              <span className="text-[9px] font-mono text-slate-400">WIND</span>
              <span className="text-xs font-mono font-bold text-white mt-0.5 truncate max-w-full">
                {formatSpeed(current.wind_speed_10m, speedUnit)}
              </span>
            </div>

            <div className="p-2 rounded-xl bg-slate-950/60 border border-white/5 flex flex-col items-center text-center">
              <Sun size={14} className="text-amber-400 mb-1" />
              <span className="text-[9px] font-mono text-slate-400">UV</span>
              <span className="text-xs font-mono font-bold text-amber-300 mt-0.5">{uvIndex.toFixed(1)}</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
