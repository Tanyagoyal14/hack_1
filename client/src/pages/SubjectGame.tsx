import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Star, Trophy, Zap, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Sample game questions for each subject
const GAME_QUESTIONS = {
  math: [
    { question: "What's 5 + 3?", options: ["6", "7", "8", "9"], correct: 2, explanation: "5 + 3 = 8. Great addition!" },
    { question: "What's 12 - 4?", options: ["6", "7", "8", "9"], correct: 2, explanation: "12 - 4 = 8. Excellent subtraction!" },
    { question: "What's 3 × 4?", options: ["10", "11", "12", "13"], correct: 2, explanation: "3 × 4 = 12. Perfect multiplication!" },
    { question: "What's 15 ÷ 3?", options: ["3", "4", "5", "6"], correct: 2, explanation: "15 ÷ 3 = 5. Amazing division!" },
    { question: "What's 7 + 6?", options: ["11", "12", "13", "14"], correct: 2, explanation: "7 + 6 = 13. Wonderful work!" }
  ],
  reading: [
    { question: "Which word rhymes with 'cat'?", options: ["dog", "hat", "fish", "bird"], correct: 1, explanation: "Hat rhymes with cat! Both end in 'at'." },
    { question: "What's the opposite of 'hot'?", options: ["warm", "cool", "cold", "freezing"], correct: 2, explanation: "Cold is the opposite of hot. Great vocabulary!" },
    { question: "Which is a noun?", options: ["run", "happy", "book", "quickly"], correct: 2, explanation: "Book is a noun - it's a thing you can touch!" },
    { question: "What sound does 'ph' make?", options: ["p", "f", "h", "ph"], correct: 1, explanation: "'Ph' makes the 'f' sound, like in 'phone'!" },
    { question: "Which word is plural?", options: ["cat", "cats", "running", "big"], correct: 1, explanation: "Cats is plural - it means more than one cat!" }
  ],
  science: [
    { question: "What do plants need to grow?", options: ["Only water", "Only sunlight", "Water and sunlight", "Just soil"], correct: 2, explanation: "Plants need both water and sunlight to grow healthy and strong!" },
    { question: "How many legs does a spider have?", options: ["6", "8", "10", "12"], correct: 1, explanation: "Spiders have 8 legs! That's what makes them arachnids." },
    { question: "What happens to water when it freezes?", options: ["It becomes gas", "It becomes ice", "It disappears", "It gets hot"], correct: 1, explanation: "Water becomes ice when it freezes at 0°C (32°F)!" },
    { question: "Which planet is closest to the sun?", options: ["Earth", "Mars", "Mercury", "Venus"], correct: 2, explanation: "Mercury is the closest planet to our sun!" },
    { question: "What do we call baby frogs?", options: ["Puppies", "Tadpoles", "Chicks", "Cubs"], correct: 1, explanation: "Baby frogs are called tadpoles before they grow legs!" }
  ],
  social_studies: [
    { question: "What is the capital of the United States?", options: ["New York", "Los Angeles", "Washington D.C.", "Chicago"], correct: 2, explanation: "Washington D.C. is the capital where the President lives!" },
    { question: "Which ocean is the largest?", options: ["Atlantic", "Pacific", "Indian", "Arctic"], correct: 1, explanation: "The Pacific Ocean is the largest ocean on Earth!" },
    { question: "How many continents are there?", options: ["5", "6", "7", "8"], correct: 2, explanation: "There are 7 continents: Asia, Africa, North America, South America, Antarctica, Europe, and Australia!" },
    { question: "What do we call the imaginary line around the middle of Earth?", options: ["Prime Meridian", "Equator", "Tropic", "Pole"], correct: 1, explanation: "The equator is the imaginary line that goes around the middle of Earth!" },
    { question: "Which direction does the sun rise?", options: ["North", "South", "East", "West"], correct: 2, explanation: "The sun rises in the East and sets in the West!" }
  ]
};

