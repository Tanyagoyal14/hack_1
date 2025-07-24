import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useTTS } from "@/hooks/use-tts";

export function AccessibilityToolbar() {
  const [fontSize, setFontSize] = useState('normal');
  const [highContrast, setHighContrast] = useState(false);
  const { isEnabled: ttsEnabled, toggle: toggleTTS } = useTTS();

  const adjustFontSize = (action: 'increase' | 'decrease') => {
    const body = document.body;
    body.classList.remove('text-size-large', 'text-size-xl');
    
    if (action === 'increase') {
      const newSize = fontSize === 'normal' ? 'large' : fontSize === 'large' ? 'xl' : 'xl';
      setFontSize(newSize);
      if (newSize === 'large') body.classList.add('text-size-large');
      if (newSize === 'xl') body.classList.add('text-size-xl');
    } else if (action === 'decrease') {
      const newSize = fontSize === 'xl' ? 'large' : fontSize === 'large' ? 'normal' : 'normal';
      setFontSize(newSize);
      if (newSize === 'large') body.classList.add('text-size-large');
    }
  };

  const toggleContrast = () => {
    document.body.classList.toggle('accessibility-high-contrast');
    setHighContrast(!highContrast);
  };

  return (
    <div className="fixed top-0 right-0 z-50 bg-white shadow-lg rounded-bl-lg p-3 border-l-4 border-purple-500">
      <div className="flex space-x-2">
        <Button
          onClick={() => adjustFontSize('increase')}
          className="p-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
          title="Increase font size"
          size="sm"
        >
          <i className="fas fa-plus text-sm"></i>
        </Button>
        
        <Button
          onClick={() => adjustFontSize('decrease')}
          className="p-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
          title="Decrease font size"
          size="sm"
        >
          <i className="fas fa-minus text-sm"></i>
        </Button>
        
        <Button
          onClick={toggleContrast}
          className={`p-2 text-white rounded hover:bg-purple-700 transition-colors ${
            highContrast ? 'bg-purple-800' : 'bg-purple-600'
          }`}
          title="Toggle high contrast"
          size="sm"
        >
          <i className="fas fa-adjust text-sm"></i>
        </Button>
        
        <Button
          onClick={toggleTTS}
          className={`p-2 text-white rounded hover:bg-purple-700 transition-colors ${
            ttsEnabled ? 'bg-green-600 hover:bg-green-700' : 'bg-purple-600'
          }`}
          title="Text-to-Speech"
          size="sm"
        >
          <i className="fas fa-volume-up text-sm"></i>
        </Button>
      </div>
    </div>
  );
}
