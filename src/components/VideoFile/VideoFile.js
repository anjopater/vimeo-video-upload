import React, { Component } from 'react'
import * as api from '../../api/videos';
import tus from 'tus-js-client';
import config from '../../config';
import Progressbar from 'emerald-ui/lib/Progressbar';
import Spinner from 'emerald-ui/lib/Spinner';
import Alert from 'emerald-ui/lib/Alert';

import './VideoFile.css';

class Home extends Component {
    constructor(props) {
        super(props);

        this.state = {
            videos: [],
            uploadPercent: 0,
            files: [],
            videoUrl: "",
            videoLoaded: false,
            isLoadingVideo: false,

            videoEmbed: "",
            vimeoViewLink: "",

            videoId: "",
            isVideoConverting: false,

            errorMessage: "",
            warningMessage: ""
        }

        this.fileInput =  React.createRef();

        this.headers = {
            'Authorization': config.TOKEN,
            'Content-Type': 'application/json',
            'Accept': 'application/vnd.vimeo.*+json;version=3.4'
        };

        this.intervalVideoStatusId = 0; 
    }

    componentDidMount() {
        if(!config.TOKEN) {
            this.setState({warningMessage: "Please set the Vimeo Token."});
        }
    }

    onChangeFile = (event) => {
        var fileList = event.target.files;
        this.setState({ files: fileList }, ()=>{
            this.addVideo();
        });
    }

    addVideo = async () => {
        this.setState({ uploadPercent : 1, isLoadingVideo: true});
        const files = this.state.files;
        try {
            let data = {
                "name": `${files[0].name}`,
                "upload": {
                    "approach": "tus",
                    "size": files[0].size
                },
                "privacy": {
                    "embed": "public"
                },
            }
            
            const r = await api.addVideo(data, this.headers);
            const videoId = r.data.uri.split("/")[2];
            this.setState({ videoEmbed:r.data.embed.html, vimeoViewLink: r.data.link, videoId: videoId });
            this.uploadVideo(r.data.upload.upload_link);
        } catch (err) {
            console.log("Error to uploading video", err);
            this.setState({errorMessage: "Ups! Something was wrong uplaoding the video."});
        }
    }

    uploadVideo = async (upload_link) => {
        const files = this.state.files;
        let self = this;
        try {
            let upload = new tus.Upload(files[0], {
                endpoint: upload_link,
                uploadUrl: upload_link,
                retryDelays: [0, 3000, 5000, 10000, 20000],
                metadata: {
                    filename: files[0].name,
                    filetype: files[0].type
                },

                onError: function (error) {
                    this.setState({errorMessage: "Ups! Something was wrong uplaoding the video."});
                    console.log("Failed because: " + error);
                },
                onProgress: function (bytesUploaded, bytesTotal) {
                    var percentage = (bytesUploaded / bytesTotal * 100).toFixed(2);
                    self.setState({uploadPercent: Math.round(percentage)});
                    console.log(bytesUploaded, bytesTotal, percentage + "%");
                },
                onSuccess: function () {
                    console.log("Download %s from %s", upload.file.name);
                    self.setState({ videoLoaded : true, isLoadingVideo: false, isVideoConverting: true });
                    self.intervalVideoStatusId = setInterval(()=>{
                        self.getVideoStatus();
                    }, 10000);
                }
            })

            // Start the upload
            upload.start()

        } catch (error) {
            console.log(error);
        }
    }

    getVideoStatus = async () => {
        try {
            const r = await api.getVideoStatus(this.state.videoId, this.headers);
            const status = r.data.transcode.status;
            if(status === "complete"){
                clearInterval(this.intervalVideoStatusId);
                this.setState({isVideoConverting: false});
            }
        } catch (err) {
            this.setState({errorMessage: "Ups! Something was wrong transcoding the the video."});
            console.log("Error to get video status", err);
        }
    }

    onSelectVideo = () => {
        this.fileInput.current.click();
    }

    render() {
        return (
            <div className="video-file">
                <input type="file" accept="video/*" onChange={this.onChangeFile} ref={this.fileInput} />
                <button className="btn-select-video" onClick={this.onSelectVideo}  disabled={this.state.isLoadingVideo}>
                    <i className="material-icons">cloud_upload</i>
                    <div>Upload you video </div>
                </button>
                <Progressbar
                    progress={this.state.uploadPercent}
                    color="success"
                    circle
                    size="lg"
                    style={{ marginBottom: '10px' }}
                />
                {this.state.errorMessage && (
                    <Alert color="danger">{this.state.errorMessage}</Alert>
                )}
                {this.state.warningMessage && (
                    <Alert color="warning">{this.state.warningMessage}</Alert>
                )}
                {this.state.isVideoConverting && (
                    <div className="transcoding-label">The video is transcoding for Vimeo, please hang on a minute... <Spinner color="success" size="sm"/></div>
                )}
                {(this.state.videoLoaded && !this.state.isVideoConverting) && (
                    <div>
                        <div>Watch the view in Vimeo </div>
                        <a href={this.state.vimeoViewLink}>{this.state.vimeoViewLink}</a>
                        <div dangerouslySetInnerHTML={{__html: this.state.videoEmbed}}></div>
                    </div>
                )}
            </div>
        )
    }
}

export default Home;

