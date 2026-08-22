import { useState, useEffect, useCallback } from 'react';
import { 
  Sparkles, 
  RefreshCw, 
  Sun, 
  Clock, 
  Shirt, 
  ShieldAlert, 
  Zap, 
  Activity,
  Check,
  ChevronRight
} from 'lucide-react';
import { GeoLocation, CurrentWeatherData, DailyWeatherData, CurrentAQIData, TempUnit, SpeedUnit } from '../types';
import { formatTemp, formatSpeed, getWeatherCondition } from '../utils/weatherUtils';

interface VibeCastPlan {
  vibe: string;
  outdoorWindow: string;
  gear: string;
  healthAdvisory: string;
  isFallback?: boolean;
}

interface VibeCastCardProps {
  location: GeoLocation;
  current: CurrentWeatherData;
  daily: DailyWeatherData;
  aqiData?: CurrentAQIData;
  tempUnit: TempUnit;
  speedUnit: SpeedUnit;
}

export function VibeCastCard({
  location,
  current,
  daily,
  aqiData,
  tempUnit,
  speedUnit,
}: VibeCastCardProps) {
  const [plan, setPlan] = useState<VibeCastPlan | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>('');

  const weatherCond = getWeatherCondition(current.weather_code, current.is_day);
  const rainProb = daily.precipitation_probability_max?.[0] ?? 0;
  const uvIndex = daily.uv_index_max?.[0] ?? 0;
  const aqiUs = aqiData?.us_aqi ?? 45;
  const pm25 = aqiData?.pm2_5 ?? 12;
  const pm10 = aqiData?.pm10 ?? 20;

  // Synthesize VibeCast Plan
  const fetchVibeCast = useCallback(async (isManualRefresh = false) => {
    setIsLoading(true);
    try {
      const sunriseTime = daily.sunrise?.[0]?.split('T')[1]?.slice(0, 5) || '06:00';
      const sunsetTime = daily.sunset?.[0]?.split('T')[1]?.slice(0, 5) || '19:30';

      const response = await fetch('/api/ai/vibecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city: location.name,
          temp: current.temperature_2m,
          condition: weatherCond.label,
          rainProb,
          uvIndex,
          aqiUs,
          pm25,
          pm10,
          windSpeed: current.wind_speed_10m,
          sunrise: sunriseTime,
          sunset: sunsetTime,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      if (data.success && data.data) {
        setPlan(data.data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.warn('VibeCast client fallback generation:', err);
      // Instant graceful fallback
      const tempVal = current.temperature_2m;
      let vibeStr = `${weatherCond.label} conditions in ${location.name} with temperatures around ${formatTemp(tempVal, tempUnit)}.`;
      if (rainProb > 40) vibeStr = `Overcast skies with noticeable rain likelihood (${rainProb}%) through the afternoon in ${location.name}.`;
      else if (tempVal > 28) vibeStr = `Warm and sun-drenched afternoon across ${location.name} with highs around ${formatTemp(tempVal, tempUnit)}.`;

      let windowStr = `Ideal between 06:30 AM – 10:00 AM and after 05:30 PM for optimal outdoor comfort.`;
      if (rainProb > 40) windowStr = `Best outdoor window between 07:00 AM – 11:00 AM prior to rain chance peak.`;
      else if (tempVal > 30) windowStr = `Morning window (06:00 AM – 09:00 AM) avoids peak midday thermal strain.`;

      let gearStr = `Light breathable fabrics; UV protective sunglasses; no umbrella needed.`;
      if (rainProb > 30) gearStr = `Water-resistant jacket & portable umbrella recommended; slip-resistant footwear.`;
      else if (uvIndex >= 6) gearStr = `Lightweight cottons; sunglasses & SPF 50 sunscreen advised for direct sun.`;

      let healthStr = `AQI is Good (${aqiUs}); clean atmospheric conditions for work, travel, and exercise.`;
      if (aqiUs > 100) healthStr = `AQI is Elevated (${aqiUs}); sensitive groups should limit strenuous outdoor cardio.`;
      else if (uvIndex >= 8) healthStr = `High UV Index (${uvIndex}); seek shade between 11:00 AM and 03:00 PM.`;

      setPlan({
        vibe: vibeStr,
        outdoorWindow: windowStr,
        gear: gearStr,
        healthAdvisory: healthStr,
        isFallback: true,
      });
    } finally {
      setIsLoading(false);
      setLastRefreshed(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }
  }, [location.name, current.temperature_2m, current.wind_speed_10m, weatherCond.label, rainProb, uvIndex, aqiUs, pm25, pm10, daily.sunrise, daily.sunset, tempUnit]);

  useEffect(() => {
    fetchVibeCast();
  }, [fetchVibeCast]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 relative z-20">
      <div 
        id="vibecast-ai-card"
        className="relative overflow-hidden rounded-3xl p-6 sm:p-7 glass-panel border border-cyan-500/30 bg-slate-950/70 shadow-[0_0_35px_rgba(6,182,212,0.15)] transition-all hover:border-cyan-400/50 group"
      >
        {/* Subtle Ambient Neon Background Highlights */}
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        {/* Top Header Row with Branding & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10 relative z-10">
          
          {/* Brand & Tagline */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 flex items-center justify-center text-slate-950 font-black shadow-[0_0_20px_rgba(6,182,212,0.45)] group-hover:scale-105 transition-transform shrink-0">
              <Zap size={22} className="text-white fill-white" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-display font-extrabold text-xl text-white tracking-tight flex items-center gap-2">
                  <span>VibeCast AI</span>
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                  REAL-TIME SYNTHESIS
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Smart Real-Time Day Planner & Routine Assistant
              </p>
            </div>
          </div>

          {/* Quick Action Controls */}
          <div className="flex items-center gap-3 self-end sm:self-auto">
            {lastRefreshed && (
              <span className="text-[11px] font-mono text-slate-400 hidden md:inline-block">
                Synced at {lastRefreshed}
              </span>
            )}
            
            <button
              id="refresh-vibecast-plan-btn"
              onClick={() => fetchVibeCast(true)}
              disabled={isLoading}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 hover:text-white font-mono text-xs font-bold transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)] active:scale-95 disabled:opacity-50"
              title="Refresh Daily Plan"
            >
              <RefreshCw 
                size={14} 
                className={`text-cyan-400 ${isLoading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} 
              />
              <span>{isLoading ? 'Updating Plan...' : 'Refresh Daily Plan'}</span>
            </button>
          </div>
        </div>

        {/* Live Telemetry Summary Chips */}
        <div className="pt-3.5 pb-4 flex items-center gap-2 overflow-x-auto no-scrollbar relative z-10 text-xs font-mono text-slate-300">
          <span className="text-slate-400 uppercase text-[10px] shrink-0">Live Inputs:</span>
          <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 shrink-0">
            Temp: <strong className="text-cyan-300">{formatTemp(current.temperature_2m, tempUnit)}</strong> ({weatherCond.label})
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 shrink-0">
            Rain Chance: <strong className="text-cyan-300">{rainProb}%</strong>
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 shrink-0">
            UV Index: <strong className="text-cyan-300">{uvIndex}</strong>
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 shrink-0">
            AQI: <strong className="text-cyan-300">{aqiUs}</strong> (PM2.5: {pm25} µg/m³)
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 shrink-0">
            Wind: <strong className="text-cyan-300">{formatSpeed(current.wind_speed_10m, speedUnit)}</strong>
          </span>
        </div>

        {/* 4-Point Single-Line Action Plan Container */}
        <div className="space-y-3 relative z-10">
          {isLoading && !plan ? (
            <div className="py-8 flex flex-col items-center justify-center space-y-2">
              <RefreshCw size={24} className="animate-spin text-cyan-400" />
              <p className="text-xs font-mono text-slate-400">Synthesizing personalized routine plan for {location.name}...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2.5">
              
              {/* Point 1: Day Summary & Vibe */}
              <div 
                id="vibecast-point-vibe"
                className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-cyan-500/30 transition-all flex items-start sm:items-center gap-3.5"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                  <Sun size={17} />
                </div>
                <div className="flex-1 min-w-0 text-xs sm:text-sm leading-relaxed">
                  <span className="font-bold text-amber-300 mr-2 font-mono uppercase tracking-wide text-[11px] sm:text-xs">
                    • Vibe:
                  </span>
                  <span className="text-slate-100 font-medium">
                    {plan?.vibe || 'Warm and clear afternoon with minimal cloud cover.'}
                  </span>
                </div>
              </div>

              {/* Point 2: Best Window for Outdoor Activity/Work */}
              <div 
                id="vibecast-point-window"
                className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-cyan-500/30 transition-all flex items-start sm:items-center gap-3.5"
              >
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                  <Clock size={17} />
                </div>
                <div className="flex-1 min-w-0 text-xs sm:text-sm leading-relaxed">
                  <span className="font-bold text-cyan-300 mr-2 font-mono uppercase tracking-wide text-[11px] sm:text-xs">
                    • Outdoor Window:
                  </span>
                  <span className="text-slate-100 font-medium">
                    {plan?.outdoorWindow || 'Ideal between 06:00 AM – 10:00 AM and after 05:30 PM.'}
                  </span>
                </div>
              </div>

              {/* Point 3: Outfit & Gear Recommendation */}
              <div 
                id="vibecast-point-gear"
                className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-cyan-500/30 transition-all flex items-start sm:items-center gap-3.5"
              >
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                  <Shirt size={17} />
                </div>
                <div className="flex-1 min-w-0 text-xs sm:text-sm leading-relaxed">
                  <span className="font-bold text-purple-300 mr-2 font-mono uppercase tracking-wide text-[11px] sm:text-xs">
                    • Gear:
                  </span>
                  <span className="text-slate-100 font-medium">
                    {plan?.gear || 'Lightweight cottons; carry UV sunglasses; no umbrella required.'}
                  </span>
                </div>
              </div>

              {/* Point 4: Health & Commute Alert */}
              <div 
                id="vibecast-point-health"
                className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-cyan-500/30 transition-all flex items-start sm:items-center gap-3.5"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                  <ShieldAlert size={17} />
                </div>
                <div className="flex-1 min-w-0 text-xs sm:text-sm leading-relaxed">
                  <span className="font-bold text-emerald-300 mr-2 font-mono uppercase tracking-wide text-[11px] sm:text-xs">
                    • Health Advisory:
                  </span>
                  <span className="text-slate-100 font-medium">
                    {plan?.healthAdvisory || `AQI is Moderate (${aqiUs}); sensitive groups should avoid heavy cardio outdoors.`}
                  </span>
                </div>
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
}
