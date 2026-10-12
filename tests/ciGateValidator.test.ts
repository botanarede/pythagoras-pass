import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  validateGate,
  buildExpectedCoverageMap,
} from '../scripts/validate-ci-gate.mjs';

const FIXTURES_DIR = path.resolve('tests/__fixtures__');
const DUMMY_REPORT = path.join(FIXTURES_DIR, 'test-results.json');

interface MockSpec {
  title: string;
  tests: {
    projectName: string;
    expectedStatus: string;
    status: string;
    results: { status: string }[];
  }[];
}

interface MockSuite {
  title: string;
  suites: {
    title: string;
    specs: MockSpec[];
  }[];
}

interface MockReport {
  suites: MockSuite[];
  stats: {
    unexpected: number;
    expected: number;
  };
  errors: { message: string }[];
}

function createValidMockReport(): MockReport {
  const map = buildExpectedCoverageMap();
  const suitesByProject = new Map<string, MockSpec[]>();

  for (const [, { project, id, scenario }] of map.entries()) {
    if (!suitesByProject.has(project)) {
      suitesByProject.set(project, []);
    }

    const title = scenario === 'functional'
      ? `${id} Descrição Funcional`
      : `${id} scenario=${scenario}: Teste de layout/visual`;

    suitesByProject.get(project)!.push({
      title,
      tests: [
        {
          projectName: project,
          expectedStatus: 'passed',
          status: 'expected',
          results: [{ status: 'passed' }],
        },
      ],
    });
  }

  const suites: MockSuite[] = [];
  for (const [project, specs] of suitesByProject.entries()) {
    suites.push({
      title: project,
      suites: [
        {
          title: 'nested-suite',
          specs,
        },
      ],
    });
  }

  return {
    suites,
    stats: {
      unexpected: 0,
      expected: map.size,
    },
    errors: [],
  };
}

