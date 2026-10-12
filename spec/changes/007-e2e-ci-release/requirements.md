# Slice 007: E2E Playwright, CI Branch Quality Gate & Release - Requirements

## 1. Problem Statement & Context
O projeto **Lançamento de Pitágoras** (RALECAB GAMES) possui 58 testes unitários e geométricos aprovados no Vitest como marco histórico consolidado do Slice 006. O jogo possui motor matemático em centésimos inteiros, projeção uniforme 2D, casca mobile-first universal (`max-w-[460px]`, `100dvh`), suporte a três idiomas e PWA offline.

No entanto, o fluxo de publicação anterior possuía fragilidades críticas de engenharia e governança:
1. Commits enviados diretamente para a branch `main` disparavam deploy imediato para o GitHub Pages (`https://botanarede.github.io/pythagoras-pass/`) **sem** validação E2E prévia e sem autorização expressa do mantenedor.
2. A validação pós-merge na `main` limitava-se a lint e testes unitários, não executando a suíte E2E sobre a versão integrada antes de publicar.
3. Não havia garantia de que o artefato testado era identicamente o artefato publicado (risco de recompilação com drifts).
4. O cenário e personagens ($P$, $Q$, bola, trave e triângulo) não possuíam testes automatizados contra encobrimento por painéis (fórmula, resultados, modal de instalação PWA e notificações).
5. O status dos navegadores reais (Chromium, WebKit, Desktop e Mobile Emulado) permanece estritamente **PENDING**.

---

## 2. Decisões Canônicas Estabelecidas
- **Fluxo de Branches & PR**: Mudanças são desenvolvidas em branch dedicada de feature (`feature/slice-007-e2e-ci`) e submetidas via Pull Request para a branch `main`.
- **Quality Gate Obrigatório no PR com Validação de Cobertura Estruturada**: O PR executa linting, tipagem, Vitest, build de produção com `BASE_PATH=/pythagoras-pass/` e suíte Playwright completa (Chromium e WebKit). O job agregador `ci-gate` inspeciona o relatório estruturado (`results.json`) e bloqueia o merge caso qualquer caso obrigatório falhe, seja pulado, falte no relatório ou apresente instabilidade (*flaky*).
- **Validação Pós-Merge Completa na `main`**: A versão integrada na `main` executa a mesma validação rigorosa (incluindo testes E2E funcionais, de não-encobrimento e cobertura estruturada) **antes** de qualquer publicação no GitHub Pages.
- **Publicação do Idêntico Artefato Validado**: O deploy no GitHub Pages publica estritamente o artefato gerado e aprovado no teste da versão integrada, sem recompilação posterior.
- **Preservação de Versão Anterior**: Caso a validação na `main` falhe, a publicação é abortada imediatamente, preservando a versão em produção intacta (sem denominar isso de "rollback automático").
- **Escopo Tecnológico Restrito**: Apenas Playwright nativo (Chromium + WebKit). Sem serviços externos (KaneAI, Argos), sem migração de engine gráfica e sem novos recursos de gameplay.

---

## 3. Requisitos Funcionais e de Engenharia

### REQ-007-FLOW: Governança de Branches e Pull Requests
- **FLOW-01 (Isolamento em Branch Dedicada)**:
  - Todo o trabalho de implementação e correções deve residir em branch dedicada (ex.: `feature/slice-007-e2e-ci`).
  - Nenhum commit de implementação pode ser enviado diretamente para a branch `main`.
- **FLOW-02 (Abertura e Rastreamento de PR)**:
  - Um Pull Request deve ser aberto apontando para a branch `main`.
  - O PR rastreia o commit SHA exato, link da execução do GitHub Actions, matriz de navegadores e relatório estruturado de testes.
