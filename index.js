const express = require('express')
const app = express();

app.get('/', function (req, res) {
  res.send('Hello World')

  var ip = req.headers['X-Real-IP'] || req.connection.remoteAddress;

  console.log("request ip: " + ip);
})

app.listen(3000, () => console.log('Server running on port 3000'))
