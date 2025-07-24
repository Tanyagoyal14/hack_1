import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface MoodIndicatorProps {
  mood?: string;
  onMoodChange?: (mood: string) => void;
}

const MOODS = [
  { value: "happy", label: "Happy", icon: "fas fa-smile", color: "text-yellow-500", bg: "bg-yellow-100" },
  { value: "calm", label: "Calm", icon: "fas fa-leaf", color: "text-green-500", bg: "bg-green-100" },
  { value: "excited", label: "Excited", icon: "fas fa-bolt", color: "text-blue-500", bg: "bg-blue-100" },
  { value: "tired", label: "Tired", icon: "fas fa-moon", color: "text-purple-400", bg: "bg-purple-100" },
  { value: "frustrated", label: "Frustrated", icon: "fas fa-frown", color: "text-red-500", bg: "bg-red-100" }
];

export function MoodIndicator({ mood, onMoodChange }: MoodIndicatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const currentMood = MOODS.find(m => m.value === mood) || MOODS[1]; // Default to calm

  const handleMoodSelect = (newMood: string) => {
    onMoodChange?.(newMood);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className={`flex items-center space-x-2 ${currentMood.bg} border-transparent hover:bg-opacity-80`}
        >
          <i className={`${currentMood.icon} ${currentMood.color}`}></i>
          <span className="text-sm font-medium">{currentMood.label} Mode</span>
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-0" align="end">
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">How are you feeling?</h3>
            <div className="grid grid-cols-2 gap-2">
              {MOODS.map((moodOption) => (
                <Button
                  key={moodOption.value}
                  variant="ghost"
                  className={`flex items-center space-x-2 p-3 h-auto justify-start ${
                    mood === moodOption.value ? `${moodOption.bg} border-2 border-current` : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleMoodSelect(moodOption.value)}
                >
                  <i className={`${moodOption.icon} ${moodOption.color} text-lg`}></i>
                  <span className="text-sm">{moodOption.label}</span>
                </Button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Your learning content will adapt to your current mood
            </p>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}
