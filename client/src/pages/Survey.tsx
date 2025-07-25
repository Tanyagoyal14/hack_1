import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Heart, Brain, Eye, Volume2, Hand } from "lucide-react";

const SURVEY_QUESTIONS = [
  {
    id: 'mood',
    question: "How are you feeling today?",
    icon: Heart,
    options: [
      { value: 'excited', label: '🎉 Excited and ready to learn!', emoji: '🎉' },
      { value: 'happy', label: '😊 Happy and cheerful', emoji: '😊' },
      { value: 'calm', label: '😌 Calm and peaceful', emoji: '😌' },
      { value: 'tired', label: '😴 A little tired', emoji: '😴' },
      { value: 'frustrated', label: '😤 Frustrated or stressed', emoji: '😤' }
    ]
  },
  {
    id: 'learning_style',
    question: "How do you learn best?",
    icon: Brain,
    options: [
      { value: 'visual', label: '👀 Looking at pictures and colors', emoji: '👀' },
      { value: 'auditory', label: '👂 Listening to sounds and music', emoji: '👂' },
      { value: 'kinesthetic', label: '✋ Moving and touching things', emoji: '✋' },
      { value: 'mixed', label: '🌈 A little bit of everything', emoji: '🌈' }
    ]
  },
  {
    id: 'interests',
    question: "What magical subjects interest you most?",
    icon: Sparkles,
    options: [
      { value: 'potions', label: '🧪 Potions (Math)', emoji: '🧪' },
      { value: 'spells', label: '📚 Spells (Reading)', emoji: '📚' },
      { value: 'nature', label: '🌿 Nature Magic (Science)', emoji: '🌿' },
      { value: 'adventures', label: '🗺️ World Adventures (Social Studies)', emoji: '🗺️' },
      { value: 'all', label: '✨ All of them!', emoji: '✨' }
    ]
  },
  {
    id: 'accessibility',
    question: "Do you need any special help to learn better?",
    icon: Eye,
    options: [
      { value: 'none', label: '👍 No special help needed', emoji: '👍' },
      { value: 'text_to_speech', label: '🔊 Read text out loud to me', emoji: '🔊' },
      { value: 'large_text', label: '🔍 Make text bigger', emoji: '🔍' },
      { value: 'high_contrast', label: '🎨 Use bright, clear colors', emoji: '🎨' },
      { value: 'simplified', label: '📝 Use simple, easy words', emoji: '📝' }
    ]
  },
  {
    id: 'difficulty',
    question: "What level of challenge do you prefer?",
    icon: Brain,
    options: [
      { value: 'easy', label: '🌱 Easy - I\'m just starting', emoji: '🌱' },
      { value: 'medium', label: '🌿 Medium - I know some things', emoji: '🌿' },
      { value: 'hard', label: '🌳 Hard - I love challenges!', emoji: '🌳' },
      { value: 'adaptive', label: '🎯 Let me try different levels', emoji: '🎯' }
    ]
  }
];

export default function Survey() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [isComplete, setIsComplete] = useState(false);

  // Check if user already has a student profile
  const { data: existingProfile } = useQuery({
    queryKey: ["/api/students/profile"],
    enabled: isAuthenticated,
  });

  // Redirect if profile already exists
  useEffect(() => {
    if (existingProfile && (existingProfile as any).id) {
      window.location.href = `/dashboard/${(existingProfile as any).id}`;
    }
  }, [existingProfile]);

  const submitSurveyMutation = useMutation({
    mutationFn: async (surveyData: any) => {
      // First create student profile
      const profileResponse = await fetch("/api/students/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentMood: responses.mood,
          learningStyle: responses.learning_style,
          interests: [responses.interests],
          accessibilityNeeds: { 
            textToSpeech: responses.accessibility === 'text_to_speech',
            largeText: responses.accessibility === 'large_text',
            highContrast: responses.accessibility === 'high_contrast',
            simplified: responses.accessibility === 'simplified'
          },
          level: 1,
          totalXP: 0,
          availableSpins: 3,
          streak: 0,
          badges: []
        })
      });
      
      if (!profileResponse.ok) {
        throw new Error('Failed to create profile');
      }
      
      const profile = await profileResponse.json();

      // Then submit survey response
      await fetch("/api/survey/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: profile.id,
          responses: surveyData
        })
      });

      return profile;
    },
    onSuccess: (profile) => {
      toast({
        title: "Welcome to your Learning Adventure!",
        description: "Your magical profile has been created successfully.",
      });
      
      setTimeout(() => {
        window.location.href = `/dashboard/${profile.id}`;
      }, 2000);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAnswer = (answer: string) => {
    const newResponses = { ...responses, [SURVEY_QUESTIONS[currentQuestion].id]: answer };
    setResponses(newResponses);

    if (currentQuestion < SURVEY_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setIsComplete(true);
      submitSurveyMutation.mutate(newResponses);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Welcome to Learning Adventure!</CardTitle>
            <CardDescription>Please log in to start your magical journey</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full" 
              onClick={() => window.location.href = "/api/login"}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Start Your Adventure
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mb-4">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <CardTitle>Creating Your Magical Profile...</CardTitle>
            <CardDescription>
              We're preparing your personalized learning adventure!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const question = SURVEY_QUESTIONS[currentQuestion];
  const IconComponent = question.icon;
  const progress = ((currentQuestion + 1) / SURVEY_QUESTIONS.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome, {(user as any)?.firstName || 'Young Adventurer'}! 
          </h1>
          <p className="text-lg text-gray-600">
            Let's create your magical learning profile
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Question {currentQuestion + 1} of {SURVEY_QUESTIONS.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <Card className="mb-6">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mb-4">
              <IconComponent className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl">{question.question}</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup 
              value={responses[question.id] || ""} 
              onValueChange={handleAnswer}
              className="space-y-4"
            >
              {question.options.map((option) => (
                <div key={option.value} className="flex items-center space-x-3 p-4 rounded-lg border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50 cursor-pointer transition-colors">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label 
                    htmlFor={option.value} 
                    className="flex-1 cursor-pointer text-lg font-medium"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
          >
            Previous
          </Button>
          
          {responses[question.id] && (
            <Button
              onClick={() => handleAnswer(responses[question.id])}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {currentQuestion === SURVEY_QUESTIONS.length - 1 ? 'Complete Profile' : 'Next Question'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}