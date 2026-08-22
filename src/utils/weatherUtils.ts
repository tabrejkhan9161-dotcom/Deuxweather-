import { TempUnit, SpeedUnit, CurrentAQIData, PollutantDetail, WeatherTheme } from '../types';

export interface WeatherConditionMeta {
  code: number;
  label: string;
  category: 'clear' | 'cloudy' | 'rain' | 'snow' | 'storm' | 'fog';
  icon: string; // Lucide icon identifier
  theme: WeatherTheme;
}

export function getWeatherCondition(code: number, isDay: number = 1): WeatherConditionMeta {
  const day = isDay === 1;

  switch (code) {
    case 0:
      return {
        code,
        label: day ? 'Clear Sky' : 'Clear Night',
        category: 'clear',
        icon: day ? 'Sun' : 'Moon',
        theme: {
          category: 'clear',
          label: day ? 'Sunny & Clear' : 'Starlit Night',
          bgGradient: day 
            ? 'from-sky-900/40 via-slate-900/60 to-amber-950/20' 
            : 'from-indigo-950/50 via-slate-950/80 to-blue-950/30',
          accentGlow: day ? 'rgba(251, 191, 36, 0.15)' : 'rgba(129, 140, 248, 0.12)',
          primaryColor: day ? '#f59e0b' : '#818cf8',
          particleType: day ? 'sun' : 'stars',
        },
      };

    case 1:
      return {
        code,
        label: day ? 'Mainly Clear' : 'Mostly Clear',
        category: 'clear',
        icon: day ? 'SunMedium' : 'MoonStar',
        theme: {
          category: 'clear',
          label: day ? 'Mainly Sunny' : 'Clear Night',
          bgGradient: day 
            ? 'from-blue-900/40 via-slate-900/60 to-cyan-950/30' 
            : 'from-indigo-950/50 via-slate-950/80 to-slate-900/40',
          accentGlow: day ? 'rgba(56, 189, 248, 0.15)' : 'rgba(99, 102, 241, 0.12)',
          primaryColor: day ? '#38bdf8' : '#6366f1',
          particleType: day ? 'sun' : 'stars',
        },
      };

    case 2:
      return {
        code,
        label: 'Partly Cloudy',
        category: 'cloudy',
        icon: day ? 'CloudSun' : 'CloudMoon',
        theme: {
          category: 'cloudy',
          label: 'Partly Cloudy',
          bgGradient: day 
            ? 'from-slate-800/40 via-slate-900/70 to-blue-950/30' 
            : 'from-slate-950/60 via-slate-900/80 to-indigo-950/40',
          accentGlow: 'rgba(148, 163, 184, 0.12)',
          primaryColor: '#94a3b8',
          particleType: 'clouds',
        },
      };

    case 3:
      return {
        code,
        label: 'Overcast',
        category: 'cloudy',
        icon: 'Cloud',
        theme: {
          category: 'cloudy',
          label: 'Overcast Skies',
          bgGradient: 'from-slate-800/50 via-slate-900/70 to-zinc-950/40',
          accentGlow: 'rgba(100, 116, 139, 0.15)',
          primaryColor: '#64748b',
          particleType: 'clouds',
        },
      };

    case 45:
    case 48:
      return {
        code,
        label: code === 45 ? 'Foggy' : 'Rime Fog',
        category: 'fog',
        icon: 'CloudFog',
        theme: {
          category: 'fog',
          label: 'Atmospheric Fog',
          bgGradient: 'from-slate-800/60 via-slate-900/80 to-teal-950/30',
          accentGlow: 'rgba(45, 212, 191, 0.1)',
          primaryColor: '#2dd4bf',
          particleType: 'fog',
        },
      };

    case 51:
    case 53:
    case 55:
      return {
        code,
        label: code === 51 ? 'Light Drizzle' : code === 53 ? 'Moderate Drizzle' : 'Dense Drizzle',
        category: 'rain',
        icon: 'CloudDrizzle',
        theme: {
          category: 'rain',
          label: 'Drizzle',
          bgGradient: 'from-cyan-950/50 via-slate-900/70 to-blue-950/40',
          accentGlow: 'rgba(6, 182, 212, 0.15)',
          primaryColor: '#06b6d4',
          particleType: 'rain',
        },
      };

    case 56:
    case 57:
      return {
        code,
        label: 'Freezing Drizzle',
        category: 'snow',
        icon: 'CloudHail',
        theme: {
          category: 'snow',
          label: 'Freezing Drizzle',
          bgGradient: 'from-cyan-950/50 via-slate-900/70 to-slate-950/50',
          accentGlow: 'rgba(165, 243, 252, 0.15)',
          primaryColor: '#a5f3fc',
          particleType: 'snow',
        },
      };

    case 61:
    case 63:
    case 65:
      return {
        code,
        label: code === 61 ? 'Slight Rain' : code === 63 ? 'Moderate Rain' : 'Heavy Rain',
        category: 'rain',
        icon: 'CloudRain',
        theme: {
          category: 'rain',
          label: 'Precipitation',
          bgGradient: 'from-blue-950/60 via-slate-900/80 to-cyan-950/40',
          accentGlow: 'rgba(14, 165, 233, 0.18)',
          primaryColor: '#0ea5e9',
          particleType: 'rain',
        },
      };

    case 66:
    case 67:
      return {
        code,
        label: 'Freezing Rain',
        category: 'rain',
        icon: 'CloudHail',
        theme: {
          category: 'rain',
          label: 'Freezing Rain',
          bgGradient: 'from-sky-950/60 via-slate-900/80 to-indigo-950/40',
          accentGlow: 'rgba(56, 189, 248, 0.18)',
          primaryColor: '#38bdf8',
          particleType: 'rain',
        },
      };

    case 71:
    case 73:
    case 75:
    case 77:
      return {
        code,
        label: code === 71 ? 'Light Snow' : code === 73 ? 'Moderate Snow' : code === 75 ? 'Heavy Snow' : 'Snow Grains',
        category: 'snow',
        icon: 'CloudSnow',
        theme: {
          category: 'snow',
          label: 'Snowfall',
          bgGradient: 'from-slate-800/50 via-slate-900/70 to-cyan-950/30',
          accentGlow: 'rgba(224, 242, 254, 0.18)',
          primaryColor: '#e0f2fe',
          particleType: 'snow',
        },
      };

    case 80:
    case 81:
    case 82:
      return {
        code,
        label: code === 80 ? 'Light Showers' : code === 81 ? 'Moderate Showers' : 'Violent Showers',
        category: 'rain',
        icon: 'CloudRainWind',
        theme: {
          category: 'rain',
          label: 'Rain Showers',
          bgGradient: 'from-blue-950/60 via-slate-900/80 to-slate-950/60',
          accentGlow: 'rgba(59, 130, 246, 0.18)',
          primaryColor: '#3b82f6',
          particleType: 'rain',
        },
      };

    case 85:
    case 86:
      return {
        code,
        label: code === 85 ? 'Snow Showers' : 'Heavy Snow Showers',
        category: 'snow',
        icon: 'CloudSnow',
        theme: {
          category: 'snow',
          label: 'Snow Showers',
          bgGradient: 'from-slate-900/60 via-blue-950/40 to-slate-950/70',
          accentGlow: 'rgba(186, 230, 253, 0.18)',
          primaryColor: '#bae6fd',
          particleType: 'snow',
        },
      };

    case 95:
    case 96:
    case 99:
      return {
        code,
        label: code === 95 ? 'Thunderstorm' : 'Severe Thunderstorm & Hail',
        category: 'storm',
        icon: 'CloudLightning',
        theme: {
          category: 'storm',
          label: 'Thunderstorm Active',
          bgGradient: 'from-purple-950/60 via-slate-900/80 to-blue-950/50',
          accentGlow: 'rgba(168, 85, 247, 0.22)',
          primaryColor: '#c084fc',
          particleType: 'lightning',
        },
      };

    default:
      return {
        code,
        label: 'Clear',
        category: 'clear',
        icon: 'Sun',
        theme: {
          category: 'clear',
          label: 'Clear',
          bgGradient: 'from-slate-900/50 via-slate-900/80 to-slate-950/60',
          accentGlow: 'rgba(56, 189, 248, 0.12)',
          primaryColor: '#38bdf8',
          particleType: 'sun',
        },
      };
  }
}

