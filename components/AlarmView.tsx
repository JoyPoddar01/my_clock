import React, { useState } from 'react';
import { Plus, Trash2, Bell, BellOff, Check } from 'lucide-react';
import { Alarm, AppSettings } from '../types';
import { Card } from './ui/Card';
import { COLORS, DAYS_OF_WEEK } from '../constants';

interface AlarmViewProps {
  alarms: Alarm[];
  setAlarms: (alarms: Alarm[]) => void;
  settings: AppSettings;
}

export const AlarmView: React.FC<AlarmViewProps> = ({ alarms, setAlarms, settings }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTime, setNewTime] = useState('08:00');
  const [newLabel, setNewLabel] = useState('');
  const [newDays, setNewDays] = useState<number[]>([]);

  const toggleAlarm = (id: string) => {
    setAlarms(alarms.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a));
  };

  const deleteAlarm = (id: string) => {
    setAlarms(alarms.filter(a => a.id !== id));
  };

  const toggleDay = (dayIndex: number) => {
    if (newDays.includes(dayIndex)) {
      setNewDays(newDays.filter(d => d !== dayIndex));
    } else {
      setNewDays([...newDays, dayIndex].sort());
    }
  };

  const saveAlarm = () => {
    const alarm: Alarm = {
      id: Date.now().toString(),
      time: newTime,
      label: newLabel || 'Alarm',
      days: newDays,
      enabled: true,
    };
    setAlarms([...alarms, alarm]);
    setIsAdding(false);
    setNewTime('08:00');
    setNewLabel('');
    setNewDays([]);
  };

  const formatDisplayTime = (timeStr: string) => {
    if (settings.is24Hour) return timeStr;
    const [h, m] = timeStr.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
  };

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl font-bold text-slate-800">Alarms</h2>
        {!isAdding && (
           <button 
            onClick={() => setIsAdding(true)}
            className="p-3 rounded-full text-white shadow-lg transition-transform hover:scale-110 active:scale-95"
            style={{ backgroundColor: COLORS.BLUE }}
          >
            <Plus size={24} />
          </button>
        )}
      </div>

      {isAdding && (
        <Card className="animate-in fade-in slide-in-from-top-4 border-2" style={{ borderColor: COLORS.BLUE }}>
          <div className="space-y-4">
            <div className="flex flex-col">
              <label className="text-sm text-slate-500 mb-1">Time</label>
              <input 
                type="time" 
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="text-4xl font-bold bg-transparent outline-none text-slate-800"
              />
            </div>
            
            <div className="flex flex-col">
              <label className="text-sm text-slate-500 mb-1">Label</label>
              <input 
                type="text" 
                placeholder="Work, Gym, etc."
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                className="p-2 bg-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>

            <div>
              <label className="text-sm text-slate-500 mb-2 block">Repeat</label>
              <div className="flex justify-between">
                {DAYS_OF_WEEK.map((day, idx) => (
                  <button
                    key={day}
                    onClick={() => toggleDay(idx)}
                    className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center transition-colors ${
                      newDays.includes(idx) 
                        ? 'text-white' 
                        : 'bg-slate-100 text-slate-400'
                    }`}
                    style={{ backgroundColor: newDays.includes(idx) ? COLORS.BLUE : undefined }}
                  >
                    {day[0]}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex space-x-3 pt-2">
              <button 
                onClick={saveAlarm}
                className="flex-1 py-3 rounded-xl font-semibold text-white shadow-md active:scale-95 transition-all"
                style={{ backgroundColor: COLORS.BLUE }}
              >
                Save
              </button>
              <button 
                onClick={() => setIsAdding(false)}
                className="flex-1 py-3 rounded-xl font-semibold text-slate-600 bg-slate-200 hover:bg-slate-300 active:scale-95 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </Card>
      )}

      <div className="space-y-4 pb-20">
        {alarms.length === 0 && !isAdding && (
           <div className="text-center py-12 opacity-50">
              <Bell size={48} className="mx-auto mb-2 text-slate-300"/>
              <p>No alarms set.</p>
           </div>
        )}

        {alarms.map(alarm => (
          <Card key={alarm.id} className={`flex items-center justify-between p-5 ${!alarm.enabled ? 'opacity-60 grayscale-[0.5]' : ''}`}>
            <div>
               <div className="flex items-baseline space-x-2">
                 <span className="text-3xl font-bold text-slate-800">
                   {formatDisplayTime(alarm.time)}
                 </span>
               </div>
               <div className="text-sm text-slate-500 font-medium mt-1">
                 {alarm.label} 
                 <span className="mx-2">•</span>
                 {alarm.days.length === 0 
                   ? 'Once' 
                   : alarm.days.length === 7 
                     ? 'Every day' 
                     : alarm.days.length === 5 && !alarm.days.includes(0) && !alarm.days.includes(6)
                        ? 'Weekdays'
                        : alarm.days.map(d => DAYS_OF_WEEK[d]).join(', ')
                 }
               </div>
            </div>

            <div className="flex items-center space-x-3">
              <button 
                onClick={() => toggleAlarm(alarm.id)}
                className={`p-3 rounded-full transition-colors ${alarm.enabled ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}
              >
                {alarm.enabled ? <Check size={20} /> : <BellOff size={20} />}
              </button>
              <button 
                onClick={() => deleteAlarm(alarm.id)}
                className="p-3 rounded-full bg-red-50 text-red-400 hover:bg-red-100 transition-colors"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};