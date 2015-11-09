(function (window, BM) {

  BM = window.BM || {};
  BM.helper = BM.helper || {};
  BM.helper.pluralize = BM.helper.pluralize || {};

  var words = {
    tense1: {
      pack: {
        'one': 'упаковка',
        'few': 'упаковки',
        'many': 'упаковок'
      }
    },
    tense2: {
      pack: {
        'one': 'упаковку',
        'few': 'упаковки',
        'many': 'упаковок'
      }
    }
  };

  BM.tools.mixin(BM.helper.pluralize, {

    getWordPack: function(n, tense) {
      tense = tense || 1;
      return words['tense' + tense].pack[plurals.ru(n)];
    }

  });

}(this, this.BM));