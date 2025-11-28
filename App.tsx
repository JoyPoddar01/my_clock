import React, { useState, useEffect, useRef } from 'react';
import { Clock, AlarmClock, Timer as TimerIcon, Settings } from 'lucide-react';
import { Container } from './components/ui/Container';
import { ClockView } from './components/ClockView';
import { AlarmView } from './components/AlarmView';
import { TimerView } from './components/TimerView';
import { SettingsPanel } from './components/SettingsPanel';
import { AlertModal } from './components/AlertModal';
import { audioService } from './services/audioService';
import { Alarm, TimerState, AppSettings, Tab } from './types';
import { COLORS, DEFAULT_SETTINGS, STORAGE_KEYS } from './constants';

const App: React.FC = () => {
  // --- State ---
  const [activeTab, setActiveTab] = useState<Tab>(Tab.CLOCK);
  
  // Alarms
  const [alarms, setAlarms] = useState<Alarm[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ALARMS);
    return saved ? JSON.parse(saved) : [];
  });

  // Settings
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  // Timer
  const [timerState, setTimerState] = useState<TimerState>({
    totalSeconds: 0,
    remainingSeconds: 0,
    isRunning: false,
    isPaused: false
  });

  // Alert State
  const [alertState, setAlertState] = useState<{
    active: boolean;
    type: 'ALARM' | 'TIMER';
    label: string;
    alarmId?: string;
  }>({ active: false, type: 'ALARM', label: '' });

  // Refs for tracking time loops
  const lastCheckedMinute = useRef<string>('');

  // --- Persistence ---
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ALARMS, JSON.stringify(alarms));
  }, [alarms]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  // --- Logic ---

  // Main Clock Loop for Alarms
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentHours = now.getHours().toString().padStart(2, '0');
      const currentMinutes = now.getMinutes().toString().padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;
      const currentDay = now.getDay(); // 0-6

      // Only check once per minute
      if (currentTimeStr !== lastCheckedMinute.current) {
        lastCheckedMinute.current = currentTimeStr;
        
        // Find triggering alarms
        const triggeringAlarm = alarms.find(a => {
          if (!a.enabled) return false;
          // Check time match
          if (a.time !== currentTimeStr) return false;
          // Check day match
          if (a.days.length > 0 && !a.days.includes(currentDay)) return false;
          return true;
        });

        if (triggeringAlarm && !alertState.active) {
          triggerAlert('ALARM', triggeringAlarm.label, triggeringAlarm.id);
          
          // If it's a one-time alarm, disable it locally
          if (triggeringAlarm.days.length === 0) {
            setAlarms(prev => prev.map(a => a.id === triggeringAlarm.id ? { ...a, enabled: false } : a));
          }
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [alarms, alertState.active]);

  const triggerAlert = (type: 'ALARM' | 'TIMER', label: string, alarmId?: string) => {
    setAlertState({ active: true, type, label, alarmId });
    audioService.playAlarm(settings.volume);
  };

  const stopAlert = () => {
    audioService.stopAlarm();
    setAlertState({ active: false, type: 'ALARM', label: '' });
  };

  const snoozeAlarm = () => {
    stopAlert();
    // Create a one-time snooze alarm
    const now = new Date();
    now.setMinutes(now.getMinutes() + settings.snoozeMinutes);
    const h = now.getHours().toString().padStart(2, '0');
    const m = now.getMinutes().toString().padStart(2, '0');
    
    const snoozeAlarmObj: Alarm = {
      id: Date.now().toString(),
      time: `${h}:${m}`,
      label: `Snooze: ${alertState.label}`,
      days: [], // one-time
      enabled: true
    };
    
    setAlarms(prev => [...prev, snoozeAlarmObj]);
  };

  const handleTimerComplete = () => {
    triggerAlert('TIMER', 'Time is up!');
  };

  // --- Render ---
  return (
    <div className="min-h-screen bg-slate-50 font-poppins selection:bg-rose-200">
      
      {/* Alert Overlay */}
      {alertState.active && (
        <AlertModal 
          title={alertState.type === 'ALARM' ? 'Alarm' : 'Timer Done!'}
          message={alertState.label || 'Time is up!'}
          isAlarm={alertState.type === 'ALARM'}
          onStop={stopAlert}
          onSnooze={alertState.type === 'ALARM' ? snoozeAlarm : undefined}
        />
      )}

      {/* Main Content */}
      <Container>
        {activeTab === Tab.CLOCK && <ClockView settings={settings} />}
        {activeTab === Tab.ALARM && <AlarmView alarms={alarms} setAlarms={setAlarms} settings={settings} />}
        {activeTab === Tab.TIMER && <TimerView timerState={timerState} setTimerState={setTimerState} onTimerComplete={handleTimerComplete} />}
        {activeTab === Tab.SETTINGS && <SettingsPanel settings={settings} setSettings={setSettings} />}
      </Container>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-slate-200 p-2 safe-area-pb">
        <div className="max-w-md mx-auto flex justify-around items-center">
          <NavButton 
            active={activeTab === Tab.CLOCK} 
            onClick={() => setActiveTab(Tab.CLOCK)} 
            icon={<Clock />} 
            label="Clock"
            color={COLORS.CORAL}
          />
          <NavButton 
            active={activeTab === Tab.ALARM} 
            onClick={() => setActiveTab(Tab.ALARM)} 
            icon={<AlarmClock />} 
            label="Alarm"
            color={COLORS.BLUE}
          />
          <NavButton 
            active={activeTab === Tab.TIMER} 
            onClick={() => setActiveTab(Tab.TIMER)} 
            icon={<TimerIcon />} 
            label="Timer"
            color={COLORS.MINT}
          />
          <NavButton 
            active={activeTab === Tab.SETTINGS} 
            onClick={() => setActiveTab(Tab.SETTINGS)} 
            icon={<Settings />} 
            label="Config"
            color={COLORS.PURPLE}
          />
        </div>
      </div>
    </div>
  );
};

// Sub-component for nav button
const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string; color: string }> = ({ 
  active, onClick, icon, label, color 
}) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 w-16 ${active ? '-translate-y-4 shadow-lg bg-white' : 'text-slate-400'}`}
  >
    <div 
      className={`p-2 rounded-full transition-colors ${active ? 'text-white' : ''}`}
      style={{ backgroundColor: active ? color : 'transparent' }}
    >
      {React.cloneElement(icon as React.ReactElement, { size: 24 })}
    </div>
    {active && <span className="text-xs font-bold mt-1 animate-fade-in" style={{ color }}>{label}</span>}
  </button>
);

export default App;