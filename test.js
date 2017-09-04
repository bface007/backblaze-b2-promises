/**
 * Created by bface007 on 19/05/2017.
 */
let rp = require('request-promise'),
    utils = require('./lib/utils'),
    express = require('express'),
    async = require('promise-async'),
    crypto = require('crypto-promise');

const app = express();

// app.use('/', (req, res) => {
//   let getGoogle = () => {
//     return rp.get('https://google.fr')
//   };
//
//   let returnToMe = () => {
//     return utils.retry({
//       times: 3,
//       interval: 1000
//     }, getGoogle);
//   };
//
//   returnToMe()
//     .then(response => {
//       return res.send(response)
//     })
//     .catch(err => {
//       return res.send(err);
//     });
//
//   // res.send("yo")
// });

app.use('/', (req, res) => {
  let test = () => {
    return crypto.hash('sha1')('123456');
  };
  
  return test()
    .then(result => {
      res.json(result.toString('hex'))
    })
    .catch(err => {
      console.log(err);
      res.send()
    });
});

app.listen(3002, 'localhost', () => {
  console.log('test is running');
});

