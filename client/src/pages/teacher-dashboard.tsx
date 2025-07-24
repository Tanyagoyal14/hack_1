import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface TeacherDashboardProps {
  params: { studentId: string };
}

export default function TeacherDashboard({ params }: TeacherDashboardProps) {
  const studentId = parseInt(params.studentId);

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['/api/students', studentId, 'dashboard'],
    enabled: !!studentId,
  });

  const { data: progressData } = useQuery({
    queryKey: ['/api/students', studentId, 'progress'],
    enabled: !!studentId,
  });

  const { data: latestSurvey } = useQuery({
    queryKey: ['/api/students', studentId, 'survey', 'latest'],
    enabled: !!studentId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
          <p className="text-lg text-gray-600">Loading teacher dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-6">
          <CardContent>
            <p className="text-lg text-gray-600 mb-4">Student data not found.</p>
            <Link href="/survey">
              <Button>Back to Survey</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { profile, subjects } = dashboardData;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <i className="fas fa-chart-line text-white text-lg"></i>
              </div>
              <h1 className="text-2xl font-semibold text-gray-900">Teacher Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href={`/dashboard/${studentId}`}>
                <Button variant="outline">
                  <i className="fas fa-arrow-left mr-2"></i>
                  Back to Student View
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Student Progress Report</h2>
          <p className="text-gray-600">Comprehensive overview of learning progress and emotional well-being</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <i className="fas fa-user text-blue-600 text-xl"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Current Level</p>
                  <p className="text-2xl font-semibold text-gray-900">{profile.level || 1}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <i className="fas fa-star text-yellow-600 text-xl"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Total XP</p>
                  <p className="text-2xl font-semibold text-gray-900">{profile.totalXP || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <i className="fas fa-fire text-green-600 text-xl"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Streak</p>
                  <p className="text-2xl font-semibold text-gray-900">{profile.streak || 0} days</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <i className="fas fa-medal text-purple-600 text-xl"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Badges</p>
                  <p className="text-2xl font-semibold text-gray-900">{(profile.badges || []).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Subject Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <i className="fas fa-graduation-cap text-blue-600 mr-2"></i>
                Subject Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {subjects?.map((subject: any) => (
                  <div key={subject.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{subject.magicalName} ({subject.name})</span>
                      <span className="text-sm text-gray-600">{subject.progress}%</span>
                    </div>
                    <Progress value={subject.progress} className="h-2" />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{subject.completedTasks} completed</span>
                      <span>{subject.totalTasks} total tasks</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Learning Profile */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <i className="fas fa-brain text-green-600 mr-2"></i>
                Learning Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Current Mood</h4>
                  <div className="flex items-center space-x-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      profile.currentMood === 'calm' ? 'bg-blue-100' :
                      profile.currentMood === 'happy' ? 'bg-yellow-100' :
                      profile.currentMood === 'excited' ? 'bg-orange-100' :
                      'bg-purple-100'
                    }`}>
                      <i className={`${
                        profile.currentMood === 'calm' ? 'fas fa-leaf text-green-600' :
                        profile.currentMood === 'happy' ? 'fas fa-smile text-yellow-600' :
                        profile.currentMood === 'excited' ? 'fas fa-bolt text-blue-600' :
                        'fas fa-heart text-purple-600'
                      }`}></i>
                    </div>
                    <span className="capitalize">{profile.currentMood || 'Not set'}</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Learning Style</h4>
                  <span className="capitalize bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                    {profile.learningStyle || 'Not determined'}
                  </span>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Interests</h4>
                  <div className="flex flex-wrap gap-2">
                    {(profile.interests || []).map((interest: string, index: number) => (
                      <span key={index} className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-sm">
                        {interest}
                      </span>
                    ))}
                    {(profile.interests || []).length === 0 && (
                      <span className="text-gray-500 text-sm">No interests recorded</span>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Accessibility Needs</h4>
                  <div className="space-y-1">
                    {profile.accessibilityNeeds && Object.keys(profile.accessibilityNeeds).length > 0 ? (
                      Object.entries(profile.accessibilityNeeds).map(([key, value]) => (
                        <div key={key} className="flex items-center space-x-2 text-sm">
                          <i className="fas fa-check text-green-600"></i>
                          <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-gray-500 text-sm">No specific accessibility needs</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Emotional Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <i className="fas fa-heart text-pink-600 mr-2"></i>
                Emotional Well-being
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <i className="fas fa-smile text-green-600"></i>
                    <span className="font-medium">Overall Mood Trend</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    Student shows predominantly {profile.currentMood || 'positive'} emotional state during learning sessions.
                  </p>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <i className="fas fa-chart-line text-blue-600"></i>
                    <span className="font-medium">Engagement Level</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    High engagement observed, particularly in {profile.learningStyle || 'interactive'} learning activities.
                  </p>
                </div>

                <div className="p-4 bg-yellow-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <i className="fas fa-clock text-yellow-600"></i>
                    <span className="font-medium">Optimal Learning Times</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    Best performance observed during morning and early afternoon sessions.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <i className="fas fa-lightbulb text-orange-600 mr-2"></i>
                Teaching Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <i className="fas fa-check-circle text-green-600 mt-1"></i>
                  <div>
                    <p className="font-medium">Continue {profile.learningStyle || 'current'} approach</p>
                    <p className="text-sm text-gray-600">Student responds well to current learning methodology</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <i className="fas fa-check-circle text-green-600 mt-1"></i>
                  <div>
                    <p className="font-medium">Maintain mood-adaptive content</p>
                    <p className="text-sm text-gray-600">Current mood-based adjustments are effective</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <i className="fas fa-exclamation-triangle text-yellow-600 mt-1"></i>
                  <div>
                    <p className="font-medium">Increase interactive elements</p>
                    <p className="text-sm text-gray-600">Consider adding more hands-on activities in weaker subjects</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <i className="fas fa-info-circle text-blue-600 mt-1"></i>
                  <div>
                    <p className="font-medium">Schedule regular check-ins</p>
                    <p className="text-sm text-gray-600">Monitor emotional state and adjust support as needed</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center space-x-4">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <i className="fas fa-download mr-2"></i>
            Export Detailed Report
          </Button>
          <Button variant="outline">
            <i className="fas fa-calendar mr-2"></i>
            Schedule Parent Conference
          </Button>
          <Button variant="outline">
            <i className="fas fa-comment mr-2"></i>
            Add Notes
          </Button>
        </div>
      </div>
    </div>
  );
}
