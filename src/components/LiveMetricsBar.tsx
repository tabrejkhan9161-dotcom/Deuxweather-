import { 
  Thermometer, 
  Wind, 
  Droplets, 
  Gauge, 
  Sun, 
  CloudRain, 
  Compass,
  Activity
} from 'lucide-react';
import { CurrentWeatherData, TempUnit, SpeedUnit } from '../types';
import { formatTemp, formatSpeed, getWindDirectionCompass, getWeatherCondition } from '../utils/weatherUtils';

interface LiveMetricsBarProps {
  current: CurrentWeatherData;
  tempUnit: TempUnit;
  speedUnit: SpeedUnit;
  uvIndex?: number;
}

export function LiveMetricsBar({ current, tempUnit, speedUnit, uvIndex = 0 }: LiveMetricsBarProps) {
  const condition = getWeatherCondition(current.weather_code, current.is_day);
  const windCompass = getWindDirectionCompass(current.wind_direction_10m);
  const pressureVal = current.surface_pressure ? `${Math.round(current.surface_pressure)} hPa` : '1013 hPa';

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 relative z-20">
      <div 
        id="live-metrics-bar"
        className="glass-panel rounded-xl px-4 py-2.5 border border-cyan-500/20 shadow-lg overflow-x-auto no-scrollbar flex items-center justify-between"
      >
        {/* Strict single-line horizontal metric chain */}
        <div className="flex items-center gap-3 sm:gap-4 text-xs font-mono whitespace-nowrap select-none min-w-max mx-auto sm:mx-0">
          
          {/* Telemetry pulse icon */}
          <div className="flex items-center gap-1.5 text-cyan-400 font-bold tracking-wider uppercase pr-1 border-r border-white/10">
            <Activity size={14} className="animate-pulse text-cyan-400" />
            <span className="text-[11px]">LIVE METRICS</span>
          </div>

          {/* Temperature */}
          <div className="flex items-center gap-1 text-slate-200">
            <Thermometer size={14} className="text-amber-400 shrink-0" />
            <span className="text-slate-400">Temperature:</span>
            <span className="font-bold text-white tracking-wide">{formatTemp(current.temperature_2m, tempUnit)}</span>
          </div>

          <span className="text-white/20 font-bold">|</span>

          {/* Feels Like */}
          <div className="flex items-center gap-1 text-slate-200">
            <span className="text-slate-400">Feels Like:</span>
            <span className="font-bold text-cyan-300 tracking-wide">{formatTemp(current.apparent_temperature, tempUnit)}</span>
          </div>

          <span className="text-white/20 font-bold">|</span>

          {/* Humidity */}
          <div className="flex items-center gap-1 text-slate-200">
            <Droplets size={14} className="text-blue-400 shrink-0" />
            <span className="text-slate-400">Humidity:</span>
            <span className="font-bold text-white tracking-wide">{current.relative_humidity_2m}%</span>
          </div>

          <span className="text-white/20 font-bold">|</span>

          {/* Wind Speed & Compass */}
          <div className="flex items-center gap-1 text-slate-200">
            <Wind size={14} className="text-teal-400 shrink-0" />
            <span className="text-slate-400">Wind:</span>
            <span className="font-bold text-white tracking-wide">
              {formatSpeed(current.wind_speed_10m, speedUnit)} {windCompass}
            </span>
          </div>

          <span className="text-white/20 font-bold">|</span>

          {/* Pressure */}
          <div className="flex items-center gap-1 text-slate-200">
            <Gauge size={14} className="text-purple-400 shrink-0" />
            <span className="text-slate-400">Pressure:</span>
            <span className="font-bold text-white tracking-wide">{pressureVal}</span>
          </div>

          <span className="text-white/20 font-bold">|</span>

          {/* UV Index */}
          <div className="flex items-center gap-1 text-slate-200">
            <Sun size={14} className="text-amber-400 shrink-0" />
            <span className="text-slate-400">UV:</span>
            <span className="font-bold text-amber-300 tracking-wide">{uvIndex.toFixed(1)}</span>
          </div>

          <span className="text-white/20 font-bold">|</span>

          {/* Precipitation */}
          <div className="flex items-center gap-1 text-slate-200">
            <CloudRain size={14} className="text-sky-400 shrink-0" />
            <span className="text-slate-400">Precip:</span>
            <span className="font-bold text-white tracking-wide">{current.precipitation} mm</span>
          </div>

          <span className="text-white/20 font-bold">|</span>

          {/* Condition */}
          <div className="flex items-center gap-1 text-slate-200">
            <span className="text-slate-400">Condition:</span>
            <span className="font-bold text-cyan-200 tracking-wide">{condition.label}</span>
          </div>

        </div>
      </div>
    </div>
  );
}
