(function(window, modules, $) {

  modules.define(
    'ReactSetup',
    [
      'CartConstants',
      'CartActions',
      'CartStore',

      'StateConstants',
      'StateActions',
      'StateStore',

      'OrderConstants',
      'OrderActions',
      'OrderStore'
    ],
    (
      provide
    ) => {
      provide();
    }
  );

}(this, this.modules, this.jQuery));