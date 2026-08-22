import { useEffect, useRef } from 'react';
import { WeatherTheme } from '../types';

interface WeatherAtmosphereProps {
  theme: WeatherTheme;
  isDay: boolean;
  precipitationProb?: number;
}

export function WeatherAtmosphere({ theme, isDay, precipitationProb = 0 }: WeatherAtmosphereProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    interface Particle {
      x: number;
      y: number;
      speedY: number;
      speedX: number;
      size: number;
      opacity: number;
      length?: number;
      pulse?: number;
    }

    interface CloudPuff {
      x: number;
      y: number;
      radius: number;
      speed: number;
      opacity: number;
    }

    const particles: Particle[] = [];
    const clouds: CloudPuff[] = [];
    const particleType = theme.particleType;

    // Scale rain density based on precipitation probability
    const rainMultiplier = Math.max(0.4, (precipitationProb || 50) / 100);
    const count = particleType === 'rain' ? Math.floor(75 * rainMultiplier)
      : particleType === 'snow' ? 50 
      : particleType === 'stars' ? 60 
      : particleType === 'lightning' ? 80 
      : particleType === 'fog' ? 25 
      : 25;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        speedY: particleType === 'rain' || particleType === 'lightning' ? Math.random() * 14 + 12
          : particleType === 'snow' ? Math.random() * 1.5 + 0.6
          : particleType === 'clouds' || particleType === 'fog' ? (Math.random() - 0.5) * 0.2
          : (Math.random() - 0.5) * 0.3,
        speedX: particleType === 'rain' || particleType === 'lightning' ? Math.random() * 1.5 - 0.75
          : particleType === 'snow' ? Math.sin(i) * 0.7
          : particleType === 'clouds' || particleType === 'fog' ? Math.random() * 0.3 + 0.1
          : (Math.random() - 0.5) * 0.2,
        size: particleType === 'rain' || particleType === 'lightning' ? Math.random() * 1.5 + 0.8
          : particleType === 'snow' ? Math.random() * 2.5 + 1.2
          : particleType === 'stars' ? Math.random() * 1.8 + 0.5
          : particleType === 'clouds' ? Math.random() * 100 + 60
          : particleType === 'fog' ? Math.random() * 150 + 80
          : Math.random() * 2.5 + 1,
        opacity: Math.random() * 0.5 + 0.2,
        length: Math.random() * 22 + 14,
        pulse: Math.random() * Math.PI * 2,
      });
    }

    // Initialize horizontal panning cloud puffs for cloudy, rain, and storm conditions
    if (particleType === 'clouds' || particleType === 'rain' || particleType === 'lightning') {
      const cloudCount = 6;
      for (let c = 0; c < cloudCount; c++) {
        clouds.push({
          x: (c / cloudCount) * width + Math.random() * 80,
          y: Math.random() * 180 + 30,
          radius: Math.random() * 120 + 90,
          speed: Math.random() * 0.25 + 0.12,
          opacity: Math.random() * 0.08 + 0.04,
        });
      }
    }

    let lightningTimer = 0;
    let isFlashing = false;
    let flashAlpha = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render Panning Cloud Billows
      if (clouds.length > 0) {
        for (const c of clouds) {
          c.x += c.speed;
          if (c.x - c.radius > width) {
            c.x = -c.radius;
            c.y = Math.random() * 180 + 30;
          }

          const grad = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.radius);
          const color = isDay ? '203, 213, 225' : '100, 116, 139';
          grad.addColorStop(0, `rgba(${color}, ${c.opacity})`);
          grad.addColorStop(1, 'rgba(15, 23, 42, 0)');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Ambient radial sunlight or moonlight
      if (particleType === 'sun' && isDay) {
        const sunX = width * 0.8;
        const sunY = height * 0.15;
        const gradient = ctx.createRadialGradient(sunX, sunY, 5, sunX, sunY, Math.max(width, height) * 0.5);
        gradient.addColorStop(0, 'rgba(245, 158, 11, 0.12)');
        gradient.addColorStop(0.35, 'rgba(251, 191, 36, 0.04)');
        gradient.addColorStop(1, 'rgba(15, 23, 42, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
      } else if (!isDay) {
        const moonX = width * 0.82;
        const moonY = height * 0.18;
        const gradient = ctx.createRadialGradient(moonX, moonY, 5, moonX, moonY, Math.max(width, height) * 0.45);
        gradient.addColorStop(0, 'rgba(129, 140, 248, 0.08)');
        gradient.addColorStop(0.4, 'rgba(56, 189, 248, 0.02)');
        gradient.addColorStop(1, 'rgba(11, 15, 25, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
      }

      // Sudden Thunderstorm Flash Logic
      if (particleType === 'lightning') {
        lightningTimer++;
        if (lightningTimer > 160 && Math.random() < 0.04) {
          isFlashing = true;
          flashAlpha = 0.45;
          lightningTimer = 0;
        }
        if (isFlashing) {
          ctx.fillStyle = `rgba(224, 231, 255, ${flashAlpha})`;
          ctx.fillRect(0, 0, width, height);
          flashAlpha -= 0.035;
          if (flashAlpha <= 0) {
            isFlashing = false;
          }
        }
      }

      // Render Individual Particles
      for (const p of particles) {
        p.pulse = (p.pulse || 0) + 0.02;

        if (particleType === 'rain' || particleType === 'lightning') {
          ctx.strokeStyle = `rgba(186, 230, 253, ${p.opacity * 0.75})`;
          ctx.lineWidth = p.size;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.speedX * 2, p.y + (p.length || 18));
          ctx.stroke();

          p.y += p.speedY;
          p.x += p.speedX;

          if (p.y > height) {
            p.y = -20;
            p.x = Math.random() * width;
          }
        } else if (particleType === 'snow') {
          ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity * (0.6 + 0.4 * Math.sin(p.pulse))})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();

          p.y += p.speedY;
          p.x += Math.sin(p.pulse) * 0.7;

          if (p.y > height) {
            p.y = -10;
            p.x = Math.random() * width;
          }
        } else if (particleType === 'stars') {
          const currentOpacity = p.opacity * (0.3 + 0.7 * Math.abs(Math.sin(p.pulse)));
          ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (particleType === 'clouds' || particleType === 'fog') {
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
          const color = particleType === 'fog' ? 'rgba(203, 213, 225, 0.03)' : 'rgba(148, 163, 184, 0.025)';
          grad.addColorStop(0, color);
          grad.addColorStop(1, 'rgba(15, 23, 42, 0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();

          p.x += p.speedX;
          p.y += p.speedY;

          if (p.x > width + p.size) p.x = -p.size;
          if (p.x < -p.size) p.x = width + p.size;
        } else {
          // Sunny ambient motes
          const currentOpacity = p.opacity * (0.3 + 0.7 * Math.abs(Math.sin(p.pulse)));
          ctx.fillStyle = `rgba(251, 191, 36, ${currentOpacity * 0.35})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();

          p.y += p.speedY;
          p.x += p.speedX;
          if (p.y > height) p.y = 0;
          if (p.y < 0) p.y = height;
          if (p.x > width) p.x = 0;
          if (p.x < 0) p.x = width;
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme, isDay, precipitationProb]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Background base layer */}
      <div className="absolute inset-0 bg-[#090D16]" />
      
      {/* Subtle condition tint gradient */}
      <div 
        className={`absolute inset-0 bg-gradient-to-b ${theme.bgGradient} opacity-40 transition-colors duration-1000 ease-in-out`}
      />

      {/* Particle Canvas */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full"
      />
    </div>
  );
}
