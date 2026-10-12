# Slice 007: E2E Playwright, CI Branch Quality Gate & Release - Tasks

> **Nota de Governança**: Todas as tarefas técnicas e de automação iniciam obrigatoriamente como `[ ] PENDING`. A implementação só terá início após a aprovação expressa desta especificação revisada pelo mantenedor e o envio do comando `go 007`.

---

## Fase 1: Especificação, Diagnóstico e Governança (Rodada 1 - Concluída)
- [x] **TASK-007-SPEC-01**: Atualizar `requirements.md` com validação de cobertura estruturada no gate, política anti-flaky, matriz de viewports e estados determinísticos.
- [x] **TASK-007-SPEC-02**: Atualizar `design.md` com arquitetura estruturada do `ci-gate`, script validador `results.json`, algoritmo 2D de sobreposição e diagnóstico rigoroso dos arquivos.
- [x] **TASK-007-SPEC-03**: Atualizar `tasks.md` com tarefas ordenadas test-first, testes simulados do próprio gate e rastreabilidade total.
- [x] **TASK-007-SPEC-04**: Atualizar `verification.md` alinhando a matriz de evidências, API oficial BrowserContext e protocolo de bootstrap de baselines.
- [x] **TASK-007-SPEC-05**: Atualizar `spec/STATE.md` e `spec/PRODUCT.md` refletindo o estado atual e as capacidades canônicas de QA e liberação condicionada.
- [x] **TASK-007-SPEC-06**: Registrar fatos do clone (bun.lock rastreado; dev-dist ausente/não rastreado) e limites dos diagnósticos históricos. Validação Bun e causa do alerta do editor não comprovadas.

---

## Fase 2: Infraestrutura Playwright, Gate Estruturado & Reparos (Pós-Aprovação)
- [x] **TASK-007-INFRA-01**: Adicionar `dev-dist/` ao `.gitignore` como boa prática para evitar versionamento acidental de artefatos efêmeros do service worker de desenvolvimento.
- [x] **TASK-007-INFRA-02**: Instalar `@playwright/test` como devDependency via npm, preservando a integridade de `package-lock.json`.
- [x] **TASK-007-INFRA-03**: Configurar dez projetos customizados do design seção 4, JSON `e2e-results/results.json`, HTML `playwright-report/`, evidências `test-results/`, retries 1 e trace on. Fixar versão/engines, webServer BASE_PATH/strictPort/reuse false, template e ambiente de snapshots.
- [x] **TASK-007-INFRA-04**: Criar script validador estruturado `scripts/validate-ci-gate.mjs` para verificar presença do relatório, matriz de projetos, IDs obrigatórios e rejeitar qualquer teste `flaky` ou `failed`.
- [x] **TASK-007-INFRA-05**: Criar suíte de testes com dados simulados para o próprio validador do gate (`tests/ciGateValidator.test.ts`), atestando rejeição em caso de falha upstream, skip, teste ausente, relatório ausente ou teste flaky.
  - Cobrir todos os casos negativos/positivos do design seção 2; esquema/travessia recursiva, projectId, chaves exatas projeto/ID/cenário, upstream ausente/unknown/cancelled, expected failure, todas tentativas, erros globais e duplicatas. Nenhum default success.
- [x] **TASK-007-INFRA-06**: Garantir isolamento estrito de runners: Vitest executa apenas `tests/**/*.test.ts` e Playwright executa apenas `e2e/**/*.spec.ts`.
- [x] **TASK-007-INFRA-07**: Adicionar scripts no `package.json`:
  - `"test:e2e"`: `playwright test`
  - `"test:e2e:ui"`: `playwright test --ui`
  - `"test:local:full"`: `npm run lint && npm test && BASE_PATH='/pythagoras-pass/' npm run build && npx playwright test && npm run test:gate:local`
  - `"test:gate:local"`: validador com contexto local e mapa explícito de etapas anteriores aprovadas; especificar CLI/argumentos na implementação, sem default success. Nenhum destes scripts existe atualmente.
- [x] **TASK-007-INFRA-08**: Criar fixtures test-side Mulberry32/seed por cenário, page.clock/rAF, UI PWA com UA/evento sintético e isolamento SW/contexto; mesma fonte/build de produção, sem hooks de resposta oculta.

---

## Fase 3: Suíte de Testes End-to-End (Test-First)
- [x] **TASK-007-TEST-01 (`e2e/gameplay.spec.ts`)**:
  - `[E2E-GAME-01]`: Inserção exata de $C$, trajetória da bola até $Q$, chute e animação de comemoração de gol.
  - `[E2E-GAME-02]`: Passe curto ($C < C_{\text{target}}$) com parada da bola antes de $Q$ e feedback textual sem gol.
  - `[E2E-GAME-03]`: Passe longo ($C > C_{\text{target}}$) ultrapassando $Q$ com feedback textual sem gol.
  - `[E2E-GAME-04]`: Clique em "Tentar Novamente" preservando catetos e posições originais de $A$ e $B$.
  - `[E2E-GAME-05]`: Clique em "Próximo Lance" sorteando nova rodada sem duplicação imediata.
  - `[E2E-GAME-06]`: Progressão sequencial das 3 fases (Bahia $\rightarrow$ Flamengo $\rightarrow$ Cruzeiro $\rightarrow$ Campeão $\rightarrow$ Reinício).
