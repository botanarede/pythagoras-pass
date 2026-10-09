# Lançamento de Pitágoras

> Jogo educativo de futebol da **RALECAB GAMES** ensinando o Teorema de Pitágoras através de passes precisos e cálculo da hipotenusa.

---

## ⚽ Visão Geral do Jogo
Em *Lançamento de Pitágoras*, o jogador atua como o meio-campista organizador que deve conectar um lançamento milimétrico para o atacante finalizar no gol:
- **Cateto A**: Distância horizontal (em metros)
- **Cateto B**: Distância vertical (em metros)
- **Hipotenusa C**: Distância real do passe a ser calculada pelo jogador ($C = \sqrt{A^2 + B^2}$)

### Regras & Mecânicas
1. **Entrada do Jogador**: $C$ não é preenchido automaticamente — o jogador deve calcular e inserir o valor em centésimos (com suporte a vírgula ou ponto decimal).
2. **Controles de Ajuste Fino**: Botões dedicados de $\pm 0.01$ e $\pm 0.10$ para ajustes precisos.
3. **Critério de Aceitação**: Se o valor inserido arredondado a duas casas decimais corresponder à hipotenusa de referência, o atacante domina e finaliza no gol! Se for menor, a bola para antes ("Passe curto"); se for maior, a bola passa direto ("Passe longo").
4. **Modo Mostrar/Ocultar Ajuda**: Inicia oculto para desafiar o aluno. Ao ser ativado, detalha o cálculo passo a passo ($A^2 + B^2 = C^2$) com notas de aproximação para raízes irracionais.

---

## 🛠️ Arquitetura e Engenharia
- **Vite + React 19 + TypeScript**: Aplicação SPA veloz, determinística e sem dependência de backend.
- **Canvas 2D com Projeção Uniforme**: Renderizador gráfico proporcional que garante ausência total de distorção anamórfica ou achatamento de personagens/campo.
- **Validação e Armazenamento em Centésimos**: Representação numérica interna em inteiros para evitar acúmulo de erro de ponto flutuante IEEE-754.
- **Spec-Driven Development (SDD)**:
  - `AGENTS.md`: Índice operacional.
  - `spec/PRODUCT.md`: Requisitos e invariantes estáveis.
  - `spec/STATE.md`: Roteiro de entregas e estado atual.
  - `spec/changes/`: Especificações verticais rastreáveis por fatia.

---

## 🧪 Comandos de Verificação
```bash
# Execução dos testes unitários de matemática e geometria (Vitest)
npm test

# Verificação de tipos TypeScript
npm run lint

# Protocolo Ralph de verificação rápida (Fast mode)
npm run ralph:fast

# Protocolo Ralph de verificação completa (Full mode com build)
npm run ralph
```

---

## 🚀 Fatias de Entrega (Roadmap)
- **Slice 001** (Concluída): Fundação jogável, motor matemático, centésimos, arena Bahia, projeção uniforme, verificação Ralph.
- **Slice 002** (Pendente): Ciclo de fases (Bahia, Flamengo, Cruzeiro) e progressão de jogo.
- **Slice 003** (Pendente): Internacionalização completa (pt-BR, en, es) e acessibilidade.
- **Slice 004** (Pendente): PWA offline, GitHub Actions CI/CD e release estática no GitHub Pages.
- **Slice 005** (Pendente): Coordenação Make e documentação de entrega final.

---

## 📄 Licença
Distribuído sob os termos da licença [MIT](LICENSE). Copyright &copy; 2026 RALECAB GAMES.
