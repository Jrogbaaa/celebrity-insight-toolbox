
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
      const scale = window.devicePixelRatio;
      canvas.width = window.innerWidth * scale;
      canvas.height = window.innerHeight * scale;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(scale, scale);
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    // Enhanced line configuration
    const lineCount = 50;
    const lines: Line[] = [];
    
    // Brand-appropriate color palette
    const colors = [
      "rgba(45, 27, 105, 0.15)", // Primary indigo
      "rgba(79, 70, 229, 0.12)", // Indigo 600
      "rgba(139, 92, 246, 0.08)", // Violet/Purple
      "rgba(67, 56, 202, 0.10)", // Indigo 700
      "rgba(99, 102, 241, 0.07)", // Indigo 500
    ];
    
    // Create initial set of lines
    for (let i = 0; i < lineCount; i++) {
      const startX = Math.random() * canvas.width;
      const startY = Math.random() * canvas.height;
      const angle = Math.random() * Math.PI * 2;
      const length = 100 + Math.random() * 300;
      
      lines.push({
        start: { x: startX, y: startY },
        end: { 
          x: startX + Math.cos(angle) * length, 
          y: startY + Math.sin(angle) * length 
        },
        speed: 0.0005 + Math.random() * 0.001,
        progress: Math.random(),
        direction: Math.random() > 0.5 ? 1 : -1,
        color: colors[Math.floor(Math.random() * colors.length)],
        width: 0.5 + Math.random() * 1.5,
      });
    }

    let animationFrameId: number;
    
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      lines.forEach(line => {
        line.progress += line.speed * line.direction;
        
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
        
        gradient.addColorStop(0, "rgba(45, 27, 105, 0.01)");
        gradient.addColorStop(0.5, line.color);
        gradient.addColorStop(1, "rgba(45, 27, 105, 0.01)");
        
        ctx.beginPath();
        ctx.moveTo(line.start.x, line.start.y);
        ctx.lineTo(currentX, currentY);
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = line.width;
        ctx.stroke();
      });
    };

    animate();

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
