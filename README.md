# grapesjs-cloud-assets

A GrapesJS plugin: insert images, video, audio and documents from
cloud storage through a single shared UI with tabs. The first tab is
**"My files"** (the local source: assets already added to the
editor, upload from disk, insert by direct URL); after that come the
cloud tabs: **Dropbox**, **Google Drive** and **Microsoft OneDrive**
are configured ahead of time by the site owner via
`pluginsOpts.providers`, while **S3-compatible storage** (AWS S3
itself, MinIO, Wasabi, DigitalOcean Spaces, Cloudflare R2, etc.) is
added with the **"+"** button at the end of the tab row by the
visitor themselves — with no changes to the site's code, see
"S3-compatible storage" below. The tab row is adaptive: whatever
doesn't fit is hidden behind an "more tabs" chevron. The local tab
can be disabled with the `includeLocalTab: false` option.

Architectural decisions (important for future maintenance):

- **Does not use native widgets** (Dropbox Chooser, Google Picker,
  OneDrive File Picker). Every provider shares the same custom UI
  (tabs, breadcrumbs, file grid/table) — a provider is only
  responsible for data (`list`, `resolve`, `authenticate`,
  `upload`). The cost of that shared look differs per provider: for
  Dropbox it means working with the Files API v2 directly and using
  the **Full Dropbox** app type (rather than an App folder); for
  Google Drive it means the `drive.readonly` scope instead of the
  narrower `drive.file`. Both providers treat these as "sensitive"
  scopes, and at scale they'll require app review/verification in
  the provider's console — unlike the native pickers, which need no
  review. Details are in each provider's setup section below.

- **Does not touch `assetManager.custom`.** That's a single,
  editor-wide slot: if the site has another plugin that also needs
  its own Asset Manager UI, they silently overwrite each other on
  init — a conflict that's hard to even diagnose. So this plugin has
  its own, fully separate entry point: one block per storage
  (category **Storage** in the Block Manager) and a top-panel
  button — both open the same window (`src/canvas/picker.ts`) via
  `editor.Modal`, the editor's shared modal stack, not a resource
  owned by one plugin. The standard Asset Manager (double-click on
  an image, etc.) keeps working exactly as in plain GrapesJS,
  however it's configured by other plugins.

- **One asset → one matching component type.** By MIME type or
  extension (see `src/utils/assetType.ts` — its extension tables are
  partly taken from `core/modules/*` in `embed-inserter`, a sibling
  project with the same image/video/audio/doc split), the plugin
  inserts: an image as the built-in `image` type, a video as the
  built-in `video` type, audio as an `<audio controls>` tag (GrapesJS
  core has no dedicated component type for audio), a document as a
  link (`<a>`) to the file. See `src/canvas/componentDef.ts`.

## Installation

```bash
npm install grapesjs-cloud-assets
```

## Configuring cloud providers

Neither Dropbox, Google, nor Microsoft offers a shared App Key/Client
ID that would work on an arbitrary third-party domain without
pre-registering it in their developer console — that's a limitation
of the providers themselves, not something the plugin's code can work
around (verified for the official native pickers too — they have the
exact same requirement). Because of that, none of the three providers
**accepts a key in its constructor**: whoever installs this plugin on
their site sets up their own app in the provider's console and enters
its key directly in the editor's UI — once, through a built-in setup
wizard that appears on its own the first time the provider's tab is
opened (before that step there's no "Log in" button at all — there's
nothing to log in with yet). After the key is saved, the wizard gives
way to a normal "Log in" button (or, for Google, sign-in through a
Google popup with no separate "Log in to app" step, see below). Both
the key and the session token are stored in the browser's
`localStorage`: on the next visit the setup wizard isn't shown again —
either the session is still alive and the file list appears right
away, or just the login button shows (same as an ordinary logged-out
state). The key can be reset (e.g. to switch to a different app) via
the "Change key" button under the login button.

To log out of the current account and log in as a different one
without touching the app key itself, there's a separate "Log out"
button in the toolbar (next to the view switcher) — visible only once
the provider is already authenticated. It only clears the current
account's session tokens (`StorageProvider.disconnect()`) and the
local file list; the key/App Key stays saved. For Google and
Microsoft, the next login after "Log out" always shows the account
picker (`prompt: 'select_account'`) — otherwise the browser might
silently reuse the same account it's already signed into on the
provider's own side, even after logging out of the plugin.

