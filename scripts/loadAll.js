import { setupBiomeSettings } from './biome.js';
import { setupVSCodeSettings } from './vscode.js';

await setupVSCodeSettings();
await setupBiomeSettings();
