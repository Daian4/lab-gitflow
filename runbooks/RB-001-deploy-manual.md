# RB-001: Deploy Manual em Produção

> **ID:** RB-001  
> **Versão:** 1.0.0  
> **Data de Criação:** 2025-11-11  
> **Última Atualização:** 2025-11-11  
> **Autor:** Equipe de Operações  
> **Responsável:** Tech Lead

---

## 🎯 Objetivo

Este runbook documenta o procedimento completo para realizar deploy manual da aplicação `lab-gitflow` em ambiente de produção seguindo as práticas de Git Flow. O procedimento garante:

- Deployment seguro e controlado do código em produção
- Versionamento semântico correto com tags Git
- Execução de testes e build antes da publicação
- Rastreabilidade completa das mudanças
- Minimização de downtime e riscos operacionais

---

## 📋 Pré-requisitos

### Permissões Necessárias
- [ ] Acesso SSH ao servidor de produção
- [ ] Permissões de push na branch `main` do repositório
- [ ] Permissões para criar tags e releases no GitHub
- [ ] Acesso ao sistema de CI/CD (GitHub Actions)

### Ferramentas Requeridas
- [ ] Git versão 2.30 ou superior
- [ ] Node.js versão 18.x ou superior
- [ ] npm versão 9.x ou superior
- [ ] Acesso à linha de comando (bash/zsh)
- [ ] Cliente SSH configurado

### Conhecimentos Prévios
- Familiaridade com Git Flow (branches main, develop, release)
- Entendimento de versionamento semântico (MAJOR.MINOR.PATCH)
- Experiência com comandos Git básicos e avançados
- Conhecimento do ambiente de produção

### Validações Iniciais
```bash
# Verificar versão do Git
git --version
# Esperado: git version 2.30.0 ou superior

# Verificar versão do Node.js
node --version
# Esperado: v18.x.x ou superior

# Verificar versão do npm
npm --version
# Esperado: 9.x.x ou superior

# Verificar acesso ao repositório
git remote -v
# Esperado: origin apontando para github.com/Daian4/lab-gitflow
```

---

## 🔍 Análise de Opções

### Opção 1: Deploy Automático via GitHub Actions

**Descrição:**
- Utilizar pipeline de CI/CD configurado no GitHub Actions
- Trigger automático ao criar tag na branch main
- Executa testes, build e deploy automaticamente

**Prós:**
- ✅ Processo totalmente automatizado
- ✅ Reduz erro humano
- ✅ Logs centralizados no GitHub Actions
- ✅ Rollback mais rápido através de rerun
- ✅ Notificações automáticas de status

**Contras:**
- ❌ Dependência da disponibilidade do GitHub
- ❌ Menor controle granular em situações específicas
- ❌ Pode ser mais lento em casos de urgência
- ❌ Custos de minutos de CI/CD

### Opção 2: Deploy Manual via SSH

**Descrição:**
- Conectar diretamente ao servidor de produção
- Fazer pull do código e executar build/restart manualmente
- Controle total sobre cada etapa do processo

**Prós:**
- ✅ Controle total do processo
- ✅ Útil em emergências ou problemas de rede
- ✅ Possibilidade de debug em tempo real
- ✅ Independente de serviços externos

**Contras:**
- ❌ Alto risco de erro humano
- ❌ Não padronizado entre diferentes operadores
- ❌ Difícil rastreabilidade
- ❌ Falta de validações automáticas
- ❌ Processo mais demorado

### Opção 3: Deploy Híbrido (Manual com Automação)

**Descrição:**
- Preparação manual seguindo Git Flow
- Criação de release branch e tag manual
- Automação através de CI/CD para deploy efetivo
- Validações manuais antes e depois

**Prós:**
- ✅ Balanceamento entre controle e automação
- ✅ Validações críticas mantidas manuais
- ✅ Deploy consistente via automação
- ✅ Boa rastreabilidade
- ✅ Flexibilidade em situações especiais

**Contras:**
- ❌ Requer mais passos que deploy totalmente automático
- ❌ Curva de aprendizado maior
- ❌ Possibilidade de erro nas etapas manuais

### ⭐ Opção Escolhida: Opção 3 - Deploy Híbrido

