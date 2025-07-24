import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface MiniGame {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'math' | 'reading' | 'science' | 'social_studies';
}

const subjectGames: Record<string, MiniGame[]> = {
  'Math': [
    { id: 'math-puzzle', name: 'Potion Formula', description: 'Solve magical math equations', icon: 'fas fa-flask', type: 'math' },
    { id: 'number-quest', name: 'Number Quest', description: 'Adventure through number lands', icon: 'fas fa-map', type: 'math' },
    { id: 'spell-calculator', name: 'Spell Calculator', description: 'Calculate magical spell power', icon: 'fas fa-calculator', type: 'math' }
  ],
  'Reading': [
    { id: 'story-builder', name: 'Story Weaver', description: 'Create magical stories', icon: 'fas fa-book-open', type: 'reading' },
    { id: 'word-spell', name: 'Word Spells', description: 'Cast spells with vocabulary', icon: 'fas fa-magic', type: 'reading' },
    { id: 'reading-quest', name: 'Reading Quest', description: 'Unlock stories by reading', icon: 'fas fa-scroll', type: 'reading' }
  ],
  'Science': [
    { id: 'nature-lab', name: 'Nature Laboratory', description: 'Conduct magical experiments', icon: 'fas fa-seedling', type: 'science' },
    { id: 'element-mixer', name: 'Element Mixer', description: 'Mix nature elements', icon: 'fas fa-vial', type: 'science' },
    { id: 'animal-friends', name: 'Animal Friends', description: 'Learn about magical creatures', icon: 'fas fa-paw', type: 'science' }
  ],
  'Social Studies': [
    { id: 'world-explorer', name: 'World Explorer', description: 'Discover new lands', icon: 'fas fa-globe', type: 'social_studies' },
    { id: 'time-travel', name: 'Time Travel', description: 'Journey through history', icon: 'fas fa-clock', type: 'social_studies' },
    { id: 'culture-quest', name: 'Culture Quest', description: 'Explore different cultures', icon: 'fas fa-users', type: 'social_studies' }
  ]
};

interface SubjectGamesProps {
  subjectName: string;
  studentId: number;
  onGameComplete?: () => void;
}

export function SubjectGames({ subjectName, studentId, onGameComplete }: SubjectGamesProps) {
  const [selectedGame, setSelectedGame] = useState<MiniGame | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameScore, setGameScore] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const games = subjectGames[subjectName] || [];

  const playGameMutation = useMutation({
    mutationFn: async ({ gameId, score }: { gameId: string; score: number }) => {
      return apiRequest('POST', `/api/students/${studentId}/progress`, {
        gameId,
        score,
        xpEarned: score * 10
      });
    },
    onSuccess: () => {
      toast({
        title: "Game Complete!",
        description: `You earned ${gameScore * 10} XP! 🎉`
      });
      queryClient.invalidateQueries({ queryKey: ['/api/students', studentId, 'dashboard'] });
      if (onGameComplete) onGameComplete();
      setGameStarted(false);
      setSelectedGame(null);
      setGameScore(0);
    }
  });

  const startGame = (game: MiniGame) => {
    setSelectedGame(game);
    setGameStarted(true);
    setGameScore(0);
  };

  const completeGame = (score: number) => {
    setGameScore(score);
    if (selectedGame) {
      playGameMutation.mutate({ gameId: selectedGame.id, score });
    }
  };

  if (gameStarted && selectedGame) {
    return <GamePlayer game={selectedGame} onComplete={completeGame} />;
  }

  return (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold text-gray-800 mb-4">
        <i className="fas fa-gamepad text-purple-600 mr-2"></i>
        Choose Your Adventure
      </h4>
      
      <div className="grid grid-cols-1 gap-3">
        {games.map((game) => (
          <Card key={game.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <i className={`${game.icon} text-purple-600`}></i>
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-800">{game.name}</h5>
                    <p className="text-sm text-gray-600">{game.description}</p>
                  </div>
                </div>
                
                <Button 
                  onClick={() => startGame(game)}
                  className="bg-purple-600 hover:bg-purple-700 text-sm"
                >
                  Play
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

interface GamePlayerProps {
  game: MiniGame;
  onComplete: (score: number) => void;
}

function GamePlayer({ game, onComplete }: GamePlayerProps) {
  const [currentScore, setCurrentScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameStep, setGameStep] = useState(0);

  // Simple game mechanics based on game type
  const handleGameAction = () => {
    const points = Math.floor(Math.random() * 10) + 5; // 5-15 points per action
    setCurrentScore(prev => prev + points);
    setGameStep(prev => prev + 1);

    if (gameStep >= 5) { // Complete after 6 actions
      setTimeout(() => onComplete(currentScore + points), 500);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200">
      <CardContent className="p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className={`${game.icon} text-white text-2xl`}></i>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">{game.name}</h3>
          <p className="text-gray-600">{game.description}</p>
        </div>

        <div className="flex justify-between mb-6">
          <div className="bg-white rounded-lg p-3 min-w-[80px] text-center">
            <div className="text-lg font-bold text-purple-600">{currentScore}</div>
            <div className="text-xs text-gray-600">Score</div>
          </div>
          <div className="bg-white rounded-lg p-3 min-w-[80px] text-center">
            <div className="text-lg font-bold text-blue-600">{6 - gameStep}</div>
            <div className="text-xs text-gray-600">Actions Left</div>
          </div>
        </div>

        <div className="space-y-4">
          {game.type === 'math' && (
            <div className="text-center">
              <p className="text-lg mb-4">What is 7 + 5?</p>
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={handleGameAction} variant="outline">11</Button>
                <Button onClick={handleGameAction} className="bg-green-600 hover:bg-green-700">12</Button>
                <Button onClick={handleGameAction} variant="outline">13</Button>
                <Button onClick={handleGameAction} variant="outline">10</Button>
              </div>
            </div>
          )}

          {game.type === 'reading' && (
            <div className="text-center">
              <p className="text-lg mb-4">Which word rhymes with "cat"?</p>
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={handleGameAction} className="bg-green-600 hover:bg-green-700">Hat</Button>
                <Button onClick={handleGameAction} variant="outline">Dog</Button>
                <Button onClick={handleGameAction} variant="outline">Bird</Button>
                <Button onClick={handleGameAction} variant="outline">Fish</Button>
              </div>
            </div>
          )}

          {game.type === 'science' && (
            <div className="text-center">
              <p className="text-lg mb-4">What do plants need to grow?</p>
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={handleGameAction} variant="outline">Only water</Button>
                <Button onClick={handleGameAction} className="bg-green-600 hover:bg-green-700">Sun & Water</Button>
                <Button onClick={handleGameAction} variant="outline">Only sun</Button>
                <Button onClick={handleGameAction} variant="outline">Nothing</Button>
              </div>
            </div>
          )}

          {game.type === 'social_studies' && (
            <div className="text-center">
              <p className="text-lg mb-4">Which continent has penguins?</p>
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={handleGameAction} variant="outline">Africa</Button>
                <Button onClick={handleGameAction} variant="outline">Asia</Button>
                <Button onClick={handleGameAction} className="bg-green-600 hover:bg-green-700">Antarctica</Button>
                <Button onClick={handleGameAction} variant="outline">Europe</Button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 bg-white rounded-lg p-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(gameStep / 6) * 100}%` }}
            ></div>
          </div>
          <p className="text-center text-sm text-gray-600 mt-2">
            Progress: {gameStep}/6 completed
          </p>
        </div>
      </CardContent>
    </Card>
  );
}