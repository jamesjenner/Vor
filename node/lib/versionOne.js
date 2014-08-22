/*jlint node: true */
/*global require, console, exports, module */

'use strict';

var request = require('request');

var END_POINT = '/query.v1';

var init = exports.init = function(host) {
    return {
        testABC: function(callback) {
            /*
            Return a list of object literals containing the name and color of all jobs on the Jenkins server
            */
            request({method: 'GET', url: host + END_POINT}, function(error, response, body) {
                if ( error || response.statusCode !== 200 ) {
                    callback(error || true, response);
                    return;
                }
                var data = JSON.parse(body.toString()).jobs;
                callback(null, data);
            });
        },
    };
};

if (!module.parent) {
}