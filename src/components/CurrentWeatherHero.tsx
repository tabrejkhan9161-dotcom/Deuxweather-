import { useMemo } from 'react';
import { 
  MapPin, 
  Sunrise, 
  Sunset, 
  ArrowUp, 
  ArrowDown, 
  Sparkles,
  Clock,
  Compass,
  Droplets
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
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        timeZone: timezone || undefined,
      };
      return new Intl.DateTimeFormat([], options).format(new Date());
    } catch {
      return new Date().toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
    }
  }, [timezone]);

  const windCompass = getWindDirectionCompass(current.wind_direction_10m);

  return (
    <div className="w-full max-w-md mx-auto px-4 py-2 relative z-20">
      <div 
        id="current-weather-hero-card"
        className="rounded-3xl p-5 sm:p-6 bg-slate-900/80 border border-white/10 shadow-2xl relative overflow-hidden"
      >
        {/* Subtle Ambient Glow Behind Card */}
        <div 
          className="absolute -right-12 -top-12 w-48 h-48 rounded-full blur-[70px] opacity-20 pointer-events-none"
          style={{ backgroundColor: condition.theme.primaryColor }}
        />

        {/* Location & Time Header */}
        <div className="flex items-center justify-between gap-2 pb-2">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs truncate">
            <MapPin size={13} className="text-cyan-400 shrink-0" />
            <span className="font-semibold text-white truncate">{location.name}</span>
            {location.country && <span className="text-slate-400 text-[11px]">, {location.country}</span>}
          </div>

          <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400 shrink-0 bg-slate-950/60 px-2 py-0.5 rounded-full border border-white/5">
            <Clock size={11} className="text-slate-500" />
            <span>{localTimeStr}</span>
            <span className="text-slate-600">•</span>
            <span>{localDateStr}</span>
          </div>
        </div>

        {/* Main Temperature & Weather Icon Display */}
        <div className="flex items-center justify-between gap-4 py-3">
          <div>
            {/* Massive Bold Temperature (72px) */}
            <div className="font-display font-black text-6xl sm:text-7xl tracking-tighter text-white select-none leading-none">
              {formatTemp(current.temperature_2m, tempUnit)}
            </div>

            {/* Condition Pill & High/Low */}
            <div className="mt-2 space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-slate-950/70 border border-white/10 text-xs font-semibold text-cyan-200">
                <Sparkles size={12} className="text-amber-400" />
                <span>{condition.label}</span>
              </div>

              <div className="flex items-center gap-2.5 text-xs font-mono pt-1">
                <span className="flex items-center gap-0.5 text-rose-400 font-semibold">
                  <ArrowUp size={12} /> {formatTemp(maxTemp, tempUnit)}
                </span>
                <span className="flex items-center gap-0.5 text-sky-400 font-semibold">
                  <ArrowDown size={12} /> {formatTemp(minTemp, tempUnit)}
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400">
                  Feels {formatTemp(current.apparent_temperature, tempUnit)}
                </span>
              </div>
            </div>
          </div>

          {/* Dynamic Weather Icon */}
          <div className="shrink-0">
            <DynamicWeatherIcon 
              name={condition.icon} 
              size={72} 
              glow={true} 
              glowColor={condition.theme.primaryColor}
            />
          </div>
        </div>

        {/* Quick Horizontal Metrics Strip */}
        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/5 text-xs">
          <div className="p-2 rounded-xl bg-slate-950/50 border border-white/5 flex items-center gap-2">
            <Compass size={14} className="text-teal-400 shrink-0" />
            <div className="truncate">
              <span className="text-[10px] text-slate-400 font-mono block">WIND VECTOR</span>
              <span className="font-semibold text-white">{formatSpeed(current.wind_speed_10m, speedUnit)} {windCompass}</span>
            </div>
          </div>

          <div className="p-2 rounded-xl bg-slate-950/50 border border-white/5 flex items-center gap-2">
            <Droplets size={14} className="text-blue-400 shrink-0" />
            <div className="truncate">
              <span className="text-[10px] text-slate-400 font-mono block">HUMIDITY</span>
              <span className="font-semibold text-white">{current.relative_humidity_2m}% RH</span>
            </div>
          </div>
        </div>

        {/* Daylight Cycle Arc Indicator */}
        <div className="mt-3 pt-3 border-t border-white/5">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1.5">
            <div className="flex items-center gap-1">
              <Sunrise size={13} className="text-amber-400" />
              <span>{formatTime(sunriseStr)}</span>
            </div>
            <span className="text-[10px] text-cyan-300 font-semibold uppercase">
              {current.is_day ? 'Daylight Cycle' : 'Night Cycle'} ({Math.round(daylightProgress)}%)
            </span>
            <div className="flex items-center gap-1">
              <Sunset size={13} className="text-orange-400" />
              <span>{formatTime(sunsetStr)}</span>
            </div>
          </div>

          <div className="relative w-full h-1.5 rounded-full bg-slate-950 overflow-hidden border border-white/5">
            <div 
              className="h-full bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-500 rounded-full transition-all duration-700 shadow-sm"
              style={{ width: `${daylightProgress}%` }}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
