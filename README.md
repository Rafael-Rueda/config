# @rueda.dev/config

🎛️ Configurações compartilhadas de linting e formatação da [rueda.dev](https://rueda.dev).  
Atualmente com suporte a [BiomeJS](https://biomejs.dev) via `extends`.

![npm version](https://img.shields.io/npm/v/@rueda.dev/config?label=npm)
![license](https://img.shields.io/npm/l/@rueda.dev/config)
![biome](https://img.shields.io/badge/Built%20for-BiomeJS-blue?logo=eslint)

---

## ✨ Objetivo

Este repositório centraliza configurações de lint e formatter para projetos TypeScript, Javascript, React, Tailwind, Node, etc., promovendo:

- ✅ Consistência entre repositórios
- ✅ Manutenção centralizada
- ✅ Setup rápido e sem repetição

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
