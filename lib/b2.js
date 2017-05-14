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
    this._authorizationTokens = [];
    this._downloadUrls = [];
    this._apiUrl = conf.API_URL;
    this._request = rp;
    this._minimumPartSize = -1;
  }
  
  authorize() {
    return actions.auth.authorize(this);
  }
  
  createBucket(bucketName, bucketType = actions.bucket.TYPES.ALL_PRIVATE) {
    return actions.bucket.create(this, bucketName, bucketType);
  }
  
}

B2.prototype.BUCKET_TYPES = actions.bucket.TYPES;

module.exports = B2;