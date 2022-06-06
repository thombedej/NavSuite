import React from 'react';
import { Navbar, Nav, Container, Image, Card, Fade } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import { BsQuestion } from 'react-icons/bs';
import { BiData, BiLineChart } from 'react-icons/bi';
import { HiHome } from 'react-icons/hi';

const WIDTH = 80
const FULL_WIDTH = 180

function NavBar() {
    const [expanded, setExpanded] = React.useState(false)
    const [anim, setAnim] = React.useState(false)
    const [selected, setSelected] = React.useState('')

    function navButton(page) {
        return <NavLink
            exact
            to={page.path}
            className="clickable lighten"
            style={isActive => ({
                marginBottom: '15px',
                height: '40px',
                width: '100%',
                borderRadius: '5px',
                backgroundColor: '#292936',
                display: 'flex',
                justifyContent: 'start',
                alignItems: 'center',
                position: 'relative',
                outlineStyle: isActive ? 'solid' : '',
                outlineWidth: '1px',
                outlineColor: '#3f81eb',
            })}>
            <div style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'absolute' }}>
                {page.icon}
            </div>
            <div style={{ position: 'absolute' }}>
                {
                    <Fade in={expanded && !anim} timeout={5000}>
                        <div style={{
                            display: !anim ? '' : 'none',
                            color: 'white',
                            marginLeft: '45px',
                        }}>
                            {page.label}
                        </div>
                    </Fade>
                }
            </div>
        </NavLink>
    }

    return (
        // <Navbar bg="dark" variant="dark">
        //     <Container>
        //         <Navbar.Brand>
        //             <Image style={{ width: '28px', marginRight: '10px' }} src="./images/satellite_icon.png" />
        //             NavSuite
        //         </Navbar.Brand>
        //         <Nav className="me-auto">
        //             <NavLink className="nav-link" to="/dashboard">DASHBOARD</NavLink>
        //             <NavLink className="nav-link" to="/data">GET DATA</NavLink>
        //             <NavLink className="nav-link" to="/about">ABOUT</NavLink>
        //         </Nav>
        //     </Container>
        // </Navbar>

        <Card
            onTransitionEnd={e => {
                setAnim(false)
            }}
            style={{
                width: `${expanded ? FULL_WIDTH : WIDTH}px`,
                position: 'absolute',
                height: '100%',
                backgroundColor: '#1d1d26',
                display: 'flex',
                borderRadius: '0px',
                // marginTop:'200px',
                alignItems: 'center',
                transition: 'ease-in 0.12s',
                boxShadow: '2px 0px 7px 1px rgba(0,0,0,0.5)'
            }}>
            {/* <div style={{ height: '10%', display: 'flex', alignItems: 'center' }}>
                <Image style={{ width: '20px' }} src="./images/satellite_icon.png" />
                <h1 style={{ fontSize: '16px', color: 'white', display:'inline', marginLeft:'5px' }}>NavSuite</h1>
            </div> */}
            <div
                onMouseEnter={e => { setExpanded(true); setAnim(true) }}
                onMouseLeave={e => { setExpanded(false); setAnim(true) }}
                onClick={e => { setSelected() }}
                style={{ padding: '20px', width: '100%', fontSize: '12px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>

                {navButton({
                    icon: <HiHome color='white' size={20} />,
                    label: 'LANDING',
                    path: '/'
                })}

                {[
                    { icon: <BiLineChart color='white' size={20} />, label: 'DASHBOARD', path: '/dashboard' },
                    { icon: <BiData color='white' size={20} />, label: 'GET DATA', path: '/data' },
                    { icon: <BsQuestion color='white' size={25} />, label: 'ABOUT', path: '/about' },
                ].map(page => navButton(page))}

            </div>
        </Card>
    )
}

export default NavBar