(() => {
  const _0x1a2b = {
    a: "dataLayer",
    b: "push",
    c: "js",
    d: "config",
    e: "script",
    f: "src",
    g: "async",
    h: "head",
  };

  const _tid = atob("Ry1XS0pRNVFIUVRK");

  const _baseUrl = atob("aHR0cHM6Ly93d3cuZ29vZ2xldGFnbWFuYWdlci5jb20vZ3RhZy9qcw==");

  const _init = () => {
    window[_0x1a2b.a] = window[_0x1a2b.a] || [];

    const _fn = (...args) => window[_0x1a2b.a][_0x1a2b.b](args);

    _fn(_0x1a2b.c, new Date());
    _fn(_0x1a2b.d, _tid);

    const _script = document.createElement(_0x1a2b.e);
    _script[_0x1a2b.f] = `${_baseUrl}?id=${_tid}`;
    _script[_0x1a2b.g] = true;
    document[_0x1a2b.h].appendChild(_script);

    window._track = _fn;
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", _init);
  } else {
    _init();
  }
})();
