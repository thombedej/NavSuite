import React from 'react';
import { Button, Fade } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import Animated from '../../Animated';
import Page from '../Page'

class Landing extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            animation: 0
        }
    }


    animate = (...delays) => {
        delays.reduce((p, x) => p
            .then(_ => this.delay(x)),
            Promise.resolve()
        )
    }

    delay(duration) {
        return new Promise((resolve) => {
            setTimeout(() => {
                this.setState({ animation: this.state.animation + 1 })
                return resolve()
            }, duration * 1000);
        });
    }

    componentDidMount() {
        this.animate(0.2, 0.2, 0.7, 0.2)
    }

    loaded = (step) => this.state.animation >= step ? true : false

    render() {
        return <div className="page" style={{ overflowX: 'hidden' }}>
            <div style={{ width: '100%', marginBottom: '100px', height: '600px' }}>
                <div style={{ width: '50%', fontSize: '20px', marginTop: '40px', float: 'left' }}>
                    <Animated delay={0.5}>
                        <h1
                            style={{
                                fontSize: '90px',
                                marginTop: '200px',
                                marginBottom: '40px'
                            }}>
                            NavSuite
                        </h1>
                    </Animated>
                    <Animated delay={0.6}>
                        <span>
                            Welcome to NavSuite! The <b>FIIT Remote Laboratory</b> for the analysis and comparison of data acquired from the Global Navigation Satellite Systems - <b>GPS</b>, <b>GLONASS</b>, <b>Galileo</b> and <b>BeiDou</b>.
                        </span>
                    </Animated>
                </div>

                <Animated delay={1.5} animation='fadeInLeft'>
                    <div style={{ width: '50%', float: 'right', display: 'flex', justifyContent: 'center', marginTop: '160px' }}>
                        <img src="./images/Galileo_satellite.png" width="450px" style={{
                            margin: 'auto',
                            animation: 'shiver 7.5s ease-in-out infinite',
                            animationDelay: '-0.5s'
                        }} />
                    </div>
                </Animated>
                <Animated delay={2} animation='fadeInRight'>
                    <div style={{ width: '50%', float: 'right', display: 'flex', justifyContent: 'center', marginTop: '60px' }}>
                        <img src="./images/BeiDou_satellite.png" width="500px" style={{
                            margin: 'auto',
                            animation: 'shiver 7.5s ease-in-out infinite'
                        }} />
                    </div>
                </Animated>
            </div>

            <div style={{ display: 'flex', width: '100%', justifyContent: 'center' }}>

                <Animated delay={0.6}>
                    <NavLink to="/dashboard">
                        <Button style={{ width: '200px', height: '60px' }}>ANALYZE DATA</Button>
                    </NavLink>
                </Animated>
            </div>
            <div style={{ display: 'flex', width: '100%', justifyContent: 'center', marginTop:'5px' }}>

                <Animated delay={2.1}>
                    <NavLink to="/about">
                        <Button variant='link' style={{ width: '200px', lineHeight:'30px', textDecoration:'none !important' }}>Learn more</Button>
                    </NavLink>
                </Animated>
            </div>

            {/* <img src="./images/GLONASS_satellite.png" width="300px" style={{ position: 'absolute', left: '20%', bottom: '60px' }} /> */}
            {/* <img src="./images/GPS_satellite.png" width="300px" style={{ position: 'absolute', right: '10%', bottom: '60px' }} /> */}
        </div>
    }
}

export default Landing;
