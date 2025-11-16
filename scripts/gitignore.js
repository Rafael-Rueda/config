import fs from 'node:fs';
import path from 'node:path';

// Entradas padrão e criativas para um .gitignore de Node.js/React
const DEFAULT_GITIGNORE_CONTENT = `
# Dependencies
/node_modules
/.pnp
.pnp.js

# Build artifacts
/build
/dist
.next/

# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
.env.*

# IDEs and editors
.vscode/
.idea/
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# OS-generated files
.DS_Store
Thumbs.db

# Test reports
/coverage
/reports
`;

// Configurações específicas das ferramentas de IA a serem ignoradas
const AI_TOOL_ENTRIES = [
  '/.claude/',
  '/.gemini/',
  '/.taskmaster/',
  '/.mcp.json'
];

/**
 * Garante que o .gitignore existe e contém as entradas para as ferramentas de IA.
 * @param {string} projectDir O diretório raiz do projeto do usuário.
 */
export function setupGitignore(projectDir = process.cwd()) {
  const gitignorePath = path.join(projectDir, '.gitignore');

  if (!fs.existsSync(gitignorePath)) {
    // .gitignore não existe, cria um novo com o template completo
    console.log('🔧 Criando um novo arquivo .gitignore com configurações padrão...');
    const header = '# Arquivo .gitignore gerado automaticamente\n';
    const aiHeader = '\n# Configurações de Ferramentas de IA (gerado por @rueda.dev/config)\n';
    const newContent = header + DEFAULT_GITIGNORE_CONTENT + aiHeader + AI_TOOL_ENTRIES.join('\n') + '\n';
    
    fs.writeFileSync(gitignorePath, newContent, 'utf-8');
    console.log('✅ .gitignore criado com sucesso.');
  } else {
    // .gitignore já existe, verifica e adiciona apenas as entradas ausentes
    let content = fs.readFileSync(gitignorePath, 'utf-8');
    const entriesToAdd = [];

    for (const entry of AI_TOOL_ENTRIES) {
      // Verifica se a entrada exata já existe no arquivo
      const entryRegex = new RegExp(`^${entry.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'm');
      if (!entryRegex.test(content)) {
        entriesToAdd.push(entry);
      }}

    if (entriesToAdd.length > 0) {
      console.log('🔧 Atualizando .gitignore com configurações das ferramentas de IA...');
      const aiHeader = '\n# Configurações de Ferramentas de IA (gerado por @rueda.dev/config)\n';
      const contentToAppend = aiHeader + entriesToAdd.join('\n') + '\n';
      
      fs.appendFileSync(gitignorePath, contentToAppend, 'utf-8');
      console.log('✅ .gitignore atualizado.');
    } else {
      console.log('ℹ️  Entradas das ferramentas de IA já existem no .gitignore. Nenhuma alteração necessária.');
    }}
}