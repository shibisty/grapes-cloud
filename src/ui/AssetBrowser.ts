import type { Editor } from 'grapesjs';
import type { ListResult, ResolvedAsset, ResolvedAssetType, S3ConnectionConfig, StorageItem, StorageProvider } from '../types';
import { escapeHtml } from '../utils/html';
import { guessAssetType } from '../utils/assetType';
import { t, isRtlLocale } from '../i18n/t';
import { GcaError } from '../i18n/errors';
import {
  CHEVRON_DOWN_ICON,
  CHEVRON_RIGHT_ICON,
  CLOUD_UPLOAD_ICON,
  COLLAPSE_ALL_ICON,
  EXPAND_ALL_ICON,
  FOLDER_ICON,
  GRID_VIEW_ICON,
  PLUS_ICON,
  REFRESH_ICON,
  SETTINGS_ICON,
  TABLE_VIEW_ICON,
  TREE_VIEW_ICON,
  typeIcon,
} from './icons';
/**
 * Единственное место в `ui/`, которое знает про конкретную реализацию
 * `StorageProvider` — исключение из общего правила "UI не завязан на
 * конкретные провайдеры" (см. doc-комментарий класса `AssetBrowser`
 * ниже). Причина: у Dropbox/Google/OneDrive провайдера создаёт код
 * владельца сайта заранее (`pluginsOpts.providers`) — у S3 нет OAuth
 * и общего App Key, поэтому подключение целиком происходит здесь и
 * сейчас, через попап "Подключить S3" (см. `openConnectS3Modal`), и
 * кому-то нужно самому вызвать `new S3Provider(...)` в момент клика
 * "Подключить". См. также `S3ConnectionConfig` в `types.ts`.
 */
import { S3Provider } from '../providers/s3/S3Provider';
import { readS3Connections, writeS3Connections, S3_CONNECTIONS_CHANGED_EVENT } from '../providers/s3/connections';
/** Зарезервированная ширина шеврона "ещё вкладки" в расчёте `updateTabsOverflow()` — читать реальную нельзя, кнопка скрыта (`hidden`) до самого решения "нужна ли она вообще". Совпадает с `.gca-icon-btn` (28px) + `gap` ряда (4px). */
const TAB_OVERFLOW_RESERVED_WIDTH = 32;

type ViewMode = 'grid' | 'table' | 'tree';
/** 'all' — фильтр выключен, показываются все типы. */
type TypeFilter = 'all' | ResolvedAssetType;
type SortColumn = 'name' | 'type' | 'size' | 'modified';
interface SortState {
  column: SortColumn;
  direction: 'asc' | 'desc';
}

/** Захваченное состояние фокуса/выделения для восстановления после renderBody(), см. captureFocusState()/restoreFocusState(). */
interface FocusState {
  id: string;
  selectionStart: number | null;
  selectionEnd: number | null;
}

/** Ключ в localStorage — выбор вида общий для всех провайдеров и переживает перезагрузку страницы. */
const VIEW_MODE_STORAGE_KEY = 'gca_view_mode';
/** "Кеш содержимого на 15 минут" — см. `loadActiveProvider()`/`listCache`. */
const CACHE_TTL_MS = 15 * 60 * 1000;
const SEARCH_DEBOUNCE_MS = 350;

export interface AssetBrowserProps {
  editor: Editor;
  providers: StorageProvider[];
  /**
   * Какая вкладка должна быть активна сразу при открытии — id
   * провайдера (`provider.id`, у S3 это `s3:<connectionId>`). Нужен,
   * когда пикер открыт через отдельный блок конкретного хранилища
   * (см. `canvas/block.ts`, `registerProviderBlock`) — тогда окно
   * должно сразу показать нужную вкладку, а не первую/последнюю
   * использованную. Если провайдера с таким id уже нет (например,
   * S3-соединение отключили между регистрацией блока и кликом по
   * нему) — тихо откатываемся на первый провайдер, как и без этого
   * параметра.
   */
  initialProviderId?: string;
  /** Вызывается для КАЖДОГО вставленного файла (их может быть несколько за одно действие — см. множественный выбор). */
  onSelect: (asset: ResolvedAsset) => void;
  /**
   * Вызывается один раз, когда пользователь завершил вставку (двойной
   * клик по одному файлу или кнопка "Вставить (N)" после множественного
   * выбора) — сигнал вызывающему коду, что пора закрыть модалку.
   * Раньше это делал сам `onSelect` (закрывал по первому же файлу) —
   * так больше нельзя, потому что с множественным выбором `onSelect`
   * может вызваться несколько раз подряд для одного действия.
   */
  onDone?: () => void;
  /** Необязательный текст первой вкладки — обычной галереи GrapesJS. */
  onError?: (error: unknown, providerId: string) => void;
}

interface ProviderState {
  path: string;
  breadcrumb: { name: string; path: string }[];
  items: StorageItem[];
  cursor?: string;
  hasMore: boolean;
  loading: boolean;
  error: string | null;
  /**
   * Ошибка вставки ПОСЛЕДНЕГО файла (quickInsert/insertSelection) —
   * отдельно от `error` выше, который про ошибку загрузки ВСЕГО
   * списка (и прячет сам список при рендере). Показывается плавающим
   * баннером (position: absolute, НЕ часть обычного flex-потока — не
   * сдвигает тулбар/список ни появляясь, ни исчезая), не мешая
   * продолжить работу с остальными файлами; см. insertErrorEl/
   * renderInsertErrorBanner().
   */
  insertError: string | null;
  /** Текущий поисковый запрос ("" — обычный просмотр папки, не поиск). */
  searchQuery: string;
  typeFilter: TypeFilter;
  /** Сортировка — применяется на клиенте к уже загруженным items, не требует повторного запроса. */
  sort: SortState | null;
  /** id выбранных (не вставленных сразу) файлов — см. множественный выбор shift/ctrl+клик. */
  selectedIds: Set<string>;
  /** Последний кликнутый (без модификаторов/ctrl) файл — опорная точка для shift-диапазона. */
  lastClickedId: string | null;
  /**
   * Раскрытые папки в древовидном виде (`ViewMode === 'tree'`) — пути,
   * персистятся в localStorage на провайдера (см. `persistExpandedPaths`/
   * `readExpandedPaths`) и переживают повторное открытие пикера, в
   * отличие от `treeNodes` ниже (содержимое узлов не кешируется между
   * открытиями — при повторном раскрытии просто подгружается заново).
   */
  expandedPaths: Set<string>;
  /** Лениво подгруженное содержимое узлов дерева — path → TreeNodeState, см. `ensureTreeNodeLoaded`. */
  treeNodes: Map<string, TreeNodeState>;
}

interface CacheEntry {
  items: StorageItem[];
  cursor?: string;
  hasMore: boolean;
  cachedAt: number;
}

/** Состояние одного узла древовидного вида — см. `AssetBrowser.ensureTreeNodeLoaded`. */
interface TreeNodeState {
  loading: boolean;
  /** `false`, пока не пришёл первый успешный ответ — отличает "ещё не грузили" и "догружаем следующую страницу". */
  loaded: boolean;
  error: string | null;
  children: StorageItem[];
  cursor?: string;
  hasMore: boolean;
}

/** Один файл в очереди загрузки (drag-and-drop или кнопка "Загрузить") — см. `AssetBrowser.uploadFiles`/`renderUploadQueue`. */
interface UploadQueueItem {
  id: string;
  name: string;
  status: 'pending' | 'uploading' | 'done' | 'error';
  loaded: number;
  total: number;
  errorText?: string;
}

/**
 * Один UI на всех провайдеров. Провайдер не рисует ничего сам — он
 * только отдаёт данные через StorageProvider. Это и был явный
 * архитектурный запрос: единый вид вкладок/грида независимо от
 * того, Dropbox это, Google Drive, OneDrive или S3.
 */
export class AssetBrowser {
  private readonly root: HTMLElement;
  private readonly props: AssetBrowserProps;
  private readonly editor: Editor;
  private readonly state = new Map<string, ProviderState>();
  /**
   * Провайдеры, переданные владельцем сайта (`props.providers`),
   * ПЛЮС S3-соединения, которые сам посетитель подключил через попап
   * "Подключить S3" (см. `openConnectS3Modal`/`readS3Connections`) —
   * везде ниже вместо `this.props.providers` читается это поле, оно
   * же и определяет порядок/состав вкладок в `renderShell()`.
   */
  private allProviders: StorageProvider[];
  /** Конфиги persisted S3-соединений — источник истины для localStorage, 1:1 с S3-инстансами в `allProviders` (см. `addS3Connection`/`removeS3Connection`). */
  private s3Connections: S3ConnectionConfig[];
  /** "Кеш содержимого на 15 минут" — ключ см. `cacheKey()`. Общий на все вкладки/провайдеры инстанса. */
  private readonly listCache = new Map<string, CacheEntry>();
  private activeProviderId: string;
  private activeRequest: AbortController | null = null;
  private viewMode: ViewMode;
  private searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;
  private contextMenuEl: HTMLElement | null = null;
  private closeContextMenuListener: ((e: Event) => void) | null = null;
  /** Счётчик вложенности dragenter/dragleave — см. `handleDragEnter`/`handleDragLeave`. */
  private dragDepth = 0;
  private dropOverlayEl: HTMLElement | null = null;
  private uploadQueueEl: HTMLElement | null = null;
  /** Баннер "не удалось вставить файл" — сиблинг body, см. renderShell()/renderInsertErrorBanner(). */
  private insertErrorEl: HTMLElement | null = null;
  private uploadQueueItems: UploadQueueItem[] = [];
  private connectModalEl: HTMLElement | null = null;
  /** Модалка "Подключённые аккаунты" (шестерёнка в ряду вкладок рядом с "+", см. `openSettingsModal`) — не путать с `connectModalEl` (попап "Подключить S3"). */
  private settingsModalEl: HTMLElement | null = null;
  /** Тикает раз в минуту, пока открыта settingsModalEl, чтобы обратный отсчёт токена не "замирал" — см. `openSettingsModal`. */
  private settingsModalInterval: ReturnType<typeof setInterval> | null = null;
  private readonly onLocaleChange = () => this.renderShell();
  private readonly onEscapeCloseMenu = (e: KeyboardEvent) => {
    if (e.key === 'Escape') this.closeContextMenu();
  };
  private readonly onEscapeCloseConnectModal = (e: KeyboardEvent) => {
    if (e.key === 'Escape') this.closeConnectModal();
  };
  private readonly onEscapeCloseSettingsModal = (e: KeyboardEvent) => {
    if (e.key === 'Escape') this.closeSettingsModal();
  };
  /**
   * Пересчитывает, какие вкладки помещаются по ширине, при изменении
   * размера окна (сплит-панель редактора, поворот телефона и т.п.) —
   * не только при самом рендере. Один слушатель на весь инстанс (не
   * пере-навешивается в каждом renderShell()), снимается в destroy().
   */
  private readonly onWindowResize = () => this.updateTabsOverflow();

  constructor(container: HTMLElement, props: AssetBrowserProps) {
    this.root = container;
    this.props = props;
    this.editor = props.editor;

    this.s3Connections = readS3Connections();
    this.allProviders = [...props.providers, ...this.s3Connections.map((cfg) => new S3Provider(cfg))];

    if (!this.allProviders.length) {
      // Ошибка конфигурации плагина, а не то, что увидит посетитель
      // сайта — намеренно на английском, как и остальные throw в
      // библиотечном (не UI) коде, см. комментарий у i18n/errors.ts.
      throw new Error('[grapesjs-cloud-assets] At least one provider is required in pluginsOpts.providers');
    }

    this.activeProviderId =
      props.initialProviderId && this.allProviders.some((p) => p.id === props.initialProviderId)
        ? props.initialProviderId
        : this.allProviders[0].id;
    this.viewMode = this.readViewMode();

    for (const provider of this.allProviders) {
      this.state.set(provider.id, this.freshProviderState(provider.id));
    }

    this.root.classList.add('gca-root');
    // Живое переключение языка (если сайт вызывает editor.I18n.setLocale()
    // после инициализации) — просто перерисовываем то, что уже открыто.
    this.editor.on('i18n:locale', this.onLocaleChange);
    window.addEventListener('resize', this.onWindowResize);
    this.renderShell();
    void this.loadActiveProvider();
    this.ensureTreeRootLoadedIfNeeded();
  }

  destroy(): void {
    this.editor.off('i18n:locale', this.onLocaleChange);
    window.removeEventListener('resize', this.onWindowResize);
    this.activeRequest?.abort();
    if (this.searchDebounceTimer) clearTimeout(this.searchDebounceTimer);
    this.closeContextMenu();
    this.closeConnectModal();
    this.closeSettingsModal();
    this.root.innerHTML = '';
    this.root.classList.remove('gca-root');
  }

  // ------------------------------------------------------------------
  // S3-соединения (подключаются самим посетителем, см. openConnectS3Modal)
  // ------------------------------------------------------------------

  /** Отличает S3-вкладку, подключённую самим посетителем (можно удалить кнопкой "×" на вкладке), от вкладок владельца сайта (`pluginsOpts.providers` — постоянные, без "×"). */
  private isDynamicProvider(provider: StorageProvider): boolean {
    return provider instanceof S3Provider;
  }

