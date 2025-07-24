import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SubjectGames } from "./subject-games";

interface Subject {
  id: number;
  name: string;
  magicalName: string;
  icon: string;
  color: string;
  description: string;
  progress: number;
  completedTasks: number;
  totalTasks: number;
}

interface SubjectCardProps {
  subject: Subject;
  studentId?: number;
  theme?: any;
  onSpeak?: () => void;
}

export function SubjectCard({ subject, studentId, theme, onSpeak }: SubjectCardProps) {
  const [showGames, setShowGames] = useState(false);
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'purple':
        return {
          gradient: 'from-purple-400 to-purple-600',
          progress: 'bg-purple-500',
          button: 'bg-purple-600 hover:bg-purple-700',
          border: 'border-purple-100 hover:border-purple-300'
        };
      case 'blue':
        return {
          gradient: 'from-blue-400 to-blue-600',
          progress: 'bg-blue-500',
          button: 'bg-blue-600 hover:bg-blue-700',
          border: 'border-blue-100 hover:border-blue-300'
        };
      case 'green':
        return {
          gradient: 'from-green-400 to-green-600',
          progress: 'bg-green-500',
          button: 'bg-green-600 hover:bg-green-700',
          border: 'border-green-100 hover:border-green-300'
        };
      case 'yellow':
        return {
          gradient: 'from-yellow-400 to-yellow-600',
          progress: 'bg-yellow-500',
          button: 'bg-yellow-600 hover:bg-yellow-700',
          border: 'border-yellow-100 hover:border-yellow-300'
        };
      default:
        return {
          gradient: 'from-gray-400 to-gray-600',
          progress: 'bg-gray-500',
          button: 'bg-gray-600 hover:bg-gray-700',
          border: 'border-gray-100 hover:border-gray-300'
        };
    }
  };

  const colorClasses = getColorClasses(subject.color);

  const cardBg = theme ? theme.colors.cardBg : 'bg-white';
  const borderColor = theme ? theme.colors.border : colorClasses.border;
  const gradient = theme ? theme.colors.primary : colorClasses.gradient;

  return (
    <Card className={`${cardBg} rounded-2xl shadow-lg border-2 ${borderColor} hover:shadow-xl transition-all duration-300 overflow-hidden group`}>
      <div className={`bg-gradient-to-r ${gradient} p-4`}>
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center space-x-3">
            <i className={`${subject.icon} text-2xl group-hover:animate-bounce`}></i>
            <h4 className="font-display text-lg">{subject.magicalName}</h4>
          </div>
          <div className="bg-white/20 px-3 py-1 rounded-full">
            <span className="text-sm font-semibold">{subject.progress}%</span>
          </div>
        </div>
      </div>
      
      <CardContent className="p-4">
        <p className="text-gray-600 mb-3">{subject.description}</p>
        
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>{subject.completedTasks} completed</span>
            <span>{subject.totalTasks} total</span>
          </div>
          <Progress value={subject.progress} className="h-2" />
        </div>
        
        <div className="flex space-x-2">
          <Button 
            className={`flex-1 ${colorClasses.button} transition-colors font-semibold`}
            onClick={() => {
              setShowGames(!showGames);
              console.log(`Starting ${subject.magicalName}`);
            }}
          >
            {showGames ? 'Hide Games' : 'Continue Learning'}
          </Button>
          
          {onSpeak && (
            <Button
              variant="outline"
              size="sm"
              onClick={onSpeak}
              className="px-3"
              title="Read aloud"
            >
              <i className="fas fa-volume-up"></i>
            </Button>
          )}
        </div>
        
        {showGames && studentId && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <SubjectGames 
              subjectName={subject.name}
              studentId={studentId}
              onGameComplete={() => {
                // Games completed, could refresh progress
                console.log(`Game completed for ${subject.magicalName}`);
              }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
