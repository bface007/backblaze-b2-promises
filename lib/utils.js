/**
 * Created by bface007 on 19/05/2017.
 */
exports.retry = (options, fn) => {
  return new Promise((resolve, reject) => {
    if(typeof fn !== 'function') reject('second parameter must be a function');
    
    let error;
    let attempt = () => {
      if(options.times === 0) reject(error);
      else {
        fn()
          .then(resolve)
          .catch(e => {
            options.times--;
            error = e;
            setTimeout(() => attempt(), options.interval);
          });
      }
    };
    
    attempt();
  });
};