import { fileURLToPath } from 'node:url';
import { promises as fs } from 'node:fs';
import { join, dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function setupBiomeSettings() {
    const targetPath = join(process.cwd(), 'biome.json');
  
    try {
      const existingConfig = await fs.readFile(targetPath, 'utf-8');
      const config = JSON.parse(existingConfig);
  
      const finalConfig = {
        ...config,
        extends: ['@rueda.dev/config/biome']
      };
  
      await fs.writeFile(targetPath, JSON.stringify(finalConfig, null, 2));
      
      console.log('✅ Configurações do Biome aplicadas com sucesso!');
      console.log(`📍 Arquivo criado/atualizado: ${targetPath}`);
      
    } catch (error) {
  
      console.log('📄 Criando novo arquivo de configurações...');
      try {
        const configContent = {
          "$schema": "https://biomejs.dev/schemas/2.1.4/schema.json",
          "extends": ["@rueda.dev/config/biome"]
        }
    
        await fs.writeFile(targetPath, JSON.stringify(configContent, null, 2));
        
        console.log('✅ Configurações do Biome aplicadas com sucesso!');
        console.log(`📍 Arquivo criado/atualizado: ${targetPath}`);
        
      } catch (error) {
        console.error('❌ Erro ao aplicar configurações do Biome:', error.message);
        process.exit(1);
      }
    }
  }