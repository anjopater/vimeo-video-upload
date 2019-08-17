import React, { Component } from 'react'
import * as api from '../../api/videos';
import tus from 'tus-js-client';
import config from '../../config';
import Progressbar from 'emerald-ui/lib/Progressbar';

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
            vimeoViewLink: ""
        }

        this.fileInput =  React.createRef();
    }

    componentDidMount() {
    }

    onChangeFile = (event) => {
        var fileList = event.target.files;
        this.setState({ files: fileList }, ()=>{
            this.addVideo();
        });
    }

    addVideo = async () => {
        this.setState({ uploadPercent : 5, isLoadingVideo: true});
        const files = this.state.files;
        try {
            const headers = {
                'Authorization': config.TOKEN,
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.vimeo.*+json;version=3.4'
            };

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
            
            const r = await api.addVideo(data, headers);
            console.log(r.data, r.data.embed.html, r.data.link);
            this.setState({ videoEmbed:r.data.embed.html, vimeoViewLink: r.data.link });
            this.uploadVideo(r.data.upload.upload_link);
        } catch (err) {
            console.log("Error to uploading video", err);
        }
    }

    uploadVideo = async (upload_link) => {
        const files = this.state.files;
        let self = this;
        try {
            var upload = new tus.Upload(files[0], {
                endpoint: upload_link,
                uploadUrl: upload_link,
                retryDelays: [0, 3000, 5000, 10000, 20000],
                metadata: {
                    filename: files[0].name,
                    filetype: files[0].type
                },

                onError: function (error) {
                    console.log("Failed because: " + error)
                },
                onProgress: function (bytesUploaded, bytesTotal) {
                    var percentage = (bytesUploaded / bytesTotal * 100).toFixed(2);
                    self.setState({uploadPercent: Math.round(percentage)});
                    console.log(bytesUploaded, bytesTotal, percentage + "%");
                },
                onSuccess: function () {
                    console.log("Download %s from %s", upload.file.name);
                    console.log(upload.url);
                    self.setState({ videoLoaded : true, isLoadingVideo: false });
                }
            })

            // Start the upload
            upload.start()

        } catch (error) {
            console.log(error);
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
                
                {this.state.videoLoaded && (
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

