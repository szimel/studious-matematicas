#!/usr/bin/env node
/* eslint-disable no-console */

import fs from 'node:fs/promises';
import path from 'node:path';
import proc from 'node:process';

const projectRoot = proc.cwd();
const publicDir = path.join(projectRoot, 'public');
const jsonDir = path.join(publicDir, 'json');

function parseArgs(argv) {
  const args = { apiUrl: '', apiKey: '' };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    const next = argv[i + 1];

    if (token === '--api-url' && next) {
      args.apiUrl = next;
      i += 1;
      continue;
    }

    if (token === '--api-key' && next) {
      args.apiKey = next;
      i += 1;
      continue;
    }
  }

  return args;
}

async function loadEnvFile(filePath) {
  try {
    const text = await fs.readFile(filePath, 'utf8');
    const lines = text.split(/\r?\n/);

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) {
        continue;
      }

      const eqIndex = line.indexOf('=');
      if (eqIndex < 0) {
        continue;
      }

      const key = line.slice(0, eqIndex).trim();
      let value = line.slice(eqIndex + 1).trim();

      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith('\'') && value.endsWith('\''))
      ) {
        value = value.slice(1, -1);
      }

      if (!(key in proc.env)) {
        proc.env[key] = value;
      }
    }
  } catch {
    // Missing env files are expected; ignore.
  }
}

async function bootstrapEnv() {
  const nodeEnv = proc.env.NODE_ENV || 'development';
  const candidates = [
    '.env',
    '.env.local',
    `.env.${nodeEnv}`,
    `.env.${nodeEnv}.local`,
  ];

  for (const fileName of candidates) {
    await loadEnvFile(path.join(projectRoot, fileName));
  }
}

function resolveApiConfig(cliArgs) {
  const isProd = proc.env.NODE_ENV === 'production';

  const baseUrl =
    cliArgs.apiUrl ||
    proc.env.SHERLOCK_API_URL ||
    proc.env.REACT_APP_API_URL ||
    (isProd ? proc.env.REACT_APP_API_URL_PROD : proc.env.REACT_APP_API_URL_LOCAL);

  const apiKey =
    cliArgs.apiKey ||
    proc.env.SHERLOCK_API_KEY ||
    proc.env.REACT_APP_API_KEY ||
    (isProd ? proc.env.REACT_APP_API_KEY_PROD : proc.env.REACT_APP_API_KEY_LOCAL);

  if (!baseUrl) {
    throw new Error(
      'Missing API URL. Set SHERLOCK_API_URL, REACT_APP_API_URL(_LOCAL/_PROD), or pass --api-url.'
    );
  }

  if (!apiKey) {
    throw new Error(
      'Missing API key. Set SHERLOCK_API_KEY, REACT_APP_API_KEY(_LOCAL/_PROD), or pass --api-key.'
    );
  }

  return { baseUrl: baseUrl.replace(/\/$/, ''), apiKey };
}

async function findMp3Files(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      const nested = await findMp3Files(fullPath);
      files.push(...nested);
      continue;
    }

    if (entry.isFile() && entry.name.toLowerCase().endsWith('.mp3')) {
      files.push(fullPath);
    }
  }

  return files;
}

function computeJsonOutputPath(mp3Path) {
  const relFromPublic = path.relative(publicDir, mp3Path);
  const relDir = path.dirname(relFromPublic);
  const baseName = path.basename(relFromPublic, path.extname(relFromPublic));

  if (relDir === 'audio' || relDir.startsWith(`audio${path.sep}`)) {
    const relUnderAudio = path.relative('audio', relDir);
    return path.join(jsonDir, relUnderAudio, `${baseName}.json`);
  }

  return path.join(jsonDir, `${baseName}.json`);
}

async function sendToSherlock(mp3Path, apiConfig) {
  const fileBytes = await fs.readFile(mp3Path);
  const formData = new FormData();
  const fileBlob = new Blob([fileBytes], { type: 'audio/mpeg' });

  formData.append('file', fileBlob, path.basename(mp3Path));

  const response = await fetch(`${apiConfig.baseUrl}/analyze`, {
    method: 'POST',
    headers: {
      'x-api-key': apiConfig.apiKey,
    },
    body: formData,
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => 'Unknown server error');
    throw new Error(`Sherlock returned ${response.status}: ${errText}`);
  }

  return response.json();
}

async function main() {
  await bootstrapEnv();
  const cliArgs = parseArgs(proc.argv.slice(2));
  const apiConfig = resolveApiConfig(cliArgs);

  await fs.mkdir(jsonDir, { recursive: true });
  const mp3Files = await findMp3Files(publicDir);

  if (mp3Files.length === 0) {
    console.log('No .mp3 files found under public/.');
    return;
  }

  console.log(`Found ${mp3Files.length} mp3 file(s).`);

  let successCount = 0;
  let failureCount = 0;

  for (const mp3Path of mp3Files) {
    const relativeMp3 = path.relative(projectRoot, mp3Path);
    const outputPath = computeJsonOutputPath(mp3Path);
    const relativeOut = path.relative(projectRoot, outputPath);

    try {
      console.log(`Analyzing ${relativeMp3} ...`);
      const sherlockOutput = await sendToSherlock(mp3Path, apiConfig);

      await fs.mkdir(path.dirname(outputPath), { recursive: true });
      await fs.writeFile(outputPath, `${JSON.stringify(sherlockOutput, null, 2)}\n`, 'utf8');

      console.log(`Saved ${relativeOut}`);
      successCount += 1;
    } catch (error) {
      console.error(`Failed ${relativeMp3}:`, error instanceof Error ? error.message : error);
      failureCount += 1;
    }
  }

  console.log(`Done. Success: ${successCount}, Failed: ${failureCount}`);
  if (failureCount > 0) {
    proc.exitCode = 1;
  }
}

main().catch((error) => {
  console.error('Fatal error:', error instanceof Error ? error.message : error);
  proc.exit(1);
});
