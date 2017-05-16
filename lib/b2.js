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
  
  /*
        Authorize
   */
  authorize() {
    return actions.auth.authorize(this);
  }
  
  /*
        Bucket
   */
  createBucket(bucketName, bucketType = actions.bucket.TYPES.ALL_PRIVATE) {
    return actions.bucket.create(this, bucketName, bucketType);
  }
  
  deleteBucket(bucketId) {
    return actions.bucket.delete(this, bucketId);
  }
  
  listBuckets() {
    return actions.bucket.list(this);
  }
  
  updateBucket(bucketId, bucketType) {
    return actions.bucket.update(this, bucketId, bucketType);
  }
  
  /*
        File
   */
  getUploadUrl(bucketId) {
    return actions.file.getUploadUrl(this, bucketId);
  }
  
  uploadFile(data) {
    return actions.file.uploadFile(this, data);
  }
  
}

B2.prototype.BUCKET_TYPES = actions.bucket.TYPES;

module.exports = B2;