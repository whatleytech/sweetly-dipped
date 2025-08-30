#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to read and parse coverage data
function readCoverageData(packagePath) {
  const coveragePath = path.join(packagePath, 'coverage', 'lcov.info');
  if (fs.existsSync(coveragePath)) {
    return fs.readFileSync(coveragePath, 'utf8');
  }
  return null;
}

// Function to merge coverage data
function mergeCoverageData() {
  const packagesDir = path.join(__dirname, '..', 'packages');
  const packages = fs.readdirSync(packagesDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  let mergedCoverage = '';
  let totalLines = 0;
  let coveredLines = 0;

  console.log('📊 Aggregating coverage from packages...\n');

  packages.forEach(packageName => {
    const packagePath = path.join(packagesDir, packageName);
    const coverageData = readCoverageData(packagePath);
    
    if (coverageData) {
      console.log(`✅ ${packageName}: Found coverage data`);
      mergedCoverage += coverageData + '\n';
      
      // Parse coverage statistics
      const lines = coverageData.split('\n');
      lines.forEach(line => {
        if (line.startsWith('LF:')) {
          const match = line.match(/LF:(\d+)/);
          if (match) {
            totalLines += parseInt(match[1]);
          }
        }
        if (line.startsWith('LH:')) {
          const match = line.match(/LH:(\d+)/);
          if (match) {
            coveredLines += parseInt(match[1]);
          }
        }
      });
    } else {
      console.log(`⚠️  ${packageName}: No coverage data found`);
    }
  });

  // Create coverage directory if it doesn't exist
  const coverageDir = path.join(__dirname, '..', 'coverage');
  if (!fs.existsSync(coverageDir)) {
    fs.mkdirSync(coverageDir, { recursive: true });
  }

  // Write merged coverage file
  const mergedCoveragePath = path.join(coverageDir, 'lcov.info');
  fs.writeFileSync(mergedCoveragePath, mergedCoverage);

  // Calculate and display summary
  const coveragePercentage = totalLines > 0 ? ((coveredLines / totalLines) * 100).toFixed(1) : 0;
  
  console.log('\n📈 Global Coverage Summary:');
  console.log(`   Total Lines: ${totalLines}`);
  console.log(`   Covered Lines: ${coveredLines}`);
  console.log(`   Coverage: ${coveragePercentage}%`);
  console.log(`\n📁 Merged coverage saved to: ${mergedCoveragePath}`);

  return { totalLines, coveredLines, coveragePercentage };
}

// Run the coverage merge
try {
  mergeCoverageData();
} catch (error) {
  console.error('❌ Error merging coverage:', error);
  process.exit(1);
}