export default function SubjectGame() {
  const { studentId, subjectId } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [questions, setQuestions] = useState<any[]>([]);

  const { data: dashboardData } = useQuery({
    queryKey: [`/api/students/${studentId}/dashboard`],
    enabled: !!studentId,
  });

  const { data: subjects } = useQuery({
    queryKey: ["/api/subjects"],
  });

  const submitProgressMutation = useMutation({
    mutationFn: async (gameData: any) => {
      const response = await fetch(`/api/students/${studentId}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(gameData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit progress');
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Great Job!",
        description: `You earned ${data.xpEarned} XP! ${data.bonusSpin ? 'Bonus spin awarded!' : ''}`,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/students/${studentId}/dashboard`] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to save progress. Please try again.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (subjects && subjectId) {
      const subject = (subjects as any[]).find(s => s.id === parseInt(subjectId));
      if (subject) {
        const subjectKey = subject.name.toLowerCase().replace(' ', '_') as keyof typeof GAME_QUESTIONS;
        const subjectQuestions = GAME_QUESTIONS[subjectKey] || GAME_QUESTIONS.math;
        setQuestions(subjectQuestions.slice(0, 5)); // Use 5 questions per game
      }
    }
  }, [subjects, subjectId]);

  useEffect(() => {
    if (gameComplete || showResult) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestion, showResult, gameComplete]);

  const handleTimeUp = () => {
    setShowResult(true);
    setTimeout(() => {
      handleNextQuestion();
    }, 3000);
  };

  const handleAnswer = (answerIndex: number) => {
    if (selectedAnswer !== null || showResult) return;
    
    setSelectedAnswer(answerIndex);
    setShowResult(true);
    
    if (answerIndex === questions[currentQuestion].correct) {
      setScore(prev => prev + 1);
    }

    setTimeout(() => {
      handleNextQuestion();
    }, 3000);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setTimeLeft(30);
    } else {
      setGameComplete(true);
      // Submit progress
      const xpEarned = score * 20; // 20 XP per correct answer
      submitProgressMutation.mutate({
        gameId: `subject_${subjectId}`,
        score,
        xpEarned
      });
    }
  };

  const restartGame = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setShowResult(false);
    setGameComplete(false);
    setTimeLeft(30);
  };

  if (!questions.length || !subjects) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const subject = (subjects as any[]).find(s => s.id === parseInt(subjectId!));
  const currentQ = questions[currentQuestion];

  if (gameComplete) {
    const percentage = Math.round((score / questions.length) * 100);
    const isGoodScore = score >= 4;

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card className="text-center">
              <CardHeader>
                <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4 ${isGoodScore ? 'bg-green-500' : 'bg-yellow-500'}`}>
                  <Trophy className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-3xl">
                  {isGoodScore ? 'Excellent Work!' : 'Good Effort!'}
                </CardTitle>
                <CardDescription className="text-lg">
                  You completed the {subject?.magicalName} challenge!
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">{score}</div>
                    <div className="text-sm text-gray-600">Correct Answers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{percentage}%</div>
                    <div className="text-sm text-gray-600">Accuracy</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{score * 20}</div>
                    <div className="text-sm text-gray-600">XP Earned</div>
                  </div>
                </div>

                {isGoodScore && (
                  <Badge variant="secondary" className="text-lg px-4 py-2">
                    <Star className="mr-2 h-4 w-4" />
                    Bonus Spin Earned!
                  </Badge>
                )}

                <div className="flex gap-4 justify-center">
                  <Button onClick={restartGame} variant="outline">
                    Play Again
                  </Button>
                  <Button onClick={() => window.location.href = `/dashboard/${studentId}`}>
                    Back to Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="outline" 
            onClick={() => window.location.href = `/dashboard/${studentId}`}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">{subject?.magicalName} Challenge</h1>
            <p className="text-gray-600">{subject?.description}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Score</p>
            <p className="text-2xl font-bold text-purple-600">{score}/{questions.length}</p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto">
          {/* Progress & Timer */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-gray-600">
                  Question {currentQuestion + 1} of {questions.length}
                </span>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-orange-500" />
                  <span className={`font-bold ${timeLeft <= 10 ? 'text-red-500' : 'text-gray-700'}`}>
                    {timeLeft}s
                  </span>
                </div>
              </div>
              <Progress value={((currentQuestion + 1) / questions.length) * 100} className="h-2" />
            </CardContent>
          </Card>

          {/* Question */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-2xl text-center">
                {currentQ.question}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {currentQ.options.map((option: string, index: number) => {
                  let buttonClass = "text-left p-4 h-auto";
                  
                  if (showResult) {
                    if (index === currentQ.correct) {
                      buttonClass += " bg-green-100 border-green-500 text-green-800";
                    } else if (index === selectedAnswer) {
                      buttonClass += " bg-red-100 border-red-500 text-red-800";
                    }
                  }

                  return (
                    <Button
                      key={index}
                      variant="outline"
                      className={buttonClass}
                      onClick={() => handleAnswer(index)}
                      disabled={showResult}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-lg">{option}</span>
                        {showResult && index === currentQ.correct && (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        )}
                        {showResult && index === selectedAnswer && index !== currentQ.correct && (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                    </Button>
                  );
                })}
              </div>

              {showResult && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-blue-800 font-medium">
                    {currentQ.explanation}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}