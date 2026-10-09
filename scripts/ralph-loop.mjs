#!/usr/bin/env node

/**
 * Ralph Verification Protocol
 * Executes structural checks, typecheck, unit tests, and production build.
 * Flags:
 *   --fast : Runs quick typecheck and Vitest unit suite.
 *   --full : Runs typecheck, Vitest, build check, and artifact verification.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const isFast = process.argv.includes('--fast');
const mode = isFast ? 'FAST' : 'FULL';

console.log(`\n======================================================`);
console.log(`  RALPH VERIFICATION PROTOCOL [MODE: ${mode}]`);
console.log(`======================================================\n`);

const results = {
  timestamp: new Date().toISOString(),
  mode,
  checks: [],
  success: true,
};

function runStep(name, cmd) {
  process.stdout.write(`[CHECK] ${name}... `);
  try {
    const stdout = execSync(cmd, { stdio: 'pipe' }).toString();
    console.log(`\x1b[32mPASS\x1b[0m`);
    results.checks.push({ name, status: 'PASS', command: cmd });
    return true;
  } catch (err) {
    console.log(`\x1b[31mFAIL\x1b[0m`);
    console.error(err.stdout ? err.stdout.toString() : err.message);
    results.checks.push({ name, status: 'FAIL', command: cmd, error: err.message });
    results.success = false;
    return false;
  }
}

// 1. Structural Checks: Verify specification files exist and are populated
process.stdout.write(`[CHECK] SDD Artifacts Structure... `);
const requiredFiles = [
  'AGENTS.md',
  'spec/PRODUCT.md',
  'spec/STATE.md',
  'spec/changes/001-playable-foundation/requirements.md',
  'spec/changes/001-playable-foundation/design.md',
  'spec/changes/001-playable-foundation/tasks.md',
  'spec/changes/001-playable-foundation/verification.md',
  'spec/changes/001-1-pitch-mobile-regression/requirements.md',
  'spec/changes/001-1-pitch-mobile-regression/design.md',
  'spec/changes/001-1-pitch-mobile-regression/tasks.md',
  'spec/changes/001-1-pitch-mobile-regression/verification.md',
  'spec/changes/002-round-lifecycle-themes/requirements.md',
  'spec/changes/002-round-lifecycle-themes/design.md',
  'spec/changes/002-round-lifecycle-themes/tasks.md',
  'spec/changes/002-round-lifecycle-themes/verification.md',
  'spec/changes/003-i18n-accessibility/requirements.md',
  'spec/changes/003-i18n-accessibility/design.md',
  'spec/changes/003-i18n-accessibility/tasks.md',
  'spec/changes/003-i18n-accessibility/verification.md',
  '.github/workflows/verify.yml',
];

const missing = requiredFiles.filter((f) => !fs.existsSync(f));
if (missing.length > 0) {
  console.log(`\x1b[31mFAIL\x1b[0m (Missing: ${missing.join(', ')})`);
  results.checks.push({ name: 'Artifact Structure', status: 'FAIL', missing });
  results.success = false;
} else {
  console.log(`\x1b[32mPASS\x1b[0m`);
  results.checks.push({ name: 'Artifact Structure', status: 'PASS' });
}

// 2. TypeScript Compilation Check
runStep('Typecheck (tsc --noEmit)', 'npm run lint');

// 3. Vitest Unit, Geometry & Layout Suite
runStep('Unit, Geometry & Layout Tests (vitest run)', 'npm test');

// 4. In Full Mode: Run Production Build
if (!isFast) {
  runStep('Production Bundle Build (vite build)', 'npm run build');

  // Truthful browser gate status
  process.stdout.write(`[CHECK] Browser End-to-End Suite... `);
  console.log(`\x1b[33mPENDING (Playwright browser binaries not installed in cloud runner; gated in CI)\x1b[0m`);
  results.checks.push({
    name: 'Browser E2E Suite',
    status: 'PENDING',
    note: 'Playwright headless browser execution pending CI / local browser environment',
  });
}

console.log(`\n------------------------------------------------------`);
if (results.success) {
  console.log(`\x1b[32m✔ LOCAL UNIT, GEOMETRY & BUILD GATES PASSED (E2E PENDING CI)\x1b[0m`);
} else {
  console.log(`\x1b[31m✘ VERIFICATION FAILED\x1b[0m`);
  process.exit(1);
}
console.log(`------------------------------------------------------\n`);
