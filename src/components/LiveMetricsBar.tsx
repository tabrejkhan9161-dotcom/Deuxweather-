import { 
  Thermometer, 
  Wind, 
  Droplets, 
  Gauge, 
  Sun, 
  CloudRain, 
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
    <div className="w-full max-w-md mx-auto px-4 py-1 relative z-20">
      <div 
        id="live-metrics-bar"
        className="rounded-xl px-3 py-2 bg-slate-900/70 border border-white/10 shadow-md overflow-x-auto no-scrollbar"
      >
        {/* Strict single-line horizontal metric chain */}
        <div className="flex items-center gap-3 text-xs font-mono whitespace-nowrap select-none min-w-max">
          
          {/* Telemetry pulse icon */}
          <div className="flex items-center gap-1.5 text-cyan-400 font-bold tracking-wider uppercase pr-2 border-r border-white/10">
            <Activity size={13} className="animate-pulse text-cyan-400" />
            <span className="text-[10px]">LIVE</span>
          </div>

          {/* Temperature */}
          <div className="flex items-center gap-1 text-slate-200">
            <Thermometer size={13} className="text-amber-400 shrink-0" />
            <span className="text-slate-400">Temp:</span>
            <span className="font-bold text-white">{formatTemp(current.temperature_2m, tempUnit)}</span>
          </div>

          <span className="text-white/15">|</span>

          {/* Feels Like */}
          <div className="flex items-center gap-1 text-slate-200">
            <span className="text-slate-400">Feels:</span>
            <span className="font-bold text-cyan-300">{formatTemp(current.apparent_temperature, tempUnit)}</span>
          </div>

          <span className="text-white/15">|</span>

          {/* Humidity */}
          <div className="flex items-center gap-1 text-slate-200">
            <Droplets size={13} className="text-blue-400 shrink-0" />
            <span className="text-slate-400">Humidity:</span>
            <span className="font-bold text-white">{current.relative_humidity_2m}%</span>
          </div>

          <span className="text-white/15">|</span>

          {/* Wind Speed & Compass */}
          <div className="flex items-center gap-1 text-slate-200">
            <Wind size={13} className="text-teal-400 shrink-0" />
            <span className="text-slate-400">Wind:</span>
            <span className="font-bold text-white">
              {formatSpeed(current.wind_speed_10m, speedUnit)} {windCompass}
            </span>
          </div>

          <span className="text-white/15">|</span>

          {/* Pressure */}
          <div className="flex items-center gap-1 text-slate-200">
            <Gauge size={13} className="text-purple-400 shrink-0" />
            <span className="text-slate-400">Pressure:</span>
            <span className="font-bold text-white">{pressureVal}</span>
          </div>

          <span className="text-white/15">|</span>

          {/* UV Index */}
          <div className="flex items-center gap-1 text-slate-200">
            <Sun size={13} className="text-amber-400 shrink-0" />
            <span className="text-slate-400">UV:</span>
            <span className="font-bold text-amber-300">{uvIndex.toFixed(1)}</span>
          </div>

          <span className="text-white/15">|</span>

          {/* Precipitation */}
          <div className="flex items-center gap-1 text-slate-200">
            <CloudRain size={13} className="text-sky-400 shrink-0" />
            <span className="text-slate-400">Precip:</span>
            <span className="font-bold text-white">{current.precipitation} mm</span>
          </div>

          <span className="text-white/15">|</span>

          {/* Condition */}
          <div className="flex items-center gap-1 text-slate-200">
            <span className="text-slate-400">Sky:</span>
            <span className="font-bold text-cyan-200">{condition.label}</span>
          </div>

        </div>
      </div>
    </div>
  );
}
