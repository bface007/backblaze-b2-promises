/**
 * Created by bface007 on 14/05/2017.
 */
let conf = require('../../conf');

exports.authorize = (b2) => {
  let options = {
    url: conf.API_AUTHENTICATION_URL,
    method: 'GET',
    json: true,
    resolveWithFullResponse: true,
    auth: {
      user: b2._accountId,
      password: b2._applicationKey
    }
  };
  
  return b2._request(options)
    .then(response => {
      console.log(response);
      return response;
    });
  
};