import { useState } from "react";
import { useParams } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Star, Trophy, Gift, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const WHEEL_COLORS = [
  'from-red-500 to-red-600',
  'from-blue-500 to-blue-600', 
  'from-green-500 to-green-600',
  'from-yellow-500 to-yellow-600',
  'from-purple-500 to-purple-600',
  'from-pink-500 to-pink-600'
];

export default function SpinWheel() {
  const { studentId } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastReward, setLastReward] = useState<any>(null);
  const [spinRotation, setSpinRotation] = useState(0);

  const { data: dashboardData } = useQuery({
    queryKey: [`/api/students/${studentId}/dashboard`],
    enabled: !!studentId,
  });

  const { data: rewards } = useQuery({
    queryKey: ["/api/rewards"],
  });

  const spinMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/students/rewards/spin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: (dashboardData as any)?.profile?.id }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to spin');
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      setLastReward(data.reward);
      toast({
        title: "Reward Won!",
        description: `You won: ${data.reward.name}!`,
      });
      
      // Refresh dashboard data
      queryClient.invalidateQueries({ queryKey: [`/api/students/${studentId}/dashboard`] });
    },
    onError: (error: any) => {
      toast({
        title: "Spin Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSpin = () => {
    if (isSpinning || (dashboardData as any)?.profile?.availableSpins <= 0) return;
    
    setIsSpinning(true);
    
    // Random rotation between 1440-2160 degrees (4-6 full rotations)
    const randomRotation = 1440 + Math.random() * 720;
    setSpinRotation(prev => prev + randomRotation);
    
    // Start the API call after animation begins
    setTimeout(() => {
      spinMutation.mutate();
    }, 500);
    
    // Stop spinning after animation
    setTimeout(() => {
      setIsSpinning(false);
    }, 3000);
  };

  if (!dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const profile = (dashboardData as any).profile;

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
            <h1 className="text-4xl font-bold text-gray-900">Magical Reward Wheel</h1>
            <p className="text-gray-600">Spin to win amazing rewards!</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Available Spins</p>
            <p className="text-2xl font-bold text-purple-600">{profile.availableSpins || 0}</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Spin Wheel */}
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="flex items-center justify-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Spin the Wheel
                </CardTitle>
                <CardDescription>
                  Click the wheel to spin for magical rewards!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative w-80 h-80 mx-auto mb-6">
                  {/* Wheel */}
                  <div 
                    className={`w-full h-full rounded-full border-8 border-gray-300 relative overflow-hidden transition-transform duration-3000 ease-out cursor-pointer ${isSpinning ? 'animate-pulse' : ''}`}
                    style={{ transform: `rotate(${spinRotation}deg)` }}
                    onClick={handleSpin}
                  >
                    {rewards && (rewards as any[]).map((reward, index) => {
                      const angle = (360 / (rewards as any[]).length) * index;
                      const colorClass = WHEEL_COLORS[index % WHEEL_COLORS.length];
                      
                      return (
                        <div
                          key={reward.id}
                          className={`absolute w-full h-full bg-gradient-to-r ${colorClass} opacity-80`}
                          style={{
                            transform: `rotate(${angle}deg)`,
                            clipPath: `polygon(50% 50%, 50% 0%, 65% 15%)`
                          }}
                        >
                          <div 
                            className="absolute top-8 left-1/2 transform -translate-x-1/2 text-white font-bold text-xs whitespace-nowrap"
                            style={{ transform: `translateX(-50%) rotate(15deg)` }}
                          >
                            {reward.name.slice(0, 8)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Pointer */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
                    <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-red-500"></div>
                  </div>
                  
                  {/* Center button */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <Button
                      onClick={handleSpin}
                      disabled={isSpinning || profile.availableSpins <= 0}
                      className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                      size="sm"
                    >
                      {isSpinning ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      ) : (
                        <Sparkles className="h-6 w-6" />
                      )}
                    </Button>
                  </div>
                </div>

                {profile.availableSpins <= 0 && (
                  <p className="text-gray-500 mb-4">
                    No spins available. Complete learning activities to earn more spins!
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Rewards Display */}
            <div className="space-y-6">
              {/* Last Reward Won */}
              {lastReward && (
                <Card className="border-2 border-yellow-400 bg-yellow-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-yellow-800">
                      <Trophy className="h-5 w-5" />
                      Last Reward Won!
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center">
                        <Gift className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{lastReward.name}</h3>
                        <p className="text-gray-600">{lastReward.description}</p>
                        {lastReward.value && (
                          <Badge variant="secondary">+{lastReward.value} {lastReward.type}</Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Available Rewards */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Possible Rewards
                  </CardTitle>
                  <CardDescription>
                    Here's what you can win on the wheel:
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {rewards && (rewards as any[]).map((reward) => {
                      const colorClass = WHEEL_COLORS[reward.id % WHEEL_COLORS.length];
                      return (
                        <div key={reward.id} className="flex items-center gap-3 p-3 rounded-lg border">
                          <div className={`w-8 h-8 bg-gradient-to-r ${colorClass} rounded-full flex items-center justify-center`}>
                            <Star className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{reward.name}</h4>
                            <p className="text-sm text-gray-600">{reward.description}</p>
                          </div>
                          {reward.value && (
                            <Badge variant="outline">+{reward.value}</Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}