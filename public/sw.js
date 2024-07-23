importScripts("/assets/bundled/v.bndl.js");
importScripts("/assets/bundled/v.cnfg.js");
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
