import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertStudentProfileSchema, 
  insertSurveyResponseSchema,
  insertStudentRewardSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);
  
  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Student profile routes
  app.get("/api/students/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getStudentProfile(userId);
      if (!profile) {
        return res.status(404).json({ message: "Student profile not found" });
      }
      res.json(profile);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/students/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profileData = insertStudentProfileSchema.parse({
        ...req.body,
        userId
      });
      const profile = await storage.createStudentProfile(profileData);
      res.json(profile);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/students/profile/:id", async (req, res) => {
    try {
      const updates = req.body;
      const profile = await storage.updateStudentProfile(parseInt(req.params.id), updates);
      if (!profile) {
        return res.status(404).json({ message: "Student profile not found" });
      }
      res.json(profile);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Subject routes
  app.get("/api/subjects", async (req, res) => {
    try {
      const subjects = await storage.getAllSubjects();
      res.json(subjects);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Progress routes
  app.get("/api/students/:studentId/progress", async (req, res) => {
    try {
      const progress = await storage.getStudentProgress(parseInt(req.params.studentId));
      res.json(progress);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/students/progress", async (req, res) => {
    try {
      const progressData = req.body;
      const progress = await storage.upsertStudentProgress(progressData);
      res.json(progress);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Survey routes
  app.post("/api/survey/submit", async (req, res) => {
    try {
      const surveyData = insertSurveyResponseSchema.parse(req.body);
      
      // Analyze survey responses (simple analysis for now)
      const analyzedData = {
        mood: 'happy',
        learningStyle: 'visual',
        interests: [],
        accessibilityNeeds: {}
      };
      
      // Save survey response with analysis
      const response = await storage.createSurveyResponse({
        ...surveyData,
        analyzedData
      });

      // Update student profile based on analysis
      const profile = await storage.getStudentProfileById(surveyData.studentId);
      if (profile) {
        await storage.updateStudentProfile(profile.id, {
          currentMood: analyzedData.mood,
          learningStyle: analyzedData.learningStyle,
          interests: analyzedData.interests,
          accessibilityNeeds: analyzedData.accessibilityNeeds
        });
      }

      res.json(response);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/students/:studentId/survey/latest", async (req, res) => {
    try {
      const response = await storage.getLatestSurveyResponse(parseInt(req.params.studentId));
      if (!response) {
        return res.status(404).json({ message: "No survey responses found" });
      }
      res.json(response);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Reward routes
  app.get("/api/rewards", async (req, res) => {
    try {
      const rewards = await storage.getAllRewards();
      res.json(rewards);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/students/rewards/spin", async (req, res) => {
    try {
      const { studentId } = req.body;
      
      // Check if student has available spins
      const profile = await storage.getStudentProfile(studentId);
      if (!profile || (profile.availableSpins || 0) <= 0) {
        return res.status(400).json({ message: "No spins available" });
      }

      // Get random reward
      const rewards = await storage.getAllRewards();
      const randomReward = rewards[Math.floor(Math.random() * rewards.length)];

      // Add reward to student
      await storage.addStudentReward({
        studentId: profile.id,
        rewardId: randomReward.id
      });

      // Update XP if reward gives XP
      if (randomReward.type === 'xp' && randomReward.value) {
        await storage.updateStudentXP(profile.id, randomReward.value);
      }

      // Decrease available spins
      await storage.updateAvailableSpins(profile.id, (profile.availableSpins || 0) - 1);

      res.json({ reward: randomReward });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/students/:studentId/rewards", async (req, res) => {
    try {
      const rewards = await storage.getStudentRewards(parseInt(req.params.studentId));
      res.json(rewards);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Dashboard data endpoint
  app.get("/api/students/:studentId/dashboard", async (req, res) => {
    try {
      const studentId = parseInt(req.params.studentId);
      
      // Get student profile by ID
      const profile = await (storage as any).getStudentProfileById?.(studentId);
      
      if (!profile) {
        return res.status(404).json({ message: "Student not found" });
      }

      // Get subjects and progress
      const subjects = await storage.getAllSubjects();
      const progress = await storage.getStudentProgress(studentId);

      // Combine subjects with progress
      const subjectsWithProgress = subjects.map(subject => {
        const subjectProgress = progress.find(p => p.subjectId === subject.id);
        return {
          ...subject,
          progress: subjectProgress?.progress || 0,
          completedTasks: subjectProgress?.completedTasks || 0,
          totalTasks: subjectProgress?.totalTasks || 10
        };
      });

      res.json({
        profile,
        subjects: subjectsWithProgress
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Game progress endpoint
  app.post("/api/students/:studentId/progress", async (req, res) => {
    try {
      const studentId = parseInt(req.params.studentId);
      const { gameId, score, xpEarned } = req.body;
      
      // Update student XP for completing game
      const profile = await (storage as any).getStudentProfileById?.(studentId);
      if (profile) {
        await storage.updateStudentXP(profile.id, xpEarned || 0);
        
        // Award extra spin for good performance
        if (score >= 4) {
          await storage.updateAvailableSpins(profile.id, (profile.availableSpins || 0) + 1);
        }
      }
      
      res.json({ success: true, xpEarned, bonusSpin: score >= 4 });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
