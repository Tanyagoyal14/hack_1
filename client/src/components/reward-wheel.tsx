import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface RewardWheelProps {
  studentId: number;
  availableSpins: number;
  onRewardEarned: () => void;
}

export function RewardWheel({ studentId, availableSpins, onRewardEarned }: RewardWheelProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const { toast } = useToast();

  const spinWheelMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/students/rewards/spin", {
        studentId
      });
      return response.json();
    },
    onSuccess: (data) => {
      const reward = data.reward;
      toast({
        title: "Reward Earned! 🎉",
        description: `You won: ${reward.name}${reward.description ? ` - ${reward.description}` : ''}`,
      });
      onRewardEarned();
    },
    onError: (error: any) => {
      toast({
        title: "Spin Failed",
        description: error.message || "No spins available",
        variant: "destructive",
      });
    }
  });

  const handleSpin = () => {
    if (availableSpins <= 0) {
      toast({
        title: "No Spins Available",
        description: "Complete more tasks to earn spins!",
        variant: "destructive",
      });
      return;
    }

    setIsSpinning(true);
    
    // Visual spinning animation
    const wheel = document.querySelector('.reward-wheel');
    if (wheel) {
      wheel.classList.add('animate-wheel-spin');
    }

    // Spin after animation delay
    setTimeout(() => {
      spinWheelMutation.mutate();
      setIsSpinning(false);
      if (wheel) {
        wheel.classList.remove('animate-wheel-spin');
      }
    }, 3000);
  };

  return (
    <Card className="bg-white rounded-2xl shadow-lg border-2 border-yellow-300/30">
      <CardContent className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
          <i className="fas fa-star text-yellow-600 mr-2"></i>
          Spin to Earn Rewards!
        </h3>
        
        <div className="relative mx-auto w-48 h-48 mb-6">
          {/* Reward Wheel */}
          <div 
            className="reward-wheel relative w-full h-full rounded-full border-8 border-yellow-500 shadow-lg overflow-hidden"
            style={{
              background: 'conic-gradient(from 0deg, #F59E0B 0deg 60deg, #8B5CF6 60deg 120deg, #10B981 120deg 180deg, #3B82F6 180deg 240deg, #EF4444 240deg 300deg, #F97316 300deg 360deg)'
            }}
          >
            {/* Wheel sections with icons */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="grid grid-cols-3 w-full h-full text-white font-bold text-xs">
                <div className="flex items-center justify-center transform -rotate-30">
                  <i className="fas fa-star"></i>
                </div>
                <div className="flex items-center justify-center transform rotate-30">
                  <i className="fas fa-gem"></i>
                </div>
                <div className="flex items-center justify-center transform rotate-90">
                  <i className="fas fa-trophy"></i>
                </div>
                <div className="flex items-center justify-center transform rotate-150">
                  <i className="fas fa-medal"></i>
                </div>
                <div className="flex items-center justify-center transform -rotate-150">
                  <i className="fas fa-gamepad"></i>
                </div>
                <div className="flex items-center justify-center transform -rotate-90">
                  <i className="fas fa-gift"></i>
                </div>
              </div>
            </div>
            
            {/* Wheel pointer */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 w-0 h-0 border-l-4 border-r-4 border-b-8 border-transparent border-b-gray-800 z-10"></div>
            
            {/* Center button */}
            <Button
              onClick={handleSpin}
              disabled={isSpinning || spinWheelMutation.isPending || availableSpins <= 0}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white text-gray-800 rounded-full border-4 border-yellow-500 shadow-lg hover:scale-110 transition-transform font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSpinning ? (
                <i className="fas fa-spinner fa-spin"></i>
              ) : (
                "SPIN"
              )}
            </Button>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Complete tasks to earn spins!</p>
            <div className="flex items-center justify-center space-x-2">
              <i className="fas fa-coins text-yellow-600"></i>
              <span className="font-semibold">
                {availableSpins} spin{availableSpins !== 1 ? 's' : ''} available
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
