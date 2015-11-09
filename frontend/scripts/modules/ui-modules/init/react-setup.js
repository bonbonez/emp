(function(window, modules, $) {

  modules.define(
    'ReactSetup',
    [
      'CartConstants',
      'CartActions',
      'CartStore',

      'StateConstants',
      'StateActions',
      'StateStore'
    ],
    (
      provide
    ) => {
      provide();
    }
  );

}(this, this.modules, this.jQuery));