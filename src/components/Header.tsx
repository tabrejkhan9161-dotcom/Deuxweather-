import { useState, useEffect, useRef, useTransition, type KeyboardEvent } from 'react';
import { 
  Search, 
  MapPin, 
  Navigation, 
  X, 
  Loader2, 
  Settings,
  Bookmark,
  Sparkles
} from 'lucide-react';
import { GeoLocation, SavedCity } from '../types';
import { searchCities, POPULAR_LOCATIONS } from '../services/weatherApi';

interface HeaderProps {
  currentLocation: GeoLocation;
  onSelectLocation: (loc: GeoLocation) => void;
  onLocateUser: () => void;
  isLocating: boolean;
  onOpenSettings: () => void;
  onOpenAiChat: () => void;
  savedCities: SavedCity[];
  onToggleSaveCity: (city: GeoLocation) => void;
  isCitySaved: boolean;
}

export function Header({
  currentLocation,
  onSelectLocation,
  onLocateUser,
  isLocating,
  onOpenSettings,
  onOpenAiChat,
  savedCities,
  onToggleSaveCity,
  isCitySaved,
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<GeoLocation[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);
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

  const handleSelect = (loc: GeoLocation) => {
    onSelectLocation(loc);
    setSearchQuery('');
    setSuggestions([]);
    setIsSearchOpen(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
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
      setIsSearchOpen(false);
    }
  };

  return (
    <header className="relative z-30 w-full max-w-md mx-auto pt-3 pb-1 px-4">
      {/* Top Mobile Bar */}
      <div className="flex items-center justify-between gap-2 py-1">
        {/* Brand & Location Title */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center shadow-sm">
            <span className="font-display font-black text-cyan-300 text-sm tracking-tighter">dx</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-extrabold text-base text-white tracking-tight">
                deuxweather
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <span className="text-[10px] text-slate-400 font-mono block -mt-0.5">
              {currentLocation.name}
            </span>
          </div>
        </div>

        {/* Action Buttons: AI, Bookmark, GPS, Settings */}
        <div className="flex items-center gap-1.5">
          {/* Search Trigger */}
          <button
            id="mobile-search-trigger-btn"
            onClick={() => {
              setIsSearchOpen(true);
              setTimeout(() => searchInputRef.current?.focus(), 50);
            }}
            className="w-9 h-9 rounded-xl bg-slate-900/90 border border-white/10 text-slate-300 hover:text-white flex items-center justify-center active:scale-95 transition-all"
            aria-label="Search city"
          >
            <Search size={16} />
          </button>

          {/* AI Meteorological Assistant */}
          <button
            id="mobile-ai-assistant-btn"
            onClick={onOpenAiChat}
            className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 hover:text-cyan-200 flex items-center justify-center active:scale-95 transition-all shadow-sm"
            aria-label="Ask AI Assistant"
            title="Ask AI Assistant"
          >
            <Sparkles size={16} className="text-cyan-400" />
          </button>

          {/* Bookmark Current City */}
          <button
            id="mobile-bookmark-btn"
            onClick={() => onToggleSaveCity(currentLocation)}
            className={`w-9 h-9 rounded-xl border flex items-center justify-center active:scale-95 transition-all ${
              isCitySaved
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                : 'bg-slate-900/90 border-white/10 text-slate-400 hover:text-white'
            }`}
            aria-label="Save to favorites"
          >
            <Bookmark size={16} className={isCitySaved ? 'fill-amber-400' : ''} />
          </button>

          {/* GPS Auto-locate */}
          <button
            id="mobile-gps-btn"
            onClick={onLocateUser}
            disabled={isLocating}
            className="w-9 h-9 rounded-xl bg-slate-900/90 border border-white/10 text-cyan-400 hover:text-cyan-300 flex items-center justify-center active:scale-95 transition-all disabled:opacity-50"
            aria-label="Locate GPS position"
          >
            <Navigation size={16} className={isLocating ? 'animate-spin text-cyan-300' : ''} />
          </button>

          {/* Settings Modal Trigger */}
          <button
            id="mobile-settings-btn"
            onClick={onOpenSettings}
            className="w-9 h-9 rounded-xl bg-slate-900/90 border border-white/10 text-slate-300 hover:text-white flex items-center justify-center active:scale-95 transition-all"
            aria-label="Open settings"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>

      {/* Quick Location Pills (Favorites & Trending) */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2 pb-1">
        {savedCities.length > 0 && (
          <span className="text-[10px] font-mono text-amber-400 font-semibold uppercase shrink-0">
            Saved:
          </span>
        )}
        {savedCities.map((city) => {
          const isSelected = currentLocation.name.toLowerCase() === city.name.toLowerCase();
          return (
            <button
              key={`saved-${city.id}`}
              onClick={() => onSelectLocation({
                id: Number(city.id) || 0,
                name: city.name,
                latitude: city.latitude,
                longitude: city.longitude,
                country: city.country,
                admin1: city.admin1,
              })}
              className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                isSelected
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-slate-900/80 text-slate-300 border border-white/5 hover:border-white/20'
              }`}
            >
              {city.name}
            </button>
          );
        })}

        <span className="text-[10px] font-mono text-slate-500 uppercase shrink-0 pl-1">
          Popular:
        </span>
        {POPULAR_LOCATIONS.slice(0, 4).map((loc) => {
          const isSelected = currentLocation.name.toLowerCase() === loc.name.toLowerCase();
          return (
            <button
              key={`quick-${loc.id}`}
              onClick={() => onSelectLocation(loc)}
              className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                isSelected
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                  : 'bg-slate-900/80 text-slate-400 border border-white/5 hover:text-white'
              }`}
            >
              {loc.name}
            </button>
          );
        })}
      </div>

      {/* Full-Screen / Floating Search Overlay for Mobile */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md p-4 flex flex-col items-center justify-start animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-slate-900 rounded-2xl border border-white/10 p-4 shadow-2xl space-y-3">
            {/* Search Input Header */}
            <div className="relative flex items-center">
              <Search size={18} className="absolute left-3 text-slate-400 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search city name, state, country..."
                className="w-full pl-10 pr-10 py-3 text-sm bg-slate-950 border border-white/10 focus:border-cyan-400 rounded-xl text-white placeholder-slate-500 focus:outline-none"
                autoComplete="off"
              />
              <button
                onClick={() => {
                  setSearchQuery('');
                  setIsSearchOpen(false);
                }}
                className="absolute right-3 p-1 text-slate-400 hover:text-white rounded-md"
                aria-label="Close search"
              >
                <X size={18} />
              </button>
            </div>

            {/* Results or Suggestions */}
            <div className="max-h-72 overflow-y-auto space-y-1 divide-y divide-white/5">
              {isLoading ? (
                <div className="py-6 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin text-cyan-400" />
                  <span>Searching global locations...</span>
                </div>
              ) : suggestions.length > 0 ? (
                suggestions.map((item, index) => (
                  <button
                    key={`${item.id}-${index}`}
                    onClick={() => handleSelect(item)}
                    className="w-full text-left py-2.5 px-3 rounded-lg flex items-center justify-between text-sm hover:bg-white/5 text-slate-200 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <MapPin size={15} className="text-cyan-400 shrink-0" />
                      <div className="truncate">
                        <span className="font-semibold text-white">{item.name}</span>
                        {item.admin1 && <span className="text-slate-400 text-xs">, {item.admin1}</span>}
                        {item.country && <span className="text-slate-400 text-xs">, {item.country}</span>}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 shrink-0">
                      {item.latitude.toFixed(1)}°, {item.longitude.toFixed(1)}°
                    </span>
                  </button>
                ))
              ) : searchQuery.trim().length >= 2 ? (
                <div className="py-6 text-center text-slate-400 text-xs">
                  No cities found matching &quot;{searchQuery}&quot;
                </div>
              ) : (
                <div className="py-2">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1.5">
                    Popular Global Cities
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {POPULAR_LOCATIONS.map((city) => (
                      <button
                        key={city.id}
                        onClick={() => handleSelect(city)}
                        className="py-2 px-3 rounded-lg text-left text-xs bg-slate-950/60 border border-white/5 text-slate-300 hover:text-white hover:border-white/20 transition-all flex items-center justify-between"
                      >
                        <span className="font-medium text-white">{city.name}</span>
                        <span className="text-[10px] font-mono text-slate-500">{city.country_code}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
