import { writeFile, mkdir } from 'fs/promises';
import { existsSync, readFileSync } from 'fs';
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
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #ea9d66ff 0%, #a24b5eff 100%);
            padding: 20px;
            color: #333;
        }
        .container {
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            border-radius: 10px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #6678eaff 0%, #4b86a2ff 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        .header .timestamp {
            font-size: 1.1em;
            opacity: 0.9;
        }
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            padding: 40px;
            background: #f8f9fa;
        }
        .summary-card {
            background: white;
            padding: 25px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            text-align: center;
            transition: transform 0.2s;
        }
        .summary-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .summary-card .label {
            font-size: 0.9em;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 10px;
        }
        .summary-card .value {
            font-size: 2.5em;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .summary-card.total .value { color: #667eea; }
        .summary-card.passed .value { color: #10b981; }
        .summary-card.failed .value { color: #ef4444; }
        .summary-card.duration .value { font-size: 2em; }
        .progress-bar {
            width: 100%;
            height: 30px;
            background: #e5e7eb;
            border-radius: 15px;
            overflow: hidden;
            margin: 20px 0;
        }
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #10b981 0%, #059669 100%);
            transition: width 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
        }
        .environment {
            padding: 30px 40px;
            background: white;
            border-top: 1px solid #e5e7eb;
        }
        .environment h2 {
            margin-bottom: 15px;
            color: #66a1eaff;
        }
        .environment-info {
            display: flex;
            gap: 30px;
            flex-wrap: wrap;
        }
        .environment-item {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .environment-item strong {
            color: #666;
        }
        .tests-section {
            padding: 40px;
        }
        .tests-section h2 {
            margin-bottom: 20px;
            color: #667eea;
            font-size: 1.8em;
        }
        .test-card {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            margin-bottom: 15px;
            overflow: hidden;
            transition: box-shadow 0.2s;
        }
        .test-card:hover {
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .test-header {
            padding: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: pointer;
            background: #f8f9fa;
        }
        .test-header:hover {
            background: #f1f3f5;
        }
        .test-info {
            flex: 1;
        }
        .test-name {
            font-size: 1.1em;
            font-weight: 600;
            margin-bottom: 5px;
        }
        .test-suite {
            font-size: 0.9em;
            color: #666;
        }
        .test-status {
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: 600;
            font-size: 0.9em;
            text-transform: uppercase;
        }
        .status-passed {
            background: #d1fae5;
            color: #065f46;
        }
        .status-failed {
            background: #fee2e2;
            color: #991b1b;
        }
        .status-skipped {
            background: #fef3c7;
            color: #92400e;
        }
        .test-duration {
            color: #666;
            font-size: 0.9em;
            margin-left: 15px;
        }
        .test-details {
            padding: 20px;
            border-top: 1px solid #e5e7eb;
            display: none;
        }
        .test-details.active {
            display: block;
        }
        .error-message {
            background: #fef2f2;
            border-left: 4px solid #ef4444;
            padding: 15px;
            border-radius: 4px;
            margin-bottom: 15px;
            font-family: 'Courier New', monospace;
            white-space: pre-wrap;
            color: #991b1b;
        }
        .screenshot {
            max-width: 100%;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .footer {
            text-align: center;
            padding: 20px;
            background: #f8f9fa;
            color: #666;
            border-top: 1px solid #e5e7eb;
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

        <div class="tests-section">
            <h2>Test Results</h2>
            ${this.buildTestCards(data.testResults)}
        </div>

        <div class="footer">
            <p>Generated by SauceDemo Test Automation Framework</p>
        </div>
    </div>

    <script>
        document.querySelectorAll('.test-header').forEach(header => {
            header.addEventListener('click', () => {
                const details = header.nextElementSibling;
                details.classList.toggle('active');
            });
        });
    </script>
</body>
</html>`;
  }

  /**
   * Build HTML for test result cards
   * @param testResults - Array of test results
   * @returns HTML string
   */
  private buildTestCards(testResults: TestResult[]): string {
    return testResults.map(test => {
      const statusClass = `status-${test.status}`;
      const durationMs = test.duration.toFixed(0);
      
      let detailsContent = '';
      if (test.error) {
        detailsContent += `<div class="error-message">${this.escapeHtml(test.error)}</div>`;
      }
      if (test.screenshot && existsSync(test.screenshot)) {
        try {
          const imageData = readFileSync(test.screenshot, 'base64');
          detailsContent += `<img src="data:image/png;base64,${imageData}" alt="Screenshot" class="screenshot">`;
        } catch (error) {
          detailsContent += `<p>Screenshot unavailable</p>`;
        }
      }

      return `
        <div class="test-card">
            <div class="test-header">
                <div class="test-info">
                    <div class="test-name">${this.escapeHtml(test.testName)}</div>
                    <div class="test-suite">${this.escapeHtml(test.suiteName)}</div>
                </div>
                <div style="display: flex; align-items: center;">
                    <span class="test-status ${statusClass}">${test.status}</span>
                    <span class="test-duration">${durationMs}ms</span>
                </div>
            </div>
            ${detailsContent ? `<div class="test-details">${detailsContent}</div>` : ''}
        </div>
      `;
    }).join('');
  }

  // Escape HTML special characters
  private escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }
}

export default new ReportGenerator();