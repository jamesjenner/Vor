/*jlint node: true */
/*global require, console, module, process, __dirname */
/*
 * application.js
 *
 * Copyright (C) 2014 by James Jenner
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

var path = require('path');
var opt = require('opt').create();
var fs = require('fs');

var MeltingPot = require('meltingpot');

var PanelHandler = require('./lib/server/panelHandler.js');
var DataSourceHandler = require('./lib/server/dataSourceHandler.js');
var WidgetHandler = require('./lib/server/widgetHandler.js');
var DataSourceManager = require('./lib/server/dataSourceManager.js');
var LocalPreferenceHandler = require('./lib/server/localPreferenceHandler.js');
var PreferenceHandler = require('./lib/server/preferenceHandler.js');
var BannerHandler = require('./lib/server/bannerHandler.js');

//var VEHICLES_FILE = 'vehicles.json';

//// setup log4js component with a logger
//log4js.configure({
//  appenders: [
//    {
//      type: "file",
//      filename: "meltingpot.log",
//      category: ['videre', 'file']
// },
//    {
//      type: "file",
//      filename: "meltingpot_clientcomms_in.log",
//      category: ['clientIn', 'file']
// },
//    {
//      type: "file",
//      filename: "meltingpot_clientcomms_out.log",
//      category: ['clientOut', 'file']
// }
// /*
//	{
//	    type: "console"
//	}
//	*/
//    ],
//  replaceConsole: false
//});

// load the vehicle configs from the file
//var vehicles = loadVehicles(VEHICLES_FILE);

/* options handling */
// TODO: look at replacing or extending opt, would like error on invalid arg, exclusivity of args, better formatting of help, etc

var config = {
  debug: false,
  debugLevel: 0,
  clientAddress: 'localhost',
  port: 9007,
  securePort: 9008,
  uuidV1: false,
  communicationType: MeltingPot.Message.COMMS_TYPE_UNSECURE_ONLY,
  sslKey: 'keys' + path.sep + 'privatekey.pem',
  sslCert: 'keys' + path.sep + 'certificate.pem',
  autoDiscover: false,
  dataDirectory: '.' + path.sep + 'data' + path.sep,
};

var search_paths = [
  "meltingpot.conf",
  path.join(getUserHome(), ".meltingpot-rc"),
  "/usr/local/etc/meltingpot.conf",
  "/usr/etc/meltingpot.conf",
  "/etc/meltingpot.conf"
];

var listingProtocols = false;

opt.configSync(config, search_paths);

opt.optionHelp("USAGE node " + path.basename(process.argv[1]),
  "SYNOPSIS: The application is the back end for the meltingpot front end .\n\n\t\t node " + path.basename(process.argv[1]) + " --help",
  "OPTIONS:",
  "Copyright (c) 2014 James G Jenner, all rights reserved\n" +
  " Released under MIT License\n" +
  " See: http://opensource.org/licenses/MIT\n");

opt.option(["-d", "--debug"], function (param) {
  config.debug = true;
  if (Number(param).toFixed(0) > 0) {
    config.debugLevel = Number(param).toFixed(0);
    opt.consume(param);
  } else {
    config.debugLevel = 0;
  }
}, "Generate debugging messages, level is optional. 0 - informational, 1 - detailed");

opt.option(["-so", "--secure-only"], function (param) {
  config.communicationType = MeltingPot.Message.COMMS_TYPE_SECURE_ONLY;
}, "Set communications to only accept secure connections");

opt.option(["-uo", "--unsecure-only"], function (param) {
  config.communicationType = MeltingPot.Message.COMMS_TYPE_UNSECURE_ONLY;
}, "Set communications to only accept unsecure connections, this is the default type");

opt.option(["-m", "--mixed"], function (param) {
  config.communicationType = MeltingPot.Message.COMMS_TYPE_MIXED;
}, "Set communications to accept secure and unsecure connections");

opt.option(["-u1", "--uuid-v1"], function (param) {
  config.uuidV1 = true;
}, "Set uuid generation for session keys to uuid v1, default is v4");

opt.option(["-ad", "--auto-discover"], function (param) {
  config.autoDiscover = true;
}, "comms auto discovery");

opt.option(["-dd", "--data-directory"], function (param) {
  if (param !== undefined && param.trim()) {
    config.dataDirectory = param.trim();
    if(config.dataDirectory.charAt(config.dataDirectory.length - 1) !== path.sep) {
      config.dataDirectory += path.sep;
    }
    opt.consume(param);
  } else {
    opt.usage("The directory must be provided with the option for data directory.", 1);
  }
}, "Set the directory for data files");

