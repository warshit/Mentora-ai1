
import React, { useEffect, useRef } from 'react';

interface CelebrationOverlayProps {
  type: 'TOPIC_COMPLETE' | 'PERFECT_SCORE';
  onComplete: () => void;
}

const CelebrationOverlay: React.FC<CelebrationOverlayProps> = ({ type, onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas to full screen
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Particle[] = [];
    const colors = [
      '#4F46E5', // Indigo
      '#10B981', // Emerald
      '#F59E0B', // Amber
      '#64748B', // Slate
      '#E2E8F0', // Light Slate
      '#FFFFFF'  // White
    ];

    class Particle {
      x: number;
      y: number;
      w: number;
      h: number;
      color: string;
      speed: number;
      angle: number;
      spin: number;
      wobble: number;
      wobbleSpeed: number;

      constructor() {
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * -canvas!.height * 0.5; // Start above screen
        this.w = Math.random() * 10 + 5;
        this.h = Math.random() * 5 + 5;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.speed = Math.random() * 3 + 2;
        this.angle = Math.random() * 360;
        this.spin = (Math.random() - 0.5) * 0.2;
        this.wobble = Math.random() * Math.PI * 2;
        this.wobbleSpeed = Math.random() * 0.05 + 0.01;
      }

      update() {
        this.y += this.speed;
        this.wobble += this.wobbleSpeed;
        this.angle += this.spin;
      }

      draw() {
        if (!ctx) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        // Simulate 3D flutter by changing scaleX based on wobble
        const scaleX = Math.abs(Math.cos(this.wobble));
        ctx.scale(scaleX, 1);
        
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h);
        ctx.restore();
      }
    }

    // Initialize particles
    for (let i = 0; i < 150; i++) {
      particles.push(new Particle());
    }

    let animationId: number;
    let startTime = Date.now();
    const duration = 2500; // 2.5 seconds total

    const animate = () => {
      if (Date.now() - startTime > duration) {
        onComplete();
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        p.update();
        p.draw();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm animate-in fade-in duration-300"></div>
      
      {/* Canvas Layer */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Message Layer */}
      <div className="relative z-10 text-center animate-in zoom-in-95 fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-white/90 dark:bg-graphite-surface/90 border border-slate-200 dark:border-graphite-border shadow-2xl backdrop-blur-xl px-12 py-8 rounded-[2rem]">
          <div className="mb-4 flex justify-center">
             <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center shadow-inner">
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
             </div>
          </div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-graphite-text-main tracking-tight mb-2">
            {type === 'TOPIC_COMPLETE' ? 'Topic Completed' : 'Perfect Score!'}
          </h2>
          <p className="text-slate-500 dark:text-graphite-text-sub font-bold uppercase tracking-widest text-xs">
            {type === 'TOPIC_COMPLETE' ? 'Great Consistency' : 'Excellent Accuracy'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CelebrationOverlay;
