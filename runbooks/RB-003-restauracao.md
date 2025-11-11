# RB-003: Restauração de Backup

> **ID:** RB-003  
> **Versão:** 1.0.0  
> **Data de Criação:** 2025-11-11  
> **Última Atualização:** 2025-11-11  
> **Autor:** Equipe de Operações  
> **Responsável:** DevOps Lead

---

## 🎯 Objetivo

Este runbook documenta o procedimento completo para restauração do sistema `lab-gitflow` a partir de backups criados pelo [RB-002](./RB-002-backup.md). O procedimento garante:

- Recuperação rápida e segura em caso de falha ou desastre
- Restauração completa de código, configurações e runtime
- Minimização de downtime e perda de dados
- Validação de integridade antes e após restauração
- Preservação de dados quando possível (restauração seletiva)

---

## 📋 Pré-requisitos

### Permissões Necessárias
- [ ] Acesso SSH ao servidor de produção (ou novo servidor)
- [ ] Permissões de root ou sudo para operações privilegiadas
- [ ] Acesso ao diretório de backups (/backup)
- [ ] Permissões para parar/iniciar aplicação
- [ ] Acesso ao repositório GitHub (se restauração via Git)

### Ferramentas Requeridas
- [ ] tar - para descompressão
- [ ] Git - para clone de bundle
- [ ] Node.js e npm - versões compatíveis com aplicação
- [ ] md5sum ou sha256sum - para verificação de integridade
- [ ] rsync - para sync seletivo (opcional)

### Conhecimentos Prévios
- Comandos básicos de Linux (tar, cp, mv)
- Estrutura da aplicação lab-gitflow
- Localização e organização dos backups
- Conceitos de restauração completa vs parcial
- Procedimentos de start/stop da aplicação

### Informações Necessárias Antes de Iniciar
- [ ] **Data do backup** a ser restaurado (formato: YYYY-MM-DD)
- [ ] **Razão da restauração** (falha, corrupção, rollback, teste)
- [ ] **Tipo de restauração** (completa, código apenas, configs apenas)
- [ ] **Servidor de destino** (mesmo servidor ou novo servidor)
- [ ] **Aprovação** (se em produção, requer aprovação formal)

### Validações Iniciais
```bash
# Verificar acesso ao servidor
ssh user@target-server "echo 'Conexão OK'"

# Verificar backups disponíveis
ssh user@backup-server "ls -lh /backup/lab-gitflow-*/"

# Verificar espaço em disco
ssh user@target-server "df -h /app"

# Verificar versões de ferramentas
ssh user@target-server "node --version && npm --version && git --version"
```

---

## 🔍 Análise de Opções

### Opção 1: Restauração Completa (Fresh Install)

**Descrição:**
- Remover aplicação atual completamente
- Restaurar tudo do backup (código, configs, runtime)
- Reinstalar dependências do zero
- Equivalente a instalação limpa

**Prós:**
- ✅ Garante ambiente limpo sem resíduos
- ✅ Elimina possíveis corrupções não detectadas
- ✅ Mais confiável em caso de desastre
- ✅ Processo bem definido e testável
- ✅ Adequado para novo servidor

**Contras:**
- ❌ Mais demorado (reinstalação completa)
- ❌ Maior downtime
- ❌ Perde quaisquer mudanças não backupeadas
- ❌ Requer mais espaço temporariamente

### Opção 2: Restauração Seletiva (Código Apenas)

**Descrição:**
- Manter configurações e dados atuais
- Restaurar apenas código-fonte via Git
- Útil para rollback de deploy problemático

**Prós:**
- ✅ Muito mais rápido (apenas código)
- ✅ Preserva configurações locais
- ✅ Preserva dados e logs
- ✅ Downtime mínimo
- ✅ Ideal para rollback de versão

**Contras:**
- ❌ Não resolve problemas de configuração
- ❌ Pode ter incompatibilidade código/config
- ❌ Não restaura dados se corrompidos
- ❌ Dependências não são revertidas automaticamente

### Opção 3: Restauração Incremental

**Descrição:**
- Usar rsync para restaurar apenas arquivos modificados/perdidos
- Mínimo impacto, máxima preservação
- Útil para recuperação de arquivos específicos

**Prós:**
- ✅ Mínimo downtime
- ✅ Preserva máximo de dados atuais
- ✅ Pode ser executado online
- ✅ Restauração cirúrgica

**Contras:**
- ❌ Complexo de executar corretamente
- ❌ Pode não resolver corrupções sistêmicas
- ❌ Requer conhecimento avançado
- ❌ Difícil de validar completamente

### Opção 4: Restauração em Paralelo (Blue-Green)

**Descrição:**
- Restaurar em servidor/diretório paralelo
- Testar completamente
- Switch quando validado
- Zero-downtime approach

**Prós:**
- ✅ Zero ou quase zero downtime
- ✅ Validação completa antes de ativar
- ✅ Rollback trivial (voltar para anterior)
- ✅ Muito seguro

**Contras:**
- ❌ Requer recursos duplicados (servidor/espaço)
- ❌ Mais complexo de implementar
- ❌ Pode ter custo adicional
- ❌ Requer infraestrutura preparada