- **FLOW-03 (Governança Real de Merge do Mantenedor)**:
  - A regra de proteção na branch `main` deve exigir explicitamente:
    1. *Require a pull request before merging*;
    2. *Require status checks to pass before merging* com o check real `ci-gate`;
    3. *Do not allow bypassing the above settings* (aplicável inclusive ao administrador/mantenedor);
    4. Sem exigência de revisão formal por terceiros se o mantenedor for o autor único do PR, permitindo o merge manual após a aprovação de todos os status checks.
- **FLOW-04 (Validação Pós-Merge na `main` e Publicação do Mesmo Artefato)**:
  - Ao realizar o merge na `main`, o pipeline de deploy deve executar a validação completa (lint, Vitest, build e Playwright E2E com relatório estruturado).
  - O mesmo pacote `dist/` testado pelo Playwright deve ser empacotado e enviado para o GitHub Pages. É proibido rodar um novo `npm run build` após a execução dos testes.
  - Concorrência de deploy configurada com `concurrency: { group: 'pages', cancel-in-progress: false }`, garantindo ordem estrita e impedindo que execuções antigas sobrescrevam deploys mais recentes.
- **FLOW-05 (Aborto de Deploy e Preservação da Publicação)**:
  - Se a validação na `main` falhar, o pipeline encerra em estado de erro antes de acionar `actions/deploy-pages@v4`. A versão live publicada anteriormente permanece intocada.

---

### REQ-007-E2E: Cobertura End-to-End com Playwright
- **E2E-01 (Isolamento Estrito de Descoberta de Testes)**:
  - Vitest executa exclusivamente `tests/**/*.test.ts` (unitário, geométrico e matemático).
  - Playwright executa exclusivamente `e2e/**/*.spec.ts` (navegadores reais e integração).
  - Nenhuma ferramenta deve tentar carregar arquivos da outra.
- **E2E-02 (Execução sobre Artefato de Produção com `BASE_PATH`)**:
  - A suíte Playwright deve rodar contra o build de produção (`dist/`) servido com o caminho canônico `/pythagoras-pass/` (ex.: `http://localhost:4173/pythagoras-pass/`).
  - O comando de preview local e de CI deve aplicar o mesmo base path `/pythagoras-pass/`.
  - Todas as requisições de assets (`.js`, `.css`, `manifest.webmanifest`, ícones e `sw.js`) devem retornar HTTP 200 em ambiente online.
- **E2E-03 (Matriz de Telas e Dispositivos Alinhada)**:
  - **Desktop Padrão (1280×720)**: Projeto `chromium-desktop` e `webkit-desktop` (estágio smartphone centralizado `max-w-[460px]`).
  - **Desktop Amplo (1440×900)**: Verificação de centralização e ausência de distorção lateral.
  - **Mobile Standard iOS (390×844, DPR 3)**: Projeto `webkit-mobile` usando preset oficial do Playwright (`iPhone 14`).
  - **Mobile Standard Android (412×915, DPR 2.625)**: Projeto `chromium-mobile` usando preset oficial do Playwright (`Pixel 7`).
  - **Mobile Compacto (320×568, DPR 2)**: Projeto customizado cobrindo tela estreita (iPhone SE / Android compacto), atestando rolagem graciosa e controles acessíveis.
  - **Landscape Curto (844×390, DPR 3)**: Verificação em orientação horizontal sem quebra de layout.
- **E2E-04 (Casos de Teste Canônicos Catalogados por IDs Estáveis)**:
  - `[E2E-GAME-01]` **Passe Exato & Gol**: Inserção de $C = \text{round}(\text{hypot}(A, B) \times 100)$, passe atinge $Q$, atacante finaliza, celebração de gol e incremento de placar.
  - `[E2E-GAME-02]` **Passe Curto**: $C < C_{\text{target}}$, bola interrompe trajetória antes de $Q$, feedback de erro visível, sem celebração de gol.
  - `[E2E-GAME-03]` **Passe Longo**: $C > C_{\text{target}}$, bola ultrapassa $Q$, feedback de erro visível, sem celebração de gol.
  - `[E2E-GAME-04]` **Tentar Novamente (Retry)**: Preserva catetos $(A, B)$ e posições originais dos atletas.
  - `[E2E-GAME-05]` **Próximo Lance (Advance)**: Gera novo par $(A, B)$ sem duplicação imediata.
  - `[E2E-GAME-06]` **Progressão Sequencial de 3 Fases**: Fase 1 (Bahia) $\rightarrow$ Fase 2 (Flamengo) $\rightarrow$ Fase 3 (Cruzeiro) $\rightarrow$ Celebração de Campeão $\rightarrow$ Reinício para Fase 1.
