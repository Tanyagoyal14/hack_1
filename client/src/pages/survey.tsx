import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const SURVEY_STEPS = [
  {
    title: "How are you feeling today?",
    icon: "fas fa-heart",
    type: "mood",
    options: [
      { value: "happy", label: "Happy", icon: "fas fa-smile", color: "text-yellow-500" },
      { value: "calm", label: "Calm", icon: "fas fa-leaf", color: "text-green-500" },
      { value: "excited", label: "Excited", icon: "fas fa-bolt", color: "text-blue-500" },
      { value: "tired", label: "Tired", icon: "fas fa-moon", color: "text-purple-400" },
      { value: "frustrated", label: "Frustrated", icon: "fas fa-frown", color: "text-red-500" }
    ]
  },
  {
    title: "How do you learn best?",
    icon: "fas fa-brain",
    type: "learningStyle",
    options: [
      { value: "visual", label: "Pictures & Videos", icon: "fas fa-eye", color: "text-blue-500" },
      { value: "auditory", label: "Listening & Sounds", icon: "fas fa-ear", color: "text-green-500" },
      { value: "kinesthetic", label: "Hands-on Activities", icon: "fas fa-hand-paper", color: "text-orange-500" }
    ]
  },
  {
    title: "What subjects interest you most?",
    icon: "fas fa-star",
    type: "interests",
    multiple: true,
    options: [
      { value: "math", label: "Math & Numbers", icon: "fas fa-calculator", color: "text-purple-500" },
      { value: "reading", label: "Reading & Stories", icon: "fas fa-book", color: "text-blue-500" },
      { value: "science", label: "Science & Nature", icon: "fas fa-seedling", color: "text-green-500" },
      { value: "art", label: "Art & Creativity", icon: "fas fa-paint-brush", color: "text-pink-500" },
      { value: "music", label: "Music & Sounds", icon: "fas fa-music", color: "text-yellow-500" },
      { value: "history", label: "History & Places", icon: "fas fa-globe", color: "text-orange-500" }
    ]
  },
  {
    title: "What helps you learn better?",
    icon: "fas fa-tools",
    type: "accessibility",
    multiple: true,
    options: [
      { value: "tts", label: "Text-to-Speech", icon: "fas fa-volume-up", color: "text-blue-500" },
      { value: "largeText", label: "Larger Text", icon: "fas fa-text-height", color: "text-green-500" },
      { value: "highContrast", label: "High Contrast", icon: "fas fa-adjust", color: "text-purple-500" },
      { value: "calmMusic", label: "Background Music", icon: "fas fa-music", color: "text-pink-500" },
      { value: "visualAids", label: "Visual Helpers", icon: "fas fa-image", color: "text-orange-500" }
    ]
  }
];

