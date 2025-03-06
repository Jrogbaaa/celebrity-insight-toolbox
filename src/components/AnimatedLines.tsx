
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

const AnimatedLines: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      const scale = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * scale;
      canvas.height = window.innerHeight * scale;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(scale, scale);
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    // Enhanced line configuration
    const lineCount = 60; // Increased line count for better visibility
    const lines: Line[] = [];
    
    // Brand-appropriate color palette with increased opacity
    const colors = [
      "rgba(45, 27, 105, 0.3)", // Primary indigo with higher opacity
      "rgba(79, 70, 229, 0.25)", // Indigo 600 with higher opacity
      "rgba(139, 92, 246, 0.2)", // Violet/Purple with higher opacity
      "rgba(67, 56, 202, 0.25)", // Indigo 700 with higher opacity
      "rgba(99, 102, 241, 0.2)", // Indigo 500 with higher opacity
    ];
    
    // Create initial set of lines with better distribution
    for (let i = 0; i < lineCount; i++) {
      const startX = Math.random() * window.innerWidth;
      const startY = Math.random() * window.innerHeight;
      const angle = Math.random() * Math.PI * 2;
      const length = 100 + Math.random() * 350; // Longer lines for better visibility
      
      lines.push({
        start: { x: startX, y: startY },
        end: { 
          x: startX + Math.cos(angle) * length, 
          y: startY + Math.sin(angle) * length 
        },
        speed: 0.001 + Math.random() * 0.002, // Slightly faster animation
        progress: Math.random(),
        direction: Math.random() > 0.5 ? 1 : -1,
        color: colors[Math.floor(Math.random() * colors.length)],
        width: 1 + Math.random() * 2, // Slightly thicker lines
      });
    }

    let animationFrameId: number;
    let lastTime = 0;
    
    const animate = (time: number) => {
      animationFrameId = requestAnimationFrame(animate);
      
      // Calculate delta time to ensure smooth animation regardless of frame rate
      const deltaTime = time - lastTime;
      lastTime = time;
      
      // Only update every frame
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      
      lines.forEach(line => {
        // Scale the speed by delta time for consistent movement
        const speedFactor = deltaTime / 16; // normalize to 60fps
        line.progress += line.speed * line.direction * speedFactor;
        
        if (line.progress >= 1 || line.progress <= 0) {
          line.direction *= -1;
        }
        
        const currentX = line.start.x + (line.end.x - line.start.x) * line.progress;
        const currentY = line.start.y + (line.end.y - line.start.y) * line.progress;
        
        const gradient = ctx.createLinearGradient(
          line.start.x, 
          line.start.y, 
          currentX, 
          currentY
        );
        
        gradient.addColorStop(0, "rgba(45, 27, 105, 0.05)");
        gradient.addColorStop(0.5, line.color);
        gradient.addColorStop(1, "rgba(45, 27, 105, 0.05)");
        
        ctx.beginPath();
        ctx.moveTo(line.start.x, line.start.y);
        ctx.lineTo(currentX, currentY);
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = line.width;
        ctx.lineCap = "round"; // Rounded line caps for smoother appearance
        ctx.stroke();
      });
    };

    // Start the animation with timestamp
    animationFrameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
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