  private generateS3ConnectionId(): string {
    return `s3_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }

  private addS3Connection(config: S3ConnectionConfig, provider: StorageProvider): void {
    this.s3Connections.push(config);
    this.allProviders.push(provider);
    writeS3Connections(this.s3Connections);
    // Оповещаем canvas/block.ts (см. S3_CONNECTIONS_CHANGED_EVENT) —
    // чтобы блок для этого соединения появился в Block Manager сразу,
    // а не только после перезагрузки страницы/повторной инициализации
    // плагина.
    this.editor.trigger(S3_CONNECTIONS_CHANGED_EVENT);
    this.state.set(provider.id, this.freshProviderState(provider.id));
    this.activeProviderId = provider.id;
    this.renderShell();
    void this.loadActiveProvider();
    this.ensureTreeRootLoadedIfNeeded();
  }

  private removeS3Connection(provider: StorageProvider): void {
    // Инвариант конструктора ("минимум один провайдер") не должен
    // ломаться и во время работы — если это последняя оставшаяся
    // вкладка вообще, "×" на ней не должен превращать AssetBrowser в
    // пустой экран без единой вкладки для переключения.
    if (this.allProviders.length <= 1) return;
    const index = this.allProviders.findIndex((p) => p.id === provider.id);
    if (index === -1) return;

    this.allProviders.splice(index, 1);
    this.s3Connections = this.s3Connections.filter((cfg) => `s3:${cfg.id}` !== provider.id);
    writeS3Connections(this.s3Connections);
    this.editor.trigger(S3_CONNECTIONS_CHANGED_EVENT);
    this.state.delete(provider.id);
    for (const key of [...this.listCache.keys()]) {
      if (key.startsWith(`${provider.id}::`)) this.listCache.delete(key);
    }

    if (this.activeProviderId === provider.id) {
      this.activeProviderId = this.allProviders[Math.min(index, this.allProviders.length - 1)]?.id ?? '';
    }
    this.renderShell();
    if (this.allProviders.length && this.activeState.items.length === 0) void this.loadActiveProvider();
  }

  /**
   * Попап "Подключить S3" — своя мини-модалка внутри `.gca-root`, не
   * через `editor.Modal` (см. комментарий у `.gca-connect-modal-backdrop`
   * в styles.ts). Перед сохранением реально проверяет введённые
   * ключи вызовом `list('')` — иначе опечатка в Secret Access Key
   * осталась бы незамеченной вплоть до первого открытия вкладки.
   */
  private openConnectS3Modal(): void {
    this.closeConnectModal();

    const backdrop = document.createElement('div');
    backdrop.className = 'gca-connect-modal-backdrop';
    backdrop.addEventListener('click', (event) => {
      if (event.target === backdrop) this.closeConnectModal();
    });

    const modal = document.createElement('div');
    modal.className = 'gca-connect-modal';
    backdrop.appendChild(modal);

    const title = document.createElement('h3');
    title.className = 'gca-connect-modal__title';
    title.textContent = t(this.editor, 's3.modalTitle');
    modal.appendChild(title);

    const form = document.createElement('form');
    modal.appendChild(form);

    let fieldCounter = 0;
    const makeField = (labelKey: string, type: 'text' | 'password', placeholder?: string): HTMLInputElement => {
      const field = document.createElement('div');
      field.className = 'gca-connect-modal__field';
      const inputId = `gca-s3-field-${fieldCounter++}`;
      const label = document.createElement('label');
      label.textContent = t(this.editor, labelKey);
      label.htmlFor = inputId;
      const input = document.createElement('input');
      input.type = type;
      input.id = inputId;
      input.autocomplete = 'off';
      if (placeholder) input.placeholder = placeholder;
      field.appendChild(label);
      field.appendChild(input);
      form.appendChild(field);
      return input;
    };

    const nameInput = makeField('s3.nameLabel', 'text', t(this.editor, 's3.namePlaceholder'));
    const accessKeyInput = makeField('s3.accessKeyIdLabel', 'text');
    const secretKeyInput = makeField('s3.secretAccessKeyLabel', 'password');
    const bucketInput = makeField('s3.bucketLabel', 'text');
    const regionInput = makeField('s3.regionLabel', 'text', t(this.editor, 's3.regionPlaceholder'));
    const endpointInput = makeField('s3.endpointLabel', 'text', t(this.editor, 's3.endpointPlaceholder'));

    const endpointHint = document.createElement('p');
    endpointHint.className = 'gca-connect-modal__hint';
    endpointHint.textContent = t(this.editor, 's3.endpointHint');
    form.appendChild(endpointHint);

    const pathStyleRow = document.createElement('label');
    pathStyleRow.className = 'gca-connect-modal__checkbox';
    const pathStyleInput = document.createElement('input');
    pathStyleInput.type = 'checkbox';
    pathStyleRow.appendChild(pathStyleInput);
    const pathStyleText = document.createElement('span');
    pathStyleText.textContent = t(this.editor, 's3.forcePathStyleLabel');
    pathStyleRow.appendChild(pathStyleText);
    form.appendChild(pathStyleRow);

    const corsHint = document.createElement('p');
    corsHint.className = 'gca-connect-modal__hint';
    corsHint.textContent = t(this.editor, 's3.corsHint');
    form.appendChild(corsHint);

    const errorEl = document.createElement('p');
    errorEl.className = 'gca-connect-modal__error';
    errorEl.hidden = true;
    form.appendChild(errorEl);

    const actions = document.createElement('div');
    actions.className = 'gca-connect-modal__actions';
    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'gca-btn';
    cancelBtn.textContent = t(this.editor, 's3.cancel');
    cancelBtn.addEventListener('click', () => this.closeConnectModal());
    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.className = 'gca-btn gca-btn--primary';
    const connectLabel = t(this.editor, 's3.connect');
    submitBtn.textContent = connectLabel;
    actions.appendChild(cancelBtn);
    actions.appendChild(submitBtn);
    form.appendChild(actions);

    const showError = (text: string) => {
      errorEl.textContent = text;
      errorEl.hidden = false;
    };

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      errorEl.hidden = true;

      const name = nameInput.value.trim();
      const accessKeyId = accessKeyInput.value.trim();
      const secretAccessKey = secretKeyInput.value.trim();
      const bucket = bucketInput.value.trim();
      const region = regionInput.value.trim();
      const endpoint = endpointInput.value.trim();

      if (!name || !accessKeyId || !secretAccessKey || !bucket || !region) {
        showError(t(this.editor, 's3.error.required'));
        return;
      }
      if (this.allProviders.some((p) => p.label.trim().toLowerCase() === name.toLowerCase())) {
        showError(t(this.editor, 's3.error.duplicateName'));
        return;
      }

      const config: S3ConnectionConfig = {
        id: this.generateS3ConnectionId(),
        name,
        accessKeyId,
        secretAccessKey,
        bucket,
        region,
        endpoint: endpoint || undefined,
        forcePathStyle: pathStyleInput.checked,
      };
      const provider = new S3Provider(config);

      submitBtn.disabled = true;
      cancelBtn.disabled = true;
      submitBtn.textContent = t(this.editor, 's3.connecting');

      // Проверяем ключи СЕЙЧАС (list() корня бакета), а не молча
      // сохраняем и узнаём об опечатке в Secret Access Key только при
      // первом открытии вкладки — тогда ошибка была бы куда менее
      // очевидной (пустой список с ошибкой где-то в теле, а не тут же
      // в форме, где человек ещё помнит, что он только что ввёл).
      void provider
        .list('')
        .then(() => {
          this.closeConnectModal();
          this.addS3Connection(config, provider);
        })
        .catch((error: unknown) => {
          submitBtn.disabled = false;
          cancelBtn.disabled = false;
          submitBtn.textContent = connectLabel;
          showError(t(this.editor, 's3.error.connectFailed', { message: this.describeError(error) }));
        });
    });

    this.root.appendChild(backdrop);
    this.connectModalEl = backdrop;
    document.addEventListener('keydown', this.onEscapeCloseConnectModal);
    nameInput.focus();
  }

  private closeConnectModal(): void {
    if (!this.connectModalEl) return;
    this.connectModalEl.remove();
    this.connectModalEl = null;
    document.removeEventListener('keydown', this.onEscapeCloseConnectModal);
  }

  // ------------------------------------------------------------------
  // "Подключённые аккаунты" (шестерёнка рядом с "+", см.
  // renderGlobalSettingsButton) — ЧИСТО информационная модалка: по
  // одной строке на каждый OAuth-провайдер (дата первого входа,
  // App Key/Client ID, обратный отсчёт до истечения ТЕКУЩЕГО
  // access-токена, короткая заметка о том, как вообще ведёт себя
  // сессия у этого провайдера) плюс кнопка Войти/Выйти. Специально
  // БЕЗ единой настройки, которая навязывала бы что-то поверх
  // настоящего OAuth-механизма — см. `ProviderSessionInfo` в
  // `types.ts` и историю проекта (пользователь явно отклонил
  // клиентский принудительный сброс сессии: "либо авто от токена,
  // либо логаут от клиента, сами ничего не делаем").
  // ------------------------------------------------------------------

  /**
   * Локализованная длительность вроде "42 минуты"/"3 часа" — через
   * `Intl.NumberFormat` со `style: 'unit'` (широко поддерживается, но
   * не абсолютно везде — например, старые движки без ICU); при сбое
   * просто возвращает нелокализованные "N min"/"N h", как и
   * `formatSize()` для единиц KB/MB (см. её комментарий) — это лучше,
   * чем уронить всю модалку на редком браузере.
   */
  private formatDuration(ms: number): string {
    const totalMinutes = Math.max(1, Math.round(ms / 60000));
    const locale = this.editor.I18n.getLocale();
    try {
      if (totalMinutes < 60) {
        return new Intl.NumberFormat(locale, { style: 'unit', unit: 'minute', unitDisplay: 'long' }).format(totalMinutes);
      }
      const hours = Math.round(totalMinutes / 60);
      return new Intl.NumberFormat(locale, { style: 'unit', unit: 'hour', unitDisplay: 'long' }).format(hours);
    } catch {
      return totalMinutes < 60 ? `${totalMinutes} min` : `${Math.round(totalMinutes / 60)} h`;
    }
  }

  /** Провайдеры, которые вообще имеет смысл показывать в "Подключённые аккаунты" — с App Key/Client ID, уже сохранённым через мастер настройки (иначе там нечего показывать, кроме как "не настроено", а это уже экран самой вкладки). */
  private settingsModalProviders(): StorageProvider[] {
    return this.allProviders.filter((p) => p.setCredential && p.getAuthState().configured);
  }

  private openSettingsModal(): void {
    this.closeConnectModal();
    this.closeSettingsModal();

    const backdrop = document.createElement('div');
    backdrop.className = 'gca-connect-modal-backdrop';
    backdrop.addEventListener('click', (event) => {
      if (event.target === backdrop) this.closeSettingsModal();
    });

    const modal = document.createElement('div');
    modal.className = 'gca-connect-modal gca-settings-modal';
    backdrop.appendChild(modal);

    const title = document.createElement('h3');
    title.className = 'gca-connect-modal__title';
    title.textContent = t(this.editor, 'settings.title');
    modal.appendChild(title);

    const list = document.createElement('div');
    list.className = 'gca-settings-modal__list';
    modal.appendChild(list);

    const renderRows = () => {
      list.innerHTML = '';
      const providers = this.settingsModalProviders();

      if (!providers.length) {
        const empty = document.createElement('p');
        empty.className = 'gca-settings-modal__empty';
        empty.textContent = t(this.editor, 'settings.empty');
        list.appendChild(empty);
        return;
      }

      for (const provider of providers) {
        list.appendChild(renderRow(provider));
      }
    };

    const renderRow = (provider: StorageProvider): HTMLElement => {
      const row = document.createElement('div');
      row.className = 'gca-settings-modal__row';

      const head = document.createElement('div');
      head.className = 'gca-settings-modal__row-head';
      head.innerHTML = `<span class="gca-tab__icon">${provider.icon}</span><span class="gca-settings-modal__row-label">${escapeHtml(provider.label)}</span>`;
      row.appendChild(head);

      const info = document.createElement('div');
      info.className = 'gca-settings-modal__row-info';

      const session = provider.getSessionInfo?.();
      if (session?.credential) {
        const credentialLabelKey = provider.getSetupInfo?.()?.credentialLabelKey ?? 'setup.appKeyPlaceholder';
        const credentialLine = document.createElement('p');
        credentialLine.textContent = `${t(this.editor, credentialLabelKey)}: ${session.credential}`;
        info.appendChild(credentialLine);
      }

      const dateLine = document.createElement('p');
      dateLine.textContent = session?.authenticatedAt
        ? t(this.editor, 'settings.authenticatedAt', { date: this.formatDate(new Date(session.authenticatedAt).toISOString()) })
        : t(this.editor, 'settings.authenticatedAtUnknown');
      info.appendChild(dateLine);

      const auth = provider.getAuthState();
      const statusLine = document.createElement('p');
      statusLine.className = 'gca-settings-modal__row-status';
      if (auth.authenticated && session?.expiresAt) {
        const remaining = session.expiresAt - Date.now();
        statusLine.textContent =
          remaining > 0
            ? t(this.editor, 'settings.tokenExpiresIn', { time: this.formatDuration(remaining) })
            : t(this.editor, 'settings.tokenExpired');
      } else if (!auth.authenticated) {
        statusLine.textContent = t(this.editor, 'settings.notConnected');
      }
      if (statusLine.textContent) info.appendChild(statusLine);

      if (session?.sessionNoteKey) {
        const note = document.createElement('p');
        note.className = 'gca-settings-modal__row-note';
        note.textContent = t(this.editor, session.sessionNoteKey);
        info.appendChild(note);
      }

      row.appendChild(info);

      const actions = document.createElement('div');
      actions.className = 'gca-settings-modal__row-actions';

      if (auth.authenticated) {
        const logoutBtn = document.createElement('button');
        logoutBtn.type = 'button';
        logoutBtn.className = 'gca-btn';
        logoutBtn.textContent = t(this.editor, 'auth.logout');
        let confirmTimer: ReturnType<typeof setTimeout> | null = null;
        logoutBtn.addEventListener('click', () => {
          if (logoutBtn.classList.contains('gca-btn--confirm')) {
            if (confirmTimer) clearTimeout(confirmTimer);
            void this.handleLogout(provider).then(renderRows);
            return;
          }
          logoutBtn.classList.add('gca-btn--confirm');
          logoutBtn.textContent = t(this.editor, 'auth.logoutConfirm');
          confirmTimer = setTimeout(() => {
            logoutBtn.classList.remove('gca-btn--confirm');
            logoutBtn.textContent = t(this.editor, 'auth.logout');
          }, 4000);
        });
        actions.appendChild(logoutBtn);
      } else {
        const loginBtn = document.createElement('button');
        loginBtn.type = 'button';
        loginBtn.className = 'gca-btn gca-btn--primary';
        loginBtn.textContent = t(this.editor, 'auth.loginButton', { provider: provider.label });
        loginBtn.addEventListener('click', () => {
          loginBtn.disabled = true;
          loginBtn.textContent = t(this.editor, 'auth.loggingIn');
          void provider
            .authenticate()
            .then(() => {
              // Активной вкладке тоже нужно узнать, что теперь есть
              // доступ — иначе она осталась бы на экране "Войти" до
              // следующего клика по вкладке.
              if (this.activeProviderId === provider.id) {
                this.renderBody();
                void this.loadActiveProvider();
              }
              renderRows();
            })
            .catch((error: unknown) => {
              this.props.onError?.(error, provider.id);
              loginBtn.disabled = false;
              loginBtn.textContent = t(this.editor, 'auth.loginButton', { provider: provider.label });
            });
        });
        actions.appendChild(loginBtn);
      }

      row.appendChild(actions);
      return row;
    };

    renderRows();
    // Обратный отсчёт токена не должен "замирать", пока модалка
    // открыта — перерисовываем раз в минуту (не чаще: секунды тут не
    // нужны, счётчик округляется до минут/часов, см. formatDuration()).
    this.settingsModalInterval = setInterval(renderRows, 60_000);

    const actionsRow = document.createElement('div');
    actionsRow.className = 'gca-connect-modal__actions';
    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'gca-btn';
    closeBtn.textContent = t(this.editor, 'settings.close');
    closeBtn.addEventListener('click', () => this.closeSettingsModal());
    actionsRow.appendChild(closeBtn);
    modal.appendChild(actionsRow);

    this.root.appendChild(backdrop);
    this.settingsModalEl = backdrop;
    document.addEventListener('keydown', this.onEscapeCloseSettingsModal);
  }

  private closeSettingsModal(): void {
    if (this.settingsModalInterval) {
      clearInterval(this.settingsModalInterval);
      this.settingsModalInterval = null;
    }
    if (!this.settingsModalEl) return;
    this.settingsModalEl.remove();
    this.settingsModalEl = null;
    document.removeEventListener('keydown', this.onEscapeCloseSettingsModal);
  }

  // ------------------------------------------------------------------
  // Рендер
  // ------------------------------------------------------------------

  private rootCrumb(): { name: string; path: string } {
    return { name: t(this.editor, 'common.rootCrumb'), path: '' };
  }

  private freshProviderState(providerId: string): ProviderState {
    return {
      path: '',
      breadcrumb: [this.rootCrumb()],
      items: [],
      hasMore: false,
      loading: false,
      error: null,
      insertError: null,
      searchQuery: '',
      typeFilter: 'all',
      sort: null,
      selectedIds: new Set(),
      lastClickedId: null,
      expandedPaths: this.readExpandedPaths(providerId),
      treeNodes: new Map(),
    };
  }

  /** Вид (плитка/таблица/дерево) общий для всех вкладок и переживает перезагрузку страницы. */
  private readViewMode(): ViewMode {
    try {
      const saved = localStorage.getItem(VIEW_MODE_STORAGE_KEY);
      return saved === 'table' || saved === 'tree' ? saved : 'grid';
    } catch {
      // localStorage недоступен (приватный режим, ограничения окружения) — просто плитка по умолчанию.
      return 'grid';
    }
  }

  private setViewMode(mode: ViewMode): void {
    if (this.viewMode === mode) return;
    this.viewMode = mode;
    try {
      localStorage.setItem(VIEW_MODE_STORAGE_KEY, mode);
    } catch {
      // Не критично — просто не переживёт перезагрузку страницы.
    }
    this.renderBody();
    this.ensureTreeRootLoadedIfNeeded();
  }

  /**
   * Ключ localStorage для раскрытых папок дерева — свой на каждого
   * провайдера (у Dropbox и Google Drive структура папок совершенно
   * разная, общий набор путей не имел бы смысла).
   */
  private expandedPathsStorageKey(providerId: string): string {
    return `gca_tree_expanded_${providerId}`;
  }

  private readExpandedPaths(providerId: string): Set<string> {
    try {
      const raw = localStorage.getItem(this.expandedPathsStorageKey(providerId));
      if (!raw) return new Set();
      const parsed: unknown = JSON.parse(raw);
      return Array.isArray(parsed) ? new Set(parsed.filter((p): p is string => typeof p === 'string')) : new Set();
    } catch {
      // Битый JSON или localStorage недоступен — просто начинаем со свёрнутого дерева.
      return new Set();
    }
  }

  private persistExpandedPaths(providerId: string, expanded: Set<string>): void {
    try {
      localStorage.setItem(this.expandedPathsStorageKey(providerId), JSON.stringify([...expanded]));
    } catch {
      // Не критично — просто не переживёт перезагрузку страницы.
    }
  }

  /**
   * Вызывается везде, откуда меняется активный провайдер/режим вида:
   * если сейчас показан древовидный вид и провайдер уже авторизован,
   * подгружает корневой узел (если ещё не загружен). Ничего не делает
   * в остальных случаях (грид/таблица сами дозагружаются через
   * `loadActiveProvider`, авторизации ещё нет — покажется экран входа).
   */
  private ensureTreeRootLoadedIfNeeded(): void {
    if (this.viewMode !== 'tree') return;
    const provider = this.activeProvider;
    const state = this.activeState;
    if (!provider.getAuthState().authenticated) return;
    void this.ensureTreeNodeLoaded(provider, state, '').then(() => this.restoreExpandedTreeNodes(provider, state, ''));
  }

  /**
   * После того, как узел '' (или любой другой) успешно загружен,
   * догружает всех его ПРЯМЫХ детей, которые уже отмечены раскрытыми
   * в `expandedPaths` (persisted, см. readExpandedPaths) — и
   * рекурсивно продолжает вниз. Это и есть "запоминать, что было
   * раскрыто, и показывать это при повторном открытии" — раскрытые
   * узлы сами себя не подгружают во время рендера (см. комментарий в
   * renderTreeChildren про риск вложенного renderBody()), так что кто-то
   * должен явно инициировать их загрузку СНАРУЖИ рендера — здесь и в
   * toggleTreeNode() ниже.
   */
  private async restoreExpandedTreeNodes(provider: StorageProvider, state: ProviderState, path: string): Promise<void> {
    const node = state.treeNodes.get(path);
    if (!node?.loaded) return;
    const expandedChildren = node.children.filter((i) => i.kind === 'folder' && state.expandedPaths.has(i.path));
    for (const child of expandedChildren) {
      await this.ensureTreeNodeLoaded(provider, state, child.path);
      await this.restoreExpandedTreeNodes(provider, state, child.path);
    }
  }

  /** Подпись типа файла — и в колонке "Тип" таблицы, и как title у иконки в плитке. */
  private typeLabel(item: StorageItem): string {
    if (item.kind === 'folder') return t(this.editor, 'common.type.folder');
    const type = guessAssetType(item.mimeType, item.name);
    return t(this.editor, `common.type.${type}`);
  }

  /** Единицы KB/MB/GB намеренно не переводятся ни в одной локали — техническая нотация, как и у остальных провайдеров. */
  private formatSize(bytes: number | undefined): string {
    if (bytes === undefined) return '';
    if (bytes < 1024) return `${bytes} B`;
    const units = ['KB', 'MB', 'GB', 'TB'];
    let value = bytes / 1024;
    let unitIndex = 0;
    while (value >= 1024 && unitIndex < units.length - 1) {
      value /= 1024;
      unitIndex++;
    }
    return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unitIndex]}`;
  }

