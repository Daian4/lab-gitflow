# RB-XXX: [Título do Procedimento]

> **ID:** RB-XXX  
> **Versão:** 1.0.0  
> **Data de Criação:** YYYY-MM-DD  
> **Última Atualização:** YYYY-MM-DD  
> **Autor:** [Nome do Autor]  
> **Responsável:** [Nome do Responsável]

---

## 🎯 Objetivo

Descreva claramente o que este procedimento realiza e qual problema ele resolve.

**Exemplo:**
- Este runbook documenta o procedimento para [ação específica]
- Garante execução segura e consistente de [tarefa]
- Minimiza riscos de [problema específico]

---

## 📋 Pré-requisitos

### Permissões Necessárias
- [ ] Acesso ao servidor [nome]
- [ ] Permissões de [tipo]
- [ ] Credenciais de [sistema]

### Ferramentas Requeridas
- [ ] [Ferramenta 1] versão X.X ou superior
- [ ] [Ferramenta 2] instalada e configurada
- [ ] Acesso a [recurso específico]

### Conhecimentos Prévios
- Familiaridade com [tecnologia/conceito]
- Entendimento de [processo relacionado]
- Experiência com [ferramenta/sistema]

### Validações Iniciais
```bash
# Exemplo de comandos de validação
comando --version
verificar-acesso --teste
```

---

## 🔍 Análise de Opções

### Opção 1: [Nome da Opção]

**Descrição:**
- [Como funciona esta abordagem]

**Prós:**
- ✅ [Vantagem 1]
- ✅ [Vantagem 2]
- ✅ [Vantagem 3]

**Contras:**
- ❌ [Desvantagem 1]
- ❌ [Desvantagem 2]

### Opção 2: [Nome da Opção]

**Descrição:**
- [Como funciona esta abordagem]

**Prós:**
- ✅ [Vantagem 1]
- ✅ [Vantagem 2]

**Contras:**
- ❌ [Desvantagem 1]
- ❌ [Desvantagem 2]

### ⭐ Opção Escolhida: [Opção X]

**Justificativa:**
- [Razão 1 para escolha desta opção]
- [Razão 2 considerando contexto do projeto]
- [Razão 3 baseada em experiências anteriores]

---

## 📊 Análise de Impacto

### Sistemas Afetados
| Sistema | Tipo de Impacto | Severidade | Observações |
|---------|-----------------|------------|-------------|
| [Sistema 1] | [Indisponibilidade/Lentidão/Outro] | Alta/Média/Baixa | [Detalhes] |
| [Sistema 2] | [Tipo] | [Severidade] | [Detalhes] |

### Estimativas de Tempo
- **Preparação:** [X minutos]
- **Execução:** [Y minutos]
- **Validação:** [Z minutos]
- **Total:** [Tempo total estimado]

### Janela de Manutenção
- **Horário recomendado:** [Período de menor impacto]
- **Duração necessária:** [Tempo total + margem]
- **Notificação prévia:** [Tempo de antecedência]

### Riscos Identificados

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| [Descrição do risco 1] | Alta/Média/Baixa | Alto/Médio/Baixo | [Como mitigar] |
| [Descrição do risco 2] | [Prob.] | [Impacto] | [Mitigação] |

---

## 📝 Procedimento Passo a Passo

### Fase 1: Preparação

#### Passo 1.1: [Descrição da Ação]
**Objetivo:** [O que este passo realiza]

**Comandos:**
```bash
# Comentário explicativo
comando1 --parametro valor
comando2 --flag
```

**Resultado Esperado:**
```
[Output esperado do comando]
```

**Validação:**
- [ ] [Verificação 1]
- [ ] [Verificação 2]

