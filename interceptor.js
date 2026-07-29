/**
 * IkaGX - interceptor.js
 * Roda no contexto da página (não no content script isolado).
 * Intercepta respostas XHR do jogo e repassa via CustomEvent.
 */
(function () {
  var _open = XMLHttpRequest.prototype.open;
  var _send = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function (method, url) {
    this._ikagxUrl = url;
    return _open.apply(this, arguments);
  };

  XMLHttpRequest.prototype.send = function () {
    var xhr = this;
    xhr.addEventListener('load', function () {
      try {
        var url = xhr._ikagxUrl || '';
        if (url.indexOf('ajax=1') === -1) return;
        if (xhr.status !== 200) return;
        var texto = xhr.responseText;
        if (!texto || texto[0] !== '[') return;

        window.dispatchEvent(new CustomEvent('ikagx_ajax', {
          detail: { url: url, body: texto }
        }));
      } catch (e) {}
    });
    return _send.apply(this, arguments);
  };
})();
