(function(window, modules, $, radio){

  modules.define(
    'SideMenuInit',
    [],
    function(provide) {

      var $body                = $(document.body),
          buttonToggleSideMenu = $('@bm-side-menu-toggle-button');

      buttonToggleSideMenu.on(BM.helper.event.clickName(), function(event) {
        if ($body.hasClass('m-side-menu-opened')) {
          $body.removeClass('m-side-menu-opened');
        } else {
          $body.addClass('m-side-menu-opened');
        }
      });
  });

}(
  this,
  this.modules,
  this.jQuery,
  this.radio
));