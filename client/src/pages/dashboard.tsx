import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { SubjectCard } from "@/components/subject-card";
import { RewardWheel } from "@/components/reward-wheel";
import { MoodIndicator } from "@/components/mood-indicator";
import { useTTS } from "@/hooks/use-tts";

interface DashboardProps {
  params: { studentId: string };
}

export default function Dashboard({ params }: DashboardProps) {
  const studentId = parseInt(params.studentId);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { speak } = useTTS();

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['/api/students', studentId, 'dashboard'],
    enabled: !!studentId,
  });

  const retakeSurveyMutation = useMutation({
    mutationFn: async () => {
      // Navigate back to survey
      window.location.href = '/survey';
    }
  });

  const updateMoodMutation = useMutation({
    mutationFn: async (newMood: string) => {
      const response = await apiRequest("PATCH", `/api/students/profile/${(dashboardData as any)?.profile?.id}`, {
        currentMood: newMood
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/students', studentId, 'dashboard'] });
      toast({
        title: "Mood Updated!",
        description: "Your learning content has been adapted to your current mood.",
      });
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-magic text-4xl text-purple-600 animate-spin mb-4"></i>
          <p className="text-lg text-gray-600">Preparing your magical dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 flex items-center justify-center">
        <Card className="p-6">
          <CardContent>
            <p className="text-lg text-gray-600 mb-4">Dashboard not found. Would you like to take the survey?</p>
            <Link href="/survey">
              <Button className="bg-purple-600 hover:bg-purple-700">
                <i className="fas fa-magic mr-2"></i>
                Start Survey
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { profile, subjects } = (dashboardData as any) || {};

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
            <div className="flex items-center space-x-4">
              <MoodIndicator 
                mood={profile.currentMood} 
                onMoodChange={(mood) => updateMoodMutation.mutate(mood)}
              />
              <div className="flex items-center space-x-2 bg-yellow-300/20 px-3 py-2 rounded-full">
                <i className="fas fa-star text-yellow-600"></i>
                <span className="text-sm font-semibold">{profile.totalXP || 0} XP</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <div className="relative">
            {/* Floating magical elements */}
            <div className="absolute -top-4 -left-4 w-8 h-8 bg-yellow-300/30 rounded-full animate-float"></div>
            <div className="absolute -top-2 -right-6 w-6 h-6 bg-purple-400/30 rounded-full animate-float" style={{animationDelay: '0.5s'}}></div>
            <div className="absolute -bottom-2 left-1/2 w-4 h-4 bg-green-400/30 rounded-full animate-float" style={{animationDelay: '1s'}}></div>
            
            <h2 className="font-display text-4xl md:text-6xl text-transparent bg-clip-text magical-gradient mb-4">
              Welcome Back, Young Wizard! ✨
            </h2>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed">
              Your magical learning adventure continues! Ready to explore new spells and potions?
            </p>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          
          {/* Learning Subjects */}
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <i className="fas fa-graduation-cap text-purple-600 mr-3"></i>
              Your Magical Subjects
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {subjects?.map((subject: any) => (
                <SubjectCard 
                  key={subject.id} 
                  subject={subject}
                  studentId={studentId}
                  onSpeak={() => speak(`${subject.magicalName}: ${subject.description}`)}
                />
              ))}
            </div>
          </div>

          {/* Sidebar - Rewards & Stats */}
          <div className="space-y-6">
            {/* Reward Wheel */}
            <RewardWheel 
              studentId={studentId}
              availableSpins={profile.availableSpins || 0}
              onRewardEarned={() => {
                queryClient.invalidateQueries({ queryKey: ['/api/students', studentId, 'dashboard'] });
              }}
            />

            {/* Stats Panel */}
            <Card className="bg-white rounded-2xl shadow-lg border-2 border-purple-100">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  <i className="fas fa-chart-line text-purple-600 mr-2"></i>
                  Your Progress
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <i className="fas fa-trophy text-yellow-600"></i>
                      <span className="font-medium">Level</span>
                    </div>
                    <span className="font-bold text-purple-600">Level {profile.level || 1}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <i className="fas fa-medal text-blue-600"></i>
                      <span className="font-medium">Badges</span>
                    </div>
                    <span className="font-bold text-blue-600">{(profile.badges || []).length} badges</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <i className="fas fa-fire text-green-600"></i>
                      <span className="font-medium">Streak</span>
                    </div>
                    <span className="font-bold text-green-600">{profile.streak || 0} days</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Mood Tracking */}
            <Card className="bg-white rounded-2xl shadow-lg border-2 border-purple-100">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  <i className="fas fa-heart text-purple-600 mr-2"></i>
                  Mood Tracking
                </h3>
                
                <div className="text-center">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${
                    profile.currentMood === 'calm' ? 'bg-blue-100' :
                    profile.currentMood === 'happy' ? 'bg-yellow-100' :
                    profile.currentMood === 'excited' ? 'bg-orange-100' :
                    'bg-purple-100'
                  }`}>
                    <i className={`text-2xl ${
                      profile.currentMood === 'calm' ? 'fas fa-leaf text-green-600' :
                      profile.currentMood === 'happy' ? 'fas fa-smile text-yellow-600' :
                      profile.currentMood === 'excited' ? 'fas fa-bolt text-blue-600' :
                      'fas fa-heart text-purple-600'
                    }`}></i>
                  </div>
                  <p className="font-semibold text-gray-800 capitalize">
                    Feeling {profile.currentMood || 'Great'}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">Content is adapted to your current mood</p>
                  
                  <Button 
                    onClick={() => retakeSurveyMutation.mutate()}
                    className="mt-4 bg-purple-600 hover:bg-purple-700 text-sm"
                  >
                    Update Mood
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Teacher/Parent Dashboard Link */}
        <Card className="bg-white rounded-2xl shadow-lg border-2 border-blue-100 mb-8">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                <i className="fas fa-users text-blue-600 mr-3"></i>
                Teacher & Parent Dashboard
              </h3>
              <Link href={`/teacher/${studentId}`}>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <i className="fas fa-external-link-alt mr-2"></i>
                  View Progress Report
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 rounded-xl p-6">
                <h4 className="font-semibold text-gray-800 mb-3">Learning Progress</h4>
                <div className="space-y-2">
                  {subjects?.slice(0, 3).map((subject: any) => (
                    <div key={subject.id} className="flex justify-between text-sm">
                      <span>{subject.magicalName}</span>
                      <span className="font-semibold">{subject.progress}%</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-green-50 rounded-xl p-6">
                <h4 className="font-semibold text-gray-800 mb-3">Emotional Trends</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <i className="fas fa-smile text-green-500"></i>
                    <span className="text-sm">Predominantly {profile.currentMood || 'positive'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <i className="fas fa-chart-line text-blue-500"></i>
                    <span className="text-sm">Engagement improving</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <i className="fas fa-clock text-orange-500"></i>
                    <span className="text-sm">Best learning time: Anytime</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-purple-50 rounded-xl p-6">
                <h4 className="font-semibold text-gray-800 mb-3">Recommendations</h4>
                <div className="space-y-2 text-sm">
                  <p>• Continue with {profile.learningStyle || 'current'} learning activities</p>
                  <p>• Maintain current mood-based environment</p>
                  <p>• Explore more interactive elements</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Support Options */}
        <Card className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-2xl">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Need Help on Your Journey?</h3>
            <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
              Our magical support team is always here to help you succeed. Don't hesitate to reach out!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-purple-600 hover:bg-purple-700">
                <i className="fas fa-exclamation-circle mr-2"></i>
                Raise a Concern
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <i className="fas fa-calendar mr-2"></i>
                Schedule Mentor Call
              </Button>
              <Button 
                onClick={() => retakeSurveyMutation.mutate()}
                className="bg-green-600 hover:bg-green-700"
              >
                <i className="fas fa-redo mr-2"></i>
                Retake Survey
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Floating TTS Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button 
          onClick={() => speak("Welcome to your magical learning dashboard!")}
          className="w-14 h-14 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 animate-pulse"
          title="Text-to-Speech"
        >
          <i className="fas fa-volume-up text-xl"></i>
        </Button>
      </div>
    </div>
  );
}
