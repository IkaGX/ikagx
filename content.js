/**
 * IkaGX v2.0.0 - content.js
 */

var estaNoLobby   = window.location.hostname === 'lobby.ikariam.gameforge.com';
var servidorAtual = estaNoLobby ? null : window.location.hostname.split('.')[0];

var nomeMundo = (function () {
  var titulo = document.title || '';
  var match  = titulo.match(/Mundo\s+([^\s\u2066\u2069\-]+)/i);
  if (match) return match[1].replace(/[\u2066\u2069]/g, '').trim();
  var partes = titulo.split('-');
  return partes[partes.length - 1].replace(/[\u2066\u2069]/g, '').trim() || null;
}());

buscarIPeInserir();

var observer = new MutationObserver(function () {
  if ($('#ikaext-ip').length > 0) return;
  if (estaNoLobby && $('.gfPanel.social a[href*="discord.gg"]').length > 0) buscarIPeInserir();
  if (!estaNoLobby && $('#GF_toolbar ul').length > 0) buscarIPeInserir();
});
observer.observe(document.body, { childList: true, subtree: true });

if (estaNoLobby) {
  var aguardaLobby = setInterval(function () {
    if (document.body && typeof $ !== 'undefined') {
      clearInterval(aguardaLobby);
      IkaModal.iniciar();
      IkaEmpire.iniciarLobby();
    }
  }, 300);
}

if (!estaNoLobby) {
  var aguardaJogo = setInterval(function () {
    if (document.body && typeof $ !== 'undefined') {
      clearInterval(aguardaJogo);
      IkaLookup.iniciar();
      IkaEmpire.iniciar();
    }
  }, 300);
}

function buscarIPeInserir() {
  $.getJSON('https://api.ipify.org?format=json', function (dados) {
    if (estaNoLobby) inserirNoLobby(dados.ip);
    else             inserirNaToolbar(dados.ip);
  }).fail(function () {
    if (estaNoLobby) inserirNoLobby('IP indisponível');
    else             inserirNaToolbar('IP indisponível');
  });
}

function inserirNoLobby(ip) {
  if ($('#ikaext-ip').length > 0) return;
  var liDiscord = $('.gfPanel.social a[href*="discord.gg"]').closest('li');
  if (liDiscord.length === 0) return;
  liDiscord.after('<li id="ikaext-ip"><span class="icon"></span><a title="Seu IP público (IkaGX)">IP: ' + ip + '</a></li>');
  console.log('[IkaGX] IP inserido no lobby:', ip);
  salvarEmailDaSessao();
}

function salvarEmailDaSessao() {
  var email = $('.emailAddress').text().trim();
  if (email) { IkaLog.salvarEmail(email); }
  else { setTimeout(salvarEmailDaSessao, 2000); }
}

function inserirNaToolbar(ip) {
  if ($('#ikaext-ip').length > 0) return;
  var toolbar = $('#GF_toolbar ul');
  if (toolbar.length === 0) return;
  $('#GF_toolbar').css('width', 'calc(100% - 200px)');
  toolbar.find('li:last-child').before('<li id="ikaext-ip" class="serverTime"><a title="Seu IP público (IkaGX)">IP: ' + ip + '</a></li>');
  console.log('[IkaGX] IP inserido na toolbar:', ip);
  registrarLog(ip);
}

function registrarLog(ip) {
  var nomeConta = ($('#GF_toolbar .avatarName a[href*="optionsAccount"]').attr('title') || 'Desconhecido').trim();

  IkaLog.lerEmail(function (emailSalvo) {
    buscarPerfilParaLog(function (perfil) {
      var email = emailSalvo || IkaLog._emailDoResponse || null;
      if (!email) { console.warn('[IkaGX] E-mail não encontrado.'); return; }
      if (!emailSalvo) IkaLog.salvarEmail(email);
      if (nomeMundo)   IkaLog.salvarNomeMundo(servidorAtual, nomeMundo);
      if (perfil && Object.keys(perfil).length > 0) IkaLog.salvarPerfil(servidorAtual, nomeConta, perfil);
      IkaLog.registrar(servidorAtual, email, nomeConta, ip, null);
    });
  });
}