// server comms settings
opt.option(["-p", "--port"], function (param) {
  if (Number(param).toFixed(0) > 0) {
    config.port = Number(param).toFixed(0);
    opt.consume(param);
  } else {
    opt.usage("Port must be a number greater then 0.", 1);
  }
}, "Set the port parameter for remote connections");

opt.option(["-s", "--ssl-port"], function (param) {
  if (Number(param).toFixed(0) > 0) {
    config.securePort = Number(param).toFixed(0);
    opt.consume(param);
  } else {
    opt.usage("SLL Port must be a number greater then 0.", 1);
  }
}, "Set the ssl port parameter for remote secure connections");

opt.option(["-sk", "--ssl-key"], function (param) {
  if (param !== undefined && param.trim()) {
    config.sslKey = param.trim();
    opt.consume(param);
  }
}, "Set the ssl private key file parameter for remote secure connections");

opt.option(["-sc", "--ssl-cert"], function (param) {
  if (param !== undefined && param.trim()) {
    config.sslCert = param.trim();
    opt.consume(param);
  }
}, "Set the ssl certificate parameter for remote secure connections");

opt.option(["-g", "--generate"], function (param) {
  var config_filename = "";

  if (param !== undefined && param.trim() !== "") {
    config_filename = param.trim();
  }
  opt.consume(param);

  if (config_filename === "") {
    console.log(JSON.stringify(config, null, '\t'));
    process.exit(0);
  } else {
    fs.writeFile(config_filename, JSON.stringify(config, null, '\t'), function (err) {
      if (err) {
        console.error("ERROR: can't write", config_filename);
        process.exit(1);
      }
      console.log("Wrote configuration to", config_filename);
      process.exit(0);
    });
  }

}, "Generate a configuration file");

opt.option(["-h", "--help"], function () {
  opt.usage();
}, "This help document.");

opt.optionWith(process.argv);

// load existing definitions

// setup the client communications
var clientComms = new MeltingPot.Comms({
  port: config.port,
  securePort: config.securePort,
  uuidV1: config.uuidV1,
  communicationType: config.communicationType,
  sslKey: config.sslKey,
  sslCert: config.sslCert,
  debug: config.debug,
  debugLevel: config.debugLevel,
  messageHandlers: [
    PanelHandler.messageHandler,
    PreferenceHandler.messageHandler,
    LocalPreferenceHandler.messageHandler,
    DataSourceHandler.messageHandler,
    WidgetHandler.messageHandler,
    BannerHandler.messageHandler,
  ]
});

// setup data directory
if(!validateDataDirectory(config.dataDirectory)) {
 return -1;
}
    
var localPreferenceHandler = new LocalPreferenceHandler({dataDirectory: config.dataDirectory});
localPreferenceHandler.setupCommsListeners(clientComms);

var preferenceHandler = new PreferenceHandler({dataDirectory: config.dataDirectory, localPreferenceHandler: localPreferenceHandler});
preferenceHandler.setupCommsListeners(clientComms);

var widgetHandler = new WidgetHandler({dataDirectory: config.dataDirectory});

var panelHandler = new PanelHandler({dataDirectory: config.dataDirectory, preferenceHandler: preferenceHandler, widgetHandler: widgetHandler});
panelHandler.setupCommsListeners(clientComms);
widgetHandler.setupCommsListeners(clientComms);

var bannerHandler = new BannerHandler({dataDirectory: config.dataDirectory});
bannerHandler.setupCommsListeners(clientComms);

var dataSourceHandler = new DataSourceHandler({dataDirectory: config.dataDirectory});
dataSourceHandler.setupCommsListeners(clientComms);
    
var dataSourceManager = new DataSourceManager({clientComms: clientComms, dataSourceHandler: dataSourceHandler, widgetHandler: widgetHandler});
dataSourceManager.setupCommsListeners(clientComms);
widgetHandler.dataSourceManager = dataSourceManager;

// start up the server for clients
if (config.debug) {
  console.log((new Date()) + " application.js: starting client server");
}

dataSourceManager.start();
clientComms.startClientServer();

    
/* 
 * returns false if the directory cannot be created
 */
function validateDataDirectory(dataDirectory) {
  var stats = null;

  // check if file exists
  try {
    stats = fs.statSync(dataDirectory);
  } catch (e) {
  }

  if(stats !== null) {
    if(!stats.isDirectory()) {
      console.log("ERROR: " + dataDirectory + " is not a directory");
      return false;
    }
  } else {
    // doesn't exist, create it
    try {
      fs.mkdirSync(dataDirectory);
    } catch (e) {
      console.log("ERROR: couldn't create data directory " + e);
      return false;
    }
  }
  
  return true;
}

function getUserHome() {
  return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}