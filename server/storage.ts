import { 
  users, 
  studentProfiles, 
  subjects, 
  studentProgress, 
  surveyResponses,
  rewards,
  studentRewards,
  type User, 
  type UpsertUser,
  type StudentProfile,
  type InsertStudentProfile,
  type Subject,
  type StudentProgress,
  type InsertStudentProgress,
  type SurveyResponse,
  type InsertSurveyResponse,
  type Reward,
  type StudentReward,
  type InsertStudentReward
} from "@shared/schema";

export interface IStorage {
  // User management (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Student profiles
  getStudentProfile(userId: string): Promise<StudentProfile | undefined>;
  getStudentProfileById?(id: number): Promise<StudentProfile | undefined>;
  createStudentProfile(profile: InsertStudentProfile): Promise<StudentProfile>;
  updateStudentProfile(id: number, updates: Partial<StudentProfile>): Promise<StudentProfile | undefined>;

  // Subjects
  getAllSubjects(): Promise<Subject[]>;
  getSubject(id: number): Promise<Subject | undefined>;

  // Student progress
  getStudentProgress(studentId: number): Promise<StudentProgress[]>;
  getStudentProgressBySubject(studentId: number, subjectId: number): Promise<StudentProgress | undefined>;
  upsertStudentProgress(progress: InsertStudentProgress): Promise<StudentProgress>;

  // Survey responses
  createSurveyResponse(response: InsertSurveyResponse): Promise<SurveyResponse>;
  getLatestSurveyResponse(studentId: number): Promise<SurveyResponse | undefined>;

  // Rewards
  getAllRewards(): Promise<Reward[]>;
  addStudentReward(reward: InsertStudentReward): Promise<StudentReward>;
  getStudentRewards(studentId: number): Promise<StudentReward[]>;

