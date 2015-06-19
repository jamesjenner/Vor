var http = require('http');


function result(res) {
}

// testHost('http://ellipseonlineb0-el8dev-epsprd2-eps-prod.techops.ventyx.abb.com:8080/ria/ui.html', result);
// testHost('http://example.com/category', result);
testHost('ellipseonlineb0-el8dev-epsprd2-eps-prod.techops.ventyx.abb.com', 8080, '/ria/ui.html', result);
testHost('example.com', 80, '/category', result);

function testHost(host, port, path, callback) {
  var options = {method: 'HEAD', host: host, port: port, path: path};
  
  var request = http.request(options, function (res) {
    // If you get here, you have a response.
    // If you want, you can check the status code here to verify that it's `200` or some other `2xx`.
    console.log(host + port + path + " status code: " + res.statusCode);
    console.log("method: " + res.method);
    console.log("rawHeaders: " + res.rawHeaders);
    // console.log(res);
    callback(res);
  }).on('error', function(e) {
    console.log(host + port + path + " failure");
    // Here, an error occurred.  Check `e` for the error.
    console.log(e);
    console.log(JSON.stringify(e));
    callback(e);
  });
  
  request.end();
}