export default function Survey() {
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const submitSurveyMutation = useMutation({
    mutationFn: async (surveyData: any) => {
      // First create a user and student profile
      const user = await apiRequest("POST", "/api/users", {
        username: `student_${Date.now()}`,
        displayName: "Student",
        role: "student"
      });
      
      const userData = await user.json();
      
      const profile = await apiRequest("POST", "/api/students/profile", {
        userId: userData.id,
        currentMood: null,
        learningStyle: null,
        interests: [],
        accessibilityNeeds: {},
        level: 1,
        totalXP: 0,
        availableSpins: 3,
        streak: 0,
        badges: []
      });
      
      const profileData = await profile.json();
      
      // Submit survey
      const response = await apiRequest("POST", "/api/survey/submit", {
        studentId: profileData.id,
        responses: surveyData
      });
      
      return { profileData, surveyResponse: await response.json() };
    },
    onSuccess: (data) => {
      toast({
        title: "Survey Completed!",
        description: "Your personalized learning journey is ready!",
      });
      setLocation(`/dashboard/${data.profileData.id}`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit survey. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleOptionSelect = (type: string, value: string, multiple?: boolean) => {
    if (multiple) {
      const current = responses[type] || [];
      const updated = current.includes(value)
        ? current.filter((v: string) => v !== value)
        : [...current, value];
      setResponses({ ...responses, [type]: updated });
    } else {
      setResponses({ ...responses, [type]: value });
    }
  };

  const canProceed = () => {
    const currentQuestion = SURVEY_STEPS[currentStep];
    const answer = responses[currentQuestion.type];
    
    if (currentQuestion.multiple) {
      return answer && answer.length > 0;
    }
    return answer;
  };

  const handleNext = () => {
    if (currentStep < SURVEY_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      submitSurveyMutation.mutate(responses);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentQuestion = SURVEY_STEPS[currentStep];
  const progress = ((currentStep + 1) / SURVEY_STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm shadow-lg border-b-4 border-purple-500 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <i className="fas fa-magic text-white text-lg"></i>
              </div>
              <h1 className="font-display text-2xl text-purple-600">MoodWise Learning Hub</h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <div className="relative">
            {/* Floating magical elements */}
            <div className="absolute -top-4 -left-4 w-8 h-8 bg-yellow-300/30 rounded-full animate-float"></div>
            <div className="absolute -top-2 -right-6 w-6 h-6 bg-purple-400/30 rounded-full animate-float" style={{animationDelay: '0.5s'}}></div>
            <div className="absolute -bottom-2 left-1/2 w-4 h-4 bg-green-400/30 rounded-full animate-float" style={{animationDelay: '1s'}}></div>
            
            <h2 className="font-display text-4xl md:text-6xl text-transparent bg-clip-text magical-gradient mb-4">
              Welcome to Your Magical Learning Journey!
            </h2>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed">
              Every child learns differently, and that's perfectly magical! Let's discover your unique learning style and create an adventure just for you.
            </p>
          </div>
        </div>

        {/* Survey Card */}
        <Card className="bg-white rounded-3xl shadow-xl border-4 border-purple-200 overflow-hidden mb-8 hover:shadow-2xl transition-shadow duration-300">
          <div className="magical-gradient p-6">
            <div className="flex items-center justify-center space-x-3 text-white">
              <i className="fas fa-magic text-2xl animate-pulse"></i>
              <h3 className="font-display text-2xl">Magical Discovery Survey</h3>
              <i className="fas fa-sparkles text-2xl animate-pulse"></i>
            </div>
          </div>
          
          <CardContent className="p-8">
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>{currentStep + 1} of {SURVEY_STEPS.length}</span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>

            {/* Survey Question */}
            <div className="survey-question mb-8">
              <h4 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <i className={`${currentQuestion.icon} text-purple-600 mr-3`}></i>
                {currentQuestion.title}
              </h4>
              
              <div className={`grid gap-4 ${currentQuestion.options.length > 4 ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-2 md:grid-cols-4'}`}>
                {currentQuestion.options.map((option) => {
                  const isSelected = currentQuestion.multiple 
                    ? (responses[currentQuestion.type] || []).includes(option.value)
                    : responses[currentQuestion.type] === option.value;
                    
                  return (
                    <button
                      key={option.value}
                      onClick={() => handleOptionSelect(currentQuestion.type, option.value, currentQuestion.multiple)}
                      className={`p-4 border-2 rounded-xl transition-all duration-300 group hover:scale-105 ${
                        isSelected 
                          ? 'border-purple-500 bg-purple-50 shadow-lg' 
                          : 'border-gray-200 hover:border-purple-300 hover:bg-purple-25'
                      }`}
                    >
                      <i className={`${option.icon} text-3xl ${option.color} group-hover:scale-110 transition-transform mb-2 block`}></i>
                      <p className="font-medium text-gray-800">{option.label}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              <Button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                variant="outline"
                className="px-6 py-3"
              >
                <i className="fas fa-arrow-left mr-2"></i>Previous
              </Button>
              
              <Button
                onClick={handleNext}
                disabled={!canProceed() || submitSurveyMutation.isPending}
                className="px-8 py-3 bg-purple-600 hover:bg-purple-700"
              >
                {submitSurveyMutation.isPending ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Creating Magic...
                  </>
                ) : currentStep === SURVEY_STEPS.length - 1 ? (
                  <>
                    Create My Journey<i className="fas fa-magic ml-2"></i>
                  </>
                ) : (
                  <>
                    Next<i className="fas fa-arrow-right ml-2"></i>
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