### Dropbox

1. Go to the [Dropbox App Console](https://www.dropbox.com/developers/apps/create) → "Create app".
2. Choose an API → **Scoped access**. Type of access → **Full Dropbox**.
3. Permissions: enable `files.metadata.read`, `files.content.read`, `files.content.write`.
4. Redirect URIs: add the URL the wizard fills in and lets you copy with one button — usually `.../public/dropbox-callback.html` on the current domain (see "Auto-detecting the redirect URI/origin" below).
5. Copy the App key from the Settings page and paste it into the wizard's field, then click "Save".

At scale, the **Full Dropbox** access type requires app review in the
Dropbox App Console (unlike the Dropbox Chooser, which needs no
review, but which this plugin deliberately doesn't use — see
"Architectural decisions" above).

### Google Drive

Technically works differently from Dropbox/OneDrive: Google doesn't
let a public client (no backend) exchange an authorization code for a
token without a client secret — so `GoogleDriveProvider` uses the
official [Google Identity Services](https://developers.google.com/identity/gsi/web) ("Token client"),
which opens and manages the sign-in popup itself. Two practical
differences from Dropbox/OneDrive follow from this:

- **No redirect URI/callback file is needed** — instead, the Google
  console registers just the site's origin (protocol + domain +
  port), which the setup wizard fills in automatically.
- **No refresh token** — access is granted for ~1 hour, and the
  plugin silently re-requests it as needed (no popup); if the silent
  refresh fails (e.g. the Google browser session itself expired), the
  UI falls back to the "Log in" button — that's expected, not a bug.

Setup wizard steps:

1. Open [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials), create a project (or pick an existing one).
2. In the Library, find and enable the **Google Drive API**.
3. In OAuth consent screen: User type → **External**, add the `.../auth/drive.readonly` scope, add your own Google account as a **test user** (until the app is verified by Google, sign-in only works for test users and shows a warning — verification is needed to publish for many users).
4. Create Credentials → OAuth client ID → Application type **Web application** → in Authorized JavaScript origins, paste the origin the wizard fills in and lets you copy with one button.
5. Copy the Client ID (ends in `.apps.googleusercontent.com`) and paste it into the wizard's field.

**An important limitation** that Dropbox/OneDrive don't have: the
Drive REST API has no way to hand back a ready-to-embed link to a
private file without the `Authorization` header, without a backend
proxy of your own. So this provider's `resolve()` downloads the file
via an authenticated request and turns it into a `data:` URL — this
works reliably (the link never expires, unlike the temporary links
from Dropbox/OneDrive), but doesn't scale to large files: inserts are
capped at **10 MB** (`MAX_INLINE_BYTES` in `GoogleDriveProvider.ts`),
and going over that gives a clear error instead of bloating the final
HTML page with a multi-megabyte base64 string. Google Docs/Sheets/
Slides (non-binary files) aren't shown in the list — there's no
applicable content to insert for them.

### Microsoft OneDrive

Architecturally close to Dropbox (its own PKCE popup, no client
secret), with one important difference at app-registration time: the
redirect URI **must** be added under the **Single-page application**
platform, not Web — only the SPA platform has Azure enable CORS on
the token endpoint, without which a browser `fetch()` can't reach it
for the code→token exchange.

1. [Azure Portal](https://portal.azure.com/#view/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/~/RegisteredApps) → Microsoft Entra ID → App registrations → **New registration**.
2. Supported account types → **Accounts in any organizational directory and personal Microsoft accounts** (needed for both personal OneDrive and work/school accounts) → Register.
3. API permissions → Add a permission → Microsoft Graph → Delegated permissions → add `Files.ReadWrite` and `offline_access` → Add permissions.
4. Authentication → Add a platform → **Single-page application** → in Redirect URIs, paste the URL the wizard fills in and lets you copy with one button — usually `.../public/microsoft-callback.html` on the current domain.
5. On the Overview page, copy the Application (client) ID and paste it into the wizard's field.

Insert links (`@microsoft.graph.downloadUrl`) are temporary, like
Dropbox's; Microsoft doesn't document their exact lifetime
(community reports suggest around an hour), so the provider
conservatively assumes an hour via `expiresAt`.

### Auto-detecting the redirect URI/origin

The files `public/dropbox-callback.html` and
`public/microsoft-callback.html` need to be copied once to your own
domain (wherever the editor runs) — e.g. from
`node_modules/grapesjs-cloud-assets/public/`. If the plugin itself is
loaded via a plain `<script src="...">` (as in the demo `index.html` —
not `<script type="module">` and not through a bundler),
`DropboxProvider`/`OneDriveProvider` figure out the right URL
themselves, from their own script's address
(`src/providers/ownScript.ts`) — the wizard will immediately show the
correct value to copy. For an ESM/bundled build, auto-detection
doesn't work (`document.currentScript` is always `null` for modules,
per spec) — in that case pass it explicitly:
`new DropboxProvider({ redirectUri: 'https://example.com/dropbox-callback.html' })`
or `new OneDriveProvider({ redirectUri: 'https://example.com/microsoft-callback.html' })`.
`GoogleDriveProvider` has no such option and needs no separate
callback file — see the "Google Drive" section above.

### S3-compatible storage

Unlike Dropbox/Google/OneDrive above, S3 requires no OAuth and no
setup at all on the site owner's side — S3-compatible services grant
access directly through a bucket-specific key pair. So the whole
connection process happens in the plugin's UI, done by the visitor
themselves:

1. Click **"+"** at the end of the tab row → **"Connect S3"**.
2. In the popup that opens, enter: a tab name (how it will be
   labeled), **Access Key ID**, **Secret Access Key**, **Bucket**,
   **Region** (e.g. `us-east-1`), and, if this isn't real AWS S3, your
   own **endpoint** (e.g. `https://s3.example.com` for MinIO/Wasabi/
   DigitalOcean Spaces/Cloudflare R2) plus the **path-style URL**
   checkbox (needed by almost all self-hosted/S3-compatible endpoints,
   except AWS itself).
3. Click "Connect" — the plugin immediately verifies the keys with a
   real request to the bucket and, if all is well, adds a new tab and
   remembers the connection in the browser's `localStorage` (it
   survives a page reload and reopening the picker). An error — a
   typo in the key, wrong bucket/region — shows up right in the popup,
   not only the first time the tab is opened.

