
import React, { useEffect, useRef } from "react";

interface Point {
  x: number;
  y: number;
}

interface Line {
  start: Point;
  end: Point;
  speed: number;
  progress: number;
  direction: number;
  color: string;
  width: number;
}

// Dedicated animation controller
const animationController = {
  lines: [] as Line[],
  ctx: null as CanvasRenderingContext2D | null,
  canvas: null as HTMLCanvasElement | null,
  animationFrameId: 0,
  lastTime: 0,
  colors: [
    "rgba(45, 27, 105, 0.4)", // Primary indigo with higher opacity
    "rgba(79, 70, 229, 0.35)", // Indigo 600 with higher opacity
    "rgba(139, 92, 246, 0.3)", // Violet/Purple with higher opacity
    "rgba(67, 56, 202, 0.35)", // Indigo 700 with higher opacity
    "rgba(99, 102, 241, 0.3)", // Indigo 500 with higher opacity
  ],

  init(canvas: HTMLCanvasElement) {
    if (!canvas) return;
    
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    if (!this.ctx) return;
    
    this.setupCanvas();
    this.createLines();
    this.startAnimation();
    
    window.addEventListener("resize", this.handleResize);
  },

  setupCanvas() {
    if (!this.canvas || !this.ctx) return;
    
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
    this.createLines(); // Recreate lines on resize
  },

  createLines() {
    if (!this.canvas || !this.ctx) return;
    
    const lineCount = 80; // Increased line count for better visibility
    this.lines = [];
    
    for (let i = 0; i < lineCount; i++) {
      const startX = Math.random() * window.innerWidth;
      const startY = Math.random() * window.innerHeight;
      const angle = Math.random() * Math.PI * 2;
      const length = 150 + Math.random() * 350; // Longer lines for better visibility
      
      this.lines.push({
        start: { x: startX, y: startY },
        end: { 
          x: startX + Math.cos(angle) * length, 
          y: startY + Math.sin(angle) * length 
        },
        speed: 0.001 + Math.random() * 0.003, // Slightly faster animation
        progress: Math.random(),
        direction: Math.random() > 0.5 ? 1 : -1,
        color: this.colors[Math.floor(Math.random() * this.colors.length)],
        width: 1.5 + Math.random() * 3, // Thicker lines for better visibility
      });
    }
  },

  startAnimation() {
    this.lastTime = performance.now();
    this.animationFrameId = requestAnimationFrame(this.animate);
  },

  animate: function(time: number) {
    if (!this.ctx || !this.canvas) return;
    
    this.animationFrameId = requestAnimationFrame(this.animate);
    
    // Calculate delta time to ensure smooth animation regardless of frame rate
    const deltaTime = time - this.lastTime;
    this.lastTime = time;
    
    // Clear canvas
    this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    
    // Draw each line
    this.lines.forEach(line => {
      // Scale the speed by delta time for consistent movement
      const speedFactor = deltaTime / 16; // normalize to 60fps
      line.progress += line.speed * line.direction * speedFactor;
      
      if (line.progress >= 1 || line.progress <= 0) {
        line.direction *= -1;
      }
      
      const currentX = line.start.x + (line.end.x - line.start.x) * line.progress;
      const currentY = line.start.y + (line.end.y - line.start.y) * line.progress;
      
      const gradient = this.ctx?.createLinearGradient(
        line.start.x, 
        line.start.y, 
        currentX, 
        currentY
      );
      
      if (gradient) {
        gradient.addColorStop(0, "rgba(45, 27, 105, 0.1)");
        gradient.addColorStop(0.5, line.color);
        gradient.addColorStop(1, "rgba(45, 27, 105, 0.1)");
        
        if (this.ctx) {
          this.ctx.beginPath();
          this.ctx.moveTo(line.start.x, line.start.y);
          this.ctx.lineTo(currentX, currentY);
          
          this.ctx.strokeStyle = gradient;
          this.ctx.lineWidth = line.width;
          this.ctx.lineCap = "round"; // Rounded line caps for smoother appearance
          this.ctx.stroke();
        }
      }
    });
  },

  cleanup() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    window.removeEventListener("resize", this.handleResize);
    this.lines = [];
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