export function convertTemp(celsius: number, unit: TempUnit): number {
  if (unit === 'F') {
    return Math.round((celsius * 9) / 5 + 32);
  }
  return Math.round(celsius);
}

export function formatTemp(celsius: number, unit: TempUnit): string {
  const val = convertTemp(celsius, unit);
  return `${val}°${unit}`;
}

export function convertSpeed(kmh: number, unit: SpeedUnit): number {
  if (unit === 'mph') {
    return Math.round(kmh * 0.621371 * 10) / 10;
  }
  if (unit === 'm/s') {
    return Math.round((kmh / 3.6) * 10) / 10;
  }
  return Math.round(kmh * 10) / 10;
}

export function formatSpeed(kmh: number, unit: SpeedUnit): string {
  const val = convertSpeed(kmh, unit);
  return `${val} ${unit}`;
}

export function getAQILevel(usAqi: number): {
  level: string;
  category: 'Good' | 'Moderate' | 'Unhealthy for Sensitive' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous';
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  advice: string;
  outdoorStatus: string;
  maskRecommended: boolean;
  ventilationRecommended: boolean;
} {
  if (usAqi <= 50) {
    return {
      level: 'Good',
      category: 'Good',
      color: '#10b981', // Emerald
      bgColor: 'rgba(16, 185, 129, 0.15)',
      borderColor: 'rgba(16, 185, 129, 0.35)',
      textColor: 'text-emerald-400',
      advice: 'Air quality is satisfactory and poses little or no risk. Ideal for outdoor activities.',
      outdoorStatus: 'Perfect for outdoor exercise & recreation',
      maskRecommended: false,
      ventilationRecommended: true,
    };
  }
  if (usAqi <= 100) {
    return {
      level: 'Moderate',
      category: 'Moderate',
      color: '#f59e0b', // Amber
      bgColor: 'rgba(245, 158, 11, 0.15)',
      borderColor: 'rgba(245, 158, 11, 0.35)',
      textColor: 'text-amber-400',
      advice: 'Air quality is acceptable. Unusually sensitive individuals should consider limiting heavy outdoor exertion.',
      outdoorStatus: 'Acceptable for most individuals',
      maskRecommended: false,
      ventilationRecommended: true,
    };
  }
  if (usAqi <= 150) {
    return {
      level: 'Unhealthy for Sensitive',
      category: 'Unhealthy for Sensitive',
      color: '#f97316', // Orange
      bgColor: 'rgba(249, 115, 22, 0.15)',
      borderColor: 'rgba(249, 115, 22, 0.35)',
      textColor: 'text-orange-400',
      advice: 'Members of sensitive groups may experience health effects. General public is less likely to be affected.',
      outdoorStatus: 'Sensitive groups should reduce prolonged outdoor exertion',
      maskRecommended: false,
      ventilationRecommended: false,
    };
  }
  if (usAqi <= 200) {
    return {
      level: 'Unhealthy',
      category: 'Unhealthy',
      color: '#ef4444', // Red
      bgColor: 'rgba(239, 68, 68, 0.15)',
      borderColor: 'rgba(239, 68, 68, 0.35)',
      textColor: 'text-rose-400',
      advice: 'Everyone may begin to experience health effects. Sensitive groups may experience more serious health effects.',
      outdoorStatus: 'Avoid prolonged outdoor activities and exercise indoors',
      maskRecommended: true,
      ventilationRecommended: false,
    };
  }
  if (usAqi <= 300) {
    return {
      level: 'Very Unhealthy',
      category: 'Very Unhealthy',
      color: '#a855f7', // Purple
      bgColor: 'rgba(168, 85, 247, 0.15)',
      borderColor: 'rgba(168, 85, 247, 0.35)',
      textColor: 'text-purple-400',
      advice: 'Health alert: The risk of health effects is increased for everyone in the population.',
      outdoorStatus: 'Stay indoors with air purifiers active',
      maskRecommended: true,
      ventilationRecommended: false,
    };
  }
  return {
    level: 'Hazardous',
    category: 'Hazardous',
    color: '#881337', // Deep Maroon
    bgColor: 'rgba(136, 19, 55, 0.25)',
    borderColor: 'rgba(244, 63, 94, 0.45)',
    textColor: 'text-rose-300',
    advice: 'Health warning of emergency conditions. Entire population is most likely to be affected.',
    outdoorStatus: 'Strict indoor confinement advised. Use HEPA filtration.',
    maskRecommended: true,
    ventilationRecommended: false,
  };
}

