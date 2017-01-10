(function(
    window,
    modules,
    $,
    React
){

    modules.define(
        'OrderDeliveryAddress',
        [
            'CartActions',
            'CartStore'
        ],
        function(
            provide,
            CartActions,
            CartStore
        ) {

            let OrderDeliveryAddress = React.createClass({
                displayName: 'OrderDeliveryAddress',

                propTypes: {
                    orderData: React.PropTypes.object,
                    selectedDeliveryRegion: React.PropTypes.string,
                    selectedDeliveryOption: React.PropTypes.string
                },

                render() {
                    return (
                        <div className="bm-page-order-delivery-method">
                            <div className="bm-header-25 bm-page-order-delivery-address-header">Адрес и контактные данные</div>

                            <div className="bm-page-order-delivery-address-form">
                                <div className="form-fluid">
                                    <div className="form-fluid-item">
                                        <div className="form-fluid-label">Имя</div>
                                        <input type="text" className="form-fluid-input" />
                                    </div>
                                    <div className="form-fluid-item">
                                        <div className="form-fluid-label">Телефон</div>
                                        <input type="tel" className="form-fluid-input" />
                                    </div>
                                    <div className="form-fluid-item">
                                        <div className="form-fluid-label">Email</div>
                                        <input type="email" className="form-fluid-input" />
                                    </div>
                                    <div className="form-fluid-item">
                                        <div className="form-fluid-label">Адрес доставки</div>
                                        <input type="email" className="form-fluid-input" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                }
            });

            provide(OrderDeliveryAddress);
        }
    );

}(
    this,
    this.modules,
    this.jQuery,
    this.React
));