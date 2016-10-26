'use strict';


const uuid = require('uuid');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;


/**
 * Begin the Mobials JS SDK
 */
var MobialsAPI = {};

//we need to fetch our global MobialsAPI variable from wherever this was called.
(function (global){

    MobialsAPI = typeof global.MobialsAPI !== 'undefined' ? global.MobialsAPI : MobialsAPI;
    MobialsAPI.debug = typeof MobialsAPI.debug === 'undefined' ? false : MobialsAPI.debug;
    MobialsAPI.dispatch_uri = MobialsAPI.dispatch_uri ? MobialsAPI.dispatch_uri : 'https://api.mobials.com/tracker/dispatch';
    MobialsAPI.api_uri = MobialsAPI.api_uri ? MobialsAPI.api_uri : 'https://api.mobials.com/api/js';
    MobialsAPI.APIKey = MobialsAPI.APIKey ? MobialsAPI.APIKey : null;
    MobialsAPI.domain = MobialsAPI.domain ? MobialsAPI.domain : 'static.mobials.com';
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});


module.exports = {
    fetchRating: function(businessId, callback) {
        var http = new XMLHttpRequest();

        http.onreadystatechange = function() {
            if (this.readyState === 4) {
                callback(this.responseText);
            }
        };

        http.open("GET", MobialsAPI.api_uri + '/business/' + businessId + '/rating?access_token=' + MobialsAPI.APIKey, true);
        http.setRequestHeader("Content-type", "application/json");
        http.send();
    },

    fetchBatchRatings: function(businessIds, callback) {

        if (businessIds.length > 100) {
            throw "Maximum 100 businesses at a time";
        }

        var http = new XMLHttpRequest();

        http.onreadystatechange = function() {
            if (this.readyState === 4) {
                callback(this.responseText);
            }
        };

        var url = MobialsAPI.api_uri + '/businesses/ratings?access_token=' + MobialsAPI.APIKey + '&business_ids=';
        url += businessIds.join(',');

        http.open("GET", url, true);
        http.setRequestHeader("Content-type", "application/json");
        http.send();
    }
};
