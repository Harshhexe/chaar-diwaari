"use client";

import { useRef, useEffect } from "react";
import { usePrefersReducedMotion } from "@/lib/hooks";

interface LetterGlitchProps {
  glitchColors?: string[];
  glitchSpeed?: number;
  centerVignette?: boolean;
  outerVignette?: boolean;
  smooth?: boolean;
  backgroundColor?: string;
  className?: string;
  characters?: string;
}

/**
 * REACT BITS — LETTER GLITCH BACKGROUND
 * ---------------------------------------------------------------------------
 * An ambient, cyber-industrial canvas matrix of scrambling characters,
 * symbols, and telemetry customized to Chaar Diwaari's oxide red and void palette.
 * GPU-accelerated, lightweight, zero dependencies, with radial vignetting for readability.
 */
export function LetterGlitch({
  glitchColors = [
    "#141211", // subtle dark carbon
    "#221310", // burnt shadow
    "#3a140d", // deep dried blood
    "#6b1b0b", // dark oxide
    "#a1260e", // crimson flare
    "#d7300f", // signature Chaar Diwaari oxide red
  ],
  glitchSpeed = 65,
  centerVignette = true,
  outerVignette = true,
  smooth = false,
  backgroundColor = "#050505",
  className = "",
  characters = "0123456789####CHAARDIWAARI/*<>{}[]?!_BAROODROSHNI",
}: LetterGlitchProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const letters = useRef<
    {
      char: string;
      color: string;
    }[]
  >([]);
  const grid = useRef({ columns: 0, rows: 0 });
  const context = useRef<CanvasRenderingContext2D | null>(null);
  const lastGlitchTime = useRef(Date.now());
  const reduced = usePrefersReducedMotion();

  const lettersAndSymbols = Array.from(characters);

  const fontSize = 13;
  const charWidth = 10;
  const charHeight = 20;

  const getRandomChar = () => {
    return lettersAndSymbols[Math.floor(Math.random() * lettersAndSymbols.length)];
  };

  const getRandomColor = () => {
    // 70% chance of subtle dark carbon/burnt shadow, 30% chance of vivid oxide flare
    if (Math.random() < 0.72) {
      return glitchColors[Math.floor(Math.random() * 2)];
    }
    return glitchColors[2 + Math.floor(Math.random() * (glitchColors.length - 2))];
  };

  const calculateGrid = (width: number, height: number) => {
    const columns = Math.ceil(width / charWidth);
    const rows = Math.ceil(height / charHeight);
    return { columns, rows };
  };

  const initializeLetters = (columns: number, rows: number) => {
    grid.current = { columns, rows };
    const totalLetters = columns * rows;
    letters.current = Array.from({ length: totalLetters }, () => ({
      char: getRandomChar(),
      color: getRandomColor(),
    }));
  };

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = parent.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    if (context.current) {
      context.current.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    const { columns, rows } = calculateGrid(rect.width, rect.height);
    initializeLetters(columns, rows);
    drawLetters();
  };

  const drawLetters = () => {
    if (!context.current || letters.current.length === 0 || !canvasRef.current) return;
    const ctx = context.current;
    const rect = canvasRef.current.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    ctx.font = `${fontSize}px "JetBrains Mono", monospace`;
    ctx.textBaseline = "top";

    const cols = grid.current.columns;
    const count = letters.current.length;
    for (let i = 0; i < count; i++) {
      const item = letters.current[i];
      const x = (i % cols) * charWidth;
      const y = Math.floor(i / cols) * charHeight;
      ctx.fillStyle = item.color;
      ctx.fillText(item.char, x, y);
    }
  };

  const updateLetters = () => {
    if (!letters.current || letters.current.length === 0) return;

    // Glitch a dynamic slice of characters per frame
    const updateCount = Math.max(2, Math.floor(letters.current.length * 0.04));

    for (let i = 0; i < updateCount; i++) {
      const index = Math.floor(Math.random() * letters.current.length);
      if (!letters.current[index]) continue;

      letters.current[index].char = getRandomChar();
      letters.current[index].color = getRandomColor();
    }
  };

  const animate = () => {
    if (reduced) return;
    const now = Date.now();
    if (now - lastGlitchTime.current >= glitchSpeed) {
      updateLetters();
      drawLetters();
      lastGlitchTime.current = now;
    }

    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    context.current = canvas.getContext("2d");
    resizeCanvas();

    if (!reduced) {
      animationRef.current = requestAnimationFrame(animate);
    }

    let resizeTimeout: ReturnType<typeof setTimeout>;

    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
        resizeCanvas();
        if (!reduced) {
          animationRef.current = requestAnimationFrame(animate);
        }
      }, 120);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", handleResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [glitchSpeed, smooth, reduced]);

  return (
    <div
      className={`relative w-full h-full overflow-hidden select-none pointer-events-none ${className}`}
      style={{ backgroundColor }}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        className="block w-full h-full opacity-45 transition-opacity duration-1000"
      />
      {outerVignette && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(5,5,5,0.15) 20%, rgba(5,5,5,0.7) 70%, rgba(5,5,5,0.98) 100%)",
          }}
        />
      )}
      {centerVignette && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at center, rgba(5,5,5,0.45) 0%, rgba(5,5,5,0) 65%)",
          }}
        />
      )}
    </div>
  );
}

export default LetterGlitch;
