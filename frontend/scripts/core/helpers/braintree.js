(function(window, BM){

    BM = window.BM || {};
    BM.helper = BM.helper || {};
    BM.helper.braintree = BM.helper.braintree || {};


    BM.tools.mixin(BM.helper.braintree, {

        merchantId : function() {
            if (BM.helper.env.isProduction()) {
                return 'd8h943sx2q7g29mm';
            } else {
                return '8tz37b4jh2tfr9vf';
            }
        },

        braintreeDataEnvironment : function() {
            if (!BM.tools.isUndefined(window.BraintreeData)) {
                if (BM.helper.env.isProduction()) {
                    return BraintreeData.environments.production;
                } else {
                    return BraintreeData.environments.sandbox;
                }
            }
            return null;
        },

        deviceData : function() {
            var form, id, deviceData;
            if (!BM.tools.isUndefined(window.BraintreeData)) {
                form = document.createElement('form');
                id = 'braintree-devide-data-form-dummy-' + parseInt(Math.random() * 1000000, 10);
                form.id = id;
                document.body.appendChild(form);
                BraintreeData.setup(BM.helper.braintree.merchantId(), id, BM.helper.braintree.braintreeDataEnvironment());
                deviceData = form.querySelector('#device_data').getAttribute('value');
                try {
                    return JSON.parse(deviceData);
                } catch (e) {
                    return deviceData;
                }
            }
            return null;
        }

    });


}(this, this.BM));