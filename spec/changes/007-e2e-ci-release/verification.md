# Slice 007: E2E Playwright, CI Branch Quality Gate & Release - Verification

## 1. Matriz Canônica de Verificação e Rastreabilidade

| Requisito / ID | Descrição | Teste Associado | Ambiente / Runner | Evidência Requerida | Status Atual |
|---|---|---|---|---|---|
| **REQ-GEO / REQ-MATH** | Projeção uniforme 1:1, meia-lua regulamentar, catetos em centésimos | `tests/geometry.test.ts`, `tests/math.test.ts` | Node.js (Vitest) | 58 testes verdes (evidência histórica consolidada do Slice 006) | **PASSED (Histórico Slice 006)** |
| **REQ-007-FLOW** | Governança de branch e Pull Request antes de qualquer merge na main | `.github/workflows/verify.yml` | GitHub Actions | PR criado com check `ci-gate` obrigatório | **PENDING** (Aguardando implementação) |
| **E2E-01 / E2E-02** | Execução de E2E sobre artefato real `/pythagoras-pass/` | `playwright.config.ts`, `e2e/*.spec.ts` | Playwright Preview | 0 erros 404 de assets e manifest | **PENDING** (Aguardando implementação) |
| **`[E2E-GAME-01..06]`** | Gameplay: passes exato/curto/longo, gol, retry, advance, 3 fases | `e2e/gameplay.spec.ts` | Chromium & WebKit (Desktop + Mobile) | Relatório estruturado `results.json` com status `expected` | **PENDING** (Aguardando implementação) |
| **`[E2E-FORMULA-01]`** | Painel de fórmula oculto por padrão, zero leak de resposta | `e2e/formula-toggle.spec.ts` | Chromium & WebKit | Ausência de valores calculados no DOM/aria em modo OFF | **PENDING** (Aguardando implementação) |
| **`[E2E-LAYOUT-01]`** | Invariante de não-encobrimento em 2D (canvas livre de controles e painéis) | `e2e/layout-scene.spec.ts` | Chromium & WebKit (Mobile & Desktop) | Intersecção 2D de caixas delimitadoras igual a zero | **PENDING** (Aguardando implementação) |
| **`[E2E-A11Y-01]`** | Troca de 3 idiomas, navegação por teclado e atualização de `aria-live` | `e2e/accessibility.spec.ts` | Chromium & WebKit | Anéis de foco e atualizações de texto no DOM | **PENDING** (Aguardando implementação) |
| **`[E2E-PWA-01]`** | PWA offline em modo avião com Service Worker ativo | `e2e/pwa-offline.spec.ts` | Chromium & WebKit | Renderização a partir do Cache Storage | **PENDING** (Aguardando implementação) |
| **`[E2E-VIS-01]`** | Regressão visual nos estados estáveis do jogo | `e2e/visual-regression.spec.ts` | Chromium & WebKit | Diff visual no canvas $\le 50\text{px}$ sem auto-update | **PENDING** (Aguardando implementação e Baselines) |
| **GATE-01 / GATE-02** | Bloqueio de merge em falhas/flaky e validação pós-merge completa | `verify.yml`, `deploy.yml`, `scripts/validate-ci-gate.mjs` | GitHub Actions | Relatório estruturado validado; publicação do idêntico artefato | **PENDING** (Aguardando implementação) |
| **GATE-TEST-01** | Testes de robustez do próprio agregador com resultados simulados | `tests/ciGateValidator.test.ts` | Node.js | Rejeição de falha upstream, skip, ausência de caso ou flaky | **PENDING** (Aguardando implementação) |
| **PHYS-01** | Homologação em smartphone físico real (iOS Safari / Android) | Protocolo manual | Dispositivo Físico | Teclado virtual, notch e gesture bar validados | **PENDING** (Homologação Física Separada) |
| **A11Y-AUDIO-01** | Homologação acústica com leitor de tela real (VoiceOver / TalkBack) | Protocolo manual | Dispositivo Físico | Leitura falada correta dos anúncios de status | **PENDING** (Homologação Manual Separada) |

---

## 2. Princípio da Verdade dos Estados (Status Truthfulness)
- **Não-Equivalência**:
  - Testes unitários do Vitest não comprovam navegadores reais.
  - Emulação mobile no Playwright não comprova teclado virtual nativo nem interações de hardware.
  - Atualização textual de `aria-live` no DOM não comprova emissão acústica por leitor de tela.
  - Ausência de baselines aprovadas impede concessão de aprovação à verificação visual.
- **Evidências Reais**:
  - O status **PASSED** é estritamente restrito ao que foi de fato executado e comprovado com evidência.
  - A marca de **58 testes Vitest aprovados** representa evidência histórica de testes unitários do Slice 006, não um teste E2E executado nesta rodada.
  - Todos os itens de navegadores reais, Quality Gates e testes físicos permanecem estritamente como **PENDING**.

---

## 3. Protocolos de Execução da Suíte

### Protocolo 1: Verificação Rápida Local (Fast Mode)
```bash
npm run lint
npm test
```
*Executa tipagem TypeScript (`tsc --noEmit`) e a suíte histórica de 58 testes no Vitest.*

### Protocolo 2: Suíte Completa Local com Build e Preview Alinhados
```bash
# Executa lint, vitest, build com BASE_PATH e suíte Playwright
npm run test:local:full
```

### Protocolo 3: Validação de PWA e Modo Offline
- Aguarda ativação completa do Service Worker (`navigator.serviceWorker.ready`) e confirmação de controle da página (`navigator.serviceWorker.controller`).
- Verifica presença dos assets essenciais no Cache Storage.
- Simula desconexão via API oficial `BrowserContext` do Playwright (`await context.setOffline(true)`).
- Recarrega a página (`await page.reload()`) e valida que a interface renderiza e permanece interativa a partir do cache.

---

## 4. Checklist de Homologação em Hardware Físico Real (PHYS-01 & A11Y-AUDIO-01)
*A ser executado pelo mantenedor após a publicação em staging ou homologação final:*

- [ ] **iOS Safari Real (iPhone)**:
  - Navegar até `https://botanarede.github.io/pythagoras-pass/`.
  - Tocar no campo de entrada de $C$ e verificar se a subida do teclado virtual nativo não empurra elementos sobre o canvas nem oculta os personagens.
  - Verificar se a Dynamic Island / notch e a barra de gestos inferior respeitam as safe areas sem colidir com controles ou header.
  - Instalar na Tela de Início via menu de compartilhamento do Safari e abrir como PWA standalone.
- [ ] **Android Chrome Real**:
  - Testar digitação no campo com teclado virtual Gboard / Samsung.
  - Testar banner de instalação e abertura standalone.
  - Ativar modo avião no aparelho e atualizar a página para testar o funcionamento offline real.
- [ ] **Leitor de Tela Físico (VoiceOver / TalkBack)**:
  - Ativar o leitor de tela no smartphone e navegar pelo jogo via gestos de varredura.
  - Verificar se o anúncio falado de acerto/erro/fase é emitido claramente sem travamento ou duplicação.
