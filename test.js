/**
 * Created by bface007 on 19/05/2017.
 */
let rp = require('request-promise'),
    utils = require('./lib/utils'),
    express = require('express');

const app = express();

app.all('/', (req, res) => {
  let getGoogle = () => {
    return rp.get('https://google.fr')
  };
  
  let returnToMe = () => {
    return utils.retry({
      times: 3,
      interval: 2000
    }, getGoogle);
  };
  
  returnToMe()
    .then(response => {
      return res.send(response)
    })
    .catch(err => {
      return res.send(err);
    });
  
  // res.send("yo")
});

app.listen(3002, 'localhost', () => {
  console.log('test is running');
});

