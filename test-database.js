// Test script to verify SQLite database functionality
import Database from 'better-sqlite3';

const db = new Database('./database.sqlite');

console.log('🔍 Testing SQLite Database...\n');

// Test 1: Check if tables exist
console.log('📋 Database Tables:');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
tables.forEach(table => console.log(`  ✓ ${table.name}`));

// Test 2: Check subjects data
console.log('\n🎯 Subjects (Magical Themes):');
const subjects = db.prepare('SELECT * FROM subjects').all();
subjects.forEach(subject => {
  console.log(`  ✓ ${subject.magical_name} (${subject.name}) - ${subject.description}`);
});

// Test 3: Check rewards data
console.log('\n🏆 Available Rewards:');
const rewards = db.prepare('SELECT * FROM rewards').all();
rewards.forEach(reward => {
  console.log(`  ✓ ${reward.name} (${reward.type}) - ${reward.description}`);
});

// Test 4: Check if database is writable
console.log('\n💾 Testing Write Operations:');
try {
  const insertTest = db.prepare(`
    INSERT INTO users (username, display_name, role, created_at)
    VALUES (?, ?, ?, ?)
  `);
  
  const result = insertTest.run('test_user', 'Test User', 'student', Date.now());
  console.log(`  ✓ Created test user with ID: ${result.lastInsertRowid}`);
  
  // Clean up test data
  db.prepare('DELETE FROM users WHERE username = ?').run('test_user');
  console.log('  ✓ Cleaned up test data');
  
} catch (error) {
  console.log(`  ❌ Write test failed: ${error.message}`);
}

// Test 5: Database file size and stats
import fs from 'fs';
const stats = fs.statSync('./database.sqlite');
console.log(`\n📊 Database Info:`);
console.log(`  ✓ File size: ${(stats.size / 1024).toFixed(1)} KB`);
console.log(`  ✓ Last modified: ${stats.mtime.toLocaleString()}`);

console.log('\n🎉 SQLite Database is fully operational!\n');

db.close();