### ⭐ Opção Escolhida: Depende do Cenário

**Justificativa por Cenário:**

1. **Desastre completo / Servidor novo:**
   - Usar **Opção 1 - Restauração Completa**
   - Garantia de ambiente limpo e funcional

2. **Rollback de deploy problemático:**
   - Usar **Opção 2 - Restauração Seletiva**
   - Rápido, mínimo impacto

3. **Recuperação de arquivos específicos:**
   - Usar **Opção 3 - Restauração Incremental**
   - Preserva outros dados

4. **Produção crítica:**
   - Usar **Opção 4 - Restauração em Paralelo**
   - Máxima segurança e mínimo risco

**Este runbook documenta primariamente Opção 1 (mais comum) com notas para outras opções.**

---

## 📊 Análise de Impacto

### Sistemas Afetados
| Sistema | Tipo de Impacto | Severidade | Observações |
|---------|-----------------|------------|-------------|
| Aplicação Web | Downtime completo durante restauração | Crítica | 15-45 minutos indisponível |
| API Endpoints | Totalmente indisponível | Crítica | Mesma janela da aplicação |
| Banco de Dados | Queries não processadas | Alta | Se aplicação usa BD |
| Usuários | Impossibilidade de acessar sistema | Crítica | Comunicação prévia essencial |

### Estimativas de Tempo (Restauração Completa)
- **Preparação:** 5-10 minutos (validações, decisões)
- **Verificação de Backup:** 3-5 minutos (checksums, integridade)
- **Restauração de Código:** 5-10 minutos (descompactar, instalar deps)
- **Restauração de Configs:** 2-3 minutos (copiar arquivos)
- **Validação:** 10-15 minutos (testes, verificações)
- **Total:** 25-45 minutos

### Estimativas de Tempo (Restauração Seletiva - Código)
- **Total:** 5-10 minutos

### Janela de Execução
- **Horário recomendado:** Qualquer (urgência define), idealmente horário de baixo tráfego
- **Duração necessária:** 1 hora (com margem de segurança)
- **Notificação prévia:** Impossível em desastre, mas comunicar assim que possível
- **Comunicação:** Status page, email, Slack para informar usuários

### Riscos Identificados

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Backup corrompido/incompleto | Baixa | Crítico | Verificar checksums antes; ter múltiplos backups disponíveis |
| Incompatibilidade de versões | Média | Alto | Documentar versões no backup; testar restauração regularmente |
| Perda de dados entre backup e falha | Média | Alto | Backups frequentes; aceitar perda limitada; comunicar claramente |
| Falha na restauração | Baixa | Crítico | Ter plano B (backup mais antigo); documentação detalhada |
| Configurações desatualizadas | Média | Médio | Verificar configs antes de ativar; ter configs atualizadas documentadas |

---

## 📝 Procedimento Passo a Passo

### Fase 1: Preparação e Análise

#### Passo 1.1: Avaliar Situação e Decidir Estratégia
**Objetivo:** Entender o problema e escolher abordagem de restauração

**Perguntas a Responder:**
1. Qual é o problema exato? (falha, corrupção, necessidade de rollback)
2. Quando ocorreu o problema?
3. Qual backup usar? (mais recente, antes do problema)
4. Qual tipo de restauração? (completa, seletiva)
5. Há dados recentes a preservar?

**Comandos para Investigação:**
```bash
# Se servidor ainda acessível, investigar
ssh user@production-server

# Verificar logs de erro
tail -100 /var/log/lab-gitflow/error.log
journalctl -u lab-gitflow -n 100

# Verificar status da aplicação
pm2 status lab-gitflow
# ou
systemctl status lab-gitflow

# Verificar integridade de arquivos
cd /app/lab-gitflow
ls -la
git status

# Identificar quando problema começou
ls -lt /app/lab-gitflow/ | head -10
```

**Decisão:**
- [ ] Tipo de restauração definido
- [ ] Backup de origem selecionado
- [ ] Janela de manutenção aprovada (se aplicável)
- [ ] Stakeholders notificados

---

#### Passo 1.2: Identificar e Validar Backup
**Objetivo:** Localizar backup apropriado e verificar integridade

**Comandos:**
```bash
# Listar backups disponíveis
ls -lht /backup/lab-gitflow-*/

# Identificar backup desejado (exemplo: dia 10)
BACKUP_DATE="2025-11-10"
BACKUP_DIR="/backup/lab-gitflow-${BACKUP_DATE}"

# Verificar conteúdo do backup
ls -lh "${BACKUP_DIR}"/

# Ler manifesto
cat "${BACKUP_DIR}"/MANIFEST-*.txt

# Verificar checksums
cd "${BACKUP_DIR}"
md5sum -c checksums-md5.txt
# ou
sha256sum -c checksums-sha256.txt
```

**Resultado Esperado:**
```
/backup/lab-gitflow-2025-11-10:
total 18M
-r--r----- 1 backup backup  15M Nov 10 02:05 lab-gitflow-app-2025-11-10.tar.gz
-r--r----- 1 backup backup 2.5M Nov 10 02:01 lab-gitflow-repo-2025-11-10.bundle
-r--r----- 1 backup backup 1.2K Nov 10 02:10 checksums-md5.txt
...

lab-gitflow-app-2025-11-10.tar.gz: OK
lab-gitflow-repo-2025-11-10.bundle: OK
```