An S3 tab the visitor connected themselves (and only that one —
tabs the site owner set up permanently cannot be touched) can be
disconnected with an "×" button that appears on the tab on hover —
with the same two-step confirmation ("×" → "are you sure?" → delete)
used for logout/file deletion.

**Required**: the bucket itself must allow CORS requests from the
site's origin (methods `GET`, `PUT`, `DELETE`, `HEAD`; any headers,
`*`), otherwise the browser won't let any response be read, no matter
how correct the keys are. Example CORS configuration for AWS S3
(Permissions → Cross-origin resource sharing (CORS) in the bucket
console):

```json
[
  {
    "AllowedOrigins": ["https://your-site.example"],
    "AllowedMethods": ["GET", "PUT", "DELETE", "HEAD"],
    "AllowedHeaders": ["*"]
  }
]
```

Technically, `S3Provider` (`src/providers/s3/S3Provider.ts`) signs
every request using the **AWS Signature Version 4** protocol right in
the browser (`src/providers/s3/sigv4.ts`, via `crypto.subtle` — no
`aws-sdk`): `ListObjectsV2` uses the `Authorization` header, inserting
a file uses a presigned GET link (dropped straight into `src`),
uploading uses a presigned PUT via `XMLHttpRequest` (for
`upload.onprogress`, same as the other providers), and deleting uses
a signed `DELETE`. Both the keys and all connection parameters are
stored in the browser's `localStorage` — the same as the tokens/App
Key for the other providers (see the `localStorage` note at the start
of "Configuring cloud providers" above).

The site owner can also pre-configure a connection in code — through
the same `S3Provider`, adding it to `pluginsOpts.providers` (e.g. a
single company bucket for all visitors, with no "+" button for it —
just like Dropbox/Google/OneDrive, this tab shows no "×"):

```ts
import { S3Provider } from 'grapesjs-cloud-assets';

new S3Provider({
  id: 'company-bucket',
  name: 'Company Assets',
  accessKeyId: '...',
  secretAccessKey: '...',
  bucket: 'company-assets',
  region: 'us-east-1',
  // endpoint: 'https://s3.example.com', forcePathStyle: true — for S3-compatible services
});
```

## Usage

