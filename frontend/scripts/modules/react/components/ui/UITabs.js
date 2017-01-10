(function(
    window,
    modules,
    $,
    React
){

    modules.define(
        'UITabs',
        [
            
        ],
        function(
            provide
        ) {

            let UITabs = React.createClass({
                displayName: 'UITabs',

                propTypes: {
                    options: React.PropTypes.array.isRequired,
                    onSelect: React.PropTypes.func.isRequired,
                    selected: React.PropTypes.string
                },

                getInitialState() {
                    return {
                        options: null,
                        selected: null
                    };
                },

                componentDidMount() {
                    if (this.props.selected) {
                        this.setState({
                            selected: this.props.selected
                        });
                    } else {
                        let options = Object.assign([], this.props.options);
                        options.forEach((option) => {
                            if (option.default) {
                                this.setState({
                                    selected: option.name
                                });
                            }
                        });
                        this.setState({ options });
                    }
                },

                componentWillReceiveProps(nextProps) {
                    if (nextProps.selected !== undefined && nextProps.selected !== this.state.selected) {
                        this.setState({
                            selected: nextProps.selected
                        });
                    }
                },

                onTabSelected(value) {
                    this.props.onSelect(value);
                },

                render() {
                    if (this.props.options === null) {
                        return null;
                    }

                    return (
                        <div className="ui-tabs">
                            { this.props.options.map((option) => {
                                let className = ['ui-tabs-item'];
                                if (option.name === this.state.selected) {
                                    className.push('m-selected');
                                }
                                return (
                                    <div className={className.join(' ')} onClick={this.onTabSelected.bind(this, option.name)}>{option.label}</div>
                                );
                            }) }

                        </div>
                    );
                }
            });

            provide(UITabs);
        }
    );

}(
    this,
    this.modules,
    this.jQuery,
    this.React
));