export function getPollutantDetails(data: CurrentAQIData): PollutantDetail[] {
  return [
    {
      key: 'pm2_5',
      name: 'Fine Particles',
      formula: 'PM2.5',
      unit: 'µg/m³',
      value: Math.round((data.pm2_5 ?? 0) * 10) / 10,
      status: (data.pm2_5 ?? 0) <= 15 ? 'Good' : (data.pm2_5 ?? 0) <= 35 ? 'Moderate' : (data.pm2_5 ?? 0) <= 75 ? 'Unhealthy' : 'Hazardous',
      statusColor: (data.pm2_5 ?? 0) <= 15 ? 'text-emerald-400' : (data.pm2_5 ?? 0) <= 35 ? 'text-amber-400' : (data.pm2_5 ?? 0) <= 75 ? 'text-rose-400' : 'text-purple-400',
      statusBg: (data.pm2_5 ?? 0) <= 15 ? 'bg-emerald-500/20' : (data.pm2_5 ?? 0) <= 35 ? 'bg-amber-500/20' : (data.pm2_5 ?? 0) <= 75 ? 'bg-rose-500/20' : 'bg-purple-500/20',
      description: 'Microscopic inhalable airborne particles ≤ 2.5 µm that penetrate deep into lung tissue.',
      pctOfMax: Math.min(100, Math.round(((data.pm2_5 ?? 0) / 75) * 100)),
    },
    {
      key: 'pm10',
      name: 'Coarse Particles',
      formula: 'PM10',
      unit: 'µg/m³',
      value: Math.round((data.pm10 ?? 0) * 10) / 10,
      status: (data.pm10 ?? 0) <= 45 ? 'Good' : (data.pm10 ?? 0) <= 100 ? 'Moderate' : (data.pm10 ?? 0) <= 200 ? 'Unhealthy' : 'Hazardous',
      statusColor: (data.pm10 ?? 0) <= 45 ? 'text-emerald-400' : (data.pm10 ?? 0) <= 100 ? 'text-amber-400' : (data.pm10 ?? 0) <= 200 ? 'text-rose-400' : 'text-purple-400',
      statusBg: (data.pm10 ?? 0) <= 45 ? 'bg-emerald-500/20' : (data.pm10 ?? 0) <= 100 ? 'bg-amber-500/20' : (data.pm10 ?? 0) <= 200 ? 'bg-rose-500/20' : 'bg-purple-500/20',
      description: 'Dust, pollen, and mold fragments ≤ 10 µm that irritate respiratory passages.',
      pctOfMax: Math.min(100, Math.round(((data.pm10 ?? 0) / 150) * 100)),
    },
    {
      key: 'ozone',
      name: 'Ground Ozone',
      formula: 'O₃',
      unit: 'µg/m³',
      value: Math.round((data.ozone ?? 0) * 10) / 10,
      status: (data.ozone ?? 0) <= 60 ? 'Good' : (data.ozone ?? 0) <= 120 ? 'Moderate' : (data.ozone ?? 0) <= 180 ? 'Unhealthy' : 'Hazardous',
      statusColor: (data.ozone ?? 0) <= 60 ? 'text-emerald-400' : (data.ozone ?? 0) <= 120 ? 'text-amber-400' : (data.ozone ?? 0) <= 180 ? 'text-rose-400' : 'text-purple-400',
      statusBg: (data.ozone ?? 0) <= 60 ? 'bg-emerald-500/20' : (data.ozone ?? 0) <= 120 ? 'bg-amber-500/20' : (data.ozone ?? 0) <= 180 ? 'bg-rose-500/20' : 'bg-purple-500/20',
      description: 'Secondary gas created when sunlight triggers reactions with industrial emissions.',
      pctOfMax: Math.min(100, Math.round(((data.ozone ?? 0) / 180) * 100)),
    },
    {
      key: 'nitrogen_dioxide',
      name: 'Nitrogen Dioxide',
      formula: 'NO₂',
      unit: 'µg/m³',
      value: Math.round((data.nitrogen_dioxide ?? 0) * 10) / 10,
      status: (data.nitrogen_dioxide ?? 0) <= 40 ? 'Good' : (data.nitrogen_dioxide ?? 0) <= 90 ? 'Moderate' : (data.nitrogen_dioxide ?? 0) <= 180 ? 'Unhealthy' : 'Hazardous',
      statusColor: (data.nitrogen_dioxide ?? 0) <= 40 ? 'text-emerald-400' : (data.nitrogen_dioxide ?? 0) <= 90 ? 'text-amber-400' : (data.nitrogen_dioxide ?? 0) <= 180 ? 'text-rose-400' : 'text-purple-400',
      statusBg: (data.nitrogen_dioxide ?? 0) <= 40 ? 'bg-emerald-500/20' : (data.nitrogen_dioxide ?? 0) <= 90 ? 'bg-amber-500/20' : (data.nitrogen_dioxide ?? 0) <= 180 ? 'bg-rose-500/20' : 'bg-purple-500/20',
      description: 'Emissions primarily from combustion engines, vehicle traffic, and thermal power plants.',
      pctOfMax: Math.min(100, Math.round(((data.nitrogen_dioxide ?? 0) / 120) * 100)),
    },
    {
      key: 'sulphur_dioxide',
      name: 'Sulphur Dioxide',
      formula: 'SO₂',
      unit: 'µg/m³',
      value: Math.round((data.sulphur_dioxide ?? 0) * 10) / 10,
      status: (data.sulphur_dioxide ?? 0) <= 20 ? 'Good' : (data.sulphur_dioxide ?? 0) <= 80 ? 'Moderate' : (data.sulphur_dioxide ?? 0) <= 250 ? 'Unhealthy' : 'Hazardous',
      statusColor: (data.sulphur_dioxide ?? 0) <= 20 ? 'text-emerald-400' : (data.sulphur_dioxide ?? 0) <= 80 ? 'text-amber-400' : (data.sulphur_dioxide ?? 0) <= 250 ? 'text-rose-400' : 'text-purple-400',
      statusBg: (data.sulphur_dioxide ?? 0) <= 20 ? 'bg-emerald-500/20' : (data.sulphur_dioxide ?? 0) <= 80 ? 'bg-amber-500/20' : (data.sulphur_dioxide ?? 0) <= 250 ? 'bg-rose-500/20' : 'bg-purple-500/20',
      description: 'Precursor to acid rain produced by coal/oil burning and mineral smelting.',
      pctOfMax: Math.min(100, Math.round(((data.sulphur_dioxide ?? 0) / 100) * 100)),
    },
    {
      key: 'carbon_monoxide',
      name: 'Carbon Monoxide',
      formula: 'CO',
      unit: 'µg/m³',
      value: Math.round((data.carbon_monoxide ?? 0) * 10) / 10,
      status: (data.carbon_monoxide ?? 0) <= 4000 ? 'Good' : (data.carbon_monoxide ?? 0) <= 9000 ? 'Moderate' : (data.carbon_monoxide ?? 0) <= 15000 ? 'Unhealthy' : 'Hazardous',
      statusColor: (data.carbon_monoxide ?? 0) <= 4000 ? 'text-emerald-400' : (data.carbon_monoxide ?? 0) <= 9000 ? 'text-amber-400' : (data.carbon_monoxide ?? 0) <= 15000 ? 'text-rose-400' : 'text-purple-400',
      statusBg: (data.carbon_monoxide ?? 0) <= 4000 ? 'bg-emerald-500/20' : (data.carbon_monoxide ?? 0) <= 9000 ? 'bg-amber-500/20' : (data.carbon_monoxide ?? 0) <= 15000 ? 'bg-rose-500/20' : 'bg-purple-500/20',
      description: 'Colorless, odorless gas resulting from incomplete combustion of carbonaceous fuels.',
      pctOfMax: Math.min(100, Math.round(((data.carbon_monoxide ?? 0) / 10000) * 100)),
    },
  ];
}