  // Spins and XP
  updateStudentXP(studentId: number, xpToAdd: number): Promise<void>;
  updateAvailableSpins(studentId: number, spins: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private studentProfiles: Map<number, StudentProfile> = new Map();
  private subjects: Map<number, Subject> = new Map();
  private studentProgress: Map<number, StudentProgress> = new Map();
  private surveyResponses: Map<number, SurveyResponse> = new Map();
  private rewards: Map<number, Reward> = new Map();
  private studentRewards: Map<number, StudentReward> = new Map();
  
  private currentId = 1;
  private currentStudentProfileId = 1;
  private currentProgressId = 1;
  private currentSurveyId = 1;
  private currentRewardId = 1;
  private currentStudentRewardId = 1;

  constructor() {
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Initialize default subjects
    const defaultSubjects: Subject[] = [
      {
        id: 1,
        name: 'Math',
        magicalName: 'Potions',
        icon: 'fas fa-flask',
        color: 'purple',
        description: 'Master magical formulas and number spells!'
      },
      {
        id: 2,
        name: 'Reading',
        magicalName: 'Spells',
        icon: 'fas fa-book-open',
        color: 'blue',
        description: 'Unlock the power of words and stories!'
      },
      {
        id: 3,
        name: 'Science',
        magicalName: 'Nature Magic',
        icon: 'fas fa-seedling',
        color: 'green',
        description: 'Discover the secrets of the natural world!'
      },
      {
        id: 4,
        name: 'Social Studies',
        magicalName: 'World Adventures',
        icon: 'fas fa-globe',
        color: 'yellow',
        description: 'Explore cultures and history around the world!'
      }
    ];

    defaultSubjects.forEach(subject => {
      this.subjects.set(subject.id, subject);
    });

    // Initialize default rewards
    const defaultRewards: Reward[] = [
      { id: 1, name: '50 XP', type: 'xp', value: 50, icon: 'fas fa-star', description: 'Experience points' },
      { id: 2, name: '100 XP', type: 'xp', value: 100, icon: 'fas fa-star', description: 'Experience points' },
      { id: 3, name: 'Math Master Badge', type: 'badge', value: null, icon: 'fas fa-flask', description: 'Potion brewing expert' },
      { id: 4, name: 'Reading Champion Badge', type: 'badge', value: null, icon: 'fas fa-book', description: 'Spell casting master' },
      { id: 5, name: 'Mini Game Unlock', type: 'mini_game', value: null, icon: 'fas fa-gamepad', description: 'Unlock a new mini game' },
      { id: 6, name: 'Avatar Unlock', type: 'unlock', value: null, icon: 'fas fa-user-circle', description: 'New avatar option' }
    ];

    defaultRewards.forEach(reward => {
      this.rewards.set(reward.id, reward);
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async getStudentProfile(userId: number): Promise<StudentProfile | undefined> {
    return Array.from(this.studentProfiles.values()).find(profile => profile.userId === userId);
  }

  async createStudentProfile(insertProfile: InsertStudentProfile): Promise<StudentProfile> {
    const id = this.currentStudentProfileId++;
    const profile: StudentProfile = {
      ...insertProfile,
      id,
      updatedAt: new Date()
    };
    this.studentProfiles.set(id, profile);
    return profile;
  }

  async updateStudentProfile(id: number, updates: Partial<StudentProfile>): Promise<StudentProfile | undefined> {
    const profile = this.studentProfiles.get(id);
    if (!profile) return undefined;
    
    const updatedProfile = { ...profile, ...updates, updatedAt: new Date() };
    this.studentProfiles.set(id, updatedProfile);
    return updatedProfile;
  }

  async getAllSubjects(): Promise<Subject[]> {
    return Array.from(this.subjects.values());
  }

  async getSubject(id: number): Promise<Subject | undefined> {
    return this.subjects.get(id);
  }

  async getStudentProgress(studentId: number): Promise<StudentProgress[]> {
    return Array.from(this.studentProgress.values()).filter(progress => progress.studentId === studentId);
  }

  async getStudentProgressBySubject(studentId: number, subjectId: number): Promise<StudentProgress | undefined> {
    return Array.from(this.studentProgress.values()).find(
      progress => progress.studentId === studentId && progress.subjectId === subjectId
    );
  }

  async upsertStudentProgress(insertProgress: InsertStudentProgress): Promise<StudentProgress> {
    const existing = await this.getStudentProgressBySubject(insertProgress.studentId, insertProgress.subjectId);
    
    if (existing) {
      const updated = { ...existing, ...insertProgress, lastAccessed: new Date() };
      this.studentProgress.set(existing.id, updated);
      return updated;
    } else {
      const id = this.currentProgressId++;
      const progress: StudentProgress = {
        ...insertProgress,
        id,
        lastAccessed: new Date()
      };
      this.studentProgress.set(id, progress);
      return progress;
    }
  }

  async createSurveyResponse(insertResponse: InsertSurveyResponse): Promise<SurveyResponse> {
    const id = this.currentSurveyId++;
    const response: SurveyResponse = {
      ...insertResponse,
      id,
      createdAt: new Date()
    };
    this.surveyResponses.set(id, response);
    return response;
  }

  async getLatestSurveyResponse(studentId: number): Promise<SurveyResponse | undefined> {
    const responses = Array.from(this.surveyResponses.values())
      .filter(response => response.studentId === studentId)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
    
    return responses[0];
  }

  async getAllRewards(): Promise<Reward[]> {
    return Array.from(this.rewards.values());
  }

  async addStudentReward(insertReward: InsertStudentReward): Promise<StudentReward> {
    const id = this.currentStudentRewardId++;
    const reward: StudentReward = {
      ...insertReward,
      id,
      earnedAt: new Date()
    };
    this.studentRewards.set(id, reward);
    return reward;
  }

  async getStudentRewards(studentId: number): Promise<StudentReward[]> {
    return Array.from(this.studentRewards.values()).filter(reward => reward.studentId === studentId);
  }

  async updateStudentXP(studentId: number, xpToAdd: number): Promise<void> {
    const profile = Array.from(this.studentProfiles.values()).find(p => p.id === studentId);
    if (profile) {
      const newXP = (profile.totalXP || 0) + xpToAdd;
      const newLevel = Math.floor(newXP / 100) + 1;
      
      await this.updateStudentProfile(profile.id, {
        totalXP: newXP,
        level: newLevel
      });
    }
  }

  async updateAvailableSpins(studentId: number, spins: number): Promise<void> {
    const profile = Array.from(this.studentProfiles.values()).find(p => p.id === studentId);
    if (profile) {
      await this.updateStudentProfile(profile.id, {
        availableSpins: spins
      });
    }
  }
}

import { DatabaseStorage } from "./database-storage";

export const storage = new DatabaseStorage();
