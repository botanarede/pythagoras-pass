# Slice 007: E2E Playwright, CI Branch Quality Gate & Release - Verification

## 1. Matriz de Rastreabilidade

| Requisito | IDs Canônicos | Projetos Obrigatórios | Runner | Evidência | Status |
|---|---|---|---|---|---|
| **REQ-GEO/MATH** | — | — | Vitest | 58 testes históricos Slice 006 | PASSED (histórico) |
| **FLOW-01..05** | — | — | GitHub Actions | verify.yml + deploy.yml + branch protection | PENDING |
| **E2E-01..07** | GAME-01..06, FORMULA-01, A11Y-01, PWA-01 | chromium-desktop, chromium-mobile, webkit-desktop, webkit-mobile | Playwright | `results.json` com `expectedStatus: 'passed'` | PENDING |
| **LAYOUT-01** | LAYOUT-01 | dez projetos da matriz | Playwright | todas as chaves projeto/ID/cenário, caixas atuais, composição e intersecção zero | PENDING |
| **VIS-01** | VIS-01 | dez projetos da matriz | Playwright | sete cenários, canvas/composição, tolerâncias e baselines aprovadas por SHA/path/digest | PENDING (baselines) |
| **GATE-01..03** | todos acima | — | `ci-gate` job | validador `exit(0)`, zero flaky, zero unexpected | PENDING |
| **GATE-TEST** | casos do design seção 2 | — | Vitest | `ciGateValidator.test.ts` (12 testes simulados verdes) | PASSED |
| **FLOW-04** | RELEASE-A/B | — | GitHub Actions | SHA/artifact/digest, guarda remota, concorrência comum, A/B/stale/falha consulta/avanço após guarda | PENDING |
| **VIS-01 / REPAIR-01** | guia DOM PWA | todos projetos, fixture UA iPhone | Playwright | teste primeiro falha; painel futuro não encobre campo | PENDING (reparo de código realizado, aguarda execução E2E) |
| **PHYS-01** | — | — | Dispositivo físico | iOS Safari + Android Chrome reais | PENDING |
| **A11Y-AUDIO-01** | — | — | Dispositivo físico | VoiceOver + TalkBack | PENDING |

## 2. Status Truthfulness

- **PASSED** = executado e verde com evidência comprovada: 70 testes Vitest (58 de geometria/matemática/lifecycle + 12 do validador `ciGateValidator.test.ts`).
- **PENDING** = não executado, não verificado no CI ou depende de baseline/bootstrap externo: E2E Playwright em navegadores reais (Chromium/WebKit), gate integrado em CI, baselines visuais e dispositivos físicos.
- Vitest não comprova navegador real; emulação não comprova hardware; DOM aria-live não comprova áudio.

## 3. Protocolos de Execução

### Fast (Vitest + Lint)
```
npm run lint && npm test
```

### Full Local (a ser adicionado como `test:local:full`)
```
npm run lint && npm test && BASE_PATH='/pythagoras-pass/' npm run build && npx playwright test && npm run test:gate:local
```
Scripts futuros: gate local recebe contexto/mapa explícito de etapas aprovadas, sem default success. Preview com BASE_PATH/strictPort/reuse false, controlado por Playwright. Falhas interrompem sequência; report/traces coletados mesmo em erro, `trace: on`, retenção 7 dias. Não afirmar que estes comandos já foram implementados/executados.

### PWA Offline
1. Aguardar SW ready + controller
2. Verificar Cache Storage
3. `context.setOffline(true)` (API Playwright BrowserContext)
4. `page.reload()` → renderização do cache

## 4. Homologação Física (PHYS-01, A11Y-AUDIO-01)

Checklist manual pós-deploy:
- iOS Safari real: teclado virtual não obscurece canvas, safe areas OK, PWA standalone
- Android Chrome real: teclado virtual, banner instalação, offline real (modo avião)
- VoiceOver/TalkBack: navegação por gestos, anúncios de acerto/erro/fase sem duplicação
- Foco/fechamento do guia, instalação nativa e áreas físicas não são comprovados por eventos/UA sintéticos. Fixture somente verifica o ramo DOM. Baselines fixam ambiente/seed/relógio conforme design; update só na coleta autorizada.
- Branch protection: consulta de 2026-10-12 `protected:false`; configuração continua PENDING. Commit documental em main é exceção solicitada, `[skip ci]`, não evidência de CI/E2E deste patch.
