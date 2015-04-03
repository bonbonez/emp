(function(window, modules, BM){

  var tools = BM.tools = BM.tools || {};

  tools.rubyHashString2JSON = function(hash_string){
    return JSON.parse(hash_string.replace(/=>/g, ':;').replace(/:/g, '"').replace(/;/g, ':'));
  };

})(
  this,
  this.modules,
  this.BM = this.BM || {}
);