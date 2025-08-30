#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to parse lcov.info file
function parseLcovFile(lcovPath) {
  if (!fs.existsSync(lcovPath)) {
    return null;
  }

  const content = fs.readFileSync(lcovPath, 'utf8');
  const lines = content.split('\n');
  const files = [];
  let currentFile = null;

  for (const line of lines) {
    if (line.startsWith('SF:')) {
      // Source file
      currentFile = {
        path: line.substring(3),
        lines: [],
        functions: [],
        branches: []
      };
      files.push(currentFile);
    } else if (line.startsWith('LF:') && currentFile) {
      // Lines found
      currentFile.linesFound = parseInt(line.substring(3));
    } else if (line.startsWith('LH:') && currentFile) {
      // Lines hit
      currentFile.linesHit = parseInt(line.substring(3));
    } else if (line.startsWith('FNF:') && currentFile) {
      // Functions found
      currentFile.functionsFound = parseInt(line.substring(4));
    } else if (line.startsWith('FNH:') && currentFile) {
      // Functions hit
      currentFile.functionsHit = parseInt(line.substring(4));
    } else if (line.startsWith('BRF:') && currentFile) {
      // Branches found
      currentFile.branchesFound = parseInt(line.substring(4));
    } else if (line.startsWith('BRH:') && currentFile) {
      // Branches hit
      currentFile.branchesHit = parseInt(line.substring(4));
    } else if (line.startsWith('DA:') && currentFile) {
      // Line data
      const [lineNum, hitCount] = line.substring(3).split(',');
      currentFile.lines.push({
        number: parseInt(lineNum),
        hit: parseInt(hitCount)
      });
    }
  }

  return files;
}

// Function to calculate coverage percentage
function calculateCoverage(hit, total) {
  return total > 0 ? Math.round((hit / total) * 100) : 0;
}

