import React, { Component } from 'react'
import VideoFile from '../VideoFile';
import ContentVideoUpload from '../ContentVideoUpload';
import './Home.css';

class Home extends Component {
    constructor(props) {
        super(props);       
    }

    render() {
        return (
            <div>
                <ContentVideoUpload>
                    <VideoFile />
                </ContentVideoUpload>
            </div>
        )
    }
}

export default Home;

