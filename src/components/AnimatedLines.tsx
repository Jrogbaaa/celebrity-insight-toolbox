
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

    // Line configuration
    const lineCount = 30;
    const lines: Line[] = [];
    
    // Create lines
    for (let i = 0; i < lineCount; i++) {
      const startX = Math.random() * canvas.width;
      const startY = Math.random() * canvas.height;
      const angle = Math.random() * Math.PI * 2;
      const length = 200 + Math.random() * 400;
      
      lines.push({
        start: { x: startX, y: startY },
        end: { 
          x: startX + Math.cos(angle) * length, 
          y: startY + Math.sin(angle) * length 
        },
        speed: 0.002 + Math.random() * 0.002,
        progress: Math.random(),
        direction: Math.random() > 0.5 ? 1 : -1,
      });
    }

    // Animation
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
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
        
        // Vary opacity based on line index for visual interest
        const opacity = 0.05 + (index % 3) * 0.03;
        ctx.strokeStyle = `rgba(45, 27, 105, ${opacity})`;
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Randomly change line trajectory occasionally
        if (Math.random() < 0.001) {
          const angle = Math.random() * Math.PI * 2;
          const length = 200 + Math.random() * 400;
          line.start = { x: Math.random() * canvas.width, y: Math.random() * canvas.height };
          line.end = {
            x: line.start.x + Math.cos(angle) * length,
            y: line.start.y + Math.sin(angle) * length
          };
          line.progress = Math.random();
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
    />
  );
};

export default AnimatedLines;
