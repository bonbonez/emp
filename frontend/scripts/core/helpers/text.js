(function(window, BM){

  BM = window.BM || {};
  BM.helper = BM.helper || {};
  BM.helper.text = BM.helper.text || {};


  BM.tools.mixin(BM.helper.text, {

    slice : function(text, maxLength, options) {
      var dots = false,
          tmp;

      if (!BM.tools.isUndefined(options)) {
        if (!BM.tools.isUndefined(options.dots)) {
          dots = options.dots;
        }
      }

      if (BM.tools.isString(text) && BM.tools.isNumber(maxLength)) {
        text = text.trim();
        if (text.length <= maxLength) {
          return text;
        }
        text = text.slice(0, maxLength);
        if (text.lastIndexOf(' ') !== -1) {
          text = text.slice(0, text.lastIndexOf(' '));
          tmp = text.split(' ');
          if (tmp[tmp.length - 1].length < 3) {
            tmp.splice(tmp.length - 1, 1);
          }
          tmp[tmp.length - 1] = '...';
          text = tmp.join(' ');
        } else {
          if (dots) {
            text = text.slice(0, text.length - 3) + '...';
          }
        }
      }
      return text;
    },

    sliceBookTitle : function(bookTitle, maxLength) {
      if (BM.tools.isString(bookTitle) && !BM.tools.isNull(maxLength)) {
        if (bookTitle.length > maxLength) {
          if (bookTitle[0] === '(' && bookTitle[bookTitle.length - 1] === ')') {
            bookTitle = bookTitle.slice(1, bookTitle.length - 1);
          }
          bookTitle = bookTitle.replace(/ ?\([^)]+\) ?/ig, ' ');

          if (bookTitle.length <= maxLength) {
            return bookTitle;
          }

          bookTitle = bookTitle.trim().slice(0, maxLength);

          if (bookTitle[0] === '(') {
            bookTitle = bookTitle.slice(1, bookTitle.length);
          }

          if (bookTitle.indexOf('.') !== -1) {
            bookTitle.lastIndexOf('.');
            bookTitle = bookTitle.slice(0, bookTitle.lastIndexOf('.'));
          } else if (bookTitle.indexOf(':') !== -1) {
            bookTitle = bookTitle.slice(0, bookTitle.lastIndexOf(':'));
          } else {
            bookTitle = bookTitle.split(' ');
            if (bookTitle[bookTitle.length - 1].length >= 3) {
              bookTitle[bookTitle.length - 1] = '...';
            } else {
              bookTitle.splice(bookTitle.length - 1, 1);
              bookTitle[bookTitle.length - 1] = '...';
            }
            bookTitle = bookTitle.join(' ');
          }
          return bookTitle;

        } else {
          return bookTitle;
        }
      }
      return bookTitle;
    }

  });


}(this, this.BM));