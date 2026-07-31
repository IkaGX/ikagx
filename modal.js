/**
 * IkaGX - modal.js
 * Modal de histórico de IPs — tema bege/dourado (light)
 */

var IkaModal = {
  _logsCache: {},
  _mundosCache: {},

  iniciar: function () {
    if (document.getElementById('ikaext-btn-logs')) return;



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
