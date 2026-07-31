/**
 * IkaGX - lookup.js
 * Modal de detalhes da conta — tema bege/dourado (light)
 */

var IkaLookup = {

  // URLs das imagens de barcos — pré-calculadas uma vez para funcionar em qualquer contexto
  _urlBarcos: null,
  _getUrlBarcos: function () {
    if (!IkaLookup._urlBarcos) {
      var u = chrome.runtime.getURL;
      IkaLookup._urlBarcos = {
        mercantes:          u('img/mercantes.png'),
        mercantesFenicios:  u('img/mercantesfenicios.png'),
        cargueiros:         u('img/cargueiros.png'),
        cargueirosFenicios: u('img/cargueirosFenicios.png')
      };
    }
    return IkaLookup._urlBarcos;
  },

  _criarModal: function () {
    if (document.getElementById('ikaext-perfil-overlay')) return;



    var overlay = $('<div id="ikaext-perfil-overlay">');
    var modal = $(
      '<div id="ikaext-perfil-modal">' +
        '<div id="ikaext-perfil-header">' +
          '<button id="ikaext-perfil-back">←</button>' +
          '<div id="ikaext-perfil-avatar-wrap"><div id="ikaext-perfil-avatar">?</div></div>' +
          '<div id="ikaext-perfil-info">' +
            '<h2 id="ikaext-perfil-titulo">Perfil</h2>' +
            '<div id="ikaext-perfil-alianca-header"></div>' +
            '<div class="ikaext-tags" id="ikaext-perfil-tags"></div>' +
          '</div>' +
          '<span id="ikaext-perfil-marca">IkaGX</span>' +
          '<button id="ikaext-perfil-fechar">✕</button>' +
        '</div>' +
        '<div id="ikaext-perfil-corpo"></div>' +
        '<div id="ikaext-perfil-footer">' +
          '<button class="ikaext-btn-sec" id="ikaext-btn-copiar">📋 Copiar Dados</button>' +
          '<button class="ikaext-btn-sec" id="ikaext-btn-exportar-json">{ } Exportar JSON</button>' +
          '<button class="ikaext-btn-sec" id="ikaext-btn-exportar-csv">📄 Exportar CSV</button>' +
          '<button class="ikaext-btn-pri" id="ikaext-btn-fechar-det">↗ Fechar</button>' +
        '</div>' +
      '</div>'
    );

    overlay.append(modal).appendTo('body');

    overlay.on('click', function(e){ if($(e.target).is('#ikaext-perfil-overlay')) IkaLookup.fecharModal(); });
    $('#ikaext-perfil-fechar, #ikaext-perfil-back, #ikaext-btn-fechar-det').on('click', function(){ IkaLookup.fecharModal(); });
    $(document).on('keydown.ikagx', function(e){ if(e.key==='Escape') IkaLookup.fecharModal(); });
  },

  iniciar: function () {
    if (document.getElementById('ikaext-btn-perfil')) return;
    IkaLookup._criarModal();

    var t = setInterval(function () {
      var menu = $('#leftMenu .menu_slots');
      if (!menu.length) return;
      clearInterval(t);
      var item = $(
        '<li id="ikaext-btn-perfil" class="expandable" style="display:inline-block;width:53px;">' +
          '<div class="image image_constructionlist"></div>' +
          '<div class="name"><span class="namebox">Meu Perfil</span></div>' +
        '</li>'
      );
      item.on('click', function(){ IkaLookup.abrirModalServidor(); });
      menu.append(item);
    }, 300);
  },

  fecharModal: function () { $('#ikaext-perfil-overlay').removeClass('aberta'); },

  abrirModalServidor: function () {
    IkaLookup._criarModal();
    IkaLookup._setHeader('...', '', '', '');
    $('#ikaext-perfil-corpo').html('<p class="ikaext-sem-dados">Carregando...</p>');
    $('#ikaext-perfil-overlay').addClass('aberta');

    $.get('?view=avatarProfile&activeTab=tab_avatarProfile&ajax=1', function (resposta) {
      try {
        var perfil  = IkaLookup.parsearResposta(resposta);
        if (!perfil) throw new Error('vazio');
        var conta   = perfil['Nome'] || 'Desconhecido';
        var servidor = window.location.hostname.split('.')[0];

        var pendentes = 3, extras = {};
        function concluir() {
          pendentes--;
          if (pendentes > 0) return;
          $.extend(perfil, extras);
          IkaLog.salvarPerfil(servidor, conta, perfil);
          IkaLog.lerEmail(function(email){
            IkaLog.buscarPorEmail(servidor, email||'', function(regs){
              var mine = (regs||[]).filter(function(r){ return r.account===conta; });
              IkaLookup._renderizar(perfil, email||'', mine, servidor, conta);
            });
          });
        }
        IkaLookup._buscarComplementares(function(c){ if(c) $.extend(extras,c); concluir(); });
        IkaLookup._buscarPesquisas(function(p){ if(p) $.extend(extras,p); concluir(); });
        IkaLookup._buscarBarcos(function(b){ if(b) $.extend(extras,b); concluir(); });

      } catch(e) {
        $('#ikaext-perfil-corpo').html('<p class="ikaext-sem-dados">Erro ao carregar perfil.</p>');
      }
    }).fail(function(){ $('#ikaext-perfil-corpo').html('<p class="ikaext-sem-dados">Erro de conexão.</p>'); });
  },

  abrirModalLocal: function (servidor, conta, email, registros) {
    IkaLookup._criarModal();
    IkaLookup._setHeader(conta, '', servidor, '');
    $('#ikaext-perfil-corpo').html('<p class="ikaext-sem-dados">Carregando...</p>');
    $('#ikaext-perfil-overlay').addClass('aberta');

    IkaLog.lerPerfil(servidor, conta, function(perfil) {
      IkaLookup._renderizar(perfil||{}, email, registros||[], servidor, conta);
    });
  },

  _setHeader: function(conta, alianca, servidor, ranking) {
    var ini = conta ? conta.charAt(0).toUpperCase() : '?';
    $('#ikaext-perfil-avatar').text(ini);
    $('#ikaext-perfil-titulo').text(conta||'Perfil');
    $('#ikaext-perfil-alianca-header').html(alianca ? '👥 ' + alianca : '');
    var tags = $('#ikaext-perfil-tags').empty();
    if (servidor) tags.append('<span class="ikaext-tag">' + servidor.toUpperCase() + '</span>');
    if (ranking)  tags.append('<span class="ikaext-tag">Ranking #' + ranking + '</span>');
    tags.append('<span class="ikaext-tag verde">● Ativo</span>');
    IkaLookup._configurarBotoes(conta, alianca);
  },

  _renderizar: function(perfil, email, registros, servidor, conta) {
    // Atualiza header com dados reais
    var alianca  = perfil['Aliança']    || '';
    var ranking  = perfil['Localização']|| '';
    IkaLookup._setHeader(conta, alianca, servidor, ranking);

    var corpo = $('#ikaext-perfil-corpo').empty();

    // ── Estatísticas ──
    corpo.append('<div class="ikaext-secao">Estatísticas</div>');
    var statsGrid = $('<div class="ikaext-stats-grid">');
    var stats = [
      { label: 'Pontuação',          valor: perfil['Pontos'],               icone: '🏆' },
      { label: 'Mestres Alvenaria',  valor: perfil['Mestres de Alvenaria'], icone: '🏛️' },
      { label: 'Cientistas',         valor: perfil['Cientistas'],           icone: '🔬' },
      { label: 'Generais',           valor: perfil['Generais'],             icone: '⚔️' },
      { label: 'Ouro',               valor: perfil['Ouro'],                 icone: '💰' }
    ];
    stats.forEach(function(s){
      statsGrid.append(
        '<div class="ikaext-stat-card">' +
          '<div class="ikaext-stat-icone">' + s.icone + '</div>' +
          '<span class="ikaext-stat-valor">' + (s.valor||'—') + '</span>' +
          '<div class="ikaext-stat-label">' + s.label + '</div>' +
        '</div>'
      );
    });
    corpo.append(statsGrid);

    // ── Especializações ──
    var espec = [
      { chave: 'Pesquisa_Economia',           nome: 'Economia',  icone: '📈', cor: '#4ade80', max: 25 },
      { chave: 'Pesquisa_Navegação Marítima', nome: 'Náutica',   icone: '⚓', cor: '#60a5fa', max: 25 },
      { chave: 'Pesquisa_Ciência',            nome: 'Ciência',   icone: '🔭', cor: '#60a5fa', max: 25 },
      { chave: 'Pesquisa_Mitologia',          nome: 'Mitologia', icone: '👑', cor: '#C9A84C', max: 7  },
      { chave: 'Pesquisa_Militar',            nome: 'Militar',   icone: '⚡', cor: '#f87171', max: 25 }
    ];

    var temEspec = espec.some(function(e){ return !!perfil[e.chave]; });
    if (temEspec) {
      corpo.append('<div class="ikaext-secao">Especializações</div>');
      var especGrid = $('<div class="ikaext-espec-grid">');
      espec.forEach(function(e) {
        var raw   = perfil[e.chave] || '';
        if (!raw) return;
        // Extrai nível: "Futuro Econômico (7)" → 7
        var matchN = raw.match(/\((\d+)\)/);
        var nivel  = matchN ? parseInt(matchN[1]) : (raw === 'Máximo atingido' ? e.max : 0);
        var pct    = Math.min(100, Math.round(nivel / e.max * 100));
        var label  = matchN ? 'Nível ' + nivel : raw;

        especGrid.append(
          '<div class="ikaext-espec-item">' +
            '<div class="ikaext-espec-topo">' +
              '<span class="ikaext-espec-nome">' + e.icone + ' ' + e.nome + '</span>' +
              '<span class="ikaext-espec-nivel">' + label + '</span>' +
            '</div>' +
            '<div class="ikaext-barra-bg">' +
              '<div class="ikaext-barra-fill" style="width:' + pct + '%;background:' + e.cor + '"></div>' +
            '</div>' +
          '</div>'
        );
      });
      corpo.append(especGrid);
    }

    // ── Barcos ──
    var temBarcos = perfil['Barcos_TotalMercantes'] !== undefined || perfil['Barcos_TotalCargueiros'] !== undefined;
    if (temBarcos) {
      corpo.append('<div class="ikaext-secao">Frota</div>');
      var urls = IkaLookup._getUrlBarcos();

      var frotaWrap = $(
        '<div style="display:flex;align-items:center;gap:20px;padding:4px 0">'
      );

      var grid = $('<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;flex:1">');
      var barcos = [
        { img: urls.mercantes,          label: 'Mercantes',           valor: perfil['Barcos_Mercantes']          || 0 },
        { img: urls.cargueiros,         label: 'Cargueiros',          valor: perfil['Barcos_Cargueiros']         || 0 },
        { img: urls.mercantesFenicios,  label: 'Mercantes Fenícios',  valor: perfil['Barcos_MercantesFenicios']  || 0 },
        { img: urls.cargueirosFenicios, label: 'Cargueiros Fenícios', valor: perfil['Barcos_CargueirosFenicios'] || 0 }
      ];

      barcos.forEach(function(b) {
        grid.append(
          '<div class="ikaext-det-campo" style="text-align:center;padding:8px">' +
            '<img src="' + b.img + '" title="' + b.label + '" style="width:56px;height:56px;object-fit:contain;margin:0 auto 4px;display:block">' +
            '<div style="font-size:11px;color:#9A7A3A;margin-bottom:2px">' + b.label + '</div>' +
            '<div style="font-size:16px;font-weight:700;color:#C9A84C">' + b.valor + '</div>' +
          '</div>'
        );
      });
      frotaWrap.append(grid);

      // Totais à direita
      var totais = $(
        '<div style="display:flex;flex-direction:column;gap:10px;min-width:140px">' +
          '<div class="ikaext-det-campo" style="text-align:center;padding:10px 14px">' +
            '<div style="font-size:12px;color:#9A7A3A;margin-bottom:4px">⚓ Total Mercantes</div>' +
            '<div style="font-size:20px;font-weight:700;color:#C9A84C">' + (perfil['Barcos_TotalMercantes'] || 0) + '</div>' +
          '</div>' +
          '<div class="ikaext-det-campo" style="text-align:center;padding:10px 14px">' +
            '<div style="font-size:12px;color:#9A7A3A;margin-bottom:4px">⚓ Total Cargueiros</div>' +
            '<div style="font-size:20px;font-weight:700;color:#C9A84C">' + (perfil['Barcos_TotalCargueiros'] || 0) + '</div>' +
          '</div>' +
        '</div>'
      );
      frotaWrap.append(totais);
      corpo.append(frotaWrap);
    }

    // ── Identificação & Resumo ──
    var diasAtivos = '—';
    var govDesde   = perfil['Governante desde'] || '';
    var ultimoAcesso = registros.length > 0 ? registros[0] : null;
    if (govDesde && ultimoAcesso) {
      // Extrai data de govDesde: "28.09.2022 0:20:24"
      var partes = govDesde.split(' ')[0].split('.');
      if (partes.length === 3) {
        var dtCriacao = new Date(partes[2], partes[1]-1, partes[0]);
        var dtUltimo  = new Date(ultimoAcesso.timestamp * 1000);
        diasAtivos = Math.max(0, Math.floor((dtUltimo - dtCriacao) / 86400000)).toString();
      }
    }
    var ipsUnicos = [];
    registros.forEach(function(r){ if(ipsUnicos.indexOf(r.ip)===-1) ipsUnicos.push(r.ip); });

    corpo.append('<div class="ikaext-secao">Identificação & Resumo</div>');
    var idGrid = $('<div class="ikaext-id-grid">');

    // Campo de e-mail com botão ocultar/mostrar
    var emailReal   = email || '—';
    var emailOculto = emailReal !== '—' ? emailReal.replace(/./g, '•') : '—';
    var emailVisivel = false;
    var emailCard = $(
      '<div class="ikaext-id-card">' +
        '<div class="ikaext-id-label" style="justify-content:space-between">' +
          '<span>✉️ E-MAIL</span>' +
          '<button id="ikaext-toggle-email" style="background:none;border:none;cursor:pointer;font-size:12px;color:#9A7A3A;padding:0;line-height:1;" title="Mostrar/ocultar e-mail">👁</button>' +
        '</div>' +
        '<div class="ikaext-id-valor mono" id="ikaext-email-valor">' + emailOculto + '</div>' +
      '</div>'
    );
    emailCard.find('#ikaext-toggle-email').on('click', function(){
      emailVisivel = !emailVisivel;
      $('#ikaext-email-valor').text(emailVisivel ? emailReal : emailOculto);
      $(this).text(emailVisivel ? '🙈' : '👁');
    });
    idGrid.append(emailCard);

    var idCampos = [
      { label: '📅 GOV. DESDE',  valor: govDesde ? govDesde.split(' ')[0] : '—', mono: false },
      { label: '🌐 IPS ÚNICOS',  valor: ipsUnicos.length, ouro: true },
      { label: '📆 DIAS ATIVOS', valor: diasAtivos, ouro: true }
    ];
    idCampos.forEach(function(c){
      idGrid.append(
        '<div class="ikaext-id-card">' +
          '<div class="ikaext-id-label">' + c.label + '</div>' +
          '<div class="ikaext-id-valor' + (c.mono?' mono':'') + (c.ouro?' ouro':'') + '">' + c.valor + '</div>' +
        '</div>'
      );
    });
    corpo.append(idGrid);

    // ── Linha do Tempo ──
    var primeiroAcesso = registros.length > 0 ? registros[registros.length-1] : null;
    corpo.append('<div class="ikaext-secao">Linha do Tempo</div>');
    var tlGrid = $('<div class="ikaext-timeline-grid">');

    function fmtTs(ts) {
      if (!ts) return { data: '—', hora: '' };
      var d = new Date(ts * 1000);
      return {
        data: d.toLocaleDateString('pt-BR'),
        hora: d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      };
    }

    function tlCard(icone, label, ts) {
      var f = fmtTs(ts);
      return '<div class="ikaext-tl-card">' +
        '<div class="ikaext-tl-icone">' + icone + '</div>' +
        '<div class="ikaext-tl-label">' + label + '</div>' +
        '<div class="ikaext-tl-data">' + f.data + '</div>' +
        '<div class="ikaext-tl-hora">' + f.hora + '</div>' +
      '</div>';
    }

    // Conta criada vem do "Governante desde"
    var tsCriacao = null;
    if (govDesde) {
      var partesCr = govDesde.split(' ');
      var dp = partesCr[0].split('.');
      if (dp.length===3) {
        var horaCr = partesCr[1] ? partesCr[1].split(':') : [0,0,0];
        tsCriacao = Math.floor(new Date(dp[2], dp[1]-1, dp[0], horaCr[0]||0, horaCr[1]||0, horaCr[2]||0).getTime()/1000);
      }
    }

    tlGrid.append(tlCard('📅', 'Conta Criada',    tsCriacao));
    tlGrid.append(tlCard('🕐', '1º Acesso',       primeiroAcesso ? primeiroAcesso.timestamp : null));
    tlGrid.append(tlCard('🕐', 'Último Acesso',   ultimoAcesso   ? ultimoAcesso.timestamp   : null));
    corpo.append(tlGrid);

    // ── Império ──
    corpo.append('<div class="ikaext-secao">Império</div>');
    var empDiv = $('<div id="ikaext-perfil-imperio">');
    corpo.append(empDiv);
    IkaLookup._renderizarImperio(empDiv, servidor, conta);

    // ── Histórico de IPs ──
    corpo.append('<div class="ikaext-secao">Histórico de IPs</div>');

    if (!registros.length) {
      corpo.append('<p class="ikaext-sem-dados">Nenhum acesso registrado.</p>');
      return;
    }

    var tabela = $(
      '<table class="ikaext-ip-tabela">' +
        '<thead><tr><th>Status</th><th>Endereço IP</th><th>Data / Hora</th></tr></thead>' +
        '<tbody></tbody>' +
      '</table>'
    );
    var tbody  = tabela.find('tbody');
    var ipsVis = {};

    registros.forEach(function(reg, idx) {
      if (ipsVis[reg.ip]) return;
      ipsVis[reg.ip] = true;
      var isAtual = idx === 0;
      var data    = new Date(reg.timestamp * 1000).toLocaleString('pt-BR');
      tbody.append(
        '<tr>' +
          '<td><span class="ikaext-status-dot ' + (isAtual?'atual':'anterior') + '"></span>' +
            '<span class="ikaext-status-txt">' + (isAtual?'Atual':'Anterior') + '</span></td>' +
          '<td><span class="ikaext-ip-badge-leve">' + reg.ip + '</span></td>' +
          '<td style="font-family:\'JetBrains Mono\',monospace;font-size:11px;color:#6B4E1A">' + data + '</td>' +
        '</tr>'
      );
    });
    corpo.append(tabela);
  },

  _renderizarImperio: function(empDiv, servidor, conta) {
    empDiv.html('<p class="ikaext-sem-dados">Carregando...</p>');
    if (typeof IkaEmpire !== 'undefined' && IkaEmpire._criarModal) IkaEmpire._criarModal();

    IkaLog.lerImperio(servidor, conta, function(imp) {
      if (!imp || !imp.cidades || !imp.cidades.length || typeof IkaEmpire === 'undefined') {
        empDiv.html('<p class="ikaext-sem-dados">Sem dados de império salvos para esta conta.</p>');
        return;
      }

      var quando = imp.coletadoEm ? new Date(imp.coletadoEm).toLocaleString('pt-BR') : '-';
      empDiv.html(
        '<div class="ikaext-imp-topo">' +
          '<span class="ikaext-imp-resumo">' + imp.cidades.length + ' cidade(s) · ' + quando + '</span>' +
          '<div class="ikaext-imp-abas">' +
            '<button class="ikaext-btn-sec ikaext-imp-aba ativa" data-aba="recursos">Recursos</button>' +
            '<button class="ikaext-btn-sec ikaext-imp-aba" data-aba="edificios">Edifícios</button>' +
            '<button class="ikaext-btn-sec ikaext-imp-aba" data-aba="inventario">Inventário</button>' +
            '<button class="ikaext-btn-sec" id="ikaext-imp-abrir">↗ Abrir</button>' +
          '</div>' +
        '</div>' +
        '<div class="ikaext-imp-scroll" id="ikaext-imp-tabela"></div>'
      );

      function pinta(aba) {
        var html;
        if (aba === 'edificios') {
          html = IkaEmpire._renderEdificios(imp.cidades);
        } else if (aba === 'inventario') {
          html = IkaEmpire._renderInventario(imp.inventario || []);
        } else {
          html = IkaEmpire._renderRecursos(imp.cidades);
        }
        $('#ikaext-imp-tabela').html(html);
        empDiv.find('.ikaext-imp-aba').each(function() {
          $(this).toggleClass('ativa', $(this).data('aba') === aba);
        });
      }

      empDiv.find('.ikaext-imp-aba').on('click', function() { pinta($(this).data('aba')); });
      empDiv.find('#ikaext-imp-abrir').on('click', function() {
        IkaLookup.fecharModal();
        IkaEmpire.abrirLocal(servidor, conta, 'perfil');
      });
      pinta('recursos');
    });
  },

  _configurarBotoes: function(conta, alianca) {
    $('#ikaext-btn-copiar').off('click').on('click', function(){
      navigator.clipboard.writeText('Conta: ' + conta + '\nAliança: ' + alianca).catch(function(){});
    });
    $('#ikaext-btn-exportar-json').off('click').on('click', function(){
      IkaLog.lerPerfil(window.location.hostname.split('.')[0], conta, function(p){
        var blob = new Blob([JSON.stringify(p||{}, null, 2)], {type:'application/json'});
        var a = document.createElement('a'); a.href = URL.createObjectURL(blob);
        a.download = 'ikagx-' + conta + '.json'; a.click();
      });
    });
    $('#ikaext-btn-exportar-csv').off('click').on('click', function(){
      var linhas = ['IP,Data/Hora'];
      $('#ikaext-perfil-corpo .ikaext-ip-tabela tbody tr').each(function(){
        var ip   = $(this).find('.ikaext-ip-badge-leve').text();
        var data = $(this).find('td:last').text();
        linhas.push(ip + ',' + data);
      });
      var blob = new Blob([linhas.join('\n')], {type:'text/csv'});
      var a = document.createElement('a'); a.href = URL.createObjectURL(blob);
      a.download = 'ikagx-' + conta + '.csv'; a.click();
    });
  },

  _buscarComplementares: function(cb) {
    var titulo = $('#js_citySelectContainer .dropDownButton a').attr('title');
    var cityId = $('#dropDown_js_citySelectContainer a[title="' + titulo + '"]').closest('li').attr('selectvalue');
    if (!cityId) { cb(null); return; }
    $.get('?view=cityDetails&isMission=1&destinationCityId=' + cityId + '&ajax=1', function(r){
      try {
        var json = typeof r==='string' ? JSON.parse(r) : r, dados = {};
        for (var i=0;i<json.length;i++) {
          if (json[i][0]==='updateTemplateData') {
            var t = json[i][1];
            if (t['js_selectedCityScoreBuildings']) dados['Mestres de Alvenaria'] = t['js_selectedCityScoreBuildings'].text;
            if (t['js_selectedCityScoreResearch'])  dados['Cientistas']            = t['js_selectedCityScoreResearch'].text;
            if (t['js_selectedCityScoreArmy'])      dados['Generais']              = t['js_selectedCityScoreArmy'].text;
            if (t['js_selectedCityScoreGold'])      dados['Ouro']                  = t['js_selectedCityScoreGold'].text;
            break;
          }
        }
        cb(Object.keys(dados).length ? dados : null);
      } catch(e) { cb(null); }
    }).fail(function(){ cb(null); });
  },

  _buscarBarcos: function(cb) {
    var titulo = $('#js_citySelectContainer .dropDownButton a').attr('title');
    var cityId = $('#dropDown_js_citySelectContainer a[title="' + titulo + '"]').closest('li').attr('selectvalue');
    if (!cityId) { cb(null); return; }

    $.get('?view=port&cityId=' + cityId + '&position=2&ajax=1&activeTab=tabBuyTransporter', function(data) {
      try {
        var json = typeof data === 'string' ? JSON.parse(data) : data;

        var tpl = null;
        for (var i = 0; i < json.length; i++) {
          if (Array.isArray(json[i]) && json[i][0] === 'updateTemplateData') { tpl = json[i][1]; break; }
        }
        if (!tpl && json[2] && json[2][1]) tpl = json[2][1];
        if (!tpl) { cb(null); return; }

        var mercantes         = parseInt(tpl.bonusShipTableTransporters && tpl.bonusShipTableTransporters.text, 10) || 0;
        var mercantesFenicios = parseInt(tpl.bonusShipTablePhoenicianTransporters && tpl.bonusShipTablePhoenicianTransporters.text, 10) || 0;
        var cargueiros         = tpl.bonusShipTableFreighters              !== undefined ? parseInt(tpl.bonusShipTableFreighters, 10) || 0 : 0;
        var cargueirosFenicios = tpl.js_bonusShipTablePhoenicianFreighters !== undefined ? parseInt(tpl.js_bonusShipTablePhoenicianFreighters, 10) || 0 : 0;

        cb({
          'Barcos_Mercantes':          mercantes,
          'Barcos_MercantesFenicios':  mercantesFenicios,
          'Barcos_TotalMercantes':     mercantes + mercantesFenicios,
          'Barcos_Cargueiros':         cargueiros,
          'Barcos_CargueirosFenicios': cargueirosFenicios,
          'Barcos_TotalCargueiros':    cargueiros + cargueirosFenicios
        });
      } catch(e) { cb(null); }
    }, 'json').fail(function(){ cb(null); });
  },

  _buscarPesquisas: function(cb) {
    var titulo = $('#js_citySelectContainer .dropDownButton a').attr('title');
    var cityId = $('#dropDown_js_citySelectContainer a[title="' + titulo + '"]').closest('li').attr('selectvalue');
    if (!cityId) { cb(null); return; }
    $.get('?view=researchAdvisor&oldView=city&backgroundView=city&currentCityId=' + cityId + '&ajax=1', function(r){
      try {
        var json = typeof r==='string' ? JSON.parse(r) : r, dados = {};
        for (var i=0;i<json.length;i++) {
          if (json[i][0]==='updateTemplateData') {
            var t = json[i][1];
            for (var idx=0;idx<=4;idx++) {
              var nome = t['js_researchAdvisorChangeResearchTypeTxt'+idx];
              var prox = t['js_researchAdvisorNextResearchName'+idx];
              if (nome) dados['Pesquisa_'+nome] = prox || 'Máximo atingido';
            }
            break;
          }
        }
        cb(Object.keys(dados).length ? dados : null);
      } catch(e) { cb(null); }
    }).fail(function(){ cb(null); });
  },

  parsearResposta: function(resposta) {
    var json = typeof resposta==='string' ? JSON.parse(resposta) : resposta;
    var html = '';
    for (var i=0;i<json.length;i++) {
      if (json[i][0]==='changeView' && json[i][1] && json[i][1][1]) { html=json[i][1][1]; break; }
    }
    if (!html) return null;
    var doc = $('<div>').html(html), dados = {};
    doc.find('.profileTable tr').each(function(){
      var c = $(this).find('td');
      if (c.length<2) return;
      var rot = $(c[0]).text().trim().replace(':','');
      if ($(c[1]).find('select').length) return;
      var val = $(c[1]).find('.avatarName').length ? $(c[1]).find('.avatarName').text().trim() : $(c[1]).text().trim();
      if (rot && val) dados[rot] = val;
    });
    return Object.keys(dados).length ? dados : null;
  }
};
