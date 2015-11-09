(function(window, modules, $) {

  modules.define(
    'CartInit',
    [
      'CartActions'
    ],
    (
      provide,
      CartActions
    ) => {

      CartActions.loadCart();

      provide();
    }
  );

}(this, this.modules, this.jQuery));