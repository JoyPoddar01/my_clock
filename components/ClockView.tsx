import React, { useEffect, useState } from 'react';
import { Card } from './ui/Card';
import { COLORS } from '../constants';
import { AppSettings } from '../types';

interface ClockViewProps {
  settings: AppSettings;
}

export const ClockView: React.FC<ClockViewProps> = ({ settings }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    // Update immediately to avoid delay
    setTime(new Date());
    
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    let ampm = '';

    if (!settings.is24Hour) {
      ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
    }

    const hStr = hours.toString().padStart(2, '0');
    const mStr = minutes.toString().padStart(2, '0');
    const sStr = seconds.toString().padStart(2, '0');

    return { hStr, mStr, sStr, ampm };
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const { hStr, mStr, sStr, ampm } = formatTime(time);

  return (
    <div className="flex flex-col items-center justify-center space-y-8 animate-fade-in">
      <Card className="w-full flex flex-col items-center justify-center py-12 relative overflow-hidden group">
        {/* Decorative background blobs */}
        <div className="absolute top-[-50%] left-[-20%] w-64 h-64 bg-rose-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute top-[-50%] right-[-20%] w-64 h-64 bg-amber-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-20 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>

        <h2 className="text-slate-500 font-medium mb-4 z-10">{formatDate(time)}</h2>
        
        <div className="flex items-baseline space-x-2 z-10 text-slate-800">
          <span className="text-7xl sm:text-8xl font-bold tracking-tighter" style={{ color: COLORS.DARK }}>
            {hStr}:{mStr}
          </span>
          <div className="flex flex-col items-start justify-end h-16 sm:h-20 pb-2">
             {!settings.is24Hour && (
              <span className="text-xl font-bold text-slate-400 mb-1">{ampm}</span>
            )}
            <span 
              className="text-2xl sm:text-3xl font-medium" 
              style={{ color: COLORS.CORAL }}
            >
              {sStr}
            </span>
          </div>
        </div>
      </Card>
      
      <div className="grid grid-cols-2 gap-4 w-full">
         <Card className="flex flex-col items-center justify-center space-y-2 hover:scale-105 cursor-default">
            <span className="text-4xl">🌞</span>
            <span className="text-sm text-slate-400 font-medium">Have a great day!</span>
         </Card>
         <Card className="flex flex-col items-center justify-center space-y-2 hover:scale-105 cursor-default">
             <div className="text-2xl font-bold text-slate-700">
                {settings.is24Hour ? '24h' : '12h'}
             </div>
             <span className="text-sm text-slate-400 font-medium">Mode Active</span>
         </Card>
      </div>
    </div>
  );
};