**Se houver erro:**
- Consulte seção [Troubleshooting - Erro X](#troubleshooting)

---

#### Passo 1.2: [Descrição da Ação]
**Objetivo:** [O que este passo realiza]

**Comandos:**
```bash
comando3 --parametro
```

**Validação:**
- [ ] [Verificação]

---

### Fase 2: Execução Principal

#### Passo 2.1: [Ação Principal]
**Objetivo:** [Descrição]

**⚠️ ATENÇÃO:** [Avisos importantes sobre este passo crítico]

**Comandos:**
```bash
# Este comando realiza [ação crítica]
comando-critico --parametro1 --parametro2
```

**Resultado Esperado:**
```
[Output]
```

**Validação:**
- [ ] [Verificação crítica 1]
- [ ] [Verificação crítica 2]

---

#### Passo 2.2: [Continuação]
**Objetivo:** [Descrição]

**Comandos:**
```bash
comando4
```

---

### Fase 3: Finalização

#### Passo 3.1: [Verificações Finais]
**Objetivo:** Garantir que tudo foi executado corretamente

**Comandos:**
```bash
# Verificar status
verificar-status --all
```

**Validação:**
- [ ] [Verificação final 1]
- [ ] [Verificação final 2]

---

## ✅ Validação do Procedimento

Execute estas verificações para confirmar sucesso:

### Checklist de Validação

- [ ] **Verificação 1:** [Descrição do que verificar]
  ```bash
  comando-verificacao-1
  ```
  Resultado esperado: [descrição]

- [ ] **Verificação 2:** [Descrição]
  ```bash
  comando-verificacao-2
  ```
  Resultado esperado: [descrição]

- [ ] **Verificação 3:** [Descrição]
  ```bash
  comando-verificacao-3
  ```
  Resultado esperado: [descrição]

### Testes Funcionais

1. **Teste 1:** [Nome do teste]
   - Executar: [ação]
   - Esperado: [resultado]

2. **Teste 2:** [Nome do teste]
   - Executar: [ação]
   - Esperado: [resultado]

---

## 🔄 Procedimento de Rollback

Se algo der errado, siga estes passos para reverter:

### Quando Executar Rollback
- [Condição 1 que indica necessidade de rollback]
- [Condição 2]
- [Condição 3]

### Passos de Rollback

#### Rollback 1: [Ação de Reversão]
```bash
# Reverter [ação específica]
comando-rollback-1
```

**Validação:**
- [ ] [Verificar se reversão foi bem-sucedida]

#### Rollback 2: [Ação de Reversão]
```bash
comando-rollback-2
```

**Validação:**
- [ ] [Verificação]

### Validação do Rollback

- [ ] Sistema voltou ao estado anterior
- [ ] [Verificação específica 1]
- [ ] [Verificação específica 2]

---

## 🔧 Troubleshooting

### Problema 1: [Descrição do Erro]

**Sintomas:**
- [Sintoma 1]
- [Sintoma 2]

**Causa Raiz:**
- [Explicação da causa]

**Solução:**
```bash
# Comandos para resolver
comando-solucao-1
comando-solucao-2
```

**Verificação:**
- [ ] [Como confirmar que foi resolvido]

---

### Problema 2: [Descrição do Erro]

**Sintomas:**
- [Sintoma observado]

**Causa Raiz:**
- [Explicação]

**Solução:**
```bash
comando-solucao
```

**Verificação:**
- [ ] [Confirmação]

---

### Problema 3: [Descrição do Erro]

**Sintomas:**
- [Sintomas]

**Causa Raiz:**
- [Causa]

**Solução:**
1. [Passo 1]
2. [Passo 2]
3. [Passo 3]

**Verificação:**
- [ ] [Como verificar resolução]

---

## 🔗 Rastreabilidade

### Runbooks Relacionados

| Runbook | Relação | Quando Usar |
|---------|---------|-------------|
| [RB-XXX](./RB-XXX.md) | Pré-requisito | Executar antes deste runbook |
| [RB-YYY](./RB-YYY.md) | Complementar | Para [situação específica] |
| [RB-ZZZ](./RB-ZZZ.md) | Rollback | Se precisar reverter este procedimento |

### Referências Externas

1. **[Título da Documentação Oficial]**
   - URL: [link]
   - Seção relevante: [qual parte consultar]
   - Uso: [como se relaciona com este runbook]

2. **[Título de Artigo/Tutorial]**
   - URL: [link]
   - Descrição: [resumo]
   - Uso: [aplicação]

3. **[Documentação Interna]**
   - Localização: [caminho/wiki]
   - Descrição: [conteúdo relevante]

### Histórico de Mudanças

| Versão | Data | Autor | Mudanças |
|--------|------|-------|----------|
| 1.0.0 | YYYY-MM-DD | [Nome] | Versão inicial |
| 1.0.1 | YYYY-MM-DD | [Nome] | [Descrição das mudanças] |
| 1.1.0 | YYYY-MM-DD | [Nome] | [Descrição das mudanças] |

### Incidentes Relacionados

| ID Incidente | Data | Descrição | Melhorias Implementadas |
|--------------|------|-----------|------------------------|
| INC-XXXX | YYYY-MM-DD | [Descrição breve] | [O que foi ajustado no runbook] |

---

## 📄 Resumo Objetivo

### Visão Geral
[Parágrafo resumindo o procedimento completo em 3-5 linhas]

### Pontos-Chave
- **Objetivo:** [O que este procedimento faz]
- **Duração:** [Tempo estimado total]
- **Complexidade:** [Baixa/Média/Alta]
- **Impacto:** [Descrição do impacto]
- **Pré-requisitos críticos:** [Lista dos mais importantes]

### Quando Usar
Este runbook deve ser utilizado quando:
1. [Situação 1]
2. [Situação 2]
3. [Situação 3]

### Principais Riscos
1. **[Risco 1]:** [Descrição e como mitigar]
2. **[Risco 2]:** [Descrição e como mitigar]

### Resultados Esperados
Após execução bem-sucedida:
- ✅ [Resultado 1]
- ✅ [Resultado 2]
- ✅ [Resultado 3]

### Dependências
- **Antes:** [RB-XXX] - [descrição]
- **Depois:** [RB-YYY] - [descrição]
- **Alternativa:** [RB-ZZZ] - [quando usar]

---

**📌 Nota:** Este é um template. Adapte as seções conforme necessário para seu procedimento específico.

**Última revisão:** YYYY-MM-DD  
**Próxima revisão:** YYYY-MM-DD