export function getUVLevel(uv: number): {
  level: string;
  category: 'Low' | 'Moderate' | 'High' | 'Very High' | 'Extreme';
  color: string;
  advice: string;
} {
  if (uv < 3) {
    return {
      level: 'Low',
      category: 'Low',
      color: '#10b981',
      advice: 'Minimal sun protection needed. Safe outdoors.',
    };
  }
  if (uv < 6) {
    return {
      level: 'Moderate',
      category: 'Moderate',
      color: '#f59e0b',
      advice: 'Seek shade during midday hours. Apply SPF 30+ sunscreen.',
    };
  }
  if (uv < 8) {
    return {
      level: 'High',
      category: 'High',
      color: '#f97316',
      advice: 'Wear UV-blocking sunglasses, protective clothing, and SPF 50.',
    };
  }
  if (uv < 11) {
    return {
      level: 'Very High',
      category: 'Very High',
      color: '#ef4444',
      advice: 'Avoid sun between 10am - 4pm. Strict protection required.',
    };
  }
  return {
    level: 'Extreme',
    category: 'Extreme',
    color: '#a855f7',
    advice: 'Extreme UV radiation. Stay indoors or take full protective precautions.',
  };
}

export function formatTime(isoString: string): string {
  if (!isoString) return '--:--';
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  } catch {
    return isoString.split('T')[1]?.slice(0, 5) || isoString;
  }
}

export function formatDayName(dateString: string, isFirstDay = false): string {
  if (isFirstDay) return 'Today';
  try {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString([], { weekday: 'short' });
  } catch {
    return dateString;
  }
}

export function formatDateLabel(dateString: string): string {
  try {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  } catch {
    return dateString;
  }
}

export function getWindDirectionCompass(degrees?: number): string {
  if (degrees === undefined || isNaN(degrees)) return 'N';
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round((degrees % 360) / 22.5) % 16;
  return directions[index];
}