  private formatDate(iso: string | undefined): string {
    if (!iso) return '';
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '';
    try {
      return date.toLocaleDateString(this.editor.I18n.getLocale(), { dateStyle: 'medium' });
    } catch {
      // Локаль редактора незнакома Intl (маловероятно, но не должно ронять рендер) — оставляем ISO-дату как есть.
      return iso.slice(0, 10);
    }
  }

  /**
   * Переводит ошибку в текст для показа пользователю. `GcaError` —
   * ошибка из наших же провайдеров/pkce.ts с "адресом" перевода
   * вместо готового текста (см. `i18n/errors.ts`) — резолвится через
   * `editor.I18n.t()` на текущий язык. Обычный `Error` (например,
   * сырой ответ Dropbox API) показывается как есть — его текст и так
   * содержит полезную диагностику, а не то, что стоило бы переводить.
   */
  private describeError(error: unknown, fallbackKey = 'common.error.generic'): string {
    if (error instanceof GcaError) return t(this.editor, error.i18nKey, error.params);
    if (error instanceof Error && error.message) return error.message;
    return t(this.editor, fallbackKey);
  }

  private get activeProvider(): StorageProvider {
    const provider = this.allProviders.find((p) => p.id === this.activeProviderId);
    if (!provider) throw new Error('[grapesjs-cloud-assets] Unknown provider: ' + this.activeProviderId);
    return provider;
  }

  private get activeState(): ProviderState {
    return this.state.get(this.activeProviderId)!;
  }

  private renderShell(): void {
    this.root.innerHTML = '';
    // Направление текста — по языку интерфейса, не завязано на язык
    // конкретного провайдера/файла: у арабского, иврита и фарси весь
    // UI читается справа налево.
    this.root.setAttribute('dir', isRtlLocale(this.editor.I18n.getLocale()) ? 'rtl' : 'ltr');

    const tabs = document.createElement('div');
    tabs.className = 'gca-tabs';
    for (const provider of this.allProviders) {
      const wrap = document.createElement('div');
      wrap.className = 'gca-tab-wrap';

      const removable = this.isDynamicProvider(provider);
      const tab = document.createElement('button');
      tab.type = 'button';
      tab.className = 'gca-tab' + (provider.id === this.activeProviderId ? ' gca-tab--active' : '') + (removable ? ' gca-tab--removable' : '');
      tab.innerHTML = `<span class="gca-tab__icon">${provider.icon}</span><span class="gca-tab__label">${escapeHtml(provider.label)}</span>`;
      tab.addEventListener('click', () => this.switchProvider(provider.id));
      wrap.appendChild(tab);

      // "×" — только у S3-соединений, подключённых самим посетителем
      // (см. isDynamicProvider) — постоянные вкладки владельца сайта
      // убрать отсюда нельзя (их и подключил не посетитель). Двухшаговое
      // подтверждение — тот же паттерн, что у "Выйти" в renderSettingsMenu,
      // без window.confirm().
      //
      // Баг из практики: раньше "вооружённое" состояние (после первого
      // клика, ждём второй клик-подтверждение) было видно ТОЛЬКО в
      // title/aria-label — а `.gca-tab__remove--confirm` в styles.ts был
      // того же цвета, что и обычный `:hover`. Поскольку курсор мыши и
      // так стоит на кнопке в момент клика, оба состояния выглядели
      // ВИЗУАЛЬНО ИДЕНТИЧНО — первый клик казался вообще ничего не
      // сделавшим (кнопка так и осталась "×" того же цвета), и человек
      // не знал, что нужно кликнуть ещё раз в течение 4 секунд. Теперь
      // "вооружённое" состояние ещё и меняет сам символ на "?" (второй
      // символ текста `removeConnectionConfirm`, "Remove?"/"Точно
      // удалить?") — это видно без наведения и без чтения tooltip'а.
      if (removable) {
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'gca-tab__remove';
        const removeLabel = t(this.editor, 'common.removeConnection');
        removeBtn.title = removeLabel;
        removeBtn.setAttribute('aria-label', removeLabel);
        removeBtn.textContent = '×';
        let confirmTimer: ReturnType<typeof setTimeout> | null = null;
        removeBtn.addEventListener('click', (event) => {
          event.stopPropagation();
          if (removeBtn.classList.contains('gca-tab__remove--confirm')) {
            if (confirmTimer) clearTimeout(confirmTimer);
            this.removeS3Connection(provider);
            return;
          }
          removeBtn.classList.add('gca-tab__remove--confirm');
          removeBtn.textContent = '?';
          removeBtn.title = t(this.editor, 'common.removeConnectionConfirm');
          removeBtn.setAttribute('aria-label', t(this.editor, 'common.removeConnectionConfirm'));
          confirmTimer = setTimeout(() => {
            removeBtn.classList.remove('gca-tab__remove--confirm');
            removeBtn.textContent = '×';
            removeBtn.title = removeLabel;
            removeBtn.setAttribute('aria-label', removeLabel);
          }, 4000);
        });
        wrap.appendChild(removeBtn);
      }

      tabs.appendChild(wrap);
    }

    tabs.appendChild(this.renderTabOverflowButton());
    tabs.appendChild(this.renderAddConnectionButton());
    // Шестерёнка "Подключённые аккаунты" — по просьбе пользователя
    // именно рядом с "+" (см. историю проекта), а не только внутри
    // тулбара конкретной вкладки (там уже есть своя шестерёнка с
    // одним пунктом "Выйти" — renderSettingsMenu). Эта — общая на все
    // вкладки сразу, показывает все OAuth-подключения разом.
    if (this.allProviders.some((p) => p.setCredential)) {
      tabs.appendChild(this.renderGlobalSettingsButton());
    }

    const body = document.createElement('div');
    body.className = 'gca-body';
    body.setAttribute('data-gca-body', '');

    this.root.appendChild(tabs);
    this.root.appendChild(body);

    // Оверлей зоны перетаскивания и панель прогресса загрузки — СНАРУЖИ
    // body (сиблинги, не дети), потому что renderBody() делает
    // body.innerHTML = '' на каждый чих (поиск, сортировка, обновление)
    // и стёр бы их посреди перетаскивания/загрузки файла.
    this.dropOverlayEl = this.renderDropOverlay();
    this.root.appendChild(this.dropOverlayEl);
    this.attachDropHandlers(body);

    this.uploadQueueEl = document.createElement('div');
    this.uploadQueueEl.className = 'gca-upload-queue';
    this.uploadQueueEl.hidden = true;
    this.root.appendChild(this.uploadQueueEl);
    this.renderUploadQueue();

    // Тоже сиблинг body (см. комментарий у dropOverlayEl выше), но, в
    // отличие от dropOverlayEl/uploadQueueEl, позиционируется НЕ в
    // обычном flex-потоке .gca-root, а через position: absolute (см.
    // .gca-insert-error в styles.ts) — по просьбе пользователя баннер
    // об ошибке вставки не должен сдвигать тулбар/список ни при
    // появлении, ни при исчезновении, в отличие от панели загрузки
    // выше (та специально занимает место — прогресс есть на что
    // посмотреть). Наполняется/прячется точечно через
    // renderInsertErrorBanner(), которая читает состояние АКТИВНОГО
    // на данный момент провайдера — вызывается отсюда же (после
    // переключения вкладки — вдруг у новой активной вкладки уже есть
    // свой insertError) и из quickInsert()/insertSelection()/крестика
    // закрытия, а не из renderBody() (тот всё равно не тронул бы этот
    // элемент — он вне body).
    this.insertErrorEl = document.createElement('div');
    this.insertErrorEl.className = 'gca-error gca-insert-error';
    this.insertErrorEl.hidden = true;
    this.root.appendChild(this.insertErrorEl);
    this.renderInsertErrorBanner();

    // Строится ПОСЛЕ того, как все вкладки/кнопки реально в DOM — расчёт
    // ниже читает их реальную ширину (offsetWidth), см. updateTabsOverflow().
    this.updateTabsOverflow();

    this.renderBody();
  }

  // ------------------------------------------------------------------
  // Ряд вкладок: "+" (подключить S3) и шеврон "ещё вкладки"
  // ------------------------------------------------------------------

