/**
 * PKCE (RFC 7636) — общий код для всех провайдеров, которым нужен
 * OAuth Authorization Code flow без client secret (Dropbox сейчас,
 * потенциально Google/OneDrive позже, если откажемся от их SDK).
 */
import { GcaError } from '../i18n/errors';

function base64UrlEncode(bytes: Uint8Array): string {
  let str = '';
  for (const b of bytes) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function generateCodeVerifier(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return base64UrlEncode(bytes);
}

export async function generateCodeChallenge(verifier: string): Promise<string> {
  /**
   * `crypto.subtle` (Web Crypto API) браузеры отключают на
   * "незащищённом" origin — обычном http, если это не localhost/
   * 127.0.0.1. Без этой проверки ошибка выглядит как
   * "Cannot read properties of undefined (reading 'digest')", что
   * ничего не говорит о причине. `crypto.getRandomValues` в
   * generateCodeVerifier()/randomState() этому ограничению не
   * подчиняется — падает именно и только это место.
   */
  if (!crypto.subtle) {
    throw new GcaError(
      'shared.error.insecureOrigin',
      'PKCE OAuth login requires the Web Crypto API (crypto.subtle), which browsers disable on an insecure ' +
        'origin (plain http, other than localhost). Open the site over https:// or, for testing, over http://localhost.',
    );
  }

  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return base64UrlEncode(new Uint8Array(digest));
}

export function randomState(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return base64UrlEncode(bytes);
}

export interface PopupAuthResult {
  code: string;
  state: string;
}

/**
 * Открывает OAuth-попап и ждёт сообщение от callback-страницы
 * (public/dropbox-callback.html), захостенной на том же домене,
 * что и редиректный URI, зарегистрированный в приложении провайдера.
 */
export function runPopupAuth(authorizeUrl: string, expectedState: string): Promise<PopupAuthResult> {
  return new Promise((resolve, reject) => {
    const popup = window.open(authorizeUrl, 'grapesjs-cloud-assets-oauth', 'width=480,height=680');
    if (!popup) {
      reject(
        new GcaError(
          'shared.error.popupBlocked',
          'The browser blocked the authorization pop-up. Allow pop-ups for this site.',
        ),
      );
      return;
    }

    let settled = false;

    const cleanup = () => {
      window.removeEventListener('message', onMessage);
      clearInterval(pollClosed);
    };

    const onMessage = (event: MessageEvent) => {
      const data = event.data as { source?: string; code?: string; state?: string; error?: string } | undefined;
      if (!data || data.source !== 'grapesjs-cloud-assets-oauth') return;

      settled = true;
      cleanup();
      popup.close();

      if (data.error) {
        reject(new Error(data.error));
        return;
      }
      if (!data.code || data.state !== expectedState) {
        reject(
          new GcaError(
            'shared.error.stateMismatch',
            'The authorization response failed verification (state mismatch).',
          ),
        );
        return;
      }
      resolve({ code: data.code, state: data.state });
    };

    window.addEventListener('message', onMessage);

    // Пользователь мог просто закрыть попап — не ждём вечно. Но
    // `popup.closed` иногда на миг читается как true и без реального
    // закрытия окна: например, на Windows с системным подборщиком
    // аккаунтов (WAM broker) шаг prompt=select_account у Microsoft
    // может на короткое время передать управление нативному диалогу
    // ОС, и в этот момент браузер отдаёт closed === true для прежнего
    // popup, хотя окно тут же появляется снова с тем же флоу. Поэтому
    // не реагируем на первое же "закрыто" — перепроверяем через
    // короткую паузу и обрываем вход, только если оно подтвердилось.
    let pendingCloseCheck = false;
    const pollClosed = window.setInterval(() => {
      if (settled || pendingCloseCheck || !popup.closed) return;
      pendingCloseCheck = true;
      window.setTimeout(() => {
        pendingCloseCheck = false;
        if (settled || !popup.closed) return;
        cleanup();
        reject(
          new GcaError(
            'shared.error.popupClosed',
            'The authorization window was closed before login finished.',
          ),
        );
      }, 350);
    }, 500);
  });
}
