import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readConfig, writeConfig } from './configUtils.js';
import { setupGitignore } from './gitignore.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG_DIR = path.join(__dirname, '..', 'config', 'code');
const GEMINI_CONFIG = path.join(CONFIG_DIR, '.gemini', 'settings.json');
const CLAUDE_CONFIG = path.join(CONFIG_DIR, '.claude', 'settings.json');
const CLAUDE_MCP_CONFIG = path.join(CONFIG_DIR, '.claude', '.mcp.json');

async function detectTool(toolName) {
	try {
		const { execSync } = await import('node:child_process');
		execSync(`${toolName} --version`, { stdio: 'ignore' });
		return true;
	} catch {
		return false;
	}
}

function copyConfigToProject(sourcePath, targetPath) {
	const targetDir = path.dirname(targetPath);
	if (!fs.existsSync(targetDir)) {
		fs.mkdirSync(targetDir, { recursive: true });
	}
	
	const config = readConfig(sourcePath);
	writeConfig(targetPath, config);
	
	return targetPath;
}

export async function setupCode(targetDir = process.cwd(), options = {}) {
	const results = {
		gemini: false,
		claude: false,
		errors: []
	};

	console.log('🔧 Configurando as ferramentas AI CLI...\n');

	if (options.gemini !== false) {
		console.log('Verificando a CLI do Gemini...');
		const hasGemini = await detectTool('gemini');
		
		if (hasGemini || options.force) {
			try {
				const targetPath = path.join(targetDir, '.gemini', 'settings.json');
				copyConfigToProject(GEMINI_CONFIG, targetPath);
				console.log(`✅ Configuração do Gemini criada em ${targetPath}\n`);
				results.gemini = true;
			} catch (error) {
				const msg = `Falha ao configurar o Gemini: ${error.message}`;
				console.error(`❌ ${msg}\n`);
				results.errors.push(msg);
			}
		} else {
			console.log('⚠️  CLI do Gemini não encontrada. Pulando...\n');
		}
	}

	if (options.claude !== false) {
		console.log('Verificando o Claude Code...');
		const hasClaude = await detectTool('claude');
		
		if (hasClaude || options.force) {
			try {
				const settingsPath = path.join(targetDir, '.claude', 'settings.json');
				const mcpPath = path.join(targetDir, '.mcp.json');
				
				copyConfigToProject(CLAUDE_CONFIG, settingsPath);
				copyConfigToProject(CLAUDE_MCP_CONFIG, mcpPath);
				
				console.log(`✅ Configuração do Claude criada em ${settingsPath}`);
				console.log(`✅ Configuração do MCP criada em ${mcpPath}\n`);
				results.claude = true;
			} catch (error) {
				const msg = `Falha ao configurar o Claude: ${error.message}`;
				console.error(`❌ ${msg}\n`);
				results.errors.push(msg);
			}
		} else {
			console.log('⚠️  Claude Code não encontrado. Pulando...\n');
		}
	}

	if (results.gemini || results.claude) {
		// Garante que as pastas de configuração geradas sejam ignoradas pelo Git
		setupGitignore(targetDir);

		console.log('\n✨ Configuração concluída!');
		console.log('\n💡 Lembre-se de definir suas variáveis de ambiente:');
		if (results.gemini) console.log('   - GEMINI_API_KEY');
		if (results.claude) {
			console.log('   - ANTHROPIC_API_KEY');
			console.log('   - PERPLEXITY_API_KEY');
		}
		console.log('   - CONTEXT7_API_KEY (para ambas as ferramentas)');
	} else {
		console.log('ℹ️  Nenhuma ferramenta foi configurada.');
	}

	return results;
}
