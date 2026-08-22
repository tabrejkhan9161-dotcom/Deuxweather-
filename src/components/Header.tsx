import { useState, useEffect, useRef, useTransition, type KeyboardEvent } from 'react';
import { 
  Search, 
  MapPin, 
  Navigation, 
  RefreshCw, 
  X, 
  Loader2, 
  Radio,
  Bookmark,
  ChevronDown
} from 'lucide-react';
import { GeoLocation, TempUnit, SpeedUnit, SavedCity } from '../types';
import { searchCities, POPULAR_LOCATIONS } from '../services/weatherApi';

interface HeaderProps {
  currentLocation: GeoLocation;
  onSelectLocation: (loc: GeoLocation) => void;
  onLocateUser: () => void;
  isLocating: boolean;
  onRefresh: () => void;
  isRefreshing: boolean;
  tempUnit: TempUnit;
  onToggleTempUnit: (unit: TempUnit) => void;
  speedUnit: SpeedUnit;
  onToggleSpeedUnit: (unit: SpeedUnit) => void;
  savedCities: SavedCity[];
  onToggleSaveCity: (city: GeoLocation) => void;
  isCitySaved: boolean;
}

export function Header({
  currentLocation,
  onSelectLocation,
  onLocateUser,
  isLocating,
  onRefresh,
  isRefreshing,
  tempUnit,
  onToggleTempUnit,
  speedUnit,
  onToggleSpeedUnit,
  savedCities,
  onToggleSaveCity,
  isCitySaved,
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<GeoLocation[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showSavedDropdown, setShowSavedDropdown] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const savedDropdownRef = useRef<HTMLDivElement>(null);
  const [, startTransition] = useTransition();

  // Debounced search
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    const abortController = new AbortController();
    setIsLoading(true);

    const timer = setTimeout(async () => {
      try {
        const results = await searchCities(searchQuery, abortController.signal);
        startTransition(() => {
          setSuggestions(results);
          setIsLoading(false);
          setSelectedIndex(-1);
        });
      } catch (err) {
        console.error('Error during auto-suggest:', err);
        setIsLoading(false);
      }
    }, 280);

    return () => {
      clearTimeout(timer);
      abortController.abort();
    };
  }, [searchQuery]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
      if (savedDropdownRef.current && !savedDropdownRef.current.contains(event.target as Node)) {
        setShowSavedDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (loc: GeoLocation) => {
    onSelectLocation(loc);
    setSearchQuery('');
    setSuggestions([]);
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
      }
      return;
    }

    const list = suggestions.length > 0 ? suggestions : POPULAR_LOCATIONS.slice(0, 5);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < list.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : list.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < list.length) {
        handleSelect(list[selectedIndex]);
      } else if (list.length > 0) {
        handleSelect(list[0]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <header className="relative z-30 w-full pt-4 pb-2 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Top Main Navigation Bar */}
      <div className="glass-panel rounded-2xl p-3 sm:p-4 flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4 border border-white/10 shadow-2xl">
        
        {/* Brand Logo & Telemetry Status */}
        <div className="flex items-center justify-between w-full md:w-auto gap-3">
          <div className="flex items-center gap-2.5 group cursor-pointer" onClick={() => onRefresh()}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-transform group-hover:scale-105">
              <span className="font-display font-black text-white text-xl tracking-tighter">dx</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-cyan-200">
                  deuxweather
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold tracking-wider uppercase bg-cyan-500/20 text-cyan-300 rounded border border-cyan-500/30">
                  ULTRA-HD
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-emerald-400 font-semibold">LIVE TELEMETRY</span>
                <span className="text-slate-600">•</span>
                <span>OPEN-METEO ENGINE</span>
              </div>
            </div>
          </div>

          {/* Mobile Right Controls */}
          <div className="flex md:hidden items-center gap-1.5">
            <button
              id="mobile-geolocation-btn"
              onClick={onLocateUser}
              disabled={isLocating}
              className="p-2 rounded-xl glass-pill text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/20 transition-all border border-cyan-500/30"
              title="Locate Current Position"
              aria-label="Locate GPS position"
            >
              <Navigation size={18} className={isLocating ? 'animate-spin text-cyan-300' : ''} />
            </button>
            <button
              id="mobile-refresh-btn"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-xl glass-pill text-slate-300 hover:text-white hover:bg-white/10 transition-all"
              title="Refresh Real-time Data"
              aria-label="Refresh weather data"
            >
              <RefreshCw size={18} className={isRefreshing ? 'animate-spin text-cyan-400' : ''} />
            </button>
          </div>
        </div>

        {/* Global Auto-Suggest Search Bar */}
        <div ref={searchContainerRef} className="relative w-full md:max-w-md lg:max-w-lg">
          <div className="relative flex items-center">
            <Search size={18} className="absolute left-3.5 text-slate-400 pointer-events-none" />
            <input
              id="global-city-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder="Search any world city, state, or coordinates..."
              className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-900/80 hover:bg-slate-900 focus:bg-slate-900 border border-white/10 focus:border-cyan-400/60 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 shadow-inner transition-all"
              autoComplete="off"
            />
            
            {/* Clear or Loading Icon */}
            <div className="absolute right-3 flex items-center gap-1">
              {isLoading ? (
                <Loader2 size={16} className="text-cyan-400 animate-spin" />
              ) : searchQuery ? (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSuggestions([]);
                    setIsOpen(false);
                  }}
                  className="text-slate-400 hover:text-white p-0.5 rounded transition-colors"
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              ) : null}
            </div>
          </div>

          {/* Auto-suggest dropdown menu */}
          {isOpen && (
            <div className="absolute top-full mt-2 left-0 right-0 glass-panel rounded-xl border border-white/15 shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
              {suggestions.length > 0 ? (
                <div className="p-1.5 divide-y divide-white/5">
                  <div className="px-3 py-1.5 text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Global Search Results</span>
                    <span>{suggestions.length} places found</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto custom-scrollbar pt-1">
                    {suggestions.map((item, index) => (
                      <button
                        key={`${item.id}-${index}`}
                        onClick={() => handleSelect(item)}
                        className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between text-sm transition-all ${
                          selectedIndex === index
                            ? 'bg-cyan-500/20 text-cyan-200 border-l-2 border-cyan-400 pl-2.5'
                            : 'text-slate-200 hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <MapPin size={15} className={selectedIndex === index ? 'text-cyan-400' : 'text-slate-400'} />
                          <div className="truncate">
                            <span className="font-semibold text-white">{item.name}</span>
                            {item.admin1 && <span className="text-slate-400 text-xs">, {item.admin1}</span>}
                            {item.country && <span className="text-slate-400 text-xs">, {item.country}</span>}
                          </div>
                        </div>
                        <div className="text-[11px] font-mono text-slate-500 shrink-0 pl-2">
                          {item.latitude.toFixed(2)}°, {item.longitude.toFixed(2)}°
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : searchQuery.trim().length >= 2 && !isLoading ? (
                <div className="p-6 text-center text-slate-400 text-sm">
                  <p>No locations found matching &quot;{searchQuery}&quot;</p>
                  <p className="text-xs text-slate-500 mt-1">Try searching by official city name or country.</p>
                </div>
              ) : (
                <div className="p-2">
                  <div className="px-3 py-1 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                    Popular World Megacities
                  </div>
                  <div className="grid grid-cols-2 gap-1 mt-1">
                    {POPULAR_LOCATIONS.map((city, index) => (
                      <button
                        key={city.id}
                        onClick={() => handleSelect(city)}
                        className={`px-3 py-2 rounded-lg text-left text-xs flex items-center justify-between transition-colors ${
                          selectedIndex === index ? 'bg-cyan-500/20 text-cyan-200' : 'text-slate-300 hover:bg-white/5'
                        }`}
                      >
                        <span className="font-medium text-white">{city.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{city.country_code}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Controls: Geolocation, Unit Switchers, Saved Locations */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          
          {/* GPS Auto-detect Button */}
          <button
            id="desktop-geolocation-btn"
            onClick={onLocateUser}
            disabled={isLocating}
            className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold glass-pill text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/20 border border-cyan-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            title="Auto-detect current GPS location"
          >
            <Navigation size={14} className={isLocating ? 'animate-spin text-cyan-300' : 'text-cyan-400'} />
            <span>{isLocating ? 'Locating...' : 'GPS Auto'}</span>
          </button>

          {/* Bookmark Current City Button */}
          <button
            id="save-current-city-btn"
            onClick={() => onToggleSaveCity(currentLocation)}
            className={`p-2 rounded-xl glass-pill transition-all border ${
              isCitySaved 
                ? 'text-amber-400 bg-amber-500/20 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.25)]' 
                : 'text-slate-400 hover:text-slate-200 border-white/10 hover:bg-white/5'
            }`}
            title={isCitySaved ? 'Saved in favorites' : 'Save location to favorites'}
            aria-label="Save location to favorites"
          >
            <Bookmark size={16} className={isCitySaved ? 'fill-amber-400' : ''} />
          </button>

          {/* Saved Cities Dropdown */}
          {savedCities.length > 0 && (
            <div ref={savedDropdownRef} className="relative">
              <button
                onClick={() => setShowSavedDropdown(!showSavedDropdown)}
                className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl glass-pill text-xs font-medium text-slate-300 hover:text-white border-white/10 hover:bg-white/5 transition-all"
                title="View saved cities"
              >
                <span>Saved ({savedCities.length})</span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${showSavedDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showSavedDropdown && (
                <div className="absolute right-0 top-full mt-2 w-56 glass-panel rounded-xl border border-white/15 shadow-2xl p-1.5 z-50">
                  <div className="px-2.5 py-1 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                    Favorite Locations
                  </div>
                  <div className="max-h-56 overflow-y-auto custom-scrollbar divide-y divide-white/5">
                    {savedCities.map((saved) => (
                      <button
                        key={saved.id}
                        onClick={() => {
                          onSelectLocation({
                            id: Number(saved.id) || 0,
                            name: saved.name,
                            latitude: saved.latitude,
                            longitude: saved.longitude,
                            country: saved.country,
                            admin1: saved.admin1,
                          });
                          setShowSavedDropdown(false);
                        }}
                        className="w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between text-slate-200 hover:bg-white/10 transition-colors group"
                      >
                        <div className="truncate">
                          <span className="font-semibold text-white group-hover:text-cyan-300 transition-colors">{saved.name}</span>
                          {saved.country && <span className="text-[11px] text-slate-400">, {saved.country}</span>}
                        </div>
                        <MapPin size={12} className="text-slate-500 group-hover:text-cyan-400 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Unit Switcher: Temperature */}
          <div className="flex items-center p-0.5 rounded-xl bg-slate-900/90 border border-white/10 text-xs font-mono">
            <button
              onClick={() => onToggleTempUnit('C')}
              className={`px-2.5 py-1.5 rounded-lg transition-all ${
                tempUnit === 'C'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              °C
            </button>
            <button
              onClick={() => onToggleTempUnit('F')}
              className={`px-2.5 py-1.5 rounded-lg transition-all ${
                tempUnit === 'F'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              °F
            </button>
          </div>

          {/* Speed Unit Switcher */}
          <div className="hidden sm:flex items-center p-0.5 rounded-xl bg-slate-900/90 border border-white/10 text-xs font-mono">
            {(['km/h', 'mph', 'm/s'] as SpeedUnit[]).map((unit) => (
              <button
                key={unit}
                onClick={() => onToggleSpeedUnit(unit)}
                className={`px-2 py-1.5 rounded-lg transition-all ${
                  speedUnit === unit
                    ? 'bg-slate-700 text-cyan-300 font-semibold shadow-inner'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {unit}
              </button>
            ))}
          </div>

          {/* Refresh Action */}
          <button
            id="desktop-refresh-btn"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="hidden md:flex p-2.5 rounded-xl glass-pill text-slate-300 hover:text-white hover:bg-white/10 transition-all border border-white/10 hover:border-white/20 active:scale-95"
            title="Refresh Real-time Weather Telemetry"
            aria-label="Refresh telemetry data"
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin text-cyan-400' : ''} />
          </button>
        </div>

      </div>

      {/* Quick Location Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-2.5 pb-0.5 px-1">
        <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1 shrink-0 uppercase">
          <Radio size={12} className="text-cyan-400" /> Hotspots:
        </span>
        {POPULAR_LOCATIONS.map((loc) => {
          const isSelected = currentLocation.name.toLowerCase() === loc.name.toLowerCase();
          return (
            <button
              key={`quick-${loc.id}`}
              onClick={() => onSelectLocation(loc)}
              className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                isSelected
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                  : 'bg-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10 border border-white/5'
              }`}
            >
              {loc.name}
            </button>
          );
        })}
      </div>
    </header>
  );
}