**Justificativa:**
- Oferece melhor balanceamento entre segurança e eficiência
- Mantém controle humano nas decisões críticas (quando fazer deploy, qual versão)
- Aproveita automação para passos repetitivos e propensos a erro
- Adequado para equipes pequenas com necessidade de rastreabilidade
- Alinha-se com as práticas de Git Flow já implementadas no projeto
- Permite validação antes do deploy efetivo

---

## 📊 Análise de Impacto

### Sistemas Afetados
| Sistema | Tipo de Impacto | Severidade | Observações |
|---------|-----------------|------------|-------------|
| Aplicação Web | Downtime durante restart | Alta | ~2-5 minutos de indisponibilidade |
| API Endpoints | Indisponibilidade temporária | Alta | Mesma janela da aplicação |
| Banco de Dados | Nenhum (sem migrations neste caso) | Baixa | Apenas queries de leitura afetadas |
| Cache/CDN | Invalidação necessária | Média | Pode haver dados obsoletos |

### Estimativas de Tempo
- **Preparação:** 10-15 minutos (validações, branch release)
- **Execução:** 5-10 minutos (merge, tag, CI/CD)
- **Validação:** 10-15 minutos (testes, smoke tests)
- **Total:** 25-40 minutos

### Janela de Manutenção
- **Horário recomendado:** Terça a Quinta, 22h-02h (horário de menor tráfego)
- **Duração necessária:** 1 hora (incluindo margem de segurança)
- **Notificação prévia:** 24-48 horas de antecedência para stakeholders

### Riscos Identificados

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Falha em testes automatizados | Média | Alto | Executar testes localmente antes; CI/CD bloqueia merge se falhar |
| Conflitos de merge não detectados | Baixa | Alto | Code review obrigatório; testar branch release antes de merge |
| Downtime prolongado | Baixa | Crítico | Ter plano de rollback pronto; executar em horário de baixo tráfego |
| Problemas de compatibilidade | Média | Médio | Staging environment para testes prévios |
| Erro humano na execução | Média | Médio | Checklist rigoroso; pair programming durante deploy |

---

## 📝 Procedimento Passo a Passo

### Fase 1: Preparação e Validação

#### Passo 1.1: Verificar Estado do Repositório
**Objetivo:** Garantir que o repositório está sincronizado e sem mudanças pendentes

**Comandos:**
```bash
# Navegar para o diretório do projeto
cd /caminho/para/lab-gitflow

# Verificar status local
git status

# Atualizar branches
git fetch --all --prune

# Verificar branches disponíveis
git branch -a
```

**Resultado Esperado:**
```
On branch develop
Your branch is up to date with 'origin/develop'.
nothing to commit, working tree clean
```

**Validação:**
- [ ] Working tree está limpo (sem modificações não commitadas)
- [ ] Branch atual é `develop`
- [ ] Repositório está sincronizado com origin

