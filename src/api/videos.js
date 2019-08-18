import axios from 'axios';
import config from '../config';

export const addVideo = (data, headers) => {
    return axios.request({
        url: config.API_URL + `/me/videos/`,
        method: 'POST',
        data: data,
        headers: headers,
    });
};

export const getVideoStatus = (video_id, headers) => {
    return axios.request({
        url: config.API_URL + `/videos/${video_id}?fields=uri,upload.status,transcode.status`,
        method: 'GET',
        headers: headers,
    });
};
