import { useState, useEffect, useCallback } from 'react';
import { 
  Loader2, 
  AlertCircle, 
  Check, 
  Radio,
  ExternalLink
} from 'lucide-react';
import { 
  GeoLocation, 
  WeatherForecastResponse, 
  AQIForecastResponse, 
  TempUnit, 
  SpeedUnit, 
  AQIStandard,
  ThemePreference,
  SavedCity 
} from './types';
import { fetchWeatherData, fetchAQIData, reverseGeocode, POPULAR_LOCATIONS } from './services/weatherApi';
import { getWeatherCondition } from './utils/weatherUtils';
import { WeatherAtmosphere } from './components/WeatherAtmosphere';
import { Header } from './components/Header';
import { LiveMetricsBar } from './components/LiveMetricsBar';
import { CurrentWeatherHero } from './components/CurrentWeatherHero';
import { VibeCastCard } from './components/VibeCastCard';
import { AQICommandCenter } from './components/AQICommandCenter';
import { ForecastSection } from './components/ForecastSection';
import { AtmosphericDetailsGrid } from './components/AtmosphericDetailsGrid';
import { ClimateInsights } from './components/ClimateInsights';
import { SettingsModal } from './components/SettingsModal';
import { WeatherAIModal } from './components/WeatherAIModal';

const DEFAULT_CITY: GeoLocation = POPULAR_LOCATIONS[0]; // Tokyo

