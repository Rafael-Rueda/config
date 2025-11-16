import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

// Obtém o caminho absoluto para o diretório do projeto (um nível acima de 'scripts')
const PROJECT_ROOT = path.resolve(import.meta.dirname, '..');
const SETUP_SCRIPT_PATH = path.join(PROJECT_ROOT, 'scripts', 'loadAll.js');

describe('Integration Test: @rueda.dev/config setup', () => {
  let tempDir = '';

  beforeAll(() => {
    // Cria um diretório temporário para o teste
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rueda-config-test-'));
  });

  afterAll(() => {
    // Limpa o diretório temporário após os testes
    if (tempDir) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('should create .gitignore, .gemini, .claude, and .mcp.json files', () => {
    // Executa o script de setup dentro do diretório temporário
    try {
      execSync(`node "${SETUP_SCRIPT_PATH}"`, { cwd: tempDir, stdio: 'pipe' });
    } catch (error) {
      // Se o comando falhar, exibe o erro de forma clara
      const stderr = error.stderr ? error.stderr.toString() : 'No stderr';
      throw new Error(`Setup script failed: ${error.message}\n${stderr}`);
    }

    // 1. Verifica o .gitignore
    const gitignorePath = path.join(tempDir, '.gitignore');
    expect(fs.existsSync(gitignorePath)).toBe(true);
    const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
    expect(gitignoreContent).toContain('/.claude/');
    expect(gitignoreContent).toContain('/.gemini/');
    expect(gitignoreContent).toContain('/.taskmaster/');
    expect(gitignoreContent).toContain('/.mcp.json');

    // 2. Verifica os arquivos do Gemini
    const geminiConfigPath = path.join(tempDir, '.gemini', 'settings.json');
    expect(fs.existsSync(geminiConfigPath)).toBe(true);
    const geminiContent = JSON.parse(fs.readFileSync(geminiConfigPath, 'utf-8'));
    expect(geminiContent.model.name).toBe('gemini-2.5-pro');

    // 3. Verifica os arquivos do Claude
    const claudeConfigPath = path.join(tempDir, '.claude', 'settings.json');
    expect(fs.existsSync(claudeConfigPath)).toBe(true);
    const claudeContent = JSON.parse(fs.readFileSync(claudeConfigPath, 'utf-8'));
    expect(claudeContent.model).toBe('claude-sonnet-4-5-20250929');

    // 4. Verifica o .mcp.json
    const mcpPath = path.join(tempDir, '.mcp.json');
    expect(fs.existsSync(mcpPath)).toBe(true);
    const mcpContent = JSON.parse(fs.readFileSync(mcpPath, 'utf-8'));
    expect(mcpContent.mcpServers).toHaveProperty('context7');
    expect(mcpContent.mcpServers).toHaveProperty('taskmaster-ai');
  });
});