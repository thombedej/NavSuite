import React from 'react';
import Page from '../Page';

class About extends React.Component {
    constructor(props) {
        super(props);

        this.state = {

        }
    }

    render() {
        return <div style={{ width: '900px', margin: 'auto', marginTop: '50px', marginBottom: '50px', padding: '50px 100px 100px 100px', backgroundColor: 'white', borderRadius: '7px' }}>
            <h2 className='mb-5'>About NavSuite</h2>


            NavSuite is a Masters project, that was created as a distance education solution for
            satellite navigation systems. Built as a GNSS remote laboratory, this system allows students
            of FIIT STU and other users to explore, analyze and obtain data in the field of navigation
            systems.
            <br />
            This system uses data acquired by 4 GNSS receivers situated at the roof of the FIIT building
            in Bratislava, Slovakia. Each of these receivers is configured to listen to 1 of the 4 main
            GNSS in the Earth's Medium Earth Orbit - United States' Global Positioning System,
            Europe's Galileo, Russia's GLONASS and China's BeiDou system.
            <br />
            We set out to allow our users to compare the positioning data provided by each of these
            systems without having to own a set of receivers themselves. By having this system be available
            over the internet as a web application, students of FIIT's Satellite Navigation course can work
            in the same environment, whether it be on school premises or at home.

            <h4 style={{ marginTop: '60px' }}>System Diagram</h4>
            <img
                alt="diagram"
                src='./system_diagram.drawio.svg'
                width='700px'
                style={{ marginTop: '40px' }}
            />
        </div>
    }
}

export default About;