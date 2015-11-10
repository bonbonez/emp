(function (window, BM) {

  BM = window.BM || {};
  BM.helper = BM.helper || {};
  BM.helper.coffeeKinds = BM.helper.coffeeKinds || {};

  var kinds = {
    'mono': {
      word: 'Классические сорта'
    },
    'aroma': {
      word: 'Ароматизированный кофе'
    },
    'espresso': {
      word: 'Для кофемашин'
    },
    'exotic': {
      word: 'Экзотические сорта'
    }
  };

  BM.tools.mixin(BM.helper.coffeeKinds, {

    getWordByKind: function(kind) {
      return kinds[kind].word;
    }

  });

}(this, this.BM));