import React from 'react';
import { Fade, Spinner } from 'react-bootstrap';

class Loadable extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {

        return (
            <div className="Loadable" style={{
                width: '100%',
                height: '100%',
                position: 'relative',
            }}>
                <div style={{
                    // display: this.props.loading ? 'flex' : 'none',
                    display: 'flex',
                    width: '100%',
                    height: '100%',
                    position: 'absolute',
                    justifyContent: 'center',
                    alignItems: 'center',
                    animation: this.props.loading ? '' : 'fadeOut ease 0.4s forwards',
                    zIndex: 999
                    // visibility: this.props.loading ? 'visible' : 'hidden'
                }}>
                    <div
                        style={{
                            // display: this.props.loading ? '' : 'none',
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            backgroundColor: this.props.color ? this.props.color : 'white',
                            opacity: this.props.opacity ? this.props.opacity : 0.8,
                            // zIndex: 98,
                            borderRadius: '7px'
                        }}
                    />
                    <Spinner
                        style={{
                            ...this.props.style,
                            // zIndex: 99
                        }}
                        as="span"
                        animation="border"
                        role="status"
                        aria-hidden="true"
                    />
                </div>

                {this.props.children}
            </div>
        )
    }
}

Loadable.defaultProps = {
    style: {
        width: '40px',
        height: '40px'
    }
}

export default Loadable;