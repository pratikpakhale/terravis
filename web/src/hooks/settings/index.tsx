import React, { createContext, useState, useEffect } from 'react';
import { Switch } from '../../components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';

// Define the shape of our settings
interface AppSettings {
  liveVoice: boolean;
  ai: 'LLM' | 'NLP';
}

// Define the shape of our context
interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
}

// Default settings
const defaultSettings: AppSettings = {
  liveVoice: false,
  ai: 'NLP',
};

// Create the context
export const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  updateSettings: () => {},
});

// Create the provider component
export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  useEffect(() => {
    // Load settings from localStorage on mount
    const storedSettings = localStorage.getItem('appSettings');
    if (storedSettings) {
      setSettings(JSON.parse(storedSettings));
    }
  }, []);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prevSettings => {
      const updatedSettings = { ...prevSettings, ...newSettings };
      // Save to localStorage
      localStorage.setItem('appSettings', JSON.stringify(updatedSettings));
      return updatedSettings;
    });
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

// Settings component using Shadcn UI
export const SettingsComponent: React.FC = () => {
  const { settings, updateSettings } = React.useContext(SettingsContext);

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <label htmlFor='live-voice' className='text-sm font-medium'>
          Live Voice
        </label>
        <Switch
          id='live-voice'
          checked={settings.liveVoice}
          onCheckedChange={checked => updateSettings({ liveVoice: checked })}
        />
      </div>
      <div className='space-y-2'>
        <label htmlFor='ai-select' className='text-sm font-medium'>
          AI Type
        </label>
        <Select
          value={settings.ai}
          onValueChange={(value: 'LLM' | 'NLP') =>
            updateSettings({ ai: value })
          }
        >
          <SelectTrigger id='ai-select'>
            <SelectValue placeholder='Select AI type' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='LLM'>LLM</SelectItem>
            <SelectItem value='NLP'>NLP</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