**Se houver erro:**
- Consulte seção [Troubleshooting - Erro 1](#problema-1-mudanças-não-commitadas)

---

#### Passo 1.2: Executar Testes Localmente
**Objetivo:** Validar que o código em develop está funcional antes de criar release

**Comandos:**
```bash
# Instalar dependências (garantir versões corretas)
npm ci

# Executar suite de testes
npm test

# Executar build
npm run build
```

**Resultado Esperado:**
```
✓ adds 1 + 2 to equal 3 (2 ms)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total

📦  Arquivo copiado para dist/
```

**Validação:**
- [ ] Todos os testes passaram sem erros
- [ ] Build completou com sucesso
- [ ] Nenhum warning crítico reportado

**Se houver erro:**
- Consulte seção [Troubleshooting - Erro 2](#problema-2-falha-nos-testes)

---

#### Passo 1.3: Determinar Nova Versão
**Objetivo:** Definir o número da versão seguindo versionamento semântico

**Comandos:**
```bash
# Verificar última tag/versão
git tag --list --sort=-version:refname | head -n 5

# Ou verificar no package.json
cat package.json | grep version
```

**Resultado Esperado:**
```
v1.0.9
v1.0.8
v1.0.7
```

**Decisão de Versionamento:**
- **MAJOR (X.0.0):** Mudanças incompatíveis com versões anteriores
- **MINOR (1.X.0):** Nova funcionalidade compatível com versões anteriores
- **PATCH (1.0.X):** Correções de bugs compatíveis

**Exemplo:** Se última versão é `v1.0.9` e estamos adicionando um runbook (nova feature):
- Nova versão será: `v1.1.0`

**Validação:**
- [ ] Nova versão definida conforme tipo de mudança
- [ ] Versão segue padrão semântico
- [ ] Não há conflito com tags existentes

---

### Fase 2: Criação da Release Branch

#### Passo 2.1: Criar Release Branch
**Objetivo:** Criar branch de release a partir de develop

**⚠️ ATENÇÃO:** A partir deste ponto, não fazer commits em develop até finalizar o deploy

**Comandos:**
```bash
# Garantir que está em develop atualizado
git checkout develop
git pull origin develop

# Criar release branch (exemplo para versão 1.1.0)
git checkout -b release/1.1.0

# Verificar que está na branch correta
git branch --show-current
```

**Resultado Esperado:**
```
Switched to a new branch 'release/1.1.0'
release/1.1.0
```

**Validação:**
- [ ] Branch criada com nome correto (release/X.Y.Z)
- [ ] Branch baseada no develop atualizado
- [ ] Working tree limpo

---

#### Passo 2.2: Atualizar Versão no package.json
**Objetivo:** Incrementar versão no arquivo de configuração

**Comandos:**
```bash
# Atualizar versão usando npm (recomendado)
npm version 1.1.0 --no-git-tag-version

# Ou editar manualmente
# vim package.json
# Alterar linha: "version": "1.1.0"

# Verificar mudança
git diff package.json
```

**Resultado Esperado:**
```diff
-  "version": "1.0.0",
+  "version": "1.1.0",
```

**Validação:**
- [ ] Versão atualizada corretamente
- [ ] Apenas linha de version foi modificada
- [ ] Formato JSON mantido válido

---

#### Passo 2.3: Commit e Push da Release Branch
**Objetivo:** Versionar a mudança de versão e disponibilizar para review

**Comandos:**
```bash
# Adicionar mudança
git add package.json package-lock.json

# Commit seguindo conventional commits
git commit -m "chore(release): bump version to 1.1.0"

# Push da release branch
git push origin release/1.1.0
```

**Resultado Esperado:**
```
[release/1.1.0 abc1234] chore(release): bump version to 1.1.0
 2 files changed, 3 insertions(+), 3 deletions(-)
```

**Validação:**
- [ ] Commit criado com mensagem apropriada
- [ ] Branch pushed para origin
- [ ] Confirmação no GitHub

---

### Fase 3: Merge e Tagging

#### Passo 3.1: Criar Pull Request para Main
**Objetivo:** Iniciar processo de merge formal com review

**Ações Manuais (via GitHub Web):**
1. Acessar https://github.com/Daian4/lab-gitflow
2. Clicar em "Pull Requests" > "New Pull Request"
3. Base: `main` | Compare: `release/1.1.0`
4. Título: "Release v1.1.0 - [Descrição breve]"
5. Descrição: Listar principais mudanças
6. Assignees: Adicionar revisores
7. Labels: `release`
8. Create Pull Request

**Validação:**
- [ ] PR criado com informações completas
- [ ] CI/CD executando automaticamente
- [ ] Nenhum conflito de merge detectado

---

#### Passo 3.2: Aguardar Aprovação e Merge
**Objetivo:** Garantir code review e aprovação antes do merge

**Checklist de Revisão:**
- [ ] Todos os checks do CI/CD passaram (testes, build)
- [ ] Code review completado por pelo menos 1 reviewer
- [ ] Nenhum comentário bloqueante pendente
- [ ] Versão correta no package.json

**Comandos (após aprovação):**
```bash
# Opção 1: Merge via GitHub Web Interface (recomendado)
# Clicar em "Merge Pull Request" > "Merge"

# Opção 2: Merge via linha de comando
git checkout main
git pull origin main
git merge --no-ff release/1.1.0 -m "Merge release/1.1.0 into main"
git push origin main
```

**Validação:**
- [ ] Merge completado com sucesso
- [ ] Main atualizada no GitHub
- [ ] Histórico de commits preservado

---

#### Passo 3.3: Criar Tag de Versão
**Objetivo:** Marcar o ponto exato da release no histórico Git

**Comandos:**
```bash
# Garantir que está em main atualizada
git checkout main
git pull origin main

# Criar tag anotada
git tag -a v1.1.0 -m "Release version 1.1.0

- Adicionados runbooks operacionais
- Documentação de procedimentos de deploy, backup e restauração
- Melhorias na rastreabilidade de operações"

# Verificar tag criada
git tag -l v1.1.0
git show v1.1.0

# Push da tag
git push origin v1.1.0
```

**Resultado Esperado:**
```
Total 0 (delta 0), reused 0 (delta 0), pack-reused 0
To github.com:Daian4/lab-gitflow.git
 * [new tag]         v1.1.0 -> v1.1.0
```

**Validação:**
- [ ] Tag criada localmente
- [ ] Tag pushed para GitHub
- [ ] Tag visível no repositório remoto

---

#### Passo 3.4: Merge de Volta para Develop
**Objetivo:** Sincronizar mudanças de volta para develop

**Comandos:**
```bash
# Checkout develop
git checkout develop
git pull origin develop

# Merge da release branch
git merge --no-ff release/1.1.0 -m "Merge release/1.1.0 into develop"

# Push
git push origin develop

# Deletar release branch (opcional, após confirmação)
git branch -d release/1.1.0
git push origin --delete release/1.1.0
```

**Validação:**
- [ ] Develop atualizada com mudanças da release
- [ ] Push completado
- [ ] Release branch deletada (se aplicável)

---

### Fase 4: Deploy Efetivo

#### Passo 4.1: Verificar Execução do CI/CD
**Objetivo:** Confirmar que o pipeline de deploy foi acionado pela tag

**Ações:**
1. Acessar GitHub Actions: https://github.com/Daian4/lab-gitflow/actions
2. Localizar workflow acionado pela tag v1.1.0
3. Acompanhar execução em tempo real

**Validação:**
- [ ] Workflow iniciado automaticamente
- [ ] Etapa de testes passou
- [ ] Etapa de build passou
- [ ] Etapa de deploy iniciou

**Se houver erro:**
- Consulte seção [Troubleshooting - Erro 3](#problema-3-falha-no-cicd)

---

#### Passo 4.2: Monitorar Deploy
**Objetivo:** Acompanhar o deploy e identificar problemas rapidamente

**Comandos (se aplicável - acesso ao servidor):**
```bash
# Conectar ao servidor de produção
ssh user@production-server

# Verificar status da aplicação
pm2 status lab-gitflow
# ou
systemctl status lab-gitflow

# Verificar logs em tempo real
tail -f /var/log/lab-gitflow/application.log
# ou
pm2 logs lab-gitflow --lines 50
```

**Métricas a Observar:**
- Tempo de resposta dos endpoints
- Taxa de erro (deve permanecer < 0.1%)
- Uso de CPU e memória
- Logs de erro ou warning

**Validação:**
- [ ] Aplicação iniciou corretamente
- [ ] Nenhum erro crítico nos logs
- [ ] Endpoints respondendo
- [ ] Métricas dentro do esperado

---

### Fase 5: Validação Pós-Deploy

#### Passo 5.1: Smoke Tests
**Objetivo:** Validar funcionalidades críticas em produção

**Testes Manuais:**

1. **Teste de Health Check:**
```bash
curl -I https://production-url/health
# Esperado: HTTP 200 OK
```

2. **Teste de Funcionalidade Básica:**
```bash
# Testar endpoint principal
curl https://production-url/api/sum?a=2&b=3
# Esperado: {"result": 5}
```

3. **Teste de Versão:**
```bash
curl https://production-url/version
# Esperado: {"version": "1.1.0"}
```

**Validação:**
- [ ] Todos os endpoints críticos respondem
- [ ] Respostas estão corretas
- [ ] Tempo de resposta aceitável (< 500ms)
- [ ] Versão correta sendo reportada

---

#### Passo 5.2: Verificar GitHub Release
**Objetivo:** Confirmar que release foi publicada no GitHub

**Ações:**
1. Acessar https://github.com/Daian4/lab-gitflow/releases
2. Verificar release v1.1.0
3. Confirmar que CHANGELOG está correto
4. Verificar artefatos anexados (se aplicável)

**Validação:**
- [ ] Release publicada e visível
- [ ] Tag correta (v1.1.0)
- [ ] CHANGELOG completo
- [ ] Assets/artefatos disponíveis

---

#### Passo 5.3: Notificar Stakeholders
**Objetivo:** Comunicar conclusão do deploy

**Template de Notificação:**
```
Assunto: ✅ Deploy v1.1.0 Concluído com Sucesso

Time,

Deploy da versão 1.1.0 foi concluído com sucesso em produção.

🕐 Horário: [timestamp]
📦 Versão: v1.1.0
⏱️ Duração: [tempo total]
🔗 Release Notes: https://github.com/Daian4/lab-gitflow/releases/tag/v1.1.0

Principais mudanças:
- Adicionados runbooks operacionais
- Documentação de procedimentos críticos
- Melhorias na rastreabilidade

Status: Todos os smoke tests passaram ✅
Downtime: ~3 minutos (dentro do esperado)

Em caso de dúvidas ou problemas, entre em contato.

Equipe de Operações
```

**Validação:**
- [ ] Email/Slack enviado para stakeholders
- [ ] Status atualizado em dashboard (se aplicável)
- [ ] Documentação atualizada

---

## ✅ Validação do Procedimento

Execute estas verificações para confirmar sucesso completo:

### Checklist de Validação Final

- [ ] **Verificação 1: Tag e Release**
  ```bash
  git tag -l v1.1.0
  git show v1.1.0
  ```
  Resultado esperado: Tag existe e aponta para commit correto

- [ ] **Verificação 2: Branches Atualizadas**
  ```bash
  git checkout main && git pull
  git log --oneline -5
  git checkout develop && git pull
  git log --oneline -5
  ```
  Resultado esperado: Main e develop contêm merge da release

- [ ] **Verificação 3: Aplicação Funcional**
  ```bash
  curl -s https://production-url/health | jq .
  ```
  Resultado esperado: Status 200 e health OK

- [ ] **Verificação 4: Versão Correta**
  ```bash
  curl -s https://production-url/version | jq .
  ```
  Resultado esperado: `{"version": "1.1.0"}`

- [ ] **Verificação 5: Logs Limpos**
  ```bash
  # No servidor
  tail -100 /var/log/lab-gitflow/application.log | grep -i error
  ```
  Resultado esperado: Nenhum erro crítico

### Testes Funcionais Completos

1. **Teste de Integração:**
   - Executar: Suite completa de testes automatizados em staging
   - Esperado: 100% de sucesso

2. **Teste de Performance:**
   - Executar: Load test com ferramenta (k6, JMeter)
   - Esperado: Latência p95 < 200ms, sem erros

3. **Teste de Monitoramento:**
   - Executar: Verificar alertas e dashboards
   - Esperado: Métricas normais, sem alertas

---

## 🔄 Procedimento de Rollback

Se algo der errado, siga estes passos para reverter:

### Quando Executar Rollback
- Taxa de erro > 5% após deploy
- Funcionalidade crítica quebrada
- Performance degradada significativamente (> 50% mais lento)
- Dados corrompidos ou perda de dados
- Impossibilidade de acessar sistema

### Passos de Rollback

#### Rollback 1: Reverter para Versão Anterior via Tag
```bash
# Identificar última versão estável
git tag -l --sort=-version:refname | head -5

# Checkout da tag anterior (exemplo: v1.0.9)
git checkout v1.0.9

# Criar hotfix branch
git checkout -b hotfix/rollback-to-1.0.9

# Push para acionar deploy
git tag -f v1.1.0-rollback
git push origin hotfix/rollback-to-1.0.9
git push -f origin v1.1.0-rollback
```

**Validação:**
- [ ] Tag anterior identificada
- [ ] Hotfix branch criada
- [ ] Deploy da versão anterior acionado

#### Rollback 2: Rollback Manual no Servidor
```bash
# Conectar ao servidor
ssh user@production-server

# Parar aplicação
pm2 stop lab-gitflow

# Voltar para versão anterior
cd /app/lab-gitflow
git fetch --all
git checkout v1.0.9

# Reinstalar dependências
npm ci

# Rebuild
npm run build

# Reiniciar aplicação
pm2 restart lab-gitflow
```

**Validação:**
- [ ] Aplicação parada sem erros
- [ ] Código revertido para versão anterior
- [ ] Aplicação reiniciada com sucesso

#### Rollback 3: Notificar e Documentar
```bash
# Atualizar issue/ticket
# Documentar razão do rollback
# Planejar correção
```

**Validação:**
- [ ] Stakeholders notificados
- [ ] Incidente documentado
- [ ] Post-mortem agendado

### Validação do Rollback

- [ ] Sistema voltou ao estado estável
- [ ] Taxa de erro < 0.1%
- [ ] Performance normalizada
- [ ] Funcionalidades críticas operacionais
- [ ] Usuários notificados (se necessário)

---

## 🔧 Troubleshooting

### Problema 1: Mudanças Não Commitadas

**Sintomas:**
- `git status` mostra arquivos modificados
- Erro ao tentar trocar de branch
- Working tree não está limpo

**Causa Raiz:**
- Mudanças locais não foram commitadas ou descartadas

**Solução:**
```bash
# Opção 1: Fazer stash das mudanças
git stash save "Mudanças temporárias antes do deploy"

# Opção 2: Descartar mudanças (CUIDADO!)
git reset --hard HEAD

# Opção 3: Commit das mudanças
git add .
git commit -m "fix: mudanças pendentes antes do deploy"
```

**Verificação:**
- [ ] `git status` mostra working tree clean
- [ ] Possível trocar de branch sem erro

---

### Problema 2: Falha nos Testes

**Sintomas:**
- `npm test` retorna código de saída diferente de 0
- Mensagens de erro em testes específicos
- Build falha

**Causa Raiz:**
- Código com bugs não detectados anteriormente
- Dependências desatualizadas ou incompatíveis
- Ambiente local diferente do CI

**Solução:**
```bash
# Limpar node_modules e cache
rm -rf node_modules package-lock.json
npm cache clean --force

# Reinstalar dependências
npm install

# Executar testes novamente
npm test

# Se persistir, investigar teste específico
npm test -- --verbose
```

**Verificação:**
- [ ] Todos os testes passam
- [ ] Build completa sem erros
- [ ] Nenhum warning crítico

---

### Problema 3: Falha no CI/CD

**Sintomas:**
- GitHub Actions workflow falha
- Job específico retorna erro
- Deploy não é executado

**Causa Raiz:**
- Problema de configuração no workflow
- Secrets/credentials inválidos
- Timeout em job específico
- Problema de rede ou serviço externo

**Solução:**
1. Acessar logs detalhados no GitHub Actions
2. Identificar job e step que falhou
3. Verificar mensagem de erro específica
4. Corrigir problema identificado:

```bash
# Se for problema de secrets
# Verificar no GitHub Settings > Secrets

# Se for problema de timeout
# Aumentar timeout no workflow YAML

# Se for problema de dependência
# Atualizar versões no workflow
```

**Verificação:**
- [ ] Workflow executa até o final
- [ ] Todos os jobs passam
- [ ] Deploy completado

---

### Problema 4: Conflitos de Merge

**Sintomas:**
- Erro "CONFLICT" durante merge
- Git solicita resolução manual
- PR mostra conflitos

**Causa Raiz:**
- Mudanças simultâneas em mesmas linhas
- Branches divergiram significativamente

**Solução:**
```bash
# Durante merge que deu conflito
git status  # Ver arquivos conflitantes

# Editar arquivos manualmente, procurar por:
# <<<<<<< HEAD
# código conflitante
# =======
# outro código
# >>>>>>> branch

# Após resolver conflitos
git add arquivo-resolvido.js
git commit -m "resolve: conflitos de merge entre release e main"

# Verificar que merge está completo
git status
```

**Verificação:**
- [ ] Todos os conflitos resolvidos
- [ ] Código resultante faz sentido
- [ ] Testes passam após resolução

---

### Problema 5: Aplicação Não Inicia Após Deploy

**Sintomas:**
- Processo não inicia ou morre imediatamente
- Erro 502 Bad Gateway
- Logs mostram crash na inicialização

**Causa Raiz:**
- Dependências faltando
- Variáveis de ambiente incorretas
- Porta já em uso
- Problema de permissões

**Solução:**
```bash
# Conectar ao servidor
ssh user@production-server

# Verificar logs detalhados
pm2 logs lab-gitflow --err --lines 100

# Verificar configuração
cat ecosystem.config.js
env | grep LAB_GITFLOW

# Verificar porta
netstat -tlnp | grep 3000

# Reinstalar dependências
cd /app/lab-gitflow
npm ci

# Verificar permissões
ls -la
chown -R appuser:appuser /app/lab-gitflow

# Tentar start manual para debug
NODE_ENV=production node index.js
```

**Verificação:**
- [ ] Aplicação inicia sem erros
- [ ] Processo mantém-se executando
- [ ] Endpoints respondem corretamente

---

## 🔗 Rastreabilidade

### Runbooks Relacionados

| Runbook | Relação | Quando Usar |
|---------|---------|-------------|
| [RB-002](./RB-002-backup.md) | Pré-requisito | Executar backup completo ANTES de iniciar deploy |
| [RB-003](./RB-003-restauracao.md) | Rollback | Usar se rollback via Git não for suficiente |
| [RB-TEMPLATE](./RB-TEMPLATE.md) | Referência | Template para criar novos runbooks |

### Referências Externas

1. **Git Flow - Guia Original**
   - URL: https://nvie.com/posts/a-successful-git-branching-model/
   - Seção relevante: Modelo completo de branching
   - Uso: Entender filosofia e decisões por trás do Git Flow

2. **Semantic Versioning**
   - URL: https://semver.org/
   - Seção relevante: Especificação completa
   - Uso: Decidir incremento correto de versão (MAJOR/MINOR/PATCH)

3. **GitHub Actions - Workflow Syntax**
   - URL: https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions
   - Seção relevante: Tags e eventos de trigger
   - Uso: Entender como CI/CD é acionado por tags

4. **Conventional Commits**
   - URL: https://www.conventionalcommits.org/
   - Seção relevante: Especificação
   - Uso: Padronizar mensagens de commit

### Histórico de Mudanças

| Versão | Data | Autor | Mudanças |
|--------|------|-------|----------|
| 1.0.0 | 2025-11-11 | Equipe Operações | Versão inicial do runbook de deploy |

### Incidentes Relacionados

| ID Incidente | Data | Descrição | Melhorias Implementadas |
|--------------|------|-----------|------------------------|
| - | - | Nenhum incidente registrado ainda | - |

---

## 📄 Resumo Objetivo

### Visão Geral
Este runbook documenta o processo híbrido de deploy manual em produção usando Git Flow, combinando preparação manual cuidadosa com automação via CI/CD. O procedimento garante deployment seguro através de validações em múltiplos pontos, versionamento semântico adequado, e rastreabilidade completa de todas as mudanças desde develop até produção.

### Pontos-Chave
- **Objetivo:** Deploy seguro e rastreável seguindo Git Flow
- **Duração:** 25-40 minutos (normal), até 1h (com problemas)
- **Complexidade:** Média-Alta (requer conhecimento de Git Flow)
- **Impacto:** Alto (aplicação ficará indisponível por 2-5 minutos)
- **Pré-requisitos críticos:** Acesso ao repositório, servidor, Node.js configurado, backup recente

### Quando Usar
Este runbook deve ser utilizado quando:
1. Há necessidade de fazer deploy de novas funcionalidades para produção
2. Uma release branch foi criada e testada com sucesso
3. Todas as features em develop estão prontas para produção
4. Houve aprovação formal para o deploy (quando aplicável)

### Principais Riscos
1. **Downtime durante deploy:** 2-5 minutos de indisponibilidade - Mitigar executando em horário de baixo tráfego
2. **Falha em testes não detectada:** Código com bugs em produção - Mitigar com testes locais completos antes e smoke tests após
3. **Conflitos de merge:** Impossibilidade de completar merge - Mitigar com sincronização frequente de branches
4. **Rollback necessário:** Perda de tempo e impacto em usuários - Mitigar com backup prévio e plano de rollback pronto

### Resultados Esperados
Após execução bem-sucedida:
- ✅ Código da release branch integrado em main e develop
- ✅ Tag de versão criada e publicada no GitHub
- ✅ GitHub Release gerada automaticamente com CHANGELOG
- ✅ Aplicação em produção rodando nova versão
- ✅ Todos os smoke tests passando
- ✅ Métricas e logs normais
- ✅ Stakeholders notificados

### Dependências
- **Antes:** [RB-002](./RB-002-backup.md) - Executar backup completo antes do deploy
- **Depois:** Monitoramento contínuo por 24h para detectar problemas
- **Alternativa:** [RB-003](./RB-003-restauracao.md) - Se rollback via Git não for suficiente

---

**📌 Nota:** Este runbook pressupõe familiaridade com Git Flow. Novos membros devem fazer pair programming no primeiro deploy.

**Última revisão:** 2025-11-11  
**Próxima revisão:** 2026-02-11 (trimestral)
