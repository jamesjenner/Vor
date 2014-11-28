

var fs = require('fs');
var stats = null;

// check if file exists
try {
  stats = fs.statSync('./data/');
} catch (e) {
  // console.log(JSON.stringify(e));
}

if(stats !== null) {
  console.log("exists");

  if(!stats.isDirectory()) {
    console.log("ERROR: ./data is not a directory");
  }
} else {
  // create directory
  try {
    fs.mkdirSync('./data/');
  } catch (e) {
    console.log("ERROR: couldn't create data directory " + e);
  }
}
