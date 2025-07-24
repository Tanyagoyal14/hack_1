import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, User } from "lucide-react";

export default function Home() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 dark:text-gray-300">Loading your adventure...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-purple-950 dark:via-blue-950 dark:to-cyan-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Welcome back, {user?.firstName || 'Adventurer'}! 
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">
              Ready to continue your magical learning journey?
            </p>
          </div>
          <div className="flex gap-4">
            {user?.profileImageUrl && (
              <img 
                src={user.profileImageUrl} 
                alt="Profile" 
                className="w-12 h-12 rounded-full object-cover"
              />
            )}
            <Button 
              variant="outline"
              onClick={() => window.location.href = "/api/logout"}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* User Info Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Your Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p><strong>Name:</strong> {user?.firstName} {user?.lastName}</p>
                <p><strong>Email:</strong> {user?.email}</p>
                <p><strong>Role:</strong> {user?.role}</p>
              </div>
              <div>
                <p><strong>User ID:</strong> {user?.id}</p>
                <p><strong>Joined:</strong> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Create Student Profile</CardTitle>
              <CardDescription>Set up a learning profile to get started</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                Create Profile
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>View Subjects</CardTitle>
              <CardDescription>Explore magical learning subjects</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                Explore Subjects
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Progress Dashboard</CardTitle>
              <CardDescription>See your learning progress and achievements</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                View Progress
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}