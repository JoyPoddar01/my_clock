import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Plus, Minus } from 'lucide-react';
import { TimerState } from '../types';
import { Card } from './ui/Card';
import { COLORS } from '../constants';

interface TimerViewProps {
  timerState: TimerState;
  setTimerState: React.Dispatch<React.SetStateAction<TimerState>>;
  onTimerComplete: () => void;
}

export const TimerView: React.FC<TimerViewProps> = ({ timerState, setTimerState, onTimerComplete }) => {
  const [inputMinutes, setInputMinutes] = useState(5);
  const intervalRef = useRef<number | null>(null);

  // Sync internal input state with timer if idle
  useEffect(() => {
    if (!timerState.isRunning && !timerState.isPaused && timerState.remainingSeconds === 0) {
      // Logic could go here if we wanted to preset, but we'll leave input separate
    }
  }, [timerState]);

  useEffect(() => {
    if (timerState.isRunning && timerState.remainingSeconds > 0) {
      intervalRef.current = setInterval(() => {
        setTimerState(prev => {
          if (prev.remainingSeconds <= 1) {
             clearInterval(intervalRef.current!);
             onTimerComplete();
             return { ...prev, remainingSeconds: 0, isRunning: false, isPaused: false };
          }
          return { ...prev, remainingSeconds: prev.remainingSeconds - 1 };
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timerState.isRunning, onTimerComplete, setTimerState]);

  const startTimer = () => {
    if (timerState.remainingSeconds === 0 && inputMinutes > 0) {
      setTimerState({
        totalSeconds: inputMinutes * 60,
        remainingSeconds: inputMinutes * 60,
        isRunning: true,
        isPaused: false
      });
    } else if (timerState.isPaused) {
      setTimerState(prev => ({ ...prev, isRunning: true, isPaused: false }));
    }
  };

  const pauseTimer = () => {
    setTimerState(prev => ({ ...prev, isRunning: false, isPaused: true }));
  };

  const resetTimer = () => {
    setTimerState({
      totalSeconds: 0,
      remainingSeconds: 0,
      isRunning: false,
      isPaused: false
    });
  };

  const adjustTime = (delta: number) => {
    setInputMinutes(prev => Math.max(1, Math.min(60, prev + delta)));
  };

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = timerState.totalSeconds > 0 
    ? ((timerState.totalSeconds - timerState.remainingSeconds) / timerState.totalSeconds) * 100 
    : 0;
  
  const isActive = timerState.isRunning || timerState.isPaused;

  return (
    <div className="flex flex-col items-center justify-center space-y-8 animate-fade-in">
      {!isActive ? (
        <Card className="w-full flex flex-col items-center py-10">
          <h2 className="text-slate-500 font-medium mb-6">Set Timer (Minutes)</h2>
          <div className="flex items-center space-x-6 mb-8">
            <button 
              onClick={() => adjustTime(-1)}
              className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 active:scale-95 transition-all text-slate-600"
            >
              <Minus size={24} />
            </button>
            <span className="text-6xl font-bold text-slate-800 w-24 text-center">{inputMinutes}</span>
            <button 
              onClick={() => adjustTime(1)}
              className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 active:scale-95 transition-all text-slate-600"
            >
              <Plus size={24} />
            </button>
          </div>
          <button 
            onClick={startTimer}
            className="w-full max-w-xs py-4 rounded-xl text-white font-bold text-lg shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center justify-center space-x-2"
            style={{ backgroundColor: COLORS.MINT }}
          >
            <Play size={24} fill="currentColor" />
            <span>Start</span>
          </button>
        </Card>
      ) : (
        <div className="w-full flex flex-col items-center">
          {/* Progress Circle */}
          <div className="relative w-64 h-64 flex items-center justify-center mb-8">
             <svg className="w-full h-full transform -rotate-90">
               <circle
                 cx="128"
                 cy="128"
                 r="120"
                 stroke="#E2E8F0"
                 strokeWidth="12"
                 fill="transparent"
               />
               <circle
                 cx="128"
                 cy="128"
                 r="120"
                 stroke={COLORS.MINT}
                 strokeWidth="12"
                 fill="transparent"
                 strokeDasharray={2 * Math.PI * 120}
                 strokeDashoffset={2 * Math.PI * 120 * (progress / 100)}
                 strokeLinecap="round"
                 className="transition-all duration-1000 ease-linear"
               />
             </svg>
             <div className="absolute inset-0 flex items-center justify-center">
               <span className="text-5xl font-bold text-slate-800">
                 {formatTime(timerState.remainingSeconds)}
               </span>
             </div>
          </div>

          <div className="flex items-center space-x-4 w-full justify-center">
            {timerState.isRunning ? (
               <button 
                 onClick={pauseTimer}
                 className="p-4 rounded-full text-white shadow-lg active:scale-95 transition-transform"
                 style={{ backgroundColor: COLORS.YELLOW }}
               >
                 <Pause size={32} fill="currentColor" />
               </button>
            ) : (
               <button 
                 onClick={startTimer}
                 className="p-4 rounded-full text-white shadow-lg active:scale-95 transition-transform"
                 style={{ backgroundColor: COLORS.MINT }}
               >
                 <Play size={32} fill="currentColor" />
               </button>
            )}
            
            <button 
              onClick={resetTimer}
              className="p-4 rounded-full bg-slate-200 text-slate-600 shadow-lg active:scale-95 transition-transform hover:bg-slate-300"
            >
              <RotateCcw size={32} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};