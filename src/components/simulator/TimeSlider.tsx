import { useState, useEffect, useCallback } from 'react';
import { timelineMilestones } from '@/lib/simulation-data';
import { Play, Pause, RotateCcw, Zap } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface TimeSliderProps {
  year: number;
  onChange: (year: number) => void;
  isPlaying: boolean;
  onPlayToggle: () => void;
  onReset: () => void;
}

export default function TimeSlider({ year, onChange, isPlaying, onPlayToggle, onReset }: TimeSliderProps) {
  const min = 2026;
  const max = 2050;
  const pct = ((year - min) / (max - min)) * 100;

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center gap-3">
        <button
          onClick={onPlayToggle}
          className="p-2 rounded-lg bg-surface-2 hover:bg-surface-3 text-foreground transition-colors"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
        <button
          onClick={onReset}
          className="p-2 rounded-lg bg-surface-2 hover:bg-surface-3 text-foreground transition-colors"
          aria-label="Reset"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <div className="flex-1 relative">
          {/* Track background */}
          <div className="h-2 rounded-full bg-surface-2 relative">
            {/* Filled track */}
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary to-quantum transition-all duration-150"
              style={{ width: `${pct}%` }}
            />
            {/* Milestone markers */}
            {timelineMilestones.map((m) => {
              const mPct = ((m.year - min) / (max - min)) * 100;
              return (
                <Tooltip key={m.year}>
                  <TooltipTrigger asChild>
                    <button
                      className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-surface-3 border-2 border-muted-foreground hover:border-foreground transition-colors z-10"
                      style={{ left: `${mPct}%`, marginLeft: '-6px' }}
                      onClick={() => onChange(m.year)}
                    />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-surface-2 border-border text-foreground">
                    <p className="font-semibold">{m.year} - {m.label}</p>
                    <p className="text-xs text-muted-foreground">{m.description}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
          {/* Range input overlay */}
          <input
            type="range"
            min={min}
            max={max}
            step={1}
            value={year}
            onChange={(e) => onChange(Number(e.target.value))}
            className="absolute inset-0 w-full opacity-0 cursor-pointer z-20"
            aria-label="Timeline year"
          />
          {/* Custom thumb */}
          <div
            className="absolute top-1/2 -translate-y-1/2 pointer-events-none z-10"
            style={{ left: `${pct}%`, marginLeft: '-20px' }}
          >
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-mono text-xs font-bold shadow-lg shadow-primary/30">
              {year}
            </div>
          </div>
        </div>
      </div>

      {/* Year labels */}
      <div className="flex justify-between px-12 text-xs text-muted-foreground font-mono">
        <span>2026</span>
        <span>2030</span>
        <span>2035</span>
        <span>2040</span>
        <span>2045</span>
        <span>2050</span>
      </div>
    </div>
  );
}
