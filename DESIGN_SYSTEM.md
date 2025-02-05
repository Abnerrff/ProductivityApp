# Sistema de Design

## Visão Geral

Este sistema de design foi criado para fornecer uma experiência de usuário consistente, acessível e agradável em nossa aplicação de produtividade.

## Paleta de Cores

### Tema Escuro
- **Background**:
  - Mais escuro: `#121212`
  - Escuro: `#1E1E1E`
  - Médio Escuro: `#2C2C2C`
  - Médio: `#3A3A3A`
  - Claro Escuro: `#4A4A4A`

- **Texto**:
  - Primário: `#E0E0E0`
  - Secundário: `#9E9E9E`
  - Muted: `#6E6E6E`

- **Acentuação**:
  - Primário (Verde): `#4CAF50`
  - Secundário (Azul): `#2196F3`
  - Perigo: `#F44336`
  - Aviso: `#FF9800`
  - Informação: `#00BCD4`

### Tema Claro
- **Background**:
  - Mais claro: `#FFFFFF`
  - Claro: `#F5F5F5`
  - Médio Claro: `#E0E0E0`
  - Médio: `#D3D3D3`
  - Escuro Claro: `#C0C0C0`

- **Texto**:
  - Primário: `#333333`
  - Secundário: `#666666`
  - Muted: `#999999`

## Espaçamento

Nosso sistema de espaçamento segue uma escala progressiva baseada em múltiplos de 0.25rem:

- Extra Pequeno (xs): `0.25rem`
- Pequeno (sm): `0.5rem`
- Médio (md): `1rem`
- Grande (lg): `1.5rem`
- Extra Grande (xl): `2rem`
- Duplo Extra Grande (2xl): `3rem`
- Triplo Extra Grande (3xl): `4rem`

### Princípios de Espaçamento
- Consistência entre componentes
- Hierarquia visual clara
- Legibilidade e respiração do design

## Tipografia

### Família de Fontes
- Fonte Primária: `Inter`
- Fallback: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue'`
- Estilo: Sans-serif, moderno e limpo

### Tamanhos de Fonte
- Extra Pequeno (xs): `0.75rem`
- Pequeno (sm): `0.875rem`
- Base: `1rem`
- Grande (lg): `1.125rem`
- Extra Grande (xl): `1.25rem`
- 2x Extra Grande (2xl): `1.5rem`
- 3x Extra Grande (3xl): `1.875rem`
- 4x Extra Grande (4xl): `2.25rem`

### Pesos de Fonte
- Fino: `100`
- Leve: `300`
- Normal: `400`
- Médio: `500`
- Semi-Negrito: `600`
- Negrito: `700`
- Extra Negrito: `800`
- Black: `900`

### Princípios Tipográficos
- Legibilidade em primeiro lugar
- Hierarquia clara
- Consistência entre componentes
- Atenção à densidade e espaçamento

## Sistema de Temas

### Alternância de Tema
- Suporte para tema claro e escuro
- Salvamento de preferência do usuário
- Transição suave entre temas

### Implementação
- Tokens de design em `design-tokens.js`
- Componente de alternância de tema em `ThemeToggle.vue`
- Variáveis CSS globais para fácil personalização

## Componentes

### Princípios de Design de Componentes
1. **Consistência Visual**
   - Uso uniforme de cores, espaçamento e tipografia
   - Comportamento previsível entre componentes

2. **Acessibilidade**
   - Contraste de cores adequado
   - Suporte a leitores de tela
   - Navegação por teclado

3. **Responsividade**
   - Design adaptável a diferentes tamanhos de tela
   - Breakpoints definidos de forma consistente

### Tipos de Componentes

#### Botões
- Estados: Padrão, Hover, Desabilitado, Foco
- Transições suaves
- Ícones integrados
- Variações: Primário, Secundário, Terciário

#### Inputs
- Bordas arredondadas
- Estados de foco claros
- Validação e feedback
- Suporte a ícones e labels

#### Modais e Diálogos
- Sobreposição com fundo semi-transparente
- Animações de entrada/saída
- Fechamento por ESC e clique fora

## Princípios de Design

1. **Consistência**: Manter uma linguagem visual uniforme
2. **Acessibilidade**: Garantir legibilidade e contraste
3. **Minimalismo**: Foco na funcionalidade e clareza
4. **Animações Sutis**: Transições que melhoram a experiência sem distrair

## Metodologia de Desenvolvimento

### Tokens de Design
- Definição centralizada de variáveis
- Fácil manutenção e atualização
- Separação de preocupações

### Documentação Viva
- Documentação sempre atualizada
- Exemplos práticos de uso
- Guia de estilo em constante evolução

## Métricas e Testes

### Acessibilidade
- Teste de contraste de cores
- Suporte a leitores de tela
- Navegação por teclado
- Conformidade com WCAG 2.1

### Performance
- Tamanho mínimo de arquivos CSS
- Renderização eficiente
- Transições leves

## Próximos Passos

1. **Biblioteca de Componentes**
   - Catálogo interativo
   - Exemplos de uso
   - Variações e estados

2. **Testes Automatizados**
   - Testes de acessibilidade
   - Validação de design
   - Consistência entre componentes

3. **Tema Claro Refinado**
   - Ajustes finos no tema claro
   - Teste de usabilidade

4. **Documentação Expandida**
   - Guia de contribuição
   - Princípios de design detalhados
   - Casos de uso

---

**Última Atualização**: 05 de fevereiro de 2025
**Versão**: 1.1.0
