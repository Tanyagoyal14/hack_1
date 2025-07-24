import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  displayName: text("display_name").notNull(),
  role: text("role").notNull().default("student"), // student, teacher, parent
  createdAt: timestamp("created_at").defaultNow(),
});

export const studentProfiles = pgTable("student_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  currentMood: text("current_mood"), // happy, calm, excited, tired, frustrated
  learningStyle: text("learning_style"), // visual, auditory, kinesthetic
  interests: jsonb("interests").default([]), // array of interests
  accessibilityNeeds: jsonb("accessibility_needs").default({}), // TTS, font size, etc.
  level: integer("level").default(1),
  totalXP: integer("total_xp").default(0),
  availableSpins: integer("available_spins").default(3),
  streak: integer("streak").default(0),
  badges: jsonb("badges").default([]),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const subjects = pgTable("subjects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // Math, Reading, Science, Social Studies
  magicalName: text("magical_name").notNull(), // Potions, Spells, Nature Magic, World Adventures
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  description: text("description").notNull(),
});

export const studentProgress = pgTable("student_progress", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => studentProfiles.id).notNull(),
  subjectId: integer("subject_id").references(() => subjects.id).notNull(),
  progress: integer("progress").default(0), // percentage 0-100
  completedTasks: integer("completed_tasks").default(0),
  totalTasks: integer("total_tasks").default(0),
  lastAccessed: timestamp("last_accessed").defaultNow(),
});

export const surveyResponses = pgTable("survey_responses", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => studentProfiles.id).notNull(),
  responses: jsonb("responses").notNull(), // store all survey answers
  analyzedData: jsonb("analyzed_data"), // AI analysis results
  createdAt: timestamp("created_at").defaultNow(),
});

export const rewards = pgTable("rewards", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // xp, badge, mini_game, unlock
  value: integer("value"), // XP amount if applicable
  icon: text("icon").notNull(),
  description: text("description"),
});

export const studentRewards = pgTable("student_rewards", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => studentProfiles.id).notNull(),
  rewardId: integer("reward_id").references(() => rewards.id).notNull(),
  earnedAt: timestamp("earned_at").defaultNow(),
});

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertStudentProfileSchema = createInsertSchema(studentProfiles).omit({
  id: true,
  updatedAt: true,
});

export const insertSurveyResponseSchema = createInsertSchema(surveyResponses).omit({
  id: true,
  createdAt: true,
});

export const insertStudentProgressSchema = createInsertSchema(studentProgress).omit({
  id: true,
  lastAccessed: true,
});

export const insertStudentRewardSchema = createInsertSchema(studentRewards).omit({
  id: true,
  earnedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type StudentProfile = typeof studentProfiles.$inferSelect;
export type InsertStudentProfile = z.infer<typeof insertStudentProfileSchema>;

export type Subject = typeof subjects.$inferSelect;
export type StudentProgress = typeof studentProgress.$inferSelect;
export type InsertStudentProgress = z.infer<typeof insertStudentProgressSchema>;

export type SurveyResponse = typeof surveyResponses.$inferSelect;
export type InsertSurveyResponse = z.infer<typeof insertSurveyResponseSchema>;

export type Reward = typeof rewards.$inferSelect;
export type StudentReward = typeof studentRewards.$inferSelect;
export type InsertStudentReward = z.infer<typeof insertStudentRewardSchema>;
