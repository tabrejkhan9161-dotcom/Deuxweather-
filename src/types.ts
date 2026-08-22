export interface GeoLocation {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  feature_code?: string;
  country_code?: string;
  country?: string;
  admin1?: string;
  admin2?: string;
  timezone?: string;
  population?: number;
}

export interface GeocodingResponse {
  results?: GeoLocation[];
  generationtime_ms?: number;
}

export interface CurrentWeatherData {
  time: string;
  interval?: number;
  temperature_2m: number;
  relative_humidity_2m: number;
  apparent_temperature: number;
  is_day: number;
  precipitation: number;
  weather_code: number;
  wind_speed_10m: number;
  surface_pressure?: number;
  wind_direction_10m?: number;
}

export interface HourlyWeatherData {
  time: string[];
  temperature_2m: number[];
  precipitation_probability: number[];
  weather_code: number[];
  wind_speed_10m: number[];
  relative_humidity_2m?: number[];
  uv_index?: number[];
}

export interface DailyWeatherData {
  time: string[];
  weather_code: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  sunrise: string[];
  sunset: string[];
  uv_index_max: number[];
  precipitation_probability_max?: number[];
  wind_speed_10m_max?: number[];
}

export interface WeatherForecastResponse {
  latitude: number;
  longitude: number;
  elevation?: number;
  generationtime_ms?: number;
  utc_offset_seconds?: number;
  timezone: string;
  timezone_abbreviation?: string;
  current: CurrentWeatherData;
  hourly: HourlyWeatherData;
  daily: DailyWeatherData;
}

export interface CurrentAQIData {
  time: string;
  interval?: number;
  european_aqi: number;
  us_aqi: number;
  pm10: number;
  pm2_5: number;
  carbon_monoxide: number;
  nitrogen_dioxide: number;
  sulphur_dioxide: number;
  ozone: number;
}

export interface AQIForecastResponse {
  latitude: number;
  longitude: number;
  generationtime_ms?: number;
  utc_offset_seconds?: number;
  timezone: string;
  timezone_abbreviation?: string;
  current: CurrentAQIData;
}

export type TempUnit = 'C' | 'F';
export type SpeedUnit = 'km/h' | 'mph' | 'm/s';
export type AQIStandard = 'us' | 'european';
export type ThemePreference = 'dark' | 'light' | 'auto';

export interface ClimateDayPoint {
  date: string;
  displayDate: string;
  actualTempMean: number;
  actualTempMax: number;
  actualTempMin: number;
  historicalAvgTemp: number;
  actualHumidity: number;
  historicalAvgHumidity: number;
  tempAnomaly: number;
}

export interface ClimateInsightsData {
  points: ClimateDayPoint[];
  avgTemp30d: number;
  historicalAvgTemp30d: number;
  tempAnomalyOverall: number;
  avgHumidity30d: number;
  historicalAvgHumidity30d: number;
  hottestDay: { date: string; temp: number };
  coolestDay: { date: string; temp: number };
}

export interface WeatherTheme {
  category: 'clear' | 'cloudy' | 'rain' | 'snow' | 'storm' | 'fog';
  label: string;
  bgGradient: string;
  accentGlow: string;
  primaryColor: string;
  particleType: 'sun' | 'stars' | 'clouds' | 'rain' | 'snow' | 'lightning' | 'fog';
}

export interface PollutantDetail {
  key: keyof Pick<CurrentAQIData, 'pm2_5' | 'pm10' | 'ozone' | 'nitrogen_dioxide' | 'sulphur_dioxide' | 'carbon_monoxide'>;
  name: string;
  formula: string;
  unit: string;
  value: number;
  status: 'Good' | 'Moderate' | 'Unhealthy' | 'Hazardous';
  statusColor: string;
  statusBg: string;
  description: string;
  pctOfMax: number;
}

export interface SavedCity {
  id: string;
  name: string;
  country?: string;
  admin1?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
  lastTemp?: number;
  lastWeatherCode?: number;
}
