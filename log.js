/**
 * IkaGX - log.js
 * Salva e lê o histórico de IPs e perfis por conta/servidor.
 */

var IkaLog = {
  CHAVE_LOGS:      'ikaext_logs',
  CHAVE_EMAIL:     'ikaext_atual_email',
  CHAVE_PERFIS:    'ikaext_perfis',
  CHAVE_MUNDOS:    'ikaext_mundos',
  CHAVE_IMPERIOS:  'ikaext_imperios',
  LIMITE:       100,
  _emailDoResponse: null,

  _contextOk: function () {
    try { return !!chrome.runtime.id; }
    catch (e) { console.warn('[IkaGX] Contexto inválido.'); return false; }
  },

  lerEmail: function (cb) {
    if (!IkaLog._contextOk()) { cb(null); return; }
    try {
      chrome.storage.local.get(IkaLog.CHAVE_EMAIL, function (r) {
        try {
          if (chrome.runtime.lastError) throw new Error(chrome.runtime.lastError.message);
          cb(r[IkaLog.CHAVE_EMAIL] || null);
        } catch (e) { console.warn('[IkaGX] lerEmail:', e.message); cb(null); }
      });
    } catch (e) { console.warn('[IkaGX] lerEmail:', e.message); cb(null); }
  },

  salvarEmail: function (email) {
    if (!email || !IkaLog._contextOk()) return;
    var d = {}; d[IkaLog.CHAVE_EMAIL] = email;
    try {
      chrome.storage.local.set(d, function () {
        try { if (chrome.runtime.lastError) throw new Error(chrome.runtime.lastError.message); }
        catch (e) { console.warn('[IkaGX] salvarEmail:', e.message); }
      });
    } catch (e) { console.warn('[IkaGX] salvarEmail:', e.message); }
  },

  lerTodos: function (cb) {
    if (!IkaLog._contextOk()) { cb({}); return; }
    try {
      chrome.storage.local.get(IkaLog.CHAVE_LOGS, function (r) {
        try {
          if (chrome.runtime.lastError) throw new Error(chrome.runtime.lastError.message);
          cb(r[IkaLog.CHAVE_LOGS] || {});
        } catch (e) { console.warn('[IkaGX] lerTodos:', e.message); cb({}); }
      });
    } catch (e) { console.warn('[IkaGX] lerTodos:', e.message); cb({}); }
  },

  salvarTodos: function (logs, cb) {
    if (!IkaLog._contextOk()) return;
    var d = {}; d[IkaLog.CHAVE_LOGS] = logs;
    try {
      chrome.storage.local.set(d, function () {
        try {
          if (chrome.runtime.lastError) throw new Error(chrome.runtime.lastError.message);
          if (cb) cb();
        } catch (e) { console.warn('[IkaGX] salvarTodos:', e.message); }
      });
    } catch (e) { console.warn('[IkaGX] salvarTodos:', e.message); }
  },

  registrar: function (servidor, email, conta, ip, perfil) {
    if (!servidor || !email || !conta || !ip) return;
    IkaLog.lerTodos(function (logs) {
      if (!logs[servidor])        logs[servidor] = {};
      if (!logs[servidor][email]) logs[servidor][email] = [];
      var lista  = logs[servidor][email];
      var ultimo = lista[lista.length - 1];
      if (ultimo && ultimo.account === conta && ultimo.ip === ip) {
        var diaUltimo = new Date(ultimo.timestamp * 1000).toDateString();
        if (diaUltimo === new Date().toDateString()) {
          console.log('[IkaGX] Duplicado no mesmo dia:', conta, ip);
          if (perfil) IkaLog.salvarPerfil(servidor, conta, perfil);
          return;
        }
      }
      lista.push({ account: conta, ip: ip, timestamp: Math.floor(Date.now() / 1000) });
      if (lista.length > IkaLog.LIMITE) logs[servidor][email] = lista.slice(-IkaLog.LIMITE);
      IkaLog.salvarTodos(logs, function () { console.log('[IkaGX] Log salvo:', servidor, conta); });
      if (perfil) IkaLog.salvarPerfil(servidor, conta, perfil);
    });
  },

  lerPerfis: function (cb) {
    if (!IkaLog._contextOk()) { cb({}); return; }
    try {
      chrome.storage.local.get(IkaLog.CHAVE_PERFIS, function (r) {
        try {
          if (chrome.runtime.lastError) throw new Error(chrome.runtime.lastError.message);
          cb(r[IkaLog.CHAVE_PERFIS] || {});
        } catch (e) { console.warn('[IkaGX] lerPerfis:', e.message); cb({}); }
      });
    } catch (e) { console.warn('[IkaGX] lerPerfis:', e.message); cb({}); }
  },

  salvarPerfil: function (servidor, conta, perfil) {
    if (!IkaLog._contextOk()) return;
    IkaLog.lerPerfis(function (perfis) {
      if (!perfis[servidor]) perfis[servidor] = {};
      perfis[servidor][conta] = perfil;
      var d = {}; d[IkaLog.CHAVE_PERFIS] = perfis;
      try {
        chrome.storage.local.set(d, function () {
          try {
            if (chrome.runtime.lastError) throw new Error(chrome.runtime.lastError.message);
            console.log('[IkaGX] Perfil salvo:', servidor, conta);
          } catch (e) { console.warn('[IkaGX] salvarPerfil:', e.message); }
        });
      } catch (e) { console.warn('[IkaGX] salvarPerfil:', e.message); }
    });
  },

  lerPerfil: function (servidor, conta, cb) {
    IkaLog.lerPerfis(function (perfis) {
      cb((perfis[servidor] && perfis[servidor][conta]) ? perfis[servidor][conta] : null);
    });
  },

  lerNomesMundo: function (cb) {
    if (!IkaLog._contextOk()) { cb({}); return; }
    try {
      chrome.storage.local.get(IkaLog.CHAVE_MUNDOS, function (r) {
        try {
          if (chrome.runtime.lastError) throw new Error(chrome.runtime.lastError.message);
          cb(r[IkaLog.CHAVE_MUNDOS] || {});
        } catch (e) { console.warn('[IkaGX] lerNomesMundo:', e.message); cb({}); }
      });
    } catch (e) { console.warn('[IkaGX] lerNomesMundo:', e.message); cb({}); }
  },

  salvarNomeMundo: function (servidor, nome) {
    if (!IkaLog._contextOk()) return;
    IkaLog.lerNomesMundo(function (mundos) {
      mundos[servidor] = nome;
      var d = {}; d[IkaLog.CHAVE_MUNDOS] = mundos;
      try {
        chrome.storage.local.set(d, function () {
          try {
            if (chrome.runtime.lastError) throw new Error(chrome.runtime.lastError.message);
            console.log('[IkaGX] Mundo salvo:', servidor, nome);
          } catch (e) { console.warn('[IkaGX] salvarNomeMundo:', e.message); }
        });
      } catch (e) { console.warn('[IkaGX] salvarNomeMundo:', e.message); }
    });
  },

  buscarPorEmail: function (servidor, email, cb) {
    IkaLog.lerTodos(function (logs) {
      cb((logs[servidor] && logs[servidor][email]) ? logs[servidor][email] : []);
    });
  },

  lerImperios: function (cb) {
    if (!IkaLog._contextOk()) { cb({}); return; }
    try {
      chrome.storage.local.get(IkaLog.CHAVE_IMPERIOS, function (r) {
        try {
          if (chrome.runtime.lastError) throw new Error(chrome.runtime.lastError.message);
          cb(r[IkaLog.CHAVE_IMPERIOS] || {});
        } catch (e) { console.warn('[IkaGX] lerImperios:', e.message); cb({}); }
      });
    } catch (e) { console.warn('[IkaGX] lerImperios:', e.message); cb({}); }
  },

  salvarImperio: function (servidor, conta, dados) {
    if (!IkaLog._contextOk() || !servidor || !conta) return;
    IkaLog.lerImperios(function (imperios) {
      if (!imperios[servidor]) imperios[servidor] = {};
      imperios[servidor][conta] = dados;
      var d = {}; d[IkaLog.CHAVE_IMPERIOS] = imperios;
      try {
        chrome.storage.local.set(d, function () {
          try {
            if (chrome.runtime.lastError) throw new Error(chrome.runtime.lastError.message);
            console.log('[IkaGX] Imperio salvo:', servidor, conta);
          } catch (e) { console.warn('[IkaGX] salvarImperio:', e.message); }
        });
      } catch (e) { console.warn('[IkaGX] salvarImperio:', e.message); }
    });
  },

  lerImperio: function (servidor, conta, cb) {
    IkaLog.lerImperios(function (imperios) {
      cb((imperios[servidor] && imperios[servidor][conta]) ? imperios[servidor][conta] : null);
    });
  }
};
