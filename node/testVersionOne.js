/*jlint node: true */
/*global require, console */



/*
 * Experimenting with VersionOne
 * 
 * Two options, AJAX call which supports modification, or new endpoint for JSON which is faster but read only
 * 
 * Doco:
 * 
 * http://community.versionone.com/Developers/Developer-Library/Recipes/Tour_of_query.v1
 * http://community.versionone.com/Developers/Developer-Library/Documentation/API/Endpoints/query.v1
 * http://community.versionone.com/Developers/Developer-Library/Documentation/API/Security/Oauth_2.0_Authentication
 *  
 * example:
 * 
 * http://jsfiddle.net/JoshGough/8XApF/
 * http://jsfiddle.net/u6Grx/8/
 * 
 * 
 */

//var url = "http://eval.versionone.net/platformtest/rest-1.v1/Data/Story/1154";
//var headers = { Authorization: "Basic " + Buffer("admin:admin").toString('base64'), Accept: "haljson" };
//var settings = { url: url, headers: headers, dataType: "json" };
//
//$.ajax(settings).done(function(data) {
//    beautifulJson = JSON.stringify(data, null, 4);
//    $("body").html("<pre>" + beautifulJson + "</pre>");
//}).fail(function(jqXHR) {
//    $("body").html(jqXHR.responseText);
//});


//var versionOneApi = require('./lib/versionOne');
//
//var versionOne = versionOneApi.init("https://www11.v1host.com/VentyxProd");
//
//versionOne.testABC(function(err, data) {
//  if(err) {
//    console.log("ERROR (): " + data);
//    return;
//  }
//
//  console.log("result: " + data);
//});
//
var http = require('http');


var options = {
  hostname: 'www.google.com',
  port: 80,
  path: '/upload',
  method: 'POST'
};

var req = http.request(options, function(res) {
  console.log('STATUS: ' + res.statusCode);
  console.log('HEADERS: ' + JSON.stringify(res.headers));
  res.setEncoding('utf8');
  res.on('data', function (chunk) {
    console.log('BODY: ' + chunk);
  });
});

req.on('error', function(e) {
  console.log('problem with request: ' + e.message);
});

// write data to request body
req.write('data\n');
req.write('data\n');
req.end();


// ---------------------------------------------

//The url we want is `www.nodejitsu.com:1337/`
var options2 = {
  hostname: 'www11.v1host.com',
  path: '/VentyxProd/query.v1',
  //since we are listening on a custom port, we need to specify it by hand
  // port: '1337',
  //This is what changes the request to a POST request
  method: 'POST'
};

var callback = function(response) {
  console.log('STATUS: ' + response.statusCode);
  console.log('HEADERS: ' + JSON.stringify(response.headers));
  response.setEncoding('utf8');
  
  var str = '';
  response.on('data', function (chunk) {
    console.log('BODY: ' + chunk);
    str += chunk;
  });

  response.on('end', function () {
    console.log(str);
  });
  
  response.on('error', function(e) {
    console.log('problem with request: ' + e.message);
});
};

var req = http.request(options2, callback);

//This is the data we are posting, it needs to be a string or a buffer
req.write(
"from: Story" +
"select:" +
"  - Name" +
"  - ChangeDateUTC" +
"  - Estimate" +
"where:" +
"  ID: 'Story:B-41426'" +
"\n" 
// "asof: 2012-09-07" +
          );

req.end();