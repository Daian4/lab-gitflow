# RB-002: Backup do Sistema

> **ID:** RB-002  
> **Versão:** 1.0.0  
> **Data de Criação:** 2025-11-11  
> **Última Atualização:** 2025-11-11  
> **Autor:** Equipe de Operações  
> **Responsável:** DevOps Lead

---

## 🎯 Objetivo

Este runbook documenta os procedimentos para execução de backup completo e incremental do sistema `lab-gitflow`. O procedimento garante:

- Proteção de dados críticos contra perda ou corrupção
- Capacidade de restauração em caso de falha ou desastre
- Conformidade com políticas de retenção de dados
- Backup de código, configurações, dependências e dados operacionais
- Verificação de integridade dos backups gerados

---

## 📋 Pré-requisitos

### Permissões Necessárias
- [ ] Acesso SSH ao servidor de produção
- [ ] Permissões de leitura em todos os diretórios da aplicação
- [ ] Acesso de escrita ao storage de backup (local/remoto)
- [ ] Permissões para executar comandos de backup (tar, rsync)
- [ ] Acesso ao sistema de versionamento (Git)

### Ferramentas Requeridas
- [ ] tar - para compressão de arquivos
- [ ] gzip ou bzip2 - para compressão adicional
- [ ] rsync - para backup incremental
- [ ] aws-cli ou gsutil - para backup em cloud (opcional)
- [ ] md5sum ou sha256sum - para verificação de integridade
- [ ] Git - para backup de repositório

### Conhecimentos Prévios
- Comandos básicos de Linux (tar, rsync, find)
- Estrutura de diretórios da aplicação
- Conceitos de backup completo vs incremental
- Políticas de retenção da organização

### Validações Iniciais
```bash
# Verificar espaço em disco disponível
df -h /backup
# Esperado: Pelo menos 5GB disponível

# Verificar ferramentas instaladas
tar --version
rsync --version
git --version

# Verificar acesso ao servidor
ssh user@production-server "echo 'Conexão OK'"

# Verificar diretório de backup existe
ssh user@production-server "ls -ld /backup"
```

---

## 🔍 Análise de Opções

### Opção 1: Backup Completo Manual com TAR

**Descrição:**
- Criar arquivo TAR comprimido de todo o diretório da aplicação
- Incluir código, configurações, node_modules, logs
- Salvar localmente ou transferir para storage remoto

**Prós:**
- ✅ Simples de implementar e executar
- ✅ Formato universal e compatível
- ✅ Fácil de restaurar (apenas descompactar)
- ✅ Não requer ferramentas especializadas
- ✅ Backup completo em arquivo único

**Contras:**
- ❌ Ocupa muito espaço (incluindo node_modules)
- ❌ Lento para grandes volumes de dados
- ❌ Não otimizado (backup completo sempre)
- ❌ Transferência de rede pode ser demorada
- ❌ Sem versionamento incremental

### Opção 2: Backup Incremental com RSYNC

**Descrição:**
- Usar rsync para sincronizar apenas mudanças
- Manter histórico de backups com hardlinks
- Economizar espaço e tempo

**Prós:**
- ✅ Muito mais rápido após primeiro backup
- ✅ Economiza espaço com hardlinks
- ✅ Mantém múltiplas versões eficientemente
- ✅ Pode ser executado com mais frequência
- ✅ Transferência de rede otimizada

**Contras:**
- ❌ Mais complexo de configurar
- ❌ Requer entendimento de hardlinks
- ❌ Restauração pode ser menos intuitiva
- ❌ Dependência de filesystem suportado

### Opção 3: Backup Híbrido (TAR + Git)

**Descrição:**
- Usar Git para versionamento de código
- Usar TAR para dados e configurações
- Combinar vantagens de ambos

**Prós:**
- ✅ Git oferece versionamento granular de código
- ✅ TAR oferece backup completo de runtime
- ✅ Flexibilidade para diferentes tipos de dado
- ✅ Git já é usado no workflow
- ✅ Separação entre código e runtime

**Contras:**
- ❌ Requer manutenção de dois processos
- ❌ Mais complexo de orquestrar
- ❌ Possível inconsistência temporal entre backups

### Opção 4: Solução Cloud-Native

**Descrição:**
- AWS Backup, Google Cloud Backup, ou similar
- Automação completa com snapshots
- Gestão de retenção automatizada

**Prós:**
- ✅ Totalmente automatizado
- ✅ Alta confiabilidade e durabilidade
- ✅ Gestão de retenção integrada
- ✅ Backup offsite automaticamente
- ✅ Restauração simplificada via console

**Contras:**
- ❌ Custo adicional (storage + operações)
- ❌ Dependência de provedor cloud
- ❌ Lock-in de plataforma
- ❌ Pode ser overkill para projetos pequenos