- **E2E-05 (Fórmula Oculta e Blindagem de Respostas)**:
  - `[E2E-FORMULA-01]` O painel inicia estritamente fechado (OFF).
  - Em estado fechado, nenhuma tag, atributo (`aria-label`, `title`, `data-*`) ou texto invisível pode expor a resposta calculada de $C$.
  - Ao alternar para aberto (ON), revela a substituição $A^2 + B^2 = C^2$, a explicação didática de aproximação de raízes irracionais e o botão de preenchimento.
- **E2E-06 (Internacionalização e Acessibilidade)**:
  - `[E2E-A11Y-01]` Troca dinâmica entre `pt-BR`, `en` e `es` refletida imediatamente em controles, painéis e anúncios.
  - Navegação integral por teclado com anéis de foco visíveis (`focus-visible`).
  - Atualização do elemento `aria-live="polite"` sem poluição de resposta oculta (distinguindo essa verificação de DOM da homologação de áudio por leitor de tela).
- **E2E-07 (PWA e Operação Offline Determinística)**:
  - `[E2E-PWA-01]` O teste aguarda ativação completa do Service Worker (`navigator.serviceWorker.ready`), controle da página (`navigator.serviceWorker.controller`) e preenchimento de cache antes de simular desconexão.
  - Simulação de desconexão via API oficial `BrowserContext` do Playwright (`await context.setOffline(true)`).
  - Ao recarregar a página, a aplicação deve renderizar a interface e permitir jogabilidade com assets servidos pelo Cache Storage.

---

### REQ-007-VISUAL: Regressão Visual e Não-Encobrimento de Cenário
- **VIS-01 (Invariante Universal de Não-Encobrimento em 2D)**:
  - `[E2E-LAYOUT-01]` O campo de jogo (`PitchCanvas`), trave, atletas $P$ e $Q$, bola e triângulo **NUNCA** podem sofrer sobreposição por:
    1. Header e placar;
    2. Controles de jogo e steppers numéricos;
    3. Painel de fórmula expandido;
    4. Banners de feedback de resultado (gol, passe curto/longo);
    5. Modal de instalação PWA (`PWAInstallModal`);
    6. Indicador de status offline (`OfflineIndicator`).
  - O teste deve acionar explicitamente cada um desses estados e calcular a intersecção de caixas delimitadoras em duas dimensões ($X$ e $Y$), exigindo área de sobreposição igual a zero. Todos os elementos avaliados devem ter presença e visibilidade assertadas sem condicionais silenciosas.
- **VIS-02 (Proporções Geométricas Invariantes)**:
  - Projeção uniforme 1:1 mantida em todos os viewports de teste: a meia-lua da grande área deve manter excentricidade zero e os personagens não podem sofrer deformação anisotrópica.
- **VIS-03 (Determinismo de Estado e Snapshots)**:
  - `[E2E-VIS-01]` Para capturas de tela visuais, os cenários devem ser determinísticos:
    - Estado Inicial / Idle: Início da rodada com bola em repouso e campo aguardando entrada;
    - Estado Fórmula Aberta: Painel de ajuda visível;
    - Estado Passe Incorreto: Bola interrompida e banner de feedback visível;
    - Estado Gol: Conclusão da celebração e banner de gol visível;
    - Estado Troca de Fase: Modal de transição de fase visível.
  - A estabilização de cada estado deve aguardar o término de animações físicas do Canvas (velocidade zero) e transições CSS.
  - **Limiar Estrito Justificado**:
    - Para o elemento `#pitch-canvas`: tolerância absoluta de `maxDiffPixels: 50`, reprovando qualquer deslocamento ou ausência de elemento visual.
    - Para componentes DOM inteiros (`#game-controls`, `header`): tolerância de `maxDiffPixelRatio: 0.01` com `maxDiffPixels: 100`.
