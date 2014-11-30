/*jshint node: true*/
/*global describe, it, beforeEach, afterEach, before, after */

var fs = require('fs');
var should = require('chai').should();
var WidgetHandler = require('../lib/server/widgetHandler.js');
var Widget = require('../lib/shared/widget.js');

var dataDirectory = './data/';

// expect(wsDefsProcessed).to.deep.equal(expected.def, testDesc + ": definitions do not match");
    
describe('#WidgetHandler', function() {
  before(function() {
    // backup the existing 
    if (fs.existsSync(dataDirectory + WidgetHandler.WIDGETS_FILE)) {
      fs.retitleSync(dataDirectory + WidgetHandler.WIDGETS_FILE, dataDirectory + WidgetHandler.WIDGETS_FILE + ".tmp");
    }
  });
  beforeEach(function() {
    // create a version for testing
    fs.writeFileSync(dataDirectory + WidgetHandler.WIDGETS_FILE, JSON.stringify(
[
	{
		"id": "40fa0bae-a79d-4ded-9cda-bfeb43feae1f",
		"title": "AAA",
        "type": Widget.TYPE_VALUE,
        "dataSourceId": "111",
        "keyDataElement": "ooo",
	},
	{
		"id": "bf5a7fe8-3f30-4465-8629-80ec2fc04fa0",
		"title": "BBB",
        "type": Widget.TYPE_VALUE,
        "dataSourceId": "222",
        "keyDataElement": "ppp",
	},
	{
		"id": "64a0dd4a-0965-43e0-8016-3402662d467a",
		"title": "CCC",
        "type": Widget.TYPE_VALUE,
        "dataSourceId": "333",
        "keyDataElement": "qqq",
	},
	{
		"id": "978f05e0-eae6-4ae9-933d-1e8e11651fe8",
		"title": "DDD",
        "type": Widget.TYPE_VALUE,
        "dataSourceId": "444",
        "keyDataElement": "rrr",
	},
	{
		"id": "40fa0bae-1111-4ded-9cda-bfeb43feae1f",
		"title": "EEE",
        "type": Widget.TYPE_VALUE,
        "dataSourceId": "555",
        "keyDataElement": "rrr",
	},
	{
		"id": "bf5a7fe8-1111-4465-8629-80ec2fc04fa0",
		"title": "FFF",
        "type": Widget.TYPE_VALUE,
        "dataSourceId": "666",
        "keyDataElement": "sss",
	},
	{
		"id": "64a0dd4a-1111-43e0-8016-3402662d467a",
		"title": "GGG",
        "type": Widget.TYPE_VALUE,
        "dataSourceId": "777",
        "keyDataElement": "ttt",
	},
	{
		"id": "978f05e0-1111-4ae9-933d-1e8e11651fe8",
		"title": "HHH",
        "type": Widget.TYPE_VALUE,
        "dataSourceId": "888",
        "keyDataElement": "uuu",
	}
], 
      null, 
      '\t'));
  });
  
  
  afterEach(function() {
    // delete the test version
    fs.unlinkSync(dataDirectory + WidgetHandler.WIDGETS_FILE);
  });
  
  after(function() {
    // restore the original 
    if (fs.existsSync(dataDirectory + WidgetHandler.WIDGETS_FILE + ".tmp")) {
      fs.retitleSync(dataDirectory + WidgetHandler.WIDGETS_FILE + ".tmp", dataDirectory + WidgetHandler.WIDGETS_FILE);
    }

  });
  
  it('adds widget correctly', function(done) {
    var widgetHandler = new WidgetHandler({dataDirectory: dataDirectory});
    widgetHandler.addWidget({ 
      "title": "III",
      "type": Widget.TYPE_VALUE,
      "dataSourceId": "999",
      "keyDataElement": "ttt",
    });
    done();
    
    widgetHandler.widgets.length.should.equal(9);
  });
  it('deletes widget correctly', function(done) {
    var widgetHandler = new WidgetHandler({dataDirectory: dataDirectory});

    widgetHandler.removeWidget("bf5a7fe8-3f30-4465-8629-80ec2fc04fa0");
    done();
    
    widgetHandler.widgets.length.should.equal(7);
    widgetHandler.widgets[0].id.should.equal("40fa0bae-a79d-4ded-9cda-bfeb43feae1f");
    widgetHandler.widgets[1].id.should.equal("64a0dd4a-0965-43e0-8016-3402662d467a");
    widgetHandler.widgets[2].id.should.equal("978f05e0-eae6-4ae9-933d-1e8e11651fe8");
  });

});