// Function to generate HTML report
function generateHtmlReport(files) {
  const totalLines = files.reduce((sum, file) => sum + (file.linesFound || 0), 0);
  const totalLinesHit = files.reduce((sum, file) => sum + (file.linesHit || 0), 0);
  const totalFunctions = files.reduce((sum, file) => sum + (file.functionsFound || 0), 0);
  const totalFunctionsHit = files.reduce((sum, file) => sum + (file.functionsHit || 0), 0);
  const totalBranches = files.reduce((sum, file) => sum + (file.branchesFound || 0), 0);
  const totalBranchesHit = files.reduce((sum, file) => sum + (file.branchesHit || 0), 0);

  const overallCoverage = calculateCoverage(totalLinesHit, totalLines);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Global Coverage Report - Sweetly Dipped</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            background: linear-gradient(135deg, #ff66a0, #6b433f);
            color: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        
        .header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        
        .summary {
            background: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .summary h2 {
            color: #4b2e2b;
            margin-bottom: 20px;
            font-size: 1.8em;
        }
        
        .metrics {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .metric {
            text-align: center;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
            border-left: 4px solid #ff66a0;
        }
        
        .metric h3 {
            font-size: 2em;
            color: #4b2e2b;
            margin-bottom: 5px;
        }
        
        .metric p {
            color: #666;
            font-weight: 500;
        }
        
        .coverage-bar {
            background: #e9ecef;
            border-radius: 20px;
            height: 20px;
            overflow: hidden;
            margin: 20px 0;
        }
        
        .coverage-fill {
            height: 100%;
            background: linear-gradient(90deg, #ff66a0, #6b433f);
            transition: width 0.3s ease;
        }
        
        .files-section {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .files-section h2 {
            color: #4b2e2b;
            margin-bottom: 20px;
            font-size: 1.8em;
        }
        
        .file-list {
            list-style: none;
        }
        
        .file-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px;
            border-bottom: 1px solid #eee;
            transition: background-color 0.2s;
        }
        
        .file-item:hover {
            background-color: #f8f9fa;
        }
        
        .file-item:last-child {
            border-bottom: none;
        }
        
        .file-name {
            font-family: 'Monaco', 'Menlo', monospace;
            color: #4b2e2b;
            flex: 1;
        }
        
        .file-coverage {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .coverage-percentage {
            font-weight: bold;
            min-width: 50px;
            text-align: right;
        }
        
        .coverage-high { color: #28a745; }
        .coverage-medium { color: #ffc107; }
        .coverage-low { color: #dc3545; }
        
        .mini-bar {
            width: 100px;
            height: 8px;
            background: #e9ecef;
            border-radius: 4px;
            overflow: hidden;
        }
        
        .mini-fill {
            height: 100%;
            transition: width 0.3s ease;
        }
        
        .footer {
            text-align: center;
            margin-top: 40px;
            padding: 20px;
            color: #666;
        }
        
        @media (max-width: 768px) {
            .container {
                padding: 10px;
            }
            
            .header {
                padding: 20px;
            }
            
            .header h1 {
                font-size: 2em;
            }
            
            .metrics {
                grid-template-columns: 1fr;
            }
            
            .file-item {
                flex-direction: column;
                align-items: flex-start;
                gap: 10px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🍫 Sweetly Dipped</h1>
            <p>Global Test Coverage Report</p>
        </div>
        
        <div class="summary">
            <h2>Overall Coverage Summary</h2>
            
            <div class="metrics">
                <div class="metric">
                    <h3>${overallCoverage}%</h3>
                    <p>Overall Coverage</p>
                </div>
                <div class="metric">
                    <h3>${totalLinesHit}/${totalLines}</h3>
                    <p>Lines Covered</p>
                </div>
                <div class="metric">
                    <h3>${totalFunctionsHit}/${totalFunctions}</h3>
                    <p>Functions Covered</p>
                </div>
                <div class="metric">
                    <h3>${totalBranchesHit}/${totalBranches}</h3>
                    <p>Branches Covered</p>
                </div>
            </div>
            
            <div class="coverage-bar">
                <div class="coverage-fill" style="width: ${overallCoverage}%"></div>
            </div>
        </div>
        
        <div class="files-section">
            <h2>File Coverage Details</h2>
            <ul class="file-list">
                ${files.map(file => {
                    const coverage = calculateCoverage(file.linesHit || 0, file.linesFound || 0);
                    const coverageClass = coverage >= 80 ? 'coverage-high' : coverage >= 50 ? 'coverage-medium' : 'coverage-low';
                    const fillColor = coverage >= 80 ? '#28a745' : coverage >= 50 ? '#ffc107' : '#dc3545';
                    
                    return `
                        <li class="file-item">
                            <div class="file-name">${file.path}</div>
                            <div class="file-coverage">
                                <div class="mini-bar">
                                    <div class="mini-fill" style="width: ${coverage}%; background-color: ${fillColor}"></div>
                                </div>
                                <div class="coverage-percentage ${coverageClass}">${coverage}%</div>
                            </div>
                        </li>
                    `;
                }).join('')}
            </ul>
        </div>
        
        <div class="footer">
            <p>Generated on ${new Date().toLocaleString()}</p>
            <p>Total files: ${files.length}</p>
        </div>
    </div>
</body>
</html>`;

  return html;
}

// Main function
function main() {
  const coveragePath = path.join(__dirname, '..', 'coverage', 'lcov.info');
  
  console.log('📊 Generating global HTML coverage report...\n');
  
  const files = parseLcovFile(coveragePath);
  
  if (!files || files.length === 0) {
    console.error('❌ No coverage data found. Please run tests first with: yarn coverage:global');
    process.exit(1);
  }
  
  const html = generateHtmlReport(files);
  
  // Create coverage/html directory if it doesn't exist
  const htmlDir = path.join(__dirname, '..', 'coverage', 'html');
  if (!fs.existsSync(htmlDir)) {
    fs.mkdirSync(htmlDir, { recursive: true });
  }
  
  // Write HTML file
  const htmlPath = path.join(htmlDir, 'index.html');
  fs.writeFileSync(htmlPath, html);
  
  console.log('✅ Global HTML coverage report generated successfully!');
  console.log(`📁 Report saved to: ${htmlPath}`);
  console.log(`🌐 Open in browser: file://${htmlPath}`);
  
  // Calculate and display summary
  const totalLines = files.reduce((sum, file) => sum + (file.linesFound || 0), 0);
  const totalLinesHit = files.reduce((sum, file) => sum + (file.linesHit || 0), 0);
  const overallCoverage = calculateCoverage(totalLinesHit, totalLines);
  
  console.log(`\n📈 Summary:`);
  console.log(`   Files: ${files.length}`);
  console.log(`   Lines: ${totalLinesHit}/${totalLines}`);
  console.log(`   Coverage: ${overallCoverage}%`);
}

// Run the script
try {
  main();
} catch (error) {
  console.error('❌ Error generating HTML report:', error);
  process.exit(1);
}
