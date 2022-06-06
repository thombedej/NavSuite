import React from 'react';
import { Card } from 'react-bootstrap';

class Page extends React.Component {
    // constructor(props) {
    //     super(props);
    // }

    render() {
        return <div className="page">
            <h2 style={{ marginLeft: '30px' }}>{this.props.title}</h2>
            <div style={{padding:'5px'}}>
                <Card style={{ marginTop: '20px', padding: '30px', minHeight: '200px', borderRadius: '7px', borderWidth: '0px' }}>
                    {
                        this.props.children
                    }
                </Card>
            </div>
        </div>
    }
}

export default Page;