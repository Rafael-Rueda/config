import { setupBiomeSettings } from './biome.js';
import { setupVSCodeSettings } from './vscode.js';
import { setupCode } from './code.js';

await setupVSCodeSettings();
await setupBiomeSettings();
await setupCode();
