// analytics.js - Heavily obfuscated analytics module
(function() {
  'use strict';
  
  // Obfuscated constants
  const _0x1a2b = {
    a: 'dataLayer',
    b: 'push', 
    c: 'js',
    d: 'config',
    e: 'script',
    f: 'src',
    g: 'async',
    h: 'head'
  };
  
  // ROT13 + Base64 encoded tracking ID: "G-WKJQ5QHQTJ"
  const _tid = atob('Ry1XS0pRNVFIUVRK');
  
  // Obfuscated Google Analytics URL
  const _urls = [
    atob('aHR0cHM6Ly93d3cu'),  // https://www.
    atob('Z29vZ2xldGFnbWFuYWdlci5jb20='), // googletagmanager.com
    atob('L2d0YWcvanM=') // /gtag/js
  ];
  
  // Initialize tracking
  const _init = () => {
    // Create dataLayer if it doesn't exist
    window[_0x1a2b.a] = window[_0x1a2b.a] || [];
    
    // Obfuscated gtag function
    const _fn = (...args) => window[_0x1a2b.a][_0x1a2b.b](args);
    
    // Set up tracking
    _fn(_0x1a2b.c, new Date());
    _fn(_0x1a2b.d, _tid);
    
    // Dynamically load the script
    const _script = document.createElement(_0x1a2b.e);
    _script[_0x1a2b.f] = _urls.join('') + '?id=' + _tid;
    _script[_0x1a2b.g] = true;
    document[_0x1a2b.h].appendChild(_script);
    
    // Make gtag globally available but with obfuscated name
    window._track = _fn;
  };
  
  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _init);
  } else {
    _init();
  }
  
  // Anti-debugging measures
  const _protect = () => {
    // Basic console detection
    let devtools = {open: false, orientation: null};
    const threshold = 160;
    setInterval(() => {
      if (window.outerHeight - window.innerHeight > threshold || 
          window.outerWidth - window.innerWidth > threshold) {
        if (!devtools.open) {
          devtools.open = true;
          // Optionally disable tracking when devtools detected
          // window._track = () => {};
        }
      } else {
        devtools.open = false;
      }
    }, 500);
  };
  
  _protect();
})();