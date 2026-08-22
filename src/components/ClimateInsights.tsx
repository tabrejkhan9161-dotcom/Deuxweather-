import { useState, useEffect, useId } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  Droplets, 
  Thermometer, 
  Flame, 
  Snowflake, 
  Info,
  Loader2
} from 'lucide-react';
import { GeoLocation, TempUnit, ClimateInsightsData } from '../types';
import { fetchClimateInsightsData } from '../services/weatherApi';
import { convertTemp, formatTemp } from '../utils/weatherUtils';

interface ClimateInsightsProps {
  location: GeoLocation;
  tempUnit: TempUnit;
}

export function ClimateInsights({ location, tempUnit }: ClimateInsightsProps) {
  const [data, setData] = useState<ClimateInsightsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metricTab, setMetricTab] = useState<'temp' | 'humidity'>('temp');

  const tempGradId = useId();
  const histGradId = useId();

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    fetchClimateInsightsData(location.latitude, location.longitude)
      .then((res) => {
        if (isMounted) {
          setData(res);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Error fetching climate insights:', err);
          setError('Failed to load 30-day climate trends.');
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [location.latitude, location.longitude]);

  if (isLoading) {
    return (
      <div className="w-full max-w-md mx-auto px-4 py-2">
        <div className="rounded-2xl p-5 bg-slate-900/70 border border-white/10 text-center space-y-3">
          <Loader2 className="w-6 h-6 animate-spin text-cyan-400 mx-auto" />
          <p className="text-xs text-slate-400 font-mono">Analyzing 30-day climate telemetry & historical normals...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="w-full max-w-md mx-auto px-4 py-2">
        <div className="rounded-2xl p-4 bg-slate-900/60 border border-white/10 text-center text-xs text-slate-400">
          <p>{error || 'No climate data available'}</p>
        </div>
      </div>
    );
  }

  // Transform data points to match the current temperature unit
  const chartData = data.points.map((pt) => ({
    date: pt.displayDate,
    rawDate: pt.date,
    actualMean: convertTemp(pt.actualTempMean, tempUnit),
    actualMax: convertTemp(pt.actualTempMax, tempUnit),
    actualMin: convertTemp(pt.actualTempMin, tempUnit),
    historicalNorm: convertTemp(pt.historicalAvgTemp, tempUnit),
    anomaly: tempUnit === 'F' ? Number((pt.tempAnomaly * 1.8).toFixed(1)) : pt.tempAnomaly,
    actualHumidity: pt.actualHumidity,
    historicalHumidity: pt.historicalAvgHumidity,
  }));

  const avgConverted = convertTemp(data.avgTemp30d, tempUnit);
  const histConverted = convertTemp(data.historicalAvgTemp30d, tempUnit);
  const anomalyValue = tempUnit === 'F' ? Number((data.tempAnomalyOverall * 1.8).toFixed(1)) : data.tempAnomalyOverall;
  const isWarmer = anomalyValue >= 0;

  return (
    <div className="w-full max-w-md mx-auto px-4 py-2">
      <div 
        id="climate-insights-card"
        className="rounded-2xl p-4 sm:p-5 bg-slate-900/80 border border-white/10 shadow-lg space-y-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-2 pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <TrendingUp size={16} />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-white flex items-center gap-1.5">
                Climate Insights
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-white/10 text-slate-300">
                  30-DAY
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">vs 30-Year Historical Norms</p>
            </div>
          </div>

          {/* Metric Selector Pill */}
          <div className="flex items-center p-0.5 rounded-lg bg-slate-950 border border-white/10 text-[11px] font-mono">
            <button
              onClick={() => setMetricTab('temp')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                metricTab === 'temp'
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Temp
            </button>
            <button
              onClick={() => setMetricTab('humidity')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                metricTab === 'humidity'
                  ? 'bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Humidity
            </button>
          </div>
        </div>

        {/* 3 Summary Badges */}
        <div className="grid grid-cols-3 gap-2">
          {/* Anomaly / Delta */}
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 space-y-1 text-center">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-tight block">
              30d Anomaly
            </span>
            <span className={`font-mono font-bold text-sm block ${isWarmer ? 'text-amber-400' : 'text-cyan-400'}`}>
              {isWarmer ? `+${anomalyValue}` : anomalyValue}°{tempUnit}
            </span>
            <span className="text-[9px] text-slate-500 block">
              {isWarmer ? 'Above norm' : 'Below norm'}
            </span>
          </div>

          {/* 30-day Mean vs Norm */}
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 space-y-1 text-center">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-tight block">
              30d Mean
            </span>
            <span className="font-mono font-bold text-sm text-white block">
              {avgConverted}°{tempUnit}
            </span>
            <span className="text-[9px] text-slate-500 block">
              Norm: {histConverted}°
            </span>
          </div>

          {/* Peak Extremes */}
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 space-y-1 text-center">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-tight block">
              Peak Day
            </span>
            <span className="font-mono font-bold text-sm text-rose-400 block truncate">
              {formatTemp(data.hottestDay.temp, tempUnit)}
            </span>
            <span className="text-[9px] text-slate-500 block truncate">
              {data.hottestDay.date}
            </span>
          </div>
        </div>

        {/* Recharts Chart Section */}
        <div className="w-full h-56 pt-2">
          {metricTab === 'temp' ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id={tempGradId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id={histGradId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  tickLine={false} 
                  axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                  tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }}
                  interval={6}
                />
                <YAxis 
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }}
                  unit={`°`}
                  domain={['dataMin - 3', 'dataMax + 3']}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="p-2.5 rounded-xl bg-slate-950/95 border border-white/15 shadow-xl text-xs font-mono space-y-1">
                          <p className="text-slate-400 font-medium">{d.date}</p>
                          <div className="flex items-center justify-between gap-4 text-white">
                            <span className="flex items-center gap-1 text-cyan-300">
                              <Thermometer size={12} /> Recorded:
                            </span>
                            <span className="font-bold">{d.actualMean}°{tempUnit}</span>
                          </div>
                          <div className="flex items-center justify-between gap-4 text-slate-400">
                            <span>Historical Norm:</span>
                            <span>{d.historicalNorm}°{tempUnit}</span>
                          </div>
                          <div className="flex items-center justify-between gap-4 pt-1 border-t border-white/10">
                            <span>Anomaly:</span>
                            <span className={d.anomaly >= 0 ? 'text-amber-400 font-bold' : 'text-cyan-400 font-bold'}>
                              {d.anomaly >= 0 ? `+${d.anomaly}` : d.anomaly}°{tempUnit}
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="actualMean" 
                  name="Actual Mean"
                  stroke="#38bdf8" 
                  strokeWidth={2.5} 
                  fill={`url(#${tempGradId})`} 
                />
                <Line 
                  type="monotone" 
                  dataKey="historicalNorm" 
                  name="30y Norm"
                  stroke="#94a3b8" 
                  strokeWidth={1.5} 
                  strokeDasharray="4 4"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  tickLine={false} 
                  axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                  tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }}
                  interval={6}
                />
                <YAxis 
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }}
                  unit="%"
                  domain={[20, 100]}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="p-2.5 rounded-xl bg-slate-950/95 border border-white/15 shadow-xl text-xs font-mono space-y-1">
                          <p className="text-slate-400 font-medium">{d.date}</p>
                          <div className="flex items-center justify-between gap-4 text-blue-300">
                            <span className="flex items-center gap-1">
                              <Droplets size={12} /> Recorded RH:
                            </span>
                            <span className="font-bold text-white">{d.actualHumidity}%</span>
                          </div>
                          <div className="flex items-center justify-between gap-4 text-slate-400">
                            <span>Historical Avg:</span>
                            <span>{d.historicalHumidity}%</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="actualHumidity" 
                  name="Recorded Humidity"
                  stroke="#60a5fa" 
                  strokeWidth={2.5} 
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="historicalHumidity" 
                  name="Historical Avg"
                  stroke="#94a3b8" 
                  strokeWidth={1.5} 
                  strokeDasharray="4 4"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Legend / Caption */}
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-white/5">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-0.5 bg-sky-400 rounded-full" /> Actual Recorded
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-0.5 border-b border-dashed border-slate-400" /> 30-Year Baseline
            </span>
          </div>
          <span className="text-slate-500">ERA5/GFS Model</span>
        </div>
      </div>
    </div>
  );
}
