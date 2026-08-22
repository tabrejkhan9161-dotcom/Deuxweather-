import { useState, useEffect, useCallback } from 'react';
import { 
  RefreshCw, 
  Sun, 
  Clock, 
  Shirt, 
  ShieldAlert, 
  Zap
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
      const tempVal = current.temperature_2m;
      let vibeStr = `${weatherCond.label} conditions in ${location.name} around ${formatTemp(tempVal, tempUnit)}.`;
      if (rainProb > 40) vibeStr = `Overcast skies with noticeable rain probability (${rainProb}%) in ${location.name}.`;
      else if (tempVal > 28) vibeStr = `Warm and sun-drenched afternoon in ${location.name} with highs around ${formatTemp(tempVal, tempUnit)}.`;

      let windowStr = `Ideal between 06:30 AM – 10:00 AM and after 05:30 PM for optimal comfort.`;
      if (rainProb > 40) windowStr = `Best outdoor window between 07:00 AM – 11:00 AM prior to rain chance peak.`;
      else if (tempVal > 30) windowStr = `Morning window (06:00 AM – 09:00 AM) avoids peak midday thermal strain.`;

      let gearStr = `Light breathable fabrics; UV sunglasses; no umbrella needed.`;
      if (rainProb > 30) gearStr = `Water-resistant jacket & portable umbrella recommended.`;
      else if (uvIndex >= 6) gearStr = `Lightweight cottons; sunglasses & SPF 50 sunscreen advised for direct sun.`;

      let healthStr = `AQI is Good (${aqiUs}); clean air for work, commute, and exercise.`;
      if (aqiUs > 100) healthStr = `AQI is Elevated (${aqiUs}); sensitive individuals should limit strenuous outdoor cardio.`;
      else if (uvIndex >= 8) healthStr = `High UV Index (${uvIndex}); seek shade during midday hours.`;

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
    <div className="w-full max-w-md mx-auto px-4 py-2 relative z-20">
      <div 
        id="vibecast-ai-card"
        className="rounded-2xl p-4 sm:p-5 bg-slate-900/80 border border-white/10 shadow-lg space-y-3"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between gap-2 pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Zap size={16} />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-white flex items-center gap-1.5">
                VibeCast AI
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-cyan-500/20 text-cyan-300">
                  DAY PLANNER
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">Routine & Activity Assistant</p>
            </div>
          </div>

          <button
            id="refresh-vibecast-plan-btn"
            onClick={() => fetchVibeCast(true)}
            disabled={isLoading}
            className="p-1.5 rounded-lg bg-slate-950 border border-white/10 text-slate-400 hover:text-white transition-all disabled:opacity-50"
            title="Refresh Plan"
            aria-label="Refresh VibeCast plan"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin text-cyan-400' : ''} />
          </button>
        </div>

        {/* 4-Point Action Plan */}
        <div className="space-y-2 pt-1">
          {isLoading && !plan ? (
            <div className="py-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <RefreshCw size={16} className="animate-spin text-cyan-400" />
              <span>Synthesizing smart day plan...</span>
            </div>
          ) : (
            <>
              {/* Point 1: Vibe */}
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-md bg-amber-500/15 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Sun size={13} />
                </div>
                <div className="text-xs leading-relaxed">
                  <span className="font-bold text-amber-300 font-mono mr-1.5">VIBE:</span>
                  <span className="text-slate-200">{plan?.vibe}</span>
                </div>
              </div>

              {/* Point 2: Window */}
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-md bg-cyan-500/15 text-cyan-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Clock size={13} />
                </div>
                <div className="text-xs leading-relaxed">
                  <span className="font-bold text-cyan-300 font-mono mr-1.5">WINDOW:</span>
                  <span className="text-slate-200">{plan?.outdoorWindow}</span>
                </div>
              </div>

              {/* Point 3: Gear */}
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-md bg-purple-500/15 text-purple-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Shirt size={13} />
                </div>
                <div className="text-xs leading-relaxed">
                  <span className="font-bold text-purple-300 font-mono mr-1.5">GEAR:</span>
                  <span className="text-slate-200">{plan?.gear}</span>
                </div>
              </div>

              {/* Point 4: Health */}
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-md bg-emerald-500/15 text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldAlert size={13} />
                </div>
                <div className="text-xs leading-relaxed">
                  <span className="font-bold text-emerald-300 font-mono mr-1.5">HEALTH:</span>
                  <span className="text-slate-200">{plan?.healthAdvisory}</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
