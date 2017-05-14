/**
 * Created by bface007 on 14/05/2017.
 */
let conf = require('../conf'),
    actions = require('./actions'),
    rp = require('request-promise');

class B2 {
  constructor(options) {
    this._accountId = options.accountId;
    this._applicationKey = options.applicationKey;
    this._authorizationKeys = [];
    this._downloadUrls = [];
    this._apiUrl = conf.API_URL;
    this._request = rp;
  }
  
  authorize() {
    return actions.auth.authorize(this);
  }
  
}

module.exports = B2;