import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const command = process.argv[2];

switch (command) {
  case 'setup': {
    console.log('🚀 Configurando VS Code...');
    const setupScript = join(__dirname, '..', 'scripts', 'loadAll.js');
    const child = spawn('node', [setupScript], { stdio: 'inherit' });
    
    child.on('close', (code) => {
      process.exit(code);
    });
    break;
}
  default:
    console.log(`
📦 @rueda.dev/config

Comandos disponíveis:
  rueda-config setup     - Configura automaticamente todas as configurações

Exemplo de uso:
  npx "@rueda.dev/config" setup
    `);
}