- [x] **TASK-007-TEST-02 (`e2e/formula-toggle.spec.ts`)**:
  - `[E2E-FORMULA-01]`: Validar painel fechado por padrão (OFF), ausência de vazamento de resposta calculada no DOM ou atributos `aria-*`, abertura (ON) com exibição dos cálculos e botão de preenchimento.
- [x] **TASK-007-TEST-03 (`e2e/layout-scene.spec.ts`)**:
  - `[E2E-LAYOUT-01]`: Validar programaticamente que o canvas do campo possui intersecção 2D estritamente igual a zero com header, controles, painel de fórmula expandido, banners de feedback e overlay de guia iOS (showIOSGuide) e OfflineIndicator.
  - Validar dimensões mínimas utilizáveis do canvas ($H \ge 250\text{px}$) em tela compacta de 320px.
  - Validar touch targets $\ge 44\text{px}$ para todos os botões e steppers.
  - Cada cenário/projeto da matriz é obrigatório, caixas novas após transição/scroll e null reprova. Incluir gol/curto/longo, guia e botão PWA, offline e composição da cena.
- [x] **TASK-007-REPAIR-01**: Test-first, após aprovação: corrigir guia React iOS com backdrop que cobre campo; tornar painel não sobreposto preservando conteúdo/foco/fechamento. Sem exceção ao invariante; teste deve falhar antes da correção.
- [x] **TASK-007-TEST-04 (`e2e/accessibility.spec.ts`)**:
  - `[E2E-A11Y-01]`: Validar navegação integral por teclado e anéis de foco visíveis (`focus-visible`).
  - Validar alternância dinâmica entre os 3 idiomas (`pt-BR`, `en`, `es`).
  - Validar atualização de textos no elemento `aria-live` do DOM.
- [x] **TASK-007-TEST-05 (`e2e/pwa-offline.spec.ts`)**:
  - `[E2E-PWA-01]`: Confirmar Service Worker ativo e assets no Cache Storage. Simular offline via `context.setOffline(true)`, recarregar página e verificar renderização a partir do cache.
- [x] **TASK-007-TEST-06 (`e2e/visual-regression.spec.ts`)**:
  - `[E2E-VIS-01]`: Canvas e composição, sete cenários nos dez projetos conforme design seção 4, incluindo transição real de fase e campeão separado. Fixar seed/relógio/fonts/ambiente/template; tolerâncias não são garantia absoluta.

---

## Fase 4: Modernização de Workflows do GitHub Actions
- [x] **TASK-007-CI-01**: Atualizar `.github/workflows/verify.yml`:
  - Job `lint-and-unit` (TypeScript e Vitest).
  - Job `build-and-e2e` (Build com `BASE_PATH`, execução Playwright gerando `results.json` e upload do relatório como artefato).
  - Job agregador `ci-gate` com `if: always()`, download de `results.json` e execução de `node scripts/validate-ci-gate.mjs`.
- [x] **TASK-007-CI-02**: Atualizar `.github/workflows/deploy.yml`:
  - Concorrência no workflow completo: grupo comum `pages`, cancel-in-progress false, sem FIFO nem garantia de manter toda execução pendente. Conferir caminhos/execuções antigas no rollout.
  - Job `validate-and-package-integrated`: executa lint, Vitest, build de produção, Playwright E2E e validação do relatório estruturado sobre a versão integrada.
  - Empacota o EXATO diretório `dist/` testado via `actions/upload-pages-artifact@v3`.
  - Job `deploy-to-pages`: publica o artefato testado via `actions/deploy-pages@v4` somente após aprovação integral do job anterior.
  - Implementar guarda SHA remota fail-closed antes deploy e registro SHA/run/artifact/digest; verificar A/B fora de ordem, consulta falha, avanço após guarda, pending substituído e artifact idêntico. Não mudar produção sem autorização.

---

## Fase 5: Bootstrap de Baselines & Homologação Física
- [ ] **TASK-007-BOOTSTRAP-01**: Executar rodada de coleta de imagens candidatas em ambiente isolado e submeter para revisão expressa do mantenedor.
  - Registrar aprovação SHA/path/digest por arquivo; mudanças invalidam aprovação. Coleta autorizada em ambiente fixo pode atualizar candidatos, nunca validação CI nem deploy.
- [ ] **TASK-007-DOC-01**: Documentar configuração de Branch Protection em `main` no painel web do GitHub (exigência de PR, check real `ci-gate` e inclusão de administradores).
- [ ] **TASK-007-DOC-02**: Documentar protocolo de homologação manual em smartphones físicos reais (iOS Safari e Android Chrome com teclado virtual nativo) e homologação acústica com leitor de tela real.