  /**
   * Кнопка "+" в конце ряда вкладок — сейчас единственный пункт
   * выпадающего меню это "Подключить S3" (см. openConnectS3Modal), но
   * оформлено как меню, а не сразу кнопка действия, чтобы новый тип
   * соединения в будущем не требовал менять сам ряд вкладок, только
   * добавить пункт сюда. Тот же паттерн открытия/закрытия по клику
   * вовне, что и у renderSettingsMenu.
   */
  private renderAddConnectionButton(): HTMLElement {
    const wrap = document.createElement('div');
    wrap.className = 'gca-tab-add';

    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'gca-tab-icon-btn';
    const addLabel = t(this.editor, 'common.addConnection');
    addBtn.title = addLabel;
    addBtn.setAttribute('aria-label', addLabel);
    addBtn.setAttribute('aria-expanded', 'false');
    addBtn.innerHTML = PLUS_ICON;

    const menu = document.createElement('div');
    menu.className = 'gca-tab-add__menu';
    menu.hidden = true;

    const connectS3Item = document.createElement('button');
    connectS3Item.type = 'button';
    connectS3Item.className = 'gca-tab-add__item';
    connectS3Item.innerHTML = `<span class="gca-tab__icon">${S3Provider.ICON}</span><span>${escapeHtml(t(this.editor, 's3.connectMenuItem'))}</span>`;
    connectS3Item.addEventListener('click', (event) => {
      event.stopPropagation();
      closeMenu();
      this.openConnectS3Modal();
    });
    menu.appendChild(connectS3Item);

    const onDocClick = (event: MouseEvent) => {
      if (!wrap.contains(event.target as Node)) closeMenu();
    };
    const closeMenu = () => {
      menu.hidden = true;
      addBtn.setAttribute('aria-expanded', 'false');
      document.removeEventListener('click', onDocClick);
    };

    addBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      if (menu.hidden) {
        menu.hidden = false;
        addBtn.setAttribute('aria-expanded', 'true');
        document.addEventListener('click', onDocClick);
      } else {
        closeMenu();
      }
    });

    wrap.appendChild(addBtn);
    wrap.appendChild(menu);
    return wrap;
  }

  /**
   * Шестерёнка "Подключённые аккаунты" — по просьбе пользователя
   * рядом с "+" в ряду вкладок (см. историю проекта), одна на все
   * OAuth-провайдеры сразу (Dropbox/Google Drive/OneDrive — у кого
   * есть `setCredential`), открывает `openSettingsModal()`. НЕ путать
   * с `renderSettingsMenu()` — той шестерёнкой внутри тулбара ОДНОЙ
   * конкретной вкладки, где сейчас только пункт "Выйти".
   */
  private renderGlobalSettingsButton(): HTMLElement {
    const wrap = document.createElement('div');
    wrap.className = 'gca-settings-tab-btn';

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'gca-tab-icon-btn';
    const label = t(this.editor, 'settings.tabButton');
    btn.title = label;
    btn.setAttribute('aria-label', label);
    btn.innerHTML = SETTINGS_ICON;
    btn.addEventListener('click', (event) => {
      event.stopPropagation();
      this.openSettingsModal();
    });

    wrap.appendChild(btn);
    return wrap;
  }

  /**
   * Шеврон "ещё вкладки" — скрыт по умолчанию (`hidden`), содержимое
   * и видимость выставляет `updateTabsOverflow()` уже после того, как
   * все вкладки реально в DOM и можно измерить, влезли ли они. Сама
   * кнопка тут — просто разметка-заготовка + логика открытия/закрытия
   * меню; какие именно провайдеры в него попадут, эта функция не
   * знает и не должна — это ответственность updateTabsOverflow().
   */
  private renderTabOverflowButton(): HTMLElement {
    const wrap = document.createElement('div');
    wrap.className = 'gca-tab-overflow';
    wrap.hidden = true;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'gca-tab-icon-btn';
    const label = t(this.editor, 'common.moreTabs');
    btn.title = label;
    btn.setAttribute('aria-label', label);
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = CHEVRON_DOWN_ICON;

    const menu = document.createElement('div');
    menu.className = 'gca-tab-overflow__menu';
    menu.hidden = true;

    const onDocClick = (event: MouseEvent) => {
      if (!wrap.contains(event.target as Node)) closeMenu();
    };
    const closeMenu = () => {
      menu.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
      document.removeEventListener('click', onDocClick);
    };
    btn.addEventListener('click', (event) => {
      event.stopPropagation();
      if (menu.hidden) {
        menu.hidden = false;
        btn.setAttribute('aria-expanded', 'true');
        document.addEventListener('click', onDocClick);
      } else {
        closeMenu();
      }
    });

    wrap.appendChild(btn);
    wrap.appendChild(menu);
    return wrap;
  }

  /**
   * Прячет за шеврон (`.gca-tab-overflow`) ровно те вкладки, которые
   * не влезли в ширину ряда — а не отдаёт их на откуп CSS-переносу
   * (`.gca-tabs` теперь `flex-wrap: nowrap`, см. styles.ts). Активная
   * вкладка ВСЕГДА остаётся видимой (иначе переключение на вкладку из
   * самого выпадающего меню тут же спрятало бы её саму — см. ниже),
   * даже если по чистому порядку она должна была бы уйти в меню.
   *
   * jsdom (юнит-тесты) и модалка, которая ещё не открылась/не имеет
   * размера, всегда отдают `clientWidth === 0` — в этом случае просто
   * ничего не трогаем и оставляем все вкладки видимыми: считать "по
   * нулевой ширине ничего не влезло" было бы неверно и спрятало бы
   * вообще все вкладки.
   */
  private updateTabsOverflow(): void {
    const tabsEl = this.root.querySelector<HTMLElement>('.gca-tabs');
    if (!tabsEl) return;
    const wraps = [...tabsEl.querySelectorAll<HTMLElement>('.gca-tab-wrap')];
    const overflowWrap = tabsEl.querySelector<HTMLElement>('.gca-tab-overflow');
    const overflowMenu = overflowWrap?.querySelector<HTMLElement>('.gca-tab-overflow__menu');
    const addWrap = tabsEl.querySelector<HTMLElement>('.gca-tab-add');
    // Шестерёнка "Подключённые аккаунты" — необязательный сосед "+"
    // (см. renderShell), рисуется только если хоть один провайдер её
    // требует. Её ширину тоже нужно резервировать наравне с "+",
    // иначе на узком экране последняя видимая вкладка перекрывала бы
    // её вместо ухода в шеврон "ещё вкладки".
    const settingsWrap = tabsEl.querySelector<HTMLElement>('.gca-settings-tab-btn');
    if (!overflowWrap || !overflowMenu || !addWrap) return;

    wraps.forEach((w) => (w.style.display = ''));
    overflowWrap.hidden = true;
    overflowMenu.innerHTML = '';

    const containerWidth = tabsEl.clientWidth;
    if (containerWidth <= 0) return;

    const addWidth = addWrap.offsetWidth + 4 + (settingsWrap ? settingsWrap.offsetWidth + 4 : 0); // + gap ряда
    const widths = wraps.map((w) => w.offsetWidth + 4);
    const totalWidth = widths.reduce((a, b) => a + b, 0);

    if (totalWidth <= containerWidth - addWidth) return; // всё влезло — шеврон не нужен

    const activeIndex = this.allProviders.findIndex((p) => p.id === this.activeProviderId);
    const budget = containerWidth - addWidth - TAB_OVERFLOW_RESERVED_WIDTH;
    let used = activeIndex >= 0 ? widths[activeIndex] : 0;
    const hiddenIndexes: number[] = [];

    this.allProviders.forEach((_, i) => {
      if (i === activeIndex) return;
      used += widths[i];
      if (used > budget) hiddenIndexes.push(i);
    });

    if (!hiddenIndexes.length) return;

    overflowWrap.hidden = false;
    for (const i of hiddenIndexes) {
      wraps[i].style.display = 'none';
      const provider = this.allProviders[i];
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'gca-tab-overflow__item';
      item.innerHTML = `<span class="gca-tab__icon">${provider.icon}</span><span>${escapeHtml(provider.label)}</span>`;
      item.addEventListener('click', (event) => {
        event.stopPropagation();
        overflowMenu.hidden = true;
        overflowWrap.querySelector('button')?.setAttribute('aria-expanded', 'false');
        this.switchProvider(provider.id);
      });
      overflowMenu.appendChild(item);
    }
  }

  private renderBody(): void {
    // Любая перерисовка означает, что DOM под открытым контекстным
    // меню/его якорем мог только что пересоздаться — закрываем, чтобы
    // не оставить меню, указывающее на уже несуществующий элемент.
    this.closeContextMenu();

    const body = this.root.querySelector<HTMLElement>('[data-gca-body]');
    if (!body) return;

    // body.innerHTML = '' ниже уничтожает вообще все элементы, включая
    // то поле, в которое человек только что печатал (например,
    // debounce поиска сам вызывает renderBody() дважды подряд, пока
    // фокус всё ещё должен быть в поле поиска) — без этого захват/
    // восстановление курсор и фокус улетали на <body> документа
    // посреди набора текста. См. restoreFocusState() ниже.
    const focusState = this.captureFocusState(body);
    body.innerHTML = '';
    this.fillBody(body);
    this.restoreFocusState(body, focusState);
  }

  private fillBody(body: HTMLElement): void {
    const provider = this.activeProvider;
    const state = this.activeState;
    const auth = provider.getAuthState();

    // Провайдеру ещё нечем авторизоваться (нет App Key и т.п.) — вместо
    // кнопки "Войти" показываем пошаговый мастер настройки. Проверяем
    // ДО authenticated: пока не configured, authenticated всегда false,
    // но смысл экрана другой — не "войдите", а "сначала настройте".
    if (auth.configured === false) {
      body.appendChild(this.renderSetupWizard(provider));
      return;
    }

    if (!auth.authenticated) {
      body.appendChild(this.renderAuthGate(provider));
      return;
    }

    body.appendChild(this.renderToolbar(provider, state));

    // Раньше рендерилась только при selectedIds.size > 0 — из-за этого
    // при выборе первого файла весь контент под тулбаром прыгал вниз
    // (полоса "N выбрано" внезапно занимала место), а при отмене выбора
    // прыгал обратно. Теперь полоса всегда в разметке (просто "0
    // выбрано" и невидимые, но занимающие место кнопки, пока выбора
    // нет — см. renderSelectionBar()), высота body стабильна.
    body.appendChild(this.renderSelectionBar(provider, state));

    // Баннер ошибки вставки (.gca-insert-error) СЮДА не добавляется —
    // он сиблинг body, позиционируется через position: absolute и
    // обновляется отдельно, см. renderInsertErrorBanner()/insertErrorEl.

    // Древовидный вид не связан с `state.items`/`state.path` обычного
    // просмотра (у него своя лениво подгружаемая иерархия начиная с
    // корня, см. `treeNodes`) — поэтому у него отдельная ветка,
    // раньше остальных проверок ниже (они все про `state.items`).
    if (this.viewMode === 'tree') {
      body.appendChild(this.renderTree(provider, state));
      return;
    }

    if (state.error) {
      const err = document.createElement('div');
      err.className = 'gca-error';
      err.textContent = state.error;
      body.appendChild(err);
      return;
    }

    if (state.loading && state.items.length === 0) {
      const loading = document.createElement('div');
      loading.className = 'gca-loading';
      loading.textContent = t(this.editor, 'common.loading');
      body.appendChild(loading);
      return;
    }

    const visible = this.visibleItems(state);

    if (visible.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'gca-empty';
      empty.textContent = t(this.editor, 'common.empty');
      body.appendChild(empty);
      return;
    }

    body.appendChild(
      this.viewMode === 'table' ? this.renderTable(provider, state, visible) : this.renderGrid(provider, state, visible),
    );

    if (state.hasMore) {
      body.appendChild(this.renderLoadMoreButton(state));
    }
  }

  /**
   * Ловит фокус ТОЛЬКО у полей, явно помеченных `data-gca-focus-id`
   * (сейчас — поиск, фильтр по типу, поле "Добавить по URL" и поле
   * App Key/Client ID в мастере настройки): это единственные элементы
   * внутри body, куда человек может печатать и где полная пересборка
   * DOM на каждый renderBody() иначе сбивала бы фокус/курсор.
   */
  private captureFocusState(body: HTMLElement): FocusState | null {
    const active = document.activeElement;
    if (!(active instanceof HTMLElement) || !body.contains(active)) return null;
    const id = active.getAttribute('data-gca-focus-id');
    if (!id) return null;
    const selectable = active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement;
    return {
      id,
      selectionStart: selectable ? active.selectionStart : null,
      selectionEnd: selectable ? active.selectionEnd : null,
    };
  }

  private restoreFocusState(body: HTMLElement, focusState: FocusState | null): void {
    if (!focusState) return;
    const el = body.querySelector<HTMLElement>(`[data-gca-focus-id="${focusState.id}"]`);
    if (!el) return;
    el.focus({ preventScroll: true });
    if (
      (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) &&
      focusState.selectionStart !== null &&
      focusState.selectionEnd !== null
    ) {
      try {
        el.setSelectionRange(focusState.selectionStart, focusState.selectionEnd);
      } catch {
        // Некоторые браузеры не поддерживают setSelectionRange для
        // отдельных типов <input> (например type="search" в Safari) —
        // фокус уже восстановлен, диапазон выделения просто пропускаем.
      }
    }
  }

  private renderAuthGate(provider: StorageProvider): HTMLElement {
    const wrap = document.createElement('div');
    wrap.className = 'gca-auth-gate';

    const text = document.createElement('p');
    text.textContent = t(this.editor, 'auth.connectPrompt', { provider: provider.label });
    wrap.appendChild(text);

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'gca-btn gca-btn--primary';
    btn.textContent = t(this.editor, 'auth.loginButton', { provider: provider.label });

    // Раньше ошибка входа уходила только в onError/console — человек
    // без открытого DevTools просто видел, что кнопка вернулась в
    // исходное состояние, без единой подсказки почему.
    const errorEl = document.createElement('p');
    errorEl.className = 'gca-error gca-auth-gate__error';
    errorEl.hidden = true;

    btn.addEventListener('click', async () => {
      btn.disabled = true;
      btn.textContent = t(this.editor, 'auth.loggingIn');
      errorEl.hidden = true;
      try {
        await provider.authenticate();
        this.renderBody();
        await this.loadActiveProvider();
        this.ensureTreeRootLoadedIfNeeded();
      } catch (error) {
        this.props.onError?.(error, provider.id);
        errorEl.textContent = this.describeError(error, 'auth.loginFailed');
        errorEl.hidden = false;
        btn.disabled = false;
        btn.textContent = t(this.editor, 'auth.loginButton', { provider: provider.label });
      }
    });
    wrap.appendChild(btn);
    wrap.appendChild(errorEl);

    // Ключ сохраняется в браузере навсегда — но пользователю может
    // понадобиться сменить его (опечатался, завёл новое приложение).
    // Возвращаем в мастер настройки, а не заставляем чистить localStorage руками.
    if (provider.setCredential) {
      const changeBtn = document.createElement('button');
      changeBtn.type = 'button';
      changeBtn.className = 'gca-link-btn gca-auth-gate__change';
      changeBtn.textContent = t(this.editor, 'auth.changeAppKey');
      changeBtn.addEventListener('click', () => {
        provider.setCredential!('');
        this.renderBody();
      });
      wrap.appendChild(changeBtn);
    }

    return wrap;
  }

  /**
   * Мастер настройки — первое, что видит пользователь, пока провайдеру
   * не хватает пользовательских данных для входа (у Dropbox — App Key).
   * Показывает ссылку на консоль провайдера, пошаговую инструкцию
   * (со значениями для копирования — например, redirect URI) и, если
   * провайдер это поддерживает, поле для ввода и сохранения ключа.
   */
  private renderSetupWizard(provider: StorageProvider): HTMLElement {
    const wrap = document.createElement('div');
    wrap.className = 'gca-setup-wizard';

    const info = provider.getSetupInfo?.();
    if (!info) {
      const text = document.createElement('p');
      text.textContent = t(this.editor, 'setup.missingInfo', { provider: provider.label });
      wrap.appendChild(text);
      return wrap;
    }

    const intro = document.createElement('p');
    intro.className = 'gca-setup-wizard__intro';
    intro.textContent = t(this.editor, 'setup.intro', { provider: provider.label });
    const link = document.createElement('a');
    link.href = info.createAppUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.className = 'gca-link-btn';
    link.textContent = info.createAppUrl;
    intro.appendChild(link);
    wrap.appendChild(intro);

    const list = document.createElement('ol');
    list.className = 'gca-setup-wizard__steps';
    for (const step of info.steps) {
      const li = document.createElement('li');
      const text = document.createElement('div');
      text.textContent = step.i18nKey ? t(this.editor, step.i18nKey, step.i18nParams) : (step.text ?? '');
      li.appendChild(text);
      if (step.copyValue) li.appendChild(this.renderCopyRow(step.copyValue));
      list.appendChild(li);
    }
    wrap.appendChild(list);

    // Провайдер поддерживает upload() — подсказываем про drag-and-drop
    // сразу в мастере настройки, а не только молча показываем кнопку
    // "Загрузить" уже после подключения, где её легко не заметить.
    if (provider.upload) {
      const uploadHint = document.createElement('p');
      uploadHint.className = 'gca-setup-wizard__upload-hint';
      uploadHint.textContent = t(this.editor, 'setup.uploadHint');
      wrap.appendChild(uploadHint);
    }

    if (provider.setCredential) {
      const errorEl = document.createElement('p');
      errorEl.className = 'gca-error';
      errorEl.hidden = true;

      const form = document.createElement('form');
      form.className = 'gca-setup-wizard__form';

      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'gca-url-input';
      input.setAttribute('data-gca-focus-id', 'setup-credential');
      input.placeholder = t(this.editor, info.credentialLabelKey ?? 'setup.appKeyPlaceholder');
      input.autocomplete = 'off';

      const submit = document.createElement('button');
      submit.type = 'submit';
      submit.className = 'gca-btn gca-btn--primary';
      submit.textContent = t(this.editor, 'setup.save');

      form.addEventListener('submit', (event) => {
        event.preventDefault();
        const value = input.value.trim();
        if (!value) return;
        try {
          provider.setCredential!(value);
          errorEl.hidden = true;
          // Перерисовываем весь блок: как только configured станет true,
          // экран сам переключится на обычную кнопку "Войти" (или на
          // грид, если сессия почему-то уже жива).
          this.renderBody();
        } catch (error) {
          errorEl.textContent = this.describeError(error, 'setup.saveFailed');
          errorEl.hidden = false;
        }
      });

      form.appendChild(input);
      form.appendChild(submit);
      wrap.appendChild(form);
      wrap.appendChild(errorEl);
    }

    return wrap;
  }

  private renderCopyRow(value: string): HTMLElement {
    const row = document.createElement('div');
    row.className = 'gca-copy-row';

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'gca-copy-row__input';
    input.value = value;
    input.readOnly = true;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'gca-btn gca-copy-row__btn';
    btn.textContent = t(this.editor, 'setup.copy');
    btn.addEventListener('click', () => void this.copyToClipboard(input, btn));

    row.appendChild(input);
    row.appendChild(btn);
    return row;
  }

  private async copyToClipboard(input: HTMLInputElement, btn: HTMLButtonElement): Promise<void> {
    const original = btn.textContent;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(input.value);
      } else {
        input.select();
        document.execCommand('copy');
      }
      btn.textContent = t(this.editor, 'setup.copied');
    } catch {
      // Буфер обмена недоступен (нет разрешения, незащищённый origin) —
      // хотя бы выделяем текст, чтобы скопировать можно было Ctrl+C.
      input.select();
      btn.textContent = t(this.editor, 'setup.selected');
    } finally {
      setTimeout(() => {
        btn.textContent = original;
      }, 1500);
    }
  }

  // ------------------------------------------------------------------
  // Тулбар: хлебные крошки, поиск/фильтр, настройки, вид
  // ------------------------------------------------------------------

  private renderToolbar(provider: StorageProvider, state: ProviderState): HTMLElement {
    const toolbar = document.createElement('div');
    toolbar.className = 'gca-toolbar';

    const topRow = document.createElement('div');
    topRow.className = 'gca-toolbar__row';

    const crumbs = document.createElement('div');
    crumbs.className = 'gca-breadcrumb';
    state.breadcrumb.forEach((crumb, i) => {
      const isLast = i === state.breadcrumb.length - 1;
      const el = document.createElement(isLast ? 'span' : 'button');
      el.textContent = crumb.name;
      el.className = 'gca-breadcrumb__item' + (isLast ? ' gca-breadcrumb__item--current' : '');
      if (!isLast) {
        (el as HTMLButtonElement).type = 'button';
        el.addEventListener('click', () => void this.navigateTo(crumb.path, state.breadcrumb.slice(0, i + 1)));
      }
      crumbs.appendChild(el);
      if (!isLast) {
        const sep = document.createElement('span');
        sep.className = 'gca-breadcrumb__sep';
        sep.textContent = '/';
        crumbs.appendChild(sep);
      }
    });
    topRow.appendChild(crumbs);

    const topActions = document.createElement('div');
    topActions.className = 'gca-toolbar__actions';
    topActions.appendChild(this.renderRefreshButton(state));

    // Настройки (сейчас только "Выйти") — только у "ключевых" облачных
    // провайдеров (у которых есть setCredential, тот же признак, что
    // уже используется для "Изменить App Key" на экране входа). У
    // локальных файлов там нечего показывать.
    if (provider.setCredential) {
      topActions.appendChild(this.renderSettingsMenu(provider));
    }

    topActions.appendChild(this.renderViewToggle());
    topRow.appendChild(topActions);
    toolbar.appendChild(topRow);

    const toolsRow = document.createElement('div');
    toolsRow.className = 'gca-toolbar__row gca-toolbar__row--tools';

    // Поиск и фильтр по типу работают над плоским `state.items` текущей
    // папки — у древовидного вида нет одного "текущего списка", это
    // отдельная иерархия узлов, так что в этом режиме их просто не
    // показываем, а не оставляем нефункциональными.
    if (this.viewMode !== 'tree') {
      const searchRow = this.renderSearchRow(provider, state);
      if (searchRow) toolsRow.appendChild(searchRow);
    }

    if (provider.addByUrl) {
      toolsRow.appendChild(this.renderUrlForm(provider));
    }

    if (provider.upload) {
      const uploadLabel = document.createElement('label');
      uploadLabel.className = 'gca-btn gca-upload-btn';
      uploadLabel.textContent = t(this.editor, 'common.uploadFile');
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = true;
      input.style.display = 'none';
      input.addEventListener('change', () => {
        const files = input.files ? Array.from(input.files) : [];
        if (files.length) void this.uploadFiles(provider, state.path, files);
        input.value = '';
      });
      uploadLabel.appendChild(input);
      toolsRow.appendChild(uploadLabel);
    }

    if (toolsRow.children.length) toolbar.appendChild(toolsRow);

    return toolbar;
  }

  /** Поиск по хранилищу + фильтр по типу — только если провайдер вообще поддерживает search() (не у "Своих файлов"). */
  private renderSearchRow(provider: StorageProvider, state: ProviderState): HTMLElement | null {
    if (!provider.search) return null;

    const row = document.createElement('div');
    row.className = 'gca-search-row';

    const searchInput = document.createElement('input');
    searchInput.type = 'search';
    searchInput.className = 'gca-url-input gca-search-input';
    searchInput.setAttribute('data-gca-focus-id', 'search');
    searchInput.placeholder = t(this.editor, 'common.searchPlaceholder');
    searchInput.value = state.searchQuery;
    searchInput.addEventListener('input', () => {
      const value = searchInput.value;
      if (this.searchDebounceTimer) clearTimeout(this.searchDebounceTimer);
      this.searchDebounceTimer = setTimeout(() => {
        state.searchQuery = value.trim();
        state.selectedIds.clear();
        void this.loadActiveProvider();
      }, SEARCH_DEBOUNCE_MS);
    });
    row.appendChild(searchInput);

    const filterSelect = document.createElement('select');
    filterSelect.className = 'gca-filter-select';
    filterSelect.setAttribute('data-gca-focus-id', 'filter');
    const options: [TypeFilter, string][] = [
      ['all', 'common.filter.all'],
      ['image', 'common.type.image'],
      ['video', 'common.type.video'],
      ['audio', 'common.type.audio'],
      ['document', 'common.type.document'],
    ];
    for (const [value, key] of options) {
      const opt = document.createElement('option');
      opt.value = value;
      opt.textContent = t(this.editor, key);
      opt.selected = state.typeFilter === value;
      filterSelect.appendChild(opt);
    }
    filterSelect.addEventListener('change', () => {
      state.typeFilter = filterSelect.value as TypeFilter;
      this.renderBody();
    });
    row.appendChild(filterSelect);

    return row;
  }

  private renderRefreshButton(state: ProviderState): HTMLElement {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'gca-icon-btn' + (state.loading ? ' gca-icon-btn--spinning' : '');
    const label = t(this.editor, 'common.refresh');
    btn.title = label;
    btn.setAttribute('aria-label', label);
    btn.disabled = state.loading;
    btn.innerHTML = REFRESH_ICON;
    btn.addEventListener('click', () => void this.loadActiveProvider({ force: true }));
    return btn;
  }

  /**
   * Настройки в виде выпадающего меню под иконкой-шестерёнкой — раньше
   * "Выйти" была отдельной кнопкой прямо в тулбаре, теперь спрятана
   * сюда (см. запрос пользователя) и требует подтверждения: первый
   * клик переводит пункт меню в состояние "Точно выйти?" на несколько
   * секунд, обычный `window.confirm()` тут сознательно не используется
   * — модальные браузерные диалоги хуже вписываются в общий стиль
   * плагина и не стилизуются под тему редактора.
   */
  private renderSettingsMenu(provider: StorageProvider): HTMLElement {
    const wrap = document.createElement('div');
    wrap.className = 'gca-settings';

    const gearBtn = document.createElement('button');
    gearBtn.type = 'button';
    gearBtn.className = 'gca-icon-btn';
    const gearLabel = t(this.editor, 'common.settings');
    gearBtn.title = gearLabel;
    gearBtn.setAttribute('aria-label', gearLabel);
    gearBtn.setAttribute('aria-expanded', 'false');
    gearBtn.innerHTML = SETTINGS_ICON;

    const menu = document.createElement('div');
    menu.className = 'gca-settings__menu';
    menu.hidden = true;

    const logoutBtn = document.createElement('button');
    logoutBtn.type = 'button';
    logoutBtn.className = 'gca-settings__item';
    logoutBtn.textContent = t(this.editor, 'auth.logout');

    let confirmTimer: ReturnType<typeof setTimeout> | null = null;
    const resetLogoutBtn = () => {
      if (confirmTimer) clearTimeout(confirmTimer);
      confirmTimer = null;
      logoutBtn.classList.remove('gca-settings__item--confirm');
      logoutBtn.textContent = t(this.editor, 'auth.logout');
    };

    logoutBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      if (logoutBtn.classList.contains('gca-settings__item--confirm')) {
        resetLogoutBtn();
        closeMenu();
        void this.handleLogout(provider);
        return;
      }
      logoutBtn.classList.add('gca-settings__item--confirm');
      logoutBtn.textContent = t(this.editor, 'auth.logoutConfirm');
      confirmTimer = setTimeout(resetLogoutBtn, 4000);
    });
    menu.appendChild(logoutBtn);

    const onDocClick = (event: MouseEvent) => {
      if (!wrap.contains(event.target as Node)) closeMenu();
    };
    const closeMenu = () => {
      menu.hidden = true;
      gearBtn.setAttribute('aria-expanded', 'false');
      resetLogoutBtn();
      document.removeEventListener('click', onDocClick);
    };

    gearBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      if (menu.hidden) {
        menu.hidden = false;
        gearBtn.setAttribute('aria-expanded', 'true');
        document.addEventListener('click', onDocClick);
      } else {
        closeMenu();
      }
    });

    wrap.appendChild(gearBtn);
    wrap.appendChild(menu);
    return wrap;
  }

  /**
   * Разлогин из текущего аккаунта провайдера — не путать с "Изменить
   * App Key"/setCredential('') на экране входа: тот сбрасывает вообще
   * всё (включая Client ID), а это только сессионные токены, чтобы
   * попробовать другой аккаунт, оставив настройку приложения как есть.
   * Сбрасываем также локальное состояние списка файлов (и его кеш) —
   * иначе после повторного входа на миг мелькнёт список из прошлой сессии.
   */
  private async handleLogout(provider: StorageProvider): Promise<void> {
    try {
      await provider.disconnect();
    } catch (error) {
      this.props.onError?.(error, provider.id);
    }
    this.state.set(provider.id, this.freshProviderState(provider.id));
    for (const key of [...this.listCache.keys()]) {
      if (key.startsWith(`${provider.id}::`)) this.listCache.delete(key);
    }
    this.renderBody();
  }

  /** Переключатель "плитка"/"таблица" — общий для всех провайдеров, см. VIEW_MODE_STORAGE_KEY. */
  private renderViewToggle(): HTMLElement {
    const wrap = document.createElement('div');
    wrap.className = 'gca-view-toggle';

    const modes: [ViewMode, string, string][] = [
      ['grid', GRID_VIEW_ICON, 'common.viewGrid'],
      ['table', TABLE_VIEW_ICON, 'common.viewTable'],
      ['tree', TREE_VIEW_ICON, 'common.viewTree'],
    ];

    for (const [mode, icon, labelKey] of modes) {
      const btn = document.createElement('button');
      btn.type = 'button';
      const label = t(this.editor, labelKey);
      const active = this.viewMode === mode;
      btn.className = 'gca-view-toggle__btn' + (active ? ' gca-view-toggle__btn--active' : '');
      btn.title = label;
      btn.setAttribute('aria-label', label);
      btn.setAttribute('aria-pressed', String(active));
      btn.innerHTML = icon;
      btn.addEventListener('click', () => this.setViewMode(mode));
      wrap.appendChild(btn);
    }

    return wrap;
  }

  private renderUrlForm(provider: StorageProvider): HTMLElement {
    const form = document.createElement('form');
    form.className = 'gca-url-form';

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'gca-url-input';
    input.setAttribute('data-gca-focus-id', 'add-url');
    input.placeholder = t(this.editor, 'common.urlPlaceholder');

    const submit = document.createElement('button');
    submit.type = 'submit';
    submit.className = 'gca-btn';
    submit.textContent = t(this.editor, 'common.addUrl');

    form.appendChild(input);
    form.appendChild(submit);

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const url = input.value.trim();
      if (!url) return;
      void this.addByUrl(provider, url, form, input, submit);
    });

    return form;
  }

  /**
   * Панель "Выбрано N" — теперь рендерится ВСЕГДА (см. fillBody()), а не
   * только при множественном выборе, чтобы место под неё было
   * зарезервировано с самого начала и остальной контент не прыгал при
   * первом/последнем клике. Пока выбора нет — просто "0 выбрано" и
   * кнопки Cancel/Insert невидимые (`visibility: hidden` через
   * `.gca-selection-bar__actions--empty`, НЕ `display: none`/`hidden` —
   * тогда они по-прежнему занимают место в разметке, но некликабельны).
   */
  private renderSelectionBar(provider: StorageProvider, state: ProviderState): HTMLElement {
    const bar = document.createElement('div');
    bar.className = 'gca-selection-bar';

    const count = state.selectedIds.size;

    const label = document.createElement('span');
    label.className = 'gca-selection-bar__label';
    label.textContent = t(this.editor, 'common.selectedCount', { count });
    bar.appendChild(label);

    const actions = document.createElement('div');
    actions.className = count > 0 ? 'gca-selection-bar__actions' : 'gca-selection-bar__actions gca-selection-bar__actions--empty';

    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'gca-btn';
    cancelBtn.textContent = t(this.editor, 'common.cancelSelection');
    cancelBtn.tabIndex = count > 0 ? 0 : -1;
    cancelBtn.addEventListener('click', () => {
      state.selectedIds.clear();
      state.lastClickedId = null;
      this.renderBody();
    });
    actions.appendChild(cancelBtn);

    const insertBtn = document.createElement('button');
    insertBtn.type = 'button';
    insertBtn.className = 'gca-btn gca-btn--primary';
    insertBtn.textContent = t(this.editor, 'common.insertSelected', { count });
    insertBtn.tabIndex = count > 0 ? 0 : -1;
    insertBtn.addEventListener('click', () => void this.insertSelection(provider, state));
    actions.appendChild(insertBtn);

    bar.appendChild(actions);
    return bar;
  }

  // ------------------------------------------------------------------
  // Списки: фильтр + сортировка (на клиенте, над уже загруженными items)
  // ------------------------------------------------------------------

  private visibleItems(state: ProviderState): StorageItem[] {
    let items = state.items;
    if (state.typeFilter !== 'all') {
      items = items.filter(
        (item) => item.kind === 'folder' || guessAssetType(item.mimeType, item.name) === state.typeFilter,
      );
    }
    return this.sortItems(items, state.sort);
  }

  /** Папки всегда впереди файлов (как и раньше, когда это просто был порядок из API) — сортировка применяется внутри каждой из групп. */
  private sortItems(items: StorageItem[], sort: SortState | null): StorageItem[] {
    const folders = items.filter((i) => i.kind === 'folder');
    const files = items.filter((i) => i.kind === 'file');
    const cmp = this.compareFn(sort);
    // Array.prototype.sort стабилен в современных движках — без
    // выбранной сортировки (`cmp` — тождественный компаратор) исходный
    // порядок внутри каждой группы не меняется.
    folders.sort(cmp);
    files.sort(cmp);
    return [...folders, ...files];
  }

  private compareFn(sort: SortState | null): (a: StorageItem, b: StorageItem) => number {
    if (!sort) return () => 0;
    const dir = sort.direction === 'asc' ? 1 : -1;
    return (a, b) => {
      switch (sort.column) {
        case 'name':
          return a.name.localeCompare(b.name) * dir;
        case 'type': {
          const ta = a.kind === 'folder' ? '' : guessAssetType(a.mimeType, a.name);
          const tb = b.kind === 'folder' ? '' : guessAssetType(b.mimeType, b.name);
          return ta.localeCompare(tb) * dir;
        }
        case 'size':
          return ((a.size ?? 0) - (b.size ?? 0)) * dir;
        case 'modified': {
          const ma = a.modifiedAt ? Date.parse(a.modifiedAt) : 0;
          const mb = b.modifiedAt ? Date.parse(b.modifiedAt) : 0;
          return (ma - mb) * dir;
        }
        default:
          return 0;
      }
    };
  }

  private renderGrid(provider: StorageProvider, state: ProviderState, visible: StorageItem[]): HTMLElement {
    const grid = document.createElement('div');
    grid.className = 'gca-grid';

    for (const item of visible) {
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'gca-cell' + (state.selectedIds.has(item.id) ? ' gca-cell--selected' : '');
      cell.title = item.name;

      const thumb = document.createElement('div');
      thumb.className = 'gca-cell__thumb';
      if (item.kind === 'file' && item.thumbnailUrl) {
        const img = document.createElement('img');
        img.src = item.thumbnailUrl;
        img.alt = '';
        img.loading = 'lazy';
        thumb.appendChild(img);
      } else if (item.kind === 'folder') {
        thumb.innerHTML = FOLDER_ICON;
        thumb.title = this.typeLabel(item);
      } else {
        thumb.innerHTML = typeIcon(guessAssetType(item.mimeType, item.name));
        thumb.title = this.typeLabel(item);
      }
      cell.appendChild(thumb);

      const name = document.createElement('div');
      name.className = 'gca-cell__name';
      name.textContent = item.name;
      cell.appendChild(name);

      cell.addEventListener('click', (event) => this.handleItemClick(event, item, state, visible));
      cell.addEventListener('dblclick', () => this.handleItemDblClick(provider, item, cell));
      cell.addEventListener('contextmenu', (event) => this.handleContextMenu(event, provider, item, state));
      this.attachLongPress(cell, (x, y) => this.openContextMenuAt(x, y, provider, item, state));

      grid.appendChild(cell);
    }

    return grid;
  }

  private renderTable(provider: StorageProvider, state: ProviderState, visible: StorageItem[]): HTMLElement {
    const table = document.createElement('table');
    table.className = 'gca-table';

    const thead = document.createElement('thead');
    const headRow = document.createElement('tr');
    const headers: [string, SortColumn, string?][] = [
      ['common.columnName', 'name'],
      ['common.columnType', 'type', 'gca-table__col--type'],
      ['common.columnSize', 'size', 'gca-table__col--size'],
      ['common.columnModified', 'modified', 'gca-table__col--modified'],
    ];
    for (const [key, column, extraClass] of headers) {
      const th = document.createElement('th');
      if (extraClass) th.className = extraClass;

      const active = state.sort?.column === column;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'gca-table__sort-btn' + (active ? ' gca-table__sort-btn--active' : '');
      btn.textContent = t(this.editor, key) + (active ? (state.sort!.direction === 'asc' ? ' ↑' : ' ↓') : '');
      btn.addEventListener('click', () => {
        state.sort =
          state.sort?.column === column
            ? { column, direction: state.sort.direction === 'asc' ? 'desc' : 'asc' }
            : { column, direction: 'asc' };
        this.renderBody();
      });
      th.appendChild(btn);
      headRow.appendChild(th);
    }
    thead.appendChild(headRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    for (const item of visible) {
      const row = document.createElement('tr');
      row.className = 'gca-table__row' + (state.selectedIds.has(item.id) ? ' gca-table__row--selected' : '');
      row.addEventListener('contextmenu', (event) => this.handleContextMenu(event, provider, item, state));
      this.attachLongPress(row, (x, y) => this.openContextMenuAt(x, y, provider, item, state));

      const nameCell = document.createElement('td');
      nameCell.className = 'gca-table__cell gca-table__cell--name';
      const nameBtn = document.createElement('button');
      nameBtn.type = 'button';
      nameBtn.className = 'gca-table__name-btn';
      nameBtn.title = item.name;

      const icon = document.createElement('span');
      icon.className = 'gca-table__icon';
      if (item.kind === 'file' && item.thumbnailUrl) {
        const img = document.createElement('img');
        img.src = item.thumbnailUrl;
        img.alt = '';
        img.loading = 'lazy';
        icon.appendChild(img);
      } else if (item.kind === 'folder') {
        icon.innerHTML = FOLDER_ICON;
      } else {
        icon.innerHTML = typeIcon(guessAssetType(item.mimeType, item.name));
      }
      nameBtn.appendChild(icon);

      const nameText = document.createElement('span');
      nameText.className = 'gca-table__name-text';
      nameText.textContent = item.name;
      nameBtn.appendChild(nameText);

      nameBtn.addEventListener('click', (event) => this.handleItemClick(event, item, state, visible));
      nameBtn.addEventListener('dblclick', () => this.handleItemDblClick(provider, item, nameBtn));
      nameCell.appendChild(nameBtn);
      row.appendChild(nameCell);

      const typeCell = document.createElement('td');
      typeCell.className = 'gca-table__cell gca-table__cell--type';
      typeCell.textContent = this.typeLabel(item);
      row.appendChild(typeCell);

      const sizeCell = document.createElement('td');
      sizeCell.className = 'gca-table__cell gca-table__cell--size';
      sizeCell.textContent = item.kind === 'file' ? this.formatSize(item.size) : '';
      row.appendChild(sizeCell);

      const modifiedCell = document.createElement('td');
      modifiedCell.className = 'gca-table__cell gca-table__cell--modified';
      modifiedCell.textContent = this.formatDate(item.modifiedAt);
      row.appendChild(modifiedCell);

      tbody.appendChild(row);
    }
    table.appendChild(tbody);

    const wrap = document.createElement('div');
    wrap.className = 'gca-table-wrap';
    wrap.appendChild(table);
    return wrap;
  }

  private renderLoadMoreButton(state: ProviderState): HTMLElement {
    const wrap = document.createElement('div');
    wrap.className = 'gca-load-more-wrap';

    const more = document.createElement('button');
    more.type = 'button';
    more.className = 'gca-load-more' + (state.loading ? ' gca-load-more--loading' : '');
    more.disabled = state.loading;

    const label = document.createElement('span');
    label.className = 'gca-load-more__label';
    label.textContent = t(this.editor, 'common.loadMore');
    more.appendChild(label);

    if (state.loading) {
      const bar = document.createElement('span');
      bar.className = 'gca-load-more__bar';
      more.appendChild(bar);
    }

    more.addEventListener('click', () => void this.loadActiveProvider({ append: true }));
    wrap.appendChild(more);
    return wrap;
  }

  // ------------------------------------------------------------------
  // Множественный выбор (shift/ctrl+клик) и вставка
  // ------------------------------------------------------------------

  private handleItemClick(event: MouseEvent, item: StorageItem, state: ProviderState, visible: StorageItem[]): void {
    if (item.kind === 'folder') {
      state.selectedIds.clear();
      state.lastClickedId = null;
      void this.navigateTo(item.path, [...state.breadcrumb, { name: item.name, path: item.path }]);
      return;
    }

    if (event.shiftKey && state.lastClickedId) {
      const fileIds = visible.filter((i) => i.kind === 'file').map((i) => i.id);
      const fromIdx = fileIds.indexOf(state.lastClickedId);
      const toIdx = fileIds.indexOf(item.id);
      if (fromIdx !== -1 && toIdx !== -1) {
        const [start, end] = fromIdx < toIdx ? [fromIdx, toIdx] : [toIdx, fromIdx];
        for (let i = start; i <= end; i++) state.selectedIds.add(fileIds[i]);
      } else {
        state.selectedIds.add(item.id);
      }
    } else if (event.ctrlKey || event.metaKey) {
      if (state.selectedIds.has(item.id)) state.selectedIds.delete(item.id);
      else state.selectedIds.add(item.id);
      state.lastClickedId = item.id;
    } else {
      state.selectedIds = new Set([item.id]);
      state.lastClickedId = item.id;
    }

    this.renderBody();
  }

  /** Двойной клик по файлу — вставляет его сразу и закрывает пикер (быстрый путь для одного файла, без похода за кнопкой "Вставить"). */
  private handleItemDblClick(provider: StorageProvider, item: StorageItem, el: HTMLElement): void {
    if (item.kind === 'folder') return;
    void this.quickInsert(provider, item, el);
  }

  private async quickInsert(provider: StorageProvider, item: StorageItem, busyEl: HTMLElement): Promise<void> {
    busyEl.classList.add('gca-cell--busy');
    // Провайдер, к которому реально относится этот клик — не обязательно
    // this.activeProvider к МОМЕНТУ catch (пользователь мог успеть
    // переключить вкладку, пока resolve() ещё в полёте).
    const state = this.state.get(provider.id);
    if (state) {
      state.insertError = null;
      if (this.activeProviderId === provider.id) this.renderInsertErrorBanner();
    }
    try {
      const asset = await provider.resolve(item);
      this.props.onSelect(asset);
      this.props.onDone?.();
    } catch (error) {
      this.props.onError?.(error, provider.id);
      // Раньше ошибка (например, OneDrive-item без
      // @microsoft.graph.downloadUrl — см. GcaError в
      // OneDriveProvider.resolve()) уходила только в onError/console —
      // человек без открытых DevTools видел лишь, что двойной клик
      // "ничего не сделал". Показываем баннер (не прячем сам список,
      // как это делает state.error) — только если провайдер всё ещё
      // активен, иначе показывать банер сейчас некуда (он один на
      // пикер, см. insertErrorEl).
      if (state) {
        state.insertError = this.describeError(error, 'common.error.insertFailed');
        if (this.activeProviderId === provider.id) this.renderInsertErrorBanner();
      }
    } finally {
      busyEl.classList.remove('gca-cell--busy');
    }
  }

  /** Кнопка "Вставить (N)" из панели выбора — вставляет все выбранные файлы по очереди и закрывает пикер, если хотя бы один прошёл успешно. */
  private async insertSelection(provider: StorageProvider, state: ProviderState): Promise<void> {
    const ids = [...state.selectedIds];
    if (!ids.length) return;

    state.insertError = null;
    let insertedAny = false;
    for (const id of ids) {
      const item = state.items.find((i) => i.id === id);
      if (!item || item.kind === 'folder') continue;
      try {
        const asset = await provider.resolve(item);
        this.props.onSelect(asset);
        insertedAny = true;
      } catch (error) {
        this.props.onError?.(error, provider.id);
        // Как и в quickInsert() выше — раньше это уходило только в
        // onError/console. При нескольких ошибках в одной вставке
        // показываем баннером последнюю (если и вся вставка провалилась
        // целиком, модалка не закроется — пользователь увидит баннер и
        // сможет разобраться, что именно не вставилось).
        state.insertError = this.describeError(error, 'common.error.insertFailed');
      }
    }

    state.selectedIds.clear();
    state.lastClickedId = null;
    this.renderBody();
    this.renderInsertErrorBanner(); // сиблинг body — renderBody() выше его не трогает, обновляем отдельно
    if (insertedAny) this.props.onDone?.();
  }

  /**
   * Наполняет/прячет insertErrorEl (см. поле выше и комментарий в
   * renderShell()) текстом ошибки АКТИВНОГО провайдера — сам баннер не
   * принимает состояние параметром, а всегда читает `this.activeState`,
   * потому что элемент один на весь пикер (как и uploadQueueEl) и
   * показывается только для той вкладки, что сейчас открыта.
   */
  private renderInsertErrorBanner(): void {
    const el = this.insertErrorEl;
    if (!el) return;

    const message = this.activeState.insertError;
    if (!message) {
      el.hidden = true;
      el.innerHTML = '';
      return;
    }
    el.hidden = false;
    el.innerHTML = '';

    const text = document.createElement('span');
    text.className = 'gca-insert-error__text';
    text.textContent = message;
    el.appendChild(text);

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'gca-icon-btn gca-insert-error__close';
    const label = t(this.editor, 'common.upload.close');
    closeBtn.title = label;
    closeBtn.setAttribute('aria-label', label);
    closeBtn.textContent = '×';
    closeBtn.addEventListener('click', () => {
      this.activeState.insertError = null;
      this.renderInsertErrorBanner();
    });
    el.appendChild(closeBtn);
  }

  // ------------------------------------------------------------------
  // Контекстное меню (правый клик / долгое нажатие на тач-устройствах)
  // ------------------------------------------------------------------

  private handleContextMenu(event: MouseEvent, provider: StorageProvider, item: StorageItem, state: ProviderState): void {
    if (!item.webUrl && !provider.delete) return; // нечего предложить — пусть будет обычное меню браузера
    event.preventDefault();
    this.openContextMenuAt(event.clientX, event.clientY, provider, item, state);
  }

  /** Долгое нажатие (мобильные) — эквивалент правого клика для контекстного меню. */
  private attachLongPress(el: HTMLElement, onLongPress: (x: number, y: number) => void): void {
    let timer: ReturnType<typeof setTimeout> | null = null;
    let moved = false;
    const clear = () => {
      if (timer) clearTimeout(timer);
      timer = null;
    };
    el.addEventListener(
      'touchstart',
      (event) => {
        moved = false;
        const touch = event.touches[0];
        if (!touch) return;
        const x = touch.clientX;
        const y = touch.clientY;
        timer = setTimeout(() => {
          if (!moved) onLongPress(x, y);
        }, 550);
      },
      { passive: true },
    );
    el.addEventListener('touchmove', () => { moved = true; clear(); }, { passive: true });
    el.addEventListener('touchend', clear, { passive: true });
    el.addEventListener('touchcancel', clear, { passive: true });
  }

  private openContextMenuAt(x: number, y: number, provider: StorageProvider, item: StorageItem, state: ProviderState): void {
    const hasOpen = !!item.webUrl;
    const hasDelete = !!provider.delete;
    if (!hasOpen && !hasDelete) return;
    this.closeContextMenu();

    const menu = document.createElement('div');
    menu.className = 'gca-context-menu';

    if (hasOpen) {
      const openItem = document.createElement('button');
      openItem.type = 'button';
      openItem.className = 'gca-context-menu__item';
      openItem.textContent = t(this.editor, 'common.openInTab');
      openItem.addEventListener('click', () => {
        window.open(item.webUrl, '_blank', 'noopener,noreferrer');
        this.closeContextMenu();
      });
      menu.appendChild(openItem);
    }

    if (hasDelete) {
      const deleteItemBtn = document.createElement('button');
      deleteItemBtn.type = 'button';
      deleteItemBtn.className = 'gca-context-menu__item gca-context-menu__item--danger';
      deleteItemBtn.textContent = t(this.editor, 'common.delete');
      let confirming = false;
      deleteItemBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        if (!confirming) {
          confirming = true;
          deleteItemBtn.textContent = t(this.editor, 'common.deleteConfirm');
          return;
        }
        this.closeContextMenu();
        void this.deleteItem(provider, item, state);
      });
      menu.appendChild(deleteItemBtn);
    }

    document.body.appendChild(menu);
    const rect = menu.getBoundingClientRect();
    const left = Math.max(8, Math.min(x, window.innerWidth - rect.width - 8));
    const top = Math.max(8, Math.min(y, window.innerHeight - rect.height - 8));
    menu.style.left = `${left}px`;
    menu.style.top = `${top}px`;

    this.contextMenuEl = menu;
    const closeListener = (e: Event) => {
      if (menu.contains(e.target as Node)) return;
      this.closeContextMenu();
    };
    this.closeContextMenuListener = closeListener;
    // capture: успеваем поймать клик/скролл раньше, чем он дойдёт до чего-то ещё под меню.
    document.addEventListener('click', closeListener, true);
    document.addEventListener('contextmenu', closeListener, true);
    window.addEventListener('scroll', closeListener, true);
    window.addEventListener('keydown', this.onEscapeCloseMenu, true);
  }

  private closeContextMenu(): void {
    if (!this.contextMenuEl) return;
    this.contextMenuEl.remove();
    this.contextMenuEl = null;
    if (this.closeContextMenuListener) {
      document.removeEventListener('click', this.closeContextMenuListener, true);
      document.removeEventListener('contextmenu', this.closeContextMenuListener, true);
      window.removeEventListener('scroll', this.closeContextMenuListener, true);
      this.closeContextMenuListener = null;
    }
    window.removeEventListener('keydown', this.onEscapeCloseMenu, true);
  }

  private async deleteItem(provider: StorageProvider, item: StorageItem, state: ProviderState): Promise<void> {
    if (!provider.delete) return;
    try {
      await provider.delete(item);
      state.items = state.items.filter((i) => i.id !== item.id);
      state.selectedIds.delete(item.id);
      // Кеш этой папки/поиска теперь устарел — иначе удалённый файл
      // снова появится в течение 15 минут при повторном заходе (см. cacheKey()).
      this.listCache.delete(this.activeCacheKey());
      this.renderBody();
    } catch (error) {
      this.props.onError?.(error, provider.id);
    }
  }

  // ------------------------------------------------------------------
  // Данные
  // ------------------------------------------------------------------

  private switchProvider(providerId: string): void {
    if (providerId === this.activeProviderId) return;
    this.activeRequest?.abort();
    this.closeContextMenu();
    // Иначе отложенный поиск с прошлой вкладки (debounce ещё не
    // сработал) мог бы дозаписать searchQuery в state той вкладки уже
    // ПОСЛЕ того, как пользователь с неё ушёл — тихая рассинхронизация.
    if (this.searchDebounceTimer) clearTimeout(this.searchDebounceTimer);
    this.activeProviderId = providerId;
    this.renderShell();
    if (this.activeState.items.length === 0) void this.loadActiveProvider();
    this.ensureTreeRootLoadedIfNeeded();
  }

  private async navigateTo(path: string, breadcrumb: { name: string; path: string }[]): Promise<void> {
    const state = this.activeState;
    // Тот же случай, что в switchProvider() — отложенный поиск не
    // должен внезапно всплыть после того, как пользователь уже перешёл в папку.
    if (this.searchDebounceTimer) clearTimeout(this.searchDebounceTimer);
    state.path = path;
    state.breadcrumb = breadcrumb;
    state.items = [];
    state.cursor = undefined;
    state.hasMore = false;
    // Переход в папку — это выход из режима поиска (у поиска нет
    // естественного "текущего пути" одинакового у всех трёх API).
    state.searchQuery = '';
    await this.loadActiveProvider();
  }

  /** Ключ кеша — своя запись на каждую комбинацию провайдер+путь ИЛИ провайдер+поисковый запрос (фильтр по типу в ключ не входит, он считается на клиенте поверх уже загруженного). */
  private cacheKey(providerId: string, suffix: string): string {
    return `${providerId}::${suffix}`;
  }

  private activeCacheKey(): string {
    const provider = this.activeProvider;
    const state = this.activeState;
    const isSearch = !!state.searchQuery && !!provider.search;
    return this.cacheKey(provider.id, isSearch ? `search:${state.searchQuery}` : `list:${state.path}`);
  }

  /**
   * "Кеш содержимого на 15 минут, с кнопкой обновить сейчас" — при
   * обычном (не `append`, не `force`) заходе на уже виденную
   * папку/поисковый запрос в пределах TTL отдаём то, что уже
   * загружали, без похода в сеть. `force: true` (кнопка "Обновить")
   * всегда идёт в сеть и обновляет запись кеша свежими данными.
   */
  private async loadActiveProvider(opts: { append?: boolean; force?: boolean } = {}): Promise<void> {
    const provider = this.activeProvider;
    const state = this.activeState;

    if (!provider.getAuthState().authenticated) {
      this.renderBody();
      return;
    }

    const isSearch = !!state.searchQuery && !!provider.search;
    const key = this.cacheKey(provider.id, isSearch ? `search:${state.searchQuery}` : `list:${state.path}`);

    if (!opts.append && !opts.force) {
      const cached = this.listCache.get(key);
      if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
        state.items = cached.items;
        state.cursor = cached.cursor;
        state.hasMore = cached.hasMore;
        state.loading = false;
        state.error = null;
        this.renderBody();
        return;
      }
    }

    this.activeRequest?.abort();
    const controller = new AbortController();
    this.activeRequest = controller;

    state.loading = true;
    state.error = null;
    this.renderBody();

    try {
      const listOpts = { cursor: opts.append ? state.cursor : undefined, signal: controller.signal };
      const result = isSearch ? await provider.search!(state.searchQuery, listOpts) : await provider.list(state.path, listOpts);
      if (controller.signal.aborted) return;

      state.items = opts.append ? [...state.items, ...result.items] : result.items;
      state.cursor = result.cursor;
      state.hasMore = result.hasMore;
      state.loading = false;
      this.listCache.set(key, { items: state.items, cursor: state.cursor, hasMore: state.hasMore, cachedAt: Date.now() });
      this.renderBody();
    } catch (error) {
      if (controller.signal.aborted) return;
      state.loading = false;
      state.error = this.describeError(error);
      this.props.onError?.(error, provider.id);
      this.renderBody();
    }
  }

  private async addByUrl(
    provider: StorageProvider,
    url: string,
    form: HTMLFormElement,
    input: HTMLInputElement,
    submit: HTMLButtonElement,
  ): Promise<void> {
    if (!provider.addByUrl) return;
    input.disabled = true;
    submit.disabled = true;
    try {
      const item = await provider.addByUrl(url);
      const asset = await provider.resolve(item);
      this.props.onSelect(asset);
      form.reset();
      // Вкладка могла уже уйти в другого провайдера, пока шёл запрос.
      if (this.activeProviderId === provider.id) await this.loadActiveProvider({ force: true });
      this.props.onDone?.();
    } catch (error) {
      this.props.onError?.(error, provider.id);
    } finally {
      input.disabled = false;
      submit.disabled = false;
    }
  }

  // ------------------------------------------------------------------
  // Загрузка файлов: кнопка "Загрузить" и drag-and-drop (см. ниже)
  // ------------------------------------------------------------------

  /**
   * Общий путь для обоих способов начать загрузку — кнопки "Загрузить"
   * (теперь умеет сразу несколько файлов, `input.multiple`) и
   * drag-and-drop (см. `handleDrop`/`collectDroppedFiles`). Показывает
   * панель очереди с прогрессом на каждый файл, продолжает загрузку
   * остальных файлов, даже если один упал с ошибкой, и обновляет
   * список содержимого папки один раз в конце — а не на каждый файл.
   */
  private async uploadFiles(provider: StorageProvider, folderPath: string, files: File[]): Promise<void> {
    if (!provider.upload || files.length === 0) return;

    const items: UploadQueueItem[] = files.map((file, index) => ({
      id: `${Date.now()}-${index}-${file.name}`,
      name: file.name,
      status: 'pending',
      loaded: 0,
      total: file.size,
    }));
    this.uploadQueueItems = items;
    this.renderUploadQueue();

    for (let i = 0; i < files.length; i++) {
      const item = items[i];
      item.status = 'uploading';
      this.renderUploadQueue();
      try {
        await provider.upload(files[i], folderPath, (progress) => {
          item.loaded = progress.loaded;
          item.total = progress.total;
          this.renderUploadQueue();
        });
        item.status = 'done';
      } catch (error) {
        item.status = 'error';
        item.errorText = this.describeError(error);
        this.props.onError?.(error, provider.id);
      }
      this.renderUploadQueue();
    }

    // Обновляем список, только если пользователь всё ещё смотрит именно
    // эту папку этого провайдера — иначе тихо обновляем кеш вкладки, с
    // которой он уже ушёл (loadActiveProvider() сам смотрит на
    // activeState/activeProvider, так что без этой проверки обновился
    // бы список СОВСЕМ ДРУГОЙ папки/провайдера, куда он успел перейти).
    if (this.activeProviderId === provider.id && this.activeState.path === folderPath) {
      await this.loadActiveProvider({ force: true });
      // В древовидном виде та же папка могла быть открытым узлом —
      // форсируем и его, иначе новый файл появится в дереве только
      // через до 15 минут (TTL кеша) или после сворачивания/раскрытия узла.
      if (this.viewMode === 'tree') await this.ensureTreeNodeLoaded(provider, this.activeState, folderPath, true);
    }
  }

  /** Панель прогресса загрузки — сиблинг body (см. renderShell), обновляется точечно, без полной пересборки body. */
  private renderUploadQueue(): void {
    const el = this.uploadQueueEl;
    if (!el) return;

    if (this.uploadQueueItems.length === 0) {
      el.hidden = true;
      el.innerHTML = '';
      return;
    }
    el.hidden = false;
    el.innerHTML = '';

    const allSettled = this.uploadQueueItems.every((i) => i.status === 'done' || i.status === 'error');

    const header = document.createElement('div');
    header.className = 'gca-upload-queue__header';

    const title = document.createElement('span');
    title.className = 'gca-upload-queue__title';
    const doneCount = this.uploadQueueItems.filter((i) => i.status === 'done' || i.status === 'error').length;
    title.textContent = t(this.editor, 'common.upload.queueTitle', {
      done: doneCount,
      total: this.uploadQueueItems.length,
    });
    header.appendChild(title);

    if (allSettled) {
      const closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.className = 'gca-icon-btn gca-upload-queue__close';
      const label = t(this.editor, 'common.upload.close');
      closeBtn.title = label;
      closeBtn.setAttribute('aria-label', label);
      closeBtn.textContent = '×';
      closeBtn.addEventListener('click', () => {
        this.uploadQueueItems = [];
        this.renderUploadQueue();
      });
      header.appendChild(closeBtn);
    }
    el.appendChild(header);

    const list = document.createElement('div');
    list.className = 'gca-upload-queue__list';
    for (const item of this.uploadQueueItems) {
      const row = document.createElement('div');
      row.className = 'gca-upload-queue__item gca-upload-queue__item--' + item.status;

      const name = document.createElement('span');
      name.className = 'gca-upload-queue__name';
      name.textContent = item.name;
      name.title = item.name;
      row.appendChild(name);

      const status = document.createElement('span');
      status.className = 'gca-upload-queue__status';
      if (item.status === 'uploading') {
        status.textContent =
          item.total > 0 ? `${Math.round((item.loaded / item.total) * 100)}%` : t(this.editor, 'common.upload.uploading');
      } else if (item.status === 'done') {
        status.textContent = t(this.editor, 'common.upload.done');
      } else if (item.status === 'error') {
        status.textContent = item.errorText || t(this.editor, 'common.upload.error');
      } else {
        status.textContent = t(this.editor, 'common.upload.uploading');
      }
      row.appendChild(status);

      const bar = document.createElement('div');
      bar.className = 'gca-upload-queue__bar';
      const fill = document.createElement('div');
      fill.className = 'gca-upload-queue__bar-fill';
      const pct = item.status === 'done' ? 100 : item.total > 0 ? Math.min(100, (item.loaded / item.total) * 100) : 0;
      fill.style.width = `${pct}%`;
      bar.appendChild(fill);
      row.appendChild(bar);

      list.appendChild(row);
    }
    el.appendChild(list);
  }

  // ------------------------------------------------------------------
  // Drag-and-drop зона загрузки
  // ------------------------------------------------------------------

  private renderDropOverlay(): HTMLElement {
    const overlay = document.createElement('div');
    overlay.className = 'gca-drop-overlay';
    overlay.hidden = true;

    const icon = document.createElement('div');
    icon.className = 'gca-drop-overlay__icon';
    icon.innerHTML = CLOUD_UPLOAD_ICON;
    overlay.appendChild(icon);

    const text = document.createElement('div');
    text.className = 'gca-drop-overlay__text';
    text.textContent = t(this.editor, 'common.dropzone.active');
    overlay.appendChild(text);

    return overlay;
  }

  private showDropOverlay(show: boolean): void {
    if (this.dropOverlayEl) this.dropOverlayEl.hidden = !show;
  }

  /** Активна ли зона перетаскивания прямо сейчас — только когда провайдер умеет upload() и уже авторизован (иначе непонятно, куда грузить). */
  private dropEnabled(): boolean {
    const provider = this.activeProvider;
    return !!provider.upload && provider.getAuthState().authenticated;
  }

  private attachDropHandlers(body: HTMLElement): void {
    body.addEventListener('dragenter', (event) => this.handleDragEnter(event));
    body.addEventListener('dragover', (event) => this.handleDragOver(event));
    body.addEventListener('dragleave', (event) => this.handleDragLeave(event));
    body.addEventListener('drop', (event) => void this.handleDrop(event));
  }

  private handleDragEnter(event: DragEvent): void {
    if (!this.dropEnabled() || !event.dataTransfer?.types.includes('Files')) return;
    event.preventDefault();
    // dragenter/dragleave срабатывают при переходе НА КАЖДЫЙ вложенный
    // элемент внутри body — считаем вложенность, чтобы не спрятать
    // оверлей раньше времени, когда курсор просто перешёл с body на
    // дочерний элемент (см. handleDragLeave).
    this.dragDepth++;
    this.showDropOverlay(true);
  }

  private handleDragOver(event: DragEvent): void {
    if (!this.dropEnabled() || !event.dataTransfer?.types.includes('Files')) return;
    // Без preventDefault() браузер не считает элемент допустимой целью
    // и событие 'drop' вообще не произойдёт.
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  }

  private handleDragLeave(event: DragEvent): void {
    if (!this.dropEnabled()) return;
    event.preventDefault();
    this.dragDepth = Math.max(0, this.dragDepth - 1);
    if (this.dragDepth === 0) this.showDropOverlay(false);
  }

  private async handleDrop(event: DragEvent): Promise<void> {
    if (!this.dropEnabled()) return;
    event.preventDefault();
    this.dragDepth = 0;
    this.showDropOverlay(false);

    const dataTransfer = event.dataTransfer;
    if (!dataTransfer) return;
    const files = await this.collectDroppedFiles(dataTransfer);
    if (files.length === 0) return;

    const provider = this.activeProvider;
    void this.uploadFiles(provider, this.activeState.path, files);
  }

  /**
   * Разбирает перетащенное — включая целые ПАПКИ — в плоский список
   * `File`. Папка рекурсивно обходится через `webkitGetAsEntry()` /
   * `FileSystemDirectoryReader` (нестандартный, но поддерживаемый
   * всеми основными браузерами API) и все найденные файлы (из папки и
   * её подпапок) грузятся в ТЕКУЩУЮ открытую папку без попытки
   * воссоздать структуру — ни у одного из провайдеров пока нет API
   * создания папок, так что это единственный осмысленный вариант.
   * Сами подпапки просто молча игнорируются, без ошибки — так и было
   * решено (см. обсуждение задачи).
   */
  private async collectDroppedFiles(dataTransfer: DataTransfer): Promise<File[]> {
    const items = dataTransfer.items;
    if (items && items.length > 0) {
      const entries: FileSystemEntry[] = [];
      let sawEntryApi = false;
      for (let i = 0; i < items.length; i++) {
        const getEntry = items[i]?.webkitGetAsEntry;
        if (typeof getEntry !== 'function') continue;
        sawEntryApi = true;
        const entry = getEntry.call(items[i]);
        if (entry) entries.push(entry);
      }
      if (sawEntryApi) {
        const files: File[] = [];
        for (const entry of entries) {
          await this.walkFileSystemEntry(entry, files);
        }
        return files;
      }
    }
    // Браузер не поддерживает webkitGetAsEntry() — просто берём плоский
    // список файлов без поддержки папок (её и не смогли бы отличить от файла).
    return Array.from(dataTransfer.files ?? []);
  }

  private async walkFileSystemEntry(entry: FileSystemEntry, out: File[]): Promise<void> {
    if (entry.isFile) {
      const file = await new Promise<File>((resolve, reject) => (entry as FileSystemFileEntry).file(resolve, reject));
      out.push(file);
      return;
    }
    if (entry.isDirectory) {
      const reader = (entry as FileSystemDirectoryEntry).createReader();
      // readEntries() в части браузеров отдаёт не больше ~100 записей
      // за раз — читаем, пока не придёт пустой массив, а не полагаемся
      // на единственный вызов (иначе часть файлов из больших папок
      // молча потерялась бы).
      let batch: FileSystemEntry[];
      do {
        batch = await new Promise<FileSystemEntry[]>((resolve, reject) => reader.readEntries(resolve, reject));
        for (const child of batch) {
          await this.walkFileSystemEntry(child, out);
        }
      } while (batch.length > 0);
    }
  }

  // ------------------------------------------------------------------
  // Древовидный вид: ленивое раскрытие папок по клику
  // ------------------------------------------------------------------

  private renderTree(provider: StorageProvider, state: ProviderState): HTMLElement {
    const wrap = document.createElement('div');
    wrap.className = 'gca-tree';

    const toolbar = document.createElement('div');
    toolbar.className = 'gca-tree__toolbar';

    const expandAllBtn = document.createElement('button');
    expandAllBtn.type = 'button';
    expandAllBtn.className = 'gca-btn gca-tree__toolbar-btn';
    expandAllBtn.innerHTML = EXPAND_ALL_ICON + `<span>${escapeHtml(t(this.editor, 'common.tree.expandAll'))}</span>`;
    expandAllBtn.addEventListener('click', () => void this.expandAllTree(provider, state));
    toolbar.appendChild(expandAllBtn);

    const collapseAllBtn = document.createElement('button');
    collapseAllBtn.type = 'button';
    collapseAllBtn.className = 'gca-btn gca-tree__toolbar-btn';
    collapseAllBtn.innerHTML = COLLAPSE_ALL_ICON + `<span>${escapeHtml(t(this.editor, 'common.tree.collapseAll'))}</span>`;
    collapseAllBtn.addEventListener('click', () => this.collapseAllTree(provider, state));
    toolbar.appendChild(collapseAllBtn);

    wrap.appendChild(toolbar);

    const rootNode = state.treeNodes.get('');
    const list = document.createElement('div');
    list.className = 'gca-tree__list';
    list.setAttribute('role', 'tree');

    if (!rootNode || (!rootNode.loaded && rootNode.loading)) {
      const loading = document.createElement('div');
      loading.className = 'gca-loading';
      loading.textContent = t(this.editor, 'common.loading');
      list.appendChild(loading);
    } else if (!rootNode.loaded && rootNode.error) {
      list.appendChild(this.renderTreeNodeError(rootNode.error, 0, () => void this.ensureTreeNodeLoaded(provider, state, '', true)));
    } else if (rootNode.loaded) {
      const sorted = this.sortItems(rootNode.children, { column: 'name', direction: 'asc' });
      if (sorted.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'gca-empty';
        empty.textContent = t(this.editor, 'common.empty');
        list.appendChild(empty);
      } else {
        this.renderTreeLevel(list, provider, state, sorted, 0);
      }
      if (rootNode.hasMore) {
        list.appendChild(this.renderTreeLoadMore(provider, state, '', 0, rootNode.loading));
      }
    }

    wrap.appendChild(list);
    return wrap;
  }

  private renderTreeLevel(
    container: HTMLElement,
    provider: StorageProvider,
    state: ProviderState,
    siblings: StorageItem[],
    depth: number,
  ): void {
    for (const item of siblings) {
      container.appendChild(this.renderTreeNode(provider, state, item, siblings, depth));
    }
  }

  private renderTreeNode(
    provider: StorageProvider,
    state: ProviderState,
    item: StorageItem,
    siblings: StorageItem[],
    depth: number,
  ): HTMLElement {
    const wrap = document.createElement('div');
    wrap.className = 'gca-tree-node';

    const isFolder = item.kind === 'folder';
    const isExpanded = isFolder && state.expandedPaths.has(item.path);

    const row = document.createElement('div');
    row.className = 'gca-tree-node__row' + (state.selectedIds.has(item.id) ? ' gca-tree-node__row--selected' : '');
    row.style.setProperty('--gca-tree-depth', String(depth));
    row.addEventListener('contextmenu', (event) => this.handleContextMenu(event, provider, item, state));
    this.attachLongPress(row, (x, y) => this.openContextMenuAt(x, y, provider, item, state));

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'gca-tree-node__toggle' + (isExpanded ? ' gca-tree-node__toggle--expanded' : '');
    if (isFolder) {
      const label = t(this.editor, isExpanded ? 'common.tree.collapseFolder' : 'common.tree.expandFolder');
      toggle.setAttribute('aria-label', label);
      toggle.setAttribute('aria-expanded', String(isExpanded));
      toggle.innerHTML = CHEVRON_RIGHT_ICON;
      toggle.addEventListener('click', (event) => {
        event.stopPropagation();
        void this.toggleTreeNode(provider, state, item.path);
      });
    } else {
      toggle.className += ' gca-tree-node__toggle--spacer';
      toggle.disabled = true;
      toggle.tabIndex = -1;
    }
    row.appendChild(toggle);

    const icon = document.createElement('span');
    icon.className = 'gca-tree-node__icon';
    icon.innerHTML = isFolder ? FOLDER_ICON : typeIcon(guessAssetType(item.mimeType, item.name));
    row.appendChild(icon);

    const name = document.createElement('button');
    name.type = 'button';
    name.className = 'gca-tree-node__name';
    name.textContent = item.name;
    name.title = item.name;
    name.addEventListener('click', (event) => {
      if (isFolder) {
        void this.toggleTreeNode(provider, state, item.path);
      } else {
        // handleItemClick() ветвится по item.kind — сюда попадают только
        // файлы, так что переход "как в папку" в ней не сработает.
        this.handleItemClick(event, item, state, siblings);
      }
    });
    if (!isFolder) name.addEventListener('dblclick', () => this.handleItemDblClick(provider, item, name));
    row.appendChild(name);

    wrap.appendChild(row);

    if (isFolder && isExpanded) {
      wrap.appendChild(this.renderTreeChildren(provider, state, item.path, depth + 1));
    }

    return wrap;
  }

  private renderTreeChildren(provider: StorageProvider, state: ProviderState, path: string, depth: number): HTMLElement {
    const childWrap = document.createElement('div');
    childWrap.className = 'gca-tree-node__children';

    // Реальный fetch узла всегда запускается ЯВНО и ВНЕ рендера —
    // из toggleTreeNode()/expandAllFrom() — а не отсюда: ensureTreeNodeLoaded()
    // сам синхронно вызывает renderBody() перед своим первым await,
    // и дёрнуть его прямо во время текущего рендера означало бы
    // вложенный renderBody() поверх ещё не достроенного body (см.
    // комментарий у toggleTreeNode). Раз мы здесь и узла ещё нет —
    // значит вызывающий уже позаботился о фактической загрузке, а нам
    // остаётся только показать "Загрузка…" до следующего renderBody().
    const node = state.treeNodes.get(path);
    if (!node || !node.loaded) {
      if (node?.error) {
        childWrap.appendChild(
          this.renderTreeNodeError(node.error, depth, () => void this.ensureTreeNodeLoaded(provider, state, path, true)),
        );
        return childWrap;
      }
      const loading = document.createElement('div');
      loading.className = 'gca-tree-node__loading';
      loading.style.setProperty('--gca-tree-depth', String(depth));
      loading.textContent = t(this.editor, 'common.loading');
      childWrap.appendChild(loading);
      return childWrap;
    }

    const sorted = this.sortItems(node.children, { column: 'name', direction: 'asc' });
    if (sorted.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'gca-tree-node__empty';
      empty.style.setProperty('--gca-tree-depth', String(depth));
      empty.textContent = t(this.editor, 'common.empty');
      childWrap.appendChild(empty);
    } else {
      this.renderTreeLevel(childWrap, provider, state, sorted, depth);
    }

    if (node.hasMore) {
      childWrap.appendChild(this.renderTreeLoadMore(provider, state, path, depth, node.loading));
    }

    return childWrap;
  }

  private renderTreeNodeError(errorText: string, depth: number, onRetry: () => void): HTMLElement {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'gca-tree-node__error';
    btn.style.setProperty('--gca-tree-depth', String(depth));
    btn.textContent = errorText;
    btn.title = t(this.editor, 'common.refresh');
    btn.addEventListener('click', onRetry);
    return btn;
  }

  private renderTreeLoadMore(
    provider: StorageProvider,
    state: ProviderState,
    path: string,
    depth: number,
    loading: boolean,
  ): HTMLElement {
    const more = document.createElement('button');
    more.type = 'button';
    more.className = 'gca-tree-node__more' + (loading ? ' gca-tree-node__more--loading' : '');
    more.style.setProperty('--gca-tree-depth', String(depth));
    more.disabled = loading;
    more.textContent = t(this.editor, loading ? 'common.loading' : 'common.loadMore');
    more.addEventListener('click', () => void this.loadMoreTreeNode(provider, state, path));
    return more;
  }

  private async toggleTreeNode(provider: StorageProvider, state: ProviderState, path: string): Promise<void> {
    if (state.expandedPaths.has(path)) {
      state.expandedPaths.delete(path);
    } else {
      state.expandedPaths.add(path);
    }
    this.persistExpandedPaths(provider.id, state.expandedPaths);
    this.renderBody();
    if (state.expandedPaths.has(path)) {
      await this.ensureTreeNodeLoaded(provider, state, path);
      // Если у этого узла тоже есть дети, отмеченные раскрытыми с
      // прошлого раза (persisted), продолжаем каскад вниз — иначе
      // раскрытие узла А не показало бы уже раскрытый когда-то Б
      // внутри него, только пустой список с ещё одним неразвёрнутым Б.
      await this.restoreExpandedTreeNodes(provider, state, path);
    }
  }

  private collapseAllTree(provider: StorageProvider, state: ProviderState): void {
    state.expandedPaths.clear();
    this.persistExpandedPaths(provider.id, state.expandedPaths);
    this.renderBody();
  }

  /** "Развернуть всё" — рекурсивно раскрывает и подгружает КАЖДУЮ папку от корня вниз, со всеми страницами (см. обсуждение задачи). */
  private async expandAllTree(provider: StorageProvider, state: ProviderState): Promise<void> {
    await this.expandAllFrom(provider, state, '');
    this.persistExpandedPaths(provider.id, state.expandedPaths);
  }

  private async expandAllFrom(provider: StorageProvider, state: ProviderState, path: string): Promise<void> {
    await this.ensureTreeNodeLoaded(provider, state, path);
    let node = state.treeNodes.get(path);
    while (node?.hasMore) {
      await this.loadMoreTreeNode(provider, state, path);
      node = state.treeNodes.get(path);
    }
    if (!node || node.error) return;

    const folders = node.children.filter((i) => i.kind === 'folder');
    for (const folder of folders) state.expandedPaths.add(folder.path);
    this.renderBody();

    // Последовательно, не параллельно — у каждого провайдера свои
    // (незнакомые нам) ограничения скорости запросов, а "Развернуть
    // всё" на большом дереве и так может означать десятки запросов.
    for (const folder of folders) {
      await this.expandAllFrom(provider, state, folder.path);
    }
  }

  /**
   * Подгружает первую страницу содержимого узла (папки) дерева, если
   * ещё не загружена/не грузится — используя тот же 15-минутный кеш
   * `listCache`, что и обычный просмотр (та же папка, только что
   * открытая через грид/таблицу, не запросится у API повторно).
   */
  private async ensureTreeNodeLoaded(
    provider: StorageProvider,
    state: ProviderState,
    path: string,
    force = false,
  ): Promise<void> {
    const existing = state.treeNodes.get(path);
    if (!force && existing && (existing.loaded || existing.loading)) return;

    const node: TreeNodeState = existing ?? { loading: true, loaded: false, error: null, children: [], hasMore: false };
    node.loading = true;
    node.error = null;
    state.treeNodes.set(path, node);
    this.renderBody();

    try {
      const key = this.cacheKey(provider.id, `list:${path}`);
      const cached = !force ? this.listCache.get(key) : undefined;
      let result: ListResult;
      if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
        result = { items: cached.items, cursor: cached.cursor, hasMore: cached.hasMore };
      } else {
        result = await provider.list(path);
        this.listCache.set(key, { items: result.items, cursor: result.cursor, hasMore: result.hasMore, cachedAt: Date.now() });
      }
      node.children = result.items;
      node.cursor = result.cursor;
      node.hasMore = result.hasMore;
      node.loaded = true;
      node.loading = false;
      this.renderBody();
    } catch (error) {
      node.loading = false;
      node.error = this.describeError(error);
      this.props.onError?.(error, provider.id);
      this.renderBody();
    }
  }

  private async loadMoreTreeNode(provider: StorageProvider, state: ProviderState, path: string): Promise<void> {
    const node = state.treeNodes.get(path);
    if (!node || node.loading || !node.hasMore) return;
    node.loading = true;
    this.renderBody();
    try {
      const result = await provider.list(path, { cursor: node.cursor });
      node.children = [...node.children, ...result.items];
      node.cursor = result.cursor;
      node.hasMore = result.hasMore;
      node.loading = false;
      this.listCache.set(this.cacheKey(provider.id, `list:${path}`), {
        items: node.children,
        cursor: node.cursor,
        hasMore: node.hasMore,
        cachedAt: Date.now(),
      });
      this.renderBody();
    } catch (error) {
      node.loading = false;
      this.props.onError?.(error, provider.id);
      this.renderBody();
    }
  }
}
