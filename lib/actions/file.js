/**
 * Created by bface007 on 15/05/2017.
 */
const async = require('promise-async'),
      conf = require('../../conf'),
      rp = require('request-promise'),
      sha1 = require('sha1-file'),
      fs = require('fs-extra');

exports.getUploadUrl = (b2, bucketId) => {
  let formData = {bucketId};
  
  return b2._request.post({
    url: conf.API_GET_UPLOAD_URL,
    form: JSON.stringify(formData)
  });
};

exports.uploadFile = (b2, data) => {
  // Automatic retry, default is 3 attempts.
  let retryAttempts = ("retry" in data) && (new Number).isInteger(data.retry) ? data.retry : 3;
  
  console.log("uploadFile data --> \n", JSON.parse(data));
  
  // Run the following actions in parallel.
  // 1) Get an upload URL from B2
  // 2) Get the SHA1 of the file we are uploading.
  // 3) Prepare a readStream for upload.
  // and Upload the file
  return async.parallel([
    cb => {
      b2.getUploadUrl(data.bucketId)
        .then(response => {
          console.log("getUploadUrl --> \n", JSON.parse(response));
          
          data.endpoint = response;
          
          cb(null, true);
        })
        .catch(err => {
          cb(err, false);
        });
    },
    
    cb => {
      sha1(data.file, (err, sum) => {
        data.sha1 = sum;
        
        if(err){
          console.error("sha1 \n", err);
          return cb(err, false);
        }
        
        
        cb(null, true);
      })
    },
    
    cb => {
      fs.stat(data.file, (err, stat) => {
        if(err) {
          console.error("fs.stat \n", err);
          return cb(err, false);
        }
        
        
        data.stat = stat;
        data.readStream = fs.createReadStream(data.file);
        
        cb(null, true);
      });
    }
  ]).then(success => {
    console.log("Parallel --> ", success);
  
    // We are no longer using the default request object we've created, since this is not the API endpoint,
    // but an endpoint specifically for uploading data.
    let options = {
      url: data.endpoint.uploadUrl,
      body: data.readStream,
      headers: {
        "Authorization": data.endpoint.authorizationToken,
        "Content-Type": ("mimeType" in data) ? data.mimeType : conf.FILE_DEFAULT_CONTENT_TYPE,
        "Content-Length": data.stat.size,
        "X-Bz-File-Name": data.fileName,
        "X-Bz-Content-Sha1": data.sha1
      }
    };
    
    let postFile = cb => {
      rp.post(options).then(body => {
        console.log("postFile -->",  JSON.parse(body));
        return cb(null, JSON.parse(body));
      });
    };
    
    return async.retry({
      times: retryAttempts,
      interval: retryCount => {
        return 50 * Math.pow(2, retryCount);
      }
    }, postFile);
  });
};