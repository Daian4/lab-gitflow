# Explicação do Código e Procedimento de Rollback

> **Documento:** Análise Técnica Detalhada  
> **Data de Criação:** 2025-11-20  
> **Autor:** Análise de Engenharia

---

## 📋 Índice

1. [Explicação Passo a Passo do Código](#explicação-passo-a-passo-do-código)
2. [Análise de Rollback em Produção](#análise-de-rollback-em-produção)

---

## 🔍 Explicação Passo a Passo do Código

### 1. Função Principal: `index.js`

#### Código Analisado:
```javascript
function sum(a, b) {
    return a + b;
}

module.exports = { sum };
```

#### Explicação Detalhada:

##### **Linha 1: Declaração da Função**
```javascript
function sum(a, b) {
```

**O que acontece:**
- Declara uma função chamada `sum` que recebe dois parâmetros: `a` e `b`
- Em JavaScript, funções são objetos de primeira classe, podem ser atribuídas a variáveis e passadas como argumentos
- Os parâmetros `a` e `b` são variáveis locais ao escopo da função

**Por que funciona:**
- JavaScript utiliza tipagem dinâmica, então `a` e `b` podem ser de qualquer tipo
- A função aceita implicitamente qualquer valor que possa ser passado como argumento

##### **Linha 2: Operação de Soma**
```javascript
return a + b;
```

**O que acontece:**
- O operador `+` soma os valores de `a` e `b`
- `return` retorna o resultado da operação para quem chamou a função
- A execução da função termina imediatamente após o `return`

**Por que funciona:**
- Para números: O operador `+` realiza adição matemática
  - Exemplo: `sum(1, 2)` → `1 + 2` → `3`
- Para strings: O operador `+` realiza concatenação
  - Exemplo: `sum("Hello", " World")` → `"Hello" + " World"` → `"Hello World"`
- JavaScript realiza coerção de tipos automaticamente quando necessário

**Casos Especiais:**
```javascript
sum(1, 2)        // 3 (número + número)
sum("1", "2")    // "12" (string + string = concatenação)
sum(1, "2")      // "12" (número é convertido para string)
sum(null, 5)     // 5 (null é convertido para 0)
sum(undefined, 5) // NaN (undefined não pode ser convertido)
```

##### **Linha 5: Exportação do Módulo**
```javascript
module.exports = { sum };
```

**O que acontece:**
- `module.exports` é um objeto especial do Node.js que define o que será exportado do módulo
- `{ sum }` é uma sintaxe de shorthand ES6 equivalente a `{ sum: sum }`
- Cria um objeto com uma propriedade chamada `sum` que aponta para a função `sum`

**Por que funciona:**
- Node.js utiliza o sistema de módulos CommonJS
- Quando outro arquivo faz `require('./index.js')`, ele recebe o objeto `{ sum: [Function: sum] }`
- Isso permite importar a função em outros arquivos: `const { sum } = require('./index')`

**Alternativas equivalentes:**
```javascript
// Sintaxe completa
module.exports = { sum: sum };

// Exportar apenas a função
module.exports = sum;

// Exportar múltiplas funções
module.exports = { sum, subtract, multiply };
```

---

### 2. Arquivo de Teste: `sum.test.js`

#### Código Analisado:
```javascript
const { sum } = require('./index');

test('adds 1 + 2 to equal 3', () => {
  expect(sum(1, 2)).toBe(3);
});
```

#### Explicação Detalhada:

##### **Linha 1: Importação da Função**
```javascript
const { sum } = require('./index');
```

**O que acontece:**
- `require('./index')` carrega o módulo `index.js` do mesmo diretório
- `{ sum }` usa destructuring para extrair apenas a propriedade `sum` do objeto exportado
- `const` declara uma constante imutável

**Por que funciona:**
- Node.js resolve o caminho relativo `./index` para `./index.js`
- O sistema de módulos executa `index.js` e retorna o valor de `module.exports`
- Destructuring assignment permite extrair propriedades específicas do objeto

##### **Linha 3: Definição do Teste**
```javascript
test('adds 1 + 2 to equal 3', () => {
```

**O que acontece:**
- `test` é uma função global fornecida pelo Jest (framework de testes)
- Primeiro argumento: string descritiva do que o teste valida
- Segundo argumento: arrow function que contém a lógica do teste

**Por que funciona:**
- Jest registra este teste em sua suite de testes
- Quando executamos `npm test`, Jest procura todos os arquivos `.test.js`
- Jest executa cada função de teste e reporta sucesso ou falha

##### **Linha 4: Asserção do Teste**
```javascript
expect(sum(1, 2)).toBe(3);
```

**O que acontece:**
- `sum(1, 2)` executa a função e retorna `3`
- `expect()` cria um objeto de asserção Jest
- `.toBe(3)` é um matcher que verifica igualdade estrita (`===`)

**Por que funciona:**
- Jest compara o valor retornado com o valor esperado
- Se `sum(1, 2) === 3`, o teste passa ✅
- Se for diferente, Jest lança um erro e o teste falha ❌

**Fluxo de Execução:**
```
1. Jest encontra sum.test.js
2. Jest executa o arquivo
3. require('./index') carrega a função sum
4. test() registra o teste
5. Jest executa a arrow function
6. expect(sum(1, 2)) → expect(3)
7. .toBe(3) → 3 === 3 → true
8. Teste passa ✅
```

**Outros Matchers do Jest:**
```javascript
expect(sum(1, 2)).toBe(3);           // Igualdade estrita
expect(sum(1, 2)).toEqual(3);        // Igualdade profunda (objetos)
expect(sum(1, 2)).not.toBe(4);       // Negação
expect(sum(1, 2)).toBeGreaterThan(2); // Maior que
expect(() => sum()).toThrow();       // Lança erro
```

---

### 3. Script de Build: `scripts/build.js`

#### Código Analisado:
```javascript
const { mkdirSync, copyFileSync } = require('node:fs');
const { join } = require('node:path');

mkdirSync('dist', { recursive: true });
copyFileSync(join(__dirname, '..', 'index.js'), join('dist', 'index.js'));
console.log('📦  Arquivo copiado para dist/');
```

#### Explicação Detalhada:

##### **Linhas 1-2: Importação de Módulos Nativos**
```javascript
const { mkdirSync, copyFileSync } = require('node:fs');
const { join } = require('node:path');
```

**O que acontece:**
- `node:fs` é o módulo nativo do Node.js para operações de sistema de arquivos (File System)
- `mkdirSync`: função síncrona para criar diretórios
- `copyFileSync`: função síncrona para copiar arquivos
- `node:path`: módulo nativo para manipulação de caminhos de arquivos
- `join`: função para juntar segmentos de caminho de forma cross-platform

**Por que funciona:**
- O prefixo `node:` indica explicitamente que é um módulo nativo (Node.js 14.18.0+)
- Funções síncronas bloqueiam a execução até completarem (adequado para scripts de build)
- `path.join` cuida das diferenças entre Windows (`\`) e Unix (`/`)

##### **Linha 4: Criação do Diretório de Saída**
```javascript
mkdirSync('dist', { recursive: true });
```

**O que acontece:**
- Cria um diretório chamado `dist` no diretório atual
- `{ recursive: true }` permite criar diretórios pai se não existirem
- Se `dist` já existe, não lança erro

**Por que funciona:**
- Similar ao comando Unix `mkdir -p dist`
- `recursive: true` evita erro se o diretório já existir
- Operação síncrona garante que o diretório existe antes de prosseguir

**Sem recursive:**
```javascript
mkdirSync('dist/subdir'); // ❌ Erro se 'dist' não existir
mkdirSync('dist', { recursive: true }); // ✅ Cria ambos se necessário
```

##### **Linha 5: Cópia do Arquivo**
```javascript
copyFileSync(join(__dirname, '..', 'index.js'), join('dist', 'index.js'));
```

**O que acontece:**
- `__dirname`: variável global do Node.js com o caminho absoluto do diretório atual (`scripts/`)
- `join(__dirname, '..', 'index.js')`: constrói o caminho para `/caminho/completo/lab-gitflow/index.js`
- `join('dist', 'index.js')`: constrói o caminho de destino `dist/index.js`
- `copyFileSync()`: copia o arquivo do origem para destino

**Por que funciona:**
- O script está em `scripts/build.js`, então `__dirname` = `scripts/`
- `..` sobe um nível para a raiz do projeto
- `join()` garante que o caminho é válido em qualquer sistema operacional
- `copyFileSync()` lê o arquivo fonte e escreve no destino

**Caminho completo executado:**
```
Origem:  /home/runner/work/lab-gitflow/lab-gitflow/index.js
Destino: /home/runner/work/lab-gitflow/lab-gitflow/dist/index.js
```

##### **Linha 6: Feedback Visual**
```javascript
console.log('📦  Arquivo copiado para dist/');
```

**O que acontece:**
- Imprime mensagem de sucesso no terminal
- Emoji fornece feedback visual amigável
- Confirma que o build completou com sucesso

**Por que funciona:**
- `console.log()` escreve na saída padrão (stdout)
- Visível quando executamos `npm run build`
- Importante para debugging e CI/CD logs

---

### 4. Pipeline de CI/CD: `.github/workflows/realease.yml`

#### Estrutura Geral:
```yaml
name: Release Pipeline

on:
  push:
    tags: ["v*.*.*"]
  workflow_dispatch:
```

**O que acontece:**
- Define um workflow do GitHub Actions chamado "Release Pipeline"
- `on.push.tags`: aciona quando uma tag semântica é criada (ex: v1.0.0, v1.2.3)
- `workflow_dispatch`: permite execução manual via interface do GitHub

**Por que funciona:**
- GitHub Actions monitora eventos do repositório
- Quando detecta um push de tag com padrão `v*.*.*`, dispara o workflow
- Padrão glob `v*.*.*` casa com qualquer versionamento semântico

---

#### Job 1: Changelog

```yaml
jobs:
  changelog:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - name: Generate changelog
        id: cliff
        uses: orhun/git-cliff-action@v4
        with:
          args: --verbose --tag ${{ github.ref_name }}
        env:
          OUTPUT: CHANGELOG.md
      
      - name: Upload changelog artifact
        uses: actions/upload-artifact@v4
        with:
          name: changelog-md
          path: CHANGELOG.md
```

**O que acontece:**

1. **Checkout do Código:**
   - `actions/checkout@v4`: clona o repositório
   - `fetch-depth: 0`: baixa todo o histórico Git (necessário para gerar changelog)

2. **Geração do Changelog:**
   - `git-cliff-action`: ferramenta que analisa commits e gera changelog automaticamente
   - `--tag ${{ github.ref_name }}`: usa o nome da tag atual (ex: v1.1.0)
   - Lê commits desde a última tag até a tag atual
   - Gera arquivo `CHANGELOG.md` com base em Conventional Commits

3. **Upload como Artefato:**
   - `upload-artifact@v4`: salva o CHANGELOG.md como artefato do workflow
   - Permite que jobs subsequentes baixem e usem este arquivo

**Por que funciona:**
- Git Cliff analisa mensagens de commit (feat, fix, docs, etc.)
- Agrupa commits por tipo e gera changelog formatado
- Artefatos são armazenados temporariamente pelo GitHub Actions
- Jobs posteriores podem baixar estes artefatos

---

#### Job 2: Build e Testes

```yaml
build-test:
  needs: changelog
  strategy:
    matrix:
      os: [ubuntu-latest]
      node: [20]
  runs-on: ${{ matrix.os }}
  
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node }}
        cache: 'npm'
    - run: npm ci
    - run: npm test
    - run: npm run build
    - name: Upload artefatos
      uses: actions/upload-artifact@v4
      with:
        name: build-${{ runner.os }}-node${{ matrix.node }}
        path: dist/
```

**O que acontece:**

1. **Dependência:**
   - `needs: changelog`: só executa após o job `changelog` completar com sucesso

2. **Matriz de Build:**
   - `strategy.matrix`: define múltiplas combinações de ambiente
   - `os: [ubuntu-latest]`: SO onde executar
   - `node: [20]`: versão do Node.js
   - Permite testar em múltiplos ambientes simultaneamente

3. **Setup do Ambiente:**
   - `actions/checkout@v4`: clona o código
   - `actions/setup-node@v4`: instala Node.js versão 20
   - `cache: 'npm'`: cacheia dependências do npm para builds mais rápidos

4. **Build e Testes:**
   - `npm ci`: instala dependências usando package-lock.json (reproduzível)
   - `npm test`: executa Jest, falha se testes não passarem
   - `npm run build`: executa script de build

5. **Upload de Artefatos:**
   - Salva o diretório `dist/` como artefato
   - Nome: `build-ubuntu-latest-node20`

**Por que funciona:**
- Se `npm test` falhar, o job é interrompido e marcado como falha
- CI/CD garante que código quebrado não chega à produção
- Artefatos de build podem ser baixados para deploy ou debug
- Cache acelera builds subsequentes

---

#### Job 3: Release

```yaml
release:
  needs: build-test
  if: github.event_name == 'push'
  runs-on: ubuntu-latest
  
  steps:
    - uses: actions/checkout@v4
      with:
        fetch-depth: 0
    
    - name: Download artefatos
      uses: actions/download-artifact@v4
      with:
        path: artifacts/
    
    - name: Create Release
      uses: softprops/action-gh-release@v2
      with:
        body_path: artifacts/changelog-md/CHANGELOG.md
        files: artifacts/**/*
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

**O que acontece:**

1. **Dependências e Condições:**
   - `needs: build-test`: só executa se build e testes passarem
   - `if: github.event_name == 'push'`: só em push de tag (não em workflow_dispatch manual)

2. **Download de Artefatos:**
   - `download-artifact@v4`: baixa todos os artefatos gerados nos jobs anteriores
   - `path: artifacts/`: salva em diretório local `artifacts/`

3. **Criação da Release:**
   - `action-gh-release@v2`: cria uma GitHub Release oficial
   - `body_path`: usa CHANGELOG.md como descrição da release
   - `files: artifacts/**/*`: anexa todos os artefatos à release
   - `GITHUB_TOKEN`: token automático fornecido pelo GitHub Actions para autenticação

**Por que funciona:**
- GitHub Release é uma feature nativa do GitHub
- Associa a release à tag criada
- Usuários podem baixar artefatos diretamente da página de releases
- CHANGELOG é exibido como release notes

**Estrutura da Release:**
```
Release v1.1.0
├── CHANGELOG.md (como descrição)
├── Source code (zip)
├── Source code (tar.gz)
└── Artefatos anexados:
    └── build-ubuntu-latest-node20/
        └── index.js
```

---

#### Job 4: Deploy

```yaml
deploy:
  needs: release
  runs-on: ubuntu-latest
  steps:
    - name: Fake deploy
      run: echo "🚀 Deploy realizado a partir da release ${{ github.ref_name }}"
```

**O que acontece:**
- `needs: release`: só executa após release ser criada com sucesso
- Atualmente é um deploy "fake" que apenas imprime uma mensagem
- Em produção real, executaria comandos para deployar (SSH, kubectl, etc.)

**Por que funciona:**
- É um placeholder para demonstração
- Em ambiente real, substituiria por:
  ```yaml
  - name: Deploy to production
    run: |
      ssh user@server 'cd /app && git pull && npm ci && npm run build && pm2 restart app'
  ```

---

### 5. Fluxo Completo de Execução

#### Cenário: Developer faz deploy da versão 1.1.0

**Passo 1: Preparação Local**
```bash
# Developer está em develop
git checkout develop
git pull origin develop

# Cria release branch
git checkout -b release/1.1.0

# Atualiza versão
npm version 1.1.0 --no-git-tag-version

# Commit e push
git add package.json package-lock.json
git commit -m "chore(release): bump version to 1.1.0"
git push origin release/1.1.0
```

**O que acontece:**
- Código local é sincronizado
- Nova branch de release é criada
- Versão no package.json é incrementada
- Mudanças são enviadas ao GitHub

**Passo 2: Pull Request e Review**
```
GitHub Web:
- Criar PR de release/1.1.0 → main
- Code review
- CI/CD executa testes automaticamente
- Aprovação e merge
```

**O que acontece:**
- PR é criada via interface web
- CI/CD roda testes antes de permitir merge
- Reviewer valida mudanças
- Merge integra release em main

**Passo 3: Criação da Tag**
```bash
git checkout main
git pull origin main

# Cria tag anotada
git tag -a v1.1.0 -m "Release version 1.1.0"

# Push da tag (TRIGGER DO CI/CD)
git push origin v1.1.0
```

**O que acontece:**
- Push da tag `v1.1.0` dispara o workflow
- GitHub Actions detecta o evento `push.tags`
- Workflow "Release Pipeline" inicia

**Passo 4: Execução do CI/CD**

```
[Job 1: changelog] ✅
├── Checkout código (com histórico completo)
├── Gera CHANGELOG.md analisando commits
└── Upload CHANGELOG como artefato

[Job 2: build-test] ✅
├── Aguarda changelog completar
├── Setup Node.js 20
├── npm ci (instala dependências)
├── npm test (testa código)
├── npm run build (gera dist/)
└── Upload dist/ como artefato

[Job 3: release] ✅
├── Aguarda build-test completar
├── Download de todos os artefatos
├── Cria GitHub Release v1.1.0
│   ├── Anexa CHANGELOG.md
│   └── Anexa dist/index.js
└── Publica release

[Job 4: deploy] ✅
├── Aguarda release completar
└── Executa deploy (atualmente fake)
```

**O que acontece:**
- Jobs executam sequencialmente devido a `needs`
- Se qualquer job falhar, os subsequentes não executam
- Artefatos são transferidos entre jobs
- Release final é publicada no GitHub

**Passo 5: Validação**
```bash
# Verificar release foi criada
# Acessar: https://github.com/Daian4/lab-gitflow/releases/tag/v1.1.0

# Verificar em produção (se deploy real)
curl https://production-url/version
# {"version": "1.1.0"}
```

---

### 6. Por Que Este Código Funciona: Resumo

1. **Simplicidade:**
   - Função `sum` é deliberadamente simples para demonstrar conceitos
   - Foco está no processo, não na complexidade da lógica

2. **Modularidade:**
   - Código separado em módulos (index.js, sum.test.js, build.js)
   - Cada módulo tem responsabilidade única
   - Sistema de módulos CommonJS permite importação/exportação

3. **Testabilidade:**
   - Jest fornece framework robusto para testes
   - Testes validam comportamento esperado
   - CI/CD garante que testes passem antes de deploy

4. **Automação:**
   - GitHub Actions automatiza todo o pipeline
   - Reduz erro humano
   - Garante consistência entre deploys

5. **Rastreabilidade:**
   - Tags Git marcam versões específicas
   - CHANGELOG documenta mudanças
   - GitHub Releases centralizam artefatos

6. **Padrões da Indústria:**
   - Versionamento semântico (v1.2.3)
   - Conventional Commits (feat, fix, docs)
   - Git Flow (main, develop, release branches)
   - CI/CD (testes automáticos, build, deploy)

---

## 🔄 Análise de Rollback em Produção

### 1. Contexto: O que é Rollback?

**Definição:**
Rollback é o processo de reverter a aplicação em produção para uma versão anterior estável quando a versão atual apresenta problemas críticos.

**Quando Realizar Rollback:**
- Taxa de erro > 5% após deploy
- Funcionalidade crítica quebrada
- Performance degradada significativamente (> 50% mais lento)
- Dados corrompidos ou perda de dados
- Impossibilidade de acessar o sistema
- Vulnerabilidade de segurança descoberta

**Princípios Fundamentais:**
1. **Velocidade:** Minimizar tempo de downtime
2. **Segurança:** Não introduzir novos problemas
3. **Rastreabilidade:** Documentar todas as ações
4. **Comunicação:** Notificar stakeholders

---

### 2. Estratégias de Rollback

#### Estratégia 1: Rollback via Git Tag (Mais Comum)

**Como funciona:**
- Utiliza tags Git para identificar versões específicas
- Reverte o código para a última tag conhecida como estável
- Aciona novo deploy através do CI/CD

**Vantagens:**
- ✅ Utiliza infraestrutura existente (Git + CI/CD)
- ✅ Rastreável e auditável
- ✅ Pode ser automatizado
- ✅ Consistente com fluxo de deploy normal

**Desvantagens:**
- ❌ Depende do GitHub Actions estar disponível
- ❌ Leva tempo para CI/CD executar (minutos)
- ❌ Não é instantâneo

**Passo a Passo:**

```bash
# 1. Identificar última versão estável
git tag -l --sort=-version:refname | head -5
# Output:
# v1.1.0 (atual, com problemas)
# v1.0.9 (última estável)
# v1.0.8
# v1.0.7

# 2. Criar hotfix branch a partir da versão estável
git checkout v1.0.9
git checkout -b hotfix/rollback-to-1.0.9

# 3. Atualizar main para versão anterior
git checkout main
git reset --hard v1.0.9

# 4. Forçar push (CUIDADO: isso reescreve histórico)
git push --force origin main

# 5. Criar nova tag para acionar deploy
git tag -a v1.1.1 -m "Rollback to v1.0.9 due to critical bug in v1.1.0"
git push origin v1.1.1

# 6. CI/CD detecta nova tag e faz deploy da versão estável
```

**Fluxo do CI/CD:**
```
Tag v1.1.1 pushed
  ↓
GitHub Actions detecta
  ↓
Executa workflow:
  ├── Testes (validam v1.0.9 funciona)
  ├── Build
  └── Deploy
  ↓
Produção volta para v1.0.9
```

**Timeline:**
```
T+0min:  Problema detectado em v1.1.0
T+2min:  Decisão de fazer rollback
T+3min:  Comandos Git executados, tag pushed
T+4min:  CI/CD iniciado
T+8min:  Testes e build completados
T+10min: Deploy concluído, v1.0.9 em produção
```

---

#### Estratégia 2: Rollback Manual via SSH (Emergencial)

**Como funciona:**
- Conecta diretamente ao servidor de produção
- Reverte o código manualmente
- Reinicia a aplicação

**Vantagens:**
- ✅ Mais rápido (poucos minutos)
- ✅ Independente de serviços externos
- ✅ Útil quando GitHub está indisponível
- ✅ Controle total do processo

**Desvantagens:**
- ❌ Alto risco de erro humano
- ❌ Não automatizado
- ❌ Requer acesso direto ao servidor
- ❌ Difícil de auditar

**Passo a Passo:**

```bash
# 1. Conectar ao servidor de produção
ssh user@production-server

# 2. Navegar para diretório da aplicação
cd /app/lab-gitflow

# 3. Verificar versão atual
git describe --tags
# v1.1.0 (problemática)

# 4. Parar a aplicação
pm2 stop lab-gitflow
# ou: systemctl stop lab-gitflow

# 5. Fazer backup da versão atual (segurança)
cp -r /app/lab-gitflow /app/lab-gitflow.backup.$(date +%Y%m%d%H%M%S)

# 6. Buscar atualizações do repositório
git fetch --all --tags

# 7. Verificar tags disponíveis
git tag -l --sort=-version:refname | head -5

# 8. Reverter para versão estável
git checkout v1.0.9

# 9. Reinstalar dependências (caso tenham mudado)
npm ci

# 10. Rebuild da aplicação
npm run build

# 11. Reiniciar aplicação
pm2 restart lab-gitflow
# ou: systemctl restart lab-gitflow

# 12. Verificar logs em tempo real
pm2 logs lab-gitflow --lines 50

# 13. Validar aplicação está funcionando
curl http://localhost:3000/health
curl http://localhost:3000/version
# Deve retornar: {"version": "1.0.0"}
```

**Timeline:**
```
T+0min:  Problema detectado
T+1min:  Decisão de rollback manual
T+2min:  SSH conectado, aplicação parada
T+3min:  Código revertido para v1.0.9
T+4min:  npm ci concluído
T+5min:  Build concluído
T+6min:  Aplicação reiniciada
T+7min:  Validação OK, rollback concluído
```

---

#### Estratégia 3: Rollback via Rerun do GitHub Actions

**Como funciona:**
- Encontra o workflow da versão estável anterior
- Executa novamente o deploy sem mudar código

**Vantagens:**
- ✅ Muito rápido (poucos cliques)
- ✅ Sem necessidade de comandos Git
- ✅ Utiliza código já testado
- ✅ Fácil para operadores menos técnicos

**Desvantagens:**
- ❌ Só funciona se workflow anterior ainda existir
- ❌ Limitado a workflows dos últimos 90 dias
- ❌ Depende do GitHub estar disponível

**Passo a Passo:**

1. **Acessar GitHub Actions:**
   - Ir para: https://github.com/Daian4/lab-gitflow/actions

2. **Localizar Workflow da Versão Estável:**
   - Filtrar por "Release Pipeline"
   - Encontrar workflow da tag `v1.0.9`
   - Verificar que todos os jobs passaram ✅

3. **Re-executar Workflow:**
   - Clicar nos "..." (três pontos) no canto superior direito
   - Selecionar "Re-run all jobs"
   - Confirmar

4. **Monitorar Execução:**
   - Acompanhar progresso em tempo real
   - Validar que todos os jobs passam
   - Confirmar deploy executado

5. **Validar em Produção:**
   ```bash
   curl https://production-url/version
   # {"version": "1.0.0"}
   ```

**Timeline:**
```
T+0min:  Problema detectado
T+1min:  Acessar GitHub Actions
T+2min:  Localizar workflow v1.0.9
T+3min:  Clicar em "Re-run all jobs"
T+4min:  Workflow iniciado
T+10min: Deploy concluído, v1.0.9 em produção
```

---

### 3. Matriz de Decisão: Qual Estratégia Usar?

| Cenário | Estratégia Recomendada | Tempo Estimado | Justificativa |
|---------|------------------------|----------------|---------------|
| **GitHub disponível, problema não crítico** | Rollback via Git Tag | 10-15 min | Mais seguro e rastreável |
| **GitHub disponível, problema crítico** | Rollback via SSH | 5-7 min | Mais rápido, menor downtime |
| **GitHub indisponível** | Rollback via SSH | 5-7 min | Única opção |
| **Workflow recente disponível** | Rerun do Workflow | 8-12 min | Mais simples, menos erro |
| **Equipe inexperiente** | Rerun do Workflow | 8-12 min | Reduz risco de erro humano |
| **Múltiplos servidores** | Rollback via Git Tag | 10-15 min | Garante consistência |

---

### 4. Checklist de Rollback

#### Antes do Rollback:
- [ ] Confirmar que problema é crítico e justifica rollback
- [ ] Identificar versão estável anterior (ex: v1.0.9)
- [ ] Notificar stakeholders sobre rollback iminente
- [ ] Documentar problema encontrado (logs, métricas, screenshots)
- [ ] Verificar que versão anterior realmente está estável

#### Durante o Rollback:
- [ ] Seguir procedimento escolhido passo a passo
- [ ] Monitorar logs em tempo real
- [ ] Validar cada etapa antes de prosseguir
- [ ] Manter comunicação com equipe

#### Após o Rollback:
- [ ] Validar aplicação está funcionando corretamente
- [ ] Confirmar versão correta em produção
- [ ] Verificar métricas voltaram ao normal
- [ ] Notificar stakeholders sobre conclusão
- [ ] Documentar incidente completo
- [ ] Agendar post-mortem para análise de causa raiz
- [ ] Planejar correção do bug para próximo deploy

---

### 5. Validações Pós-Rollback

#### 1. Validação de Versão:
```bash
# Via API (se disponível)
curl https://production-url/version
# Esperado: {"version": "1.0.0"}

# Via Git no servidor
ssh user@production-server 'cd /app/lab-gitflow && git describe --tags'
# Esperado: v1.0.9

# Via logs da aplicação
ssh user@production-server 'pm2 logs lab-gitflow --lines 10 | grep version'
```

#### 2. Validação de Funcionalidade:
```bash
# Health check
curl -I https://production-url/health
# Esperado: HTTP/1.1 200 OK

# Endpoint principal
curl https://production-url/api/sum?a=2&b=3
# Esperado: {"result": 5}

# Teste de carga básico
ab -n 1000 -c 10 https://production-url/health
# Verificar taxa de sucesso: 100%
```

#### 3. Validação de Métricas:
```bash
# Taxa de erro deve estar < 0.1%
# Latência p95 deve estar < 200ms
# CPU e memória dentro do normal
# Nenhum alerta ativo

# Via monitoring dashboard
# - Verificar gráficos voltaram ao normal
# - Confirmar nenhum alerta disparado
# - Validar tráfego está sendo processado
```

#### 4. Validação de Logs:
```bash
# Verificar não há erros críticos
ssh user@production-server 'tail -100 /var/log/lab-gitflow/error.log'

# Verificar aplicação iniciou corretamente
ssh user@production-server 'journalctl -u lab-gitflow --since "5 minutes ago"'
```

---

### 6. Exemplo Real: Rollback Passo a Passo

**Cenário:**
- Deploy de v1.1.0 completado às 14:00
- Às 14:15, taxa de erro sobe de 0.1% para 8%
- Usuários reportam que função sum está retornando valores incorretos
- Decisão: realizar rollback para v1.0.9

**Execução (Estratégia: Rollback via Git Tag):**

```bash
# T+0min (14:15): Problema detectado
# Engenheiro verifica logs e confirma problema

# T+2min (14:17): Decisão de rollback tomada
# Notificação enviada para stakeholders

# T+3min (14:18): Inicio do rollback
git tag -l --sort=-version:refname | head -5
# v1.1.0 (problemática)
# v1.0.9 (estável)

# T+4min (14:19): Criar nova tag apontando para código estável
git checkout v1.0.9
git tag -a v1.1.1 -m "Hotfix: Rollback to v1.0.9 - Critical bug in sum function"
git push origin v1.1.1

# T+5min (14:20): GitHub Actions inicia workflow
# Changelog gerado
# Testes executados (passam com v1.0.9)
# Build executado

# T+10min (14:25): Deploy concluído
# Aplicação reiniciada em produção com v1.0.9

# T+11min (14:26): Validação
curl https://production-url/version
# {"version": "1.0.0"} ✅

curl https://production-url/api/sum?a=2&b=3
# {"result": 5} ✅

# T+15min (14:30): Monitoramento
# Taxa de erro: 0.1% (voltou ao normal) ✅
# Latência: 120ms p95 (normal) ✅
# Alertas: nenhum ativo ✅

# T+20min (14:35): Conclusão
# Notificação enviada: "Rollback concluído com sucesso"
# Incidente documentado
# Post-mortem agendado para próximo dia
```

**Resultado:**
- Downtime total: ~5 minutos (tempo de deploy)
- Tempo até resolução: 20 minutos
- Usuários afetados: minimizado devido à rápida resposta
- Sistema voltou ao estado estável

---

### 7. Prevenção: Como Evitar Rollbacks

#### 1. Testes Abrangentes:
```javascript
// sum.test.js - Adicionar mais casos de teste
test('adds 1 + 2 to equal 3', () => {
  expect(sum(1, 2)).toBe(3);
});

test('adds negative numbers', () => {
  expect(sum(-1, -2)).toBe(-3);
});

test('adds zero', () => {
  expect(sum(0, 5)).toBe(5);
});

test('adds large numbers', () => {
  expect(sum(1000000, 2000000)).toBe(3000000);
});

test('handles floating point', () => {
  expect(sum(0.1, 0.2)).toBeCloseTo(0.3);
});
```

#### 2. Staging Environment:
```yaml
# .github/workflows/deploy-staging.yml
name: Deploy to Staging

on:
  push:
    branches: [release/*]

jobs:
  deploy-staging:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm test
      - run: npm run build
      - name: Deploy to staging
        run: |
          # Deploy para ambiente de staging
          ssh user@staging-server 'cd /app && git pull && npm ci && npm run build && pm2 restart app'
```

#### 3. Smoke Tests Automatizados:
```yaml
# Adicionar ao workflow após deploy
- name: Smoke tests
  run: |
    sleep 10  # Aguardar aplicação iniciar
    curl -f https://production-url/health || exit 1
    curl -f https://production-url/version || exit 1
    result=$(curl -s https://production-url/api/sum?a=2&b=3)
    echo $result | grep -q '"result":5' || exit 1
```

#### 4. Feature Flags:
```javascript
// index.js com feature flag
const useNewSum = process.env.FEATURE_NEW_SUM === 'true';

function sumOld(a, b) {
  return a + b;
}

function sumNew(a, b) {
  // Nova implementação
  return Number(a) + Number(b);
}

function sum(a, b) {
  return useNewSum ? sumNew(a, b) : sumOld(a, b);
}

module.exports = { sum };
```

#### 5. Canary Deployment:
```yaml
# Deploy gradual
# Fase 1: 10% do tráfego para v1.1.0
# Fase 2: Se métricas OK, 50% do tráfego
# Fase 3: Se métricas OK, 100% do tráfego
# Se qualquer fase falhar, rollback automático
```

#### 6. Monitoring e Alertas:
```yaml
# Configurar alertas proativos
alerts:
  - name: High error rate
    condition: error_rate > 5%
    action: notify_on_call
  
  - name: High latency
    condition: p95_latency > 500ms
    action: notify_on_call
  
  - name: Low availability
    condition: uptime < 99%
    action: notify_on_call
```

---

### 8. Conclusão: Engenheiro e Rollback

**Como um engenheiro realiza rollback em produção:**

1. **Detecção Rápida:**
   - Monitora métricas continuamente
   - Recebe alertas automatizados
   - Valida reports de usuários

2. **Decisão Informada:**
   - Avalia severidade do problema
   - Considera impacto vs. tempo de correção
   - Decide entre rollback, hotfix ou forward-fix

3. **Execução Controlada:**
   - Escolhe estratégia adequada ao contexto
   - Segue procedimento documentado (runbook)
   - Mantém comunicação constante

4. **Validação Rigorosa:**
   - Verifica versão correta em produção
   - Testa funcionalidades críticas
   - Confirma métricas voltaram ao normal

5. **Documentação Completa:**
   - Registra todo o incidente
   - Documenta causa raiz
   - Planeja melhorias para evitar recorrência

6. **Aprendizado Contínuo:**
   - Realiza post-mortem sem culpa
   - Identifica falhas no processo
   - Implementa melhorias sistêmicas

**Habilidades Necessárias:**
- Conhecimento profundo de Git e Git Flow
- Experiência com CI/CD e GitHub Actions
- Familiaridade com SSH e administração de servidores
- Capacidade de tomar decisões sob pressão
- Habilidade de comunicação clara
- Mentalidade de aprendizado contínuo

**Ferramentas Utilizadas:**
- Git (tags, branches, checkout, reset)
- GitHub Actions (workflows, reruns)
- SSH (acesso remoto a servidores)
- PM2 ou systemctl (gerenciamento de processos)
- curl (validação de endpoints)
- Monitoring (Prometheus, Grafana, Datadog, etc.)
- Logging (ELK stack, CloudWatch, etc.)

---

## 📚 Referências

1. **Git Flow:**
   - https://nvie.com/posts/a-successful-git-branching-model/

2. **Semantic Versioning:**
   - https://semver.org/

3. **GitHub Actions:**
   - https://docs.github.com/en/actions

4. **Conventional Commits:**
   - https://www.conventionalcommits.org/

5. **Runbook Relacionado:**
   - [RB-001: Deploy Manual](./runbooks/RB-001-deploy-manual.md)
   - [RB-002: Backup](./runbooks/RB-002-backup.md)
   - [RB-003: Restauração](./runbooks/RB-003-restauracao.md)

---

**Documento preparado por:** Análise de Engenharia  
**Data:** 2025-11-20  
**Versão:** 1.0.0
