/**
 * IkaGX - modal.js
 * Modal de histórico de IPs — tema bege/dourado (light)
 */

var IkaModal = {
  _logsCache: {},
  _mundosCache: {},

  iniciar: function () {
    if (document.getElementById('ikaext-btn-logs')) return;

    var css = `
      @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

      :root {
        --bg:      #F5EDD6;
        --bg-card: #EDE0BE;
        --bg-deep: #E5D5A8;
        --gold:    #8B6914;
        --gold-lt: #C9A84C;
        --text:    #3D2B00;
        --text-2:  #6B4E1A;
        --text-3:  #9A7A3A;
        --border:  rgba(139,105,20,0.2);
        --shadow:  0 8px 32px rgba(100,70,0,0.18);
      }

      #ikaext-btn-logs {
        position: fixed; bottom: 20px; right: 20px; z-index: 9999;
        background: var(--bg-card); color: var(--gold);
        border: 1px solid var(--border); border-radius: 8px;
        padding: 9px 16px; font-size: 13px; cursor: pointer;
        font-family: Inter, sans-serif; font-weight: 600;
        box-shadow: var(--shadow);
      }
      #ikaext-btn-logs:hover { background: var(--bg-deep); }

      #ikaext-modal-overlay {
        display: none; position: fixed; inset: 0;
        background: rgba(50,30,0,0.55); backdrop-filter: blur(4px);
        z-index: 10000; justify-content: center; align-items: center;
        font-family: Inter, sans-serif;
      }
      #ikaext-modal-overlay.aberta { display: flex; }

      #ikaext-modal {
        background: var(--bg); border-radius: 16px;
        width: 500px; max-width: 96vw; max-height: 88vh;
        display: flex; flex-direction: column;
        border: 1.5px solid var(--border);
        box-shadow: var(--shadow);
        overflow: hidden;
      }

      /* Header */
      #ikaext-modal-header {
        padding: 14px 18px; border-bottom: 1px solid var(--border);
        display: flex; align-items: center; gap: 12px; position: relative;
      }
      #ikaext-modal-icone {
        width: 42px; height: 42px; border-radius: 50%; flex-shrink: 0;
        background: var(--bg-deep); border: 1.5px solid var(--gold-lt);
        display: flex; align-items: center; justify-content: center; font-size: 18px;
      }
      #ikaext-modal-titulo-wrap { flex: 1; }
      #ikaext-modal-titulo {
        font-family: 'Cinzel', serif; font-size: 15px;
        font-weight: 600; color: var(--text); margin: 0; letter-spacing: 0.03em;
      }
      .ikaext-badges-header { display: flex; gap: 6px; margin-top: 4px; flex-wrap: wrap; }
      .ikaext-badge-h {
        background: var(--bg-deep); border: 1px solid var(--border);
        border-radius: 20px; padding: 2px 10px; font-size: 11px; color: var(--text-2);
        display: flex; align-items: center; gap: 4px;
      }
      .ikaext-badge-h.ouro { color: var(--gold); border-color: var(--gold-lt); }
      #ikaext-marca { position: absolute; right: 48px; top: 14px; font-family: 'Cinzel', serif; font-size: 11px; color: var(--text-3); letter-spacing: 0.08em; }
      #ikaext-modal-fechar {
        background: var(--bg-deep); border: 1px solid var(--border);
        border-radius: 8px; width: 28px; height: 28px; cursor: pointer;
        color: var(--text-3); font-size: 14px; display: flex;
        align-items: center; justify-content: center; flex-shrink: 0;
      }
      #ikaext-modal-fechar:hover { color: var(--gold); border-color: var(--gold-lt); }

      /* Busca */
      #ikaext-busca-wrapper { padding: 12px 18px; border-bottom: 1px solid var(--border); }
      #ikaext-busca {
        width: 100%; box-sizing: border-box; background: var(--bg-card);
        border: 1px solid var(--border); border-radius: 10px; color: var(--text);
        padding: 9px 14px 9px 36px; font-size: 13px; outline: none;
        font-family: Inter, sans-serif;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%239A7A3A' stroke-width='2'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cpath d='m21 21-4.35-4.35'/%3E%3C/svg%3E");
        background-repeat: no-repeat; background-position: 12px center;
      }
      #ikaext-busca:focus { border-color: var(--gold-lt); }
      #ikaext-busca::placeholder { color: var(--text-3); }

      /* Corpo */
      #ikaext-modal-corpo { overflow-y: auto; padding: 12px 18px; flex: 1; scrollbar-width: none; }
      #ikaext-modal-corpo::-webkit-scrollbar { display: none; }

      /* Servidor acordeão */
      .ikaext-servidor-bloco { margin-bottom: 8px; border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
      .ikaext-servidor-header {
        display: flex; align-items: center; gap: 10px;
        background: var(--bg-card); padding: 10px 14px; cursor: pointer; user-select: none;
      }
      .ikaext-servidor-header:hover { background: var(--bg-deep); }
      .ikaext-srv-icone {
        width: 30px; height: 30px; border-radius: 8px;
        background: var(--bg-deep); border: 1px solid var(--border);
        display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0;
      }
      .ikaext-srv-nome { font-size: 13px; font-weight: 600; color: var(--text); flex: 1; }
      .ikaext-srv-badges { display: flex; align-items: center; gap: 6px; }
      .ikaext-badge { border-radius: 20px; padding: 2px 10px; font-size: 11px; }
      .ikaext-badge.cinza { background: var(--bg-deep); color: var(--text-2); border: 1px solid var(--border); }
      .ikaext-badge.ouro  { background: rgba(201,168,76,0.15); color: var(--gold); border: 1px solid var(--gold-lt); }
      .ikaext-srv-chevron { font-size: 10px; color: var(--text-3); transition: transform 0.2s; margin-left: 4px; }
      .ikaext-servidor-header.colapsado .ikaext-srv-chevron { transform: rotate(-90deg); }

      .ikaext-servidor-conteudo { padding: 6px; background: var(--bg); }
      .ikaext-servidor-conteudo.escondido { display: none; }

      /* Card de conta */
      .ikaext-conta-card {
        display: flex; align-items: center; gap: 10px;
        padding: 9px 10px; border-radius: 9px; cursor: pointer;
      }
      .ikaext-conta-card:hover { background: var(--bg-card); }
      .ikaext-conta-avatar {
        width: 34px; height: 34px; border-radius: 50%; flex-shrink: 0;
        background: var(--bg-deep); border: 1.5px solid var(--gold-lt);
        display: flex; align-items: center; justify-content: center;
        font-size: 13px; font-weight: 700; color: var(--gold);
      }
      .ikaext-conta-info { flex: 1; min-width: 0; }
      .ikaext-conta-nome { font-size: 13px; font-weight: 600; color: var(--text); }
      .ikaext-conta-alianca { font-size: 11px; color: var(--text-3); }
      .ikaext-conta-meta { text-align: right; flex-shrink: 0; }
      .ikaext-conta-ip { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--gold); display: block; font-weight: 600; }
      .ikaext-conta-data { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: var(--text-3); }
      .ikaext-conta-seta { color: var(--text-3); font-size: 14px; }

      /* Destaque busca */
      .ikaext-destaque { background: rgba(201,168,76,0.3); color: var(--gold); border-radius: 2px; padding: 0 2px; }

      .ikaext-vazio, .ikaext-sem-resultado {
        text-align: center; padding: 30px; color: var(--text-3); font-size: 13px; font-style: italic;
      }

      /* Footer */
      #ikaext-modal-footer {
        padding: 8px 18px; border-top: 1px solid var(--border);
        display: flex; justify-content: space-between; align-items: center;
        font-size: 11px; color: var(--text-3); background: var(--bg-card);
      }
      .ikaext-status-ativo { display: flex; align-items: center; gap: 5px; }
      .ikaext-ponto-verde { width: 6px; height: 6px; border-radius: 50%; background: #4ade80; }
    `;

    $('<style id="ikaext-estilos-modal">').text(css).appendTo('head');

    $('<button id="ikaext-btn-logs">📋 Histórico de IPs</button>').on('click', function () {
      IkaModal.abrirModal();
    }).appendTo('body');

    var overlay = $('<div id="ikaext-modal-overlay">');
    var modal = $(
      '<div id="ikaext-modal">' +
        '<div id="ikaext-modal-header">' +
          '<div id="ikaext-modal-icone">≡</div>' +
          '<div id="ikaext-modal-titulo-wrap">' +
            '<h2 id="ikaext-modal-titulo">Histórico de IPs</h2>' +
            '<div class="ikaext-badges-header">' +
              '<span class="ikaext-badge-h" id="ikaext-badge-contas">👥 0 contas</span>' +
              '<span class="ikaext-badge-h ouro" id="ikaext-badge-ips">🌐 0 IPs únicos</span>' +
            '</div>' +
          '</div>' +
          '<span id="ikaext-marca">IkaGX</span>' +
          '<button id="ikaext-modal-fechar">✕</button>' +
        '</div>' +
        '<div id="ikaext-busca-wrapper"><input id="ikaext-busca" type="text" placeholder="Pesquisar conta, IP, e-mail, servidor ou data..." /></div>' +
        '<div id="ikaext-modal-corpo"></div>' +
        '<div id="ikaext-modal-footer">' +
          '<span>IkaGX v2.0 · Ikariam Intelligence</span>' +
          '<span class="ikaext-status-ativo"><span class="ikaext-ponto-verde"></span> Ativo</span>' +
        '</div>' +
      '</div>'
    );

    overlay.append(modal).appendTo('body');
    overlay.on('click', function (e) { if ($(e.target).is('#ikaext-modal-overlay')) IkaModal.fecharModal(); });
    $('#ikaext-modal-fechar').on('click', function () { IkaModal.fecharModal(); });

    var t;
    $(document).on('input', '#ikaext-busca', function () {
      clearTimeout(t);
      t = setTimeout(function () { IkaModal.renderizarLogs($('#ikaext-busca').val().trim()); }, 250);
    });
  },

  abrirModal: function () {
    IkaLog.lerTodos(function (logs) {
      IkaModal._logsCache = logs;
      IkaLog.lerNomesMundo(function (mundos) {
        IkaModal._mundosCache = mundos;
        IkaModal.renderizarLogs('');
        $('#ikaext-modal-overlay').addClass('aberta');
        $('#ikaext-busca').val('').focus();
      });
    });
  },

  fecharModal: function () { $('#ikaext-modal-overlay').removeClass('aberta'); },

  renderizarLogs: function (termo) {
    var corpo = $('#ikaext-modal-corpo').empty();
    var logs  = IkaModal._logsCache;
    var busca = termo ? termo.toLowerCase() : '';

    var servidores = Object.keys(logs);
    if (servidores.length === 0) {
      corpo.append('<p class="ikaext-vazio">Nenhum acesso registrado ainda.</p>');
      $('#ikaext-badge-contas').text('👥 0 contas');
      $('#ikaext-badge-ips').text('🌐 0 IPs únicos');
      return;
    }

    servidores.sort(function (a, b) {
      return IkaModal._tsRecente(logs[b]) - IkaModal._tsRecente(logs[a]);
    });

    var totalContas = 0, todosIps = [];

    servidores.forEach(function (servidor) {
      var emails = Object.keys(logs[servidor]).sort(function (a, b) {
        var la = logs[servidor][a], lb = logs[servidor][b];
        return (lb[lb.length-1]||{timestamp:0}).timestamp - (la[la.length-1]||{timestamp:0}).timestamp;
      });

      var blocoOk = false;
      var conteudo = $('<div class="ikaext-servidor-conteudo escondido">');
      var srvContas = 0, srvIps = [];
      var vistos = {}; // movido para fora do loop de emails — evita duplicatas entre e-mails

      emails.forEach(function (email) {
        var registros = logs[servidor][email].slice().reverse();
        var nomeMundoSrv = (IkaModal._mundosCache[servidor] || '').toLowerCase();

        var filtrados = registros.filter(function (r) {
          if (!busca) return true;
          var data = new Date(r.timestamp * 1000).toLocaleString('pt-BR');
          return r.account.toLowerCase().includes(busca) || r.ip.toLowerCase().includes(busca) ||
                 email.toLowerCase().includes(busca) || servidor.toLowerCase().includes(busca) ||
                 nomeMundoSrv.includes(busca) || data.toLowerCase().includes(busca);
        });

        if (!filtrados.length) return;
        blocoOk = true;

        filtrados.forEach(function (reg) {
          if (vistos[reg.account]) return;
          vistos[reg.account] = true;
          srvContas++; totalContas++;
          if (srvIps.indexOf(reg.ip) === -1) srvIps.push(reg.ip);
          if (todosIps.indexOf(reg.ip) === -1) todosIps.push(reg.ip);

          var data   = new Date(reg.timestamp * 1000).toLocaleString('pt-BR');
          var ini    = reg.account.charAt(0).toUpperCase();
          var cid    = 'ikaal-' + reg.account.replace(/[^a-z0-9]/gi,'') + '-' + reg.timestamp;

          var card = $(
            '<div class="ikaext-conta-card">' +
              '<div class="ikaext-conta-avatar">' + ini + '</div>' +
              '<div class="ikaext-conta-info">' +
                '<div class="ikaext-conta-nome">' + IkaModal._hl(reg.account, busca) + '</div>' +
                '<div class="ikaext-conta-alianca" id="' + cid + '"></div>' +
              '</div>' +
              '<div class="ikaext-conta-meta">' +
                '<span class="ikaext-conta-ip">' + IkaModal._hl(reg.ip, busca) + '</span>' +
                '<span class="ikaext-conta-data">' + data + '</span>' +
              '</div>' +
              '<span class="ikaext-conta-seta">›</span>' +
            '</div>'
          );

          IkaLog.lerPerfil(servidor, reg.account, (function(id){ return function(p){ if(p&&p['Aliança']) $('#'+id).text(p['Aliança']); }; })(cid));

          var regs = registros.filter(function(r){ return r.account === reg.account; });
          card.on('click', (function(srv,acct,eml,rs){ return function(e){ e.stopPropagation(); IkaLookup.abrirModalLocal(srv,acct,eml,rs); }; })(servidor, reg.account, email, regs));
          conteudo.append(card);
        });
      });

      if (!blocoOk) return;

      var nomeExib = IkaModal._mundosCache[servidor] || servidor;
      var header = $(
        '<div class="ikaext-servidor-header colapsado">' +
          '<div class="ikaext-srv-icone">🌐</div>' +
          '<span class="ikaext-srv-nome">' + IkaModal._hl(nomeExib, busca) + '</span>' +
          '<div class="ikaext-srv-badges">' +
            '<span class="ikaext-badge cinza">' + srvContas + ' contas</span>' +
            '<span class="ikaext-badge ouro">' + srvIps.length + ' IPs</span>' +
            '<span class="ikaext-srv-chevron">▼</span>' +
          '</div>' +
        '</div>'
      );
      header.on('click', function(){ $(this).toggleClass('colapsado'); $(this).next().toggleClass('escondido'); });

      var bloco = $('<div class="ikaext-servidor-bloco">').append(header).append(conteudo);
      corpo.append(bloco);
    });

    $('#ikaext-badge-contas').text('👥 ' + totalContas + ' contas');
    $('#ikaext-badge-ips').text('🌐 ' + todosIps.length + ' IPs únicos');
    if (!totalContas && busca) corpo.append('<p class="ikaext-sem-resultado">Nenhum resultado para "' + termo + '"</p>');
  },

  _tsRecente: function (emailsObj) {
    var m = 0;
    Object.keys(emailsObj).forEach(function(e){ var l=emailsObj[e]; if(l.length&&l[l.length-1].timestamp>m) m=l[l.length-1].timestamp; });
    return m;
  },

  _hl: function (txt, busca) {
    if (!busca || !txt) return txt;
    var i = txt.toLowerCase().indexOf(busca);
    if (i===-1) return txt;
    return txt.slice(0,i)+'<span class="ikaext-destaque">'+txt.slice(i,i+busca.length)+'</span>'+IkaModal._hl(txt.slice(i+busca.length),busca);
  }
};
