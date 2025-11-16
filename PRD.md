# Do que se trata o projeto

- É um pacote NPM
- O projeto se trata de um hub de configurações de QA (linting, code style, utilizando vários pacotes, mas o meu favorito é o biomejs)
- O projeto se trata de um hub de configurações de assistentes de código (Gemini CLI, Claude Code, Cline, Roo, onde os meus favoritos são Claude Code e Gemini CLI), de forma a já vir configurado certinho pra já começar o projeto com os MCPs corretos e rodando apenas um comando como 'npx "@rueda.dev/config" setup' ele já configure automaticamente todos os arquivos .gemini, .claude, com os MCP servers configurados.
- Hub de MCPs para produtividade no desenvolvimento de aplicações, ou seja, é pra ter vários MCPs e ferramentas, como taskmaster por exemplo, já instaladas nessa config, para que, rodando simplesmente aquele comando de setup possa automaticamente já configurar todos os servers MCP, mesmo que haja API_KEYS nele, serão puxadas das variáveis de ambiente do sistema operacional.

# Funcionalidades que existem

- QA Biome
- Comando 'npx "@rueda.dev/config" setup' que configura o biome e o editor, pra auto-formatar ao salvar qualquer arquivo de projeto.
- Pasta de scripts, onde executa os scripts provenientes do comando de setup, que fariam o processo de escrever em arquivos biome.json existentes, ou criar esse arquivo com instruções padrão para extender de um biome.json da biblioteca npm.
- Já existe o comando setup, mas ele não está configurado para fazer o setup das ferramentas CLI de IA, apenas o linting e o vscode format on save.

# Funcionalidades que quero implementar

- Scripts para iniciar o gemini cli e o claude code, para configurar essas ferramentas com os servidores MCP apropriados, configurações padrão, etc. 

- Colocar na pasta config/code/.gemini/settings.json para o gemini, as configurações do Gemini CLI, e seguindo a mesma lógica para o claude code.

- De início seriam apenas o context7 e o taskmaster de MCPs para essas ferramentas de IA.

- Deve fazer um overthinking de mais configurações para colocar nesses settings.json dos CLIs assistentes de código.