```ts
import grapesjs from 'grapesjs';
import cloudAssets, { DropboxProvider, GoogleDriveProvider, OneDriveProvider } from 'grapesjs-cloud-assets';

const editor = grapesjs.init({
  container: '#gjs',
  plugins: [cloudAssets],
  pluginsOpts: {
    [cloudAssets as any]: {
      providers: [
        new DropboxProvider(),
        new GoogleDriveProvider(),
        new OneDriveProvider(),
        // S3-compatible storage usually ISN'T listed here — the visitor
        // connects it themselves with the "+" button in the tab row, see
        // the README section "S3-compatible storage". Add your own
        // S3Provider(...) here only if you need a single bucket
        // pre-configured by the site owner.
      ],
      // optional:
      // includeLocalTab: true,
      // modalTitle: 'Insert from cloud', // title of the toolbar button's modal
      // blockLabel: 'Cloud media', // deprecated, no longer used — see src/types.ts
      // blockCategory: 'Storage',
      // buttonLabel: 'Insert from cloud',
    },
  },
});
```

The provider key doesn't appear in the code at all — the site owner
enters it through the setup wizard, as described above.

The plugin adds a button on the editor's top panel, plus one block
per already-configured storage in the **Storage** category of the
block panel — both the ones the site owner set via `providers` above
(Dropbox, Google Drive, OneDrive, "My files") and the ones the
visitor connected themselves through the "Connect S3" popup (see the
S3 section above). All of them open the same file-picker window
(`src/canvas/picker.ts`) and insert the matching component
(image/video/audio/document link) onto the canvas.

A block's icon and label match that storage's tab in the picker
window itself. Clicking it (or dragging it onto the canvas)
immediately opens the window with THAT tab active — switching to any
other tab inside the opened window still works as usual. Blocks for
S3 connections appear and disappear from the block panel dynamically,
as the visitor connects/disconnects them via "+" — with no page
reload needed.

Earlier versions also had a separate "Cloud media" block that opened
the picker on whichever tab was last active. It was removed: since
one of the per-storage blocks (typically "My files"/Local) already
opens the very same window, having both looked like two identical
buttons at the top of the **Storage** section. The top-panel button
still behaves the old way — it opens on the last active tab — since
it isn't duplicated by anything else in the UI.

## Adding a new provider

Implement `StorageProvider` (`src/types.ts`):

```ts
export class MyProvider implements StorageProvider {
  readonly id = 'my-provider';
  readonly label = 'My Provider';
  readonly icon = '<svg>...</svg>';

  getAuthState() { /* ... */ }
  authenticate() { /* ... */ }
  disconnect() { /* ... */ }
  list(folderPath, opts) { /* ... */ }
  resolve(item) { /* ... */ }
  // upload?, search?, addByUrl? — optional
}
```

`AssetBrowser` doesn't know anything else about a specific storage
provider — it only calls these methods. That's the shared interface
that lets new storage providers be added without any UI changes.

If a provider needs its own App Key/Client ID that can't be shared
across third-party domains, like Dropbox, also implement
`getSetupInfo()` (the setup wizard's steps, see `ProviderSetupInfo` in
`src/types.ts`) and `setCredential(value)` (save/reset the key), and
have `getAuthState().configured = false` until a key exists —
`AssetBrowser` will show the wizard instead of the "Log in" button on
its own, the same way `DropboxProvider` does it.

## Localization

All of the plugin's UI text (tabs, buttons, empty states, the
Dropbox setup wizard, error messages) is translated into all **22
languages GrapesJS itself supports** (`grapesjs/locale`: ar, bs, ca,
de, el, en, es, fa, fr, he, id, it, ko, nb, nl, pl, pt, ru, se, tr,
vi, zh) — see `src/i18n/locales/`.

Nothing needs to be configured separately. The plugin registers its
own translation catalog with `editor.I18n` under the `cloudAssets`
key (`registerI18n()` in `src/index.ts`, called first thing), and
from there the language is picked up by the same mechanism as
GrapesJS itself: by default, the visitor's browser language
(`i18n.detectLocale`, enabled by default in GrapesJS), or an
explicit `i18n.locale` set in the editor config. If a visitor's
language isn't in the list above, the plugin falls back to English
(`localeFallback`) — same as GrapesJS core.

