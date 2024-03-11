const axios = require('axios');
const {writeLogger, ERROR} = require(".");
const {BACKEND_TOKEN} = require('../config');


module.exports = {
    fetch: async (url, type = 'get', data=null, config = {}) => {
        config['headers'] = {"Authorization": BACKEND_TOKEN};
        let request;
        if(data) {
            request = axios[type](url, data, config)
        } else {
            request = axios[type](url, config)
        }
        return request
            .then(function (response) {
                return response;
            })
            .catch(function (error) {
                writeLogger(`${ERROR}.txt`, {
                    type: ERROR,
                    message: url,
                    err: JSON.stringify(error),
                    file: 'fetch.js'
                }, true)
                return error;
            });
    }
}