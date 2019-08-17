import React, { Component } from 'react';
import './ContentVideoUpload.css';

export default class ContentVideoUpload extends Component {
    constructor(props) {
        super(props)
    }

    render() {
        const { children } = this.props;
        return (
            <div className="content-video-upload">
                {children}
            </div>
        )
    }
}
