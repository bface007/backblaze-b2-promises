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
    this._authorizationToken = null;
    this._downloadUrl = null;
    this._apiUrl = conf.API_URL;
    this._request = rp;
    this._minimumPartSize = -1;
    this._lastAuthorization = -1;
  }

  newRequest () {
    this._request = rp;
    return this;
  }
  
  getMinimumPartSize () {
    return this._minimumPartSize;
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
  
  uploadFiles(arrayOfData) {
    return actions.file.uploadFiles(this, arrayOfData);
  }
  
  startLargeFile(data) {
    return actions.file.startLargeFile(this, data);
  }
  
  getUploadPartUrl(fileId) {
    return actions.file.getUploadPartUrl(this, fileId);
  }
  
  uploadPart(data) {
    return actions.file.uploadPart(this, data);
  }
  
  finishLargeFile(data) {
    return actions.file.finishLargeFile(this, data);
  }
  
  uploadLargeFileWithChunks(args) {
    return actions.file.uploadLargeFileWithChunks(this, args);
  }
  
  getFileStream(args, cb) {
    return actions.file.getFileStream(this, args, cb);
  }
}

B2.prototype.BUCKET_TYPES = actions.bucket.TYPES;

module.exports = B2;