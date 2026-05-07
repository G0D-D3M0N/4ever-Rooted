import { useState, useEffect, useRef } from "react";
import { useScroll, useTransform } from "framer-motion";
import { useLocation } from "wouter";

const CURSOR_TRAIL_STORAGE_KEY = "cursorTrailEnabled";
const CURSOR_TRAIL_EVENT = "cursor-trail-toggle";

interface Point {
  x: number;
  y: number;
  time: number;
  color: string;
  fadeStartTime: number | null;
}

export function CursorTrail() {
  const [location] = useLocation();
  const [enabled, setEnabled] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointsRef = useRef<Point[]>([]);
  const requestRef = useRef<number>();
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const hueRef = useRef(0);
  const isMovingRef = useRef(false);
  const stopTimeoutRef = useRef<NodeJS.Timeout>();
  
  const { scrollYProgress } = useScroll();
  const scrollOpacity = useTransform(scrollYProgress, [0, 0.05], [1, 0]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const syncFromStorage = () => {
      const value = window.localStorage.getItem(CURSOR_TRAIL_STORAGE_KEY);
      setEnabled(value === "true");
    };

    syncFromStorage();
    window.addEventListener("storage", syncFromStorage);
    window.addEventListener(CURSOR_TRAIL_EVENT, syncFromStorage);

    return () => {
      window.removeEventListener("storage", syncFromStorage);
      window.removeEventListener(CURSOR_TRAIL_EVENT, syncFromStorage);
    };
  }, []);

  useEffect(() => {
    if (location === "/" && enabled) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [location, enabled]);

  useEffect(() => {
    if (location !== "/" || !enabled) {
      pointsRef.current = [];
      return;
    }

    const handleMove = (e: MouseEvent | TouchEvent) => {
      const x = "touches" in e ? e.touches[0].clientX : e.clientX;
      const y = "touches" in e ? e.touches[0].clientY : e.clientY;
      lastPointRef.current = { x, y };
      
      isMovingRef.current = true;
      if (stopTimeoutRef.current) clearTimeout(stopTimeoutRef.current);
      
      stopTimeoutRef.current = setTimeout(() => {
        isMovingRef.current = false;
        const stopTime = Date.now();
        pointsRef.current = pointsRef.current.map(p => 
          p.fadeStartTime === null ? { ...p, fadeStartTime: stopTime } : p
        );
      }, 50);
    };

    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const now = Date.now();
      hueRef.current = (hueRef.current + 2) % 360;

      // Update points
      if (lastPointRef.current && isMovingRef.current) {
        pointsRef.current.push({
          ...lastPointRef.current,
          time: now,
          color: `hsl(${hueRef.current}, 100%, 50%)`,
          fadeStartTime: null
        });
      }

      pointsRef.current = pointsRef.current.filter(p => {
        if (p.fadeStartTime === null) return true;
        return now - p.fadeStartTime < 2500; // Shorter fade for performance
      });

      // Clear and Draw
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (pointsRef.current.length > 1) {
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.lineWidth = 4;
        ctx.shadowBlur = 12;

        for (let i = 1; i < pointsRef.current.length; i++) {
          const p1 = pointsRef.current[i - 1];
          const p2 = pointsRef.current[i];
          
          let opacity = 0.8;
          if (p2.fadeStartTime !== null) {
            const age = now - p2.fadeStartTime;
            opacity = Math.max(0, 0.8 * (1 - age / 2500));
          }

          if (opacity <= 0) continue;

          ctx.beginPath();
          ctx.strokeStyle = p2.color.replace("hsl", "hsla").replace(")", `, ${opacity})`);
          ctx.shadowColor = p2.color;
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }

      requestRef.current = requestAnimationFrame(draw);
    };

    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("touchmove", handleMove);
    window.addEventListener("resize", handleResize);
    handleResize();
    requestRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("resize", handleResize);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (stopTimeoutRef.current) clearTimeout(stopTimeoutRef.current);
    };
  }, [location, enabled]);

  if (location !== "/" || !enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[40]"
      style={{ opacity: scrollOpacity.get() }}
    />
  );
}

