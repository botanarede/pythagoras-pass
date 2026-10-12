#!/usr/bin/env node
/**
 * scripts/validate-ci-gate.mjs
 * Validador Estruturado do CI Quality Gate (Playwright results.json + Upstream Jobs)
 * Slice 007 - RALECAB GAMES
 *
 * Contrato Canônico:
 * 1. Todos os jobs upstream devem ser 'success'. Ausente/unknown/failure/skipped/cancelled -> exit(1)
 * 2. results.json deve existir e ter parse válido.
 * 3. Validação estrita por travessia recursiva de suites/specs/tests:
 *    - Chave exata (projectId, ID canônico, cenário) para todos os casos obrigatórios
 *    - 4 projetos core com suíte funcional completa + layout + visual
 *    - 6 projetos adicionais com layout + visual
 *    - Sem duplicatas não permitidas
 * 4. Validação de status por caso:
 *    - expectedStatus === 'passed'
 *    - test.status === 'expected'
 *    - results não vazio
 *    - TODAS as tentativas com status === 'passed' (rejeita flaky onde retry passou após falha inicial)
 *    - unexpected === 0
 * 5. Se aprovado -> exit(0). Caso contrário -> exit(1).
 */

import fs from 'node:fs';
import path from 'node:path';

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    reportPath: process.env.PLAYWRIGHT_REPORT_PATH || 'e2e-results/results.json',
    context: 'ci', // 'ci' | 'local'
    upstream: {},
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--report' && i + 1 < args.length) {
      options.reportPath = args[++i];
    } else if (arg === '--context' && i + 1 < args.length) {
      options.context = args[++i];
    } else if (arg.startsWith('--') && i + 1 < args.length) {
      const key = arg.slice(2);
      options.upstream[key] = args[++i];
    }
  }

  return options;
}

// 10 Projetos Obrigatórios
export const CORE_PROJECTS = [
  'chromium-desktop',
  'chromium-mobile',
  'webkit-desktop',
  'webkit-mobile',
];

export const ADDITIONAL_PROJECTS = [
  'chromium-compact',
  'webkit-compact',
  'chromium-landscape',
  'webkit-landscape',
  'chromium-wide',
  'webkit-wide',
];

export const ALL_PROJECTS = [...CORE_PROJECTS, ...ADDITIONAL_PROJECTS];

// IDs e Cenários Obrigatórios
export const FUNCTIONAL_CASES = [
  { id: '[E2E-GAME-01]', scenario: 'functional' },
  { id: '[E2E-GAME-02]', scenario: 'functional' },
  { id: '[E2E-GAME-03]', scenario: 'functional' },
  { id: '[E2E-GAME-04]', scenario: 'functional' },
  { id: '[E2E-GAME-05]', scenario: 'functional' },
  { id: '[E2E-GAME-06]', scenario: 'functional' },
  { id: '[E2E-FORMULA-01]', scenario: 'functional' },
  { id: '[E2E-A11Y-01]', scenario: 'functional' },
  { id: '[E2E-PWA-01]', scenario: 'functional' },
];

export const LAYOUT_SCENARIOS = [
  'idle',
  'formula',
  'miss_short',
  'miss_long',
  'goal',
  'pwa_guide',
  'pwa_install_button',
  'offline',
];

export const VISUAL_SCENARIOS = [
  'idle',
  'formula',
  'miss_short',
  'miss_long',
  'goal',
  'phase_transition',
  'champion',
];

/**
 * Constrói o catálogo de chaves obrigatórias (projeto, id, cenário)
 */
