/**
 * Created by bface007 on 15/05/2017.
 */
const async = require('promise-async'),
      conf = require('../../conf'),
      rp = require('request-promise'),
      sha1 = require('sha1'),
      fs = require('fs-extra');

exports.getUploadUrl = (b2, bucketId) => {
  let formData = { bucketId: bucketId };
  
  return b2._request.post({
    url: conf.API_GET_UPLOAD_URL,
    form: JSON.stringify(formData)
  });
};

exports.uploadFile = (b2, data) => {
  // Automatic retry, default is 3 attempts.
  let retryAttempts = ("retry" in data) && (new Number).isInteger(data.retry) ? data.retry : 3;
  
  // Run the following actions in parallel.
  // 1) Get an upload URL from B2
  // 2) Get the SHA1 of the file we are uploading.
  // 3) Prepare a readStream for upload.
  // and Upload the file
  return async.parallel([
    cb => {
      b2.getUploadUrl(data.bucketId)
        .then(response => {
          
          data.endpoint = response;
          
          cb(null, true);
        })
        .catch(err => {
          cb(err, false);
        });
    },
    
    cb => {
      data.sha1 = sha1(data.file);
      cb(null, true);
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
      }
    };
    
    let postFile = cb => {
      rp.post(options).then(body => {
        return JSON.parse(body);
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
    return async.map(arrayOfData, data => {
      return b2.uploadFile(data);
    })
  }
};

exports.startLargeFile = (b2, args) => {
  let formData = {
    bucketId:     args.bucketId,
    fileName:     args.fileName,
    contentType:  ("contentType" in args) ? args.contentType : conf.FILE_DEFAULT_CONTENT_TYPE
  };
  
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
  
  return async.parallel([
    cb => {
      b2.getUploadPartUrl(args.fileId)
        .then(response => {
          args.endpoint = response;
          cb(null, true);
        })
        .catch(err => {
          cb(err, false);
        })
    },
    
    cb => {
      args.sha1 = sha1(args.part);
      cb(null, true)
    }
  ]).then(success => {
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
      rp.post(options).then(body => {
        return JSON.parse(body);
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

exports.finishLargeFile = (b2, args) => {
  let formData = {
    fileId: args.fileId,
    partSha1Array: args.partSha1Array
  };
  
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
      return async.map(args.parts, part => {
        let data = {};
        
        data.part = part.buffer;
        data.partNumber = part.partNumber;
        data.fileId = response.fileId;
        
        return b2.uploadPart(data);
      });
    })
    .then(results => {
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