### ⭐ Opção Escolhida: Opção 3 - Backup Híbrido

**Justificativa:**
- Git já faz parte do workflow e versiona código eficientemente
- TAR é simples e confiável para dados de runtime
- Permite backup frequente de código (via Git push)
- Backup periódico de runtime via TAR é suficiente
- Não adiciona custos externos (cloud)
- Adequado para escala atual do projeto
- Fácil de entender e manter para equipe pequena

---

## 📊 Análise de Impacto

### Sistemas Afetados
| Sistema | Tipo de Impacto | Severidade | Observações |
|---------|-----------------|------------|-------------|
| Aplicação Web | Lentidão durante I/O intenso | Baixa | Impacto apenas se backup executado em horário de pico |
| Servidor de Arquivos | Uso de CPU/Disco elevado | Média | Durante compressão e transferência |
| Rede | Uso de banda para transferência | Baixa | Se backup remoto, consumo de banda |
| Storage de Backup | Crescimento contínuo | Média | Requer monitoramento e limpeza periódica |

### Estimativas de Tempo
- **Preparação:** 5 minutos (validações e setup)
- **Backup Git:** 1-2 minutos (push de código)
- **Backup TAR:** 5-10 minutos (compressão e cópia)
- **Verificação:** 2-3 minutos (checksums e validação)
- **Total:** 15-20 minutos

### Janela de Execução
- **Horário recomendado:** Diariamente às 02h00 (baixo tráfego) ou antes de deploys
- **Duração necessária:** 30 minutos (com margem de segurança)
- **Frequência:** 
  - Backup completo: Diariamente
  - Backup incremental: A cada 4 horas (opcional)
  - Backup pré-deploy: Sempre antes de mudanças críticas

### Riscos Identificados

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Espaço em disco insuficiente | Média | Alto | Monitorar espaço; implementar rotação de backups; alertas automáticos |
| Corrupção durante compressão | Baixa | Alto | Verificação de checksum após backup; manter último backup válido |
| Falha de rede durante transferência | Média | Médio | Usar rsync com resume; retry automático; validar integridade |
| Backup incompleto | Baixa | Crítico | Validação pós-backup obrigatória; logs detalhados; alertas de falha |
| Acesso não autorizado a backups | Baixa | Crítico | Criptografar backups; restringir permissões; audit logs |

---

## 📝 Procedimento Passo a Passo

### Fase 1: Preparação e Validação

#### Passo 1.1: Validar Ambiente e Espaço
**Objetivo:** Garantir que há recursos suficientes para executar backup

**Comandos:**
```bash
# Conectar ao servidor de produção
ssh user@production-server

# Verificar espaço em disco
df -h /backup /app

# Verificar espaço necessário
du -sh /app/lab-gitflow

# Verificar backups anteriores
ls -lh /backup/lab-gitflow-*

# Verificar processos em execução
ps aux | grep backup
```

**Resultado Esperado:**
```
/backup     50G  15G  35G  30% /backup
/app        20G  5G   15G  25% /app

5.2G    /app/lab-gitflow

-rw-r--r-- 1 user user 500M Nov 10 02:00 lab-gitflow-2025-11-10.tar.gz
```

**Validação:**
- [ ] Espaço disponível > 2x tamanho da aplicação
- [ ] Diretório de backup é acessível e gravável
- [ ] Nenhum processo de backup em execução
- [ ] Backups anteriores existem e são recentes

