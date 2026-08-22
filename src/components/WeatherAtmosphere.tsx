import { useEffect, useRef } from 'react';
import { WeatherTheme } from '../types';

interface WeatherAtmosphereProps {
  theme: WeatherTheme;
  isDay: boolean;
}

export function WeatherAtmosphere({ theme, isDay }: WeatherAtmosphereProps) {
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

    // Particle state setup
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

    const particles: Particle[] = [];
    const particleType = theme.particleType;

    const count = particleType === 'rain' ? 80 
      : particleType === 'snow' ? 60 
      : particleType === 'stars' ? 70 
      : particleType === 'lightning' ? 90 
      : particleType === 'fog' ? 35 
      : 30; // clouds / sun dust

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        speedY: particleType === 'rain' || particleType === 'lightning' ? Math.random() * 12 + 10
          : particleType === 'snow' ? Math.random() * 1.5 + 0.5
          : particleType === 'clouds' || particleType === 'fog' ? (Math.random() - 0.5) * 0.3
          : (Math.random() - 0.5) * 0.4,
        speedX: particleType === 'rain' || particleType === 'lightning' ? Math.random() * 2 - 1.5
          : particleType === 'snow' ? Math.sin(i) * 0.8
          : particleType === 'clouds' || particleType === 'fog' ? Math.random() * 0.4 + 0.1
          : (Math.random() - 0.5) * 0.3,
        size: particleType === 'rain' || particleType === 'lightning' ? Math.random() * 1.5 + 1
          : particleType === 'snow' ? Math.random() * 3 + 1.5
          : particleType === 'stars' ? Math.random() * 2 + 0.5
          : particleType === 'clouds' ? Math.random() * 120 + 80
          : particleType === 'fog' ? Math.random() * 180 + 100
          : Math.random() * 3 + 1,
        opacity: Math.random() * 0.6 + 0.2,
        length: Math.random() * 20 + 15,
        pulse: Math.random() * Math.PI * 2,
      });
    }

    let lightningTimer = 0;
    let isFlashing = false;
    let flashAlpha = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Ambient dynamic background glow
      if (particleType === 'sun' && isDay) {
        const sunX = width * 0.75;
        const sunY = height * 0.2;
        const gradient = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, Math.max(width, height) * 0.6);
        gradient.addColorStop(0, 'rgba(245, 158, 11, 0.18)');
        gradient.addColorStop(0.3, 'rgba(251, 191, 36, 0.08)');
        gradient.addColorStop(1, 'rgba(15, 23, 42, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
      } else if (particleType === 'stars' || !isDay) {
        const moonX = width * 0.8;
        const moonY = height * 0.25;
        const gradient = ctx.createRadialGradient(moonX, moonY, 10, moonX, moonY, Math.max(width, height) * 0.5);
        gradient.addColorStop(0, 'rgba(99, 102, 241, 0.14)');
        gradient.addColorStop(0.4, 'rgba(56, 189, 248, 0.04)');
        gradient.addColorStop(1, 'rgba(11, 15, 25, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
      }

      // Lightning flash logic
      if (particleType === 'lightning') {
        lightningTimer++;
        if (lightningTimer > 180 && Math.random() < 0.03) {
          isFlashing = true;
          flashAlpha = 0.35;
          lightningTimer = 0;
        }
        if (isFlashing) {
          ctx.fillStyle = `rgba(216, 180, 254, ${flashAlpha})`;
          ctx.fillRect(0, 0, width, height);
          flashAlpha -= 0.02;
          if (flashAlpha <= 0) {
            isFlashing = false;
          }
        }
      }

      // Render individual particles
      for (const p of particles) {
        p.pulse = (p.pulse || 0) + 0.02;

        if (particleType === 'rain' || particleType === 'lightning') {
          ctx.strokeStyle = `rgba(186, 230, 253, ${p.opacity * 0.7})`;
          ctx.lineWidth = p.size;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.speedX * 2, p.y + (p.length || 20));
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
          p.x += Math.sin(p.pulse) * 0.8;

          if (p.y > height) {
            p.y = -10;
            p.x = Math.random() * width;
          }
        } else if (particleType === 'stars') {
          const currentOpacity = p.opacity * (0.4 + 0.6 * Math.abs(Math.sin(p.pulse)));
          ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (particleType === 'clouds' || particleType === 'fog') {
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
          const color = particleType === 'fog' ? 'rgba(203, 213, 225, 0.04)' : 'rgba(148, 163, 184, 0.035)';
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
          // Sunny ambient sun motes
          const currentOpacity = p.opacity * (0.3 + 0.7 * Math.abs(Math.sin(p.pulse)));
          ctx.fillStyle = `rgba(251, 191, 36, ${currentOpacity * 0.4})`;
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
  }, [theme, isDay]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Dynamic atmospheric gradient overlay */}
      <div 
        className={`absolute inset-0 bg-gradient-to-b ${theme.bgGradient} transition-colors duration-1000 ease-in-out`}
      />
      {/* Ambient localized glow circles */}
      <div 
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl opacity-30 animate-pulse-glow transition-all duration-1000"
        style={{ backgroundColor: theme.primaryColor }}
      />
      <div 
        className="absolute top-1/3 -right-32 w-[500px] h-[500px] rounded-full blur-[100px] opacity-20 transition-all duration-1000"
        style={{ backgroundColor: theme.primaryColor }}
      />
      {/* Particle Canvas */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full"
      />
      {/* Subtle fine mesh grid texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]"
      />
    </div>
  );
}
