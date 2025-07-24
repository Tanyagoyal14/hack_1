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
  const [gameStep, setGameStep] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [lastAnswer, setLastAnswer] = useState<'correct' | 'wrong' | null>(null);

  // Different questions for each game type
  const questions = {
    math: [
      { question: "What is 7 + 5?", answers: ["11", "12", "13", "10"], correct: 1 },
      { question: "What is 8 - 3?", answers: ["4", "5", "6", "7"], correct: 1 },
      { question: "What is 4 × 2?", answers: ["6", "8", "10", "12"], correct: 1 },
      { question: "What is 9 + 2?", answers: ["10", "11", "12", "13"], correct: 1 },
      { question: "What is 15 - 7?", answers: ["7", "8", "9", "10"], correct: 1 },
      { question: "What is 3 × 3?", answers: ["6", "9", "12", "15"], correct: 1 }
    ],
    reading: [
      { question: "Which word rhymes with 'cat'?", answers: ["Hat", "Dog", "Bird", "Fish"], correct: 0 },
      { question: "Which word rhymes with 'sun'?", answers: ["Moon", "Fun", "Star", "Sky"], correct: 1 },
      { question: "What starts with 'B'?", answers: ["Apple", "Ball", "Cat", "Dog"], correct: 1 },
      { question: "Which is a color?", answers: ["Table", "Blue", "Chair", "Book"], correct: 1 },
      { question: "Which word rhymes with 'tree'?", answers: ["Bee", "Dog", "Car", "House"], correct: 0 },
      { question: "What starts with 'S'?", answers: ["Moon", "Star", "Ball", "Cat"], correct: 1 }
    ],
    science: [
      { question: "What do plants need to grow?", answers: ["Only water", "Sun & Water", "Only sun", "Nothing"], correct: 1 },
      { question: "What do fish use to breathe?", answers: ["Lungs", "Gills", "Nose", "Mouth"], correct: 1 },
      { question: "Which planet is closest to the sun?", answers: ["Earth", "Mercury", "Mars", "Venus"], correct: 1 },
      { question: "What makes plants green?", answers: ["Water", "Chlorophyll", "Soil", "Air"], correct: 1 },
      { question: "How many legs does a spider have?", answers: ["6", "8", "10", "12"], correct: 1 },
      { question: "What do bees make?", answers: ["Milk", "Honey", "Butter", "Cheese"], correct: 1 }
    ],
    social_studies: [
      { question: "Which continent has penguins?", answers: ["Africa", "Asia", "Antarctica", "Europe"], correct: 2 },
      { question: "What is the capital of France?", answers: ["London", "Paris", "Rome", "Berlin"], correct: 1 },
      { question: "Which ocean is the largest?", answers: ["Atlantic", "Pacific", "Indian", "Arctic"], correct: 1 },
      { question: "What do we call a group of people living together?", answers: ["Animals", "Community", "Plants", "Weather"], correct: 1 },
      { question: "What is used to buy things?", answers: ["Rocks", "Money", "Leaves", "Water"], correct: 1 },
      { question: "Which season comes after winter?", answers: ["Summer", "Spring", "Fall", "Winter"], correct: 1 }
    ]
  };

  const currentQuestions = questions[game.type] || questions.math;
  const current = currentQuestions[currentQuestion];

  const handleAnswer = (answerIndex: number) => {
    const isCorrect = answerIndex === current.correct;
    const points = isCorrect ? 15 : 5; // More points for correct answers
    
    setCurrentScore(prev => prev + points);
    setLastAnswer(isCorrect ? 'correct' : 'wrong');
    setShowResult(true);
    
    setTimeout(() => {
      setShowResult(false);
      setLastAnswer(null);
      setGameStep(prev => prev + 1);
      setCurrentQuestion(prev => (prev + 1) % currentQuestions.length);
      
      if (gameStep >= 4) { // Complete after 5 questions
        setTimeout(() => onComplete(currentScore + points), 300);
      }
    }, 1500); // Show result for 1.5 seconds
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
            <div className="text-lg font-bold text-blue-600">{5 - gameStep}</div>
            <div className="text-xs text-gray-600">Questions Left</div>
          </div>
        </div>

        <div className="space-y-4">
          {showResult ? (
            <div className="text-center">
              <div className={`text-2xl font-bold mb-4 ${lastAnswer === 'correct' ? 'text-green-600' : 'text-red-600'}`}>
                {lastAnswer === 'correct' ? '✅ Correct! +15 points' : '❌ Try again! +5 points'}
              </div>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
                lastAnswer === 'correct' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <i className={`text-3xl ${
                  lastAnswer === 'correct' ? 'fas fa-check text-green-600' : 'fas fa-times text-red-600'
                }`}></i>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-lg mb-4 font-semibold">{current.question}</p>
              <div className="grid grid-cols-2 gap-3">
                {current.answers.map((answer, index) => (
                  <Button 
                    key={index}
                    onClick={() => handleAnswer(index)}
                    className={`p-4 text-base font-semibold transition-all duration-200 ${
                      index === current.correct 
                        ? 'bg-emerald-500 hover:bg-emerald-600 text-white border-2 border-emerald-400' 
                        : 'bg-blue-500 hover:bg-blue-600 text-white border-2 border-blue-400'
                    }`}
                  >
                    {answer}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 bg-white rounded-lg p-3">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${(gameStep / 5) * 100}%` }}
            ></div>
          </div>
          <p className="text-center text-sm font-semibold text-gray-700 mt-2">
            Progress: {gameStep}/5 completed
          </p>
        </div>
      </CardContent>
    </Card>
  );
}