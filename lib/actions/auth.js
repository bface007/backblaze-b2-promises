/**
 * Created by bface007 on 14/05/2017.
 */
let conf = require('../../conf');

exports.authorize = (b2) => {
  
  let options = {
    url: conf.API_AUTHENTICATION_URL,
    method: 'GET',
    json: true,
    resolveWithFullResponse: false,
    auth: {
      user: b2._accountId,
      password: b2._applicationKey
    }
  };
  
  return b2._request(options)
    .then(body => {
      
      b2._authorizationTokens = [];
      b2._downloadUrls = [];
  
      b2._apiUrl = body.apiUrl;
      b2._authorizationTokens.push(body.authorizationToken);
      b2._downloadUrls.push(body.downloadUrl);
      b2._minimumPartSize = body.minimumPartSize;
      
      // set default data for future call
      b2._request = b2._request.default({
        baseUrl: conf.API_URL,
        method: 'GET',
        json: true,
        headers: {
          "Authorization": b2._authorizationTokens[0]
        }
      });
      
      return body;
    });
  
};