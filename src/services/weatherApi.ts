import { GeoLocation, GeocodingResponse, WeatherForecastResponse, AQIForecastResponse } from '../types';

const GEOCODING_API_BASE = 'https://geocoding-api.open-meteo.com/v1';
const FORECAST_API_BASE = 'https://api.open-meteo.com/v1';
const AIR_QUALITY_API_BASE = 'https://air-quality-api.open-meteo.com/v1';

export async function searchCities(query: string, signal?: AbortSignal): Promise<GeoLocation[]> {
  if (!query || query.trim().length < 2) return [];
  
  const url = `${GEOCODING_API_BASE}/search?name=${encodeURIComponent(query.trim())}&count=6&language=en&format=json`;
  
  try {
    const response = await fetch(url, { signal });
    if (!response.ok) {
      throw new Error(`Geocoding failed with status: ${response.status}`);
    }
    const data: GeocodingResponse = await response.json();
    return data.results || [];
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return [];
    }
    console.error('Error searching cities:', error);
    return [];
  }
}

export async function fetchWeatherData(lat: number, lon: number): Promise<WeatherForecastResponse> {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,surface_pressure,wind_direction_10m',
    hourly: 'temperature_2m,precipitation_probability,weather_code,wind_speed_10m,relative_humidity_2m,uv_index',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max,wind_speed_10m_max',
    timezone: 'auto',
    forecast_days: '8',
  });

  const url = `${FORECAST_API_BASE}/forecast?${params.toString()}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Weather data request failed with status: ${response.status}`);
  }
  
  return await response.json();
}

export async function fetchAQIData(lat: number, lon: number): Promise<AQIForecastResponse> {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    current: 'european_aqi,us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone',
    timezone: 'auto',
  });

  const url = `${AIR_QUALITY_API_BASE}/air-quality?${params.toString()}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Air Quality request failed with status: ${response.status}`);
  }
  
  return await response.json();
}

export async function reverseGeocode(lat: number, lon: number): Promise<GeoLocation> {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=en`, {
      headers: {
        'User-Agent': 'deuxweather-app',
      },
    });
    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const cityName = addr.city || addr.town || addr.village || addr.municipality || addr.county || 'Current Location';
      return {
        id: Math.floor(Math.random() * 1000000),
        name: cityName,
        latitude: lat,
        longitude: lon,
        country: addr.country || '',
        country_code: addr.country_code?.toUpperCase() || '',
        admin1: addr.state || addr.region || '',
      };
    }
  } catch (err) {
    console.warn('Reverse geocode fallback failed:', err);
  }

  return {
    id: 1,
    name: 'Current Coordinates',
    latitude: lat,
    longitude: lon,
  };
}

export const POPULAR_LOCATIONS: GeoLocation[] = [
  { id: 1850147, name: 'Tokyo', country: 'Japan', country_code: 'JP', latitude: 35.6895, longitude: 139.6917, admin1: 'Tokyo' },
  { id: 5128581, name: 'New York', country: 'United States', country_code: 'US', latitude: 40.7128, longitude: -74.006, admin1: 'New York' },
  { id: 2643743, name: 'London', country: 'United Kingdom', country_code: 'GB', latitude: 51.5085, longitude: -0.1257, admin1: 'England' },
  { id: 2988507, name: 'Paris', country: 'France', country_code: 'FR', latitude: 48.8534, longitude: 2.3488, admin1: 'Île-de-France' },
  { id: 292223, name: 'Dubai', country: 'United Arab Emirates', country_code: 'AE', latitude: 25.0772, longitude: 55.3093, admin1: 'Dubai' },
  { id: 2147714, name: 'Sydney', country: 'Australia', country_code: 'AU', latitude: -33.8678, longitude: 151.2073, admin1: 'New South Wales' },
  { id: 1880252, name: 'Singapore', country: 'Singapore', country_code: 'SG', latitude: 1.2897, longitude: 103.8501, admin1: 'Singapore' },
  { id: 1275339, name: 'Mumbai', country: 'India', country_code: 'IN', latitude: 19.0728, longitude: 72.8826, admin1: 'Maharashtra' },
];
