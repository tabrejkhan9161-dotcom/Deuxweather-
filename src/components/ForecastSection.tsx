import { useState, useMemo } from 'react';
import { 
  Clock, 
  Calendar, 
  Droplets, 
  Wind, 
  Sun, 
  TrendingUp
} from 'lucide-react';
import { HourlyWeatherData, DailyWeatherData, TempUnit, SpeedUnit } from '../types';
import { 
  getWeatherCondition, 
  formatTemp, 
  formatSpeed, 
  formatDayName, 
  formatDateLabel,
  convertTemp
} from '../utils/weatherUtils';
import { DynamicWeatherIcon } from './DynamicWeatherIcon';

interface ForecastSectionProps {
  hourly: HourlyWeatherData;
  daily: DailyWeatherData;
  tempUnit: TempUnit;
  speedUnit: SpeedUnit;
}

export function ForecastSection({
  hourly,
  daily,
  tempUnit,
  speedUnit,
}: ForecastSectionProps) {
  const [activeTab, setActiveTab] = useState<'hourly' | 'daily'>('hourly');

  // Next 24 hourly data points
  const hourlyItems = useMemo(() => {
    if (!hourly.time || hourly.time.length === 0) return [];
    
    const nowIso = new Date().toISOString().slice(0, 13);
    let startIndex = hourly.time.findIndex((t) => t.startsWith(nowIso));
    if (startIndex === -1) startIndex = 0;

    const count = 24;
    const slice = [];
    for (let i = startIndex; i < Math.min(startIndex + count, hourly.time.length); i++) {
      const timeStr = hourly.time[i];
      const hour = timeStr.split('T')[1]?.slice(0, 5) || '00:00';
      const isFirst = i === startIndex;
      const isDay = parseInt(hour.slice(0, 2)) >= 6 && parseInt(hour.slice(0, 2)) <= 20 ? 1 : 0;
      
      slice.push({
        index: i - startIndex,
        rawTime: timeStr,
        timeLabel: isFirst ? 'Now' : hour,
        temp: hourly.temperature_2m[i],
        pop: hourly.precipitation_probability[i] ?? 0,
        weatherCode: hourly.weather_code[i] ?? 0,
        windSpeed: hourly.wind_speed_10m[i] ?? 0,
        isDay,
      });
    }
    return slice;
  }, [hourly]);

  // Overall min/max for 24-hour SVG curve
  const { chartSvgPath, chartAreaPath } = useMemo(() => {
    if (hourlyItems.length === 0) {
      return { chartSvgPath: '', chartAreaPath: '' };
    }

    const temps = hourlyItems.map((h) => convertTemp(h.temp, tempUnit));
    const minT = Math.min(...temps);
    const maxT = Math.max(...temps);
    const range = Math.max(3, maxT - minT);

    const svgWidth = 600;
    const svgHeight = 50;
    const paddingY = 10;

    const points = temps.map((t, idx) => {
      const x = (idx / (temps.length - 1)) * svgWidth;
      const normalized = (t - minT) / range;
      const y = svgHeight - paddingY - normalized * (svgHeight - paddingY * 2);
      return { x, y };
    });

    let linePath = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const curr = points[i];
      const next = points[i + 1];
      const midX = (curr.x + next.x) / 2;
      linePath += ` C ${midX} ${curr.y}, ${midX} ${next.y}, ${next.x} ${next.y}`;
    }

    const areaPath = `${linePath} L ${points[points.length - 1].x} ${svgHeight} L ${points[0].x} ${svgHeight} Z`;

    return {
      chartSvgPath: linePath,
      chartAreaPath: areaPath,
    };
  }, [hourlyItems, tempUnit]);

  // 7-day global min & max for scale
  const { weekMinTemp, weekMaxTemp } = useMemo(() => {
    if (!daily.temperature_2m_min || daily.temperature_2m_min.length === 0) {
      return { weekMinTemp: 0, weekMaxTemp: 40 };
    }
    const mins = daily.temperature_2m_min.map((t) => convertTemp(t, tempUnit));
    const maxs = daily.temperature_2m_max.map((t) => convertTemp(t, tempUnit));
    return {
      weekMinTemp: Math.min(...mins),
      weekMaxTemp: Math.max(...maxs),
    };
  }, [daily, tempUnit]);

  return (
    <div className="w-full max-w-md mx-auto px-4 py-2 relative z-20">
      <div 
        id="forecasting-section"
        className="rounded-2xl p-4 sm:p-5 bg-slate-900/80 border border-white/10 shadow-lg space-y-4"
      >
        {/* Header & Tabs */}
        <div className="flex items-center justify-between gap-2 pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <TrendingUp size={16} />
            </div>
            <h3 className="font-semibold text-sm text-white">
              Forecasting
            </h3>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center p-0.5 rounded-lg bg-slate-950 border border-white/10 text-[11px] font-mono">
            <button
              onClick={() => setActiveTab('hourly')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                activeTab === 'hourly'
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Clock size={12} />
              <span>24-Hour</span>
            </button>
            <button
              onClick={() => setActiveTab('daily')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                activeTab === 'daily'
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Calendar size={12} />
              <span>7-Day</span>
            </button>
          </div>
        </div>

        {/* 24-Hour Timeline */}
        {activeTab === 'hourly' && (
          <div className="space-y-3">
            {/* SVG Micro-Curve */}
            <div className="relative w-full h-12 rounded-xl bg-slate-950/50 border border-white/5 overflow-hidden">
              <svg 
                className="w-full h-full" 
                viewBox="0 0 600 50" 
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="hourlyTempGradMobile" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path d={chartAreaPath} fill="url(#hourlyTempGradMobile)" />
                <path 
                  d={chartSvgPath} 
                  fill="none" 
                  stroke="#38bdf8" 
                  strokeWidth="2" 
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* Scrollable Hour Cards */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {hourlyItems.map((item) => {
                const cond = getWeatherCondition(item.weatherCode, item.isDay);

                return (
                  <div
                    key={item.rawTime}
                    className="shrink-0 w-20 p-2.5 rounded-xl bg-slate-950/60 border border-white/5 flex flex-col items-center justify-between gap-1.5"
                  >
                    <span className="text-[11px] font-mono font-medium text-slate-400">
                      {item.timeLabel}
                    </span>

                    <DynamicWeatherIcon 
                      name={cond.icon} 
                      size={22} 
                    />

                    <span className="font-mono font-bold text-sm text-white">
                      {formatTemp(item.temp, tempUnit)}
                    </span>

                    {/* Rain probability */}
                    <div className="flex items-center gap-0.5 text-[10px] font-mono text-sky-400">
                      <Droplets size={10} />
                      <span>{item.pop}%</span>
                    </div>

                    {/* Wind */}
                    <div className="flex items-center gap-0.5 text-[9px] font-mono text-slate-500">
                      <Wind size={9} />
                      <span>{formatSpeed(item.windSpeed, speedUnit)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 7-Day Forecast */}
        {activeTab === 'daily' && (
          <div className="divide-y divide-white/5 space-y-1.5">
            {daily.time.map((dateStr, index) => {
              const code = daily.weather_code[index] ?? 0;
              const cond = getWeatherCondition(code, 1);
              const maxT = daily.temperature_2m_max[index] ?? 0;
              const minT = daily.temperature_2m_min[index] ?? 0;
              const maxTConverted = convertTemp(maxT, tempUnit);
              const minTConverted = convertTemp(minT, tempUnit);
              const pop = daily.precipitation_probability_max?.[index] ?? 0;
              const uvMax = daily.uv_index_max?.[index] ?? 0;

              const totalSpan = Math.max(1, weekMaxTemp - weekMinTemp);
              const leftOffsetPct = ((minTConverted - weekMinTemp) / totalSpan) * 100;
              const barWidthPct = Math.max(12, ((maxTConverted - minTConverted) / totalSpan) * 100);

              return (
                <div 
                  key={dateStr}
                  className="py-2.5 px-1 flex items-center justify-between gap-2"
                >
                  {/* Day Name */}
                  <div className="w-20 shrink-0">
                    <span className="font-medium text-xs text-white block">
                      {formatDayName(dateStr, index === 0)}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {formatDateLabel(dateStr)}
                    </span>
                  </div>

                  {/* Icon & Condition */}
                  <div className="flex items-center gap-1.5 w-24 shrink-0">
                    <DynamicWeatherIcon name={cond.icon} size={20} />
                    <span className="text-[11px] text-slate-300 truncate">
                      {cond.label}
                    </span>
                  </div>

                  {/* Rain or UV indicator */}
                  <div className="w-12 text-right shrink-0">
                    {pop > 0 ? (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-mono text-sky-400">
                        <Droplets size={10} /> {pop}%
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-mono text-amber-400">
                        <Sun size={10} /> {Math.round(uvMax)}
                      </span>
                    )}
                  </div>

                  {/* Range Bar */}
                  <div className="flex-1 flex items-center gap-1.5 max-w-[120px]">
                    <span className="font-mono text-[11px] text-slate-400 w-6 text-right">
                      {minTConverted}°
                    </span>

                    <div className="relative flex-1 h-1.5 rounded-full bg-slate-950 overflow-hidden">
                      <div 
                        className="absolute h-full rounded-full bg-gradient-to-r from-cyan-400 to-amber-400"
                        style={{
                          left: `${Math.max(0, leftOffsetPct)}%`,
                          width: `${Math.min(100 - leftOffsetPct, barWidthPct)}%`,
                        }}
                      />
                    </div>

                    <span className="font-mono text-[11px] font-bold text-white w-6">
                      {maxTConverted}°
                    </span>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
