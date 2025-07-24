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

// MemStorage removed - using DatabaseStorage for PostgreSQL

import { DatabaseStorage } from "./database-storage";

export const storage = new DatabaseStorage();