export default function App() {
  const [currentLocation, setCurrentLocation] = useState<GeoLocation>(() => {
    try {
      const saved = localStorage.getItem('deuxweather_last_location');
      return saved ? JSON.parse(saved) : DEFAULT_CITY;
    } catch {
      return DEFAULT_CITY;
    }
  });

  const [weatherData, setWeatherData] = useState<WeatherForecastResponse | null>(null);
  const [aqiData, setAqiData] = useState<AQIForecastResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  // User Preferences
  const [tempUnit, setTempUnit] = useState<TempUnit>(() => {
    return (localStorage.getItem('deuxweather_temp_unit') as TempUnit) || 'C';
  });

  const [speedUnit, setSpeedUnit] = useState<SpeedUnit>(() => {
    return (localStorage.getItem('deuxweather_speed_unit') as SpeedUnit) || 'km/h';
  });

  const [aqiStandard, setAqiStandard] = useState<AQIStandard>(() => {
    return (localStorage.getItem('deuxweather_aqi_standard') as AQIStandard) || 'us';
  });

  const [themePref, setThemePref] = useState<ThemePreference>(() => {
    return (localStorage.getItem('deuxweather_theme_pref') as ThemePreference) || 'dark';
  });

  const [savedCities, setSavedCities] = useState<SavedCity[]>(() => {
    try {
      const saved = localStorage.getItem('deuxweather_saved_cities');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSelectTempUnit = (unit: TempUnit) => {
    setTempUnit(unit);
    localStorage.setItem('deuxweather_temp_unit', unit);
  };

  const handleSelectSpeedUnit = (unit: SpeedUnit) => {
    setSpeedUnit(unit);
    localStorage.setItem('deuxweather_speed_unit', unit);
  };

  const handleSelectAqiStandard = (std: AQIStandard) => {
    setAqiStandard(std);
    localStorage.setItem('deuxweather_aqi_standard', std);
  };

  const handleSelectThemePref = (pref: ThemePreference) => {
    setThemePref(pref);
    localStorage.setItem('deuxweather_theme_pref', pref);
  };

  const handleToggleSaveCity = (loc: GeoLocation) => {
    const exists = savedCities.some((c) => c.name.toLowerCase() === loc.name.toLowerCase());
    let updated: SavedCity[];

    if (exists) {
      updated = savedCities.filter((c) => c.name.toLowerCase() !== loc.name.toLowerCase());
      showToast(`Removed ${loc.name} from favorites`, 'info');
    } else {
      updated = [
        ...savedCities,
        {
          id: loc.id.toString(),
          name: loc.name,
          country: loc.country,
          admin1: loc.admin1,
          latitude: loc.latitude,
          longitude: loc.longitude,
          timezone: loc.timezone,
          lastTemp: weatherData?.current.temperature_2m,
          lastWeatherCode: weatherData?.current.weather_code,
        },
      ];
      showToast(`Saved ${loc.name} to favorites`, 'success');
    }

    setSavedCities(updated);
    localStorage.setItem('deuxweather_saved_cities', JSON.stringify(updated));
  };

  const loadWeatherData = useCallback(async (loc: GeoLocation, showRefreshAnimation = false) => {
    if (showRefreshAnimation) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const [weather, aqi] = await Promise.all([
        fetchWeatherData(loc.latitude, loc.longitude),
        fetchAQIData(loc.latitude, loc.longitude),
      ]);

      setWeatherData(weather);
      setAqiData(aqi);
      setCurrentLocation(loc);
      localStorage.setItem('deuxweather_last_location', JSON.stringify(loc));
      
      if (showRefreshAnimation) {
        showToast(`Synced live telemetry for ${loc.name}`, 'success');
      }
    } catch (err) {
      console.error('Failed to load weather data:', err);
      setError('Unable to fetch live meteorological data from Open-Meteo servers. Please check your connection.');
      showToast('Telemetry sync failed', 'error');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadWeatherData(currentLocation);
  }, []);

  const handleLocateUser = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser', 'error');
      return;
    }

    setIsLocating(true);
    showToast('Triangulating GPS position...', 'info');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const resolvedLoc = await reverseGeocode(latitude, longitude);
          await loadWeatherData(resolvedLoc);
          showToast(`Position locked: ${resolvedLoc.name}`, 'success');
        } catch {
          const fallbackLoc: GeoLocation = {
            id: 0,
            name: 'Current Location',
            latitude,
            longitude,
          };
          await loadWeatherData(fallbackLoc);
          showToast('GPS coordinates loaded', 'success');
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setIsLocating(false);
        showToast('GPS access denied or timed out', 'error');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const currentConditionMeta = weatherData
    ? getWeatherCondition(weatherData.current.weather_code, weatherData.current.is_day)
    : getWeatherCondition(0, 1);

  const isDay = weatherData ? weatherData.current.is_day === 1 : true;
  const isCitySaved = savedCities.some((c) => c.name.toLowerCase() === currentLocation.name.toLowerCase());
  const precipProb = weatherData?.daily.precipitation_probability_max?.[0] ?? 0;

  return (
    <div className="relative min-h-screen bg-[#090D16] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden">
      
      {/* 60fps Lightweight Atmospheric Canvas */}
      <WeatherAtmosphere 
        theme={currentConditionMeta.theme} 
        isDay={isDay} 
        precipitationProb={precipProb}
      />

      {/* Floating Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 inset-x-4 max-w-md mx-auto z-50 animate-in fade-in slide-in-from-bottom-5 duration-200 pointer-events-none">
          <div className={`px-4 py-2.5 rounded-2xl bg-slate-900/95 text-xs font-mono font-semibold flex items-center gap-2 border shadow-2xl ${
            toastMessage.type === 'success' ? 'border-emerald-500/50 text-emerald-300' :
            toastMessage.type === 'error' ? 'border-rose-500/50 text-rose-300' :
            'border-cyan-500/50 text-cyan-300'
          }`}>
            {toastMessage.type === 'success' && <Check size={14} className="text-emerald-400" />}
            {toastMessage.type === 'error' && <AlertCircle size={14} className="text-rose-400" />}
            {toastMessage.type === 'info' && <Radio size={14} className="text-cyan-400 animate-pulse" />}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        tempUnit={tempUnit}
        onSelectTempUnit={handleSelectTempUnit}
        speedUnit={speedUnit}
        onSelectSpeedUnit={handleSelectSpeedUnit}
        aqiStandard={aqiStandard}
        onSelectAqiStandard={handleSelectAqiStandard}
        themePref={themePref}
        onSelectThemePref={handleSelectThemePref}
        onForceRefresh={() => loadWeatherData(currentLocation, true)}
        isRefreshing={isRefreshing}
      />

      {/* Real-time AI Meteorological Assistant Modal */}
      {weatherData && (
        <WeatherAIModal
          isOpen={isAiModalOpen}
          onClose={() => setIsAiModalOpen(false)}
          location={currentLocation}
          current={weatherData.current}
          daily={weatherData.daily}
          aqiData={aqiData?.current}
          tempUnit={tempUnit}
        />
      )}

      {/* Strict Mobile-First App Shell (Max 450px Centered) */}
      <div className="relative z-10 flex flex-col min-h-screen max-w-[450px] mx-auto w-full">
        
        {/* Mobile Header */}
        <Header
          currentLocation={currentLocation}
          onSelectLocation={(loc) => loadWeatherData(loc)}
          onLocateUser={handleLocateUser}
          isLocating={isLocating}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenAiChat={() => setIsAiModalOpen(true)}
          savedCities={savedCities}
          onToggleSaveCity={handleToggleSaveCity}
          isCitySaved={isCitySaved}
        />

        {/* Vertical Stack Body */}
        <main className="flex-1 flex flex-col gap-2 pb-10">
          
          {/* Error Alert State */}
          {error && (
            <div className="px-4 pt-2">
              <div className="rounded-2xl p-4 border border-rose-500/40 bg-rose-950/40 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <AlertCircle size={18} className="text-rose-400 shrink-0" />
                  <p className="text-xs text-rose-200">{error}</p>
                </div>
                <button
                  onClick={() => loadWeatherData(currentLocation)}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-200 text-xs font-mono font-semibold hover:bg-rose-500/30 transition-all border border-rose-500/30 shrink-0"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Loading Skeleton */}
          {isLoading && !weatherData && (
            <div className="px-4 py-24 flex flex-col items-center justify-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center animate-pulse">
                <Loader2 size={28} className="text-cyan-400 animate-spin" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="font-display font-bold text-base text-white">Syncing Live Weather Feed</h3>
                <p className="text-xs font-mono text-slate-400">Fetching satellite & sensor metrics for {currentLocation.name}...</p>
              </div>
            </div>
          )}

          {/* Mobile-First Vertically Stacked Meteorological Modules */}
          {weatherData && aqiData && (
            <>
              {/* 1. Live Single-Line Telemetry Chain */}
              <LiveMetricsBar
                current={weatherData.current}
                tempUnit={tempUnit}
                speedUnit={speedUnit}
                uvIndex={weatherData.daily.uv_index_max[0]}
              />

              {/* 2. Hero Weather Display with 72px Bold Temperature */}
              <CurrentWeatherHero
                location={currentLocation}
                current={weatherData.current}
                daily={weatherData.daily}
                tempUnit={tempUnit}
                speedUnit={speedUnit}
                timezone={weatherData.timezone}
              />

              {/* 3. VibeCast AI: Real-Time Day Planner & Routine Assistant */}
              <VibeCastCard
                location={currentLocation}
                current={weatherData.current}
                daily={weatherData.daily}
                aqiData={aqiData.current}
                tempUnit={tempUnit}
                speedUnit={speedUnit}
              />

              {/* 4. Forecasting: 24-Hour Timeline & 7-Day Range */}
              <ForecastSection
                hourly={weatherData.hourly}
                daily={weatherData.daily}
                tempUnit={tempUnit}
                speedUnit={speedUnit}
              />

              {/* 5. Air Quality & Pollutants Command Center */}
              <AQICommandCenter
                aqiData={aqiData.current}
                standard={aqiStandard}
              />

              {/* 6. Atmospheric Sensors 4-Card Grid */}
              <AtmosphericDetailsGrid
                current={weatherData.current}
                daily={weatherData.daily}
                tempUnit={tempUnit}
                speedUnit={speedUnit}
              />

              {/* 7. Climate Insights: 30-Day Historical Trend Analysis */}
              <ClimateInsights
                location={currentLocation}
                tempUnit={tempUnit}
              />
            </>
          )}

        </main>

        {/* Mobile Footer */}
        <footer className="relative z-20 border-t border-white/5 py-4 px-4 text-center text-[11px] font-mono text-slate-500 space-y-1">
          <div className="flex items-center justify-center gap-2">
            <span className="font-display font-extrabold text-cyan-400">deuxweather</span>
            <span>•</span>
            <span>Mobile Meteorological System</span>
          </div>
          <div className="flex items-center justify-center gap-1 text-slate-400">
            <span>Powered by</span>
            <a 
              href="https://open-meteo.com/" 
              target="_blank" 
              rel="noreferrer"
              className="text-cyan-400 underline decoration-cyan-500/30 inline-flex items-center gap-0.5"
            >
              Open-Meteo
              <ExternalLink size={9} />
            </a>
          </div>
        </footer>

      </div>
    </div>
  );
}
