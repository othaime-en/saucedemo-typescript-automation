import { existsSync, readdirSync } from 'fs';
import { join } from 'path';

import ReportGenerator from '../src/utils/ReportGenerator.js';
import type { TestResult } from '../src/types/index.js';

const testResults: TestResult[] = [];
let startTime: number = 0;

export const mochaHooks = {
  beforeAll(): void {
    startTime = Date.now();
    console.log('\nTest execution started...\n');
  },

  afterEach(this: Mocha.Context): void {
    const currentTest = this.currentTest;
    
    if (!currentTest) return;

    const result: TestResult = {
      suiteName: currentTest.parent?.title || 'Unknown Suite',
      testName: currentTest.title,
      status: currentTest.state === 'passed' ? 'passed' : 
              currentTest.state === 'failed' ? 'failed' : 'skipped',
      duration: currentTest.duration || 0,
      error: currentTest.state === 'failed' && currentTest.err ? 
             currentTest.err.message : undefined,
      screenshot: currentTest.state === 'failed' ? 
                  findScreenshotForTest(currentTest.title) : undefined
    };

    testResults.push(result);
  },

  async afterAll(): Promise<void> {
    const duration = Date.now() - startTime;
    
    console.log('\n' + '='.repeat(80));
    console.log('Generating HTML Report...');
    
    try {
      const reportData = ReportGenerator.prepareReportData(testResults, duration);
      const reportPath = await ReportGenerator.generateHtmlReport(reportData);
      
      console.log(`HTML Report generated: ${reportPath}`);
      printSummary(reportData);
    } catch (error) {
      console.error('Failed to generate report:', (error as Error).message);
    }
    
    console.log('='.repeat(80) + '\n');
  }
};

function findScreenshotForTest(testName: string): string | undefined {
  try {
    const screenshotDir = './reports/screenshots';
    
    if (!existsSync(screenshotDir)) {
      return undefined;
    }

    const files = readdirSync(screenshotDir);
    const sanitizedTestName = testName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    
    const screenshotFile = files.find((file: string) => 
      file.includes(sanitizedTestName) && file.includes('failure')
    );
    
    return screenshotFile ? join(screenshotDir, screenshotFile) : undefined;
  } catch {
    return undefined;
  }
}

function printSummary(reportData: any): void {
  const passRate = ((reportData.passed / reportData.totalTests) * 100).toFixed(2);
  
  console.log('\nTest Summary:');
  console.log('-------------');
  console.log(`Total Tests: ${reportData.totalTests}`);
  console.log(`Passed: ${reportData.passed}`);
  console.log(`Failed: ${reportData.failed}`);
  console.log(`Skipped: ${reportData.skipped}`);
  console.log(`Pass Rate: ${passRate}%`);
  console.log(`Duration: ${(reportData.duration / 1000).toFixed(2)}s`);
}