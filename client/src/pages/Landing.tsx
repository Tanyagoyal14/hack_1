import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Book, Gamepad2, Star } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-purple-950 dark:via-blue-950 dark:to-cyan-950">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-6">
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Learning Adventure
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Transform traditional learning into magical adventures! Our platform adapts to each student's unique learning style, mood, and accessibility needs.
          </p>
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 text-lg"
            onClick={() => window.location.href = "/api/login"}
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Start Your Adventure
          </Button>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2">
                <Book className="h-6 w-6 text-purple-600" />
                Magical Subjects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Math becomes Potions, Reading turns into Spells, and Science transforms into Nature Magic!
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2">
                <Gamepad2 className="h-6 w-6 text-blue-600" />
                Personalized Learning
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Our platform adapts to your child's learning style, mood, and accessibility needs for optimal learning.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2">
                <Star className="h-6 w-6 text-yellow-600" />
                Rewards & Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Earn XP, unlock badges, and spin for rewards as you complete magical learning quests!
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to Begin Your Learning Adventure?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Join thousands of students already exploring the magical world of learning.
          </p>
          <Button 
            size="lg" 
            variant="outline"
            onClick={() => window.location.href = "/api/login"}
          >
            Get Started Today
          </Button>
        </div>
      </div>
    </div>
  );
}