/**
 * Глобальный setup для vitest (jsdom) — полифиллы для того немногого,
 * что сам jsdom не реализует, но чем реально пользуется код плагина.
 */

// jsdom's Blob/File до сих пор не реализует `arrayBuffer()` (используется
// в `GoogleDriveProvider.upload()` для сборки multipart-тела запроса) —
// собираем его через FileReader, который jsdom, в отличие от этого, умеет.
if (typeof Blob !== 'undefined' && !Blob.prototype.arrayBuffer) {
  Blob.prototype.arrayBuffer = function (this: Blob): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(reader.error ?? new Error('FileReader failed'));
      reader.readAsArrayBuffer(this);
    });
  };
}
