/*jlint node: true */
/*global require, console */

var jenkinsapi = require('./lib/jenkins');

var jenkins = jenkinsapi.init("http://awsjenkins.ventyx.abb.com:8080");

jenkins.all_jobs(function(err, data) {
  if(err) {
    console.log("ERROR (all jobs): " + err);
    return;
  }

  console.log('all jobs, count: ' + data.length);
});

jenkins.job_info('/kitchen_ellipse', function(err, data) {
  if(err) {
    console.log("ERROR (job info kitchen_ellipse): " + err);
    return;
  }

  console.log("job info kitchen_ellipse: " + data);
});

jenkins.last_success('/kitchen_ellipse', function(err, data) {
  if(err) {
    console.log("last_success kitchen_ellipse: ERROR (last success): " + err);
    return;
  }

  console.log("last_success kitchen_ellipse: " + data);
});

jenkins.last_build_info('/kitchen_ellipse', function(err, data) {
  if(err) {
    console.log("last build info kitchen_ellipse: ERROR (last build info): " + data.statusCode);
    return;
  }

  console.log("last build info kitchen_ellipse: " + data);
});

jenkins.last_build_report('/kitchen_ellipse', function(err, data) {

  if(err) {
    console.log("last build report kitchen_ellipse: ERROR (last build report): " + data.statusCode);
    return;
  }

  console.log("last build report kitchen_ellipse: " + data);
});

jenkins.last_result('/kitchen_ellipse', function(err, data) {

  if(err) {
    console.log("last result kitchen_ellipse: ERROR (last result): " + data.statusCode);
    return;
  }

  // console.log("last result kitchen_ellipse: " + JSON.stringify(data, null, " "));
  var date = new Date(data.timestamp);
  var estDuration = convertMS(data.estimatedDuration);
  
  console.log("last result kitchen_ellipse: " + 
              "building: " + data.building + 
              " fullDisplayName: " + data.fullDisplayName + 
              " number: #" + data.number + 
              " started: " + date 
              + " complete: " + Math.round((new Date().getTime() - data.timestamp) / data.estimatedDuration * 100) + "%"
              + " result: " + data.result);
  
});

function convertMS(ms) {
  var d, h, m, s;
  s = Math.floor(ms / 1000);
  m = Math.floor(s / 60);
  s = s % 60;
  h = Math.floor(m / 60);
  m = m % 60;
  d = Math.floor(h / 24);
  h = h % 24;
  return { d: d, h: h, m: m, s: s };
};

jenkins.build_info('/kitchen_ellipse', 5357, function(err, data) {
  if(err) {
    console.log("build_info kicthen_ellipse 5357: ERROR (build info): " + data.statusCode);
    return;
  }

  console.log("build_info kicthen_ellipse 5357: " + data);
});
