import React from 'react';

class Animated extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            loaded: false
        }
    }

    componentDidMount() {
        setTimeout(() => { this.setState({ loaded: true }) }, this.props.delay * 1000)
    }

    render() {
        let enterDuration = this.props.enterDuration ? this.props.enterDuration : 800

        return this.state.loaded ? <div style={{
            animation: `${this.props.animation ? this.props.animation : 'fadeIn'} linear ${ (this.props.enterDuration ? this.props.enterDuration : 800) / 1000}s`
        }}>
            {this.props.children}
        </div> : null
    }

}

export default Animated;