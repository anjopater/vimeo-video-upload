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

