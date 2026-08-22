import { 
  Wind, 
  Sun, 
  Droplets, 
  Gauge, 
  Compass
} from 'lucide-react';
import { CurrentWeatherData, DailyWeatherData, TempUnit, SpeedUnit } from '../types';
import { 
  formatSpeed, 
  formatTemp, 
  getWindDirectionCompass, 
  getUVLevel
} from '../utils/weatherUtils';

interface AtmosphericDetailsGridProps {
  current: CurrentWeatherData;
  daily: DailyWeatherData;
  tempUnit: TempUnit;
  speedUnit: SpeedUnit;
}

export function AtmosphericDetailsGrid({
  current,
  daily,
  tempUnit,
  speedUnit,
}: AtmosphericDetailsGridProps) {
  const uvMax = daily.uv_index_max[0] ?? 4;
  const uvInfo = getUVLevel(uvMax);
  const windCompass = getWindDirectionCompass(current.wind_direction_10m);

  // Approximate Dew Point
  const dewPointC = current.temperature_2m - ((100 - current.relative_humidity_2m) / 5);

  const pressure = current.surface_pressure ? Math.round(current.surface_pressure) : 1013;
  const pressureCategory = pressure > 1015 ? 'High (Stable)' : pressure < 1005 ? 'Low (Active)' : 'Normal';

  return (
    <div className="w-full max-w-md mx-auto px-4 py-2 relative z-20">
      <div className="grid grid-cols-2 gap-2.5">
        
        {/* Card 1: Wind Telemetry */}
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-tight flex items-center gap-1">
              <Wind size={13} className="text-teal-400" /> Wind
            </span>
            <span className="text-[10px] font-mono text-teal-300 font-semibold">
              {windCompass}
            </span>
          </div>

          <div className="font-mono font-bold text-lg text-white">
            {formatSpeed(current.wind_speed_10m, speedUnit)}
          </div>

          <div className="flex items-center gap-1.5 pt-1 border-t border-white/5 text-[11px] text-slate-400">
            <Compass size={13} className="text-teal-400" style={{ transform: `rotate(${current.wind_direction_10m ?? 0}deg)` }} />
            <span>Direction: {current.wind_direction_10m ?? 0}°</span>
          </div>
        </div>

        {/* Card 2: UV Solar Index */}
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-tight flex items-center gap-1">
              <Sun size={13} className="text-amber-400" /> UV Index
            </span>
            <span 
              className="text-[10px] font-mono font-bold uppercase"
              style={{ color: uvInfo.color }}
            >
              {uvInfo.level}
            </span>
          </div>

          <div className="font-mono font-bold text-lg text-white">
            {uvMax.toFixed(1)} <span className="text-xs font-normal text-slate-400">Max</span>
          </div>

          <div className="w-full h-1 rounded-full bg-slate-950 overflow-hidden">
            <div 
              className="h-full rounded-full"
              style={{
                width: `${Math.min(100, (uvMax / 12) * 100)}%`,
                backgroundColor: uvInfo.color,
              }}
            />
          </div>
        </div>

        {/* Card 3: Humidity & Dew Point */}
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-tight flex items-center gap-1">
              <Droplets size={13} className="text-blue-400" /> Humidity
            </span>
            <span className="text-[10px] font-mono text-blue-300">
              {current.relative_humidity_2m}%
            </span>
          </div>

          <div className="font-mono font-bold text-lg text-white">
            {current.relative_humidity_2m}%
          </div>

          <div className="text-[11px] font-mono text-slate-400 pt-1 border-t border-white/5">
            Dew Point: <strong className="text-slate-200">{formatTemp(dewPointC, tempUnit)}</strong>
          </div>
        </div>

        {/* Card 4: Barometric Pressure */}
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-tight flex items-center gap-1">
              <Gauge size={13} className="text-purple-400" /> Barometer
            </span>
            <span className="text-[10px] font-mono text-purple-300">
              {pressureCategory}
            </span>
          </div>

          <div className="font-mono font-bold text-lg text-white">
            {pressure} <span className="text-xs font-normal text-slate-400">hPa</span>
          </div>

          <div className="text-[11px] font-mono text-slate-400 pt-1 border-t border-white/5">
            Pressure: <strong className="text-slate-200">{pressureCategory}</strong>
          </div>
        </div>

      </div>
    </div>
  );
}
