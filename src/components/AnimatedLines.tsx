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

    // Improved line configuration
    const lineCount = 50; // Increased line count for more visual interest
    const lines: Line[] = [];
    
    // Color palette (keeping with the existing color scheme)
    const colors = [
      "rgba(79, 70, 229, 0.2)", // Primary indigo
      "rgba(67, 56, 202, 0.15)", // Indigo 700
      "rgba(99, 102, 241, 0.2)", // Indigo 500
      "rgba(45, 27, 105, 0.25)", // Original purple/indigo
      "rgba(55, 48, 163, 0.18)", // Indigo 800
    ];
    
    // Create lines with enhanced properties
    for (let i = 0; i < lineCount; i++) {
      const startX = Math.random() * canvas.width;
      const startY = Math.random() * canvas.height;
      const angle = Math.random() * Math.PI * 2;
      const length = 200 + Math.random() * 600; // Increased max length
      
      lines.push({
        start: { x: startX, y: startY },
        end: { 
          x: startX + Math.cos(angle) * length, 
          y: startY + Math.sin(angle) * length 
        },
        speed: 0.001 + Math.random() * 0.003, // Varied speeds
        progress: Math.random(),
        direction: Math.random() > 0.5 ? 1 : -1,
        color: colors[Math.floor(Math.random() * colors.length)],
        width: 1 + Math.random() * 2, // Varied line widths
      });
    }

    // Animation with improved visuals
    const animate = () => {
      // Apply a subtle fade effect instead of clearing completely
      ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
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
          const length = 200 + Math.random() * 600;
          line.start = { x: Math.random() * canvas.width, y: Math.random() * canvas.height };
          line.end = {
            x: line.start.x + Math.cos(angle) * length,
            y: line.start.y + Math.sin(angle) * length
          };
          line.progress = Math.random();
          line.color = colors[Math.floor(Math.random() * colors.length)];
          line.width = 1 + Math.random() * 2;
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
