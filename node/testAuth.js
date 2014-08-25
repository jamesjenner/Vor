/*jlint node: true */
/*global require, console */

//var OAuth = require('oauth');
//var url = require("url");
//var http = require("http");
//
//var versionOneInfo = {
//  "installed": {
//    "client_id": "client_yudcxvxs",
//    "client_name": "Vor",
//    "client_secret": "a8v8eoccoke3c7qtd2d8",
//    "redirect_uris": [
//      "urn:ietf:wg:oauth:2.0:oob"
//    ],
//    "auth_uri": "https://www11.v1host.com/VentyxProd/oauth.v1/auth",
//    "token_uri": "https://www11.v1host.com/VentyxProd/oauth.v1/token",
//    "server_base_uri": "https://www11.v1host.com/VentyxProd",
//    "expires_on": "9999-12-31T23:59:59.9999999"
//  }
//};
//
//var OAuth2 = OAuth.OAuth2;    
//var oauth2 = new OAuth2(
//   versionOneInfo.installed.client_id,
//   versionOneInfo.installed.client_secret, 
//   versionOneInfo.installed.server_base_uri, 
//   'oauth.v1/auth',
//   'oauth.v1/token');
//
//oauth2.getOAuthAccessToken(
//  versionOneInfo.installed.redirect_uris[0],
//  { 
//    grant_type: 'client_credentials' 
//  },
//  function(e, access_token, refresh_token, results) {
//    console.log('bearer: ', access_token);
//   
//    oauth2.get('protected url', access_token, function(e, data, res) {
//      if(e) {
//        console.log("ERROR: get failed " + JSON.stringify(e, null, "  "));
//        return;
//        // return callback(e, null);
//      }
//      
//      if(res.statusCode != 200) {
//        console.log("ERROR: OAuth2 request failed: " + res.statusCode);
//        return;
//        // return callback(new Error('OAuth2 request failed: ' + res.statusCode), null);
//      }
//      
//      try {
//        data = JSON.parse(data);        
//      } catch(err){
//        console.log("ERROR: data parse failed" + err);
//        // return callback(err, null);
//      }
//      console.log("SUCESS; " + e + " : " + data);
//      // return callback(e, data);
//    });
//  }
//);

// We need this to build our post string
var querystring = require('querystring');
var http = require('http');
var fs = require('fs');

var versionOneInfo = {
  "installed": {
    "client_id": "client_yudcxvxs",
    "client_name": "Vor",
    "client_secret": "a8v8eoccoke3c7qtd2d8",
    "redirect_uris": [
      "urn:ietf:wg:oauth:2.0:oob"
    ],
    "auth_uri": "https://www11.v1host.com/VentyxProd/oauth.v1/auth",
    "token_uri": "https://www11.v1host.com/VentyxProd/oauth.v1/token",
    "server_base_uri": "https://www11.v1host.com/VentyxProd",
    "expires_on": "9999-12-31T23:59:59.9999999"
  }
};


var codeText = '6hEj!IAAAABGj3gScXxBxXnN6AUrGi6iECotxG7pwn_G6AGlK8b7TAQEAAAE6RvTytMk2jwMEOr1oGG25eY9MCZ4eJa24w7PjFQQXqAkEfzdix6PY8lsz6aXNcC8yNKXrnMPSv0l3hHlqF9rtCZq8YnYSpYn41fYVDc8J7Ul0QpUm3bdCLZa_Pyob7KLk_6bNtvce04KVmtHVjA4clCwEjtbOEbCR-SL3CzFCju2uVFfcJFshDNL537pqsdwoj0WGBAdNvKp1prnH70vHXRnKjjMudyHPF04xZ7jB6y7gZOUrlx9-JXrC22rA9G2sJbjvKqTFpbzg_BFd1PEn7uAyNhdz_xTa4qJ1pI_CLwehvfes_UE9-Nfr79lL6gU4B9-CK5nqzICjP-BpxuO_';

// Build the post string from an object
var post_data = querystring.stringify({
  code: codeText,
  grant_type: 'authorization_code',
  // redirect_uri: 'urn%3Aietf%3Awg%3Aoauth%3A2.0%3Aoob',
  redirect_uri: versionOneInfo.installed.redirect_uris[0],
  scope: 'apiv1',
  client_id: versionOneInfo.installed.client_id,
  client_secret: versionOneInfo.installed.client_secret
});

// An object of options to indicate where to post to
var options = {
//  host: 'www11.v1host.com',
//  port: '80',
//  path: 'VentyxProd/oauth.v1/token',
//  method: 'POST',
//  headers: {
//    'Content-Type': 'application/x-www-form-urlencoded',
//    'Content-Length': post_data.length
//  }
  host: 'www11.v1host.com',
  // path: 'oauth.v1',
  port: '80',
  //This is the only line that is new. `headers` is an object with the headers to request
  method: 'POST',
  // headers: {'custom': 'Custom Header Demo works'}
};

callback = function(response) {
  var str = '';
  response.on('data', function (chunk) {
    str += chunk;
  });

  response.on('end', function () {
    console.log(str);
  });
}

var req = http.request(options, callback);
req.end();

// post the data
//post_req.write(post_data);
//post_req.end();

req.write('hello world!');
req.end();