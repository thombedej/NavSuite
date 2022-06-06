import React from 'react';
import Widget from '../../Widgets/Widget';
import NMEAInfoWidget from '../../Widgets/NMEAInfoWidget/NMEAInfoWidget';
import { BsPauseFill, BsSkipEndFill } from "react-icons/bs";
import { GNSS_INFO_LIST } from './Dashboard';

class Messages extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            msgs: [],
            gnss: 'GP',
            selectedType: '',
            selectedIndex: null,
            hovered: '',
            paused: false,
        }
    }

    displayedMessages() {
        return this.state.msgs.filter(msg => msg.slice(1, 3) === this.state.gnss)
    }

    componentWillReceiveProps(newProps) {
        if (!this.state.paused) {
            this.setState({ msgs: newProps.messages })
        }
    }

    selectedMsg = () => {
        if (this.state.selectedType === '')
            return this.displayedMessages()[0]

        let indices = this.displayedMessages().reduce(
            (arr, e, i) =>
                ((e.slice(3, 6) === this.state.selectedType) && arr.push(i), arr),
            []
        )

        return this.state.selectedIndex > indices.length ?
            this.displayedMessages()[indices[indices.length - 1]] :
            this.displayedMessages()[indices[this.state.selectedIndex]]


        // return this.state.msgs[
        //     this.state.msgs.findIndex(msg => msg.slice(3, 6) === this.state.selectedType)
        //     + this.state.selectedIndex
        // ]
    }

    handleMsgClick = (msg, index) => {
        let msgType = msg.slice(3, 6)
        let indices = this.displayedMessages().reduce(
            (arr, e, i) =>
                ((e.slice(3, 6) === msgType) && arr.push(i), arr),
            []
        )

        this.setState({
            selectedType: msgType,
            selectedIndex: indices.findIndex((i) => i === index)
        })
    }

    render() {
        return (
            <div
                // className='main-content'
                style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    flexDirection: 'row',
                    justifyContent: 'stretch'
                }}>
                <Widget style={{ minWidth: '550px', width:'calc(50% - 10px)', height: 'calc( 100vh - 150px )', flex: 1 }}
                    title={<div style={{
                        width: '550px',
                        margin: 'auto',
                        display: 'flex',
                        justifyContent: 'center'
                    }}>
                        {
                            GNSS_INFO_LIST.map(gnss =>
                                <div
                                    onClick={e => this.setState({ gnss: gnss.label, selectedType: '', selectedIndex: null })}
                                    className="noselect clickable"
                                    key={`${gnss.label}_option`}
                                    style={{
                                        width: '25%',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        padding: '10px',
                                        fontSize: '14px',
                                        // backgroundColor: this.state.gnss === gnss.label ? '#fafafa' : '',
                                        borderBottomStyle: this.state.gnss === gnss.label ? 'solid' : '',
                                        borderColor: gnss.color
                                    }}>
                                    {
                                        this.state.gnss === gnss.label ?
                                            <b>{gnss.name}{gnss.flag({ marginLeft: '5px' })}</b> :
                                            <span style={{ opacity: '50%' }}>{gnss.name}{gnss.flag({ marginLeft: '5px' })}</span>
                                    }
                                </div>
                            )
                        }
                    </div>}>

                    <div style={{ width: '100%', height: '100%', padding: '30px', display: 'flex' }}>
                        {
                            this.displayedMessages().length > 0 ? <div id="message-batch">
                                <span style={{ fontSize: '14px', color: 'gray' }}>Message batch</span>
                                <br />
                                {this.displayedMessages().map((msg, i) =>
                                    <span
                                        key={`message_${i}`}
                                        className="clickable"
                                        onClick={_ => {
                                            this.handleMsgClick(msg, i)
                                        }}
                                        onMouseEnter={_ => { this.setState({ hovered: msg }) }}
                                        onMouseLeave={_ => { this.setState({ hovered: '' }) }}

                                        style={{
                                            display: 'block',
                                            fontSize: '15px',
                                            marginBottom: '4px',
                                            marginLeft: this.state.hovered === msg ? '5px' : '0px',
                                            transition: 'ease 0.1s',
                                        }}>
                                        {
                                            this.selectedMsg() === msg ? <b style={{ textDecoration: 'underline' }}>{msg}</b> : msg
                                        }
                                    </span>
                                )}
                            </div> : <span style={{ fontSize: '14px', color: 'gray', margin: 'auto' }}>
                                No {this.state.gnss} NMEA messages.
                            </span>
                        }


                        {/* <div style={{
                            height: '100px',
                            width: '100%',
                            position: 'absolute',
                            bottom: '0px',
                            left: '0px',
                            right: '0px',
                            display: 'flex',
                            justifyContent: 'center'
                        }}>
                            <BsPauseFill
                                className="clickable opacityHover"
                                onClick={e => this.setState({ paused: true })}
                                style={{ opacity: this.state.paused ? '100%' : '50%' }}
                                size={40} />
                            <div style={{ width: '40px' }}></div>
                            <BsSkipEndFill
                                className="clickable opacityHover"
                                onClick={e => this.setState({ paused: false })}
                                style={{ opacity: !this.state.paused ? '100%' : '50%' }}
                                size={40} />
                        </div> */}
                    </div>
                </Widget>

                {this.selectedMsg() ? <NMEAInfoWidget message={this.selectedMsg()} /> : <div style={{ flex: 1 }} />}
            </div>
        )
    }

}

export default Messages;