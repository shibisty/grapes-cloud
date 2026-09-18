import { vi } from 'vitest';

/**
 * Все три облачных провайдера грузят файлы через `XMLHttpRequest`
 * (не `fetch`) специально ради `xhr.upload.onprogress` — у `fetch` в
 * браузере до сих пор нет события прогресса запроса (только ответа).
 * Настоящий jsdom-XHR пытался бы реально сходить в сеть, поэтому тут
 * — управляемая подделка одного конкретного запроса: тест вызывает
 * `settle()` (успех) или `fail()` (сетевая ошибка) сам, когда готов.
 */
export interface FakeXhrHandle {
  method: string;
  url: string;
  headers: Record<string, string>;
  body: unknown;
  /** Эмулирует успешный ответ — вызывает xhr.onload с заданным статусом/телом. */
  respond(status: number, responseBody: unknown): void;
  /** Эмулирует сетевую ошибку — вызывает xhr.onerror. */
  fail(): void;
  /** Эмулирует прогресс аплоада — вызывает xhr.upload.onprogress. */
  progress(loaded: number, total: number): void;
}

export function installFakeXhr(): { handles: FakeXhrHandle[]; restore: () => void } {
  const handles: FakeXhrHandle[] = [];
  const OriginalXhr = globalThis.XMLHttpRequest;

  class FakeXMLHttpRequest {
    method = '';
    url = '';
    status = 0;
    responseText = '';
    headers: Record<string, string> = {};
    upload = { onprogress: null as ((event: ProgressEvent) => void) | null };
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;

    open(method: string, url: string) {
      this.method = method;
      this.url = url;
    }

    setRequestHeader(name: string, value: string) {
      this.headers[name] = value;
    }

    send(body: unknown) {
      const handle: FakeXhrHandle = {
        method: this.method,
        url: this.url,
        headers: this.headers,
        body,
        respond: (status, responseBody) => {
          this.status = status;
          this.responseText = typeof responseBody === 'string' ? responseBody : JSON.stringify(responseBody);
          this.onload?.();
        },
        fail: () => this.onerror?.(),
        progress: (loaded, total) => {
          this.upload.onprogress?.({ lengthComputable: true, loaded, total } as ProgressEvent);
        },
      };
      handles.push(handle);
    }
  }

  // @ts-expect-error — подмена глобального конструктора только на время теста.
  globalThis.XMLHttpRequest = FakeXMLHttpRequest;

  return {
    handles,
    restore: () => {
      globalThis.XMLHttpRequest = OriginalXhr;
    },
  };
}

/** Короткая форма для тестов, которым не нужен доступ к нескольким одновременным запросам. */
export function mockFetchOnce(status: number, body: unknown, ok = status >= 200 && status < 300): void {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({
      ok,
      status,
      statusText: ok ? 'OK' : 'Error',
      json: async () => body,
      text: async () => (typeof body === 'string' ? body : JSON.stringify(body)),
      blob: async () => new Blob([typeof body === 'string' ? body : JSON.stringify(body)]),
    })),
  );
}
