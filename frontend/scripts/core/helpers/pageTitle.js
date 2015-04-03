(function(window, BM){

  BM = window.BM || {};
  BM.helper = BM.helper || {};
  BM.helper.pageTitle = BM.helper.pageTitle || {};

  var initialTitle = document.title,
      titles = [initialTitle],
      helper = BM.helper.pageTitle;

  var template = null,
      preloadTemplate = function() {
        if (BM.tools.isNull(template)) {
          template = $($('#bm-page-titles-container').html());
        }
      };

  BM.tools.mixin(helper, {

    push : function(title) {
      if (BM.tools.isString(title)) {
        titles.push(title);
        document.title = title;
      }
    },

    pop : function() {
      if (titles.length <= 1) {
        return titles[0];
      }
      var title = titles.pop();
      document.title = titles[titles.length - 1];
      return title;
    },

    reset : function() {
        if (titles.length > 0) {
          document.title = titles[0];
          titles.length = 0;
          titles = [initialTitle];
        }
    },

    getQuotePageTitle : function(bookTitle) {
      preloadTemplate();
      window.t = template;
      return template.find('@bm-quote-page-title').data('content').replace('%{quote_source}', BM.helper.text.sliceBookTitle(bookTitle, 150));
    },

    pushQuotePageTitle : function(bookTitle) {
        helper.push(helper.getQuotePageTitle(bookTitle));
    },

    getBookPageTitle : function(bookTitle) {
      preloadTemplate();
      return template.find('@bm-book-page-title').data('content').replace('%{book_title}', BM.helper.text.sliceBookTitle(bookTitle, 150));
    },

    pushBookPageTitle : function(bookTitle) {
      helper.push(helper.getBookPageTitle(bookTitle));
    }

  });

}(this, this.BM));