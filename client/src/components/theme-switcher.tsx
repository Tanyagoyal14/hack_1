import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface Theme {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    button: string;
    buttonHover: string;
    cardBg: string;
    border: string;
  };
  subjects: {
    Math: { name: string; icon: string; color: string };
    Reading: { name: string; icon: string; color: string };
    Science: { name: string; icon: string; color: string };
    'Social Studies': { name: string; icon: string; color: string };
  };
}

export const themes: Record<string, Theme> = {
  'harry-potter': {
    id: 'harry-potter',
    name: 'Harry Potter',
    description: 'Magical world of Hogwarts',
    colors: {
      primary: 'from-red-800 to-yellow-600',
      secondary: 'from-green-800 to-silver-600',
      accent: 'from-blue-800 to-bronze-600',
      background: 'from-slate-900 via-amber-900 to-red-900',
      text: 'text-amber-100',
      button: 'bg-red-700 hover:bg-red-800 border-yellow-500',
      buttonHover: 'hover:bg-red-800',
      cardBg: 'bg-slate-800/90 border-yellow-600',
      border: 'border-yellow-600'
    },
    subjects: {
      Math: { name: 'Arithmancy', icon: 'fas fa-calculator', color: 'red' },
      Reading: { name: 'Ancient Runes', icon: 'fas fa-scroll', color: 'blue' },
      Science: { name: 'Potions', icon: 'fas fa-flask', color: 'green' },
      'Social Studies': { name: 'History of Magic', icon: 'fas fa-hat-wizard', color: 'yellow' }
    }
  },
  'ocean': {
    id: 'ocean',
    name: 'Ocean Adventure',
    description: 'Deep sea exploration theme',
    colors: {
      primary: 'from-blue-600 to-teal-500',
      secondary: 'from-cyan-500 to-blue-600',
      accent: 'from-teal-600 to-blue-700',
      background: 'from-blue-50 via-cyan-50 to-teal-50',
      text: 'text-blue-900',
      button: 'bg-blue-600 hover:bg-blue-700 border-cyan-400',
      buttonHover: 'hover:bg-blue-700',
      cardBg: 'bg-white/90 border-blue-200',
      border: 'border-blue-200'
    },
    subjects: {
      Math: { name: 'Navigation', icon: 'fas fa-compass', color: 'blue' },
      Reading: { name: 'Sea Stories', icon: 'fas fa-book-open', color: 'cyan' },
      Science: { name: 'Marine Biology', icon: 'fas fa-fish', color: 'teal' },
      'Social Studies': { name: 'Ocean Exploration', icon: 'fas fa-ship', color: 'blue' }
    }
  },
  'space': {
    id: 'space',
    name: 'Space Explorer',
    description: 'Cosmic adventures among the stars',
    colors: {
      primary: 'from-purple-600 to-blue-500',
      secondary: 'from-indigo-500 to-purple-600',
      accent: 'from-violet-600 to-purple-700',
      background: 'from-gray-900 via-purple-900 to-blue-900',
      text: 'text-purple-100',
      button: 'bg-purple-600 hover:bg-purple-700 border-blue-400',
      buttonHover: 'hover:bg-purple-700',
      cardBg: 'bg-gray-800/90 border-purple-400',
      border: 'border-purple-400'
    },
    subjects: {
      Math: { name: 'Astro Physics', icon: 'fas fa-calculator', color: 'purple' },
      Reading: { name: 'Galactic Tales', icon: 'fas fa-book', color: 'blue' },
      Science: { name: 'Space Science', icon: 'fas fa-rocket', color: 'violet' },
      'Social Studies': { name: 'Alien Cultures', icon: 'fas fa-globe', color: 'indigo' }
    }
  },
  'forest': {
    id: 'forest',
    name: 'Enchanted Forest',
    description: 'Magical woodland adventures',
    colors: {
      primary: 'from-green-600 to-emerald-500',
      secondary: 'from-lime-500 to-green-600',
      accent: 'from-emerald-600 to-green-700',
      background: 'from-green-50 via-emerald-50 to-lime-50',
      text: 'text-green-900',
      button: 'bg-green-600 hover:bg-green-700 border-emerald-400',
      buttonHover: 'hover:bg-green-700',
      cardBg: 'bg-white/90 border-green-200',
      border: 'border-green-200'
    },
    subjects: {
      Math: { name: 'Nature Patterns', icon: 'fas fa-leaf', color: 'green' },
      Reading: { name: 'Forest Tales', icon: 'fas fa-tree', color: 'emerald' },
      Science: { name: 'Botany', icon: 'fas fa-seedling', color: 'lime' },
      'Social Studies': { name: 'Forest Communities', icon: 'fas fa-users', color: 'green' }
    }
  }
};

interface ThemeSwitcherProps {
  currentTheme: string;
  onThemeChange: (themeId: string) => void;
}

export function ThemeSwitcher({ currentTheme, onThemeChange }: ThemeSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-purple-600 hover:bg-purple-700 text-white"
        title="Change Theme"
      >
        <i className="fas fa-palette mr-2"></i>
        Themes
      </Button>

      {isOpen && (
        <Card className="absolute right-0 top-12 w-80 z-50 shadow-xl">
          <CardContent className="p-4">
            <h3 className="text-lg font-bold mb-4">Choose Your Adventure Theme</h3>
            
            <div className="space-y-3">
              {Object.values(themes).map((theme) => (
                <div
                  key={theme.id}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    currentTheme === theme.id
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    onThemeChange(theme.id);
                    setIsOpen(false);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-800">{theme.name}</h4>
                      <p className="text-sm text-gray-600">{theme.description}</p>
                    </div>
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${theme.colors.primary}`}></div>
                  </div>
                  
                  <div className="mt-2 flex space-x-2">
                    {Object.entries(theme.subjects).map(([key, subject]) => (
                      <div
                        key={key}
                        className="text-xs bg-gray-100 px-2 py-1 rounded"
                        title={subject.name}
                      >
                        <i className={`${subject.icon} mr-1`}></i>
                        {subject.name}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Hook to manage theme state
export function useTheme() {
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem('learning-theme') || 'harry-potter';
  });

  const changeTheme = (themeId: string) => {
    setCurrentTheme(themeId);
    localStorage.setItem('learning-theme', themeId);
  };

  const theme = themes[currentTheme] || themes['harry-potter'];

  return {
    currentTheme,
    theme,
    changeTheme,
    themes
  };
}