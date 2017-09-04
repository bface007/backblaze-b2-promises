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
  
  return b2
    .newRequest()
    ._request(options)
    .then(body => {
      
      b2._authorizationToken = null;
      b2._downloadUrl = null;
  
      b2._apiUrl = body.apiUrl + conf.API_VERSION_URL;
      b2._authorizationToken = body.authorizationToken;
      b2._lastAuthorization = Date.now();
      b2._downloadUrl = body.downloadUrl;
      b2._minimumPartSize = body.recommendedPartSize;
      
      // set default data for future call
      b2._request = b2._request.defaults({
        baseUrl: b2._apiUrl,
        method: 'GET',
        json: true,
        headers: {
          "Authorization": b2._authorizationToken
        }
      });
      
      // console.log("b2 --> \n", JSON.parse(b2));
      
      return body;
    });
  
};