# Mini-Lab GitFlow
# 🧪 Lab GitFlow  
> Repositório-laboratório criado para **experimentar Git Flow, versionamento semântico, CI/CD e testes automatizados** em um projeto Node.js minimalista.

![Banner](banner.png)

---
## Descrição:
- Utilizar pipeline de CI/CD configurado no GitHub Actions
- Trigger automático ao criar tag na branch main
- Executa testes, build e deploy automaticamente
  
## Prós:
✅ Processo totalmente automatizado
✅ Reduz erro humano
✅ Logs centralizados no GitHub Actions
✅ Rollback mais rápido através de rerun
✅ Notificações automáticas de status

## Contras:
❌ Dependência da disponibilidade do GitHub
❌ Menor controle granular em situações específicas
❌ Pode ser mais lento em casos de urgência
❌ Custos de minutos de CI/CD

## Deploy Híbrido (Manual com Automação)
## Descrição:

- Preparação manual seguindo Git Flow
- Criação de release branch e tag manual
- Automação através de CI/CD para deploy efetivo
- Validações manuais antes e depois

## Prós:
✅ Balanceamento entre controle e automação
✅ Validações críticas mantidas manuais
✅ Deploy consistente via automação
✅ Boa rastreabilidade
✅ Flexibilidade em situações especiais

## Contras:
❌ Requer mais passos que deploy totalmente automático
❌ Curva de aprendizado maior
❌ Possibilidade de erro nas etapas manuais

⭐ Opção Escolhida: Deploy Híbrido

## Justificativa:

- Oferece melhor balanceamento entre segurança e eficiência
- Mantém controle humano nas decisões críticas (quando fazer deploy, qual versão)
- Aproveita automação para passos repetitivos e propensos a erro
- Adequado para equipes pequenas com necessidade de rastreabilidade
- Alinha-se com as práticas de Git Flow já implementadas no projeto
- Permite validação antes do deploy efetivo

## Visão Geral
Este repositório contém runbook e documenta o processo híbrido de deploy manual em produção usando Git Flow, combinando preparação manual cuidadosa com automação via CI/CD. O procedimento garante deployment seguro através de validações em múltiplos pontos, versionamento semântico adequado, e rastreabilidade completa de todas as mudanças desde develop até produção.

## Pontos-Chave
Objetivo: Deploy seguro e rastreável seguindo Git Flow
Duração: 25-40 minutos (normal), até 1h (com problemas)
Complexidade: Média-Alta (requer conhecimento de Git Flow)
Impacto: Alto (aplicação ficará indisponível por 2-5 minutos)

## ✨ O que pratiquei

| Tema | Conceitos praticados |
|------|---------------------|
| **Git Flow** | *Branches* `main`, `develop`, `feature/*`, `release/*`, `hotfix/*`; merges via Pull Request; tags de versão (`v1.0.0 → v1.0.9`) geradas automaticamente. |
| **Versionamento semântico + CHANGELOG** | Versões `MAJOR.MINOR.PATCH` e changelog incremental publicado em **GitHub Releases** via *github-actions*. 
| **CI com GitHub Actions** | Pipeline dispara em *push*, executa `npm ci`, `npm test`, `npm run build`, gera artefatos e cria *release* quando necessário. |
| **Node.js básico** | Função `sum(a,b)` ➡️ teste em Jest (`sum.test.js`) ➡️ build simples que copia para `dist/`.
| **Boas práticas de repo** | `README`, `CONTRIBUTING.md`, `.gitignore`, licença MIT e banner.

---

## 🌊 Fluxo Git Flow Resumido

```
main ─┬─► hotfix/… ───┐
     │                │
     ├─► develop ─┬─► release/… ──► main (+tag)
     │            │
     │            └─► feature/…
     └───────────────(merge back)───────────────┘
```

### 📋 Tipos de Branch

