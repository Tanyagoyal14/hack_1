import {
  sqliteTable,
  text,
  integer,
  index,
} from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = sqliteTable(
  "sessions",
  {
    sid: text("sid").primaryKey(),
    sess: text("sess").notNull(),
    expire: integer("expire", { mode: 'timestamp' }).notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = sqliteTable("users", {
  id: text("id").primaryKey().notNull(),
  email: text("email").unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  profileImageUrl: text("profile_image_url"),
  role: text("role").notNull().default("student"), // student, teacher, parent
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const studentProfiles = sqliteTable("student_profiles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").references(() => users.id).notNull(),
  currentMood: text("current_mood"), // happy, calm, excited, tired, frustrated
  learningStyle: text("learning_style"), // visual, auditory, kinesthetic
  interests: text("interests").notNull().default('[]'), // JSON string array of interests
  accessibilityNeeds: text("accessibility_needs").notNull().default('{}'), // JSON string for TTS, font size, etc.
  level: integer("level").default(1),
  totalXP: integer("total_xp").default(0),
  availableSpins: integer("available_spins").default(3),
  streak: integer("streak").default(0),
  badges: text("badges").notNull().default('[]'), // JSON string array
  updatedAt: integer("updated_at", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const subjects = sqliteTable("subjects", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(), // Math, Reading, Science, Social Studies
  magicalName: text("magical_name").notNull(), // Potions, Spells, Nature Magic, World Adventures
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  description: text("description").notNull(),
});

export const studentProgress = sqliteTable("student_progress", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  studentId: integer("student_id").references(() => studentProfiles.id).notNull(),
  subjectId: integer("subject_id").references(() => subjects.id).notNull(),
  progress: integer("progress").default(0), // percentage 0-100
  completedTasks: integer("completed_tasks").default(0),
  totalTasks: integer("total_tasks").default(0),
  lastAccessed: integer("last_accessed", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const surveyResponses = sqliteTable("survey_responses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  studentId: integer("student_id").references(() => studentProfiles.id).notNull(),
  responses: text("responses").notNull(), // JSON string for all survey answers
  analyzedData: text("analyzed_data"), // JSON string for AI analysis results
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const rewards = sqliteTable("rewards", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  type: text("type").notNull(), // xp, badge, mini_game, unlock
  value: integer("value"), // XP amount if applicable
  icon: text("icon").notNull(),
  description: text("description"),
});

export const studentRewards = sqliteTable("student_rewards", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  studentId: integer("student_id").references(() => studentProfiles.id).notNull(),
  rewardId: integer("reward_id").references(() => rewards.id).notNull(),
  earnedAt: integer("earned_at", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
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
