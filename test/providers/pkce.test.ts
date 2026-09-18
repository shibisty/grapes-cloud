import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { generateCodeChallenge, generateCodeVerifier, randomState, runPopupAuth } from '../../src/providers/pkce';
import { GcaError } from '../../src/i18n/errors';

describe('generateCodeVerifier / randomState', () => {
  it('produces a base64url string (no +, /, or = padding)', () => {
    const verifier = generateCodeVerifier();
    expect(verifier).toMatch(/^[A-Za-z0-9_-]+$/);
    const state = randomState();
    expect(state).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it('is different on every call (32/16 random bytes, collisions astronomically unlikely)', () => {
    expect(generateCodeVerifier()).not.toBe(generateCodeVerifier());
    expect(randomState()).not.toBe(randomState());
  });
});

describe('generateCodeChallenge', () => {
  it('computes the S256 challenge for a known verifier (fixed RFC 7636 test vector)', async () => {
    // From RFC 7636 appendix B.
    const verifier = 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk';
    const challenge = await generateCodeChallenge(verifier);
    expect(challenge).toBe('E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM');
  });

  it('throws a GcaError with the insecureOrigin key when crypto.subtle is unavailable', async () => {
    // `crypto.subtle` has only a getter on the real object (can't just
    // `delete`/reassign it) — stub the global with a proxy that hides it
    // instead, the way an insecure (plain http, non-localhost) origin does.
    const realCrypto = crypto;
    vi.stubGlobal(
      'crypto',
      new Proxy(realCrypto, {
        get(target, prop, receiver) {
          if (prop === 'subtle') return undefined;
          return Reflect.get(target, prop, receiver);
        },
      }),
    );
    try {
      await expect(generateCodeChallenge('whatever')).rejects.toMatchObject({
        i18nKey: 'shared.error.insecureOrigin',
      });
      await expect(generateCodeChallenge('whatever')).rejects.toBeInstanceOf(GcaError);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});

/** Минимальная подделка попапа — управляемое поле `closed`, которое отслеживает pollClosed() внутри runPopupAuth. */
function fakePopup() {
  return { closed: false, close: vi.fn() };
}

describe('runPopupAuth', () => {

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('rejects immediately with popupBlocked when window.open returns null (pop-up blocker)', async () => {
    vi.spyOn(window, 'open').mockReturnValue(null);
    await expect(runPopupAuth('https://example.com/authorize', 'state-1')).rejects.toMatchObject({
      i18nKey: 'shared.error.popupBlocked',
    });
  });

  it('resolves with { code, state } and closes the popup on a matching postMessage', async () => {
    const popup = fakePopup();
    vi.spyOn(window, 'open').mockReturnValue(popup as unknown as Window);

    const promise = runPopupAuth('https://example.com/authorize', 'expected-state');
    window.dispatchEvent(
      new MessageEvent('message', {
        data: { source: 'grapesjs-cloud-assets-oauth', code: 'auth-code', state: 'expected-state' },
      }),
    );

    await expect(promise).resolves.toEqual({ code: 'auth-code', state: 'expected-state' });
    expect(popup.close).toHaveBeenCalledTimes(1);
  });

  it('ignores postMessage events from other sources (e.g. unrelated scripts on the page)', async () => {
    const popup = fakePopup();
    vi.spyOn(window, 'open').mockReturnValue(popup as unknown as Window);

    const promise = runPopupAuth('https://example.com/authorize', 'expected-state');
    window.dispatchEvent(new MessageEvent('message', { data: { source: 'some-other-widget', code: 'x' } }));
    window.dispatchEvent(
      new MessageEvent('message', {
        data: { source: 'grapesjs-cloud-assets-oauth', code: 'auth-code', state: 'expected-state' },
      }),
    );

    await expect(promise).resolves.toEqual({ code: 'auth-code', state: 'expected-state' });
  });

  it('rejects with the raw error when the callback page reports data.error', async () => {
    const popup = fakePopup();
    vi.spyOn(window, 'open').mockReturnValue(popup as unknown as Window);

    const promise = runPopupAuth('https://example.com/authorize', 'expected-state');
    promise.catch(() => {}); // avoid an unhandled-rejection warning racing the assertion below
    window.dispatchEvent(
      new MessageEvent('message', { data: { source: 'grapesjs-cloud-assets-oauth', error: 'access_denied' } }),
    );

    await expect(promise).rejects.toThrow('access_denied');
  });

  it('rejects with stateMismatch when the returned state does not match what was sent', async () => {
    const popup = fakePopup();
    vi.spyOn(window, 'open').mockReturnValue(popup as unknown as Window);

    const promise = runPopupAuth('https://example.com/authorize', 'expected-state');
    promise.catch(() => {});
    window.dispatchEvent(
      new MessageEvent('message', {
        data: { source: 'grapesjs-cloud-assets-oauth', code: 'auth-code', state: 'WRONG-state' },
      }),
    );

    await expect(promise).rejects.toMatchObject({ i18nKey: 'shared.error.stateMismatch' });
  });

  it('does NOT reject on a transient popup.closed flicker that clears within the 350ms recheck window (WAM-broker false positive)', async () => {
    const popup = fakePopup();
    vi.spyOn(window, 'open').mockReturnValue(popup as unknown as Window);

    const promise = runPopupAuth('https://example.com/authorize', 'expected-state');
    let rejected = false;
    promise.catch(() => {
      rejected = true;
    });

    // pollClosed ticks every 500ms; seeing `closed` true schedules a
    // 350ms recheck. Flip `closed` back to false (simulating the WAM
    // broker handing control back after a momentary native dialog)
    // before that recheck fires, at t=850ms.
    popup.closed = true;
    await vi.advanceTimersByTimeAsync(500); // tick at t=500 sees closed=true, schedules recheck for t=850
    popup.closed = false; // window reappeared before the recheck
    await vi.advanceTimersByTimeAsync(350); // recheck fires at t=850, sees closed=false — no reject

    expect(rejected).toBe(false);

    // Finish the flow normally to avoid leaving a dangling timer/promise.
    window.dispatchEvent(
      new MessageEvent('message', {
        data: { source: 'grapesjs-cloud-assets-oauth', code: 'auth-code', state: 'expected-state' },
      }),
    );
    await expect(promise).resolves.toEqual({ code: 'auth-code', state: 'expected-state' });
  });

  it('rejects with popupClosed once the popup stays closed through the full recheck window', async () => {
    const popup = fakePopup();
    vi.spyOn(window, 'open').mockReturnValue(popup as unknown as Window);

    const promise = runPopupAuth('https://example.com/authorize', 'expected-state');
    promise.catch(() => {});

    popup.closed = true;
    await vi.advanceTimersByTimeAsync(500); // tick at t=500 sees closed=true, schedules recheck for t=850
    await vi.advanceTimersByTimeAsync(350); // recheck fires at t=850, still closed — rejects

    await expect(promise).rejects.toMatchObject({ i18nKey: 'shared.error.popupClosed' });
  });
});