export function buildExpectedCoverageMap() {
  const map = new Map(); // key -> { project, id, scenario }

  // 1. Casos funcionais nos 4 core
  for (const project of CORE_PROJECTS) {
    for (const item of FUNCTIONAL_CASES) {
      const key = `${project}::${item.id}::${item.scenario}`;
      map.set(key, { project, id: item.id, scenario: item.scenario });
    }
  }

  // 2. Layout nos 10 projetos
  for (const project of ALL_PROJECTS) {
    for (const scenario of LAYOUT_SCENARIOS) {
      const id = '[E2E-LAYOUT-01]';
      const key = `${project}::${id}::${scenario}`;
      map.set(key, { project, id, scenario });
    }
  }

  // 3. Visual nos 10 projetos
  for (const project of ALL_PROJECTS) {
    for (const scenario of VISUAL_SCENARIOS) {
      const id = '[E2E-VIS-01]';
      const key = `${project}::${id}::${scenario}`;
      map.set(key, { project, id, scenario });
    }
  }

  return map;
}

/**
 * Validador Principal
 */
export function validateGate({ reportPath, context, upstream }) {
  const errors = [];

  // --- REGRA 1: Validação Upstream ---
  // Nunca aceitar default success. Verificar mapa explícito.
  if (context === 'ci') {
    const requiredUpstream = ['lint-and-unit', 'build-and-e2e'];
    for (const job of requiredUpstream) {
      const status = upstream[job];
      if (!status || status !== 'success') {
        errors.push(`Upstream job '${job}' falhou, foi pulado ou está ausente: '${status || 'UNKNOWN'}'`);
      }
    }
  } else if (context === 'local') {
    const requiredLocal = ['lint', 'unit', 'build', 'e2e'];
    for (const step of requiredLocal) {
      const status = upstream[step];
      if (!status || status !== 'success') {
        errors.push(`Etapa local obrigatória '${step}' não aprovada: '${status || 'UNKNOWN'}'`);
      }
    }
  } else if (context === 'deploy') {
    const requiredDeploy = ['validate-and-package-integrated'];
    for (const job of requiredDeploy) {
      const status = upstream[job];
      if (!status || status !== 'success') {
        errors.push(`Upstream deploy job '${job}' não aprovado: '${status || 'UNKNOWN'}'`);
      }
    }
  } else {
    errors.push(`Contexto de execução desconhecido: '${context}'`);
  }

  // --- REGRA 2: Existência do Relatório ---
  const absoluteReportPath = path.resolve(reportPath);
  if (!fs.existsSync(absoluteReportPath)) {
    errors.push(`Arquivo de relatório Playwright não encontrado: ${absoluteReportPath}`);
    return { valid: false, errors };
  }

  // --- REGRA 3: Parse do JSON ---
  let reportData;
  try {
    const content = fs.readFileSync(absoluteReportPath, 'utf8');
    reportData = JSON.parse(content);
  } catch (err) {
    errors.push(`Falha no parse do arquivo de relatório JSON: ${err.message}`);
    return { valid: false, errors };
  }

  // Esquema básico do Playwright JSON Reporter
  if (!reportData || typeof reportData !== 'object' || !Array.isArray(reportData.suites)) {
    errors.push(`Esquema inválido no relatório: 'suites' ausente ou não é array.`);
    return { valid: false, errors };
  }

  // Erros globais no Playwright
  if (Array.isArray(reportData.errors) && reportData.errors.length > 0) {
    for (const gErr of reportData.errors) {
      errors.push(`Erro global Playwright: ${gErr.message || JSON.stringify(gErr)}`);
    }
  }

  // --- REGRA 4 e 5: Travessia Recursiva e Coleta de Testes ---
  const foundTests = new Map(); // key -> testData
  const duplicates = [];

  function traverseSuites(suite) {
    if (Array.isArray(suite.suites)) {
      for (const childSuite of suite.suites) {
        traverseSuites(childSuite);
      }
    }

    if (Array.isArray(suite.specs)) {
      for (const spec of suite.specs) {
        if (!Array.isArray(spec.tests)) continue;

        for (const test of spec.tests) {
          const projectName = test.projectName;
          const title = spec.title || '';

          // Extrair ID e cenário do título
          // Padrões esperados:
          // "[E2E-GAME-01] Passe Exato & Gol" -> id: [E2E-GAME-01], scenario: functional
          // "[E2E-LAYOUT-01] scenario=idle: PitchCanvas não sobreposto..." -> id: [E2E-LAYOUT-01], scenario: idle
          // "[E2E-VIS-01] scenario=idle: Snapshot..." -> id: [E2E-VIS-01], scenario: idle
          const idMatch = title.match(/\[E2E-[A-Z0-9]+-[0-9]+\]/);
          if (!idMatch) continue;
          const id = idMatch[0];

          let scenario = 'functional';
          const scenarioMatch = title.match(/scenario=([a-z_]+)/);
          if (scenarioMatch) {
            scenario = scenarioMatch[1];
          }

          const key = `${projectName}::${id}::${scenario}`;

          if (foundTests.has(key)) {
            duplicates.push(key);
          } else {
            foundTests.set(key, {
              project: projectName,
              id,
              scenario,
              title,
              test,
            });
          }

          // Validação individual do teste
          const expectedStatus = test.expectedStatus;
          const testStatus = test.status;
          const results = test.results || [];

          if (expectedStatus !== 'passed') {
            errors.push(`Teste ${key} possui expectedStatus '${expectedStatus}' (esperava 'passed')`);
          }

          if (testStatus !== 'expected') {
            errors.push(`Teste ${key} possui status '${testStatus}' (esperava 'expected')`);
          }

          if (results.length === 0) {
            errors.push(`Teste ${key} possui lista de tentativas (results) vazia`);
          } else {
            // Verificar todas as tentativas
            // Se houve mais de uma tentativa e a última passou, foi FLAKY -> REPROVAR
            if (results.length > 1) {
              const firstStatus = results[0]?.status;
              const lastStatus = results[results.length - 1]?.status;
              if (firstStatus !== 'passed' && lastStatus === 'passed') {
                errors.push(`Teste ${key} é FLAKY (tentativa 1: '${firstStatus}', tentativa final: '${lastStatus}'). Política anti-flaky proíbe retry com sucesso.`);
              }
            }

            for (let i = 0; i < results.length; i++) {
              const r = results[i];
              if (r.status !== 'passed') {
                errors.push(`Teste ${key} tentativa #${i + 1} terminou com status '${r.status}'`);
              }
            }
          }
        }
      }
    }
  }

  for (const rootSuite of reportData.suites) {
    traverseSuites(rootSuite);
  }

  if (duplicates.length > 0) {
    errors.push(`Testes duplicados encontrados com mesma chave canônica: ${duplicates.join(', ')}`);
  }

  // --- REGRA 6: Conferência de Cobertura Contra Matriz Esperada ---
  const expectedMap = buildExpectedCoverageMap();
  for (const [expKey, expDetails] of expectedMap.entries()) {
    if (!foundTests.has(expKey)) {
      errors.push(`Caso obrigatório ausente na execução: ${expKey} (Projeto: ${expDetails.project}, ID: ${expDetails.id}, Cenário: ${expDetails.scenario})`);
    }
  }

  // Verificar stats se disponíveis
  if (reportData.stats && typeof reportData.stats.unexpected === 'number' && reportData.stats.unexpected > 0) {
    errors.push(`Relatório contém ${reportData.stats.unexpected} testes com resultado 'unexpected'.`);
  }

  return {
    valid: errors.length === 0,
    errors,
    totalExpected: expectedMap.size,
    totalFound: foundTests.size,
  };
}

// CLI Execution Entry Point
if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  const options = parseArgs();
  console.log(`[CI-GATE] Iniciando validação do gate... Contexto: ${options.context}, Relatório: ${options.reportPath}`);

  const result = validateGate(options);

  if (result.valid) {
    console.log(`[CI-GATE] SUCESSO: Todos os ${result.totalExpected} casos obrigatórios foram verificados e aprovados.`);
    process.exit(0);
  } else {
    console.error(`[CI-GATE] FALHA: O gate rejeitou a execução com ${result.errors.length} erro(s):`);
    for (const err of result.errors) {
      console.error(`  - ${err}`);
    }
    process.exit(1);
  }
}
