import { useState, useMemo } from 'react';
import { 
  Activity, 
  Wind, 
  Droplets, 
  Flame, 
  ShieldAlert, 
  ShieldCheck, 
  Footprints,
  Info,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { CurrentWeatherData, DailyWeatherData, SpeedUnit, TempUnit } from '../types';
import { formatSpeed, formatTemp } from '../utils/weatherUtils';

interface PitchAndPlayCardProps {
  current: CurrentWeatherData;
  daily: DailyWeatherData;
  tempUnit: TempUnit;
  speedUnit: SpeedUnit;
}

interface SportProfile {
  id: string;
  name: string;
  emoji: string;
  suitability: 'optimal' | 'moderate' | 'caution' | 'poor';
  score: number; // 0 - 100
  insight: string;
  keyFactor: string;
}

export function PitchAndPlayCard({
  current,
  daily,
  tempUnit,
  speedUnit,
}: PitchAndPlayCardProps) {
  const [selectedSport, setSelectedSport] = useState<string>('soccer');
  const [showDewInfo, setShowDewInfo] = useState(false);

  // Compute Dew Point (Magnus-Tetens approximation)
  const dewPoint = useMemo(() => {
    const T = current.temperature_2m;
    const RH = Math.max(1, Math.min(100, current.relative_humidity_2m));
    const a = 17.27;
    const b = 237.7;
    const alpha = ((a * T) / (b + T)) + Math.log(RH / 100);
    const dp = (b * alpha) / (a - alpha);
    return Math.round(dp * 10) / 10;
  }, [current.temperature_2m, current.relative_humidity_2m]);

  // Dew spread (Ambient - Dewpoint)
  const dewSpread = current.temperature_2m - dewPoint;
  const precipProb = daily.precipitation_probability_max?.[0] ?? 0;
  const windSpeedKmh = current.wind_speed_10m;
  const uvMax = daily.uv_index_max?.[0] ?? 0;

  // Outdoor Pitch Analysis Assessment
  const pitchAnalysis = useMemo(() => {
    let playScore = 100;
    let headlineStatus = 'Optimal for outdoor sports';
    let statusTone: 'success' | 'warning' | 'danger' = 'success';
    let dewWarning = 'Dry turf & reliable footing';
    let windImpact = 'Calm airflow, true ball flight';

    // 1. Rain deduction
    if (precipProb > 60 || current.precipitation > 0.5) {
      playScore -= 50;
      headlineStatus = 'Rain expected — stay indoors';
      statusTone = 'danger';
    } else if (precipProb > 30) {
      playScore -= 20;
      headlineStatus = 'Scattered showers risk — check radar';
      statusTone = 'warning';
    }

    // 2. Wind deduction
    if (windSpeedKmh > 35) {
      playScore -= 30;
      headlineStatus = 'High wind — expect heavy swing';
      statusTone = 'danger';
      windImpact = `Heavy drift (${formatSpeed(windSpeedKmh, speedUnit)}) — severe ball deflection`;
    } else if (windSpeedKmh > 20) {
      playScore -= 15;
      if (statusTone !== 'danger') {
        headlineStatus = 'Breezy — noticeable ball deflection';
        statusTone = 'warning';
      }
      windImpact = `Moderate gusts (${formatSpeed(windSpeedKmh, speedUnit)}) — adjust arc & serve`;
    } else {
      windImpact = `Light air (${formatSpeed(windSpeedKmh, speedUnit)}) — predictable trajectory`;
    }

    // 3. Dew & Turf Traction
    if (dewSpread <= 2.2 || current.relative_humidity_2m >= 88) {
      playScore -= 15;
      dewWarning = 'Dew alert: Grass/turf is wet & slick';
      if (statusTone === 'success') {
        headlineStatus = 'Dew alert — slick ground in evening';
        statusTone = 'warning';
      }
    } else if (dewSpread <= 4.0) {
      dewWarning = 'Mild moisture forming at dusk';
    } else {
      dewWarning = 'Dry surface with maximum traction';
    }

    // 4. Extreme Temperatures / UV
    if (current.temperature_2m > 34) {
      playScore -= 20;
      headlineStatus = 'Extreme heat stress — hydrate frequently';
      statusTone = 'danger';
    } else if (current.temperature_2m < 2) {
      playScore -= 20;
      headlineStatus = 'Freezing pitch — hard ground hazard';
      statusTone = 'warning';
    }

    const finalScore = Math.max(10, Math.min(100, Math.round(playScore)));

    return {
      score: finalScore,
      headlineStatus,
      statusTone,
      dewWarning,
      windImpact,
    };
  }, [precipProb, current.precipitation, windSpeedKmh, dewSpread, current.relative_humidity_2m, current.temperature_2m, speedUnit]);

  // Sport-specific Profiles
  const sportProfiles: SportProfile[] = useMemo(() => {
    return [
      {
        id: 'soccer',
        name: 'Football / Soccer',
        emoji: '⚽',
        suitability: pitchAnalysis.score >= 80 ? 'optimal' : pitchAnalysis.score >= 50 ? 'moderate' : 'caution',
        score: pitchAnalysis.score,
        keyFactor: dewSpread <= 2.2 ? 'Slick turf & faster ball skid' : 'High pitch traction',
        insight: windSpeedKmh > 25 ? 'Long balls and crosses will drift significantly.' : 'Firm pitch with optimal passing cadence.',
      },
      {
        id: 'tennis',
        name: 'Tennis & Padel',
        emoji: '🎾',
        suitability: windSpeedKmh > 28 || precipProb > 40 ? 'poor' : windSpeedKmh > 16 ? 'moderate' : 'optimal',
        score: Math.max(10, Math.min(100, 100 - (windSpeedKmh * 1.5) - (precipProb * 0.8))),
        keyFactor: windSpeedKmh > 18 ? 'Cross-court wind drift' : 'Crisp bounce',
        insight: windSpeedKmh > 20 ? 'High wind disrupts topspin and baseline precision.' : 'Optimal conditions for baseline rallies and serves.',
      },
      {
        id: 'running',
        name: 'Running & Cardio',
        emoji: '🏃',
        suitability: current.temperature_2m > 32 || precipProb > 70 ? 'caution' : 'optimal',
        score: Math.max(15, Math.min(100, 95 - (current.temperature_2m > 25 ? (current.temperature_2m - 25) * 3 : 0) - (precipProb * 0.5))),
        keyFactor: `Pace comfort: ${current.relative_humidity_2m}% RH`,
        insight: current.temperature_2m > 26 ? 'Higher cardiac drift; keep hydration handy.' : 'Cool ambient air ideal for tempo runs and intervals.',
      },
      {
        id: 'golf',
        name: 'Golf',
        emoji: '⛳',
        suitability: windSpeedKmh > 30 || precipProb > 50 ? 'poor' : windSpeedKmh > 18 ? 'moderate' : 'optimal',
        score: Math.max(10, Math.min(100, 100 - (windSpeedKmh * 1.8) - (precipProb * 0.7))),
        keyFactor: dewSpread <= 2.2 ? 'Greens slow due to morning/evening dew' : 'Fast rolling greens',
        insight: windSpeedKmh > 20 ? 'Account for 1-2 extra club lengths on upwind shots.' : 'Clean air density and stable ball flight.',
      },
      {
        id: 'basketball',
        name: 'Street Basketball',
        emoji: '🏀',
        suitability: precipProb > 30 || windSpeedKmh > 25 ? 'caution' : 'optimal',
        score: Math.max(10, Math.min(100, 100 - (windSpeedKmh * 1.6) - (precipProb * 1.1))),
        keyFactor: windSpeedKmh > 18 ? 'Arc deflection on perimeter shots' : 'True arc on jumpers',
        insight: dewSpread <= 2.5 ? 'Concrete court may be slick under moisture.' : 'Dry court surface with full grip.',
      },
    ];
  }, [pitchAnalysis.score, dewSpread, windSpeedKmh, precipProb, current.temperature_2m, current.relative_humidity_2m]);

  const activeSport = sportProfiles.find(s => s.id === selectedSport) || sportProfiles[0];

  return (
    <div className="w-full max-w-md mx-auto px-4 py-2 relative z-20">
      <div 
        id="pitch-and-play-card"
        className="rounded-3xl p-5 bg-slate-900/80 backdrop-blur-xl border border-white/10 shadow-2xl relative overflow-hidden transition-all"
      >
        {/* Subtle accent glow */}
        <div 
          className={`absolute -right-10 -top-10 w-36 h-36 rounded-full blur-[60px] pointer-events-none opacity-20 ${
            pitchAnalysis.statusTone === 'success' ? 'bg-emerald-500' :
            pitchAnalysis.statusTone === 'warning' ? 'bg-amber-500' : 'bg-rose-500'
          }`}
        />

        {/* Card Header */}
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Activity size={16} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-semibold text-sm text-white">Pitch & Play Index</h3>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 uppercase">
                  Outdoor
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Real-time sports & field playability
              </p>
            </div>
          </div>

          {/* Overall Match Playability Score Badge */}
          <div className="flex items-center gap-2">
            <div className="text-right">
              <div className="font-display font-black text-lg text-white leading-none">
                {pitchAnalysis.score}<span className="text-[11px] font-normal text-slate-400">/100</span>
              </div>
              <span className={`text-[9px] font-mono font-semibold uppercase ${
                pitchAnalysis.statusTone === 'success' ? 'text-emerald-400' :
                pitchAnalysis.statusTone === 'warning' ? 'text-amber-400' : 'text-rose-400'
              }`}>
                {pitchAnalysis.score >= 80 ? 'Optimal' : pitchAnalysis.score >= 50 ? 'Fair' : 'Challenging'}
              </span>
            </div>
          </div>
        </div>

        {/* Status Banner */}
        <div className={`mt-3 p-2.5 rounded-2xl flex items-center justify-between gap-2 border ${
          pitchAnalysis.statusTone === 'success' 
            ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200' 
            : pitchAnalysis.statusTone === 'warning'
            ? 'bg-amber-950/40 border-amber-500/30 text-amber-200'
            : 'bg-rose-950/40 border-rose-500/30 text-rose-200'
        }`}>
          <div className="flex items-center gap-2">
            {pitchAnalysis.statusTone === 'success' ? (
              <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
            ) : (
              <ShieldAlert size={16} className="text-amber-400 shrink-0" />
            )}
            <span className="text-xs font-semibold">{pitchAnalysis.headlineStatus}</span>
          </div>
        </div>

        {/* 3 Core Outdoor Field Metrics */}
        <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
          
          {/* Dew Point & Turf Wetness */}
          <div 
            onClick={() => setShowDewInfo(!showDewInfo)}
            className="p-2.5 rounded-2xl bg-slate-950/60 border border-white/5 flex flex-col justify-between cursor-pointer hover:border-cyan-500/30 transition-all group"
          >
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-mono">DEW POINT</span>
              <Droplets size={12} className="text-cyan-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="mt-1 font-mono font-bold text-sm text-white">
              {formatTemp(dewPoint, tempUnit)}
            </div>
            <span className="text-[9px] font-mono text-slate-400 truncate mt-0.5">
              {dewSpread <= 2.2 ? '💧 Slick grass' : '⚡ Dry turf'}
            </span>
          </div>

          {/* Wind Speed & Ball Deflection */}
          <div className="p-2.5 rounded-2xl bg-slate-950/60 border border-white/5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-mono">WIND SWING</span>
              <Wind size={12} className="text-teal-400" />
            </div>
            <div className="mt-1 font-mono font-bold text-sm text-white">
              {formatSpeed(windSpeedKmh, speedUnit)}
            </div>
            <span className="text-[9px] font-mono text-slate-400 truncate mt-0.5">
              {windSpeedKmh > 25 ? '💨 Heavy drift' : windSpeedKmh > 12 ? '🍃 Light curve' : '🎯 True path'}
            </span>
          </div>

          {/* Rain / Surface Imminence */}
          <div className="p-2.5 rounded-2xl bg-slate-950/60 border border-white/5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-mono">RAIN RISK</span>
              <Flame size={12} className="text-amber-400" />
            </div>
            <div className="mt-1 font-mono font-bold text-sm text-white">
              {precipProb}%
            </div>
            <span className="text-[9px] font-mono text-slate-400 truncate mt-0.5">
              {precipProb > 50 ? '☔ Indoor rec' : precipProb > 20 ? '☁️ Low hazard' : '☀️ Clean pitch'}
            </span>
          </div>

        </div>

        {/* Interactive Dew Point Tooltip Accordion */}
        {showDewInfo && (
          <div className="mt-2.5 p-2.5 rounded-2xl bg-slate-950/80 border border-cyan-500/30 text-[11px] text-slate-300 space-y-1 animate-in fade-in duration-200">
            <div className="flex items-center gap-1.5 text-cyan-300 font-semibold font-mono">
              <Info size={12} />
              <span>How Dew Point Predicts Pitch Slickness</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[10px]">
              When the air temp cools toward the dew point ({formatTemp(dewPoint, tempUnit)}), ambient humidity condenses on grass blades and court surfaces. A dew spread under 2.5°C creates high-speed ball skid and slippery footwear footing.
            </p>
          </div>
        )}

        {/* Sports Horizontal Selector Tabs */}
        <div className="mt-3.5 pt-3 border-t border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono font-semibold text-slate-300 flex items-center gap-1">
              <Footprints size={12} className="text-emerald-400" />
              Sport-Specific Compatibility
            </span>
            <span className="text-[10px] font-mono text-slate-500">Tap sport to inspect</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {sportProfiles.map((sport) => {
              const isSelected = selectedSport === sport.id;
              return (
                <button
                  key={sport.id}
                  onClick={() => setSelectedSport(sport.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium flex items-center gap-1.5 transition-all shrink-0 border ${
                    isSelected
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200 shadow-sm'
                      : 'bg-slate-950/50 border-white/5 text-slate-400 hover:text-slate-200 hover:border-white/15'
                  }`}
                >
                  <span>{sport.emoji}</span>
                  <span className="whitespace-nowrap text-[11px]">{sport.name.split('/')[0].trim()}</span>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    sport.suitability === 'optimal' ? 'bg-emerald-400' :
                    sport.suitability === 'moderate' ? 'bg-amber-400' : 'bg-rose-400'
                  }`} />
                </button>
              );
            })}
          </div>

          {/* Active Sport Detail Card */}
          <div className="mt-2.5 p-3 rounded-2xl bg-slate-950/70 border border-white/5 flex items-start gap-3">
            <div className="text-2xl pt-0.5">{activeSport.emoji}</div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-white">{activeSport.name}</span>
                <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md ${
                  activeSport.suitability === 'optimal' ? 'bg-emerald-500/20 text-emerald-300' :
                  activeSport.suitability === 'moderate' ? 'bg-amber-500/20 text-amber-300' :
                  'bg-rose-500/20 text-rose-300'
                }`}>
                  {activeSport.suitability}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">
                {activeSport.insight}
              </p>
              <div className="flex items-center gap-1 text-[10px] font-mono text-cyan-400 pt-0.5">
                <Sparkles size={10} />
                <span>{activeSport.keyFactor}</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
