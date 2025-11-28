import React from 'react';
import { AppSettings } from '../types';
import { Card } from './ui/Card';
import { COLORS } from '../constants';
import { Volume2 } from 'lucide-react';

interface SettingsPanelProps {
  settings: AppSettings;
  setSettings: (settings: AppSettings) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, setSettings }) => {
  
  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings({ ...settings, [key]: value });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-slate-800">Settings</h2>
      
      <Card>
        <div className="flex items-center justify-between py-2">
           <div>
             <h3 className="font-semibold text-slate-800">24-Hour Clock</h3>
             <p className="text-sm text-slate-500">Use military time format</p>
           </div>
           <button 
             onClick={() => updateSetting('is24Hour', !settings.is24Hour)}
             className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ${settings.is24Hour ? 'bg-green-500' : 'bg-slate-200'}`}
           >
             <div className={`w-6 h-6 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${settings.is24Hour ? 'translate-x-6' : 'translate-x-0'}`} />
           </button>
        </div>
      </Card>

      <Card>
        <div className="space-y-4">
           <div className="flex items-center justify-between">
             <div>
               <h3 className="font-semibold text-slate-800">Volume</h3>
               <p className="text-sm text-slate-500">Alarm sound level</p>
             </div>
             <Volume2 className="text-slate-400" />
           </div>
           <input 
             type="range" 
             min="0" 
             max="1" 
             step="0.1"
             value={settings.volume}
             onChange={(e) => updateSetting('volume', parseFloat(e.target.value))}
             className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
             style={{ accentColor: COLORS.BLUE }}
           />
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between py-2">
           <div>
             <h3 className="font-semibold text-slate-800">Snooze Duration</h3>
             <p className="text-sm text-slate-500">Minutes to snooze alarm</p>
           </div>
           <select 
             value={settings.snoozeMinutes}
             onChange={(e) => updateSetting('snoozeMinutes', parseInt(e.target.value))}
             className="bg-slate-100 border-none rounded-lg p-2 font-medium text-slate-700 outline-none focus:ring-2"
             style={{ focusRingColor: COLORS.PURPLE }}
           >
             <option value={1}>1 min</option>
             <option value={5}>5 min</option>
             <option value={10}>10 min</option>
             <option value={15}>15 min</option>
           </select>
        </div>
      </Card>
    </div>
  );
};