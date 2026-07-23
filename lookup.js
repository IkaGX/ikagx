/**
 * IkaGX - lookup.js
 * Modal de detalhes da conta — tema bege/dourado (light)
 */

var IkaLookup = {

  _criarModal: function () {
    if (document.getElementById('ikaext-perfil-overlay')) return;

    var css = `
      @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

      #ikaext-perfil-overlay {
        display: none; position: fixed; inset: 0;
        background: rgba(50,30,0,0.55); backdrop-filter: blur(4px);
        z-index: 10001; justify-content: center; align-items: center;
        font-family: Inter, sans-serif;
      }
      #ikaext-perfil-overlay.aberta { display: flex; }

      #ikaext-perfil-modal {
        background: #F5EDD6; border-radius: 16px;
        width: 560px; max-width: 96vw; max-height: 90vh;
        display: flex; flex-direction: column;
        border: 1.5px solid rgba(139,105,20,0.2);
        box-shadow: 0 12px 40px rgba(100,70,0,0.22);
        animation: ikaPerfFade 0.18s ease; overflow: hidden;
      }
      @keyframes ikaPerfFade { from{opacity:0;transform:scale(0.96)} to{opacity:1;transform:scale(1)} }

      /* ── Header ── */
      #ikaext-perfil-header {
        padding: 16px 20px; border-bottom: 1px solid rgba(139,105,20,0.15);
        display: flex; align-items: center; gap: 14px; background: #EDE0BE; position: relative;
      }
      #ikaext-perfil-back {
        background: #E5D5A8; border: 1px solid rgba(139,105,20,0.2);
        border-radius: 8px; width: 30px; height: 30px; cursor: pointer;
        color: #8B6914; font-size: 14px; display: flex;
        align-items: center; justify-content: center; flex-shrink: 0;
      }
      #ikaext-perfil-back:hover { background: #D9C898; }
      #ikaext-perfil-avatar-wrap { position: relative; flex-shrink: 0; }
      #ikaext-perfil-avatar {
        width: 60px; height: 60px; border-radius: 50%;
        background: #E5D5A8; border: 2.5px solid #C9A84C;
        display: flex; align-items: center; justify-content: center;
        font-size: 24px; font-weight: 700; color: #8B6914;
      }
      #ikaext-perfil-info { flex: 1; min-width: 0; }
      #ikaext-perfil-titulo {
        font-family: 'Cinzel', serif; font-size: 18px; font-weight: 600;
        color: #3D2B00; margin: 0; letter-spacing: 0.02em;
      }
      #ikaext-perfil-alianca-header { font-size: 12px; color: #6B4E1A; margin: 2px 0 6px; display: flex; align-items: center; gap: 4px; }
      .ikaext-tags { display: flex; gap: 6px; flex-wrap: wrap; }
      .ikaext-tag {
        border-radius: 20px; padding: 2px 10px; font-size: 11px; font-weight: 500;
        background: #E5D5A8; border: 1px solid rgba(139,105,20,0.25); color: #6B4E1A;
      }
      .ikaext-tag.verde { background: rgba(74,222,128,0.15); border-color: #4ade80; color: #166534; }
      #ikaext-perfil-marca { position: absolute; right: 52px; top: 16px; font-family: 'Cinzel', serif; font-size: 11px; color: #9A7A3A; letter-spacing: 0.08em; }
      #ikaext-perfil-fechar {
        background: #E5D5A8; border: 1px solid rgba(139,105,20,0.2);
        border-radius: 8px; width: 28px; height: 28px; cursor: pointer;
        color: #9A7A3A; font-size: 14px; display: flex; align-items: center; justify-content: center;
      }
      #ikaext-perfil-fechar:hover { color: #8B6914; border-color: #C9A84C; }

      /* ── Corpo ── */
      #ikaext-perfil-corpo { overflow-y: auto; padding: 16px 20px; flex: 1; scrollbar-width: none; }
      #ikaext-perfil-corpo::-webkit-scrollbar { display: none; }

      /* Títulos de seção */
      .ikaext-secao {
        font-size: 10px; font-weight: 600; color: #9A7A3A; text-transform: uppercase;
        letter-spacing: 0.1em; text-align: center; margin: 14px 0 8px;
      }

      /* Cards de estatísticas */
      .ikaext-stats-grid { display: grid; grid-template-columns: repeat(5,1fr); gap: 6px; margin-bottom: 4px; }
      .ikaext-stat-card {
        background: #EDE0BE; border: 1px solid rgba(139,105,20,0.15);
        border-radius: 10px; padding: 10px 6px; text-align: center;
      }
      .ikaext-stat-card:hover { border-color: #C9A84C; }
      .ikaext-stat-icone { font-size: 16px; margin-bottom: 4px; }
      .ikaext-stat-valor { font-size: 13px; font-weight: 700; color: #8B6914; display: block; }
      .ikaext-stat-label { font-size: 9px; color: #9A7A3A; text-transform: uppercase; letter-spacing: 0.04em; margin-top: 2px; }

      /* Especializações */
      .ikaext-espec-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
      .ikaext-espec-item { background: #EDE0BE; border: 1px solid rgba(139,105,20,0.15); border-radius: 10px; padding: 10px 12px; }
      .ikaext-espec-topo { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
      .ikaext-espec-nome { font-size: 12px; font-weight: 600; color: #3D2B00; display: flex; align-items: center; gap: 5px; }
      .ikaext-espec-nivel { font-size: 11px; color: #8B6914; font-weight: 600; }
      .ikaext-barra-bg { height: 4px; background: rgba(139,105,20,0.15); border-radius: 4px; overflow: hidden; }
      .ikaext-barra-fill { height: 100%; border-radius: 4px; transition: width 0.4s; }

      /* Identificação */
      .ikaext-id-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 6px; }
      .ikaext-id-card {
        background: #EDE0BE; border: 1px solid rgba(139,105,20,0.15);
        border-radius: 10px; padding: 10px 10px 8px;
      }
      .ikaext-id-label { font-size: 9px; color: #9A7A3A; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; display: flex; align-items: center; gap: 4px; }
      .ikaext-id-valor { font-size: 12px; font-weight: 600; color: #3D2B00; }
      .ikaext-id-valor.mono { font-family: 'JetBrains Mono', monospace; font-size: 11px; }
      .ikaext-id-valor.ouro { color: #8B6914; font-size: 15px; }

      /* Linha do tempo */
      .ikaext-timeline-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 6px; }
      .ikaext-tl-card {
        background: #EDE0BE; border: 1px solid rgba(139,105,20,0.15);
        border-radius: 10px; padding: 12px; text-align: center;
      }
      .ikaext-tl-icone { font-size: 20px; margin-bottom: 6px; color: #C9A84C; }
      .ikaext-tl-label { font-size: 9px; color: #9A7A3A; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
      .ikaext-tl-data { font-size: 13px; font-weight: 700; color: #3D2B00; }
      .ikaext-tl-hora { font-size: 11px; color: #9A7A3A; font-family: 'JetBrains Mono', monospace; }

      /* Tabela de IPs */
      .ikaext-ip-tabela { width: 100%; border-collapse: collapse; background: #EDE0BE; border-radius: 10px; overflow: hidden; }
      .ikaext-ip-tabela th { font-size: 10px; color: #9A7A3A; text-transform: uppercase; padding: 8px 12px; text-align: left; border-bottom: 1px solid rgba(139,105,20,0.15); }
      .ikaext-ip-tabela td { padding: 8px 12px; border-bottom: 1px solid rgba(139,105,20,0.08); vertical-align: middle; font-size: 12px; color: #3D2B00; }
      .ikaext-ip-tabela tr:last-child td { border-bottom: none; }
      .ikaext-ip-tabela tr:hover td { background: rgba(201,168,76,0.07); }
      .ikaext-status-dot { width: 7px; height: 7px; border-radius: 50%; display: inline-block; margin-right: 5px; }
      .ikaext-status-dot.atual    { background: #4ade80; }
      .ikaext-status-dot.anterior { background: #9A7A3A; }
      .ikaext-status-txt { font-size: 11px; font-weight: 500; }
      .ikaext-ip-badge-leve {
        font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 600;
        color: #8B6914; background: rgba(201,168,76,0.15);
        border: 1px solid rgba(201,168,76,0.35); border-radius: 5px; padding: 2px 8px;
      }

      /* Footer */
      #ikaext-perfil-footer {
        padding: 12px 20px; border-top: 1px solid rgba(139,105,20,0.15);
        display: flex; gap: 8px; align-items: center; background: #EDE0BE;
      }
      .ikaext-btn-sec {
        background: #E5D5A8; border: 1px solid rgba(139,105,20,0.2);
        border-radius: 8px; padding: 7px 14px; font-size: 12px; font-weight: 500;
        color: #6B4E1A; cursor: pointer; font-family: Inter, sans-serif;
        display: flex; align-items: center; gap: 5px;
      }
      .ikaext-btn-sec:hover { border-color: #C9A84C; color: #3D2B00; }
      .ikaext-btn-pri {
        margin-left: auto; background: #C9A84C; border: none;
        border-radius: 8px; padding: 7px 20px; font-size: 12px; font-weight: 700;
        color: #3D2B00; cursor: pointer; font-family: Inter, sans-serif;
        display: flex; align-items: center; gap: 5px;
      }
      .ikaext-btn-pri:hover { background: #B8962E; }

      .ikaext-sem-dados { text-align:center; padding:30px; color:#9A7A3A; font-style:italic; font-size:13px; }

      /* Império embutido */
      .ikaext-imp-topo { display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:8px; }
      .ikaext-imp-resumo { font-size:11px; color:#9A7A3A; flex:1; min-width:120px; }
      .ikaext-imp-abas { display:flex; gap:6px; }
      .ikaext-imp-aba.ativa { background:#C9A84C; color:#3D2B00; border-color:#C9A84C; font-weight:700; }
      .ikaext-imp-scroll { overflow-x:auto; max-width:100%; border:1px solid rgba(139,105,20,0.15); border-radius:10px; }
      .ikaext-imp-scroll::-webkit-scrollbar { height:8px; }
      .ikaext-imp-scroll::-webkit-scrollbar-thumb { background:#C9A84C; border-radius:6px; }
    `;

    $('<style id="ikaext-estilos-perfil">').text(css).appendTo('head');

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

        var pendentes = 2, extras = {};
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
            '<button class="ikaext-btn-sec" id="ikaext-imp-abrir">↗ Abrir</button>' +
          '</div>' +
        '</div>' +
        '<div class="ikaext-imp-scroll" id="ikaext-imp-tabela"></div>'
      );

      function pinta(aba) {
        $('#ikaext-imp-tabela').html(aba === 'edificios'
          ? IkaEmpire._renderEdificios(imp.cidades)
          : IkaEmpire._renderRecursos(imp.cidades));
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
