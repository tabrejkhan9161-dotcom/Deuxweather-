import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not configured');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Real-Time Meteorological AI Assistant Endpoint
  app.post('/api/ai/weather-assist', async (req, res) => {
    try {
      const { message, city, temp, condition, rainProb, uvIndex, aqiUs, windSpeed } = req.body;
      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      const prompt = `You are the real-time AI meteorological intelligence assistant for the "deuxweather" application.
Current live conditions in ${city || 'the selected location'}:
- Temperature: ${temp ?? 22}°C
- Condition: ${condition || 'Clear'}
- Rain Probability: ${rainProb ?? 0}%
- UV Index: ${uvIndex ?? 3}
- AQI: ${aqiUs ?? 45}
- Wind Speed: ${windSpeed ?? 12} km/h

User question: "${message}"

Provide a concise, helpful, and scientifically accurate response in 2-3 short sentences. Focus on actionable insights, clothing advice, commute recommendations, or weather explanations based on the live metrics.`;

      let replyText = '';
      try {
        const ai = getAI();
        const response = await ai.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          config: {
            temperature: 0.5,
          },
        });
        replyText = response.text || '';
      } catch (geminiErr: any) {
        console.warn('Gemini API fallback for chat:', geminiErr?.message);
        replyText = `Based on current telemetry in ${city || 'your area'}, conditions are ${condition || 'stable'} at ${temp ?? 20}°C with a ${rainProb ?? 0}% rain chance. Air quality is ${Number(aqiUs) > 100 ? 'elevated' : 'good'}. Let me know if you need specific travel or clothing recommendations!`;
      }

      res.json({
        success: true,
        reply: replyText,
      });
    } catch (error: any) {
      console.error('AI assistant error:', error);
      res.status(500).json({ success: false, error: 'Failed to process AI query' });
    }
  });

  // VibeCast AI - Smart Real-Time Day Planner & Routine Assistant Endpoint
  app.post('/api/ai/vibecast', async (req, res) => {
    try {
      const { 
        city, 
        temp, 
        condition, 
        rainProb, 
        uvIndex, 
        aqiUs, 
        pm25, 
        pm10, 
        windSpeed,
        sunrise,
        sunset 
      } = req.body;

      if (!city) {
        return res.status(400).json({ error: 'City name is required' });
      }

      const prompt = `You are VibeCast AI, the smart real-time day planner & routine assistant in the "deuxweather" application.
Analyze the following real-time weather and air quality data for ${city}:
- Temp: ${temp}°C
- Condition: ${condition || 'Clear'}
- Rain Chance: ${rainProb ?? 0}%
- UV: ${uvIndex ?? 0}
- AQI: ${aqiUs ?? 50} (PM2.5: ${pm25 ?? 15} µg/m³, PM10: ${pm10 ?? 25} µg/m³)
- Wind Speed: ${windSpeed ?? 10} km/h
- Sunrise / Sunset: ${sunrise || '06:30'} / ${sunset || '19:30'}

Generate a sharp, 4-point daily action plan in crisp single-line points formatted strictly as JSON with this exact schema:
{
  "vibe": "1 crisp sentence summarizing the day summary and vibe",
  "outdoorWindow": "Specify safe, optimal time slots based on heat/rain/sunlight (e.g., 'Ideal between 06:00 AM – 10:00 AM and after 05:30 PM.')",
  "gear": "Concise outfit & gear recommendation (e.g., 'Lightweight cottons; carry UV sunglasses; no umbrella required.')",
  "healthAdvisory": "Sharp health & commute alert based on AQI and UV Index (e.g., 'AQI is Moderate (68); sensitive groups should avoid heavy cardio outdoors.')"
}

Ensure each value is a single, punchy, informative line without line breaks. Return ONLY valid JSON.`;

      let parsedResult;
      try {
        const ai = getAI();
        const response = await ai.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          config: {
            responseMimeType: 'application/json',
            temperature: 0.4,
          },
        });

        const raw = (response.text || '{}').trim();
        parsedResult = JSON.parse(raw);
      } catch (geminiErr: any) {
        console.warn('Gemini API call warning in VibeCast:', geminiErr?.message);
        
        // Intelligent algorithmic fallback if GEMINI_API_KEY is not set or network issue
        const tempNum = Number(temp) || 20;
        const popNum = Number(rainProb) || 0;
        const uvNum = Number(uvIndex) || 3;
        const aqiNum = Number(aqiUs) || 45;

        let vibeText = `${condition || 'Pleasant'} day in ${city} with mild temperatures around ${tempNum}°C.`;
        if (popNum > 50) vibeText = `Cloudy and wet afternoon ahead in ${city} with rain likelihood peaking at ${popNum}%.`;
        else if (tempNum > 30) vibeText = `Hot and sunlit conditions across ${city} reaching highs of ${tempNum}°C.`;
        else if (tempNum < 8) vibeText = `Crisp, chilly weather prevailing throughout ${city} with low thermal warmth.`;

        let windowText = `Optimal between 07:00 AM – 10:30 AM and after 05:30 PM for maximum comfort.`;
        if (popNum > 50) windowText = `Best dry window between 08:00 AM – 11:30 AM before precipitation risk elevates.`;
        else if (tempNum > 28) windowText = `Early morning (06:00 AM – 09:00 AM) or dusk (after 06:30 PM) avoids peak solar heat.`;

        let gearText = `Light breathable layers; comfortable footwear; no rain gear required today.`;
        if (popNum > 40) gearText = `Compact umbrella & water-resistant outerwear recommended; non-slip footwear.`;
        else if (uvNum >= 6) gearText = `Lightweight cottons; polarized UV sunglasses; SPF 50 sunscreen advised.`;

        let healthText = `Air quality is Good (AQI ${aqiNum}); ideal conditions for all outdoor activities and commute.`;
        if (aqiNum > 100) healthText = `AQI is Elevated (${aqiNum}); sensitive individuals and athletes should reduce vigorous outdoor exposure.`;
        else if (uvNum >= 8) healthText = `Extreme UV Index (${uvNum}); minimize direct sun exposure between 11:00 AM and 3:00 PM.`;

        parsedResult = {
          vibe: vibeText,
          outdoorWindow: windowText,
          gear: gearText,
          healthAdvisory: healthText,
          isFallback: true
        };
      }

      res.json({
        success: true,
        data: parsedResult,
      });
    } catch (error: any) {
      console.error('VibeCast error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to generate VibeCast AI plan',
      });
    }
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'deuxweather-api' });
  });

  // Vite middleware for dev vs static in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`deuxweather server running on http://localhost:${PORT}`);
  });
}

startServer();