| Branch | Origem | Destino | Propósito |
|--------|--------|---------|-----------|
| `feature/*` | `develop` | `develop` | Desenvolvimento de novas funcionalidades |
| `release/*` | `develop` | `main` + `develop` | Preparação de release (apenas bug-fixes) |
| `hotfix/*` | `main` | `main` + `develop` | Correções urgentes em produção |
| `develop` | `main` | - | Branch de integração |
| `main` | - | - | Código em produção |

### 🔄 Fluxo de Trabalho

1. **Feature Branches**: Partem de `develop`, entregam código + testes
2. **Release Branches**: Congelam versão; apenas bug-fixes até estar pronta
3. **Main**: Recebe merge da release + tag gerada automaticamente pelo pipeline
4. **Hotfix Branches**: Partem de `main` para correções urgentes em produção

---

## 📑 Conventional Commits & Semantic Release

### Prefixos de Commit

Os prefixos ajudam o bot a gerar o CHANGELOG e definir o tipo de bump:

| Prefixo | Exemplo |
|---------|---------|
| `feat` | `feat(login): adiciona form de autenticação` |
| `fix` | `fix(auth): corrige validação de senha` |
| `docs` | `docs(readme): atualiza instruções de instalação` |
| `chore` | `chore(deps): atualiza dependências` |

### Exemplo de Commit

```bash
feat(login): adiciona form de autenticação

- Implementa validação de email e senha
- Adiciona testes unitários para o componente
- Integra com API de autenticação

Closes #123
```

---

## 🛠️ Scripts NPM Úteis

| Script | Função |
|--------|--------|
| `npm test` | Executa Jest (CI falha se houver falhas) |
| `npm run build` | Copia `index.js` para `dist/` |
| `npm ci` | Instala dependências usando lockfile |

---

## 🤝 Como Contribuir

1. **Fork** o repositório
2. Crie uma **branch** `feature/<sua-feature>` a partir de `develop`
3. Faça **commits** seguindo o padrão [Conventional Commits](#-conventional-commits--semantic-release)
4. Abra um **Pull Request** contra `develop`
5. O pipeline garante que testes passem antes do merge

### 📋 Checklist para PR

- [ ] Commits seguem padrão Conventional Commits
- [ ] Testes passam localmente (`npm test`)
- [ ] Build funciona (`npm run build`)
- [ ] Descrição clara do que foi implementado

> **💡 Dica:** Consulte `CONTRIBUTING.md` para mais detalhes sobre o processo de contribuição.

---

## 📚 Documentação Técnica

### Análise e Explicação de Código

| Documento | Descrição |
|-----------|-----------|
| [Explicação do Código e Rollback](./EXPLICACAO-CODIGO-E-ROLLBACK.md) | Análise técnica detalhada do funcionamento do código e procedimentos de rollback em produção |

### Runbooks Operacionais

Documentação completa de procedimentos operacionais críticos:

| Runbook | Descrição |
|---------|-----------|
| [Índice de Runbooks](./runbooks/README.md) | Guia principal e índice de todos os runbooks |
| [RB-001: Deploy Manual](./runbooks/RB-001-deploy-manual.md) | Procedimento completo para deploy em produção |
| [RB-002: Backup](./runbooks/RB-002-backup.md) | Procedimento de backup do sistema |
| [RB-003: Restauração](./runbooks/RB-003-restauracao.md) | Procedimento de restauração a partir de backup |

> **💡 Dica:** Consulte os runbooks antes de executar operações críticas como deploy ou restauração.

---

<br>

> **Dica:** Para ver os *workflows* completos, abra a aba **Actions** no GitHub. 😉

---

## 🚀 Como rodar localmente

```bash
# 1. clone
git clone git@github.com:Daian4/lab-gitflow.git
cd lab-gitflow

# 2. instale dependências
npm ci        # usa lockfile para reprodutibilidade

# 3. execute os testes
npm test      # roda Jest

# 4. build
npm run build # gera dist/index.js
```

---

## ⚖️ Licença

Este projeto está licenciado sob os termos da [MIT License](LICENSE).
