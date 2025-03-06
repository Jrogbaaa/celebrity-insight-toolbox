
import React, { useEffect, useRef } from "react";

interface Point {
  x: number;
  y: number;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  color: string;
  opacity: number;
}

// Dedicated animation controller with proper typing and binding
const animationController = {
  particles: [] as Particle[],
  ctx: null as CanvasRenderingContext2D | null,
  canvas: null as HTMLCanvasElement | null,
  animationFrameId: 0,
  lastTime: 0,
  
  // Theme-aligned colors with varying opacities
  colors: [
    "rgba(45, 27, 105, 0.4)",  // Primary indigo
    "rgba(79, 70, 229, 0.35)", // Indigo 600
    "rgba(139, 92, 246, 0.3)", // Violet/Purple
    "rgba(67, 56, 202, 0.35)", // Indigo 700
    "rgba(99, 102, 241, 0.3)", // Indigo 500
  ],

  init: function(canvas: HTMLCanvasElement) {
    if (!canvas) return;
    
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    if (!this.ctx) return;
    
    this.setupCanvas();
    this.createParticles();
    this.startAnimation();
    
    // Ensure we properly bind this method to maintain context
    window.addEventListener("resize", this.handleResize.bind(this));
  },

  setupCanvas: function() {
    if (!this.canvas || !this.ctx) return;
    
    // Handle high DPI displays for crisp rendering
    const scale = window.devicePixelRatio || 1;
    this.canvas.width = window.innerWidth * scale;
    this.canvas.height = window.innerHeight * scale;
    this.canvas.style.width = `${window.innerWidth}px`;
    this.canvas.style.height = `${window.innerHeight}px`;
    this.ctx.scale(scale, scale);
  },

  handleResize: function() {
    if (!this.canvas || !this.ctx) return;
    this.setupCanvas();
    this.createParticles(); // Recreate particles on resize
  },

  createParticles: function() {
    if (!this.canvas || !this.ctx) return;
    
    const particleCount = Math.min(100, Math.floor(window.innerWidth / 15)); // Responsive particle count
    this.particles = [];
    
    for (let i = 0; i < particleCount; i++) {
      // Start particles at random positions across the left half of the screen
      const x = Math.random() * (window.innerWidth * 0.3);
      const y = Math.random() * window.innerHeight;
      
      this.particles.push({
        x,
        y,
        size: 1 + Math.random() * 4, // Varied sizes for depth
        speedX: 0.2 + Math.random() * 0.6, // Consistent rightward flow with slight variation
        speedY: Math.random() * 0.2 - 0.1, // Subtle vertical drift
        color: this.colors[Math.floor(Math.random() * this.colors.length)],
        opacity: 0.1 + Math.random() * 0.4 // Subtle opacity variations
      });
    }
  },

  startAnimation: function() {
    this.lastTime = performance.now();
    this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
  },

  animate: function(time: number) {
    if (!this.ctx || !this.canvas) return;
    
    this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
    
    // Calculate delta time for smooth animation regardless of frame rate
    const deltaTime = time - this.lastTime;
    this.lastTime = time;
    
    // Clear canvas with full clear for best performance
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Update and draw each particle
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      
      // Update position based on delta time
      const speedFactor = deltaTime / 16; // normalize to 60fps
      p.x += p.speedX * speedFactor;
      p.y += p.speedY * speedFactor;
      
      // Reset particles that move off-screen to the left
      if (p.x > window.innerWidth) {
        p.x = -p.size;
        p.y = Math.random() * window.innerHeight;
      }
      
      // Draw with smooth gradient glow
      if (this.ctx) {
        // Create a radial gradient for each particle
        const gradient = this.ctx.createRadialGradient(
          p.x, p.y, 0,
          p.x, p.y, p.size * 2
        );
        
        gradient.addColorStop(0, p.color);
        gradient.addColorStop(1, 'rgba(45, 27, 105, 0)');
        
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
        
        // Add a subtle connection line between some particles for a flowing effect
        if (i > 0 && i % 3 === 0 && this.particles[i - 1]) {
          const prev = this.particles[i - 1];
          const distance = Math.sqrt(Math.pow(p.x - prev.x, 2) + Math.pow(p.y - prev.y, 2));
          
          if (distance < 100) { // Only connect nearby particles
            this.ctx.beginPath();
            this.ctx.moveTo(p.x, p.y);
            this.ctx.lineTo(prev.x, prev.y);
            
            // Gradient line with variable opacity based on distance
            const lineOpacity = 0.05 * (1 - (distance / 100));
            this.ctx.strokeStyle = `rgba(79, 70, 229, ${lineOpacity})`;
            this.ctx.lineWidth = 0.5;
            this.ctx.stroke();
          }
        }
      }
    }
  },

  cleanup: function() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    window.removeEventListener("resize", this.handleResize.bind(this));
    this.particles = [];
    this.ctx = null;
    this.canvas = null;
  }
};

const AnimatedLines: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      // Initialize the animation controller
      animationController.init(canvasRef.current);
    }

    // Cleanup function for unmounting
    return () => {
      animationController.cleanup();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full -z-10"
      style={{ pointerEvents: 'none' }}
    />
  );
};

export default AnimatedLines;