describe('CI Gate Validator - Specification Contract Tests', () => {
  beforeEach(() => {
    fs.mkdirSync(FIXTURES_DIR, { recursive: true });
  });

  afterEach(() => {
    if (fs.existsSync(DUMMY_REPORT)) {
      fs.unlinkSync(DUMMY_REPORT);
    }
  });

  it('1. Rejeita se upstream lint-and-unit teve status "failure"', () => {
    const report = createValidMockReport();
    fs.writeFileSync(DUMMY_REPORT, JSON.stringify(report));

    const res = validateGate({
      reportPath: DUMMY_REPORT,
      context: 'ci',
      upstream: {
        'lint-and-unit': 'failure',
        'build-and-e2e': 'success',
      },
    });

    expect(res.valid).toBe(false);
    expect(res.errors.some((e: string) => e.includes("Upstream job 'lint-and-unit' falhou"))).toBe(true);
  });

  it('2. Rejeita se upstream build-and-e2e teve status "skipped"', () => {
    const report = createValidMockReport();
    fs.writeFileSync(DUMMY_REPORT, JSON.stringify(report));

    const res = validateGate({
      reportPath: DUMMY_REPORT,
      context: 'ci',
      upstream: {
        'lint-and-unit': 'success',
        'build-and-e2e': 'skipped',
      },
    });

    expect(res.valid).toBe(false);
    expect(res.errors.some((e: string) => e.includes("Upstream job 'build-and-e2e' falhou"))).toBe(true);
  });

  it('3. Rejeita se upstream job estiver ausente ou "unknown"', () => {
    const report = createValidMockReport();
    fs.writeFileSync(DUMMY_REPORT, JSON.stringify(report));

    const res = validateGate({
      reportPath: DUMMY_REPORT,
      context: 'ci',
      upstream: {
        'lint-and-unit': 'success',
      },
    });

    expect(res.valid).toBe(false);
    expect(res.errors.some((e: string) => e.includes("Upstream job 'build-and-e2e' falhou"))).toBe(true);
  });

  it('4. Rejeita se results.json estiver ausente no disco', () => {
    const res = validateGate({
      reportPath: 'path/to/nonexistent/results.json',
      context: 'ci',
      upstream: {
        'lint-and-unit': 'success',
        'build-and-e2e': 'success',
      },
    });

    expect(res.valid).toBe(false);
    expect(res.errors.some((e: string) => e.includes('não encontrado'))).toBe(true);
  });

  it('5. Rejeita se results.json for corrompido / JSON malformado', () => {
    fs.writeFileSync(DUMMY_REPORT, '{ "suites": [ incomplete json');

    const res = validateGate({
      reportPath: DUMMY_REPORT,
      context: 'ci',
      upstream: {
        'lint-and-unit': 'success',
        'build-and-e2e': 'success',
      },
    });

    expect(res.valid).toBe(false);
    expect(res.errors.some((e: string) => e.includes('Falha no parse do arquivo de relatório JSON'))).toBe(true);
  });

  it('6. Rejeita se o projeto obrigatório "webkit-mobile" estiver ausente', () => {
    const report = createValidMockReport();
    report.suites = report.suites.filter((s) => s.title !== 'webkit-mobile');
    fs.writeFileSync(DUMMY_REPORT, JSON.stringify(report));

    const res = validateGate({
      reportPath: DUMMY_REPORT,
      context: 'ci',
      upstream: {
        'lint-and-unit': 'success',
        'build-and-e2e': 'success',
      },
    });

    expect(res.valid).toBe(false);
    expect(res.errors.some((e: string) => e.includes('webkit-mobile'))).toBe(true);
  });

  it('7. Rejeita se o ID canônico [E2E-GAME-01] estiver ausente em algum projeto', () => {
    const report = createValidMockReport();
    const chromSuite = report.suites.find((s) => s.title === 'chromium-desktop');
    expect(chromSuite).toBeDefined();
    chromSuite!.suites[0].specs = chromSuite!.suites[0].specs.filter(
      (spec: MockSpec) => !spec.title.includes('[E2E-GAME-01]')
    );
    fs.writeFileSync(DUMMY_REPORT, JSON.stringify(report));

    const res = validateGate({
      reportPath: DUMMY_REPORT,
      context: 'ci',
      upstream: {
        'lint-and-unit': 'success',
        'build-and-e2e': 'success',
      },
    });

    expect(res.valid).toBe(false);
    expect(res.errors.some((e: string) => e.includes('chromium-desktop::[E2E-GAME-01]::functional'))).toBe(true);
  });

  it('8. Rejeita se algum teste obrigatório teve status "skipped"', () => {
    const report = createValidMockReport();
    const chromSuite = report.suites.find((s) => s.title === 'chromium-desktop');
    expect(chromSuite).toBeDefined();
    const targetSpec = chromSuite!.suites[0].specs.find((s: MockSpec) => s.title.includes('[E2E-GAME-01]'));
    expect(targetSpec).toBeDefined();
    targetSpec!.tests[0].expectedStatus = 'passed';
    targetSpec!.tests[0].status = 'skipped';
    targetSpec!.tests[0].results = [{ status: 'skipped' }];
    fs.writeFileSync(DUMMY_REPORT, JSON.stringify(report));

    const res = validateGate({
      reportPath: DUMMY_REPORT,
      context: 'ci',
      upstream: {
        'lint-and-unit': 'success',
        'build-and-e2e': 'success',
      },
    });

    expect(res.valid).toBe(false);
    expect(res.errors.some((e: string) => e.includes("status 'skipped'"))).toBe(true);
  });

  it('9. Rejeita teste FLAKY (tentativa 1 failed, retry passed)', () => {
    const report = createValidMockReport();
    const chromSuite = report.suites.find((s) => s.title === 'chromium-desktop');
    expect(chromSuite).toBeDefined();
    const targetSpec = chromSuite!.suites[0].specs.find((s: MockSpec) => s.title.includes('[E2E-GAME-02]'));
    expect(targetSpec).toBeDefined();
    targetSpec!.tests[0].results = [
      { status: 'failed' },
      { status: 'passed' },
    ];
    fs.writeFileSync(DUMMY_REPORT, JSON.stringify(report));

    const res = validateGate({
      reportPath: DUMMY_REPORT,
      context: 'ci',
      upstream: {
        'lint-and-unit': 'success',
        'build-and-e2e': 'success',
      },
    });

    expect(res.valid).toBe(false);
    expect(res.errors.some((e: string) => e.includes('FLAKY'))).toBe(true);
  });

  it('10. Rejeita se stats.unexpected > 0', () => {
    const report = createValidMockReport();
    report.stats.unexpected = 1;
    fs.writeFileSync(DUMMY_REPORT, JSON.stringify(report));

    const res = validateGate({
      reportPath: DUMMY_REPORT,
      context: 'ci',
      upstream: {
        'lint-and-unit': 'success',
        'build-and-e2e': 'success',
      },
    });

    expect(res.valid).toBe(false);
    expect(res.errors.some((e: string) => e.includes('unexpected'))).toBe(true);
  });

  it('11. Aprova suite completa e íntegra (todos os 10 projetos, todos os IDs e cenários, zero flaky)', () => {
    const report = createValidMockReport();
    fs.writeFileSync(DUMMY_REPORT, JSON.stringify(report));

    const res = validateGate({
      reportPath: DUMMY_REPORT,
      context: 'ci',
      upstream: {
        'lint-and-unit': 'success',
        'build-and-e2e': 'success',
      },
    });

    expect(res.valid).toBe(true);
    expect(res.errors).toHaveLength(0);
    expect(res.totalFound).toBe(res.totalExpected);
  });

  it('12. Rejeita testes com resultados vazios ou erros globais', () => {
    const report = createValidMockReport();
    report.errors.push({ message: 'Global browser crash on webkit' });
    fs.writeFileSync(DUMMY_REPORT, JSON.stringify(report));

    const res = validateGate({
      reportPath: DUMMY_REPORT,
      context: 'ci',
      upstream: {
        'lint-and-unit': 'success',
        'build-and-e2e': 'success',
      },
    });

    expect(res.valid).toBe(false);
    expect(res.errors.some((e: string) => e.includes('Global browser crash'))).toBe(true);
  });
});
