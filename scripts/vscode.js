import { fileURLToPath } from 'node:url';
import { promises as fs } from 'node:fs';
import { join, dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function setupVSCodeSettings() {
    try {
      // Caminho para o arquivo de configuração no seu pacote
      const configPath = join(__dirname, '..', 'config', 'vscode', 'settings.json');
      
      // Caminho de destino no projeto do usuário
      const targetDir = join(process.cwd(), '.vscode');
      const targetPath = join(targetDir, 'settings.json');
      
      // Lê as configurações do seu pacote
      const configContent = await fs.readFile(configPath, 'utf-8');
      const config = JSON.parse(configContent);
      
      // Cria o diretório .vscode se não existir
      await fs.mkdir(targetDir, { recursive: true });
      
      let finalConfig = config;
      
      // Se já existe um settings.json, faz merge
      try {
        const existingContent = await fs.readFile(targetPath, 'utf-8');
        const existingConfig = JSON.parse(existingContent);
        
        // Merge das configurações (suas configs têm prioridade)
        finalConfig = {
          ...existingConfig,
          ...config
        };
        
        console.log('🔄 Configurações existentes encontradas, fazendo merge...');
      } catch (error) {
        console.log('📄 Criando novo arquivo de configurações...');
      }
      
      // Escreve as configurações finais
      await fs.writeFile(targetPath, JSON.stringify(finalConfig, null, 2));
      
      console.log('✅ Configurações do VS Code aplicadas com sucesso!');
      console.log(`📍 Arquivo criado/atualizado: ${targetPath}`);
      
    } catch (error) {
      console.error('❌ Erro ao aplicar configurações do VS Code:', error.message);
      process.exit(1);
    }
  }
