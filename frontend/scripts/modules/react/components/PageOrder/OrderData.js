(function(
    window,
    modules,
    $,
    React
){

    modules.define(
        'OrderData',
        [],
        function(
            provide
        ) {

            let OrderData = React.createClass({
                displayName: 'OrderData',

                propTypes: {
                    deliveryMethods: React.PropTypes.array
                },

                getInitialState() {
                    return {

                    };
                },

                onTabSelect(value) {

                },

                render() {
                    return (
                        <div></div>
                    );
                }
            });

            provide(OrderData);
        }
    );

}(
    this,
    this.modules,
    this.jQuery,
    this.React
));