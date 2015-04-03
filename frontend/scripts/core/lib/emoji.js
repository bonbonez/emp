(function(window, BM, twemoji) {

  BM = window.BM || {};
  BM.lib = BM.lib || {};
  BM.lib.emoji = {};

  var emojiSupported = (function() {
      var node = document.createElement('canvas');
      if (!node.getContext || !node.getContext('2d') ||
        typeof node.getContext('2d').fillText !== 'function')
        return false;
      var ctx = node.getContext('2d');
      ctx.textBaseline = 'top';
      ctx.font = '32px Arial';
      ctx.fillText('\ud83d\ude03', 0, 0);
      return ctx.getImageData(16, 16, 1, 1).data[0] !== 0;
    }());


  BM.tools.mixin(BM.lib.emoji, {

    supported : function() {
      return emojiSupported;
    },

    replace : function(obj, force) {
      if (!BM.tools.isPresent(obj)) {
        return;
      }
      if (BM.lib.emoji.supported() && force !== true) {
        return;
      }

      if (BM.tools.isString(obj)) {
        return twemoji.parse(obj);
      } else if (BM.tools.isPresent(window.jQuery) && BM.tools.isInstanceOf(obj, window.jQuery)) {
        obj.html(twemoji.parse(obj.html()));
      } else if (BM.tools.isInstanceOf(obj, window.HTMLElement)) {
        obj.innerHTML = twemoji.parse(obj.innerHTML);
      }
    }

  });

}(this, this.BM, this.twemoji));