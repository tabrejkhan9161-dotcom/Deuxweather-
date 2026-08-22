import { useState, useMemo } from 'react';
import { 
  Clock, 
  Calendar, 
  Droplets, 
  Wind, 
  Sun, 
  ChevronRight,
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
  const [hoveredHourIndex, setHoveredHourIndex] = useState<number | null>(null);

  // Take the next 24 hourly data points
  const hourlyItems = useMemo(() => {
    if (!hourly.time || hourly.time.length === 0) return [];
    
    // Find current time index or start at 0
    const nowIso = new Date().toISOString().slice(0, 13); // "YYYY-MM-DDTHH"
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

  // Compute overall min/max for the 24-hour SVG temperature micro-chart
  const { minHourlyTemp, maxHourlyTemp, chartSvgPath, chartAreaPath } = useMemo(() => {
    if (hourlyItems.length === 0) {
      return { minHourlyTemp: 0, maxHourlyTemp: 100, chartSvgPath: '', chartAreaPath: '' };
    }

    const temps = hourlyItems.map((h) => convertTemp(h.temp, tempUnit));
    const minT = Math.min(...temps);
    const maxT = Math.max(...temps);
    const range = Math.max(4, maxT - minT);

    const svgWidth = 800;
    const svgHeight = 70;
    const paddingY = 14;

    const points = temps.map((t, idx) => {
      const x = (idx / (temps.length - 1)) * svgWidth;
      const normalized = (t - minT) / range;
      const y = svgHeight - paddingY - normalized * (svgHeight - paddingY * 2);
      return { x, y };
    });

    // Smooth Bezier path
    let linePath = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const curr = points[i];
      const next = points[i + 1];
      const midX = (curr.x + next.x) / 2;
      linePath += ` C ${midX} ${curr.y}, ${midX} ${next.y}, ${next.x} ${next.y}`;
    }

    const areaPath = `${linePath} L ${points[points.length - 1].x} ${svgHeight} L ${points[0].x} ${svgHeight} Z`;

    return {
      minHourlyTemp: minT,
      maxHourlyTemp: maxT,
      chartSvgPath: linePath,
      chartAreaPath: areaPath,
    };
  }, [hourlyItems, tempUnit]);

  // Calculate 7-day global min & max for scale normalization
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
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 relative z-20">
      <div 
        id="forecasting-section"
        className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-6"
      >
        {/* Navigation Tabs & Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <TrendingUp size={20} />
            </div>
            <div>
              <h2 className="font-display font-extrabold text-xl text-white tracking-tight">
                High-Precision Forecasting
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Real-time meteorological projections & temperature curves
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center p-1 rounded-xl bg-slate-900/90 border border-white/10 text-xs font-mono">
            <button
              onClick={() => setActiveTab('hourly')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'hourly'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Clock size={14} />
              <span>24-Hour Timeline</span>
            </button>
            <button
              onClick={() => setActiveTab('daily')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'daily'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Calendar size={14} />
              <span>7-Day Extended</span>
            </button>
          </div>
        </div>

        {/* 24-Hour Interactive Horizontal Timeline */}
        {activeTab === 'hourly' && (
          <div className="space-y-4">
            
            {/* SVG Micro-Chart Curve */}
            <div className="relative w-full h-20 px-2 rounded-2xl bg-slate-900/60 border border-white/5 overflow-hidden">
              <div className="absolute top-2 left-3 flex items-center gap-2 text-[10px] font-mono text-slate-400">
                <span className="text-cyan-400 font-semibold">TEMPERATURE CURVE</span>
                <span>•</span>
                <span>Max: {maxHourlyTemp}°{tempUnit} / Min: {minHourlyTemp}°{tempUnit}</span>
              </div>

              <svg 
                className="w-full h-full pt-4" 
                viewBox="0 0 800 70" 
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="hourlyTempGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path d={chartAreaPath} fill="url(#hourlyTempGrad)" />
                <path 
                  d={chartSvgPath} 
                  fill="none" 
                  stroke="#38bdf8" 
                  strokeWidth="2.5" 
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* Horizontal Scrollable Hour Cards */}
            <div className="flex items-center gap-3 overflow-x-auto custom-scrollbar pb-3 pt-1">
              {hourlyItems.map((item) => {
                const cond = getWeatherCondition(item.weatherCode, item.isDay);
                const isHovered = hoveredHourIndex === item.index;

                return (
                  <div
                    key={item.rawTime}
                    onMouseEnter={() => setHoveredHourIndex(item.index)}
                    onMouseLeave={() => setHoveredHourIndex(null)}
                    className={`flex-shrink-0 w-24 p-3 rounded-2xl flex flex-col items-center justify-between gap-2.5 transition-all border ${
                      isHovered
                        ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_16px_rgba(6,182,212,0.3)] -translate-y-1'
                        : 'glass-panel-interactive border-white/5 hover:border-white/20'
                    }`}
                  >
                    {/* Time Label */}
                    <span className="text-xs font-mono font-bold text-slate-300">
                      {item.timeLabel}
                    </span>

                    {/* Weather Vector Icon */}
                    <DynamicWeatherIcon 
                      name={cond.icon} 
                      size={26} 
                      glow={isHovered}
                      glowColor={cond.theme.primaryColor}
                    />

                    {/* Temperature */}
                    <span className="font-display font-bold text-base text-white">
                      {formatTemp(item.temp, tempUnit)}
                    </span>

                    {/* Precipitation Probability Bar & Pill */}
                    <div className="w-full flex flex-col items-center gap-1">
                      <div className="flex items-center gap-0.5 text-[11px] font-mono text-cyan-300 font-medium">
                        <Droplets size={11} className={item.pop > 30 ? 'text-sky-400 animate-bounce' : 'text-slate-400'} />
                        <span>{item.pop}%</span>
                      </div>
                      
                      <div className="w-full h-1 rounded-full bg-slate-800 overflow-hidden">
                        <div 
                          className="h-full bg-sky-400 rounded-full transition-all duration-500"
                          style={{ width: `${item.pop}%` }}
                        />
                      </div>
                    </div>

                    {/* Wind Speed */}
                    <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400">
                      <Wind size={10} className="text-teal-400" />
                      <span>{formatSpeed(item.windSpeed, speedUnit)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 7-Day Extended Forecast */}
        {activeTab === 'daily' && (
          <div className="divide-y divide-white/5 space-y-2">
            {daily.time.map((dateStr, index) => {
              const code = daily.weather_code[index] ?? 0;
              const cond = getWeatherCondition(code, 1);
              const maxT = daily.temperature_2m_max[index] ?? 0;
              const minT = daily.temperature_2m_min[index] ?? 0;
              const maxTConverted = convertTemp(maxT, tempUnit);
              const minTConverted = convertTemp(minT, tempUnit);
              const pop = daily.precipitation_probability_max?.[index] ?? 0;
              const uvMax = daily.uv_index_max?.[index] ?? 0;

              // Normalized bar calculation
              const totalSpan = Math.max(1, weekMaxTemp - weekMinTemp);
              const leftOffsetPct = ((minTConverted - weekMinTemp) / totalSpan) * 100;
              const barWidthPct = Math.max(10, ((maxTConverted - minTConverted) / totalSpan) * 100);

              return (
                <div 
                  key={dateStr}
                  className="py-3 px-2 sm:px-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-white/5 transition-colors"
                >
                  {/* Day Name & Date */}
                  <div className="w-28 shrink-0">
                    <span className="font-display font-bold text-sm sm:text-base text-white block">
                      {formatDayName(dateStr, index === 0)}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {formatDateLabel(dateStr)}
                    </span>
                  </div>

                  {/* Weather Icon & Condition */}
                  <div className="flex items-center gap-3 w-40 shrink-0">
                    <DynamicWeatherIcon name={cond.icon} size={26} />
                    <span className="text-xs text-slate-200 font-medium truncate">
                      {cond.label}
                    </span>
                  </div>

                  {/* Precipitation & UV Pills */}
                  <div className="flex items-center gap-2 shrink-0">
                    {pop > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono bg-sky-500/20 text-sky-300 border border-sky-500/30">
                        <Droplets size={11} /> {pop}%
                      </span>
                    )}

                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono bg-amber-500/15 text-amber-300 border border-amber-500/25">
                      <Sun size={11} /> UV {Math.round(uvMax)}
                    </span>
                  </div>

                  {/* Temperature Spectrum Bar */}
                  <div className="w-full sm:w-64 flex items-center gap-3">
                    <span className="font-mono text-xs text-slate-400 w-8 text-right">
                      {minTConverted}°
                    </span>

                    <div className="relative flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div 
                        className="absolute h-full rounded-full bg-gradient-to-r from-cyan-400 via-amber-400 to-rose-500 shadow-[0_0_8px_rgba(56,189,248,0.5)]"
                        style={{
                          left: `${Math.max(0, leftOffsetPct)}%`,
                          width: `${Math.min(100 - leftOffsetPct, barWidthPct)}%`,
                        }}
                      />
                    </div>

                    <span className="font-mono text-xs font-bold text-white w-8">
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
