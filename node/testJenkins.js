/*jlint node: true */
/*global require, console */

var jenkinsapi = require('./lib/jenkins');

var jenkins = jenkinsapi.init("http://awsjenkins.ventyx.abb.com:8080");

jenkins.job_info('/kitchen_ellipse', processResults.bind(null, '/kitchen_ellipse'));
jenkins.job_info('/ellipse-unit-tests', processResults.bind(null, '/ellipse-unit-tests'));
jenkins.job_info('/ellipse-service-tests', processResults.bind(null, '/ellipse-service-tests'));

function processResults(target, err, data) {
  if(err) {
    console.log("ERROR (job info): " + err);
    return;
  }
//  console.log("data: " + JSON.stringify(data, null, ' '));

  console.log("\t display name: " + data.displayName);
  console.log("\t  description: " + data.description);
  // console.log("\t         name: " + data.name);
  // console.log("\t          url: " + data.url);
  // console.log("\t    buildable: " + data.buildable);
  // console.log("\t        color: " + data.color);
  // console.log("\tHealth Report: " + data.healthReport[0].description);
  // console.log("\t     icon URL: " + data.healthReport[0].iconUrl);
  console.log("\t        score: " + data.healthReport[0].score);
  console.log("\t       builds: ");
  
  
  getJobResult(data.displayName, target, data.builds[0].number);
}

function getJobResult(displayName, target, jobNbr, callback) {
  jenkins.build_info(target, jobNbr, function(err, data) {
    // console.log(JSON.stringify(data, null, ' '));
    if(data.building) {
      console.log(displayName + "\t" + jobNbr + " -> " + Math.round((new Date().getTime() - data.timestamp) / data.estimatedDuration * 100) + "%");
    } else {
      if(data["actions"][6].failCount !== undefined) {
        console.log(displayName + "\t" + 
                    jobNbr + " : " + data.result + 
                    "\tFailed: " + data["actions"][6].failCount + 
                    "\tSkipped: " + data["actions"][6].skipCount + 
                    "\tPassed: " + 
      (parseInt(data["actions"][6].totalCount) - 
      (
        parseInt(data["actions"][6].failCount) + parseInt(data["actions"][6].skipCount) 
      )));
      } else {
        console.log(displayName + "\t" + jobNbr + " : " + data.result + " passed: " + passed + " failed: " + failed + " skipped: " + skipped);
      }
    }
  });
}

//jenkins.last_success('/kitchen_ellipse', function(err, data) {
//  if(err) {
//    console.log("last_success kitchen_ellipse: ERROR (last success): " + err);
//    return;
//  }
//
//  console.log("last_success kitchen_ellipse: " + data);
//});

//jenkins.last_build_info('/kitchen_ellipse', function(err, data) {
//  if(err) {
//    console.log("last build info kitchen_ellipse: ERROR (last build info): " + data.statusCode);
//    return;
//  }
//
//  console.log("  last build info " + 
//              "building: " + data.building + 
//              " fullDisplayName: " + data.fullDisplayName + 
//              " number: #" + data.number + 
//              " started: " + new Date(data.timestamp) + 
//              " complete: " + Math.round((new Date().getTime() - data.timestamp) / data.estimatedDuration * 100) + "%" + 
//              " result: " + data.result);
//});
//
//jenkins.last_build_report('/kitchen_ellipse', function(err, data) {
//
//  if(err) {
//    console.log("last build report kitchen_ellipse: ERROR (last build report): " + data.statusCode);
//    return;
//  }
//
//  console.log("last build report " + 
//              "building: " + data.building + 
//              " fullDisplayName: " + data.fullDisplayName + 
//              " number: #" + data.number + 
//              " started: " + new Date(data.timestamp) +
//              " complete: " + Math.round((new Date().getTime() - data.timestamp) / data.estimatedDuration * 100) + "%" +
//              " result: " + data.result);
//});
//
//jenkins.last_result('/kitchen_ellipse', function(err, data) {
//
//  if(err) {
//    console.log("last result kitchen_ellipse: ERROR (last result): " + data.statusCode);
//    return;
//  }
//
//  // console.log("last result kitchen_ellipse: " + JSON.stringify(data, null, " "));
//  
//  console.log("      last result " + 
//              "building: " + data.building + 
//              " fullDisplayName: " + data.fullDisplayName + 
//              " number: #" + data.number + 
//              " started: " + new Date(data.timestamp) +
//              " complete: " + Math.round((new Date().getTime() - data.timestamp) / data.estimatedDuration * 100) + "%" +
//              " result: " + data.result);
//});
//
//jenkins.all_jobs(function(err, data) {
//  if(err) {
//    console.log("ERROR (all jobs): " + err);
//    return;
//  }
//
//  console.log('all jobs, count: ' + data.length);
//});
//
