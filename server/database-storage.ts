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
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";
import { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Student profiles
  async getStudentProfile(userId: string): Promise<StudentProfile | undefined> {
    const [profile] = await db.select().from(studentProfiles).where(eq(studentProfiles.userId, userId));
    return profile;
  }

  async getStudentProfileById(id: number): Promise<StudentProfile | undefined> {
    const [profile] = await db.select().from(studentProfiles).where(eq(studentProfiles.id, id));
    return profile;
  }

  async createStudentProfile(insertProfile: InsertStudentProfile): Promise<StudentProfile> {
    const [profile] = await db
      .insert(studentProfiles)
      .values({
        ...insertProfile,
        // Ensure JSON fields are stringified for SQLite
        interests: typeof insertProfile.interests === 'string' ? insertProfile.interests : JSON.stringify(insertProfile.interests || []),
        accessibilityNeeds: typeof insertProfile.accessibilityNeeds === 'string' ? insertProfile.accessibilityNeeds : JSON.stringify(insertProfile.accessibilityNeeds || {}),
        badges: typeof insertProfile.badges === 'string' ? insertProfile.badges : JSON.stringify(insertProfile.badges || []),
      })
      .returning();
    return profile;
  }

  async updateStudentProfile(id: number, updates: Partial<StudentProfile>): Promise<StudentProfile | undefined> {
    const [profile] = await db
      .update(studentProfiles)
      .set({ 
        ...updates, 
        updatedAt: new Date(),
        // Ensure JSON fields are stringified for SQLite
        ...(updates.interests && { interests: typeof updates.interests === 'string' ? updates.interests : JSON.stringify(updates.interests) }),
        ...(updates.accessibilityNeeds && { accessibilityNeeds: typeof updates.accessibilityNeeds === 'string' ? updates.accessibilityNeeds : JSON.stringify(updates.accessibilityNeeds) }),
        ...(updates.badges && { badges: typeof updates.badges === 'string' ? updates.badges : JSON.stringify(updates.badges) }),
      })
      .where(eq(studentProfiles.id, id))
      .returning();
    return profile;
  }

  // Subjects
  async getAllSubjects(): Promise<Subject[]> {
    return await db.select().from(subjects);
  }

  async getSubject(id: number): Promise<Subject | undefined> {
    const [subject] = await db.select().from(subjects).where(eq(subjects.id, id));
    return subject;
  }

  // Student progress
  async getStudentProgress(studentId: number): Promise<StudentProgress[]> {
    return await db.select().from(studentProgress).where(eq(studentProgress.studentId, studentId));
  }

  async getStudentProgressBySubject(studentId: number, subjectId: number): Promise<StudentProgress | undefined> {
    const [progress] = await db
      .select()
      .from(studentProgress)
      .where(and(eq(studentProgress.studentId, studentId), eq(studentProgress.subjectId, subjectId)));
    return progress;
  }

  async upsertStudentProgress(insertProgress: InsertStudentProgress): Promise<StudentProgress> {
    const existing = await this.getStudentProgressBySubject(insertProgress.studentId, insertProgress.subjectId);
    
    if (existing) {
      const [progress] = await db
        .update(studentProgress)
        .set({
          ...insertProgress,
          lastAccessed: new Date(),
        })
        .where(eq(studentProgress.id, existing.id))
        .returning();
      return progress;
    } else {
      const [progress] = await db
        .insert(studentProgress)
        .values(insertProgress)
        .returning();
      return progress;
    }
  }

  // Survey responses
  async createSurveyResponse(insertResponse: InsertSurveyResponse): Promise<SurveyResponse> {
    const [response] = await db
      .insert(surveyResponses)
      .values({
        ...insertResponse,
        responses: typeof insertResponse.responses === 'string' ? insertResponse.responses : JSON.stringify(insertResponse.responses),
        analyzedData: insertResponse.analyzedData ? (typeof insertResponse.analyzedData === 'string' ? insertResponse.analyzedData : JSON.stringify(insertResponse.analyzedData)) : undefined,
      })
      .returning();
    return response;
  }

  async getLatestSurveyResponse(studentId: number): Promise<SurveyResponse | undefined> {
    const [response] = await db
      .select()
      .from(surveyResponses)
      .where(eq(surveyResponses.studentId, studentId))
      .orderBy(desc(surveyResponses.createdAt))
      .limit(1);
    return response;
  }

  // Rewards
  async getAllRewards(): Promise<Reward[]> {
    return await db.select().from(rewards);
  }

  async addStudentReward(insertReward: InsertStudentReward): Promise<StudentReward> {
    const [reward] = await db
      .insert(studentRewards)
      .values(insertReward)
      .returning();
    return reward;
  }

  async getStudentRewards(studentId: number): Promise<StudentReward[]> {
    return await db.select().from(studentRewards).where(eq(studentRewards.studentId, studentId));
  }

  // Spins and XP
  async updateStudentXP(studentId: number, xpToAdd: number): Promise<void> {
    const profile = await this.getStudentProfileById(studentId);
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
    const profile = await this.getStudentProfileById(studentId);
    if (profile) {
      await this.updateStudentProfile(profile.id, {
        availableSpins: spins
      });
    }
  }
}