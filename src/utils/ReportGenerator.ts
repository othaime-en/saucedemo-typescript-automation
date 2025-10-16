import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { platform } from 'os';

import type { ReportData, TestResult } from '../types/index.js';

/**
 * Report Generator utility
 * Creates comprehensive HTML test reports with statistics and screenshots
 */
class ReportGenerator {
  private reportDir: string;

  constructor() {
    this.reportDir = path.join(process.cwd(), 'reports');
    this.ensureDirectoryExists();
  }

  private ensureDirectoryExists(): void {
    if (!existsSync(this.reportDir)) {
      mkdir(this.reportDir, { recursive: true }).catch(err => {
        console.error('Failed to create report directory:', err);
      });
    }
  }

  /**
   * Prepare report data with environment information
   * @param testResults - Array of test results
   * @param duration - Total test duration in milliseconds
   * @returns Formatted report data
   */
  public prepareReportData(testResults: TestResult[], duration: number): ReportData {
    const passed = testResults.filter(t => t.status === 'passed').length;
    const failed = testResults.filter(t => t.status === 'failed').length;
    const skipped = testResults.filter(t => t.status === 'skipped').length;

    return {
      timestamp: new Date().toISOString(),
      totalTests: testResults.length,
      passed,
      failed,
      skipped,
      duration,
      testResults,
      environment: {
        browser: process.env.BROWSER || 'chrome',
        platform: platform(),
        nodeVersion: process.version
      }
    };
  }

  /**
   * Generate HTML report from test results
   * @param reportData - Formatted report data
   * @param reportName - Name for the report file
   */
  public async generateHtmlReport(
    reportData: ReportData,
    reportName: string = 'test-report'
  ): Promise<string> {
    try {
      await this.ensureDirectoryExists();

      const html = this.buildHtmlReport(reportData);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${reportName}_${timestamp}.html`;
      const filePath = path.join(this.reportDir, filename);

      await writeFile(filePath, html, 'utf8');

      return filePath;
    } catch (error) {
      throw new Error(`Failed to generate HTML report: ${(error as Error).message}`);
    }
  }

  /**
   * Build HTML report content
   * @param data - Report data
   * @returns HTML string
   */
  private buildHtmlReport(data: ReportData): string {
    const passRate = ((data.passed / data.totalTests) * 100).toFixed(2);
    const durationSeconds = (data.duration / 1000).toFixed(2);

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Automation Report - ${new Date(data.timestamp).toLocaleDateString()}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #ea8366ff 0%, #1561dbff 100%);
            padding: 20px; color: #333;
        }
        .container { 
            max-width: 1400px; margin: 0 auto;
            background: white; border-radius: 10px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3); overflow: hidden;
        }
        .header { 
            background: linear-gradient(135deg, #eaa866ff 0%, #a24b7bff 100%);
            color: white; padding: 40px; text-align: center;
        }
        .header h1 { font-size: 2.5em; margin-bottom: 10px; }
        .header .timestamp { font-size: 1.1em; opacity: 0.9; }
        .summary { 
            display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px; padding: 40px; background: #f8f9fa;
        }
        .summary-card { 
            background: white; padding: 25px; border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1); text-align: center;
            transition: transform 0.2s;
        }
        .summary-card:hover { 
            transform: translateY(-5px); 
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .summary-card .label { 
            font-size: 0.9em; color: #666; text-transform: uppercase;
            letter-spacing: 1px; margin-bottom: 10px;
        }
        .summary-card .value { font-size: 2.5em; font-weight: bold; margin-bottom: 5px; }
        .summary-card.total .value { color: #667eea; }
        .summary-card.passed .value { color: #10b981; }
        .summary-card.failed .value { color: #ef4444; }
        .summary-card.duration .value { font-size: 2em; }
        .progress-bar { 
            width: 100%; height: 30px; background: #e5e7eb;
            border-radius: 15px; overflow: hidden; margin: 20px 0;
        }
        .progress-fill { 
            height: 100%; background: linear-gradient(90deg, #10b981 0%, #059669 100%);
            transition: width 0.3s ease; display: flex; align-items: center;
            justify-content: center; color: white; font-weight: bold;
        }
        .environment { 
            padding: 30px 40px; background: white; border-top: 1px solid #e5e7eb;
        }
        .environment h2 { margin-bottom: 15px; color: #199374ff; }
        .environment-info { display: flex; gap: 30px; flex-wrap: wrap; }
        .environment-item { display: flex; align-items: center; gap: 10px; }
        .environment-item strong { color: #666; }
        .footer { 
            text-align: center; padding: 20px; background: #f8f9fa;
            color: #666; border-top: 1px solid #e5e7eb;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Test Automation Report</h1>
            <div class="timestamp">${new Date(data.timestamp).toLocaleString()}</div>
        </div>

        <div class="summary">
            <div class="summary-card total">
                <div class="label">Total Tests</div>
                <div class="value">${data.totalTests}</div>
            </div>
            <div class="summary-card passed">
                <div class="label">Passed</div>
                <div class="value">${data.passed}</div>
            </div>
            <div class="summary-card failed">
                <div class="label">Failed</div>
                <div class="value">${data.failed}</div>
            </div>
            <div class="summary-card duration">
                <div class="label">Duration</div>
                <div class="value">${durationSeconds}s</div>
            </div>
        </div>

        <div class="summary">
            <div style="grid-column: 1 / -1;">
                <h3 style="margin-bottom: 10px; text-align: center;">Pass Rate: ${passRate}%</h3>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${passRate}%">${passRate}%</div>
                </div>
            </div>
        </div>

        <div class="environment">
            <h2>Test Environment</h2>
            <div class="environment-info">
                <div class="environment-item">
                    <strong>Browser:</strong> <span>${data.environment.browser}</span>
                </div>
                <div class="environment-item">
                    <strong>Platform:</strong> <span>${data.environment.platform}</span>
                </div>
                <div class="environment-item">
                    <strong>Node Version:</strong> <span>${data.environment.nodeVersion}</span>
                </div>
            </div>
        </div>

        <div class="footer">
            <p>Generated by SauceDemo Test Automation Framework</p>
        </div>
    </div>
</body>
</html>`;
  }
}

export default new ReportGenerator();