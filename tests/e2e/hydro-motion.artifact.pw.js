import { expect, test } from '@playwright/test';
import { appUrl, expectHealthyPage, monitorRuntime } from './helpers.js';

test.use({ reducedMotion: 'no-preference' });

const FLOW_CYCLE = 104;

function circularDistance(first, second, cycle = FLOW_CYCLE) {
  const distance = Math.abs(first - second) % cycle;
  return Math.min(distance, cycle - distance);
}

async function readFlowFrame(flow) {
  return flow.evaluate((node) => {
    const style = getComputedStyle(node);
    const animation = node.getAnimations({ subtree: false })[0];
    return {
      dashOffset: Number.parseFloat(style.strokeDashoffset),
      durationMs: Number.parseFloat(style.animationDuration) * 1000,
      playState: style.animationPlayState,
      currentTimeMs: Number(animation?.currentTime ?? 0),
    };
  });
}

async function sampleMovement(flow, waitMs = 320) {
  const before = await readFlowFrame(flow);
  await flow.page().waitForTimeout(waitMs);
  const after = await readFlowFrame(flow);
  return {
    before,
    after,
    visualDistance: circularDistance(before.dashOffset, after.dashOffset),
    phaseAdvance: (after.currentTimeMs - before.currentTimeMs) / before.durationMs,
  };
}

test('animação hidrelétrica move, pausa e muda de velocidade em qualquer viewport', async ({
  page,
  baseURL,
}, testInfo) => {
  const runtimeIssues = monitorRuntime(page, baseURL);
  await page.goto(appUrl(baseURL, '#/hidreletricas'), {
    waitUntil: 'domcontentloaded',
  });

  const cutaway = page.locator('.hec-shell');
  const scene = cutaway.locator('.hec-scene');
  const flow = cutaway.locator('.hec-water-flow');
  const play = cutaway.locator('.hec-play');
  const speed = cutaway.locator('.hec-flow-control input[type="range"]');

  await expect(cutaway).toBeVisible();
  await scene.scrollIntoViewIfNeeded();
  await expect(cutaway).toHaveAttribute('data-motion-preference', 'full');
  await expect(cutaway).toHaveAttribute('data-playing', 'true');
  await expect(flow).toHaveCount(1);

  await speed.fill('35');
  await expect(speed).toHaveValue('35');
  const slow = await sampleMovement(flow);
  expect(slow.before.playState).toBe('running');
  expect(
    slow.visualDistance,
    `${testInfo.project.name}: o traço de água precisa mudar enquanto a animação roda`,
  ).toBeGreaterThan(2);
  expect(slow.phaseAdvance).toBeGreaterThan(0.08);

  await play.click();
  await expect(cutaway).toHaveAttribute('data-playing', 'false');
  await expect(play).toHaveAttribute('aria-pressed', 'false');
  await page.waitForTimeout(100);
  const paused = await sampleMovement(flow);
  expect(paused.before.playState).toBe('paused');
  expect(paused.after.playState).toBe('paused');
  expect(
    paused.visualDistance,
    `${testInfo.project.name}: o quadro precisa permanecer congelado quando pausado`,
  ).toBeLessThan(0.15);
  expect(Math.abs(paused.after.currentTimeMs - paused.before.currentTimeMs)).toBeLessThan(2);

  await speed.fill('100');
  await expect(speed).toHaveValue('100');
  await page.waitForTimeout(100);
  const fastDuration = (await readFlowFrame(flow)).durationMs;
  expect(
    slow.before.durationMs / fastDuration,
    `${testInfo.project.name}: o controle de velocidade precisa reduzir a duração do ciclo`,
  ).toBeGreaterThan(2);

  await play.click();
  await scene.scrollIntoViewIfNeeded();
  await expect(cutaway).toHaveAttribute('data-playing', 'true');
  await expect(play).toHaveAttribute('aria-pressed', 'true');
  const fast = await sampleMovement(flow);
  expect(fast.before.playState).toBe('running');
  expect(fast.visualDistance).toBeGreaterThan(2);
  expect(
    fast.phaseAdvance / slow.phaseAdvance,
    `${testInfo.project.name}: a fase deve avançar mais rápido após elevar a velocidade`,
  ).toBeGreaterThan(1.35);

  await expectHealthyPage(page, runtimeIssues);
});
