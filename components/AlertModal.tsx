import React from 'react';
import { BellRing, Moon, X } from 'lucide-react';
import { COLORS } from '../constants';

interface AlertModalProps {
  title: string;
  message: string;
  onStop: () => void;
  onSnooze?: () => void;
  isAlarm: boolean;
}

export const AlertModal: React.FC<AlertModalProps> = ({ title, message, onStop, onSnooze, isAlarm }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" />
      
      {/* Card */}
      <div className="relative bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl animate-bounce-in flex flex-col items-center text-center z-10">
        
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 animate-pulse`} 
             style={{ backgroundColor: isAlarm ? COLORS.CORAL : COLORS.MINT }}>
           <BellRing size={40} color="white" className={isAlarm ? 'animate-wiggle' : ''} />
        </div>

        <h2 className="text-2xl font-bold text-slate-800 mb-2">{title}</h2>
        <p className="text-slate-500 mb-8 text-lg">{message}</p>

        <div className="flex flex-col w-full space-y-3">
          <button 
            onClick={onStop}
            className="w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg active:scale-95 transition-all flex items-center justify-center space-x-2"
            style={{ backgroundColor: COLORS.CORAL }}
          >
            <X size={24} />
            <span>Stop</span>
          </button>
          
          {isAlarm && onSnooze && (
            <button 
              onClick={onSnooze}
              className="w-full py-4 rounded-xl text-slate-600 bg-slate-100 font-bold text-lg hover:bg-slate-200 active:scale-95 transition-all flex items-center justify-center space-x-2"
            >
              <Moon size={24} />
              <span>Snooze</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};