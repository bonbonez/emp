(function(
    window,
    modules,
    $,
    React
){

    modules.define(
        'OrderDeliveryRegionSelect',
        [
            'OrderStore',
            'OrderActions',
            'UITabs'
        ],
        function(
            provide,
            OrderStore,
            OrderActions,
            UITabs
        ) {

            let OrderDeliveryRegionSelect = React.createClass({
                displayName: 'OrderDeliveryRegionSelect',

                propTypes: {
                    orderData: React.PropTypes.object,
                    selectedDeliveryRegion: React.PropTypes.string
                },

                componentDidMount() {
                    if (this.props.selectedDeliveryRegion === null) {
                        let defaultRegion = this.props.orderData.deliveryRegions.filter((region) => {
                            return region.default === true;
                        })[0].name;
                        OrderActions.setSelectedDeliveryRegion(defaultRegion);
                    }
                },

                onTabSelect(value) {
                    OrderActions.setSelectedDeliveryRegion(value);
                    OrderActions.setSelectedDeliveryOption(null);
                },

                render() {
                    return (
                        <div className="bm-page-order-delivery-method-region-select">
                            <UITabs
                                options={this.props.orderData.deliveryRegions}
                                onSelect={this.onTabSelect}
                                selected={this.props.selectedDeliveryRegion}
                            />
                        </div>
                    );
                }
            });

            provide(OrderDeliveryRegionSelect);
        }
    );

}(
    this,
    this.modules,
    this.jQuery,
    this.React
));