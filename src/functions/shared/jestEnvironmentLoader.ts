import fs from 'fs';

export function loadLocalSettings() {
  const localSettings = JSON.parse(fs.readFileSync('./local.settings.json', 'utf8'));
  const envSettings = localSettings.Values;

  for (const key in envSettings) {
    if (envSettings.hasOwnProperty(key)) {
      process.env[key] = envSettings[key];
    }
  }
}