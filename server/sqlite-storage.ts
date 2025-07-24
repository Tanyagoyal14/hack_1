import Database from 'better-sqlite3';
import { 
  users, 
  studentProfiles, 
  subjects, 
  studentProgress, 
  surveyResponses,
  rewards,
  studentRewards,
  type User, 
  type InsertUser,
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
import { IStorage } from "./storage";

export class SQLiteStorage implements IStorage {
  private db: Database.Database;

  constructor(dbPath: string = './database.sqlite') {
    this.db = new Database(dbPath);
    this.initializeDatabase();
    this.seedDefaultData();
  }

  private initializeDatabase() {
    // Create tables
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        display_name TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'student',
        created_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS student_profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL REFERENCES users(id),
        current_mood TEXT,
        learning_style TEXT,
        interests TEXT NOT NULL DEFAULT '[]',
        accessibility_needs TEXT NOT NULL DEFAULT '{}',
        level INTEGER DEFAULT 1,
        total_xp INTEGER DEFAULT 0,
        available_spins INTEGER DEFAULT 3,
        streak INTEGER DEFAULT 0,
        badges TEXT NOT NULL DEFAULT '[]',
        updated_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS subjects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        magical_name TEXT NOT NULL,
        icon TEXT NOT NULL,
        color TEXT NOT NULL,
        description TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS student_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL REFERENCES student_profiles(id),
        subject_id INTEGER NOT NULL REFERENCES subjects(id),
        progress INTEGER DEFAULT 0,
        completed_tasks INTEGER DEFAULT 0,
        total_tasks INTEGER DEFAULT 0,
        last_accessed INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS survey_responses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL REFERENCES student_profiles(id),
        responses TEXT NOT NULL,
        analyzed_data TEXT,
        created_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS rewards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        value INTEGER,
        icon TEXT NOT NULL,
        description TEXT
      );

      CREATE TABLE IF NOT EXISTS student_rewards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL REFERENCES student_profiles(id),
        reward_id INTEGER NOT NULL REFERENCES rewards(id),
        earned_at INTEGER NOT NULL
      );
    `);
  }

  private seedDefaultData() {
    // Check if subjects already exist
    const existingSubjects = this.db.prepare('SELECT COUNT(*) as count FROM subjects').get() as { count: number };
    
    if (existingSubjects.count === 0) {
      // Insert default subjects
      const insertSubject = this.db.prepare(`
        INSERT INTO subjects (name, magical_name, icon, color, description)
        VALUES (?, ?, ?, ?, ?)
      `);

      const defaultSubjects = [
        ['Math', 'Potions', 'fas fa-flask', 'purple', 'Master magical formulas and number spells!'],
        ['Reading', 'Spells', 'fas fa-book-open', 'blue', 'Unlock the power of words and stories!'],
        ['Science', 'Nature Magic', 'fas fa-seedling', 'green', 'Discover the secrets of the natural world!'],
        ['Social Studies', 'World Adventures', 'fas fa-globe', 'yellow', 'Explore cultures and history around the world!']
      ];

      defaultSubjects.forEach(subject => {
        insertSubject.run(...subject);
      });
    }

    // Check if rewards already exist
    const existingRewards = this.db.prepare('SELECT COUNT(*) as count FROM rewards').get() as { count: number };
    
    if (existingRewards.count === 0) {
      // Insert default rewards
      const insertReward = this.db.prepare(`
        INSERT INTO rewards (name, type, value, icon, description)
        VALUES (?, ?, ?, ?, ?)
      `);

      const defaultRewards = [
        ['50 XP', 'xp', 50, 'fas fa-star', 'Experience points'],
        ['100 XP', 'xp', 100, 'fas fa-star', 'Experience points'],
        ['Math Master Badge', 'badge', null, 'fas fa-flask', 'Potion brewing expert'],
        ['Reading Champion Badge', 'badge', null, 'fas fa-book', 'Spell casting master'],
        ['Mini Game Unlock', 'mini_game', null, 'fas fa-gamepad', 'Unlock a new mini game'],
        ['Avatar Unlock', 'unlock', null, 'fas fa-user-circle', 'New avatar option']
      ];

      defaultRewards.forEach(reward => {
        insertReward.run(...reward);
      });
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    const stmt = this.db.prepare('SELECT * FROM users WHERE id = ?');
    const result = stmt.get(id) as any;
    if (!result) return undefined;
    
    return {
      ...result,
      displayName: result.display_name,
      createdAt: new Date(result.created_at)
    };
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const stmt = this.db.prepare('SELECT * FROM users WHERE username = ?');
    const result = stmt.get(username) as any;
    if (!result) return undefined;
    
    return {
      ...result,
      displayName: result.display_name,
      createdAt: new Date(result.created_at)
    };
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const stmt = this.db.prepare(`
      INSERT INTO users (username, display_name, role, created_at)
      VALUES (?, ?, ?, ?)
      RETURNING *
    `);
    
    const now = Date.now();
    const result = stmt.get(
      insertUser.username,
      insertUser.displayName,
      insertUser.role || 'student',
      now
    ) as any;
    
    return {
      ...result,
      displayName: result.display_name,
      createdAt: new Date(result.created_at)
    };
  }

  async getStudentProfile(userId: number): Promise<StudentProfile | undefined> {
    const stmt = this.db.prepare('SELECT * FROM student_profiles WHERE user_id = ?');
    const result = stmt.get(userId) as any;
    if (!result) return undefined;
    
    return {
      ...result,
      userId: result.user_id,
      currentMood: result.current_mood,
      learningStyle: result.learning_style,
      interests: JSON.parse(result.interests),
      accessibilityNeeds: JSON.parse(result.accessibility_needs),
      totalXP: result.total_xp,
      availableSpins: result.available_spins,
      badges: JSON.parse(result.badges),
      updatedAt: new Date(result.updated_at)
    };
  }

  async getStudentProfileById(id: number): Promise<StudentProfile | undefined> {
    const stmt = this.db.prepare('SELECT * FROM student_profiles WHERE id = ?');
    const result = stmt.get(id) as any;
    if (!result) return undefined;
    
    return {
      ...result,
      userId: result.user_id,
      currentMood: result.current_mood,
      learningStyle: result.learning_style,
      interests: JSON.parse(result.interests),
      accessibilityNeeds: JSON.parse(result.accessibility_needs),
      totalXP: result.total_xp,
      availableSpins: result.available_spins,
      badges: JSON.parse(result.badges),
      updatedAt: new Date(result.updated_at)
    };
  }

  async createStudentProfile(insertProfile: InsertStudentProfile): Promise<StudentProfile> {
    const stmt = this.db.prepare(`
      INSERT INTO student_profiles (
        user_id, current_mood, learning_style, interests, accessibility_needs,
        level, total_xp, available_spins, streak, badges, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING *
    `);
    
    const now = Date.now();
    const result = stmt.get(
      insertProfile.userId,
      insertProfile.currentMood,
      insertProfile.learningStyle,
      JSON.stringify(insertProfile.interests || []),
      JSON.stringify(insertProfile.accessibilityNeeds || {}),
      insertProfile.level || 1,
      insertProfile.totalXP || 0,
      insertProfile.availableSpins || 5,
      insertProfile.streak || 0,
      JSON.stringify(insertProfile.badges || []),
      now
    ) as any;
    
    return {
      ...result,
      userId: result.user_id,
      currentMood: result.current_mood,
      learningStyle: result.learning_style,
      interests: JSON.parse(result.interests),
      accessibilityNeeds: JSON.parse(result.accessibility_needs),
      totalXP: result.total_xp,
      availableSpins: result.available_spins,
      badges: JSON.parse(result.badges),
      updatedAt: new Date(result.updated_at)
    };
  }

  async updateStudentProfile(id: number, updates: Partial<StudentProfile>): Promise<StudentProfile | undefined> {
    const existing = this.db.prepare('SELECT * FROM student_profiles WHERE id = ?').get(id) as any;
    if (!existing) return undefined;

    const setClause = [];
    const values = [];

    if (updates.currentMood !== undefined) {
      setClause.push('current_mood = ?');
      values.push(updates.currentMood);
    }
    if (updates.learningStyle !== undefined) {
      setClause.push('learning_style = ?');
      values.push(updates.learningStyle);
    }
    if (updates.interests !== undefined) {
      setClause.push('interests = ?');
      values.push(JSON.stringify(updates.interests));
    }
    if (updates.accessibilityNeeds !== undefined) {
      setClause.push('accessibility_needs = ?');
      values.push(JSON.stringify(updates.accessibilityNeeds));
    }
    if (updates.level !== undefined) {
      setClause.push('level = ?');
      values.push(updates.level);
    }
    if (updates.totalXP !== undefined) {
      setClause.push('total_xp = ?');
      values.push(updates.totalXP);
    }
    if (updates.availableSpins !== undefined) {
      setClause.push('available_spins = ?');
      values.push(updates.availableSpins);
    }
    if (updates.streak !== undefined) {
      setClause.push('streak = ?');
      values.push(updates.streak);
    }
    if (updates.badges !== undefined) {
      setClause.push('badges = ?');
      values.push(JSON.stringify(updates.badges));
    }

    setClause.push('updated_at = ?');
    values.push(Date.now());
    values.push(id);

    const stmt = this.db.prepare(`
      UPDATE student_profiles 
      SET ${setClause.join(', ')}
      WHERE id = ?
      RETURNING *
    `);
    
    const result = stmt.get(...values) as any;
    
    return {
      ...result,
      userId: result.user_id,
      currentMood: result.current_mood,
      learningStyle: result.learning_style,
      interests: JSON.parse(result.interests),
      accessibilityNeeds: JSON.parse(result.accessibility_needs),
      totalXP: result.total_xp,
      availableSpins: result.available_spins,
      badges: JSON.parse(result.badges),
      updatedAt: new Date(result.updated_at)
    };
  }

  async getAllSubjects(): Promise<Subject[]> {
    const stmt = this.db.prepare('SELECT * FROM subjects');
    const results = stmt.all() as any[];
    
    return results.map(result => ({
      ...result,
      magicalName: result.magical_name
    }));
  }

  async getSubject(id: number): Promise<Subject | undefined> {
    const stmt = this.db.prepare('SELECT * FROM subjects WHERE id = ?');
    const result = stmt.get(id) as any;
    if (!result) return undefined;
    
    return {
      ...result,
      magicalName: result.magical_name
    };
  }

  async getStudentProgress(studentId: number): Promise<StudentProgress[]> {
    const stmt = this.db.prepare('SELECT * FROM student_progress WHERE student_id = ?');
    const results = stmt.all(studentId) as any[];
    
    return results.map(result => ({
      ...result,
      studentId: result.student_id,
      subjectId: result.subject_id,
      completedTasks: result.completed_tasks,
      totalTasks: result.total_tasks,
      lastAccessed: new Date(result.last_accessed)
    }));
  }

  async getStudentProgressBySubject(studentId: number, subjectId: number): Promise<StudentProgress | undefined> {
    const stmt = this.db.prepare('SELECT * FROM student_progress WHERE student_id = ? AND subject_id = ?');
    const result = stmt.get(studentId, subjectId) as any;
    if (!result) return undefined;
    
    return {
      ...result,
      studentId: result.student_id,
      subjectId: result.subject_id,
      completedTasks: result.completed_tasks,
      totalTasks: result.total_tasks,
      lastAccessed: new Date(result.last_accessed)
    };
  }

  async upsertStudentProgress(insertProgress: InsertStudentProgress): Promise<StudentProgress> {
    const existing = await this.getStudentProgressBySubject(insertProgress.studentId, insertProgress.subjectId);
    
    if (existing) {
      const stmt = this.db.prepare(`
        UPDATE student_progress 
        SET progress = ?, completed_tasks = ?, total_tasks = ?, last_accessed = ?
        WHERE student_id = ? AND subject_id = ?
        RETURNING *
      `);
      
      const result = stmt.get(
        insertProgress.progress || existing.progress,
        insertProgress.completedTasks || existing.completedTasks,
        insertProgress.totalTasks || existing.totalTasks,
        Date.now(),
        insertProgress.studentId,
        insertProgress.subjectId
      ) as any;
      
      return {
        ...result,
        studentId: result.student_id,
        subjectId: result.subject_id,
        completedTasks: result.completed_tasks,
        totalTasks: result.total_tasks,
        lastAccessed: new Date(result.last_accessed)
      };
    } else {
      const stmt = this.db.prepare(`
        INSERT INTO student_progress (student_id, subject_id, progress, completed_tasks, total_tasks, last_accessed)
        VALUES (?, ?, ?, ?, ?, ?)
        RETURNING *
      `);
      
      const result = stmt.get(
        insertProgress.studentId,
        insertProgress.subjectId,
        insertProgress.progress || 0,
        insertProgress.completedTasks || 0,
        insertProgress.totalTasks || 0,
        Date.now()
      ) as any;
      
      return {
        ...result,
        studentId: result.student_id,
        subjectId: result.subject_id,
        completedTasks: result.completed_tasks,
        totalTasks: result.total_tasks,
        lastAccessed: new Date(result.last_accessed)
      };
    }
  }

  async createSurveyResponse(insertResponse: InsertSurveyResponse): Promise<SurveyResponse> {
    const stmt = this.db.prepare(`
      INSERT INTO survey_responses (student_id, responses, analyzed_data, created_at)
      VALUES (?, ?, ?, ?)
      RETURNING *
    `);
    
    const result = stmt.get(
      insertResponse.studentId,
      JSON.stringify(insertResponse.responses),
      JSON.stringify(insertResponse.analyzedData),
      Date.now()
    ) as any;
    
    return {
      ...result,
      studentId: result.student_id,
      responses: JSON.parse(result.responses),
      analyzedData: JSON.parse(result.analyzed_data || 'null'),
      createdAt: new Date(result.created_at)
    };
  }

  async getLatestSurveyResponse(studentId: number): Promise<SurveyResponse | undefined> {
    const stmt = this.db.prepare(`
      SELECT * FROM survey_responses 
      WHERE student_id = ? 
      ORDER BY created_at DESC 
      LIMIT 1
    `);
    const result = stmt.get(studentId) as any;
    if (!result) return undefined;
    
    return {
      ...result,
      studentId: result.student_id,
      responses: JSON.parse(result.responses),
      analyzedData: JSON.parse(result.analyzed_data || 'null'),
      createdAt: new Date(result.created_at)
    };
  }

  async getAllRewards(): Promise<Reward[]> {
    const stmt = this.db.prepare('SELECT * FROM rewards');
    return stmt.all() as Reward[];
  }

  async addStudentReward(insertReward: InsertStudentReward): Promise<StudentReward> {
    const stmt = this.db.prepare(`
      INSERT INTO student_rewards (student_id, reward_id, earned_at)
      VALUES (?, ?, ?)
      RETURNING *
    `);
    
    const result = stmt.get(
      insertReward.studentId,
      insertReward.rewardId,
      Date.now()
    ) as any;
    
    return {
      ...result,
      studentId: result.student_id,
      rewardId: result.reward_id,
      earnedAt: new Date(result.earned_at)
    };
  }

  async getStudentRewards(studentId: number): Promise<StudentReward[]> {
    const stmt = this.db.prepare('SELECT * FROM student_rewards WHERE student_id = ?');
    const results = stmt.all(studentId) as any[];
    
    return results.map(result => ({
      ...result,
      studentId: result.student_id,
      rewardId: result.reward_id,
      earnedAt: new Date(result.earned_at)
    }));
  }

  async updateStudentXP(studentId: number, xpToAdd: number): Promise<void> {
    const profile = this.db.prepare('SELECT * FROM student_profiles WHERE id = ?').get(studentId) as any;
    if (profile) {
      const newXP = (profile.total_xp || 0) + xpToAdd;
      const newLevel = Math.floor(newXP / 100) + 1;
      
      const stmt = this.db.prepare(`
        UPDATE student_profiles 
        SET total_xp = ?, level = ?, updated_at = ?
        WHERE id = ?
      `);
      
      stmt.run(newXP, newLevel, Date.now(), studentId);
    }
  }

  async updateAvailableSpins(studentId: number, spins: number): Promise<void> {
    const stmt = this.db.prepare(`
      UPDATE student_profiles 
      SET available_spins = ?, updated_at = ?
      WHERE id = ?
    `);
    
    stmt.run(spins, Date.now(), studentId);
  }
}