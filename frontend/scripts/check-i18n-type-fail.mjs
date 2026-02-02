import { spawnSync } from 'node:child_process';
import path from 'node:path';

const tscEntry = path.resolve(process.cwd(), 'node_modules/typescript/bin/tsc');
const command = process.execPath;
const args = [tscEntry, '--noEmit', '--incremental', 'false', '-p', 'src/test/i18n/tsconfig.json'];

const result = spawnSync(command, args, {
  cwd: process.cwd(),
  encoding: 'utf8',
});

const output = `${result.stdout || ''}\n${result.stderr || ''}`;
const hasExpectedKey = output.includes('common.appNmae');
const failedAsExpected = result.status !== 0;

if (failedAsExpected && hasExpectedKey) {
  console.log('OK: i18n typo key is rejected by TypeScript.');
  process.exit(0);
}

console.error('FAILED: expected TypeScript to fail on i18n typo key.');
console.error(output);
process.exit(1);
