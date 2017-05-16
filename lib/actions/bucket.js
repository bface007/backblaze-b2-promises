/**
 * Created by bface007 on 14/05/2017.
 */
const conf = require('../../conf'),
      allPublic = 'allPublic',
      allPrivate = 'allPrivate';

exports.TYPES = {
  ALL_PUBLIC: allPublic,
  ALL_PRIVATE: allPrivate
};

exports.create = (b2, bucketName, bucketType) => {
  let formData = {
    accountId: b2._accountId,
    bucketName,
    bucketType
  };
  
  return b2._request.post({
    url: conf.API_CREATE_BUCKET_URL,
    form: JSON.stringify(formData)
  });
};

exports.delete = (b2, bucketId) => {
  let formData = {
    accountId: b2._accountId,
    bucketId
  };
  
  return b2._request.post({
    url: conf.API_DELETE_BUCKET_URL,
    form: JSON.stringify(formData)
  });
};

exports.list = (b2) => {
  let formData = {
    accountId: b2._accountId
  };
  
  return b2._request.post({
    url: conf.API_LIST_BUCKETS_URL,
    form: JSON.stringify(formData)
  });
};

exports.update = (b2, bucketId, bucketType) => {
  bucketType = [allPublic, allPrivate].indexOf(bucketType) > -1 ? bucketType : null;
  
  let formData = {bucketId, bucketType};
  
  return b2._request.post({
    url: conf.API_UPDATE_BUCKET_URL,
    form: JSON.stringify(formData)
  });

};