(function (window, document, BM, undefined) {
  "use strict";

  var user = BM.user = BM.user || {},

    isUserPresent = function () {
      return BM.config.mainConfig.userInfo.hasOwnProperty('login');
    },

    getUserLogin = function () {
      if (!isUserPresent()) {
        return null;
      }
      return BM.config.mainConfig.userInfo.login;
    },

    avatarUrl = function () {
      if (!isUserPresent()) {
        return null;
      }
      return BM.config.mainConfig.userInfo.avatar_url;
    },

    api4Attributes = function () {
      if (!isUserPresent()) {
        return null;
      }
      return BM.config.mainConfig.userInfo;
    },

    getViewingUserLogin = function () {
      var login = BM.config.mainConfig.viewingUser.login;
      if (BM.config && BM.config.mainConfig && login) {
        return window.location.href.indexOf(login) >= 0 ? login : undefined;
      }
    },

    _isSubscription = function (type) {
      var config = BM.config.mainConfig,
        result = false;

      if (config && config.userInfo && config.userInfo.subscriptions) {
        config.userInfo.subscriptions.forEach(function (subscription) {
          if (subscription['kind'] === type && subscription['expires_at'] * 1000 > new Date().getTime()) {
            result = true;
          }
        });
      }

      return result;
    },

    _isSubscriptionExisted = function (type) {
      return type !== undefined ? getSubscription(type) !== null : false;
    },

    isSubscriptionDefaultExisted = function () {
      return _isSubscriptionExisted('default');
    },

    isSubscriptionPremiumExisted = function () {
      return _isSubscriptionExisted('premium');
    },

    getSubscription = function (type) {
      var config = BM.config.mainConfig,
        result = null;

      if (config && config.userInfo && config.userInfo.subscriptions) {
        config.userInfo.subscriptions.forEach(function (subscription) {
          if (subscription.kind === type) {
            result = subscription;
          }
        });
      }
      return result;
    },

    getHighestSubscription = function () {
      var config = BM.config.mainConfig,
        levels = [],
        result = null;

      if (BM.user.isUserPresent() && config.userInfo && config.userInfo.subscriptions) {
        levels = $.map(config.userInfo.subscriptions, function (subscription) {
          if (subscription['expires_at'] * 1000 > new Date().getTime()) {
            return subscription['kind'];
          }
        });
      } else {
        return null;
      }

      if (levels.indexOf('premium') !== -1) {
        result = 'premium';
      } else if (levels.indexOf('default') !== -1) {
        result = 'default';
      } else {
        result = 'any';
      }

      return result;
    },

    isSubscriptionPremium = function () {
      return _isSubscription('premium') || (_isSubscription('default') && _isSubscription('booster'));
    },

    isSubscriptionBooster = function () {
      return _isSubscription('booster');
    },

    isSubscriptionDefault = function () {
      return _isSubscription('default') || _isSubscription('booster');
    },

    isSubscriptionDefaultIOS = function () {
      return _isSubscription('default-ios');
    },

    anySubscriptionPresent = function () {
      return isSubscriptionDefault() || isSubscriptionPremium();
    },

    isRecurrentDefaultActive = function () {
      return isRecurrentActive('default');
    },

    isRecurrentPremiumActive = function () {
      return isRecurrentActive('premium');
    },

    isRecurrentActive = function (kind) {
      var config = BM.config.mainConfig,
        result = false;

      if (config && config.userInfo && config.userInfo.subscriptions) {
        config.userInfo.subscriptions.forEach(function (level) {
          if (level['kind'] === kind && level['active_recurrent'] === true) {
            result = true;
          }
        });
      }
      return result;
    },

    getSubscriptionCoutryCode = function () {
      var config = BM.config.mainConfig;
      if (config && config.userInfo) {
        return config.userInfo.subscriptionCountryCode;
      }
    },

    getLocale = function () {
      if (BM && BM.config && BM.config.mainConfig) {
        return BM.config.mainConfig.locale;
      }
    },

    isLocaleRu = function () {
      return user.getLocale() === 'ru';
    },

    isLocaleEn = function () {
      return user.getLocale() === 'en';
    };

  user.isUserPresent                = isUserPresent;
  user.getLogin                     = getUserLogin;
  user.getViewingUserLogin          = getViewingUserLogin;
  user.avatarUrl                    = avatarUrl;
  user.api4Attributes               = api4Attributes;

  user.getSubscription              = getSubscription;
  user.isSubscriptionPremium        = isSubscriptionPremium;
  user.isSubscriptionBooster        = isSubscriptionBooster;
  user.isSubscriptionDefault        = isSubscriptionDefault;
  user.isSubscriptionDefaultExisted = isSubscriptionDefaultExisted;
  user.isSubscriptionPremiumExisted = isSubscriptionPremiumExisted;
  user.isSubscriptionDefaultIOS     = isSubscriptionDefaultIOS;
  user.isRecurrentDefaultActive     = isRecurrentDefaultActive;
  user.isRecurrentPremiumActive     = isRecurrentPremiumActive;
  user.getHighestSubscription       = getHighestSubscription;
  user.anySubscriptionPresent       = anySubscriptionPresent;

  user.getSubscriptionCoutryCode    = getSubscriptionCoutryCode;
  user.getLocale                    = getLocale;
  user.isLocaleRu                   = isLocaleRu;
  user.isLocaleEn                   = isLocaleEn;

}(
    this,
    this.document,
    this.BM = this.BM || {}
  ));
