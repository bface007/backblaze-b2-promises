/**
 * Created by bface007 on 14/05/2017.
 */
const conf = require('../../conf');

exports.TYPES = {
  ALL_PUBLIC: 'allPublic',
  ALL_PRIVATE: 'allPrivate'
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