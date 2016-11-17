'use strict';

var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const AnalyticsTracker = require('reviewsii-analytics-tracker');

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
        MobialsAPI.APIKey = config.APIKey;
        MobialsAPI.debug = config.debug ? config.debug : false;
        MobialsAPI.APIUri = config.APIUri ? config.APIUri : MobialsAPI.APIUri;
        MobialsAPI.language = config.language ? config.language : MobialsAPI.language;
    },

    /**
     * Fetch rating information for a single business
     *
     * @param businessId
     * @param callback
     */
    fetchRating: function(businessId, callback) {

        var http = new XMLHttpRequest();

        http.onreadystatechange = function() {
            if (this.readyState === 4) {
                callback(this.responseText);
            }
        };

        http.open("GET", MobialsAPI.APIUri + '/business/' + businessId + '/rating?access_token=' + MobialsAPI.APIKey + '&language=' + MobialsAPI.language, true);
        http.setRequestHeader("Content-type", "application/json");
        http.send();

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

        if (businessIds.length > 100) {
            throw "Maximum 100 businesses at a time";
        }

        var http = new XMLHttpRequest();

        http.onreadystatechange = function() {

            if (MobialsAPI.debug === true) {
                console.log('DEBUG readyState: ' + this.readyState + ', responseText: ' + this.responseText);
            }

            if (this.readyState === 4) {
                callback(this.responseText);
            }
        };

        var url = MobialsAPI.APIUri + '/businesses/ratings?access_token=' + MobialsAPI.APIKey + '&language=' + MobialsAPI.language + '&business_ids=';
        url += businessIds.join(',');

        http.open("GET", url, true);
        http.setRequestHeader("Content-type", "application/json");
        http.send();

        var payloads = businessIds.map(function(businessId) {
            return {
                client_id: businessId,
                resource_id: 1
            };
        });

        AnalyticsTracker.trackBatch('impression', payloads);
    }
};
