import fs from 'fs';
import path from 'path';

export interface ActivityLog {
  timestamp: string;
  user: string;
  action: string;
  details?: any;
}

const LOG_FILE_PATH = path.join(process.cwd(), 'activity-logs.json');

// Initialize log file if it doesn't exist
function initializeLogFile() {
  if (!fs.existsSync(LOG_FILE_PATH)) {
    fs.writeFileSync(LOG_FILE_PATH, JSON.stringify([], null, 2));
  }
}

// Read all logs
export async function readActivityLogs(): Promise<ActivityLog[]> {
  initializeLogFile();
  const data = fs.readFileSync(LOG_FILE_PATH, 'utf-8');
  return JSON.parse(data);
}

// Add a new log entry
export async function logActivity(user: string, action: string, details?: any): Promise<void> {
  try {
    initializeLogFile();
    
    const logs = await readActivityLogs();
    const newLog: ActivityLog = {
      timestamp: new Date().toISOString(),
      user,
      action,
      details
    };
    
    logs.push(newLog);
    fs.writeFileSync(LOG_FILE_PATH, JSON.stringify(logs, null, 2));
  } catch (error) {
    console.error('Error logging activity:', error);
  }
}

// Read recent logs (with optional limit)
export async function getRecentLogs(limit: number = 100): Promise<ActivityLog[]> {
  const logs = await readActivityLogs();
  return logs
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}

// Get logs for a specific user
export async function getUserLogs(username: string, limit: number = 100): Promise<ActivityLog[]> {
  const logs = await readActivityLogs();
  return logs
    .filter(log => log.user.toLowerCase() === username.toLowerCase())
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
} 