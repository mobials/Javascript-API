'use strict';

var AnalyticsTracker = require('reviewsii-analytics-tracker');
var request = require('superagent');

/**
 * Begin the Mobials JS SDK
 */
var MobialsAPI = {};

//we need to fetch our global MobialsAPI variable from wherever this was called.
(function (global){

    MobialsAPI = typeof global.MobialsAPI !== 'undefined' ? global.MobialsAPI : MobialsAPI;
    MobialsAPI.debug = typeof MobialsAPI.debug === 'undefined' ? false : MobialsAPI.debug;
    MobialsAPI.dispatch_uri = MobialsAPI.dispatch_uri ? MobialsAPI.dispatch_uri : 'https://api.mobials.com/tracker/dispatch';
    MobialsAPI.APIUri = MobialsAPI.api_uri ? MobialsAPI.api_uri : 'https://api.mobials.com/api/js';
    MobialsAPI.APIKey = MobialsAPI.APIKey ? MobialsAPI.APIKey : null;
    MobialsAPI.domain = MobialsAPI.domain ? MobialsAPI.domain : 'static.mobials.com';
    MobialsAPI.language = MobialsAPI.language ? MobialsAPI.language : 'en';
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});

module.exports = {

    /**
     * Pass in your config before using
     *
     * @param config object containing config properties
     */
    init: function(config) {

        if (typeof config.APIKey === 'undefined' || !config.APIKey) {
            return null;
        }

        MobialsAPI.APIKey = config.APIKey;
        MobialsAPI.debug = config.debug ? config.debug : false;
        MobialsAPI.APIUri = config.APIUri ? config.APIUri : MobialsAPI.APIUri;
        MobialsAPI.language = config.language ? config.language : MobialsAPI.language;

        return true;
    },

    /**
     * Fetch rating information for a single business
     *
     * @param businessId
     * @param callback
     */
    fetchRating: function(businessId, callback) {

        if (!MobialsAPI.APIKey) {
            return callback({
                success: false,
                statusCode: 400,
                message: 'No API key has been set'
            });
        }

        var url = MobialsAPI.APIUri + '/business/' + businessId + '/rating?access_token=' + MobialsAPI.APIKey + '&language=' + MobialsAPI.language;

        request
            .get(url)
            .set('Content-Type', 'text/plain')
            .end(function(err, res){

                if (err || !res.ok) {
                    return callback({
                        success: false,
                        statusCode: err.code == 'ENOTFOUND' || !err.response ? 404 : err.response.statusCode,
                        message: err.response && err.response.body ? err.response.body.error : null
                    });
                }

                callback(res.body);
            });

        AnalyticsTracker.track('impression', {
            client_id: businessId,
            resource_id: 1
        });
    },

    /**
     * Fetch rating information for multiple business (max 100)
     *
     * @param businessIds
     * @param callback
     */
    fetchBatchRatings: function(businessIds, callback) {

        if (!MobialsAPI.APIKey) {
            return callback({
                success: false,
                statusCode: 400,
                message: 'No API key has been set'
            });
        }

        if (businessIds.length > 100) {
            return callback({
                success: false,
                statusCode: 400,
                message: 'Maximum 100 businesses can be passsed at a time'
            });
        }

        var url = MobialsAPI.APIUri + '/businesses/ratings?access_token=' + MobialsAPI.APIKey + '&language=' + MobialsAPI.language + '&business_ids=';
        url += businessIds.join(',');

        request
            .get(url)
            .set('Content-Type', 'text/plain')
            .end(function(err, res){

                if (err || !res.ok) {
                    return callback({
                        success: false,
                        statusCode: err.code == 'ENOTFOUND' || !err.response ? 404 : err.response.statusCode,
                        message: err.response && err.response.body ? err.response.body.error : null
                    });
                }

                callback(res.body);
            });

        var payloads = businessIds.map(function(businessId) {
            return {
                client_id: businessId,
                resource_id: 1
            };
        });

        AnalyticsTracker.trackBatch('impression', payloads);
    }
};

module.exports.init({
    APIKey: "0bc6f39f-b7b4-48c8-a230-c48ff3af6136"
});
module.exports.fetchRating(2, function(res) {
    console.log(res);
});