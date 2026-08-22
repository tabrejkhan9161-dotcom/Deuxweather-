import { useState, useEffect, useCallback } from 'react';
import { 
  Loader2, 
  AlertCircle, 
  RefreshCw, 
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

  // User Preferences from LocalStorage
  const [tempUnit, setTempUnit] = useState<TempUnit>(() => {
    return (localStorage.getItem('deuxweather_temp_unit') as TempUnit) || 'C';
  });

  const [speedUnit, setSpeedUnit] = useState<SpeedUnit>(() => {
    return (localStorage.getItem('deuxweather_speed_unit') as SpeedUnit) || 'km/h';
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

  // Synchronize Preferences to LocalStorage
  const handleToggleTempUnit = (unit: TempUnit) => {
    setTempUnit(unit);
    localStorage.setItem('deuxweather_temp_unit', unit);
  };

  const handleToggleSpeedUnit = (unit: SpeedUnit) => {
    setSpeedUnit(unit);
    localStorage.setItem('deuxweather_speed_unit', unit);
  };

  // Toggle Saved City
  const handleToggleSaveCity = (loc: GeoLocation) => {
    const exists = savedCities.some((c) => c.name.toLowerCase() === loc.name.toLowerCase());
    let updated: SavedCity[];

    if (exists) {
      updated = savedCities.filter((c) => c.name.toLowerCase() !== loc.name.toLowerCase());
      showToast(`Removed ${loc.name} from saved favorites`, 'info');
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

  // Fetch telemetry for coordinates
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
        showToast(`Updated telemetry for ${loc.name}`, 'success');
      }
    } catch (err) {
      console.error('Failed to load weather data:', err);
      setError('Unable to fetch live meteorological data from Open-Meteo servers. Please verify network connection.');
      showToast('Telemetry sync failed. Retrying...', 'error');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadWeatherData(currentLocation);
  }, []);

  // GPS Auto-detect handler
  const handleLocateUser = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser', 'error');
      return;
    }

    setIsLocating(true);
    showToast('Triangulating GPS coordinates...', 'info');

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
        showToast('GPS access permission denied or timed out', 'error');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Derive dynamic atmospheric theme
  const currentConditionMeta = weatherData
    ? getWeatherCondition(weatherData.current.weather_code, weatherData.current.is_day)
    : getWeatherCondition(0, 1);

  const isDay = weatherData ? weatherData.current.is_day === 1 : true;
  const isCitySaved = savedCities.some((c) => c.name.toLowerCase() === currentLocation.name.toLowerCase());

  return (
    <div className="relative min-h-screen text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Interactive Weather Atmosphere Canvas */}
      <WeatherAtmosphere 
        theme={currentConditionMeta.theme} 
        isDay={isDay} 
      />

      {/* Floating Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className={`px-4 py-2.5 rounded-2xl glass-panel text-xs font-mono font-semibold flex items-center gap-2 border shadow-2xl ${
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

      {/* Main App Container */}
      <div className="relative z-10 flex flex-col min-h-screen">
        
        {/* Navigation & Global Search Header */}
        <Header
          currentLocation={currentLocation}
          onSelectLocation={(loc) => loadWeatherData(loc)}
          onLocateUser={handleLocateUser}
          isLocating={isLocating}
          onRefresh={() => loadWeatherData(currentLocation, true)}
          isRefreshing={isRefreshing}
          tempUnit={tempUnit}
          onToggleTempUnit={handleToggleTempUnit}
          speedUnit={speedUnit}
          onToggleSpeedUnit={handleToggleSpeedUnit}
          savedCities={savedCities}
          onToggleSaveCity={handleToggleSaveCity}
          isCitySaved={isCitySaved}
        />

        {/* Content Body */}
        <main className="flex-1 space-y-3 pb-12">
          
          {/* Error Alert State */}
          {error && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
              <div className="glass-panel rounded-2xl p-4 border border-rose-500/40 bg-rose-950/30 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <AlertCircle size={20} className="text-rose-400 shrink-0" />
                  <p className="text-xs sm:text-sm text-rose-200">{error}</p>
                </div>
                <button
                  onClick={() => loadWeatherData(currentLocation)}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-200 text-xs font-mono font-semibold hover:bg-rose-500/30 transition-all border border-rose-500/30 shrink-0"
                >
                  Retry Connection
                </button>
              </div>
            </div>
          )}

          {/* Loading Skeleton */}
          {isLoading && !weatherData && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center animate-pulse">
                <Loader2 size={32} className="text-cyan-400 animate-spin" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="font-display font-bold text-lg text-white">Syncing Open-Meteo Satellite Feed</h3>
                <p className="text-xs font-mono text-slate-400">Querying live atmospheric & AQI sensors for {currentLocation.name}...</p>
              </div>
            </div>
          )}

          {/* Active Data Modules */}
          {weatherData && aqiData && (
            <>
              {/* Strict Single-Line Live Metrics Row */}
              <LiveMetricsBar
                current={weatherData.current}
                tempUnit={tempUnit}
                speedUnit={speedUnit}
                uvIndex={weatherData.daily.uv_index_max[0]}
              />

              {/* Ultra-HD Current Weather Hero Card with Daylight Arc */}
              <CurrentWeatherHero
                location={currentLocation}
                current={weatherData.current}
                daily={weatherData.daily}
                tempUnit={tempUnit}
                speedUnit={speedUnit}
                timezone={weatherData.timezone}
              />

              {/* VibeCast AI: Smart Real-Time Day Planner & Routine Assistant */}
              <VibeCastCard
                location={currentLocation}
                current={weatherData.current}
                daily={weatherData.daily}
                aqiData={aqiData.current}
                tempUnit={tempUnit}
                speedUnit={speedUnit}
              />

              {/* AQI Command Center */}
              <AQICommandCenter
                aqiData={aqiData.current}
              />

              {/* 24-Hour Timeline & 7-Day Forecast Micro-Charts */}
              <ForecastSection
                hourly={weatherData.hourly}
                daily={weatherData.daily}
                tempUnit={tempUnit}
                speedUnit={speedUnit}
              />

              {/* High-Precision Atmospheric Details 4-Card Grid */}
              <AtmosphericDetailsGrid
                current={weatherData.current}
                daily={weatherData.daily}
                tempUnit={tempUnit}
                speedUnit={speedUnit}
              />
            </>
          )}

        </main>

        {/* Footer */}
        <footer className="relative z-20 border-t border-white/5 py-6 px-4 text-center text-xs font-mono text-slate-500">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 px-4">
            <div className="flex items-center gap-2">
              <span className="font-display font-black text-cyan-400 text-sm">deuxweather</span>
              <span>•</span>
              <span>Ultra-HD Real-Time Meteorological Platform</span>
            </div>

            <div className="flex items-center gap-4 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                Data powered by{' '}
                <a 
                  href="https://open-meteo.com/" 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-0.5 underline decoration-cyan-500/30"
                >
                  Open-Meteo
                  <ExternalLink size={10} />
                </a>
              </span>
              <span>•</span>
              <span className="text-emerald-400">Zero Auth • Global Coverage</span>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