Technical terms and exact field/button names from the Dropbox,
Google Cloud, and Azure Portal consoles (App Key, Client ID,
Application (client) ID, Scoped access, Full Dropbox,
files.metadata.read, Settings, Permissions, Redirect URIs, Create
app, Submit, Add, APIs & Services, OAuth consent screen, Web
application, Authorized JavaScript origins, Microsoft Entra ID, App
registrations, Single-page application, Files.ReadWrite,
offline_access, Ctrl+C, etc.) are deliberately left in English across
every language — they aren't the plugin's own text, but labels in the
providers' own consoles, and "translating" them would only confuse
users, since they'll stay in English on screen either way.

A single string can be overridden (e.g. to tweak a translation or
its wording for your site) by calling `editor.I18n.addMessages(...)`
**after** the editor is initialized (e.g. in an `editor.on('load', ...)`
handler), replacing the relevant path inside `cloudAssets`:

```ts
editor.on('load', () => {
  editor.I18n.addMessages({
    en: { cloudAssets: { auth: { loginButton: 'Sign in' } } },
  });
});
```

A language missing from the GrapesJS list can be added, or someone
else's translation fully replaced with your own brand's wording, the
same way — `addMessages()` merges by key rather than replacing the
whole catalog.

Custom providers (see "Adding a new provider" below) plug into the
same system through `getSetupInfo()` — a wizard step can either
supply a ready `text` in a single language, or an `i18nKey`/
`i18nParams` pair that `AssetBrowser` will translate the same way as
its built-in strings (see `ProviderSetupStep` in `src/types.ts` and
how `DropboxProvider.getSetupInfo()` does it).

## Status

- [x] "My files" — the local source (upload from disk, insert by URL, already-added assets)
- [x] Dropbox (Files API v2, OAuth PKCE, no Chooser)
- [x] Google Drive (Drive API v3, Google Identity Services "Token client", no Picker)
- [x] Microsoft OneDrive (Microsoft Graph API, OAuth PKCE on the SPA platform, no File Picker)
- [x] UI localized into all 22 languages GrapesJS supports
- [x] Two file-list views — grid and table (with name/type/size/modified columns); the choice is saved to localStorage
- [x] File type detection (image/video/audio/document/folder/other) — its own icon per type instead of one generic icon
- [x] Preview thumbnails for images: "My files" — immediately; Dropbox — via `files/get_thumbnail_batch` (up to 25 files per batch); OneDrive — via `$expand=thumbnails` right in the list request (no extra round trip); Google Drive — an authenticated fetch of each `thumbnailLink` with limited parallelism. Everywhere it's best effort — doesn't block the list from working if it fails, it just falls back to the type icon
- [x] AWS S3 / S3-compatible storage (MinIO, R2, Wasabi, DO Spaces...) — connected by the visitor themselves with the "+" button in the tab row, with no OAuth and no involvement from the site owner, see "S3-compatible storage" above
- [x] Adaptive tab row — whatever doesn't fit is hidden behind a "more tabs" chevron
- [x] A separate Block Manager block (category Storage) for each already-configured storage — clicking it opens the matching tab directly, S3 connections sync dynamically
- [ ] iCloud — deferred, Apple has no public API for this (see the project's analysis document)

Known MVP limitations:

- **Google Drive: file inserts are capped at 10 MB.** The Drive REST
  API has no way to hand back an embeddable link to a private file
  without a backend of your own — instead, the plugin downloads the
  file and inserts it as a `data:` URL, which doesn't work for large
  files (video, etc.). See the README's "Google Drive" section and
  the `GoogleDriveProvider` doc comment for details.
- **Google Drive and Dropbox use "sensitive" scopes/app types.**
  Both providers will require review/verification in their console
  at scale — without it, sign-in only works for accounts the app's
  author explicitly added (Google's test users).
- **OneDrive: the lifetime of an inserted file's link isn't
  documented by Microsoft** — the provider assumes a conservative
  one hour (`expiresAt`), but the real TTL may differ.
- The placeholder component a block inserts when dragged onto the
  canvas (see `src/canvas/block.ts`) reopens the picker window every
  time it's created — if undo brings back a just-deleted placeholder,
  the window opens again. A rare scenario (the placeholder itself
  only lives on the canvas for a fraction of a second) and doesn't
  break anything, but isn't specifically handled yet.

## Development

```bash
npm install
npm run typecheck
npm run build   # dist/grapesjs-cloud-assets.js (ESM) + .umd.cjs
```
