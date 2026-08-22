import { 
  Wind, 
  Sun, 
  Droplets, 
  Gauge, 
  Sunrise, 
  Sunset, 
  Eye, 
  Compass,
  ThermometerSnowflake,
  Umbrella
} from 'lucide-react';
import { CurrentWeatherData, DailyWeatherData, TempUnit, SpeedUnit } from '../types';
import { 
  formatSpeed, 
  formatTemp, 
  getWindDirectionCompass, 
  getUVLevel, 
  formatTime,
  convertTemp
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
  const sunriseStr = daily.sunrise[0];
  const sunsetStr = daily.sunset[0];

  // Calculate approximate Dew Point: T - ((100 - RH) / 5)
  const dewPointC = current.temperature_2m - ((100 - current.relative_humidity_2m) / 5);

  // Calculate Day Length
  const dayLengthStr = (() => {
    try {
      if (!sunriseStr || !sunsetStr) return '12h 00m';
      const sr = new Date(sunriseStr);
      const ss = new Date(sunsetStr);
      const diffMs = ss.getTime() - sr.getTime();
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}h ${mins}m`;
    } catch {
      return '12h 00m';
    }
  })();

  const pressure = current.surface_pressure ? Math.round(current.surface_pressure) : 1013;
  const pressureCategory = pressure > 1015 ? 'High Pressure (Stable)' : pressure < 1005 ? 'Low Pressure (Active)' : 'Normal Barometric';

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 relative z-20">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Wind Telemetry */}
        <div className="glass-panel-interactive rounded-2xl p-5 border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Wind size={15} className="text-teal-400" /> Wind Vector
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-teal-500/20 text-teal-300 border border-teal-500/30">
              {windCompass}
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <span className="font-display font-black text-3xl text-white">
              {formatSpeed(current.wind_speed_10m, speedUnit)}
            </span>
            <div className="text-right font-mono text-xs text-slate-400">
              <div>Dir: {current.wind_direction_10m ?? 0}°</div>
            </div>
          </div>

          {/* Mini Compass Vector Visual */}
          <div className="flex items-center gap-3 pt-2 border-t border-white/5">
            <div className="w-8 h-8 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center">
              <Compass 
                size={18} 
                className="text-teal-400 transition-transform duration-700" 
                style={{ transform: `rotate(${current.wind_direction_10m ?? 0}deg)` }}
              />
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              Breeze blowing towards <span className="text-teal-300 font-semibold">{windCompass}</span>
            </p>
          </div>
        </div>

        {/* Card 2: UV Solar Index */}
        <div className="glass-panel-interactive rounded-2xl p-5 border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sun size={15} className="text-amber-400" /> UV Radiation
            </span>
            <span 
              className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase"
              style={{ backgroundColor: `${uvInfo.color}25`, color: uvInfo.color }}
            >
              {uvInfo.level}
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <span className="font-display font-black text-3xl text-white">
              {uvMax.toFixed(1)} <span className="text-sm font-normal text-slate-400">Max Index</span>
            </span>
          </div>

          {/* UV Meter Bar */}
          <div className="space-y-1.5 pt-1">
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${Math.min(100, (uvMax / 12) * 100)}%`,
                  backgroundColor: uvInfo.color,
                }}
              />
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              {uvInfo.advice}
            </p>
          </div>
        </div>

        {/* Card 3: Humidity & Dew Point */}
        <div className="glass-panel-interactive rounded-2xl p-5 border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Droplets size={15} className="text-blue-400" /> Moisture & Dew
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30">
              {current.relative_humidity_2m}% RH
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <span className="font-display font-black text-3xl text-white">
              {current.relative_humidity_2m}%
            </span>
            <div className="text-right font-mono text-xs text-slate-400">
              <span>Dew: {formatTemp(dewPointC, tempUnit)}</span>
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-700"
                style={{ width: `${current.relative_humidity_2m}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              {current.relative_humidity_2m > 70 ? 'High atmospheric moisture levels.' : current.relative_humidity_2m < 30 ? 'Dry air conditions present.' : 'Optimal comfortable ambient range.'}
            </p>
          </div>
        </div>

        {/* Card 4: Barometric Pressure */}
        <div className="glass-panel-interactive rounded-2xl p-5 border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Gauge size={15} className="text-purple-400" /> Barometer
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Surface
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <span className="font-display font-black text-3xl text-white">
              {pressure} <span className="text-sm font-normal text-slate-400">hPa</span>
            </span>
          </div>

          <div className="space-y-1 pt-1 border-t border-white/5">
            <div className="text-xs font-semibold text-cyan-300">
              {pressureCategory}
            </div>
            <p className="text-[11px] text-slate-400">
              Daylight span: <strong className="text-white">{dayLengthStr}</strong>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
