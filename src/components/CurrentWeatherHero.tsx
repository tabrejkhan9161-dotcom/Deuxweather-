import { useMemo } from 'react';
import { 
  MapPin, 
  Sunrise, 
  Sunset, 
  ArrowUp, 
  ArrowDown, 
  Sparkles,
  Clock,
  Compass
} from 'lucide-react';
import { GeoLocation, CurrentWeatherData, DailyWeatherData, TempUnit, SpeedUnit } from '../types';
import { getWeatherCondition, formatTemp, formatSpeed, getWindDirectionCompass, formatTime } from '../utils/weatherUtils';
import { DynamicWeatherIcon } from './DynamicWeatherIcon';

interface CurrentWeatherHeroProps {
  location: GeoLocation;
  current: CurrentWeatherData;
  daily: DailyWeatherData;
  tempUnit: TempUnit;
  speedUnit: SpeedUnit;
  timezone?: string;
}

export function CurrentWeatherHero({
  location,
  current,
  daily,
  tempUnit,
  speedUnit,
  timezone,
}: CurrentWeatherHeroProps) {
  const condition = getWeatherCondition(current.weather_code, current.is_day);
  const maxTemp = daily.temperature_2m_max[0] ?? current.temperature_2m;
  const minTemp = daily.temperature_2m_min[0] ?? current.temperature_2m;
  const sunriseStr = daily.sunrise[0];
  const sunsetStr = daily.sunset[0];

  // Calculate Daylight Arc Percentage (0% to 100%)
  const daylightProgress = useMemo(() => {
    if (!sunriseStr || !sunsetStr) return 50;
    try {
      const now = new Date();
      const sunrise = new Date(sunriseStr);
      const sunset = new Date(sunsetStr);

      const totalDayMs = sunset.getTime() - sunrise.getTime();
      const currentMs = now.getTime() - sunrise.getTime();

      if (totalDayMs <= 0) return 50;
      const pct = (currentMs / totalDayMs) * 100;
      return Math.max(0, Math.min(100, pct));
    } catch {
      return 50;
    }
  }, [sunriseStr, sunsetStr]);

  // Local Time String
  const localTimeStr = useMemo(() => {
    try {
      const options: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: timezone || undefined,
      };
      return new Intl.DateTimeFormat([], options).format(new Date());
    } catch {
      return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    }
  }, [timezone]);

  // Date format
  const localDateStr = useMemo(() => {
    try {
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        timeZone: timezone || undefined,
      };
      return new Intl.DateTimeFormat([], options).format(new Date());
    } catch {
      return new Date().toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
    }
  }, [timezone]);

  const windCompass = getWindDirectionCompass(current.wind_direction_10m);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 relative z-20">
      <div 
        id="current-weather-hero-card"
        className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 relative overflow-hidden shadow-2xl transition-all"
      >
        {/* Subtle Ambient Radial Lighting Behind Hero */}
        <div 
          className="absolute -right-20 -top-20 w-80 h-80 rounded-full blur-[90px] opacity-25 pointer-events-none"
          style={{ backgroundColor: condition.theme.primaryColor }}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center relative z-10">
          
          {/* Left Column: Location & Massive Temperature Display */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Location & Time Stamp Header */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/5 border border-white/10 text-cyan-300">
                  <MapPin size={13} className="text-cyan-400" />
                  <span>{location.country || location.name}</span>
                </span>
                
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono text-slate-300 bg-white/5 border border-white/10">
                  <Clock size={12} className="text-slate-400" />
                  <span>{localTimeStr}</span>
                </span>

                <span className="text-xs text-slate-400 font-medium">
                  {localDateStr}
                </span>
              </div>

              <div className="flex items-baseline gap-3">
                <h1 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight">
                  {location.name}
                </h1>
                {location.admin1 && (
                  <span className="text-lg text-slate-400 font-medium hidden sm:inline">
                    {location.admin1}
                  </span>
                )}
              </div>
            </div>

            {/* Massive Temperature & Condition Layout */}
            <div className="flex items-center gap-6 sm:gap-8 pt-2">
              <div className="relative">
                <div className="font-display font-black text-6xl sm:text-7xl lg:text-8xl tracking-tighter text-white select-none">
                  {formatTemp(current.temperature_2m, tempUnit)}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl glass-pill text-sm font-semibold text-cyan-200 border-cyan-500/30">
                  <Sparkles size={14} className="text-amber-400" />
                  <span>{condition.label}</span>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono text-slate-300 pt-1">
                  <span className="flex items-center gap-0.5 text-rose-400 font-semibold">
                    <ArrowUp size={13} /> {formatTemp(maxTemp, tempUnit)}
                  </span>
                  <span className="flex items-center gap-0.5 text-sky-400 font-semibold">
                    <ArrowDown size={13} /> {formatTemp(minTemp, tempUnit)}
                  </span>
                </div>

                <div className="text-xs text-slate-400 font-mono">
                  Feels like <span className="text-white font-semibold">{formatTemp(current.apparent_temperature, tempUnit)}</span>
                </div>
              </div>
            </div>

            {/* Quick Summary Bar */}
            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-slate-300">
              <div className="px-3 py-1.5 rounded-lg bg-slate-900/60 border border-white/5 flex items-center gap-2">
                <Compass size={14} className="text-teal-400" />
                <span>Breeze: <strong>{formatSpeed(current.wind_speed_10m, speedUnit)}</strong> ({windCompass})</span>
              </div>

              <div className="px-3 py-1.5 rounded-lg bg-slate-900/60 border border-white/5 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                <span>Humidity: <strong>{current.relative_humidity_2m}%</strong></span>
              </div>
            </div>

          </div>

          {/* Right Column: Hero Visual Icon & Daylight Arc Tracker */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 sm:p-6 rounded-2xl bg-gradient-to-b from-white/[0.04] to-transparent border border-white/5">
            
            {/* Center Dynamic HD Vector Icon */}
            <div className="my-2 relative group">
              <DynamicWeatherIcon 
                name={condition.icon} 
                size={84} 
                glow={true} 
                glowColor={condition.theme.primaryColor}
              />
            </div>

            {/* Daylight Sun Arc Tracker */}
            <div className="w-full mt-4 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
                <div className="flex items-center gap-1">
                  <Sunrise size={14} className="text-amber-400" />
                  <span>Sunrise {formatTime(sunriseStr)}</span>
                </div>
                <div className="text-[11px] text-cyan-300 font-semibold uppercase">
                  {current.is_day ? 'Daylight Cycle' : 'Night Cycle'}
                </div>
                <div className="flex items-center gap-1">
                  <Sunset size={14} className="text-orange-400" />
                  <span>Sunset {formatTime(sunsetStr)}</span>
                </div>
              </div>

              {/* Progress Arc Bar */}
              <div className="relative w-full h-2 rounded-full bg-slate-800/80 overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-500 rounded-full transition-all duration-700 shadow-[0_0_10px_rgba(251,191,36,0.6)]"
                  style={{ width: `${daylightProgress}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-1.5">
                <span>06:00 AM</span>
                <span>Sun Orbit ({Math.round(daylightProgress)}%)</span>
                <span>08:00 PM</span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
