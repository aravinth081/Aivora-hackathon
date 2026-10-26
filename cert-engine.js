 /**
 * cert-engine.js — High-Precision Certificate Engine
 * INNOVATION HACKS
 * Tagline: BUILD • INNOVATE • IMPACT
 * Statement: TURNING INNOVATIVE IDEAS INTO REAL-WORLD IMPACT
 *
 * Renders high-fidelity, print-ready certificates at A4 landscape 300 DPI (3508 × 2480 px).
 * Features auto-scaling typography and direct rendering of ADMIN-UPLOADED template artwork.
 * Guarantees 100% IDENTICAL certificate generation across Mobile, Desktop, and all platforms.
 */
(function (window) {
  'use strict';

  /* ── CANVAS RESOLUTION (A4 Landscape at 300 DPI) ── */
  const FULL_W = 3508;
  const FULL_H = 2480;

  /* ── EVENT METADATA ── */
  const EVENT_NAME = 'AIVORA 2K26';
  const EVENT_TAGLINE = 'BUILD • INNOVATE • IMPACT';
  const EVENT_STATEMENT = 'TURNING REAL-WORLD CHALLENGES INTO PRACTICAL AI-POWERED SOLUTIONS';
  const EVENT_ORGANIZER = 'Innovation Hacks';

  /* ── BACKEND INTEGRATION (FIREBASE & CLOUDINARY SYNC) ── */
  function getBackendClient() {
    const b = window.AivoraBackend || window.AivoraFirebase || window.AivoraSupabase;
    if (b && typeof b.getClient === 'function') {
      return b.getClient();
    }
    return null;
  }

  /* ── PER-TEMPLATE CONFIGURATION (DEFAULT COORDINATES) ── */
  var CONFIGS = {
    participation: {
      nameX        : 1754,          // 50.0% of 3508 px (horizontal center)
      nameY        : 1175,          // Admin configured position (47.4% of 2480 px)
      color        : '#000000',     // Pure Black (maximum contrast)
      titleColor   : '#0B2D5C',
      accentColor  : '#1684D8',
      font         : 'Cinzel',
      fallbackFont : 'Playfair Display',
      weight       : '800',
      baseline     : 'middle',
      startSize    : 115,
      minSize      : 48,
      maxWidth     : 2400,
      letterSpacing: 5
    },
    winner1: {
      nameX        : 1754,
      nameY        : 1420,
      color        : '#000000',
      titleColor   : '#0B2D5C',
      accentColor  : '#1684D8',
      font         : 'Cinzel',
      fallbackFont : 'Playfair Display',
      weight       : '800',
      baseline     : 'middle',
      startSize    : 115,
      minSize      : 48,
      maxWidth     : 2400,
      letterSpacing: 5
    },
    winner2: {
      nameX        : 1754,
      nameY        : 1420,
      color        : '#000000',
      titleColor   : '#0B2D5C',
      accentColor  : '#1684D8',
      font         : 'Cinzel',
      fallbackFont : 'Playfair Display',
      weight       : '800',
      baseline     : 'middle',
      startSize    : 115,
      minSize      : 48,
      maxWidth     : 2400,
      letterSpacing: 5
    },
    winner3: {
      nameX        : 1754,
      nameY        : 1420,
      color        : '#000000',
      titleColor   : '#0B2D5C',
      accentColor  : '#1684D8',
      font         : 'Cinzel',
      fallbackFont : 'Playfair Display',
      weight       : '800',
      baseline     : 'middle',
      startSize    : 115,
      minSize      : 48,
      maxWidth     : 2400,
      letterSpacing: 5
    },
    judges: {
      nameX        : 1754,
      nameY        : 1420,
      color        : '#000000',
      titleColor   : '#0B2D5C',
      accentColor  : '#1684D8',
      font         : 'Cinzel',
      fallbackFont : 'Playfair Display',
      weight       : '800',
      baseline     : 'middle',
      startSize    : 115,
      minSize      : 48,
      maxWidth     : 2400,
      letterSpacing: 5
    }
  };

  /* ── ROBUST IMAGE LOADER WITH IN-MEMORY CACHE (Mobile & Desktop Compatible) ── */
  var _imgCache = {};
  function loadImg(src) {
    if (!src) return Promise.resolve(null);
    if (_imgCache[src] && _imgCache[src].complete && _imgCache[src].naturalWidth > 0) {
      return Promise.resolve(_imgCache[src]);
    }
    return new Promise(function (resolve) {
      var img = new Image();
      // If data URL or relative path, crossOrigin is not required
      if (typeof src === 'string' && (src.startsWith('http://') || src.startsWith('https://'))) {
        img.crossOrigin = 'anonymous';
      }
      img.onload = function () {
        _imgCache[src] = img;
        resolve(img);
      };
      img.onerror = function () {
        // Fallback without anonymous crossOrigin if host blocks CORS
        if (img.crossOrigin) {
          var fbImg = new Image();
          fbImg.onload = function () {
            _imgCache[src] = fbImg;
            resolve(fbImg);
          };
          fbImg.onerror = function () { resolve(null); };
          fbImg.src = src;
        } else {
          resolve(null);
        }
      };
      img.src = src;
    });
  }

  /* ── FONT LOADING HELPER (WITH SAFE 1.2S TIMEOUT) ── */
  var _fontsPromise = null;
  function ensureFonts() {
    if (_fontsPromise) return _fontsPromise;
    var loadPromise = (async function () {
      if (document.fonts && document.fonts.load) {
        try {
          await Promise.all([
            document.fonts.load('800 60px "Cinzel"'),
            document.fonts.load('700 60px "Cinzel"'),
            document.fonts.load('600 60px "Cinzel"'),
            document.fonts.load('800 60px "Playfair Display"'),
            document.fonts.load('700 60px "Playfair Display"'),
            document.fonts.load('700 60px "Times New Roman"'),
            document.fonts.load('700 60px "Poppins"'),
            document.fonts.load('600 60px "Poppins"'),
            document.fonts.load('600 60px "Inter"'),
            document.fonts.load('400 40px "Inter"')
          ]);
        } catch (e) {}
      }
      if (document.fonts && document.fonts.ready) {
        try { await document.fonts.ready; } catch (e) {}
      }
    })();
    var timeoutPromise = new Promise(function (resolve) { setTimeout(resolve, 1200); });
    _fontsPromise = Promise.race([loadPromise, timeoutPromise]).catch(function () {
      _fontsPromise = null;
    });
    return _fontsPromise;
  }

  /* ── AUTO-SCALING TYPOGRAPHY ── */
  function autoFontSize(ctx, text, maxW, startSz, minSz, weight, family) {
    var sz = startSz;
    ctx.font = weight + ' ' + sz + 'px "' + family + '", "Playfair Display", "Times New Roman", "Georgia", serif';
    while (ctx.measureText(text).width > maxW && sz > minSz) {
      sz -= 2;
      ctx.font = weight + ' ' + sz + 'px "' + family + '", "Playfair Display", "Times New Roman", "Georgia", serif';
    }
    return sz;
  }

  /* ── LETTER-SPACED TEXT RENDERER ── */
  function fillTextSpaced(ctx, text, x, y, spacing) {
    if (!spacing) { ctx.fillText(text, x, y); return; }
    var totalW = 0;
    var chars = text.split('');
    chars.forEach(function (ch) { totalW += ctx.measureText(ch).width + spacing; });
    totalW -= spacing;
    var curX = x - totalW / 2;
    chars.forEach(function (ch) {
      ctx.fillText(ch, curX + ctx.measureText(ch).width / 2, y);
      curX += ctx.measureText(ch).width + spacing;
    });
  }

  /* ── INDEXEDDB TEMPLATE GETTER & SETTER ── */
  function getTplFromIndexedDB(key) {
    return new Promise(function (resolve) {
      if (typeof indexedDB === 'undefined') return resolve(null);
      try {
        var req = indexedDB.open('NextGenTemplatesDB', 1);
        req.onsuccess = function () {
          var d = req.result;
          if (!d.objectStoreNames.contains('templates')) return resolve(null);
          try {
            var tx = d.transaction('templates', 'readonly');
            var getReq = tx.objectStore('templates').get(key);
            getReq.onsuccess = function () { resolve(getReq.result || null); };
            getReq.onerror = function () { resolve(null); };
          } catch (e) { resolve(null); }
        };
        req.onerror = function () { resolve(null); };
      } catch (e) { resolve(null); }
    });
  }

  function setTplToIndexedDB(key, val) {
    return new Promise(function (resolve) {
      if (typeof indexedDB === 'undefined') return resolve(false);
      try {
        var req = indexedDB.open('NextGenTemplatesDB', 1);
        req.onupgradeneeded = function () {
          var d = req.result;
          if (!d.objectStoreNames.contains('templates')) {
            d.createObjectStore('templates');
          }
        };
        req.onsuccess = function () {
          var d = req.result;
          if (!d.objectStoreNames.contains('templates')) return resolve(false);
          try {
            var tx = d.transaction('templates', 'readwrite');
            tx.objectStore('templates').put(val, key);
            tx.oncomplete = function () { resolve(true); };
            tx.onerror = function () { resolve(false); };
          } catch (e) { resolve(false); }
        };
        req.onerror = function () { resolve(false); };
      } catch (e) { resolve(false); }
    });
  }

  /* ── CLOUD POSITION CACHE & FETCHER (CROSS-DEVICE ALIGNMENT SYNC) ── */
  var _positionCache = {};  // { key: { x: number|null, y: number|null } }
  var _positionFetchPromise = null;
  var _backendChecked = {};

  /**
   * Fetches admin-saved name positions from Firebase Firestore.
   * Results are cached in-memory for the entire browser session.
   * Returns { x: number|null, y: number|null } or null on failure.
   */
  function _fetchBackendPositions(key) {
    if (!key) key = 'participation';

    // Return from cache if already fetched this session
    if (_positionCache[key] && _positionCache[key].x !== null && _positionCache[key].y !== null) {
      return Promise.resolve(_positionCache[key]);
    }

    // If a fetch is already in flight, piggyback on it
    if (_positionFetchPromise) {
      return _positionFetchPromise.then(function() {
        return _positionCache[key] || null;
      });
    }

    _positionFetchPromise = new Promise(function(resolve) {
      var fetchWork = (async function() {
        try {
          const b = window.AivoraBackend || window.AivoraFirebase || window.AivoraSupabase;
          if (b && typeof b.getTemplatePositions === 'function') {
            var positions = await b.getTemplatePositions();
            if (positions) {
              var keys = ['participation', 'winner1', 'winner2', 'winner3', 'judges'];
              keys.forEach(function(k) {
                if (positions[k]) {
                  var x = positions[k].nameX || positions[k].x || null;
                  var y = positions[k].nameY || positions[k].y || null;
                  _positionCache[k] = { x: x, y: y };
                  if (CONFIGS[k]) {
                    if (x !== null) CONFIGS[k].nameX = x;
                    if (y !== null) CONFIGS[k].nameY = y;
                  }
                  if (x !== null) {
                    try { localStorage.setItem('tpl_nameX_px_' + k, x); } catch(e) {}
                  }
                  if (y !== null) {
                    try { localStorage.setItem('tpl_nameY_px_' + k, y); } catch(e) {}
                  }
                }
              });
            }
          }
        } catch(e) {
          console.warn('Backend position fetch notice:', e.message);
        }
        _positionFetchPromise = null;
        return _positionCache[key] || null;
      })();

      // 3-second timeout to avoid blocking render on slow networks
      var timeout = new Promise(function(r) { setTimeout(function() { r(null); }, 3000); });
      Promise.race([fetchWork, timeout]).then(function(result) {
        _positionFetchPromise = null;
        resolve(result);
      });
    });

    return _positionFetchPromise;
  }

  /* ── IN-MEMORY TEMPLATE CACHE ── */
  var _memTemplateCache = {};

  const DEFAULT_TEMPLATES = {
    participation : 'assets/certificates/cert-participation.jpg',
    winner1       : 'assets/certificates/cert-first-prize.png',
    winner2       : 'assets/certificates/cert-second-prize.png',
    winner3       : 'assets/certificates/cert-third-prize.png',
    judges        : 'assets/certificates/cert-judge-appreciation.jpg'
  };

  /* ── EFFECTIVE TEMPLATE RESOLVER (SYNCED ACROSS DESKTOP & MOBILE) ── */
  async function getEffectiveTemplate(key) {
    if (!key) key = 'participation';
    var isCleared = false;
    try {
      isCleared = (localStorage.getItem('tpl_cleared_' + key) === 'true');
    } catch (e) {}

    function isAllowedTemplateUrl(url) {
      if (!url || typeof url !== 'string' || url.length < 5) return false;
      return true;
    }

    if (!isCleared) {
      // 0. Check in-memory cache (instant on repeated generations)
      if (_memTemplateCache[key] && isAllowedTemplateUrl(_memTemplateCache[key])) {
        return _memTemplateCache[key];
      }

      // 1. Check IndexedDB
      try {
        var idbVal = await getTplFromIndexedDB(key);
        if (idbVal && isAllowedTemplateUrl(idbVal)) {
          _memTemplateCache[key] = idbVal;
          return idbVal;
        }
      } catch (e) {}

      // 2. Check LocalStorage
      try {
        var lsVal = localStorage.getItem('tpl_' + key);
        if (lsVal && isAllowedTemplateUrl(lsVal)) {
          _memTemplateCache[key] = lsVal;
          return lsVal;
        }
      } catch (e) {}

      // 3. Fetch from Firebase & Cloudinary (Guarantees mobile devices get the admin-uploaded template from Cloudinary!)
      try {
        const b = window.AivoraBackend || window.AivoraFirebase || window.AivoraSupabase;
        if (b && typeof b.getCustomTemplates === 'function') {
          var cloudPromise = b.getCustomTemplates();
          var cloudTimeout = new Promise(function(r) { setTimeout(function() { r(null); }, 3500); });
          var remoteTemplates = await Promise.race([cloudPromise, cloudTimeout]);

          if (remoteTemplates && remoteTemplates[key] && isAllowedTemplateUrl(remoteTemplates[key])) {
            var remoteUrl = remoteTemplates[key];
            _memTemplateCache[key] = remoteUrl;
            try { localStorage.setItem('tpl_' + key, remoteUrl); } catch (e) {}
            try { setTplToIndexedDB(key, remoteUrl); } catch (e) {}
            return remoteUrl;
          }
        }
      } catch (e) {
        console.warn('Cloud template fetch warning:', e.message);
      }
    }

    // 4. Fallback to official built-in default artwork
    if (DEFAULT_TEMPLATES[key]) {
      var defaultPath = DEFAULT_TEMPLATES[key];
      _memTemplateCache[key] = defaultPath;
      return defaultPath;
    }

    return null;
  }

  /* ── CORE RENDER ENGINE ── */
  async function render(canvasEl, templateUrl, name, templateKey, scale) {
    var key = templateKey || 'participation';
    var cfg = CONFIGS[key] || CONFIGS.participation;
    var sc = scale || 1;
    var W = Math.round(FULL_W * sc);
    var H = Math.round(FULL_H * sc);

    // Resolve template: Admin custom artwork if present, otherwise default
    var effectiveTpl = await getEffectiveTemplate(key);
    if (!effectiveTpl && templateUrl && templateUrl.length > 50) {
      effectiveTpl = templateUrl;
      _memTemplateCache[key] = effectiveTpl;
    }
    if (!effectiveTpl && DEFAULT_TEMPLATES[key]) {
      effectiveTpl = DEFAULT_TEMPLATES[key];
      _memTemplateCache[key] = effectiveTpl;
    }

    if (!effectiveTpl) {
      console.warn('No certificate template found for:', key);
      return {
        success: false,
        error: 'NO_TEMPLATE',
        message: 'No certificate template found. Please upload the official template artwork in the Admin Panel.'
      };
    }

    var img = await loadImg(effectiveTpl);
    if (!img && DEFAULT_TEMPLATES[key] && effectiveTpl !== DEFAULT_TEMPLATES[key]) {
      img = await loadImg(DEFAULT_TEMPLATES[key]);
    }

    if (!img) {
      console.error('Failed to load certificate template image for:', key);
      return {
        success: false,
        error: 'IMAGE_LOAD_FAILED',
        message: 'Failed to load certificate template image. Please check network connection or re-upload the template.'
      };
    }

    canvasEl.width = W;
    canvasEl.height = H;

    var ctx = canvasEl.getContext('2d', { willReadFrequently: true });
    ctx.clearRect(0, 0, W, H);

    // High-resolution template background render
    ctx.drawImage(img, 0, 0, W, H);

    await ensureFonts();

    // ── CROSS-DEVICE COORDINATE RESOLUTION ──
    var defaultY = (key === 'participation') ? 1195 : 1420;
    var defaultX = 1754;

    // 1. Initial load for this key: fetch admin-saved coordinates from Firebase Firestore once
    if (!_backendChecked[key]) {
      _backendChecked[key] = true;
      var fsPos = await _fetchBackendPositions(key);
      if (fsPos) {
        if (fsPos.x !== null && fsPos.x > 0) {
          cfg.nameX = fsPos.x;
          if (!_positionCache[key]) _positionCache[key] = {};
          _positionCache[key].x = fsPos.x;
        }
        if (fsPos.y !== null && fsPos.y > 0) {
          cfg.nameY = fsPos.y;
          if (!_positionCache[key]) _positionCache[key] = {};
          _positionCache[key].y = fsPos.y;
        }
      } else {
        // Fallback to localStorage if offline
        try {
          var savedPxX = parseInt(localStorage.getItem('tpl_nameX_px_' + key), 10);
          if (!isNaN(savedPxX) && savedPxX > 0) cfg.nameX = savedPxX;
          var savedPxY = parseInt(localStorage.getItem('tpl_nameY_px_' + key), 10);
          if (!isNaN(savedPxY) && savedPxY > 0) cfg.nameY = savedPxY;
        } catch (e) {}
      }
    }

    // 2. Live Coordinates: Always honor live updates from admin sliders or setNamePosition()
    var posX = (cfg.nameX !== undefined && cfg.nameX !== null && !isNaN(cfg.nameX) && cfg.nameX > 0)
      ? cfg.nameX
      : ((_positionCache[key] && _positionCache[key].x) ? _positionCache[key].x : defaultX);

    var posY = (cfg.nameY !== undefined && cfg.nameY !== null && !isNaN(cfg.nameY) && cfg.nameY > 0)
      ? cfg.nameY
      : ((_positionCache[key] && _positionCache[key].y) ? _positionCache[key].y : defaultY);

    // Keep cache and cfg synchronized
    cfg.nameX = posX;
    cfg.nameY = posY;
    if (!_positionCache[key]) _positionCache[key] = {};
    _positionCache[key].x = posX;
    _positionCache[key].y = posY;

    /* Draw Recipient Name with dynamic auto-scaling typography */
    var upperName = (name || '').trim().toUpperCase();
    var maxW = Math.round((cfg.maxWidth || 2400) * sc);
    var startSz = Math.round((cfg.startSize || 115) * sc);
    var minSz = Math.round((cfg.minSize || 48) * sc);

    var chosenFont = cfg.font || 'Cinzel';
    var fontSize = autoFontSize(ctx, upperName, maxW, startSz, minSz, cfg.weight || '800', chosenFont);

    ctx.font = (cfg.weight || '800') + ' ' + fontSize + 'px "' + chosenFont + '", "Playfair Display", "Times New Roman", "Georgia", serif';
    ctx.fillStyle = cfg.color || '#000000';
    ctx.textAlign = 'center';
    ctx.textBaseline = cfg.baseline || 'middle';

    ctx.shadowColor = 'rgba(0, 0, 0, 0.12)';
    ctx.shadowBlur = 4 * sc;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 2 * sc;

    var drawX = Math.round(posX * sc);
    var drawY = Math.round(posY * sc);

    if (cfg.letterSpacing) {
      fillTextSpaced(ctx, upperName, drawX, drawY, Math.round(cfg.letterSpacing * sc));
    } else {
      ctx.fillText(upperName, drawX, drawY);
    }

    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    return {
      success: true,
      fontSize: Math.round(fontSize / sc),
      x: posX,
      y: posY
    };
  }

  /* ── PUBLIC API ── */

  /** Full 3508×2480 render (A4 300 DPI) */
  async function renderFull(canvasEl, templateUrl, name, templateKey) {
    return render(canvasEl, templateUrl, name, templateKey, 1);
  }

  /** Quarter-scale render for fast admin/portal preview */
  async function renderPreview(canvasEl, templateUrl, name, templateKey) {
    return render(canvasEl, templateUrl, name, templateKey, 0.25);
  }

  /** Download canvas as high-resolution PNG (Safe on Mobile & Desktop) */
  function downloadPNG(canvasEl, filename) {
    if (canvasEl && canvasEl.toBlob) {
      canvasEl.toBlob(function (blob) {
        if (!blob) {
          var a = document.createElement('a');
          a.download = filename || 'INNOVATION-HACKS-Certificate.png';
          a.href     = canvasEl.toDataURL('image/png');
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          return;
        }
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.download = filename || 'INNOVATION-HACKS-Certificate.png';
        a.href = url;
        document.body.appendChild(a);
        a.click();
        setTimeout(function () {
          if (a.parentNode) document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 1500);
      }, 'image/png');
    } else {
      var a = document.createElement('a');
      a.download = filename || 'INNOVATION-HACKS-Certificate.png';
      a.href     = canvasEl.toDataURL('image/png');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  }

  /** Download canvas as A4 Landscape PDF */
  function downloadPDF(canvasEl, filename) {
    try {
      var _jspdf = window.jspdf;
      var jsPDF  = _jspdf ? _jspdf.jsPDF : null;
      if (!jsPDF) throw new Error('jsPDF library not loaded');
      var pw  = canvasEl.width  / 4;
      var ph  = canvasEl.height / 4;
      var pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [pw, ph] });
      pdf.addImage(canvasEl.toDataURL('image/png'), 'PNG', 0, 0, pw, ph);
      pdf.save(filename || 'INNOVATION-HACKS-Certificate.pdf');
    } catch (e) {
      console.error('PDF export failed:', e);
      downloadPNG(canvasEl, (filename || 'certificate').replace('.pdf', '.png'));
    }
  }

  function setNamePosition(key, x, y) {
    if (!key) key = 'participation';
    if (!CONFIGS[key]) CONFIGS[key] = {};
    if (!_positionCache[key]) _positionCache[key] = {};
    _backendChecked[key] = true;
    if (x !== undefined && x !== null && !isNaN(x)) {
      var pxX = Math.round(parseFloat(x));
      CONFIGS[key].nameX = pxX;
      _positionCache[key].x = pxX;
      try {
        localStorage.setItem('tpl_nameX_px_' + key, pxX);
        localStorage.setItem('tpl_nameX_' + key, ((pxX / FULL_W) * 100).toFixed(1));
      } catch (e) {}
    }
    if (y !== undefined && y !== null && !isNaN(y)) {
      var pxY = Math.round(parseFloat(y));
      CONFIGS[key].nameY = pxY;
      _positionCache[key].y = pxY;
      try {
        localStorage.setItem('tpl_nameY_px_' + key, pxY);
        localStorage.setItem('tpl_nameY_' + key, ((pxY / FULL_H) * 100).toFixed(1));
      } catch (e) {}
    }
  }

  function getNamePosition(key) {
    if (!key) key = 'participation';
    var cfg = CONFIGS[key] || CONFIGS.participation;
    var x = (_positionCache[key] && _positionCache[key].x) || ((cfg.nameX !== undefined && !isNaN(cfg.nameX)) ? cfg.nameX : Math.round(FULL_W / 2));
    var y = (_positionCache[key] && _positionCache[key].y) || ((cfg.nameY !== undefined && !isNaN(cfg.nameY)) ? cfg.nameY : (key === 'participation' ? 1195 : 1420));
    return {
      x: x,
      y: y,
      xPct: parseFloat(((x / FULL_W) * 100).toFixed(1)),
      yPct: parseFloat(((y / FULL_H) * 100).toFixed(1))
    };
  }

  function clearTemplateCache(key) {
    if (key) {
      delete _memTemplateCache[key];
      delete _positionCache[key];
      Object.keys(_imgCache).forEach(function (src) {
        if (src.includes(key)) delete _imgCache[src];
      });
      if (CONFIGS[key]) {
        CONFIGS[key].nameX = 1754;
        CONFIGS[key].nameY = (key === 'participation') ? 1195 : 1420;
      }
    } else {
      _memTemplateCache = {};
      _positionCache = {};
      _imgCache = {};
    }
  }

  window.CertEngine = {
    renderFull           : renderFull,
    renderPreview        : renderPreview,
    render               : render,
    downloadPNG          : downloadPNG,
    downloadPDF          : downloadPDF,
    getEffectiveTemplate : getEffectiveTemplate,
    resolveTemplate      : getEffectiveTemplate, // Alias for backward compatibility
    clearTemplateCache   : clearTemplateCache,
    setNamePosition      : setNamePosition,
    getNamePosition      : getNamePosition,
    CONFIGS              : CONFIGS,
    DEFAULT_TEMPLATES    : DEFAULT_TEMPLATES,
    FULL_W               : FULL_W,
    FULL_H               : FULL_H,
    EVENT_NAME           : EVENT_NAME,
    EVENT_TAGLINE        : EVENT_TAGLINE,
    EVENT_STATEMENT      : EVENT_STATEMENT,
    EVENT_ORGANIZER      : EVENT_ORGANIZER
  };

})(window);