**Se houver erro:**
- Consulte seção [Troubleshooting - Problema 1](#problema-1-espaço-insuficiente)

---

#### Passo 1.2: Criar Diretório de Backup do Dia
**Objetivo:** Organizar backups por data para facilitar gestão

**Comandos:**
```bash
# Definir variáveis
BACKUP_DATE=$(date +%Y-%m-%d)
BACKUP_TIME=$(date +%H%M%S)
BACKUP_DIR="/backup/lab-gitflow-${BACKUP_DATE}"
APP_DIR="/app/lab-gitflow"

# Criar diretório
mkdir -p "${BACKUP_DIR}"

# Verificar criação
ls -ld "${BACKUP_DIR}"

# Criar arquivo de log
BACKUP_LOG="${BACKUP_DIR}/backup-${BACKUP_TIME}.log"
touch "${BACKUP_LOG}"

# Log inicial
echo "=== Backup iniciado em $(date) ===" | tee -a "${BACKUP_LOG}"
```

**Resultado Esperado:**
```
drwxr-xr-x 2 user user 4096 Nov 11 02:00 /backup/lab-gitflow-2025-11-11
=== Backup iniciado em Mon Nov 11 02:00:15 UTC 2025 ===
```

**Validação:**
- [ ] Diretório criado com permissões corretas
- [ ] Arquivo de log criado
- [ ] Variáveis definidas corretamente

---

### Fase 2: Backup do Código (Git)

#### Passo 2.1: Verificar Estado do Repositório
**Objetivo:** Garantir que repositório está sincronizado e limpo

**Comandos:**
```bash
cd "${APP_DIR}"

# Verificar status
git status | tee -a "${BACKUP_LOG}"

# Verificar branch atual
git branch --show-current | tee -a "${BACKUP_LOG}"

# Listar últimos commits
git log --oneline -5 | tee -a "${BACKUP_LOG}"

# Verificar remote configurado
git remote -v | tee -a "${BACKUP_LOG}"
```

**Resultado Esperado:**
```
On branch main
Your branch is up to date with 'origin/main'.
nothing to commit, working tree clean

main

abc1234 Merge release/1.1.0 into main
def5678 chore(release): bump version to 1.1.0
...
```

**Validação:**
- [ ] Working tree está limpo
- [ ] Branch é main ou develop
- [ ] Remote configurado aponta para GitHub

---

#### Passo 2.2: Criar Backup Local do Repositório Git
**Objetivo:** Backup completo do repositório incluindo histórico

**Comandos:**
```bash
cd "${APP_DIR}"

# Backup usando git bundle (inclui histórico completo)
git bundle create "${BACKUP_DIR}/lab-gitflow-repo-${BACKUP_DATE}.bundle" --all

# Verificar bundle criado
git bundle verify "${BACKUP_DIR}/lab-gitflow-repo-${BACKUP_DATE}.bundle"

# Verificar tamanho
ls -lh "${BACKUP_DIR}"/lab-gitflow-repo-*.bundle

# Log
echo "Git bundle criado: $(ls -lh ${BACKUP_DIR}/lab-gitflow-repo-*.bundle)" | tee -a "${BACKUP_LOG}"
```

**Resultado Esperado:**
```
lab-gitflow-repo-2025-11-11.bundle is okay
-rw-r--r-- 1 user user 2.5M Nov 11 02:01 lab-gitflow-repo-2025-11-11.bundle
```

**Validação:**
- [ ] Bundle criado sem erros
- [ ] Verificação passou (bundle is okay)
- [ ] Tamanho do bundle é razoável (alguns MB)

**⚠️ ATENÇÃO:** Git bundle contém histórico completo. Para restauração, use `git clone arquivo.bundle`

---

#### Passo 2.3: Sincronizar com Repositório Remoto
**Objetivo:** Garantir que código está no GitHub (backup offsite)

**Comandos:**
```bash
cd "${APP_DIR}"

# Fetch para verificar sincronização
git fetch origin

# Verificar se local está atualizado
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)

echo "Local:  ${LOCAL}" | tee -a "${BACKUP_LOG}"
echo "Remote: ${REMOTE}" | tee -a "${BACKUP_LOG}"

if [ "${LOCAL}" = "${REMOTE}" ]; then
    echo "✓ Repositório sincronizado com remote" | tee -a "${BACKUP_LOG}"
else
    echo "⚠ Repositório não sincronizado!" | tee -a "${BACKUP_LOG}"
    # Push se necessário
    git push origin main
fi
```

**Resultado Esperado:**
```
Local:  abc1234567890abcdef1234567890abcdef12345
Remote: abc1234567890abcdef1234567890abcdef12345
✓ Repositório sincronizado com remote
```

**Validação:**
- [ ] Local e remote têm mesmo commit hash
- [ ] Push executado se necessário
- [ ] Nenhum erro reportado

---

### Fase 3: Backup de Runtime e Configurações

#### Passo 3.1: Backup de Arquivos de Configuração
**Objetivo:** Salvar configurações e environment files

**Comandos:**
```bash
cd "${APP_DIR}"

# Criar lista de arquivos de configuração
CONFIG_FILES="
package.json
package-lock.json
.gitignore
.env.production
ecosystem.config.js
nginx.conf
"

# Criar diretório para configs
mkdir -p "${BACKUP_DIR}/configs"

# Copiar cada arquivo (se existir)
for file in ${CONFIG_FILES}; do
    if [ -f "${file}" ]; then
        cp -p "${file}" "${BACKUP_DIR}/configs/" 2>&1 | tee -a "${BACKUP_LOG}"
        echo "✓ Copiado: ${file}" | tee -a "${BACKUP_LOG}"
    else
        echo "⚠ Não encontrado: ${file}" | tee -a "${BACKUP_LOG}"
    fi
done

# Listar configs copiados
ls -lh "${BACKUP_DIR}/configs/" | tee -a "${BACKUP_LOG}"
```

**Resultado Esperado:**
```
✓ Copiado: package.json
✓ Copiado: package-lock.json
✓ Copiado: .gitignore
✓ Copiado: ecosystem.config.js

total 160K
-rw-r--r-- 1 user user  202 Nov 11 02:02 package.json
-rw-r--r-- 1 user user 153K Nov 11 02:02 package-lock.json
...
```

**Validação:**
- [ ] Arquivos críticos foram copiados
- [ ] Permissões preservadas
- [ ] Nenhum erro de permissão

---

#### Passo 3.2: Backup de Aplicação Completa (TAR)
**Objetivo:** Criar arquivo comprimido de toda a aplicação

**⚠️ ATENÇÃO:** Este passo pode ser I/O intensivo. Monitorar impacto.

**Comandos:**
```bash
# Definir exclusões (node_modules será reinstalado)
EXCLUDE_PATTERNS="
--exclude=node_modules
--exclude=dist
--exclude=*.log
--exclude=.git
--exclude=.npm
--exclude=tmp
"

# Criar backup TAR com compressão
cd /app

tar czf "${BACKUP_DIR}/lab-gitflow-app-${BACKUP_DATE}.tar.gz" \
    ${EXCLUDE_PATTERNS} \
    --verbose \
    lab-gitflow/ 2>&1 | tee -a "${BACKUP_LOG}"

# Verificar arquivo criado
ls -lh "${BACKUP_DIR}"/lab-gitflow-app-*.tar.gz

# Log do tamanho
TAR_SIZE=$(du -h "${BACKUP_DIR}/lab-gitflow-app-${BACKUP_DATE}.tar.gz" | cut -f1)
echo "✓ Backup TAR criado: ${TAR_SIZE}" | tee -a "${BACKUP_LOG}"
```

**Resultado Esperado:**
```
lab-gitflow/
lab-gitflow/package.json
lab-gitflow/index.js
lab-gitflow/scripts/
lab-gitflow/scripts/build.js
...

-rw-r--r-- 1 user user 15M Nov 11 02:05 lab-gitflow-app-2025-11-11.tar.gz
✓ Backup TAR criado: 15M
```

**Validação:**
- [ ] Arquivo TAR criado sem erros
- [ ] Tamanho é razoável (sem node_modules deve ser ~10-50MB)
- [ ] Verbose output mostra arquivos sendo adicionados

---

#### Passo 3.3: Backup de Dependências (package-lock)
**Objetivo:** Garantir capacidade de reinstalar dependências exatas

**Comandos:**
```bash
cd "${APP_DIR}"

# package-lock.json já foi copiado, mas vamos criar backup adicional
# com lista de dependências instaladas
npm list --depth=0 --json > "${BACKUP_DIR}/npm-dependencies-${BACKUP_DATE}.json"

# Versão simplificada
npm list --depth=0 > "${BACKUP_DIR}/npm-dependencies-${BACKUP_DATE}.txt"

# Log
echo "✓ Lista de dependências salva" | tee -a "${BACKUP_LOG}"
cat "${BACKUP_DIR}/npm-dependencies-${BACKUP_DATE}.txt" | tee -a "${BACKUP_LOG}"
```

**Resultado Esperado:**
```
lab-gitflow-demo@1.1.0 /app/lab-gitflow
└── jest@29.7.0

✓ Lista de dependências salva
```

**Validação:**
- [ ] Arquivos JSON e TXT criados
- [ ] Dependências listadas corretamente

---

### Fase 4: Verificação e Integridade

#### Passo 4.1: Gerar Checksums dos Backups
**Objetivo:** Criar hashes para verificação de integridade futura

**Comandos:**
```bash
cd "${BACKUP_DIR}"

# Gerar MD5 checksums
find . -type f \( -name "*.tar.gz" -o -name "*.bundle" \) -exec md5sum {} \; > checksums-md5.txt

# Gerar SHA256 checksums (mais seguro)
find . -type f \( -name "*.tar.gz" -o -name "*.bundle" \) -exec sha256sum {} \; > checksums-sha256.txt

# Exibir checksums
echo "=== MD5 Checksums ===" | tee -a "${BACKUP_LOG}"
cat checksums-md5.txt | tee -a "${BACKUP_LOG}"

echo "=== SHA256 Checksums ===" | tee -a "${BACKUP_LOG}"
cat checksums-sha256.txt | tee -a "${BACKUP_LOG}"
```

**Resultado Esperado:**
```
=== MD5 Checksums ===
5d41402abc4b2a76b9719d911017c592  ./lab-gitflow-app-2025-11-11.tar.gz
098f6bcd4621d373cade4e832627b4f6  ./lab-gitflow-repo-2025-11-11.bundle

=== SHA256 Checksums ===
e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855  ./lab-gitflow-app-2025-11-11.tar.gz
...
```

**Validação:**
- [ ] Checksums gerados para todos os arquivos
- [ ] Arquivos checksums-*.txt criados
- [ ] Nenhum erro reportado

---

#### Passo 4.2: Testar Integridade do TAR
**Objetivo:** Verificar que arquivo TAR não está corrompido

**Comandos:**
```bash
cd "${BACKUP_DIR}"

# Testar integridade do TAR
tar tzf lab-gitflow-app-${BACKUP_DATE}.tar.gz > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✓ Arquivo TAR íntegro e válido" | tee -a "${BACKUP_LOG}"
else
    echo "✗ ERRO: Arquivo TAR corrompido!" | tee -a "${BACKUP_LOG}"
    exit 1
fi

# Contar arquivos no TAR
FILE_COUNT=$(tar tzf lab-gitflow-app-${BACKUP_DATE}.tar.gz | wc -l)
echo "Total de arquivos no backup: ${FILE_COUNT}" | tee -a "${BACKUP_LOG}"
```

**Resultado Esperado:**
```
✓ Arquivo TAR íntegro e válido
Total de arquivos no backup: 42
```

**Validação:**
- [ ] Teste de integridade passou
- [ ] Número de arquivos é razoável (> 10)
- [ ] Nenhum erro de corrupção

---

#### Passo 4.3: Verificar Git Bundle
**Objetivo:** Confirmar que bundle Git está válido

**Comandos:**
```bash
cd "${BACKUP_DIR}"

# Verificar bundle
git bundle verify lab-gitflow-repo-${BACKUP_DATE}.bundle 2>&1 | tee -a "${BACKUP_LOG}"

if [ $? -eq 0 ]; then
    echo "✓ Git bundle válido" | tee -a "${BACKUP_LOG}"
else
    echo "✗ ERRO: Git bundle inválido!" | tee -a "${BACKUP_LOG}"
    exit 1
fi

# Listar refs no bundle
git bundle list-heads lab-gitflow-repo-${BACKUP_DATE}.bundle | tee -a "${BACKUP_LOG}"
```

**Resultado Esperado:**
```
lab-gitflow-repo-2025-11-11.bundle is okay
✓ Git bundle válido

abc1234567890abcdef1234567890abcdef12345 HEAD
abc1234567890abcdef1234567890abcdef12345 refs/heads/main
def5678901234abcdef5678901234abcdef56789 refs/heads/develop
```

**Validação:**
- [ ] Bundle verificado como okay
- [ ] Branches principais presentes (main, develop)
- [ ] Nenhum erro reportado

---

### Fase 5: Finalização e Documentação

#### Passo 5.1: Criar Manifesto do Backup
**Objetivo:** Documentar conteúdo e metadata do backup

**Comandos:**
```bash
cd "${BACKUP_DIR}"

# Criar manifesto
MANIFEST_FILE="MANIFEST-${BACKUP_DATE}.txt"

cat > "${MANIFEST_FILE}" << EOF
===========================================
BACKUP MANIFEST - lab-gitflow
===========================================

Data do Backup: $(date)
Servidor: $(hostname)
Usuário: $(whoami)
Versão da Aplicação: $(cd ${APP_DIR} && git describe --tags --always)

===========================================
CONTEÚDO DO BACKUP
===========================================

$(ls -lh)

===========================================
CHECKSUMS MD5
===========================================

$(cat checksums-md5.txt)

===========================================
CHECKSUMS SHA256
===========================================

$(cat checksums-sha256.txt)

===========================================
ESTRUTURA DE DIRETÓRIOS
===========================================

$(tree -L 2 2>/dev/null || find . -maxdepth 2 -type d)

===========================================
NOTAS
===========================================

- Git repository backup: $(ls -lh *-repo-*.bundle)
- Application backup: $(ls -lh *-app-*.tar.gz)
- Configs backup: configs/

Para restaurar:
1. Git: git clone lab-gitflow-repo-${BACKUP_DATE}.bundle
2. App: tar xzf lab-gitflow-app-${BACKUP_DATE}.tar.gz

===========================================
EOF

# Exibir manifesto
cat "${MANIFEST_FILE}" | tee -a "${BACKUP_LOG}"
```

**Validação:**
- [ ] Manifesto criado com todas as informações
- [ ] Checksums incluídos
- [ ] Instruções de restauração presentes

---

#### Passo 5.2: Definir Permissões e Ownership
**Objetivo:** Garantir segurança dos arquivos de backup

**Comandos:**
```bash
cd "${BACKUP_DIR}"

# Definir ownership para usuário de backup
chown -R backupuser:backupgroup . 2>/dev/null || echo "Mantendo ownership atual"

# Remover permissões de escrita (read-only)
chmod -R u=rX,g=rX,o= .

# Verificar permissões
ls -la

# Log
echo "✓ Permissões configuradas (read-only)" | tee -a "${BACKUP_LOG}"
```

**Resultado Esperado:**
```
dr-xr-x--- 3 backupuser backupgroup 4096 Nov 11 02:10 .
-r--r----- 1 backupuser backupgroup  15M Nov 11 02:05 lab-gitflow-app-2025-11-11.tar.gz
-r--r----- 1 backupuser backupgroup 2.5M Nov 11 02:01 lab-gitflow-repo-2025-11-11.bundle
...
```

**Validação:**
- [ ] Arquivos são read-only
- [ ] Ownership apropriado
- [ ] Sem permissões para others (o=)

---

#### Passo 5.3: Limpar Backups Antigos
**Objetivo:** Implementar política de retenção (manter últimos 30 dias)

**Comandos:**
```bash
cd /backup

# Listar backups antigos (mais de 30 dias)
echo "=== Backups existentes ===" | tee -a "${BACKUP_LOG}"
ls -lht | head -20 | tee -a "${BACKUP_LOG}"

# Remover backups com mais de 30 dias
find /backup -name "lab-gitflow-*" -type d -mtime +30 -exec rm -rf {} \; 2>&1 | tee -a "${BACKUP_LOG}"

# Contar backups restantes
BACKUP_COUNT=$(find /backup -name "lab-gitflow-*" -type d | wc -l)
echo "Total de backups mantidos: ${BACKUP_COUNT}" | tee -a "${BACKUP_LOG}"

# Espaço utilizado
echo "=== Espaço utilizado por backups ===" | tee -a "${BACKUP_LOG}"
du -sh /backup/lab-gitflow-* | tee -a "${BACKUP_LOG}"
```

**Resultado Esperado:**
```
=== Backups existentes ===
drwxr-x--- 3 user user 4096 Nov 11 02:10 lab-gitflow-2025-11-11
drwxr-x--- 3 user user 4096 Nov 10 02:00 lab-gitflow-2025-11-10
...

Total de backups mantidos: 30

=== Espaço utilizado por backups ===
18M    /backup/lab-gitflow-2025-11-11
17M    /backup/lab-gitflow-2025-11-10
...
```

**Validação:**
- [ ] Backups antigos removidos conforme política
- [ ] Backups recentes (< 30 dias) mantidos
- [ ] Espaço em disco monitorado

---

#### Passo 5.4: Finalizar e Logar Conclusão
**Objetivo:** Registrar conclusão bem-sucedida do backup

**Comandos:**
```bash
cd "${BACKUP_DIR}"

# Log de finalização
echo "=== Backup concluído em $(date) ===" | tee -a "${BACKUP_LOG}"
echo "Duração: $SECONDS segundos" | tee -a "${BACKUP_LOG}"
echo "Diretório: ${BACKUP_DIR}" | tee -a "${BACKUP_LOG}"
echo "Status: SUCCESS" | tee -a "${BACKUP_LOG}"

# Criar symlink para "latest"
ln -sfn "${BACKUP_DIR}" /backup/lab-gitflow-latest

# Enviar notificação (opcional)
# echo "Backup concluído: ${BACKUP_DIR}" | mail -s "Backup Success" ops@example.com
```

**Resultado Esperado:**
```
=== Backup concluído em Mon Nov 11 02:15:30 UTC 2025 ===
Duração: 930 segundos
Diretório: /backup/lab-gitflow-2025-11-11
Status: SUCCESS
```

**Validação:**
- [ ] Log finalizado com status SUCCESS
- [ ] Symlink "latest" criado
- [ ] Duração registrada

---

## ✅ Validação do Procedimento

Execute estas verificações para confirmar sucesso:

### Checklist de Validação

- [ ] **Verificação 1: Arquivos de Backup Existem**
  ```bash
  ls -lh /backup/lab-gitflow-$(date +%Y-%m-%d)/
  ```
  Resultado esperado: Diretório existe com arquivos .tar.gz e .bundle

- [ ] **Verificação 2: Integridade dos Backups**
  ```bash
  cd /backup/lab-gitflow-$(date +%Y-%m-%d)
  md5sum -c checksums-md5.txt
  ```
  Resultado esperado: Todos os checksums OK

- [ ] **Verificação 3: Git Bundle Válido**
  ```bash
  git bundle verify /backup/lab-gitflow-latest/*-repo-*.bundle
  ```
  Resultado esperado: "bundle is okay"

- [ ] **Verificação 4: TAR Íntegro**
  ```bash
  tar tzf /backup/lab-gitflow-latest/*-app-*.tar.gz | head -5
  ```
  Resultado esperado: Lista de arquivos sem erros

- [ ] **Verificação 5: Espaço em Disco**
  ```bash
  df -h /backup
  ```
  Resultado esperado: Ainda há espaço disponível (> 10GB)

### Teste de Restauração Rápida

Para garantir que backups são realmente restauráveis:

```bash
# Criar diretório temporário de teste
mkdir -p /tmp/restore-test
cd /tmp/restore-test

# Testar restauração do Git
git clone /backup/lab-gitflow-latest/*-repo-*.bundle test-git
cd test-git && git log --oneline -3 && cd ..

# Testar restauração do TAR
tar xzf /backup/lab-gitflow-latest/*-app-*.tar.gz -C .
ls -la lab-gitflow/

# Limpar
cd / && rm -rf /tmp/restore-test
```

---

## 🔄 Procedimento de Rollback

Não aplicável - backup é operação read-only. Se backup falhou, simplesmente execute novamente.

### Em caso de Backup Corrompido

Se descobrir que backup está corrompido:

1. **Remover backup corrompido:**
```bash
rm -rf /backup/lab-gitflow-[DATA-CORROMPIDA]
```

2. **Executar novo backup:**
```bash
# Seguir procedimento completo novamente
```

3. **Verificar backups anteriores:**
```bash
# Validar que backup do dia anterior está íntegro
cd /backup/lab-gitflow-[DIA-ANTERIOR]
md5sum -c checksums-md5.txt
```

---

## 🔧 Troubleshooting

### Problema 1: Espaço Insuficiente

**Sintomas:**
- Erro "No space left on device"
- Backup incompleto
- Falha ao criar arquivo TAR

**Causa Raiz:**
- Disco de backup está cheio
- Backups antigos não foram removidos
- Aplicação cresceu significativamente

**Solução:**
```bash
# Verificar uso de espaço
df -h /backup

# Identificar backups grandes
du -sh /backup/* | sort -h

# Remover backups muito antigos (> 60 dias)
find /backup -name "lab-gitflow-*" -type d -mtime +60 -exec rm -rf {} \;

# Ou remover backups específicos manualmente
rm -rf /backup/lab-gitflow-2025-08-*

# Verificar espaço liberado
df -h /backup
```

**Verificação:**
- [ ] Espaço disponível > 5GB
- [ ] Backups críticos mantidos
- [ ] Policy de retenção ajustada se necessário

---

### Problema 2: Falha ao Criar Git Bundle

**Sintomas:**
- Erro ao executar `git bundle create`
- Bundle verify falha
- Erro "fatal: ref ... not found"

**Causa Raiz:**
- Repositório corrompido
- Referências quebradas
- .git directory com problemas

**Solução:**
```bash
cd /app/lab-gitflow

# Verificar integridade do repositório
git fsck --full

# Reparar referências
git gc --prune=now

# Atualizar refs
git fetch origin --prune

# Tentar bundle novamente
git bundle create /tmp/test.bundle --all
git bundle verify /tmp/test.bundle
```

**Verificação:**
- [ ] `git fsck` não reporta erros
- [ ] Bundle criado com sucesso
- [ ] Verify passa

---

### Problema 3: TAR com Permissões Incorretas

**Sintomas:**
- Erro ao criar TAR: "Permission denied"
- Alguns arquivos não incluídos no backup
- TAR menor que esperado

**Causa Raiz:**
- Usuário não tem permissões de leitura em alguns arquivos
- Arquivos especiais (sockets, pipes)
- Symlinks quebrados

**Solução:**
```bash
# Executar com sudo se necessário
sudo tar czf backup.tar.gz \
    --exclude=node_modules \
    --warning=no-file-changed \
    /app/lab-gitflow/

# Ou ajustar permissões antes
sudo chmod -R +r /app/lab-gitflow
```

**Verificação:**
- [ ] TAR criado sem erros de permissão
- [ ] Tamanho do TAR é consistente
- [ ] Listagem do TAR completa

---

### Problema 4: Checksum Não Bate

**Sintomas:**
- `md5sum -c` reporta FAILED
- Arquivo foi modificado após backup
- Possível corrupção

**Causa Raiz:**
- Arquivo modificado após cálculo do checksum
- Corrupção durante transferência
- Problema de hardware (disco)

**Solução:**
```bash
# Recalcular checksum
cd /backup/lab-gitflow-[DATA]
md5sum arquivo.tar.gz

# Comparar com checksum original
grep arquivo.tar.gz checksums-md5.txt

# Se diferente, verificar integridade do arquivo
tar tzf arquivo.tar.gz > /dev/null

# Se TAR estiver OK, atualizar checksum
md5sum arquivo.tar.gz > checksums-md5.txt.new

# Se TAR estiver corrompido, refazer backup
rm arquivo.tar.gz
# Executar backup novamente
```

**Verificação:**
- [ ] Checksums batem
- [ ] Arquivo íntegro
- [ ] Causa identificada e corrigida

---

## 🔗 Rastreabilidade

### Runbooks Relacionados

| Runbook | Relação | Quando Usar |
|---------|---------|-------------|
| [RB-001](./RB-001-deploy-manual.md) | Dependente | Este backup deve ser executado ANTES de qualquer deploy |
| [RB-003](./RB-003-restauracao.md) | Complementar | Usa backups criados por este procedimento para restaurar sistema |
| [RB-TEMPLATE](./RB-TEMPLATE.md) | Referência | Template usado para criar este runbook |

### Referências Externas

1. **GNU Tar Manual**
   - URL: https://www.gnu.org/software/tar/manual/
   - Seção relevante: Capítulos 2 (Tutorial) e 6 (Options)
   - Uso: Referência completa para opções de backup com tar

2. **Git Bundle Documentation**
   - URL: https://git-scm.com/docs/git-bundle
   - Seção relevante: Examples
   - Uso: Como criar e verificar bundles Git

3. **Backup Best Practices**
   - URL: https://www.backblaze.com/blog/the-3-2-1-backup-strategy/
   - Seção relevante: 3-2-1 Rule
   - Uso: Estratégia de backup (3 cópias, 2 mídias diferentes, 1 offsite)

4. **File System Checksums**
   - URL: https://en.wikipedia.org/wiki/Checksum
   - Seção relevante: MD5 and SHA-256
   - Uso: Entender importância de checksums para integridade

### Histórico de Mudanças

| Versão | Data | Autor | Mudanças |
|--------|------|-------|----------|
| 1.0.0 | 2025-11-11 | Equipe Operações | Versão inicial do runbook de backup |

### Incidentes Relacionados

| ID Incidente | Data | Descrição | Melhorias Implementadas |
|--------------|------|-----------|------------------------|
| - | - | Nenhum incidente registrado ainda | - |

---

## 📄 Resumo Objetivo

### Visão Geral
Este runbook documenta procedimento híbrido de backup combinando Git bundle para código-fonte e TAR para runtime, oferecendo proteção completa contra perda de dados. O processo inclui validação de integridade via checksums, manifesto detalhado, e política de retenção de 30 dias, executável manualmente ou via automação (cron/systemd timer).

### Pontos-Chave
- **Objetivo:** Proteção completa de código, configurações e runtime
- **Duração:** 15-20 minutos (execução normal)
- **Complexidade:** Média (scripts podem ser automatizados)
- **Impacto:** Baixo (execução em horário de baixo tráfego)
- **Pré-requisitos críticos:** Espaço em disco adequado (> 5GB), acesso SSH, ferramentas instaladas

### Quando Usar
Este runbook deve ser utilizado:
1. **Diariamente às 02h00** (backup programado via cron)
2. **Antes de qualquer deploy** (RB-001 depende deste)
3. **Antes de manutenções críticas** (updates de dependências, migrations)
4. **Após mudanças significativas** no código ou configurações
5. **Sob demanda** quando solicitado por auditoria ou compliance

### Principais Riscos
1. **Espaço insuficiente:** Disco cheio impede backup - Mitigar com monitoramento de espaço e rotação automática
2. **Backup corrompido:** Arquivo não restaurável - Mitigar com validação de checksums e teste de integridade
3. **Falta de backup offsite:** Perda em desastre físico - Mitigar com push Git para GitHub (offsite natural)
4. **Execução não monitorada:** Falhas silenciosas - Mitigar com logs detalhados e alertas

### Resultados Esperados
Após execução bem-sucedida:
- ✅ Git bundle criado e verificado
- ✅ Arquivo TAR comprimido com aplicação
- ✅ Configurações backupeadas separadamente
- ✅ Checksums MD5 e SHA256 gerados
- ✅ Manifesto documentando conteúdo
- ✅ Permissões configuradas (read-only)
- ✅ Backup testado para integridade
- ✅ Backups antigos removidos (> 30 dias)
- ✅ Logs completos gerados

### Dependências
- **Antes:** Nenhuma (pode ser executado a qualquer momento)
- **Depois:** [RB-003](./RB-003-restauracao.md) - Usa estes backups para restauração
- **Integração:** [RB-001](./RB-001-deploy-manual.md) - Deve executar este backup antes de deploy

### Automação Recomendada

Script cron sugerido (`/etc/cron.d/lab-gitflow-backup`):
```cron
# Backup diário às 02h00
0 2 * * * backupuser /opt/scripts/lab-gitflow-backup.sh >> /var/log/backup.log 2>&1

# Backup pré-deploy (executar manualmente antes de RB-001)
```

---

**📌 Nota:** Backups são inúteis se não testados. Recomenda-se executar restauração de teste mensalmente.

**Última revisão:** 2025-11-11  
**Próxima revisão:** 2026-02-11 (trimestral)

**⚠️ IMPORTANTE:** Seguir regra 3-2-1 de backup:
- **3** cópias dos dados (original + 2 backups)
- **2** mídias diferentes (disco local + GitHub)
- **1** cópia offsite (GitHub funciona como offsite)
