/**
 * Created by bface007 on 19/05/2017.
 */
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
            timeOut = setTimeout(() => attempt(), options.interval);
          });
      }
    };
    
    attempt();
  });
};