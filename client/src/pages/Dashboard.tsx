import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Sparkles, BookOpen, Beaker, Leaf, Globe, Star, Trophy, Zap } from "lucide-react";

export default function Dashboard() {
  const { studentId } = useParams();
  const { user } = useAuth();

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: [`/api/students/${studentId}/dashboard`],
    enabled: !!studentId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading your magical dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Profile Not Found</CardTitle>
            <CardDescription>
              We couldn't find your learning profile. Would you like to create one?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.href = "/"}>
              Create Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { profile, subjects } = dashboardData as any;

  const getSubjectIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'math': return Beaker;
      case 'reading': return BookOpen;
      case 'science': return Leaf;
      case 'social studies': return Globe;
      default: return Sparkles;
    }
  };

  const getColorClass = (color: string) => {
    switch (color) {
      case 'purple': return 'from-purple-500 to-purple-600';
      case 'blue': return 'from-blue-500 to-blue-600';
      case 'green': return 'from-green-500 to-green-600';
      case 'yellow': return 'from-yellow-500 to-yellow-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">
              Welcome back, {(user as any)?.firstName || 'Adventurer'}!
            </h1>
            <p className="text-lg text-gray-600 mt-2">
              Ready to continue your magical learning journey?
            </p>
          </div>
          <Button 
            variant="outline"
            onClick={() => window.location.href = "/api/logout"}
          >
            Logout
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Level</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Trophy className="h-8 w-8 text-yellow-500 mr-3" />
                <span className="text-3xl font-bold">{profile.level || 1}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total XP</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Star className="h-8 w-8 text-purple-500 mr-3" />
                <span className="text-3xl font-bold">{profile.totalXP || 0}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Streak</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Zap className="h-8 w-8 text-orange-500 mr-3" />
                <span className="text-3xl font-bold">{profile.streak || 0}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Available Spins</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Sparkles className="h-8 w-8 text-blue-500 mr-3" />
                <span className="text-3xl font-bold">{profile.availableSpins || 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current Mood */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your Magical Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Current Mood</p>
                <Badge variant="secondary" className="text-lg">
                  {profile.currentMood || 'Unknown'}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Learning Style</p>
                <Badge variant="secondary" className="text-lg">
                  {profile.learningStyle || 'Mixed'}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Level Progress</p>
                <div className="flex items-center gap-2">
                  <Progress value={((profile.totalXP || 0) % 100)} className="flex-1" />
                  <span className="text-sm text-gray-600">
                    {(profile.totalXP || 0) % 100}/100 XP
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subjects */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Magical Subjects</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {subjects.map((subject: any) => {
              const IconComponent = getSubjectIcon(subject.name);
              return (
                <Card key={subject.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className={`w-12 h-12 bg-gradient-to-r ${getColorClass(subject.color)} rounded-lg flex items-center justify-center mb-4`}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-lg">{subject.magicalName}</CardTitle>
                    <CardDescription>{subject.name}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{subject.progress || 0}%</span>
                        </div>
                        <Progress value={subject.progress || 0} />
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Tasks: {subject.completedTasks || 0}/{subject.totalTasks || 10}</span>
                      </div>
                      <Button 
                        className="w-full mt-4" 
                        size="sm"
                        onClick={() => window.location.href = `/game/${studentId}/${subject.id}`}
                      >
                        Continue Learning
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Reward Spin */}
        {profile.availableSpins > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Magical Reward Wheel
              </CardTitle>
              <CardDescription>
                You have {profile.availableSpins} spins available! 
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                size="lg"
                onClick={() => window.location.href = `/spin/${studentId}`}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Spin for Rewards!
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}