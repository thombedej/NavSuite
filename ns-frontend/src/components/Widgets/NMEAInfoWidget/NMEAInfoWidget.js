import React from 'react';
import { Table } from 'react-bootstrap';
import Widget from '../Widget';

import { getStructure } from './InfoData';

const hoveredStyle = { backgroundColor: '#3f81eb', color: 'white', padding: '2px', borderRadius: '2px' }

class NMEAInfoWidget extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            hovered: null
        }
    }

    getField(message, n) {
        return message.split(/[,\*]/)[n] ? message.split(/[,\*]/)[n] : null
    }

    handleMouseEnter = (i) => {
        this.setState({ hovered: i })
    }

    handleMouseLeave = (i) => {
        this.setState({ hovered: null })
    }

    formatRow(field, e) {
        if (e.format(field) === null) {
            return <span style={{ color: 'gray' }}>null</span>
        }

        return <span className="noselect" style={this.isHovered(e.index) ? hoveredStyle : { padding: '2px' }}>
            {` ${e.prefix}${e.format(field)}${e.unit}`}
        </span>
    }

    isHovered(i) {
        return this.state.hovered === i
    }

    getTableRows = () => {
        let tableRows = []
        let structure = getStructure(this.props.message)
        let index = 0

        structure.forEach(e => {
            if (!this.getField(this.props.message, index + 1) && e.skippable) {
            } else {
                tableRows.push(
                    e.info ? <tr key={`row_${index}`}><td style={{ textAlign: 'center' }} colSpan={3}>{e.label}</td></tr> :
                        <tr
                            key={`row_${index}`}
                            onMouseEnter={_ => { this.handleMouseEnter(e.index) }}
                            onMouseLeave={_ => { this.handleMouseLeave(e.index) }}
                        >
                            <td className="noselect" style={{ width: '190px', color: '#707070' }}>
                                {
                                    <span className="d-block">
                                        {e.label}:
                                    </span>
                                }
                            </td>
                            <td >
                                {
                                    this.formatRow(this.getField(this.props.message, e.index + 1), e)
                                }
                            </td>
                            {
                                e.notes.length ? <td>
                                    {e.notes.map((note, i) =>
                                        <span key={`note_${index}_${i}`} className="d-block" style={{
                                            marginLeft: '0px',
                                            fontSize: '13px'
                                        }}>
                                            {note}
                                        </span>
                                    )}
                                </td> : <td></td>
                            }
                        </tr>
                )
            }

            index += 1
        })

        return tableRows
    }

    render() {
        let msgType, msgSplit
        let isMsg = this.props.message.length

        if (this.props.message) {
            msgType = this.props.message.split(/[,\*]/)[0]
            msgSplit = this.props.message.split(/[,\*]/).slice(1)
        }

        return (
            <Widget
                style={{ height: 'calc( 100vh - 150px )', width: 'calc(50% - 10px)', flex: 1 }}
                title={
                    isMsg ? <div style={{ width: '100%', height: '90px', padding: '20px', fontSize: '18px' }}>
                        {/* <span style={{ fontSize: '20px', height: '20px', width: '100%' }}>
                        G*GLL Message
                    </span> */}
                        <div className="noselect" style={{ height: '100px' }}>
                            <span className="d-block mb-1" style={{ fontSize: '14px', color: 'gray' }}>
                                Message
                            </span>
                            {msgType}
                            {
                                msgSplit.map((f, i) =>
                                    <span
                                        key={`message_field_${i}`}
                                        onMouseEnter={_ => { this.handleMouseEnter(i) }}
                                        onMouseLeave={_ => { this.handleMouseLeave(i) }}>
                                        {i < msgSplit.length - 1 ? ',' : '*'}
                                        <span style={this.isHovered(i) ? hoveredStyle : {}}>{f}</span>
                                    </span>
                                )
                            }
                        </div>
                    </div> : null
                }>
                <div style={{ height: 'calc(100% - 0px)', overflowY: 'auto', paddingLeft: '30px', paddingRight: '30px' }}>
                    {
                        isMsg ? <Table style={{ fontSize: '14px' }} size="sm" hover>
                            <tbody>
                                {this.getTableRows()}
                            </tbody>
                        </Table> : null
                    }
                </div>

            </Widget>
        )
    }
}

export default NMEAInfoWidget;