**Validação:**
- [ ] Backup existe e é acessível
- [ ] Data do backup é apropriada (antes do problema)
- [ ] Todos os checksums passam (OK)
- [ ] Manifesto está completo

**Se houver erro:**
- Consulte seção [Troubleshooting - Problema 1](#problema-1-backup-corrompido)

---

#### Passo 1.3: Preparar Ambiente de Destino
**Objetivo:** Preparar servidor/diretório para receber restauração

**⚠️ ATENÇÃO:** Se restauração completa, a aplicação será parada e diretório atual será movido.

**Comandos:**
```bash
# Conectar ao servidor de destino
ssh user@target-server

# Verificar espaço em disco
df -h /app

# Se restauração completa: Parar aplicação
pm2 stop lab-gitflow
# ou
systemctl stop lab-gitflow

# Verificar que parou
pm2 status lab-gitflow
# Esperado: status stopped

# Criar backup local do estado atual (segurança)
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
cd /app
mv lab-gitflow lab-gitflow.before-restore.${TIMESTAMP}

# Criar diretório limpo
mkdir -p /app/lab-gitflow
cd /app/lab-gitflow
```

**Resultado Esperado:**
```
Filesystem      Size  Used Avail Use% Mounted on
/dev/sda1        50G   10G   40G  20% /app

[PM2] Applying action stopProcessId on app [lab-gitflow](ids: [ 0 ])
[PM2] [lab-gitflow](0) ✓

drwxr-xr-x 2 user user 4096 Nov 11 03:00 /app/lab-gitflow
```

**Validação:**
- [ ] Espaço suficiente disponível (> 5GB)
- [ ] Aplicação parada com sucesso
- [ ] Estado anterior backupeado (.before-restore)
- [ ] Diretório de destino pronto

---

### Fase 2: Restauração de Código

#### Passo 2.1: Restaurar Repositório Git
**Objetivo:** Restaurar código-fonte com histórico completo

**Comandos:**
```bash
cd /app/lab-gitflow

# Copiar bundle para local temporário (se backup em servidor diferente)
# scp user@backup-server:/backup/lab-gitflow-${BACKUP_DATE}/*-repo-*.bundle /tmp/

# Clone do bundle
BUNDLE_FILE="/backup/lab-gitflow-${BACKUP_DATE}/lab-gitflow-repo-${BACKUP_DATE}.bundle"
git clone "${BUNDLE_FILE}" .

# Verificar clone bem-sucedido
git status
git log --oneline -5
git branch -a

# Configurar remote para GitHub (se necessário)
git remote add origin https://github.com/Daian4/lab-gitflow.git

# Verificar versão restaurada
git describe --tags --always
cat package.json | grep version
```

**Resultado Esperado:**
```
Cloning into '.'...
Receiving objects: 100% (150/150), 2.50 MiB | 5.00 MiB/s, done.
Resolving deltas: 100% (75/75), done.

On branch main
Your branch is up to date with 'origin/main'.
nothing to commit, working tree clean

abc1234 Merge release/1.0.9 into main
def5678 chore(release): bump version to 1.0.9
...

v1.0.9
```

**Validação:**
- [ ] Clone completou sem erros
- [ ] Branch principal (main) está checked out
- [ ] Histórico de commits presente
- [ ] Versão identificada corretamente

---

#### Passo 2.2: Verificar Integridade do Código Restaurado
**Objetivo:** Confirmar que código restaurado está íntegro

**Comandos:**
```bash
cd /app/lab-gitflow

# Verificar arquivos principais existem
ls -la index.js package.json scripts/

# Verificar integridade do repositório Git
git fsck --full

# Comparar com o que estava no backup TAR (se necessário)
# tar tzf /backup/lab-gitflow-${BACKUP_DATE}/*-app-*.tar.gz | head -20
```

**Resultado Esperado:**
```
-rw-r--r-- 1 user user  74 Nov 11 03:05 index.js
-rw-r--r-- 1 user user 202 Nov 11 03:05 package.json
drwxr-xr-x 2 user user 4096 Nov 11 03:05 scripts/

Checking object directories: 100% (256/256), done.
Checking objects: 100% (150/150), done.
```

**Validação:**
- [ ] Arquivos principais presentes
- [ ] `git fsck` não reporta erros
- [ ] Estrutura de diretórios correta

---

### Fase 3: Restauração de Configurações e Runtime

#### Passo 3.1: Restaurar Arquivos de Configuração
**Objetivo:** Restaurar configurações críticas do backup

**Comandos:**
```bash
cd /app/lab-gitflow

# Copiar configs do backup
BACKUP_CONFIGS="/backup/lab-gitflow-${BACKUP_DATE}/configs"

# Listar configs disponíveis
ls -la "${BACKUP_CONFIGS}"/

# Copiar configs importantes
if [ -d "${BACKUP_CONFIGS}" ]; then
    # Copiar .env se existir
    [ -f "${BACKUP_CONFIGS}/.env.production" ] && \
        cp -p "${BACKUP_CONFIGS}/.env.production" .env.production
    
    # Copiar ecosystem.config.js se existir
    [ -f "${BACKUP_CONFIGS}/ecosystem.config.js" ] && \
        cp -p "${BACKUP_CONFIGS}/ecosystem.config.js" .
    
    # Copiar nginx.conf se existir
    [ -f "${BACKUP_CONFIGS}/nginx.conf" ] && \
        sudo cp -p "${BACKUP_CONFIGS}/nginx.conf" /etc/nginx/sites-available/lab-gitflow.conf
    
    echo "Configurações restauradas"
else
    echo "⚠ Diretório de configs não encontrado, usando configs do Git"
fi

# Verificar configs restaurados
ls -la .env* ecosystem.config.js 2>/dev/null || echo "Arquivos não presentes"
```

**Resultado Esperado:**
```
total 24K
-rw-r--r-- 1 user user  500 Nov 10 02:00 .env.production
-rw-r--r-- 1 user user 1.2K Nov 10 02:00 ecosystem.config.js

Configurações restauradas
```

**Validação:**
- [ ] Arquivos de configuração copiados
- [ ] Permissões preservadas
- [ ] Configs sensíveis (.env) presentes

**⚠️ IMPORTANTE:** Configs podem estar desatualizadas. Revisar valores antes de iniciar aplicação.

---

#### Passo 3.2: Instalar Dependências
**Objetivo:** Reinstalar node_modules a partir de package-lock.json

**Comandos:**
```bash
cd /app/lab-gitflow

# Limpar qualquer node_modules existente
rm -rf node_modules

# Instalar dependências exatas do lockfile
npm ci

# Verificar instalação
ls -la node_modules/ | head -10
npm list --depth=0
```

**Resultado Esperado:**
```
added 265 packages, and audited 266 packages in 5s

32 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities

total 1064
drwxr-xr-x 265 user user 8192 Nov 11 03:10 node_modules/

lab-gitflow-demo@1.0.9 /app/lab-gitflow
└── jest@29.7.0
```

**Validação:**
- [ ] Instalação completou sem erros
- [ ] node_modules/ criado e populado
- [ ] Versões das deps correspondem ao package-lock.json
- [ ] Nenhuma vulnerabilidade crítica (ou mesmas do backup)

---

#### Passo 3.3: Executar Build
**Objetivo:** Gerar artefatos de build (dist/)

**Comandos:**
```bash
cd /app/lab-gitflow

# Executar build
npm run build

# Verificar que dist/ foi criado
ls -la dist/

# Verificar conteúdo
cat dist/index.js | head -5
```

**Resultado Esperado:**
```
> lab-gitflow-demo@1.0.9 build
> node scripts/build.js

📦  Arquivo copiado para dist/

total 8
-rw-r--r-- 1 user user 74 Nov 11 03:12 index.js

function sum(a, b) {
    return a + b;
}
```

**Validação:**
- [ ] Build executado sem erros
- [ ] Diretório dist/ criado
- [ ] Artefatos presentes e válidos

---

### Fase 4: Validação e Testes

#### Passo 4.1: Executar Testes Automatizados
**Objetivo:** Validar que código restaurado está funcional

**Comandos:**
```bash
cd /app/lab-gitflow

# Executar suite de testes
npm test

# Verificar resultado
echo "Exit code: $?"
```

**Resultado Esperado:**
```
> lab-gitflow-demo@1.0.9 test
> jest

 PASS  ./sum.test.js
  ✓ adds 1 + 2 to equal 3 (2 ms)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Snapshots:   0 total
Time:        0.285 s
Ran all test suites.

Exit code: 0
```

**Validação:**
- [ ] Todos os testes passaram
- [ ] Exit code é 0 (sucesso)
- [ ] Nenhum erro ou warning crítico

**Se houver erro:**
- Consulte seção [Troubleshooting - Problema 2](#problema-2-testes-falhando)

---

#### Passo 4.2: Teste Manual (Smoke Test)
**Objetivo:** Validar funcionalidade básica manualmente

**Comandos:**
```bash
cd /app/lab-gitflow

# Iniciar aplicação em modo de teste (foreground)
NODE_ENV=production node index.js &
APP_PID=$!

# Aguardar inicialização
sleep 3

# Testar funcionalidade básica (se aplicação expõe endpoint)
# curl http://localhost:3000/health
# curl http://localhost:3000/api/sum?a=2&b=3

# Verificar que está rodando
ps -p $APP_PID

# Parar teste
kill $APP_PID
wait $APP_PID 2>/dev/null

echo "Smoke test concluído"
```

**Validação:**
- [ ] Aplicação inicia sem erros
- [ ] Funcionalidades básicas respondem
- [ ] Nenhum crash ou exceção

---

#### Passo 4.3: Verificar Logs
**Objetivo:** Confirmar que não há erros nos logs

**Comandos:**
```bash
cd /app/lab-gitflow

# Verificar logs recentes (se existirem)
if [ -d "logs" ]; then
    tail -50 logs/error.log
    tail -50 logs/app.log
fi

# Verificar logs do sistema
journalctl -u lab-gitflow -n 50 2>/dev/null || echo "Serviço ainda não iniciado"
```

**Validação:**
- [ ] Nenhum erro crítico nos logs
- [ ] Warnings são esperados (se houver)
- [ ] Aplicação está funcional

---

### Fase 5: Ativação e Monitoramento

#### Passo 5.1: Iniciar Aplicação em Produção
**Objetivo:** Colocar aplicação restaurada em operação

**⚠️ ATENÇÃO:** Este passo coloca a aplicação de volta online.

**Comandos:**
```bash
cd /app/lab-gitflow

# Iniciar via PM2
pm2 start ecosystem.config.js
# ou
pm2 start index.js --name lab-gitflow

# Verificar status
pm2 status

# Salvar configuração
pm2 save

# Verificar logs em tempo real
pm2 logs lab-gitflow --lines 20
```

**Resultado Esperado:**
```
[PM2] Starting /app/lab-gitflow/index.js in fork_mode (1 instance)
[PM2] Done.

┌─────┬──────────────┬─────────────┬─────────┬─────────┬──────────┐
│ id  │ name         │ mode        │ ↺       │ status  │ cpu      │
├─────┼──────────────┼─────────────┼─────────┼─────────┼──────────┤
│ 0   │ lab-gitflow  │ fork        │ 0       │ online  │ 0%       │
└─────┴──────────────┴─────────────┴─────────┴─────────┴──────────┘
```

**Validação:**
- [ ] Aplicação iniciou (status: online)
- [ ] Nenhum erro nos logs iniciais
- [ ] Processo mantém-se rodando (não crasha)

---

#### Passo 5.2: Smoke Tests em Produção
**Objetivo:** Validar que aplicação está operacional em produção

**Comandos:**
```bash
# Teste de conectividade
curl -I http://localhost:3000/health 2>/dev/null || echo "Endpoint não disponível"

# Se aplicação expõe versão
curl -s http://localhost:3000/version || echo "Endpoint não disponível"

# Teste de funcionalidade
# curl -s http://localhost:3000/api/sum?a=5&b=3

# Verificar que está respondendo
timeout 5 bash -c 'until curl -sf http://localhost:3000/health; do sleep 1; done'

echo "✓ Aplicação respondendo"
```

**Resultado Esperado:**
```
HTTP/1.1 200 OK
{"status":"ok"}

{"version":"1.0.9"}

✓ Aplicação respondendo
```

**Validação:**
- [ ] Endpoints de saúde respondem
- [ ] Versão correta sendo reportada
- [ ] Funcionalidade básica operacional

---

#### Passo 5.3: Monitoramento Intensivo Inicial
**Objetivo:** Monitorar aplicação de perto nas primeiras horas

**Comandos:**
```bash
# Monitorar logs em tempo real (abrir em terminal separado)
pm2 logs lab-gitflow

# Monitorar recursos
pm2 monit

# Verificar status periodicamente
watch -n 5 'pm2 status && curl -s http://localhost:3000/health'

# Verificar logs do sistema
journalctl -u lab-gitflow -f
```

**Checklist de Monitoramento (primeiras 2 horas):**
- [ ] **+5 min:** Aplicação ainda online, sem erros
- [ ] **+15 min:** Métricas normais, resposta estável
- [ ] **+30 min:** Nenhum crash ou reinício
- [ ] **+1 hora:** Usuários conseguem acessar normalmente
- [ ] **+2 horas:** Tudo operacional, reduzir intensidade

**Validação:**
- [ ] Aplicação mantém-se estável
- [ ] Nenhum erro recorrente
- [ ] Performance aceitável
- [ ] Usuários não reportam problemas

---

### Fase 6: Finalização e Documentação

#### Passo 6.1: Limpar Arquivos Temporários
**Objetivo:** Remover arquivos temporários da restauração

**Comandos:**
```bash
# Remover backup local do estado anterior (após confirmar sucesso)
# CUIDADO: Só fazer após validação completa!
cd /app

# Verificar que novo está funcionando há pelo menos 24h
# Então:
# rm -rf lab-gitflow.before-restore.*

# Por enquanto, apenas comprimir para economizar espaço
tar czf lab-gitflow.before-restore.tar.gz lab-gitflow.before-restore.* 
rm -rf lab-gitflow.before-restore.20*
```

**Validação:**
- [ ] Espaço em disco liberado
- [ ] Backup de segurança mantido (por 7 dias)

---

#### Passo 6.2: Documentar Restauração
**Objetivo:** Registrar o que foi feito para rastreabilidade

**Criar arquivo de documentação:**
```bash
cat > /app/lab-gitflow/RESTORATION-$(date +%Y%m%d).md << 'EOF'
# Restauração Executada

**Data:** $(date)
**Executor:** $(whoami)
**Razão:** [Descrever razão da restauração]

## Backup Usado
- Data do backup: YYYY-MM-DD
- Localização: /backup/lab-gitflow-YYYY-MM-DD
- Versão restaurada: vX.Y.Z

## Procedimento
- Seguido: RB-003
- Tipo: Restauração Completa
- Downtime: XX minutos

## Validações
- [x] Testes automatizados: PASS
- [x] Smoke tests: PASS
- [x] Aplicação online: OK
- [x] Monitoramento: Normal

## Observações
[Qualquer observação relevante, problemas encontrados, desvios do procedimento]

## Ações de Follow-up
- [ ] Monitorar por 48h
- [ ] Investigar causa raiz da falha original
- [ ] Atualizar runbook se necessário
- [ ] Post-mortem agendado para: [data]
EOF

# Editar arquivo para preencher detalhes
vim /app/lab-gitflow/RESTORATION-$(date +%Y%m%d).md
```

**Validação:**
- [ ] Documentação criada e completa
- [ ] Detalhes registrados para auditoria

---

#### Passo 6.3: Notificar Stakeholders
**Objetivo:** Comunicar conclusão da restauração

**Template de Notificação:**
```
Assunto: ✅ Restauração do Sistema Concluída - lab-gitflow

Time,

A restauração do sistema lab-gitflow foi concluída com sucesso.

📅 Data/Hora: [timestamp]
⏱️ Duração: [tempo total de downtime]
📦 Backup usado: [data do backup]
🔄 Versão restaurada: [versão]

Status Atual: Sistema operacional e respondendo normalmente ✅

Validações Completadas:
✓ Testes automatizados passaram
✓ Smoke tests executados com sucesso
✓ Aplicação online e respondendo
✓ Monitoramento ativo

Ações de Follow-up:
- Monitoramento intensivo por 48h
- Investigação da causa raiz em andamento
- Post-mortem agendado para [data]

Dados perdidos: [Descrever qualquer perda de dados entre backup e restauração]

Em caso de problemas, contate a equipe de operações imediatamente.

Documentação: /app/lab-gitflow/RESTORATION-[data].md
Runbook seguido: RB-003

Equipe de Operações
```

**Canais de Comunicação:**
- [ ] Email para stakeholders
- [ ] Mensagem no Slack/Teams
- [ ] Atualizar status page (se aplicável)
- [ ] Ticket/incident atualizado

---

## ✅ Validação do Procedimento

Execute estas verificações finais:

### Checklist de Validação Completa

- [ ] **Verificação 1: Código Restaurado**
  ```bash
  cd /app/lab-gitflow
  git log --oneline -5
  git describe --tags --always
  ```
  Resultado esperado: Versão correta restaurada

- [ ] **Verificação 2: Dependências Instaladas**
  ```bash
  npm list --depth=0
  ls -la node_modules/ | wc -l
  ```
  Resultado esperado: Dependências presentes (>200 linhas)

- [ ] **Verificação 3: Build Completo**
  ```bash
  ls -la dist/
  ```
  Resultado esperado: Artefatos presentes

- [ ] **Verificação 4: Aplicação Online**
  ```bash
  pm2 status lab-gitflow
  ```
  Resultado esperado: status "online"

- [ ] **Verificação 5: Funcionalidade**
  ```bash
  curl -s http://localhost:3000/health | jq .
  ```
  Resultado esperado: {"status":"ok"}

- [ ] **Verificação 6: Testes**
  ```bash
  npm test
  ```
  Resultado esperado: All tests passed

- [ ] **Verificação 7: Logs Limpos**
  ```bash
  pm2 logs lab-gitflow --lines 50 --nostream | grep -i error
  ```
  Resultado esperado: Nenhum erro crítico

- [ ] **Verificação 8: Monitoramento**
  - Verificar dashboard de monitoramento
  - Métricas dentro do normal
  - Alertas não disparados

### Critérios de Sucesso

Restauração é considerada bem-sucedida quando:
- ✅ Aplicação está online e respondendo
- ✅ Todos os testes automatizados passam
- ✅ Smoke tests manuais passam
- ✅ Versão correta restaurada
- ✅ Sem erros críticos em logs
- ✅ Métricas de performance normais
- ✅ Usuários conseguem acessar (se aplicável)
- ✅ Equipe notificada e documentação completa

---

## 🔄 Procedimento de Rollback

Se restauração falhar ou causar problemas piores:

### Quando Executar Rollback da Restauração
- Aplicação não inicia após múltiplas tentativas
- Testes mostram funcionalidade crítica quebrada
- Perda de dados maior que esperada
- Incompatibilidades detectadas durante validação

### Passos de Rollback

#### Rollback 1: Voltar ao Estado Anterior
```bash
# Parar aplicação atual
pm2 stop lab-gitflow

# Remover tentativa de restauração
cd /app
rm -rf lab-gitflow

# Restaurar estado anterior
mv lab-gitflow.before-restore.[timestamp] lab-gitflow

# Reiniciar
cd lab-gitflow
pm2 start ecosystem.config.js

# Validar
pm2 status
```

**Validação:**
- [ ] Estado anterior restaurado
- [ ] Aplicação iniciou
- [ ] Volta ao estado pré-restauração

#### Rollback 2: Tentar Backup Mais Antigo
```bash
# Se estado anterior também problemático, tentar backup mais antigo
OLDER_BACKUP_DATE="2025-11-09"
# Repetir procedimento de restauração com backup mais antigo
```

#### Rollback 3: Escalar
```bash
# Se nada funciona, escalar para suporte senior
# Manter aplicação parada até resolução
# Comunicar situação crítica
```

---

## 🔧 Troubleshooting

### Problema 1: Backup Corrompido

**Sintomas:**
- Checksum não bate
- Erro ao descompactar TAR
- Git bundle inválido

**Causa Raiz:**
- Corrupção durante gravação do backup
- Problema de hardware (disco)
- Transferência de rede incompleta

**Solução:**
```bash
# Tentar backup do dia anterior
ls -lt /backup/lab-gitflow-*/

# Verificar checksums de múltiplos backups
for dir in /backup/lab-gitflow-2025-11-*/; do
    echo "Verificando ${dir}"
    cd "${dir}"
    md5sum -c checksums-md5.txt 2>&1 | grep -E "(OK|FAILED)"
done

# Usar primeiro backup válido encontrado
VALID_BACKUP="[identificado acima]"
```

**Verificação:**
- [ ] Backup alternativo válido encontrado
- [ ] Checksums passam
- [ ] Prosseguir com backup válido

---

### Problema 2: Testes Falhando

**Sintomas:**
- `npm test` retorna exit code != 0
- Alguns testes falham
- Funcionalidade quebrada

**Causa Raiz:**
- Incompatibilidade de versões Node.js/npm
- Dependências não instaladas corretamente
- Ambiente diferente do original
- Bug já existente no código backupeado

**Solução:**
```bash
# Verificar versões
node --version
npm --version

# Comparar com manifesto do backup
cat /backup/lab-gitflow-${BACKUP_DATE}/MANIFEST-*.txt | grep -A5 "node\|npm"

# Se versões diferentes, instalar versão correta
# nvm install 18.17.0  # exemplo
# nvm use 18.17.0

# Limpar e reinstalar dependências
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# Tentar testes novamente
npm test

# Se ainda falhar, verificar se é bug existente
git log --grep="test" --oneline -20
```

**Verificação:**
- [ ] Versões alinhadas
- [ ] Dependências reinstaladas
- [ ] Testes passam ou falha é conhecida

---

### Problema 3: Aplicação Não Inicia

**Sintomas:**
- pm2 start falha
- Processo morre imediatamente
- Erro nos logs

**Causa Raiz:**
- Configurações faltando (.env)
- Porta já em uso
- Dependências não instaladas
- Erro de permissões

**Solução:**
```bash
# Verificar logs detalhados
pm2 logs lab-gitflow --lines 100 --err

# Tentar iniciar em foreground para ver erro
cd /app/lab-gitflow
NODE_ENV=production node index.js

# Verificar porta
netstat -tlnp | grep 3000

# Verificar .env
ls -la .env*

# Verificar permissões
ls -la /app/lab-gitflow/

# Corrigir permissões se necessário
chown -R appuser:appuser /app/lab-gitflow
chmod +x /app/lab-gitflow/index.js
```

**Verificação:**
- [ ] Erro identificado
- [ ] Correção aplicada
- [ ] Aplicação inicia com sucesso

---

### Problema 4: Perda de Dados Não Aceitável

**Sintomas:**
- Dados críticos criados após backup não estão presentes
- Impossível aceitar perda entre backup e restauração
- Usuários reportam dados faltando

**Causa Raiz:**
- Backup muito antigo
- Dados críticos não backupeados frequentemente
- Falha ocorreu muito tempo após último backup

**Solução:**
```bash
# Verificar se há dados no estado anterior
cd /app/lab-gitflow.before-restore.*

# Identificar dados novos
find . -type f -newer /backup/lab-gitflow-${BACKUP_DATE}/MANIFEST-*.txt

# Copiar dados seletivamente (CUIDADO!)
# Identificar arquivos de dados (não código)
# Copiar para aplicação restaurada

# Exemplo (ajustar conforme necessário):
cp -p data/*.json /app/lab-gitflow/data/
cp -p uploads/* /app/lab-gitflow/uploads/

# Reiniciar aplicação
pm2 restart lab-gitflow
```

**Verificação:**
- [ ] Dados críticos recuperados
- [ ] Aplicação funcional com dados
- [ ] Validar integridade dos dados

---

### Problema 5: Incompatibilidade de Configurações

**Sintomas:**
- Aplicação inicia mas não conecta a serviços externos
- Erros de autenticação
- Configurações parecem desatualizadas

**Causa Raiz:**
- Configurações do backup estão desatualizadas
- URLs/endpoints mudaram desde backup
- Credenciais rotacionadas

**Solução:**
```bash
# Verificar configurações atuais necessárias
# (documentação, wiki, secrets manager)

# Atualizar .env com valores corretos
vim .env.production

# Ou copiar de outro ambiente
scp user@staging-server:/app/lab-gitflow/.env.production .env.production.current

# Mesclar configs necessárias
# Usar .env.production.current como referência
# Atualizar valores que mudaram

# Reiniciar
pm2 restart lab-gitflow

# Validar conectividade
pm2 logs lab-gitflow | grep -i "connect\|auth"
```

**Verificação:**
- [ ] Configurações atualizadas
- [ ] Aplicação conecta a serviços externos
- [ ] Funcionalidade completa restaurada

---

## 🔗 Rastreabilidade

### Runbooks Relacionados

| Runbook | Relação | Quando Usar |
|---------|---------|-------------|
| [RB-002](./RB-002-backup.md) | Fonte de Dados | Usa backups criados por este procedimento |
| [RB-001](./RB-001-deploy-manual.md) | Complementar | Após restauração, pode ser necessário re-deploy |
| [RB-TEMPLATE](./RB-TEMPLATE.md) | Referência | Template usado para criar este runbook |

### Referências Externas

1. **Git Clone from Bundle**
   - URL: https://git-scm.com/docs/git-bundle
   - Seção relevante: EXAMPLES - "Assume two repositories exist"
   - Uso: Como restaurar repositório completo de bundle

2. **Disaster Recovery Best Practices**
   - URL: https://www.atlassian.com/incident-management/incident-recovery/disaster-recovery
   - Seção relevante: Recovery procedures
   - Uso: Princípios gerais de restauração de desastres

3. **npm ci Documentation**
   - URL: https://docs.npmjs.com/cli/v9/commands/npm-ci
   - Seção relevante: Description
   - Uso: Entender instalação limpa de dependências

4. **PM2 Process Management**
   - URL: https://pm2.keymetrics.io/docs/usage/quick-start/
   - Seção relevante: Managing processes
   - Uso: Start, stop, restart da aplicação

### Histórico de Mudanças

| Versão | Data | Autor | Mudanças |
|--------|------|-------|----------|
| 1.0.0 | 2025-11-11 | Equipe Operações | Versão inicial do runbook de restauração |

### Incidentes Relacionados

| ID Incidente | Data | Descrição | Melhorias Implementadas |
|--------------|------|-----------|------------------------|
| - | - | Nenhum incidente registrado ainda | - |

---

## 📄 Resumo Objetivo

### Visão Geral
Este runbook documenta procedimento completo de restauração do sistema lab-gitflow a partir de backups, cobrindo desde análise da situação até ativação e monitoramento pós-restauração. Oferece abordagens flexíveis (completa, seletiva, incremental) adequadas a diferentes cenários de falha, com ênfase em validação rigorosa e minimização de downtime.

### Pontos-Chave
- **Objetivo:** Recuperação rápida e segura do sistema após falha ou desastre
- **Duração:** 25-45 minutos (completa), 5-10 minutos (seletiva)
- **Complexidade:** Alta (requer decisões críticas e conhecimento profundo)
- **Impacto:** Crítico (downtime completo durante restauração)
- **Pré-requisitos críticos:** Backup válido e íntegro, acesso ao servidor, ferramentas instaladas

### Quando Usar
Este runbook deve ser utilizado quando:
1. **Falha catastrófica** do sistema que impede operação normal
2. **Corrupção de dados** detectada que não pode ser reparada localmente
3. **Necessidade de rollback** para versão anterior após deploy problemático
4. **Perda de servidor** (hardware failure, desastre) requerendo restauração em novo servidor
5. **Teste de recuperação** (DR drills) para validar backups e procedimentos

### Principais Riscos
1. **Backup inválido/corrompido:** Impossibilidade de restaurar - Mitigar com validação periódica de backups e múltiplos backups disponíveis
2. **Perda de dados recentes:** Dados entre backup e falha são perdidos - Mitigar com backups frequentes e aceitar perda limitada
3. **Downtime prolongado:** Impacto em usuários e negócio - Mitigar com procedimento testado e bem documentado
4. **Restauração mal-sucedida:** Agravamento da situação - Mitigar mantendo estado anterior e tendo plano B

### Resultados Esperados
Após execução bem-sucedida:
- ✅ Sistema completamente restaurado e operacional
- ✅ Código-fonte restaurado com versão correta
- ✅ Configurações aplicadas e validadas
- ✅ Dependências instaladas e funcionais
- ✅ Todos os testes automatizados passando
- ✅ Aplicação online e respondendo
- ✅ Smoke tests validados em produção
- ✅ Monitoramento ativo e métricas normais
- ✅ Documentação completa da restauração
- ✅ Stakeholders notificados

### Dependências
- **Antes:** [RB-002](./RB-002-backup.md) - Requer backup válido criado previamente
- **Depois:** Monitoramento intensivo por 48h; investigação de causa raiz; post-mortem
- **Alternativa:** Se restauração completa falhar, tentar restauração seletiva ou backup mais antigo

### Métricas de Sucesso

| Métrica | Valor Alvo | Como Medir |
|---------|------------|------------|
| RTO (Recovery Time Objective) | < 1 hora | Tempo entre início e aplicação online |
| RPO (Recovery Point Objective) | < 24 horas | Idade máxima do backup usado |
| Taxa de sucesso | > 95% | Restaurações bem-sucedidas / tentativas |
| Downtime | < 45 minutos | Tempo que aplicação ficou offline |

---

**📌 Nota:** Restauração é procedimento crítico. Sempre ter segunda pessoa revisando decisões importantes (pair operations).

**Última revisão:** 2025-11-11  
**Próxima revisão:** 2026-02-11 (trimestral)

**⚠️ CRÍTICO:** 
- Este procedimento deve ser **testado regularmente** (mensalmente)
- Executar DR drills para validar backups e familiarizar equipe
- Manter documentação atualizada conforme mudanças no sistema
- Ter escalação clara para situações que excedam este runbook
