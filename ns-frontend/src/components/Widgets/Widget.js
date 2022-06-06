import React from 'react';
import { Card } from 'react-bootstrap';
import Loadable from '../Loadable';
import { BsX } from 'react-icons/bs'



class Widget extends React.Component {
    isLoadable = () => typeof this.props.loading === 'boolean'

    body = () => <Card
        className='noselect nodrag'
        style={{
            padding: '15px',
            width: '100%',
            height: '100%',
            borderRadius: '7px',
            borderWidth: '0px',
            position: 'relative',
            boxShadow: '3px 3px 6px 2px rgba(0,0,0,0.05)',
            overflow: 'hidden'
        }}>
        <div style={{
            display: this.props.widgetKey ? '' : 'none',
            // backgroundColor: '#dde5ed',
            width: '100%',
            height: '14px',
            position: 'absolute',
            top: '0px',
            left: '0px',
        }}>
            <div className='grabbable' style={{
                backgroundColor: '#dde5ed',
                width: 'calc(100% - 25px)',
                float: 'left',
                height: '100%'
            }} />
            <div
                onClick={e => {
                    this.props.removeItem(this.props.widgetKey);
                }}
                className='clickable darkenOnHover'
                style={{
                    backgroundColor: '#dde5ed',
                    position: 'absolute',
                    right: '0px',
                    height: '100%',
                    width: '25px',
                    // backgroundColor:'red',
                    // borderLeftStyle: 'solid',
                    // borderLeftWidth: '1px',
                    // borderLeftColor: '#d0d0d0',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                <BsX size={12} />
            </div>
        </div>
        <Card.Title style={{ marginTop: this.props.widgetKey ? '8px' : '', fontSize: '18px' }}>
            {this.props.title}
        </Card.Title>

        <div style={{ height: 'calc(100% - 39px)' }}>
            {
                this.props.children
            }
        </div>
    </Card>

    render() {
        return <div className="animated" style={
            { ...this.props.style, padding: '5px' }
        }>
            {
                this.isLoadable() ? <Loadable loading={this.props.loading}>
                    {this.body()}
                </Loadable> : this.body()
            }
        </div>
    }
}

export default Widget;