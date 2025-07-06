"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the structure for category colors with theme support
export interface CategoryColors {
  [category: string]: {
    [answer: string]: string;
  };
}

// Define theme-aware color settings
export interface ThemeAwareColors {
  light: CategoryColors;
  dark: CategoryColors;
}

// Define the global visualization settings
export interface VisualizationSettings {
  // Color settings with theme support
  categoryColors: ThemeAwareColors;
  
  // Theme settings
  isDarkMode: boolean;
  
  // Data settings
  useTestData: boolean;
  
  // Animation settings
  autoPlaySpeed: number; // milliseconds between transitions
  isAutoPlayEnabled: boolean;
}

// Default light mode colors
const defaultLightColors: CategoryColors = {
  years_at_medtronic: {
    '0-5': '#FF6B6B',
    '6-10': '#4ECDC4',
    '11-15': '#45B7D1',
    '16-20': '#96CEB4',
    '20+': '#FFEAA7'
  },
  peak_performance: {
    'individual': '#FF6B6B',
    'innovation': '#4ECDC4',
    'leadership': '#45B7D1',
    'crisis': '#96CEB4',
    'team': '#FFEAA7'
  },
  learning_style: {
    'visual': '#FF6B6B',
    'auditory': '#4ECDC4',
    'kinesthetic': '#45B7D1',
    'reading_writing': '#96CEB4'
  },
  motivation: {
    'autonomy': '#FF6B6B',
    'recognition': '#4ECDC4',
    'impact': '#45B7D1',
    'purpose': '#96CEB4',
    'growth': '#FFEAA7'
  },
  shaped_by: {
    'mentor': '#FF6B6B',
    'other': '#4ECDC4',
    'failure': '#45B7D1',
    'education': '#96CEB4',
    'challenge': '#FFEAA7'
  }
};

// Default dark mode colors - enhanced versions with better contrast
const defaultDarkColors: CategoryColors = {
  years_at_medtronic: {
    '0-5': '#FF8A8A',
    '6-10': '#6EDCD4',
    '11-15': '#65C7F1',
    '16-20': '#B6DEC4',
    '20+': '#FFED87'
  },
  peak_performance: {
    'individual': '#FF8A8A',
    'innovation': '#6EDCD4',
    'leadership': '#65C7F1',
    'crisis': '#B6DEC4',
    'team': '#FFED87'
  },
  learning_style: {
    'visual': '#FF8A8A',
    'auditory': '#6EDCD4',
    'kinesthetic': '#65C7F1',
    'reading_writing': '#B6DEC4'
  },
  motivation: {
    'autonomy': '#FF8A8A',
    'recognition': '#6EDCD4',
    'impact': '#65C7F1',
    'purpose': '#B6DEC4',
    'growth': '#FFED87'
  },
  shaped_by: {
    'mentor': '#FF8A8A',
    'other': '#6EDCD4',
    'failure': '#65C7F1',
    'education': '#B6DEC4',
    'challenge': '#FFED87'
  }
};

// Default settings
const defaultSettings: VisualizationSettings = {
  categoryColors: {
    light: defaultLightColors,
    dark: defaultDarkColors
  },
  isDarkMode: false,
  useTestData: true,
  autoPlaySpeed: 5000, // 5 seconds
  isAutoPlayEnabled: true
};

// Context interface
interface AppContextType {
  settings: VisualizationSettings;
  updateCategoryColor: (category: string, answer: string, color: string, theme?: 'light' | 'dark') => void;
  toggleDarkMode: () => void;
  toggleTestData: () => void;
  updateAutoPlaySpeed: (speed: number) => void;
  toggleAutoPlay: () => void;
  resetToDefaults: () => void;
  getCurrentThemeColors: () => CategoryColors;
}

// Create the context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<VisualizationSettings>(defaultSettings);

  const updateCategoryColor = (category: string, answer: string, color: string, theme?: 'light' | 'dark') => {
    const targetTheme = theme || (settings.isDarkMode ? 'dark' : 'light');
    
    setSettings(prev => ({
      ...prev,
      categoryColors: {
        ...prev.categoryColors,
        [targetTheme]: {
          ...prev.categoryColors[targetTheme],
          [category]: {
            ...prev.categoryColors[targetTheme][category],
            [answer]: color
          }
        }
      }
    }));
  };

  const toggleDarkMode = () => {
    setSettings(prev => ({
      ...prev,
      isDarkMode: !prev.isDarkMode
    }));
  };

  const toggleTestData = () => {
    setSettings(prev => ({
      ...prev,
      useTestData: !prev.useTestData
    }));
  };

  const updateAutoPlaySpeed = (speed: number) => {
    setSettings(prev => ({
      ...prev,
      autoPlaySpeed: speed
    }));
  };

  const toggleAutoPlay = () => {
    setSettings(prev => ({
      ...prev,
      isAutoPlayEnabled: !prev.isAutoPlayEnabled
    }));
  };

  const resetToDefaults = () => {
    setSettings(defaultSettings);
  };

  const getCurrentThemeColors = () => {
    return settings.isDarkMode ? settings.categoryColors.dark : settings.categoryColors.light;
  };

  const value: AppContextType = {
    settings,
    updateCategoryColor,
    toggleDarkMode,
    toggleTestData,
    updateAutoPlaySpeed,
    toggleAutoPlay,
    resetToDefaults,
    getCurrentThemeColors
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}; 