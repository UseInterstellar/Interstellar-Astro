importScripts("/assets/bundled/v.ble.js");
importScripts("/assets/bundled/v.cfg.js");
importScripts("/assets/bundled/v.sw.js");

const uv = new UVServiceWorker();

self.addEventListener("fetch", (event) => {
  event.respondWith(
    (async () => {
      if (uv.route(event)) {
        return await uv.fetch(event);
      }
      return await fetch(event.request);
    })(),
  );
});
