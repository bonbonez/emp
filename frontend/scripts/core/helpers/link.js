(function (window, BM) {

  BM = window.BM || {};
  BM.helper = BM.helper || {};
  BM.helper.link = BM.helper.link || {};


  BM.tools.mixin(BM.helper.link, {

    root: function() {
      return '/';
    },

    toAbsolute: function(link) {
      if (!BM.tools.isString(link)) {
        return null;
      }
      if (link.slice(0, 4) !== 'http') {
        if (link[0] !== '/' || link[0] !== '\\') {
          link = '/' + link;
        }
        link = window.location.origin + link;
      }
      return link;
    },

    appendParam: function (link, params) {
      if (!BM.tools.isString(link) && !BM.tools.isPresent(params)) {
        return link;
      }
      if (BM.tools.isString(params)) {
        if (params[0] === '&' || params[0] === '?') {
          params = params.slice(1);
        }
      }

      if (BM.tools.isObject(params)) {
        params = window.jQuery.param(params);
      }

      if (link.indexOf('?') !== -1) {
        link += '&' + params;
      } else {
        link += '?' + params;
      }

      return link;
    }

  });

}(this, this.BM));