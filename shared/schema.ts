import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  integer,
  serial,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").notNull().default("student"), // student, teacher, parent
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const studentProfiles = pgTable("student_profiles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  currentMood: varchar("current_mood"), // happy, calm, excited, tired, frustrated
  learningStyle: varchar("learning_style"), // visual, auditory, kinesthetic
  interests: jsonb("interests").notNull().default('[]'), // array of interests
  accessibilityNeeds: jsonb("accessibility_needs").notNull().default('{}'), // TTS, font size, etc.
  level: integer("level").default(1),
  totalXP: integer("total_xp").default(0),
  availableSpins: integer("available_spins").default(3),
  streak: integer("streak").default(0),
  badges: jsonb("badges").notNull().default('[]'),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const subjects = pgTable("subjects", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(), // Math, Reading, Science, Social Studies
  magicalName: varchar("magical_name").notNull(), // Potions, Spells, Nature Magic, World Adventures
  icon: varchar("icon").notNull(),
  color: varchar("color").notNull(),
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
  name: varchar("name").notNull(),
  type: varchar("type").notNull(), // xp, badge, mini_game, unlock
  value: integer("value"), // XP amount if applicable
  icon: varchar("icon").notNull(),
  description: text("description"),
});

export const studentRewards = pgTable("student_rewards", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => studentProfiles.id).notNull(),
  rewardId: integer("reward_id").references(() => rewards.id).notNull(),
  earnedAt: timestamp("earned_at").defaultNow(),
});

// Insert Schemas
export const upsertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
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
export type UpsertUser = z.infer<typeof upsertUserSchema>;

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
