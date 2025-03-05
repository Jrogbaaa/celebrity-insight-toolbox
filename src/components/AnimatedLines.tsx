
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
  direction: number; // 1 for forward, -1 for backward
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
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    // Enhanced line configuration
    const lineCount = 75; // More lines for better visibility
    const lines: Line[] = [];
    
    // Enhanced color palette with more opacity for better visibility
    const colors = [
      "rgba(79, 70, 229, 0.3)", // Primary indigo - increased opacity
      "rgba(67, 56, 202, 0.25)", // Indigo 700 - increased opacity
      "rgba(99, 102, 241, 0.3)", // Indigo 500 - increased opacity
      "rgba(45, 27, 105, 0.35)", // Original purple/indigo - increased opacity
      "rgba(55, 48, 163, 0.28)", // Indigo 800 - increased opacity
    ];
    
    // Create lines with enhanced properties
    for (let i = 0; i < lineCount; i++) {
      const startX = Math.random() * canvas.width;
      const startY = Math.random() * canvas.height;
      const angle = Math.random() * Math.PI * 2;
      const length = 250 + Math.random() * 700; // Longer lines for better visibility
      
      lines.push({
        start: { x: startX, y: startY },
        end: { 
          x: startX + Math.cos(angle) * length, 
          y: startY + Math.sin(angle) * length 
        },
        speed: 0.001 + Math.random() * 0.004, // Varied speeds
        progress: Math.random(),
        direction: Math.random() > 0.5 ? 1 : -1,
        color: colors[Math.floor(Math.random() * colors.length)],
        width: 1.5 + Math.random() * 2.5, // Thicker lines for better visibility
      });
    }

    // Animation with improved visuals
    const animate = () => {
      // Apply a more subtle fade effect
      ctx.fillStyle = "rgba(255, 255, 255, 0.01)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw lines
      lines.forEach((line, index) => {
        // Update progress
        line.progress += line.speed * line.direction;
        
        // Reverse direction when reaching endpoints
        if (line.progress >= 1 || line.progress <= 0) {
          line.direction *= -1;
        }
        
        // Calculate current point
        const currentX = line.start.x + (line.end.x - line.start.x) * line.progress;
        const currentY = line.start.y + (line.end.y - line.start.y) * line.progress;
        
        // Draw line from start to current position
        ctx.beginPath();
        ctx.moveTo(line.start.x, line.start.y);
        ctx.lineTo(currentX, currentY);
        
        ctx.strokeStyle = line.color;
        ctx.lineWidth = line.width;
        ctx.stroke();
        
        // Create new lines occasionally for more dynamic animation
        if (Math.random() < 0.002) {
          const angle = Math.random() * Math.PI * 2;
          const length = 250 + Math.random() * 700;
          line.start = { x: Math.random() * canvas.width, y: Math.random() * canvas.height };
          line.end = {
            x: line.start.x + Math.cos(angle) * length,
            y: line.start.y + Math.sin(angle) * length
          };
          line.progress = Math.random();
          line.color = colors[Math.floor(Math.random() * colors.length)];
          line.width = 1.5 + Math.random() * 2.5;
        }
      });
      
      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full -z-10"
      style={{ pointerEvents: 'none' }}
    />
  );
};

export default AnimatedLines;
