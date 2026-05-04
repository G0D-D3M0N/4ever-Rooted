import { useState, useEffect, useRef } from "react";
import { useScroll, useTransform } from "framer-motion";
import { useLocation } from "wouter";

const CURSOR_TRAIL_STORAGE_KEY = "cursorTrailEnabled";
const CURSOR_TRAIL_EVENT = "cursor-trail-toggle";

export function CursorTrail() {
  const [location] = useLocation();
  const [enabled, setEnabled] = useState(false);
  const [points, setPoints] = useState<{ x: number; y: number; time: number; color: string; fadeStartTime: number | null }[]>([]);
  const requestRef = useRef<number>();
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const hueRef = useRef(0);
  const isMovingRef = useRef(false);
  const stopTimeoutRef = useRef<NodeJS.Timeout>();
  
  const { scrollYProgress } = useScroll();
  // Only visible at the very top (Hero section)
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
      setPoints([]);
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
        setPoints(prev => prev.map(p => p.fadeStartTime === null ? { ...p, fadeStartTime: stopTime } : p));
      }, 50);
    };

    const animate = () => {
      const now = Date.now();
      hueRef.current = (hueRef.current + 2) % 360;
      
      if (lastPointRef.current && isMovingRef.current) {
        setPoints((prev) => {
          const newPoints = [...prev, { 
            ...lastPointRef.current!, 
            time: now,
            color: `hsl(${hueRef.current}, 100%, 50%)`,
            fadeStartTime: null
          }];
          return newPoints.filter((p) => {
            if (p.fadeStartTime === null) return true;
            return now - p.fadeStartTime < 3500;
          });
        });
      } else {
        setPoints((prev) => prev.filter((p) => {
          if (p.fadeStartTime === null) return true;
          return now - p.fadeStartTime < 3500;
        }));
      }
      requestRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("touchmove", handleMove);
    requestRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("touchmove", handleMove);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (stopTimeoutRef.current) clearTimeout(stopTimeoutRef.current);
    };
  }, [location, enabled]);

  if (location !== "/" || !enabled || points.length < 2) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[40] overflow-hidden" style={{ opacity: scrollOpacity.get() }}>
      <svg className="w-full h-full">
        <defs>
          <filter id="rainbow-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        <g filter="url(#rainbow-glow)">
          {points.map((point, i) => {
            if (i === 0) return null;
            const prevPoint = points[i - 1];
            let opacity = 0.8;
            
            if (point.fadeStartTime !== null) {
              const age = Date.now() - point.fadeStartTime;
              opacity = Math.max(0, 0.8 * (1 - age / 3500));
            }
            
            return (
              <line
                key={`point-${point.time}-${i}`}
                x1={prevPoint.x}
                y1={prevPoint.y}
                x2={point.x}
                y2={point.y}
                stroke={point.color}
                strokeWidth={4}
                strokeLinecap="round"
                strokeOpacity={opacity}
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
}
