/**
 * IkaGX - empire.js
 * Extracao de edificios/recursos de todas as cidades + modal (Imperio).
 * Tema bege/dourado (light), mesmo padrao do lookup.js / modal.js.
 */

var IkaEmpire = {

  _ordinalRecurso: { '1': 'wine', '2': 'marble', '3': 'glass', '4': 'sulfur', '5': 'wood' },
  _rotuloRecurso:  { wood: 'Madeira', wine: 'Vinho', marble: 'Marmore', glass: 'Cristal', sulfur: 'Enxofre' },

  _dados: null,
  _carregando: false,
  _abaAtiva: 'recursos',
  _somenteLeitura: false,
  _origem: null, // 'lobby' | 'perfil' — controla destino do botão Voltar

  /* ============================ init ============================ */

  iniciar: function () {
    if (document.getElementById('ikaext-btn-empire')) return;
    IkaEmpire._criarModal();

    var t = setInterval(function () {
      var menu = $('#leftMenu .menu_slots');
      if (!menu.length) return;
      clearInterval(t);
      var item = $(
        '<li id="ikaext-btn-empire" class="expandable" style="display:inline-block;width:53px;">' +
          '<div class="image image_cityoverview"></div>' +
          '<div class="name"><span class="namebox">Imperio</span></div>' +
        '</li>'
      );
      item.on('click', function () { IkaEmpire.abrirModal(); });
      menu.append(item);
    }, 300);
  },

  // Lobby: botao flutuante para navegar nos imperios salvos por conta/servidor.
  iniciarLobby: function () {
    IkaEmpire._criarModal();
    // Botão removido do lobby — modal acessível apenas pelo jogo
  },

  /* ============================ modal ============================ */

  _criarModal: function () {
    if (document.getElementById('ikaext-empire-overlay')) return;

    var css = `
      #ikaext-empire-overlay {
        display: none; position: fixed; inset: 0;
        background: rgba(50,30,0,0.55); backdrop-filter: blur(4px);
        z-index: 10001; justify-content: center; align-items: center;
        font-family: Inter, sans-serif;
      }
      #ikaext-empire-overlay.aberta { display: flex; }

      #ikaext-empire-modal {
        background: #F5EDD6; border-radius: 16px;
        width: 1180px; max-width: 96vw; max-height: 90vh;
        display: flex; flex-direction: column;
        border: 1.5px solid rgba(139,105,20,0.2);
        box-shadow: 0 12px 40px rgba(100,70,0,0.22);
        animation: ikaEmpFade 0.18s ease; overflow: hidden;
      }
      @keyframes ikaEmpFade { from{opacity:0;transform:scale(0.96)} to{opacity:1;transform:scale(1)} }

      #ikaext-empire-header {
        padding: 14px 20px; border-bottom: 1px solid rgba(139,105,20,0.15);
        display: flex; align-items: center; gap: 12px; background: #EDE0BE; position: relative;
      }
      #ikaext-empire-titulo {
        font-family: 'Cinzel', serif; font-size: 18px; font-weight: 600;
        color: #3D2B00; margin: 0; letter-spacing: 0.02em; margin-right: auto;
      }
      #ikaext-empire-marca { font-family: 'Cinzel', serif; font-size: 11px; color: #9A7A3A; letter-spacing: 0.08em; margin-right: 6px; }
      #ikaext-empire-fechar {
        background: #E5D5A8; border: 1px solid rgba(139,105,20,0.2);
        border-radius: 8px; width: 28px; height: 28px; cursor: pointer;
        color: #9A7A3A; font-size: 14px; display: flex; align-items: center; justify-content: center;
      }
      #ikaext-empire-fechar:hover { color: #8B6914; border-color: #C9A84C; }

      .ikaext-empire-btn {
        background: #E5D5A8; border: 1px solid rgba(139,105,20,0.2);
        border-radius: 8px; padding: 6px 12px; font-size: 12px; font-weight: 500;
        color: #6B4E1A; cursor: pointer; font-family: Inter, sans-serif;
      }
      .ikaext-empire-btn:hover { border-color: #C9A84C; color: #3D2B00; }

      #ikaext-empire-abas { display: flex; gap: 6px; padding: 10px 20px 0; background: #EDE0BE; }
      .ikaext-empire-aba {
        padding: 7px 18px; border: 1px solid rgba(139,105,20,0.2); border-bottom: none;
        border-radius: 8px 8px 0 0; cursor: pointer; font-size: 13px; font-weight: 500;
        background: #E5D5A8; color: #6B4E1A;
      }
      .ikaext-empire-aba.ativa { background: #F5EDD6; color: #3D2B00; font-weight: 700; }

      #ikaext-empire-status { padding: 6px 20px; font-size: 11px; color: #9A7A3A; min-height: 14px; }

      #ikaext-empire-corpo { overflow: auto; padding: 0 20px 18px; flex: 1; }
      #ikaext-empire-corpo::-webkit-scrollbar { height: 10px; width: 10px; }
      #ikaext-empire-corpo::-webkit-scrollbar-thumb { background: #C9A84C; border-radius: 6px; }

      .ikaext-empire-vazio { text-align: center; padding: 40px; color: #9A7A3A; font-style: italic; }

      .ikaext-empire-tabela { border-collapse: collapse; font-size: 12px; width: 100%; background: #F5EDD6; }
      .ikaext-empire-tabela th, .ikaext-empire-tabela td {
        border: 1px solid rgba(139,105,20,0.18); padding: 4px 8px; text-align: right; white-space: nowrap; color: #3D2B00;
      }
      .ikaext-empire-tabela th { background: #EDE0BE; position: sticky; top: 0; z-index: 2; color: #6B4E1A; font-weight: 600; }
      .ikaext-empire-tabela td.ikaext-empire-cidade, .ikaext-empire-tabela th.ikaext-empire-cidade {
        position: sticky; left: 0; text-align: left; background: #EDE0BE; z-index: 1; font-weight: 600;
      }
      .ikaext-empire-tabela th.ikaext-empire-cidade { z-index: 3; }
      .ikaext-empire-tabela tbody tr:hover td { background: rgba(201,168,76,0.08); }
      .ikaext-empire-prod { color: #2e7d32; font-size: 10px; margin-left: 4px; }
      .ikaext-res-icon { width: 20px; height: 20px; vertical-align: middle; display: block; margin: 0 auto; }

      /* Building sprite icons in header */
      th.ikagx-emp-building { width: 45px; padding: 2px 1px !important; text-align: center; }
      th.ikagx-emp-building div { height: 41px; width: 43px; background-repeat: no-repeat; margin: 0 auto; }
      .ikagx-emp-building-townHall div       { background-position: 0 0; }
      .ikagx-emp-building-academy div        { background-position: -43px 0; }
      .ikagx-emp-building-warehouse div      { background-position: -86px 0; }
      .ikagx-emp-building-tavern div         { background-position: -129px 0; }
      .ikagx-emp-building-palace div         { background-position: -172px 0; }
      .ikagx-emp-building-palaceColony div   { background-position: -215px 0; }
      .ikagx-emp-building-museum div         { background-position: -258px 0; }
      .ikagx-emp-building-port div           { background-position: -301px 0; }
      .ikagx-emp-building-shipyard div       { background-position: -345px 0; }
      .ikagx-emp-building-barracks div       { background-position: -388px 0; }
      .ikagx-emp-building-wall div           { background-position: -431px 0; }
      .ikagx-emp-building-embassy div        { background-position: -474px 0; }
      .ikagx-emp-building-branchOffice div   { background-position: -517px 0; }
      .ikagx-emp-building-workshop div       { background-position: -560px 0; }
      .ikagx-emp-building-safehouse div      { background-position: -603px 0; }
      .ikagx-emp-building-forester div       { background-position: -646px 0; }
      .ikagx-emp-building-glassblowing div   { background-position: -689px 0; }
      .ikagx-emp-building-alchemist div      { background-position: -733px 0; }
      .ikagx-emp-building-winegrower div     { background-position: -776px 0; }
      .ikagx-emp-building-stonemason div     { background-position: -819px 0; }
      .ikagx-emp-building-carpentering div   { background-position: -862px 0; }
      .ikagx-emp-building-optician div       { background-position: -905px 0; }
      .ikagx-emp-building-fireworker div     { background-position: -948px 0; }
      .ikagx-emp-building-vineyard div       { background-position: -991px 0; }
      .ikagx-emp-building-architect div      { background-position: -1034px 0; }
      .ikagx-emp-building-temple div         { background-position: -1077px 0; }
      .ikagx-emp-building-dump div           { background-position: -1121px 0; }
      .ikagx-emp-building-pirateFortress div { background-position: -1164px 0; }
      .ikagx-emp-building-blackMarket div    { background-position: -1207px 0; }
      .ikagx-emp-building-marineChartArchive div { background-position: -1297px 0; }
      .ikagx-emp-building-shrineOfOlympus div { background-position: -1250px 0; }

      .ikaext-empire-srv { font-family: 'Cinzel', serif; font-size: 13px; color: #9A7A3A; text-transform: uppercase; letter-spacing: 0.08em; margin: 16px 0 8px; }
      .ikaext-empire-item {
        display: flex; align-items: center; gap: 12px; padding: 10px 14px; margin-bottom: 6px;
        background: #EDE0BE; border: 1px solid rgba(139,105,20,0.15); border-radius: 10px; cursor: pointer;
      }
      .ikaext-empire-item:hover { border-color: #C9A84C; background: #E5D5A8; }
      .ikaext-empire-item-av {
        width: 34px; height: 34px; border-radius: 50%; flex-shrink: 0; background: #E5D5A8;
        border: 1.5px solid #C9A84C; display: flex; align-items: center; justify-content: center;
        font-size: 14px; font-weight: 700; color: #8B6914;
      }
      .ikaext-empire-item-info { flex: 1; min-width: 0; }
      .ikaext-empire-item-nome { font-size: 13px; font-weight: 600; color: #3D2B00; }
      .ikaext-empire-item-meta { font-size: 11px; color: #9A7A3A; }
      .ikaext-empire-item-seta { color: #9A7A3A; font-size: 16px; }

      #ikaext-btn-imperios {
        position: fixed; bottom: 20px; right: 190px; z-index: 9999;
        background: #EDE0BE; color: #8B6914;
        border: 1px solid rgba(139,105,20,0.2); border-radius: 8px;
        padding: 9px 16px; font-size: 13px; cursor: pointer;
        font-family: Inter, sans-serif; font-weight: 600;
        box-shadow: 0 8px 32px rgba(100,70,0,0.18);
      }
      #ikaext-btn-imperios:hover { background: #E5D5A8; }
    `;

    $('<style id="ikaext-empire-estilos">').text(css).appendTo('head');

    var overlay = $('<div id="ikaext-empire-overlay">');
    var modal = $(
      '<div id="ikaext-empire-modal">' +
        '<div id="ikaext-empire-header">' +
          '<button class="ikaext-empire-btn" id="ikaext-empire-voltar" style="display:none;">\u2190 Voltar</button>' +
          '<h2 id="ikaext-empire-titulo">Imperio</h2>' +
          '<button class="ikaext-empire-btn" id="ikaext-empire-atualizar">Atualizar</button>' +
          '<button class="ikaext-empire-btn" id="ikaext-empire-json">{ } JSON</button>' +
          '<span id="ikaext-empire-marca">IkaGX</span>' +
          '<button id="ikaext-empire-fechar">\u2715</button>' +
        '</div>' +
        '<div id="ikaext-empire-abas">' +
          '<div class="ikaext-empire-aba ativa" data-aba="recursos">Recursos</div>' +
          '<div class="ikaext-empire-aba" data-aba="edificios">Edificios</div>' +
        '</div>' +
        '<div id="ikaext-empire-status"></div>' +
        '<div id="ikaext-empire-corpo"></div>' +
      '</div>'
    );

    overlay.append(modal).appendTo('body');

    overlay.on('click', function (e) { if ($(e.target).is('#ikaext-empire-overlay')) IkaEmpire.fecharModal(); });
    $('#ikaext-empire-fechar').on('click', function () { IkaEmpire.fecharModal(); });
    $(document).on('keydown.ikaempire', function (e) { if (e.key === 'Escape') IkaEmpire.fecharModal(); });
    $('#ikaext-empire-atualizar').on('click', function () { IkaEmpire.coletar(); });
    $('#ikaext-empire-json').on('click', function () { IkaEmpire._exportarJson(); });
    $('#ikaext-empire-voltar').on('click', function () {
      if (IkaEmpire._origem === 'perfil') {
        IkaEmpire.fecharModal();
        $('#ikaext-perfil-overlay').addClass('aberta');
      } else {
        IkaEmpire.abrirLobby();
      }
    });

    modal.find('.ikaext-empire-aba').on('click', function () {
      IkaEmpire._abaAtiva = $(this).data('aba');
      modal.find('.ikaext-empire-aba').each(function () {
        $(this).toggleClass('ativa', $(this).data('aba') === IkaEmpire._abaAtiva);
      });
      IkaEmpire._render();
    });
  },

  _modoInteracao: function () {
    IkaEmpire._somenteLeitura = false;
    $('#ikaext-empire-atualizar').show();
    $('#ikaext-empire-voltar').hide();
    $('#ikaext-empire-titulo').text('Imperio');
  },

  _modoLeitura: function (titulo) {
    IkaEmpire._somenteLeitura = true;
    $('#ikaext-empire-atualizar').hide();
    $('#ikaext-empire-voltar').show();
    $('#ikaext-empire-titulo').text(titulo || 'Imperio');
  },

  abrirModal: function () {
    IkaEmpire._criarModal();
    IkaEmpire._modoInteracao();
    $('#ikaext-empire-json').show();
    $('#ikaext-empire-abas').show();
    $('#ikaext-empire-overlay').addClass('aberta');

    if (IkaEmpire._dados) { IkaEmpire._render(); return; }
    if (IkaEmpire._carregando) { IkaEmpire._render(); return; }

    // Sem dados em memoria: tenta o ultimo snapshot salvo desta conta; senao, coleta.
    IkaEmpire._render();
    IkaLog.lerImperio(IkaEmpire._servidorAtual(), IkaEmpire._contaAtual(), function (salvo) {
      if (salvo && !IkaEmpire._dados && !IkaEmpire._carregando) {
        IkaEmpire._dados = salvo;
        IkaEmpire._render();
      } else if (!IkaEmpire._dados && !IkaEmpire._carregando) {
        IkaEmpire.coletar();
      }
    });
  },

  // Lobby: lista de imperios salvos por servidor/conta.
  abrirLobby: function () {
    IkaEmpire._criarModal();
    IkaEmpire._dados = null;
    IkaEmpire._somenteLeitura = true;
    $('#ikaext-empire-atualizar').hide();
    $('#ikaext-empire-voltar').hide();
    $('#ikaext-empire-json').hide();
    $('#ikaext-empire-abas').hide();
    $('#ikaext-empire-titulo').text('Imperios salvos');
    $('#ikaext-empire-overlay').addClass('aberta');
    IkaEmpire._status('');

    IkaLog.lerImperios(function (imperios) {
      $('#ikaext-empire-corpo').html(IkaEmpire._renderSeletor(imperios));
      $('#ikaext-empire-corpo .ikaext-empire-item').on('click', function () {
        IkaEmpire.abrirLocal($(this).data('servidor'), $(this).data('conta'));
      });
    });
  },

  // Abre o snapshot salvo de uma conta (somente leitura).
  // origem: 'lobby' (padrão) ou 'perfil' — controla destino do botão Voltar
  abrirLocal: function (servidor, conta, origem) {
    IkaEmpire._origem = origem || 'lobby';
    IkaEmpire._criarModal();
    $('#ikaext-empire-json').show();
    $('#ikaext-empire-abas').show();
    IkaEmpire._modoLeitura(conta + ' \u00b7 ' + servidor);
    $('#ikaext-empire-overlay').addClass('aberta');
    IkaLog.lerImperio(servidor, conta, function (salvo) {
      IkaEmpire._dados = salvo;
      IkaEmpire._render();
    });
  },

  fecharModal: function () { $('#ikaext-empire-overlay').removeClass('aberta'); },

  _status: function (txt) { $('#ikaext-empire-status').text(txt || ''); },

  _exportarJson: function () {
    if (!IkaEmpire._dados) return;
    navigator.clipboard.writeText(JSON.stringify(IkaEmpire._dados, null, 2)).catch(function () {});
    IkaEmpire._status('JSON copiado.');
  },

  /* ============================ coleta ============================ */

  // Coleta dados em background sem abrir ou atualizar a modal
  coletarBackground: function () {
    var cidades = IkaEmpire._listarCidades();
    if (!cidades.length) return;

    var servidor = IkaEmpire._servidorAtual();
    var conta    = IkaEmpire._contaAtual();
    var token    = IkaEmpire._actionRequestInicial();
    var i        = 0;
    var resultado = [];

    console.log('[IkaGX] Coletando império em background:', servidor, conta, cidades.length + ' cidades');

    function proxima() {
      if (i >= cidades.length) {
        var dados = {
          coletadoEm: Date.now(),
          servidor: servidor,
          conta: conta,
          cidades: resultado
        };
        IkaLog.salvarImperio(servidor, conta, dados);

        // Se a modal estiver aberta, atualiza a visualização
        if ($('#ikaext-empire-overlay').hasClass('aberta')) {
          IkaEmpire._dados = dados;
          IkaEmpire._render();
        }

        console.log('[IkaGX] Império salvo em background:', servidor, conta);
        return;
      }

      var cidade = cidades[i++];
      IkaEmpire._coletarCidade(cidade, token, function (dadosCidade, novoToken) {
        if (novoToken) token = novoToken;
        resultado.push(dadosCidade);
        proxima();
      });
    }

    proxima();
  },

  coletar: function () {
    var cidades = IkaEmpire._listarCidades();
    if (!cidades.length) {
      IkaEmpire._status('Nenhuma cidade encontrada.');
      return;
    }

    IkaEmpire._carregando = false; // não bloqueia renderização
    IkaEmpire._dados = {
      coletadoEm: Date.now(),
      servidor: IkaEmpire._servidorAtual(),
      conta: IkaEmpire._contaAtual(),
      cidades: []
    };
    IkaEmpire._render(); // exibe tabela vazia imediatamente

    var token = IkaEmpire._actionRequestInicial();
    var i = 0;
    var total = cidades.length;

    function proxima() {
      if (i >= total) {
        // Coleta concluída — salva e atualiza status final
        IkaEmpire._dados.coletadoEm = Date.now();
        IkaLog.salvarImperio(IkaEmpire._dados.servidor, IkaEmpire._dados.conta, IkaEmpire._dados);
        IkaEmpire._status('Servidor: ' + IkaEmpire._dados.servidor + ' | ' + total +
          ' cidade(s) | coletado em ' + new Date(IkaEmpire._dados.coletadoEm).toLocaleString('pt-BR'));
        return;
      }

      var cidade = cidades[i++];
      IkaEmpire._status('Coletando ' + i + '/' + total + ': ' + cidade.nome + '...');

      IkaEmpire._coletarCidade(cidade, token, function (dadosCidade, novoToken) {
        if (novoToken) token = novoToken;

        // Adiciona cidade e re-renderiza imediatamente — resultado progressivo
        IkaEmpire._dados.cidades.push(dadosCidade);
        IkaEmpire._render();

        proxima();
      });
    }

    proxima();
  },

  _coletarCidade: function (cidade, token, cb) {
    var url = '?view=townHall&cityId=' + cidade.id +
      '&position=0&backgroundView=city&currentCityId=' + cidade.id + '&ajax=1';
    if (token) url += '&actionRequest=' + token;

    $.get(url, function (r) {
      var json;
      try { json = typeof r === 'string' ? JSON.parse(r) : r; }
      catch (e) { cb(IkaEmpire._cidadeVazia(cidade), null); return; }

      var novoToken = IkaEmpire._primeiro(json, 'actionRequest');
      var posicoes  = IkaEmpire._acharPosicoes(json);
      var header    = IkaEmpire._primeiro(json, 'headerData');
      var townHall  = IkaEmpire._parsearTownHall(IkaEmpire._acharHtmlTownHall(json));
      var rec       = IkaEmpire._montarRecursos(header);

      cb({
        cityId: cidade.id,
        nome: cidade.nome,
        edificios: posicoes ? IkaEmpire._parsearPosicoes(posicoes) : [],
        recursos: rec ? rec.recursos : null,
        recursosMax: rec ? rec.recursosMax : null,
        producao: rec ? rec.producao : null,
        populacao: townHall ? townHall.populacao : null,
        cientistas: townHall ? townHall.cientistas : null,
        cultura: townHall ? townHall.cultura : null
      }, (typeof novoToken === 'string' && novoToken) ? novoToken : null);
    }).fail(function () {
      cb(IkaEmpire._cidadeVazia(cidade), null);
    });
  },

  _cidadeVazia: function (cidade) {
    return {
      cityId: cidade.id, nome: cidade.nome, edificios: [],
      recursos: null, recursosMax: null, producao: null,
      populacao: null, cientistas: null, cultura: null
    };
  },

  /* ============================ cidades ============================ */

  _listarCidades: function () {
    var cidades = [];
    var vistos = {};

    $('#dropDown_js_citySelectContainer li[selectvalue]').each(function () {
      var id = $(this).attr('selectvalue');
      if (!id || vistos[id]) return;
      vistos[id] = true;
      var nome = ($(this).find('a').first().text() || $(this).text() || '').trim();
      cidades.push({ id: id, nome: nome || ('Cidade ' + id) });
    });

    if (!cidades.length) {
      var atual = IkaEmpire._cityIdAtual();
      if (atual) cidades.push({ id: atual, nome: 'Cidade ' + atual });
    }

    return cidades;
  },

  _cityIdAtual: function () {
    var titulo = $('#js_citySelectContainer .dropDownButton a').attr('title');
    return $('#dropDown_js_citySelectContainer a[title="' + titulo + '"]').closest('li').attr('selectvalue');
  },

  _servidorAtual: function () { return window.location.hostname.split('.')[0]; },

  _contaAtual: function () {
    return ($('#GF_toolbar .avatarName a[href*="optionsAccount"]').attr('title') || 'Desconhecido').trim();
  },

  // Token inicial: lido de qualquer link do jogo que ja contenha actionRequest.
  _actionRequestInicial: function () {
    var href = $('a[href*="actionRequest="]').attr('href') || '';
    var m = href.match(/actionRequest=([a-f0-9]+)/i);
    return m ? m[1] : '';
  },

  /* ============================ parsing ============================ */

  _deepCollect: function (node, key, out, depth) {
    if (depth > 8 || node === null || typeof node !== 'object') return;
    if (Array.isArray(node)) {
      for (var i = 0; i < node.length; i++) IkaEmpire._deepCollect(node[i], key, out, depth + 1);
      return;
    }
    for (var k in node) {
      if (!Object.prototype.hasOwnProperty.call(node, k)) continue;
      if (k === key) out.push(node[k]);
      IkaEmpire._deepCollect(node[k], key, out, depth + 1);
    }
  },

  _primeiro: function (json, key) {
    var out = [];
    IkaEmpire._deepCollect(json, key, out, 0);
    for (var i = 0; i < out.length; i++) {
      if (out[i] !== null && out[i] !== undefined && out[i] !== '') return out[i];
    }
    return null;
  },

  _pareceEdificios: function (arr) {
    return Array.isArray(arr) && arr.some(function (b) {
      return b && typeof b === 'object' && ('building' in b) && ('name' in b);
    });
  },

  _acharPosicoes: function (json) {
    var bgs = [];
    IkaEmpire._deepCollect(json, 'backgroundData', bgs, 0);
    for (var i = 0; i < bgs.length; i++) {
      if (bgs[i] && IkaEmpire._pareceEdificios(bgs[i].position)) return bgs[i].position;
    }
    var pos = [];
    IkaEmpire._deepCollect(json, 'position', pos, 0);
    for (var j = 0; j < pos.length; j++) {
      if (IkaEmpire._pareceEdificios(pos[j])) return pos[j];
    }
    return null;
  },

  _acharHtmlTownHall: function (json) {
    if (!Array.isArray(json)) return null;
    for (var i = 0; i < json.length; i++) {
      var entry = json[i];
      if (Array.isArray(entry) && entry[0] === 'changeView' && Array.isArray(entry[1])) {
        var html = entry[1][1];
        if (typeof html === 'string' && html.indexOf('js_TownHall') > -1) return html;
      }
    }
    return null;
  },

  _parsearPosicoes: function (posicoes) {
    var lista = [];
    $.each(posicoes || [], function (index, b) {
      if (!b || !b.name) return;
      lista.push({
        posicao: index,
        building: String(b.building || '').replace('constructionSite', '').trim(),
        nome: b.name,
        nivel: parseInt(b.level, 10) || 0,
        nivelMax: !!b.isMaxLevel,
        emUpgrade: !!b.completed
      });
    });
    return lista;
  },

  _num: function (v) { var n = parseInt(v, 10); return isNaN(n) ? 0 : n; },

  _montarRecursos: function (header) {
    if (!header) return null;
    var cr = header.currentResources || {};
    var mr = header.maxResources || {};

    var recursos = {
      wood: IkaEmpire._num(cr.resource),
      wine: IkaEmpire._num(cr[1]),
      marble: IkaEmpire._num(cr[2]),
      glass: IkaEmpire._num(cr[3]),
      sulfur: IkaEmpire._num(cr[4]),
      citizens: IkaEmpire._num(cr.citizens),
      populacao: IkaEmpire._num(cr.population)
    };

    var recursosMax = {
      wood: IkaEmpire._num(mr.resource),
      wine: IkaEmpire._num(mr[1]),
      marble: IkaEmpire._num(mr[2]),
      glass: IkaEmpire._num(mr[3]),
      sulfur: IkaEmpire._num(mr[4])
    };

    var producao = { wood: Math.floor((header.resourceProduction || 0) * 3600) };
    var ilhaRec = IkaEmpire._ordinalRecurso[String(parseInt(header.producedTradegood, 10))];
    if (ilhaRec && ilhaRec !== 'wood') {
      producao[ilhaRec] = Math.floor((header.tradegoodProduction || 0) * 3600);
    }
    producao.vinhoGasto = IkaEmpire._num(header.wineSpendings);

    return { recursos: recursos, recursosMax: recursosMax, producao: producao };
  },

  _txtInt: function (t) {
    if (!t) return 0;
    return parseInt(String(t).replace(/[^\d-]+/g, ''), 10) || 0;
  },

  _txtFloat: function (t) {
    if (!t) return 0;
    var s = String(t).trim().replace(/\s/g, '').replace(/[^\d.,-]/g, '');
    var pos = Math.max(s.lastIndexOf('.'), s.lastIndexOf(','));
    if (pos > -1) {
      s = s.slice(0, pos).replace(/[.,]/g, '') + '.' + s.slice(pos + 1).replace(/[.,]/g, '');
    }
    return parseFloat(s) || 0;
  },

  _parsearTownHall: function (html) {
    if (!html) return null;
    var doc = $('<div>').html(html);
    function t(sel) { return doc.find(sel).first().text(); }
    return {
      populacao: {
        ocupada: IkaEmpire._txtInt(t('#js_TownHallOccupiedSpace')),
        max: IkaEmpire._txtInt(t('#js_TownHallMaxInhabitants')),
        crescimento: IkaEmpire._txtFloat(t('#js_TownHallPopulationGrowthValue')),
        satisfacao: IkaEmpire._txtInt(t('#js_TownHallHappinessLargeValue'))
      },
      cientistas: IkaEmpire._txtInt(t('#js_TownHallPopulationGraphScientistCount')),
      cultura: IkaEmpire._txtInt(t('#js_TownHallSatisfactionOverviewCultureBoniTreatyBonusValue')) / 50
    };
  },

  /* ============================ render ============================ */

  _render: function () {
    var overlay = $('#ikaext-empire-overlay');
    if (!overlay.length || !overlay.hasClass('aberta')) return;

    var corpo = $('#ikaext-empire-corpo');

    if (IkaEmpire._carregando) {
      IkaEmpire._status('Coletando dados de todas as cidades...');
      corpo.html('<div class="ikaext-empire-vazio">Carregando...</div>');
      return;
    }

    if (!IkaEmpire._dados) {
      corpo.html('<div class="ikaext-empire-vazio">Clique em "Atualizar" para coletar.</div>');
      return;
    }

    var d = IkaEmpire._dados;
    IkaEmpire._status('Servidor: ' + (d.servidor || '-') + ' | ' + d.cidades.length +
      ' cidade(s) | coletado em ' + new Date(d.coletadoEm).toLocaleString('pt-BR'));

    corpo.html(IkaEmpire._abaAtiva === 'edificios'
      ? IkaEmpire._renderEdificios(d.cidades)
      : IkaEmpire._renderRecursos(d.cidades));
  },

  _fmt: function (n) {
    if (n === null || n === undefined || isNaN(n)) return '\u2014';
    return Number(n).toLocaleString('pt-BR');
  },

  _esc: function (v) {
    return String(v === null || v === undefined ? '' : v).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  },

  _rotuloCidade: function (c) { return IkaEmpire._esc((c.nome || ('#' + c.cityId)).trim()); },

  _renderEdificios: function (cidades) {
    // Descobre o número máximo de instâncias de cada tipo entre todas as cidades
    var maxPorTipo = {}, nomes = {}, ordemTipos = [];

    cidades.forEach(function (c) {
      var contPorTipo = {};
      c.edificios.forEach(function (b) {
        if (ordemTipos.indexOf(b.building) === -1) { ordemTipos.push(b.building); nomes[b.building] = b.nome; }
        contPorTipo[b.building] = (contPorTipo[b.building] || 0) + 1;
      });
      ordemTipos.forEach(function (tp) {
        maxPorTipo[tp] = Math.max(maxPorTipo[tp] || 0, contPorTipo[tp] || 0);
      });
    });

    // Monta lista de colunas: uma por instância (ex: warehouse, warehouse, warehouse)
    var colunas = [];
    ordemTipos.forEach(function (tp) {
      for (var i = 0; i < (maxPorTipo[tp] || 1); i++) {
        colunas.push({ tipo: tp, idx: i });
      }
    });

    var spriteUrl = chrome.runtime.getURL('buildingbutton_sprite.jpg');
    var h = '<table class="ikaext-empire-tabela"><thead><tr><th class="ikaext-empire-cidade">Cidade</th>';
    colunas.forEach(function (col) {
      h += '<th class="ikagx-emp-building ikagx-emp-building-' + col.tipo + '" title="' + IkaEmpire._esc(nomes[col.tipo]) + '">' +
             '<div style="background-image:url(' + spriteUrl + ')"></div>' +
           '</th>';
    });
    h += '</tr></thead><tbody>';

    cidades.forEach(function (c) {
      // Agrupa instâncias por tipo mantendo a ordem de aparição
      var instPorTipo = {};
      c.edificios.forEach(function (b) {
        if (!instPorTipo[b.building]) instPorTipo[b.building] = [];
        instPorTipo[b.building].push(b.nivel + (b.emUpgrade ? '+' : ''));
      });

      h += '<tr><td class="ikaext-empire-cidade">' + IkaEmpire._rotuloCidade(c) + '</td>';
      colunas.forEach(function (col) {
        var lista = instPorTipo[col.tipo] || [];
        h += '<td>' + (lista[col.idx] !== undefined ? lista[col.idx] : '\u2014') + '</td>';
      });
      h += '</tr>';
    });

    return h + '</tbody></table>';
  },

  _renderRecursos: function (cidades) {
    var u = chrome.runtime.getURL;
    var cols = [
      { k: 'wood',   label: 'Madeira', icon: '<img src="' + u('img/icon_wood.png')   + '" title="Madeira" class="ikaext-res-icon">' },
      { k: 'wine',   label: 'Vinho',   icon: '<img src="' + u('img/icon_wine.png')   + '" title="Vinho" class="ikaext-res-icon">' },
      { k: 'marble', label: 'Mármore', icon: '<img src="' + u('img/icon_marble.png') + '" title="Mármore" class="ikaext-res-icon">' },
      { k: 'glass',  label: 'Cristal', icon: '<img src="' + u('img/icon_glass.png')  + '" title="Cristal" class="ikaext-res-icon">' },
      { k: 'sulfur', label: 'Enxofre', icon: '<img src="' + u('img/icon_sulfur.png') + '" title="Enxofre" class="ikaext-res-icon">' }
    ];

    var thIcon = function(src, title) {
      return '<th title="' + title + '"><img src="' + u(src) + '" class="ikaext-res-icon" title="' + title + '"></th>';
    };

    var h = '<table class="ikaext-empire-tabela"><thead><tr>' +
      '<th class="ikaext-empire-cidade">Cidade</th>' +
      thIcon('img/icon_population.png',   'População') +
      thIcon('img/icon_growth.png',       'Crescimento') +
      thIcon('img/icon_satisfaction.png', 'Satisfação') +
      thIcon('img/icon_research.png',     'Ciência');

    cols.forEach(function (c) {
      h += '<th title="' + c.label + '">' + c.icon + '</th>';
    });
    h += '</tr></thead><tbody>';

    cidades.forEach(function (c) {
      var p = c.populacao || {}, r = c.recursos || {}, mx = c.recursosMax || {}, pr = c.producao || {};
      h += '<tr><td class="ikaext-empire-cidade">' + IkaEmpire._rotuloCidade(c) + '</td>';
      h += '<td>' + IkaEmpire._fmt(p.ocupada) + ' / ' + IkaEmpire._fmt(p.max) + '</td>';
      h += '<td>' + (p.crescimento != null ? p.crescimento : '\u2014') + '</td>';
      h += '<td>' + (p.satisfacao != null ? IkaEmpire._fmt(p.satisfacao) : '\u2014') + '</td>';
      h += '<td>' + (c.cientistas != null ? IkaEmpire._fmt(c.cientistas) : '\u2014') + '</td>';
      cols.forEach(function (col) {
        var cell = r[col.k] != null ? IkaEmpire._fmt(r[col.k]) : '\u2014';
        if (pr[col.k]) cell += '<span class="ikaext-empire-prod">+' + IkaEmpire._fmt(pr[col.k]) + '/h</span>';
        var title = mx[col.k] ? ('Max: ' + IkaEmpire._fmt(mx[col.k])) : '';
        h += '<td title="' + title + '">' + cell + '</td>';
      });
      h += '</tr>';
    });

    return h + '</tbody></table>';
  },

  _renderSeletor: function (imperios) {
    var servidores = Object.keys(imperios || {});
    if (!servidores.length) {
      return '<div class="ikaext-empire-vazio">Nenhum imperio salvo ainda. ' +
        'Abra o jogo, clique em "Imperio" e depois em "Atualizar".</div>';
    }

    var h = '';
    servidores.sort();
    servidores.forEach(function (servidor) {
      h += '<div class="ikaext-empire-srv">' + IkaEmpire._esc(servidor) + '</div>';
      var contas = Object.keys(imperios[servidor]);
      contas.sort();
      contas.forEach(function (conta) {
        var d = imperios[servidor][conta] || {};
        var nCidades = (d.cidades || []).length;
        var quando = d.coletadoEm ? new Date(d.coletadoEm).toLocaleString('pt-BR') : '-';
        h += '<div class="ikaext-empire-item" data-servidor="' + IkaEmpire._esc(servidor) +
          '" data-conta="' + IkaEmpire._esc(conta) + '">' +
          '<div class="ikaext-empire-item-av">' + IkaEmpire._esc(conta.charAt(0).toUpperCase()) + '</div>' +
          '<div class="ikaext-empire-item-info">' +
            '<div class="ikaext-empire-item-nome">' + IkaEmpire._esc(conta) + '</div>' +
            '<div class="ikaext-empire-item-meta">' + nCidades + ' cidade(s) \u00b7 ' + quando + '</div>' +
          '</div>' +
          '<span class="ikaext-empire-item-seta">\u203a</span>' +
        '</div>';
      });
    });

    return h;
  }
};
