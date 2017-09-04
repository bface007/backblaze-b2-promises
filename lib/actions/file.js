/**
 * Created by bface007 on 15/05/2017.
 */
const async = require('promise-async'),
      conf = require('../../conf'),
      rp = require('request-promise'),
      myRequest = require('request'),
      sha1 = require('sha1'),
      fs = require('fs-extra'),
      utils = require('../utils'),
      https = require('https');

exports.getUploadUrl = (b2, bucketId) => {
  let formData = { bucketId: bucketId };
  
  return b2._request.post({
    url: conf.API_GET_UPLOAD_URL,
    form: JSON.stringify(formData)
  });
};

exports.uploadFile = (b2, data) => {
  console.log('uploadFile enter');
  // Automatic retry, default is 3 attempts.
  let retryAttempts = ("retry" in data) && (new Number).isInteger(data.retry) ? data.retry : 3;
  console.log('uploadFile after retryAttempts');
  // Run the following actions in parallel.
  // 1) Get an upload URL from B2
  // 2) Get the SHA1 of the file we are uploading.
  // 3) Prepare a readStream for upload.
  // and Upload the file
  return async.parallel([
    cb => {
      b2.getUploadUrl(data.bucketId)
        .then(response => {
          console.log('get upload url');
          console.log(response);
          console.log("\n");
          
          data.endpoint = response;
          
          cb(null, true);
        })
        .catch(err => {
          cb(err, false);
        });
    },
    
    cb => {
      utils.sha1(data.file)
        .then(result => {
          console.log('sha1 succeeded');
          data.sha1 = result.toString('hex');
          cb(null, true);
        })
        .catch(err => {
          console.log('sha1 failed');
          cb("failed to create sha1", {});
        });
    }
  ]).then(success => {
    // We are no longer using the default request object we've created, since this is not the API endpoint,
    // but an endpoint specifically for uploading data.
    let options = {
      url: data.endpoint.uploadUrl,
      body: data.file,
      headers: {
        "Authorization": data.endpoint.authorizationToken,
        "Content-Type": ("mimeType" in data) ? data.mimeType : conf.FILE_DEFAULT_CONTENT_TYPE,
        // "Content-Length": data.stat.size,
        "X-Bz-File-Name": data.fileName,
        "X-Bz-Content-Sha1": data.sha1
      },
      resolveWithFullResponse: false
    };
  
    let postFile = cb => {
      rp.post(options)
        .then(response => {
          cb(null, JSON.parse(response));
        })
        .catch(err => {
          cb(err, {})
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

exports.uploadFiles = (b2, arrayOfData) => {
  
  if(!Array.isArray(arrayOfData)) {
    return new Promise( (resolve, reject) => {
      reject("Argument is not an array");
    });
  }else {
    return async.map(arrayOfData, (data, cb) => {
      
      let upload = callback => {
        b2.uploadFile(data)
          .then(response => {
            callback(null, response);
          })
          .catch(err => {
            callback(err, {})
          });
      };
      
      async.retry({
        times: 3,
        interval: retryCount => {
          return 50 * Math.pow(2, retryCount);
        }
      }, upload)
        .then(response => {
          cb(null, response);
        })
        .catch(err => {
          cb(err, {})
        })
    })
  }
};

exports.startLargeFile = (b2, args) => {
  let formData = {
    bucketId:     args.bucketId,
    fileName:     args.fileName,
    contentType:  ("contentType" in args) ? args.contentType : conf.FILE_DEFAULT_CONTENT_TYPE
  };
  
  console.log("startLargeFile --> args \n");
  console.log(formData);
  
  return b2._request.post({
    url: conf.API_START_LARGE_FILE,
    form: JSON.stringify(formData)
  })
};

exports.getUploadPartUrl = (b2, fileId) => {
  let formData = {fileId};
  
  return b2._request.post({
    url: conf.API_GET_UPLOAD_PART_URL,
    form: JSON.stringify(formData)
  });
};

exports.uploadPart = (b2, args) => {
  // Automatic retry, default is 3 attempts.
  let retryAttempts = ("retry" in args) && (new Number).isInteger(args.retry) ? args.retry : 3;
  
  console.log("uploadPart start");
  
  return async.parallel([
    cb => {
      b2.getUploadPartUrl(args.fileId)
        .then(response => {
          console.log("getUploadPartUrl response --> \n");
          console.log(response);
          args.endpoint = response;
          cb(null, true);
        })
        .catch(err => {
          cb(err, false);
        })
    },
    
    cb => {
      utils.sha1(args.part)
        .then(result => {
          console.log('sha1 succeeded');
          args.sha1 = result.toString('hex');
          cb(null, true);
        })
        .catch(err => {
          cb('sha1 failed', {});
        });
    }
  ]).then(success => {
    console.log("parallel success --> \n");
    console.log(success);
    
    let options = {
      url: args.endpoint.uploadUrl,
      body: args.part,
      headers: {
        "Authorization": args.endpoint.authorizationToken,
        "X-Bz-Part-Number": args.partNumber,
        "Content-Length": args.part.byteLength,
        "X-Bz-Content-Sha1": args.sha1
      }
    };
  
    let postFile = cb => {
      console.log("postFile start");
      rp.post(options)
        .then(response => {
          cb(null, JSON.parse(response));
        })
        .catch(err => {
          cb(err, {})
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

/**
 *
 * @param b2
 * @param args
 * @returns {*}
 */
exports.finishLargeFile = (b2, args) => {
  let formData = {
    fileId: args.fileId,
    partSha1Array: args.partSha1Array
  };
  
  console.log("finishLargeFile --> args \n");
  console.log(formData);
  
  return b2._request.post({
    url: conf.API_FINISH_LARGE_FILE,
    form: JSON.stringify(formData)
  });
};

/**
 *
 * @param b2
 * @param args - example : {
 *    bucketId : "" // bucket id,
 *    fileName : "" // the file name,
 *    contentType: "" // file mime type,
 *    parts : [] // array of chunked file part object (chunked buffer & part number) ex: { buffer: "", partNumber: 0}
 * }
 * @returns {Promise.<TResult>}
 */
exports.uploadLargeFileWithChunks = (b2, args) => {
  return b2.startLargeFile(args)
    .then(response => {
      return async.map(args.parts, (part, cb) => {
        let data = {};
        
        data.part = part.buffer;
        data.partNumber = part.partNumber;
        data.fileId = response.fileId;
        
        b2.uploadPart(data).then(response => {
          cb(null, JSON.parse(response));
        }).catch(err => {
          cb(err, false);
        });
      });
    })
    .then(results => {
      console.log("finishLargeFile pre -->");
      console.log(results);
      
      let partSha1Array = [];
      
      results.map(result => {
        partSha1Array.push(result.contentSha1);
      });
      
      return b2.finishLargeFile({
        fileId: results[0].fileId,
        partSha1Array: partSha1Array
      })
    })
};

/**
 *
 * @param b2
 * @param args - example : {
 *    fileId: '' // requested file id,
 *    range: 'bytes=0-9' || null // range of the file
 * }
 */
exports.getFileStream = (b2, args, cb) => {
  // let options = {
  //   uri: `${b2._downloadUrl + conf.API_VERSION_URL + conf.API_DOWNLOAD_FILE_BY_ID}?fileId=${args.fileId}`,
  //   headers: {
  //     Authorization: b2._authorizationToken,
  //     Range: args.range
  //   }
  // };
  //
  // // return new Promise((resolve, reject) => {
  // //   myRequest(options)
  // //     .on('error', err => reject(err))
  // //     .on('response', response => resolve);
  // // });
  // return myRequest(options);
  
  // Create file URL
  let reqData = {
    method: "GET",
    host: `${b2._downloadUrl}`.substring(8), // remove https,
    path: `${conf.API_VERSION_URL + conf.API_DOWNLOAD_FILE_BY_ID}?fileId=${args.fileId}`,
    headers: {
      Authorization: b2._authorizationToken,
      Range: args.range
    }};
  
  return https.get(reqData, cb);
};