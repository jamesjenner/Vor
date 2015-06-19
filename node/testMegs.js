var http = require('http');

var options = {
   host: 'msdvmw24',
  // host: '10.128.144.240',
  path: '/cgi-bin/megs/workorderdetail.pl?work_order=MN2960'
};

callback = function (response) {
  var str = '';
  
  response.on('data', function (chunk) {
    str += chunk;
  });
  
  response.on('end', function () {
    console.log(str);
  });
}

http.request(options, callback).end();