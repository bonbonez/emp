(function(
    window,
    modules,
    $,
    React
){

    modules.define(
        'OrderDeliveryOptionSelect',
        [
            'OrderStore',
            'OrderActions'
        ],
        function(
            provide,
            OrderStore,
            OrderActions
        ) {

            let OrderDeliveryOptionSelect = React.createClass({
                displayName: 'OrderDeliveryOptionSelect',

                propTypes: {
                    orderData: React.PropTypes.object,
                    selectedDeliveryRegion: React.PropTypes.string,
                    selectedDeliveryOption: React.PropTypes.string
                },

                getInitialState() {
                    return {
                        selected: null
                    };
                },

                getDeliveryOptions() {
                    if (!this.props.selectedDeliveryRegion || !this.props.orderData) {
                        return null;
                    }
                    let region = this.props.orderData.deliveryRegions.filter((region) => {
                        return region.name === this.props.selectedDeliveryRegion;
                    })[0];
                    return region.options;
                },

                onDeliveryOptionClick(name) {
                    OrderActions.setSelectedDeliveryOption(name);
                },

                onLinkToMoreClick(event) {
                    event.stopPropagation();
                },

                render() {
                    var deliveryOptions = this.getDeliveryOptions();
                    if (!deliveryOptions) {
                        return null;
                    }
                    return (
                        <div className="bm-page-order-delivery-method-option-select">
                            { deliveryOptions.map((option) => {
                                let className = ['bm-page-order-delivery-method-option'];
                                className.push(`m-option-${option.name}`);
                                if (this.props.selectedDeliveryOption === option.name) {
                                    className.push('m-selected');
                                }
                                return (
                                    <div key={this.props.selectedDeliveryRegion + option.name} className={className.join(' ')} onClick={this.onDeliveryOptionClick.bind(this, option.name)}>
                                        <div className="delivery-option-label" dangerouslySetInnerHTML={{__html: option.label}}></div>
                                        { option.note ?
                                            <div className="delivery-option-note" dangerouslySetInnerHTML={{__html: option.note}}></div>
                                        : null }
                                        { option.linkToMore ?
                                            <a onClick={this.onLinkToMoreClick} href={option.linkToMore} target="__blank" className="delivery-option-link-to-more">подробнее</a>
                                        : null }
                                    </div>
                                );
                            }) }
                        </div>
                    );
                }
            });

            provide(OrderDeliveryOptionSelect);
        }
    );

}(
    this,
    this.modules,
    this.jQuery,
    this.React
));