# @rueda.dev/config

🎛️ Configurações compartilhadas de linting e formatação da [rueda.dev](https://rueda.dev).  
Atualmente com suporte a [BiomeJS](https://biomejs.dev) via `extends`.

![npm version](https://img.shields.io/npm/v/@rueda.dev/config?label=npm)
![license](https://img.shields.io/npm/l/@rueda.dev/config)
![biome](https://img.shields.io/badge/Built%20for-BiomeJS-blue?logo=eslint)
![Gemini](https://img.shields.io/badge/Configures-Gemini_CLI-blueviolet?logo=google-gemini)
![Claude](https://img.shields.io/badge/Configures-Claude_Code-orange)
![Gitignore](https://img.shields.io/badge/Manages-.gitignore-red?logo=git)

---

## ✨ Objetivo

Este repositório centraliza configurações de lint e formatter para projetos TypeScript, Javascript, React, Tailwind, Node, etc., promovendo:

- ✅ Consistência entre repositórios
- ✅ Manutenção centralizada
- ✅ Setup rápido e sem repetição

---

## 🚀 Funcionalidades

O comando `npx "@rueda.dev/config" setup` automatiza a configuração do seu ambiente de desenvolvimento.

### 1. Configuração de Ferramentas de IA (Gemini & Claude)

Cria automaticamente os arquivos de configuração para as CLIs do **[Gemini](https://developers.google.com/gemini/ai-studio/docs/cli)** e do **[Claude](https://docs.anthropic.com/claude/docs/claude-code-cli)**. As configurações utilizam placeholders de variáveis de ambiente (ex: `${GEMINI_API_KEY}`) que são resolvidas pelas próprias ferramentas em tempo de execução, buscando os valores diretamente do seu sistema operacional. Isso garante que nenhum segredo seja salvo em texto plano no seu projeto. Entretanto, você pode sempre alterar para colocar diretamente suas credenciais, (sem variáveis de ambiente). Apenas certifique-se de não trafegar a pasta de configuração dessas ferramentas em seu GitHub, para não expô-las !

### 2. Gerenciamento Inteligente do `.gitignore`

O script gerencia ativamente seu arquivo `.gitignore` para garantir a segurança do projeto:
- **Criação:** Se um `.gitignore` não existir, um novo arquivo otimizado para projetos Node.js/React é criado.
- **Atualização:** Adiciona automaticamente as pastas de configuração (`/.gemini/`, `/.claude/`, etc.) ao seu `.gitignore` para evitar que configurações locais sejam versionadas acidentalmente.

---

## 📦 Instalação

```bash
npm install -D "@rueda.dev/config"
# Auto-Setup
npx "@rueda.dev/config" setup
```

### BiomeJS
```json
{
    "extends": ["@rueda.dev/config/biome"]
}
```
