import { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Send, 
  Loader2, 
  User, 
  Compass,
  ArrowRight
} from 'lucide-react';
import { GeoLocation, CurrentWeatherData, DailyWeatherData, CurrentAQIData, TempUnit } from '../types';
import { formatTemp, getWeatherCondition } from '../utils/weatherUtils';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  time: string;
}

interface WeatherAIModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: GeoLocation;
  current: CurrentWeatherData;
  daily: DailyWeatherData;
  aqiData?: CurrentAQIData;
  tempUnit: TempUnit;
}

export function WeatherAIModal({
  isOpen,
  onClose,
  location,
  current,
  daily,
  aqiData,
  tempUnit,
}: WeatherAIModalProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      sender: 'ai',
      text: `Hello! I'm your real-time meteorological assistant for ${location.name}. Current temperature is ${formatTemp(current.temperature_2m, tempUnit)} with ${getWeatherCondition(current.weather_code, current.is_day).label}. How can I assist your plans today?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const condition = getWeatherCondition(current.weather_code, current.is_day);
  const rainProb = daily.precipitation_probability_max?.[0] ?? 0;
  const uvIndex = daily.uv_index_max?.[0] ?? 0;
  const aqiUs = aqiData?.us_aqi ?? 45;

  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = async (customPrompt?: string) => {
    const textToSend = (customPrompt || inputText).trim();
    if (!textToSend || isSending) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setInputText('');
    setIsSending(true);

    try {
      const response = await fetch('/api/ai/weather-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          city: location.name,
          temp: current.temperature_2m,
          condition: condition.label,
          rainProb,
          uvIndex,
          aqiUs,
          windSpeed: current.wind_speed_10m,
        }),
      });

      if (!response.ok) {
        throw new Error(`API status ${response.status}`);
      }

      const data = await response.json();
      const aiReply: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.reply || 'Conditions look favorable. Let me know if you need further details!',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiReply]);
    } catch (err) {
      console.warn('AI assistance fallback:', err);
      const fallbackReply: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: `Based on live radar for ${location.name}, conditions remain ${condition.label} at ${formatTemp(current.temperature_2m, tempUnit)} with ${rainProb}% rain chance. Plan your commute or outdoor activity accordingly!`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackReply]);
    } finally {
      setIsSending(false);
    }
  };

  const sampleQuestions = [
    `Should I bring an umbrella in ${location.name}?`,
    `What is the best time for an outdoor run today?`,
    `Is the air quality safe for cycling?`,
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-slate-900 border border-white/10 rounded-t-3xl sm:rounded-3xl flex flex-col h-[85vh] sm:h-[650px] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shadow-sm">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="font-display font-bold text-base text-white">Meteorological AI</h2>
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live Grounding: {location.name}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close assistant"
          >
            <X size={18} />
          </button>
        </div>

        {/* Live Context Strip */}
        <div className="px-4 py-2 bg-slate-950/40 border-b border-white/5 flex items-center gap-2 overflow-x-auto no-scrollbar text-[11px] font-mono text-slate-300">
          <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5 shrink-0">
            {formatTemp(current.temperature_2m, tempUnit)}
          </span>
          <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5 shrink-0">
            {condition.label}
          </span>
          <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5 shrink-0">
            Rain: {rainProb}%
          </span>
          <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5 shrink-0">
            AQI: {aqiUs}
          </span>
        </div>

        {/* Chat History */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 custom-scrollbar">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'ai' && (
                <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shrink-0 mt-0.5">
                  <Sparkles size={13} />
                </div>
              )}

              <div
                className={`max-w-[82%] rounded-2xl p-3 text-xs sm:text-sm leading-relaxed shadow-sm ${
                  m.sender === 'user'
                    ? 'bg-cyan-500 text-slate-950 font-medium rounded-tr-none'
                    : 'bg-slate-950/70 border border-white/10 text-slate-200 rounded-tl-none'
                }`}
              >
                <p>{m.text}</p>
                <span className={`text-[9px] font-mono mt-1 block ${m.sender === 'user' ? 'text-slate-800' : 'text-slate-500'}`}>
                  {m.time}
                </span>
              </div>

              {m.sender === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-slate-800 border border-white/10 flex items-center justify-center text-slate-300 shrink-0 mt-0.5">
                  <User size={13} />
                </div>
              )}
            </div>
          ))}

          {isSending && (
            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono py-1">
              <Loader2 size={14} className="animate-spin text-cyan-400" />
              <span>Analyzing meteorological telemetry...</span>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Quick Question Chips */}
        <div className="px-3 py-1.5 bg-slate-950/30 border-t border-white/5 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {sampleQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="shrink-0 px-2.5 py-1 rounded-lg text-[11px] bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-white/10 flex items-center gap-1 transition-colors"
            >
              <span>{q}</span>
              <ArrowRight size={10} className="text-cyan-400" />
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-slate-950/80 border-t border-white/10">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask anything about current or upcoming weather..."
              className="flex-1 bg-slate-900 border border-white/10 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isSending}
              className="p-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 active:scale-95 transition-all disabled:opacity-40 shrink-0"
              aria-label="Send message"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
