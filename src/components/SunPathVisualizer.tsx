import { useMemo, useState, useEffect } from 'react';
import { 
  Sun, 
  Moon, 
  Camera, 
  Sparkles, 
  Clock, 
  Sunrise, 
  Sunset,
  Info
} from 'lucide-react';
import { formatTime } from '../utils/weatherUtils';

interface SunPathVisualizerProps {
  sunriseStr?: string;
  sunsetStr?: string;
  isDay?: boolean;
  timezone?: string;
}

export function SunPathVisualizer({
  sunriseStr,
  sunsetStr,
  isDay = true,
  timezone,
}: SunPathVisualizerProps) {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [showInfo, setShowInfo] = useState(false);

  // Update clock every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const solarData = useMemo(() => {
    if (!sunriseStr || !sunsetStr) {
      return {
        progressPct: 50,
        sunX: 150,
        sunY: 45,
        morningGoldenStart: '06:00',
        morningGoldenEnd: '07:00',
        eveningGoldenStart: '18:00',
        eveningGoldenEnd: '19:00',
        solarNoonStr: '12:30',
        currentPhase: 'Daylight',
        goldenHourStatus: 'Golden hour at dusk',
        isGoldenHourActive: false,
        dayLengthStr: '12h 00m',
      };
    }

    const sunrise = new Date(sunriseStr);
    const sunset = new Date(sunsetStr);
    const now = currentTime;

    const totalDayMs = sunset.getTime() - sunrise.getTime();
    const elapsedDayMs = now.getTime() - sunrise.getTime();

    // Morning Golden Hour: Sunrise to Sunrise + 60m
    const mornGStart = new Date(sunrise);
    const mornGEnd = new Date(sunrise.getTime() + 60 * 60 * 1000);

    // Evening Golden Hour: Sunset - 60m to Sunset
    const eveGStart = new Date(sunset.getTime() - 60 * 60 * 1000);
    const eveGEnd = new Date(sunset);

    // Solar Noon: Center point
    const solarNoon = new Date(sunrise.getTime() + totalDayMs / 2);

    // Day length
    const totalDayMins = Math.max(0, Math.round(totalDayMs / (60 * 1000)));
    const dayHours = Math.floor(totalDayMins / 60);
    const dayMins = totalDayMins % 60;
    const dayLengthStr = `${dayHours}h ${dayMins}m`;

    // Progress 0% (sunrise) -> 100% (sunset)
    let progressPct = 0;
    let isGoldenHourActive = false;
    let goldenHourStatus = '';
    let currentPhase = 'Daylight';

    if (now < sunrise) {
      // Pre-dawn night
      currentPhase = 'Astronomical Dawn / Night';
      const minsToSunrise = Math.round((sunrise.getTime() - now.getTime()) / (60 * 1000));
      const hrs = Math.floor(minsToSunrise / 60);
      const mins = minsToSunrise % 60;
      goldenHourStatus = `Morning Golden Hour in ${hrs > 0 ? `${hrs}h ` : ''}${mins}m`;
      progressPct = 0;
    } else if (now >= sunrise && now <= mornGEnd) {
      // Morning golden hour
      currentPhase = 'Morning Golden Hour';
      isGoldenHourActive = true;
      const leftMins = Math.round((mornGEnd.getTime() - now.getTime()) / (60 * 1000));
      goldenHourStatus = `Active Morning Golden Hour (${leftMins}m left)`;
      progressPct = Math.max(0, Math.min(100, (elapsedDayMs / totalDayMs) * 100));
    } else if (now > mornGEnd && now < eveGStart) {
      // Standard daylight
      currentPhase = 'Full Daylight';
      const minsToEve = Math.round((eveGStart.getTime() - now.getTime()) / (60 * 1000));
      const hrs = Math.floor(minsToEve / 60);
      const mins = minsToEve % 60;
      goldenHourStatus = `Evening Golden Hour in ${hrs > 0 ? `${hrs}h ` : ''}${mins}m`;
      progressPct = Math.max(0, Math.min(100, (elapsedDayMs / totalDayMs) * 100));
    } else if (now >= eveGStart && now <= sunset) {
      // Evening golden hour
      currentPhase = 'Evening Golden Hour';
      isGoldenHourActive = true;
      const leftMins = Math.round((sunset.getTime() - now.getTime()) / (60 * 1000));
      goldenHourStatus = `Active Evening Golden Hour (${leftMins}m left)`;
      progressPct = Math.max(0, Math.min(100, (elapsedDayMs / totalDayMs) * 100));
    } else {
      // Post-sunset night
      currentPhase = 'Night Phase';
      goldenHourStatus = 'Golden Hour completed for today';
      progressPct = 100;
    }

    // Arc geometry calculations
    // Arc is rendered from X=30 to X=270 (Width=300, Height=100)
    // Parabola: Y = 90 - 75 * sin(progress * PI)
    const arcStartX = 30;
    const arcEndX = 270;
    const arcWidth = arcEndX - arcStartX;
    
    // Normalized 0..1 along arc
    const t = Math.max(0, Math.min(1, progressPct / 100));
    const sunX = arcStartX + t * arcWidth;
    const sunY = 90 - 75 * Math.sin(t * Math.PI);

    const fmt = (d: Date) => formatTime(d.toISOString());

    return {
      progressPct,
      sunX,
      sunY,
      morningGoldenStart: fmt(mornGStart),
      morningGoldenEnd: fmt(mornGEnd),
      eveningGoldenStart: fmt(eveGStart),
      eveningGoldenEnd: fmt(eveGEnd),
      solarNoonStr: fmt(solarNoon),
      currentPhase,
      goldenHourStatus,
      isGoldenHourActive,
      dayLengthStr,
    };
  }, [sunriseStr, sunsetStr, currentTime]);

  return (
    <div className="w-full max-w-md mx-auto px-4 py-2 relative z-20">
      <div 
        id="sun-path-visualizer"
        className="rounded-3xl p-5 bg-slate-900/80 backdrop-blur-xl border border-white/10 shadow-2xl relative overflow-hidden"
      >
        {/* Ambient Top Glow */}
        <div className={`absolute -top-12 inset-x-0 h-28 blur-[50px] pointer-events-none opacity-20 ${
          solarData.isGoldenHourActive 
            ? 'bg-amber-400' 
            : isDay 
            ? 'bg-amber-500' 
            : 'bg-indigo-600'
        }`} />

        {/* Card Header */}
        <div className="flex items-center justify-between gap-2 pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Camera size={16} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-semibold text-sm text-white">Golden Hour & Sun Path</h3>
                {solarData.isGoldenHourActive && (
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase animate-pulse">
                    Active
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Celestial trajectory & photography windows
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-mono text-slate-400 block">DAYLIGHT</span>
            <span className="text-xs font-mono font-bold text-cyan-300">{solarData.dayLengthStr}</span>
          </div>
        </div>

        {/* Status Indicator Banner */}
        <div className={`mt-3 p-2.5 rounded-2xl flex items-center justify-between gap-2 border ${
          solarData.isGoldenHourActive
            ? 'bg-amber-950/50 border-amber-500/40 text-amber-200'
            : 'bg-slate-950/60 border-white/5 text-slate-300'
        }`}>
          <div className="flex items-center gap-2 text-xs">
            <Sparkles size={14} className={solarData.isGoldenHourActive ? 'text-amber-400 animate-spin' : 'text-amber-400/70'} />
            <span className="font-semibold text-white">{solarData.goldenHourStatus}</span>
          </div>
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="text-slate-400 hover:text-slate-200 text-xs font-mono shrink-0"
          >
            <Info size={14} />
          </button>
        </div>

        {/* Information Accordion */}
        {showInfo && (
          <div className="mt-2.5 p-2.5 rounded-2xl bg-slate-950/80 border border-amber-500/30 text-[11px] text-slate-300 space-y-1 animate-in fade-in duration-200">
            <p className="text-slate-300 leading-relaxed text-[10px]">
              <strong className="text-amber-300">Golden Hour</strong> occurs when the sun sits between 6° below and 6° above the horizon. Light travels through more atmosphere, creating diffuse warm amber tones ideal for portraits and outdoor photography.
            </p>
          </div>
        )}

        {/* Dynamic SVG Sun Path Parabola Arc */}
        <div className="relative mt-3 pt-2">
          <svg className="w-full h-32 overflow-visible" viewBox="0 0 300 110">
            <defs>
              {/* Golden Hour Gradient */}
              <linearGradient id="arcGlowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                <stop offset="15%" stopColor="#fbbf24" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#fef08a" stopOpacity="0.4" />
                <stop offset="85%" stopColor="#f97316" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#ea580c" stopOpacity="0.8" />
              </linearGradient>

              {/* Shaded Horizon Gradient */}
              <linearGradient id="horizonFill" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(245, 158, 11, 0.08)" />
                <stop offset="100%" stopColor="rgba(15, 23, 42, 0)" />
              </linearGradient>

              {/* Sun Glow Filter */}
              <filter id="sunGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Horizon baseline */}
            <line x1="15" y1="90" x2="285" y2="90" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="1" strokeDasharray="3 3" />

            {/* Shaded Area under arc */}
            <path
              d="M 30 90 Q 150 -10 270 90 Z"
              fill="url(#horizonFill)"
            />

            {/* Full 24-Hour Celestial Path (Dotted) */}
            <path
              d="M 30 90 Q 150 -10 270 90"
              fill="none"
              stroke="rgba(255, 255, 255, 0.15)"
              strokeWidth="2"
              strokeDasharray="4 4"
            />

            {/* Active Golden Hour Highlight Zones on Arc */}
            {/* Morning Golden Segment (0% to ~15%) */}
            <path
              d="M 30 90 Q 66 50 85 40"
              fill="none"
              stroke="#fbbf24"
              strokeWidth="4"
              strokeLinecap="round"
              opacity="0.85"
            />
            {/* Evening Golden Segment (~85% to 100%) */}
            <path
              d="M 215 40 Q 234 50 270 90"
              fill="none"
              stroke="#f97316"
              strokeWidth="4"
              strokeLinecap="round"
              opacity="0.85"
            />

            {/* Solar Noon Peak Marker */}
            <circle cx="150" cy="15" r="3" fill="#fef08a" opacity="0.6" />
            <text x="150" y="8" fill="#94a3b8" fontSize="8" fontFamily="monospace" textAnchor="middle">
              Solar Noon ({solarData.solarNoonStr})
            </text>

            {/* Dynamic Real-time Sun Marker */}
            <g transform={`translate(${solarData.sunX}, ${solarData.sunY})`}>
              {/* Radiating pulse ring */}
              <circle cx="0" cy="0" r="10" fill="none" stroke="#f59e0b" strokeWidth="1.5" opacity="0.4" className="animate-ping" />
              <circle cx="0" cy="0" r="7" fill={isDay ? '#f59e0b' : '#38bdf8'} filter="url(#sunGlow)" />
              <circle cx="0" cy="0" r="3.5" fill="#ffffff" />
            </g>

            {/* Sunrise Point Label */}
            <text x="30" y="104" fill="#fbbf24" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
              {formatTime(sunriseStr)}
            </text>
            <text x="30" y="112" fill="#64748b" fontSize="7" fontFamily="monospace" textAnchor="middle">
              Sunrise
            </text>

            {/* Sunset Point Label */}
            <text x="270" y="104" fill="#f97316" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
              {formatTime(sunsetStr)}
            </text>
            <text x="270" y="112" fill="#64748b" fontSize="7" fontFamily="monospace" textAnchor="middle">
              Sunset
            </text>

            {/* Golden Hour badges in SVG */}
            <text x="58" y="28" fill="#fbbf24" fontSize="7.5" fontFamily="monospace" opacity="0.9">
              Morning Golden
            </text>
            <text x="242" y="28" fill="#f97316" fontSize="7.5" fontFamily="monospace" textAnchor="end" opacity="0.9">
              Evening Golden
            </text>
          </svg>
        </div>

        {/* 2 Golden Hour Photography Cards Grid */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-white/10 text-xs">
          
          {/* Morning Window */}
          <div className="p-2.5 rounded-2xl bg-slate-950/60 border border-amber-500/20 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-amber-300 font-bold uppercase flex items-center gap-1">
                <Sunrise size={12} className="text-amber-400" />
                Morning
              </span>
              <span className="text-[9px] font-mono text-slate-500">60m span</span>
            </div>
            <div className="mt-1 font-mono font-semibold text-white text-xs">
              {solarData.morningGoldenStart} — {solarData.morningGoldenEnd}
            </div>
            <span className="text-[9px] text-slate-400 font-mono mt-0.5">
              Soft gold, low shadows
            </span>
          </div>

          {/* Evening Window */}
          <div className="p-2.5 rounded-2xl bg-slate-950/60 border border-orange-500/20 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-orange-300 font-bold uppercase flex items-center gap-1">
                <Sunset size={12} className="text-orange-400" />
                Evening
              </span>
              <span className="text-[9px] font-mono text-slate-500">60m span</span>
            </div>
            <div className="mt-1 font-mono font-semibold text-white text-xs">
              {solarData.eveningGoldenStart} — {solarData.eveningGoldenEnd}
            </div>
            <span className="text-[9px] text-slate-400 font-mono mt-0.5">
              Warm amber & crimson
            </span>
          </div>

        </div>

      </div>
    </div>
  );
}
