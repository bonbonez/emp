function requireAll(r) { r.keys().forEach(r); }

require('vendor/console.js');
require('vendor/cookies.js');

window.$ = require('vendor/jquery-2.1.1.min.js');
window.jQuery = require('vendor/jquery-2.1.1.min.js');

require('vendor/tap.js');
require('vendor/json2.js');
require('vendor/radio.js');
require('vendor/ymodules.js');

require('namespace/namespace.js');

require('configs/ajaxSetup.js');
require('configs/configFromServer.js');

requireAll(require.context('tools', true, /\.js$/));

require('features/browser.js');
require('user/user.js');