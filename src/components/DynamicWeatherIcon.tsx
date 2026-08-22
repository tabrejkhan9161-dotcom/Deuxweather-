import { 
  Sun, 
  SunMedium, 
  Moon, 
  MoonStar, 
  Cloud, 
  CloudSun, 
  CloudMoon, 
  CloudRain, 
  CloudRainWind, 
  CloudDrizzle, 
  CloudSnow, 
  CloudLightning, 
  CloudFog, 
  CloudHail, 
  Wind,
  Droplets,
  Sparkles
} from 'lucide-react';

interface DynamicWeatherIconProps {
  name: string;
  size?: number;
  className?: string;
  glow?: boolean;
  glowColor?: string;
  animate?: boolean;
}

export function DynamicWeatherIcon({ 
  name, 
  size = 28, 
  className = '', 
  glow = false,
  glowColor = '#38bdf8',
  animate = true
}: DynamicWeatherIconProps) {
  const renderIcon = () => {
    switch (name) {
      case 'Sun':
        return <Sun size={size} className={`text-amber-400 ${animate ? 'animate-[spin_24s_linear_infinite]' : ''}`} />;
      case 'SunMedium':
        return <SunMedium size={size} className={`text-amber-300 ${animate ? 'animate-[pulse_3s_ease-in-out_infinite]' : ''}`} />;
      case 'Moon':
        return <Moon size={size} className="text-indigo-300" />;
      case 'MoonStar':
        return <MoonStar size={size} className="text-indigo-200" />;
      case 'CloudSun':
        return <CloudSun size={size} className="text-amber-300" />;
      case 'CloudMoon':
        return <CloudMoon size={size} className="text-indigo-300" />;
      case 'Cloud':
        return <Cloud size={size} className="text-slate-300" />;
      case 'CloudRain':
        return <CloudRain size={size} className="text-sky-400" />;
      case 'CloudRainWind':
        return <CloudRainWind size={size} className="text-blue-400" />;
      case 'CloudDrizzle':
        return <CloudDrizzle size={size} className="text-cyan-400" />;
      case 'CloudSnow':
        return <CloudSnow size={size} className="text-sky-200" />;
      case 'CloudLightning':
        return <CloudLightning size={size} className="text-purple-400" />;
      case 'CloudFog':
        return <CloudFog size={size} className="text-teal-300" />;
      case 'CloudHail':
        return <CloudHail size={size} className="text-cyan-200" />;
      case 'Wind':
        return <Wind size={size} className="text-cyan-300" />;
      case 'Droplets':
        return <Droplets size={size} className="text-blue-400" />;
      case 'Sparkles':
        return <Sparkles size={size} className="text-amber-300" />;
      default:
        return <Sun size={size} className="text-amber-400" />;
    }
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {glow && (
        <div 
          className="absolute inset-0 rounded-full blur-md opacity-40 scale-125 transition-all duration-700 pointer-events-none"
          style={{ backgroundColor: glowColor }}
        />
      )}
      <div className="relative z-10 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
        {renderIcon()}
      </div>
    </div>
  );
}