- **VIS-04 (Governança de Baselines e Proibição de Auto-Aprovação)**:
  - Baselines iniciais devem ser coletadas em rodada separada e apresentadas para revisão expressa do mantenedor.
  - Sem baseline aprovada pelo mantenedor, a verificação visual permanece **PENDING** e bloqueia o gate.
  - A flag `--update-snapshots` é **estritamente proibida** no CI de validação. Regressões visuais devem quebrar o build imediatamente.

---

### REQ-007-GATE: Quality Gate Determinístico com Relatório Estruturado
- **GATE-01 (Contrato do Agregador `ci-gate`)**:
  - O job `ci-gate` deve executar com `if: always()`, avaliando os resultados dos jobs precedentes e o relatório estruturado `results.json`.
  - Critérios eliminatórios do gate:
    1. Qualquer job upstream (`lint-and-unit`, `build-and-e2e`) que falhar, for cancelado ou for pulado (`skipped`);
    2. Ausência ou corrupção do arquivo de relatório estruturado `results.json`;
    3. Qualquer projeto obrigatório (`chromium-desktop`, `chromium-mobile`, `webkit-desktop`, `webkit-mobile`) ausente no relatório;
    4. Qualquer caso de teste obrigatório (`[E2E-GAME-01]` a `06`, `[E2E-FORMULA-01]`, `[E2E-LAYOUT-01]`, `[E2E-A11Y-01]`, `[E2E-PWA-01]`, `[E2E-VIS-01]`) ausente, pulado ou falho;
    5. Qualquer teste obrigatório com status classificado como `flaky` no relatório;
    6. Falhas inesperadas (*unexpected failures*) $> 0$.
  - É proibido o uso de `continue-on-error: true` em qualquer etapa obrigatória.
- **GATE-02 (Política Estrita de Flaky)**:
  - Se um teste falhar na primeira tentativa e passar no retry (`status: "flaky"`), o `ci-gate` deve rejeitar a execução e bloquear o merge.
  - Todas as tentativas, erros e traces devem ser retidos para investigação da causa raiz da instabilidade.
- **GATE-03 (Retenção de Evidências)**:
  - Relatórios Playwright (`results.json`, HTML report, traces e screenshots de erro) retidos por 7 dias via `actions/upload-artifact@v4`.

---

## 4. Dependências Externas e Limitações Conhecidas

1. **Configuração Manual de Branch Protection no GitHub (Settings > Branches)**:
   - A proteção efetiva da produção depende da configuração pelo mantenedor no painel web:
     - *Branch name pattern*: `main`;
     - *Require a pull request before merging*: Ativado;
     - *Require status checks to pass before merging*: Ativado com o check único `ci-gate`;
     - *Do not allow bypassing the above settings*: Ativado (incluindo administradores);
     - *Require approvals*: Não marcar para permitir que o autor único do repositório realize o merge após a aprovação verde dos checks obrigatórios.
2. **AI Studio e Criação de Branches**:
   - A capacidade de criar ou alternar branches via interface web do AI Studio permanece com status **PENDING de verificação**.
   - Fluxo seguro garantido: Caso a interface web sincronize apenas com a `main`, documenta-se o fluxo de trabalho onde os arquivos são comitados em uma branch de feature dedicada fora do AI Studio (via Git local/CLI) para abertura do PR. Criar uma branch no GitHub não redireciona magicamente a sincronização da interface do AI Studio.
