/**
 * Created by bface007 on 19/05/2017.
 */
const cryptoPromise = require('crypto-promise');

exports.retry = (options, fn) => {
  let error = {};
  let timeOut;
  
  return new Promise((resolve, reject) => {
    if(typeof fn !== 'function') reject('second parameter must be a function');
    
    let attempt = () => {
      
      if(options.times === 0) {
        reject(error);
      }
      else {
        fn()
          .then(response => {
            
            if(timeOut) timeOut.clearTimeout();
            
            resolve(response)
          })
          .catch(e => {
            options.times = options.times - 1;
            error = e;
            console.error(e);
            timeOut = setTimeout(() => attempt(), options.interval);
          });
      }
    };
    
    attempt();
  });
};

exports.requestError = (data) => {
  let err = function(data) {
    
    // Attempt to grab the error from the request. If we don't validate this as a proper API return
    // from backblaze, then we will provide a generic error return instead. (DNS error, unplugged
    // network cable, backblaze down, etc)
    try {
      
      if(!("body" in data) || typeof(data.body) !== "object")
        throw "Request body did not return as an object.";
      
      this.api = data.body;
      
    } catch(e) {
      
      // Setup default JSON with error message.
      let message = typeof(data) === "string"?data:"Error connecting to B2 service.";
      this.api = { status: 0, code: "application_error", message: message };
      
      // Assign the other bits.
    } finally {
      
      this.requestObject = data;
      this.status  = this.api.status;
      this.code    = this.api.code;
      this.message = this.api.message;
      
    }
    
  };
  
  // Assign our function to error & return.
  err.prototype = Error.prototype;
  return new err(data);
};

exports.sha1 = data => {
  return cryptoPromise.hash('sha1')(data);
};