function buscarPerfilParaLog(quandoPronto) {
  var actionRequest = (typeof ikariam !== 'undefined' && ikariam.model && ikariam.model.actionRequest)
    ? ikariam.model.actionRequest : '';
  var url = '?view=avatarProfile&activeTab=tab_avatarProfile&ajax=1';
  if (actionRequest) url += '&actionRequest=' + actionRequest;

  $.get(url, function (resposta) {
    try {
      var json = typeof resposta === 'string' ? JSON.parse(resposta) : resposta;
      for (var i = 0; i < json.length; i++) {
        if (json[i][0] === 'updateGlobalData') {
          var popup = json[i][1].emailReminderPopup;
          if (popup && popup.parameters && popup.parameters[1]) {
            var match = popup.parameters[1].match(/[\w.+-]+@[\w-]+\.[\w.]+/);
            if (match) IkaLog._emailDoResponse = match[0];
          }
          break;
        }
      }

      var perfil = IkaLookup.parsearResposta(resposta) || {};
      var pendentes = 2;
      var dadosMesclados = {};

      function verificarConcluido() {
        pendentes--;
        if (pendentes > 0) return;
        $.extend(perfil, dadosMesclados);
        quandoPronto(Object.keys(perfil).length > 0 ? perfil : null);
      }

      buscarDadosComplementares(function (c) { if (c) $.extend(dadosMesclados, c); verificarConcluido(); });
      buscarDadosPesquisa(function (p) { if (p) $.extend(dadosMesclados, p); verificarConcluido(); });

    } catch (e) { console.warn('[IkaGX] buscarPerfilParaLog:', e); quandoPronto(null); }
  }).fail(function () { quandoPronto(null); });
}

function _getCityId() {
  var titulo = $('#js_citySelectContainer .dropDownButton a').attr('title');
  return $('#dropDown_js_citySelectContainer a[title="' + titulo + '"]').closest('li').attr('selectvalue');
}

function buscarDadosComplementares(quandoPronto) {
  var cityId = _getCityId();
  if (!cityId) { quandoPronto(null); return; }

  $.get('?view=cityDetails&isMission=1&destinationCityId=' + cityId + '&ajax=1', function (resposta) {
    try {
      var json = typeof resposta === 'string' ? JSON.parse(resposta) : resposta;
      var dados = {};
      for (var i = 0; i < json.length; i++) {
        if (json[i][0] === 'updateTemplateData') {
          var tpl = json[i][1];
          if (tpl['js_selectedCityScoreBuildings']) dados['Mestres de Alvenaria'] = tpl['js_selectedCityScoreBuildings'].text;
          if (tpl['js_selectedCityScoreResearch'])  dados['Cientistas']            = tpl['js_selectedCityScoreResearch'].text;
          if (tpl['js_selectedCityScoreArmy'])      dados['Generais']              = tpl['js_selectedCityScoreArmy'].text;
          if (tpl['js_selectedCityScoreGold'])      dados['Ouro']                  = tpl['js_selectedCityScoreGold'].text;
          break;
        }
      }
      quandoPronto(Object.keys(dados).length > 0 ? dados : null);
    } catch (e) { console.warn('[IkaGX] buscarDadosComplementares:', e); quandoPronto(null); }
  }).fail(function () { quandoPronto(null); });
}

function buscarDadosPesquisa(quandoPronto) {
  var cityId = _getCityId();
  if (!cityId) { quandoPronto(null); return; }

  $.get('?view=researchAdvisor&oldView=city&backgroundView=city&currentCityId=' + cityId + '&ajax=1', function (resposta) {
    try {
      var json = typeof resposta === 'string' ? JSON.parse(resposta) : resposta;
      var dados = {};
      for (var i = 0; i < json.length; i++) {
        if (json[i][0] === 'updateTemplateData') {
          var tpl = json[i][1];
          for (var idx = 0; idx <= 4; idx++) {
            var nomeArea    = tpl['js_researchAdvisorChangeResearchTypeTxt' + idx];
            var proximaPesq = tpl['js_researchAdvisorNextResearchName' + idx];
            if (nomeArea) dados['Pesquisa_' + nomeArea] = proximaPesq || 'Máximo atingido';
          }
          break;
        }
      }
      quandoPronto(Object.keys(dados).length > 0 ? dados : null);
    } catch (e) { console.warn('[IkaGX] buscarDadosPesquisa:', e); quandoPronto(null); }
  }).fail(function () { quandoPronto(null); });
}
