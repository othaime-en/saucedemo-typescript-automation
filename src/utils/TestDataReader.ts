import { readFile } from 'fs/promises';
import { parse } from 'csv-parse/sync';
import path from 'path';

import type { 
  UserCredentials,   
} from '../types/index.js';

/**
 * Test Data Reader utility
 * Handles reading and parsing test data from CSV and JSON files
 */
class TestDataReader {
  private testDataDir: string;

  constructor() {
    this.testDataDir = path.join(process.cwd(), 'test-data');
  }

  /**
   * Read and parse a CSV file
   * @param filename - Name of CSV file
   * @returns Parsed CSV data as array of objects
   */
  public async readCsvFile<T>(filename: string): Promise<T[]> {
    try {
      const filePath = path.join(this.testDataDir, filename);
      const fileContent = await readFile(filePath, 'utf-8');
      
      const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        cast: true,
        cast_date: false
      }) as T[];

      return records;
    } catch (error) {
      throw new Error(`Failed to read CSV file ${filename}: ${(error as Error).message}`);
    }
  }

  // Read and parse a JSON file
  public async readJsonFile<T>(filename: string): Promise<T> {
    try {
      const filePath = path.join(this.testDataDir, filename);
      const fileContent = await readFile(filePath, 'utf-8');
      return JSON.parse(fileContent) as T;
    } catch (error) {
      throw new Error(`Failed to read JSON file ${filename}: ${(error as Error).message}`);
    }
  }

  // Get user test data from a CSV file
  public async getUserTestData(): Promise<UserCredentials[]> {
    const users = await this.readCsvFile<UserCredentials>('users.csv');
    return users.map(user => ({
      ...user,
      expectedResult: user.expectedResult as 'success' | 'failure'
    }));
  }

  // Get specific user by username
  public async getUserByUsername(username: string): Promise<UserCredentials | undefined> {
    const allUsers = await this.getUserTestData();
    return allUsers.find(user => user.username === username);
  }

  // Get standard user credentials (most commonly used)
  public async getStandardUser(): Promise<UserCredentials> {
    const user = await this.getUserByUsername('standard_user');
    if (!user) {
      throw new Error('Standard user not found in test data');
    }
    return user;
  }
}

export default new TestDataReader();