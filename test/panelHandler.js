/*jshint node: true*/
/*global describe, it, beforeEach, afterEach, before, after */

var fs = require('fs');
var should = require('chai').should();
var PanelHandler = require('../lib/server/panelHandler.js');
var Message = require('../lib/shared/panel.js');

var dataDirectory = './data/';

// expect(wsDefsProcessed).to.deep.equal(expected.def, testDesc + ": definitions do not match");
    
describe('#PanelHandler', function() {
  before(function() {
    // backup the existing 
    fs.renameSync(dataDirectory + PanelHandler.PANELS_FILE, dataDirectory + PanelHandler.PANELS_FILE + ".tmp");
  });
  beforeEach(function() {
    // create a version for testing
    fs.writeFileSync(dataDirectory + PanelHandler.PANELS_FILE, JSON.stringify(
[
	{
		"id": "40fa0bae-a79d-4ded-9cda-bfeb43feae1f",
		"name": "AAA",
		"column": 1,
		"width": 1,
		"row": 0,
		"iconName": "fa-key",
		"iconType": "fontAwesom"
	},
	{
		"id": "bf5a7fe8-3f30-4465-8629-80ec2fc04fa0",
		"name": "BBB",
		"column": 1,
		"width": 1,
		"row": 1,
		"iconName": "fa-key",
		"iconType": "fontAwesom"
	},
	{
		"id": "64a0dd4a-0965-43e0-8016-3402662d467a",
		"name": "CCC",
		"column": 1,
		"width": 1,
		"row": 2,
		"iconName": "fa-key",
		"iconType": "fontAwesom"
	},
	{
		"id": "978f05e0-eae6-4ae9-933d-1e8e11651fe8",
		"name": "DDD",
		"column": 1,
		"width": 1,
		"row": 3,
		"iconName": "fa-key",
		"iconType": "fontAwesom"
	},
	{
		"id": "40fa0bae-1111-4ded-9cda-bfeb43feae1f",
		"name": "EEE",
		"column": 2,
		"width": 1,
		"row": 0,
		"iconName": "fa-key",
		"iconType": "fontAwesom"
	},
	{
		"id": "bf5a7fe8-1111-4465-8629-80ec2fc04fa0",
		"name": "FFF",
		"column": 2,
		"width": 1,
		"row": 1,
		"iconName": "fa-key",
		"iconType": "fontAwesom"
	},
	{
		"id": "64a0dd4a-1111-43e0-8016-3402662d467a",
		"name": "GGG",
		"column": 2,
		"width": 1,
		"row": 2,
		"iconName": "fa-key",
		"iconType": "fontAwesom"
	},
	{
		"id": "978f05e0-1111-4ae9-933d-1e8e11651fe8",
		"name": "HHH",
		"column": 2,
		"width": 1,
		"row": 3,
		"iconName": "fa-key",
		"iconType": "fontAwesom"
	}
], 
      null, 
      '\t'));
  });
  
  
  afterEach(function() {
    // delete the test version
    fs.unlinkSync(dataDirectory + PanelHandler.PANELS_FILE);

  });
  
  after(function() {
    // restore the original 
    fs.renameSync(dataDirectory + PanelHandler.PANELS_FILE + ".tmp", dataDirectory + PanelHandler.PANELS_FILE);

  });
  
  it('adds panel correctly', function(done) {
    var panelHandler = new PanelHandler({dataDirectory: dataDirectory});
    panelHandler.addPanel({ "name": "III", "width": 1, "iconName": "fa-key", "iconType": "fontAwesom" });
    done();
    
    panelHandler.panels.length.should.equal(9);
    panelHandler.panels[8].column.should.equal(1);
    panelHandler.panels[8].row.should.equal(4);
  });
  it('deletes panel correctly', function(done) {
    var panelHandler = new PanelHandler({dataDirectory: dataDirectory});

    panelHandler.removePanel("bf5a7fe8-3f30-4465-8629-80ec2fc04fa0");
    done();
    
    panelHandler.panels.length.should.equal(7);
    panelHandler.panels[0].id.should.equal("40fa0bae-a79d-4ded-9cda-bfeb43feae1f");
	panelHandler.panels[0].row.should.equal(0);
    panelHandler.panels[1].id.should.equal("64a0dd4a-0965-43e0-8016-3402662d467a");
	panelHandler.panels[1].row.should.equal(1);
    panelHandler.panels[2].id.should.equal("978f05e0-eae6-4ae9-933d-1e8e11651fe8");
	panelHandler.panels[2].row.should.equal(2);
  });
  it('moves first entry up correctly', function(done) {
    var panelHandler = new PanelHandler({dataDirectory: dataDirectory});

    panelHandler.movePanelUp("40fa0bae-a79d-4ded-9cda-bfeb43feae1f");
    done();
    
    panelHandler.panels.length.should.equal(8);
    panelHandler.panels[0].id.should.equal("40fa0bae-a79d-4ded-9cda-bfeb43feae1f");
	panelHandler.panels[0].row.should.equal(0);
    panelHandler.panels[1].id.should.equal("bf5a7fe8-3f30-4465-8629-80ec2fc04fa0");
	panelHandler.panels[1].row.should.equal(1);
    panelHandler.panels[2].id.should.equal("64a0dd4a-0965-43e0-8016-3402662d467a");
	panelHandler.panels[2].row.should.equal(2);
    panelHandler.panels[3].id.should.equal("978f05e0-eae6-4ae9-933d-1e8e11651fe8");
	panelHandler.panels[3].row.should.equal(3);
  });
  it('moves second entry up correctly', function(done) {
    var panelHandler = new PanelHandler({dataDirectory: dataDirectory});

    panelHandler.movePanelUp("bf5a7fe8-3f30-4465-8629-80ec2fc04fa0");
    done();
    
    panelHandler.panels.length.should.equal(8);
    panelHandler.panels[0].id.should.equal("40fa0bae-a79d-4ded-9cda-bfeb43feae1f");
	panelHandler.panels[0].row.should.equal(1);
    panelHandler.panels[1].id.should.equal("bf5a7fe8-3f30-4465-8629-80ec2fc04fa0");
	panelHandler.panels[1].row.should.equal(0);
    panelHandler.panels[2].id.should.equal("64a0dd4a-0965-43e0-8016-3402662d467a");
	panelHandler.panels[2].row.should.equal(2);
    panelHandler.panels[3].id.should.equal("978f05e0-eae6-4ae9-933d-1e8e11651fe8");
	panelHandler.panels[3].row.should.equal(3);
  });
  it('moves third entry up correctly', function(done) {
    var panelHandler = new PanelHandler({dataDirectory: dataDirectory});

    panelHandler.movePanelUp("64a0dd4a-0965-43e0-8016-3402662d467a");
    done();
    
    panelHandler.panels.length.should.equal(8);
    panelHandler.panels[0].id.should.equal("40fa0bae-a79d-4ded-9cda-bfeb43feae1f");
	panelHandler.panels[0].row.should.equal(0);
    panelHandler.panels[1].id.should.equal("bf5a7fe8-3f30-4465-8629-80ec2fc04fa0");
	panelHandler.panels[1].row.should.equal(2);
    panelHandler.panels[2].id.should.equal("64a0dd4a-0965-43e0-8016-3402662d467a");
	panelHandler.panels[2].row.should.equal(1);
    panelHandler.panels[3].id.should.equal("978f05e0-eae6-4ae9-933d-1e8e11651fe8");
	panelHandler.panels[3].row.should.equal(3);
  });
  it('moves fourth entry up correctly', function(done) {
    var panelHandler = new PanelHandler({dataDirectory: dataDirectory});

    panelHandler.movePanelUp("978f05e0-eae6-4ae9-933d-1e8e11651fe8");
    done();
    
    panelHandler.panels.length.should.equal(8);
    panelHandler.panels[0].id.should.equal("40fa0bae-a79d-4ded-9cda-bfeb43feae1f");
	panelHandler.panels[0].row.should.equal(0);
    panelHandler.panels[1].id.should.equal("bf5a7fe8-3f30-4465-8629-80ec2fc04fa0");
	panelHandler.panels[1].row.should.equal(1);
    panelHandler.panels[2].id.should.equal("64a0dd4a-0965-43e0-8016-3402662d467a");
	panelHandler.panels[2].row.should.equal(3);
    panelHandler.panels[3].id.should.equal("978f05e0-eae6-4ae9-933d-1e8e11651fe8");
	panelHandler.panels[3].row.should.equal(2);
  });

  
  
  it('moves first entry down correctly', function(done) {
    var panelHandler = new PanelHandler({dataDirectory: dataDirectory});

    panelHandler.movePanelDown("40fa0bae-a79d-4ded-9cda-bfeb43feae1f");
    done();
    
    panelHandler.panels.length.should.equal(8);
    panelHandler.panels[0].id.should.equal("40fa0bae-a79d-4ded-9cda-bfeb43feae1f");
	panelHandler.panels[0].row.should.equal(1);
    panelHandler.panels[1].id.should.equal("bf5a7fe8-3f30-4465-8629-80ec2fc04fa0");
	panelHandler.panels[1].row.should.equal(0);
    panelHandler.panels[2].id.should.equal("64a0dd4a-0965-43e0-8016-3402662d467a");
	panelHandler.panels[2].row.should.equal(2);
    panelHandler.panels[3].id.should.equal("978f05e0-eae6-4ae9-933d-1e8e11651fe8");
	panelHandler.panels[3].row.should.equal(3);
  });
  it('moves second entry down correctly', function(done) {
    var panelHandler = new PanelHandler({dataDirectory: dataDirectory});

    panelHandler.movePanelDown("bf5a7fe8-3f30-4465-8629-80ec2fc04fa0");
    done();
    
    panelHandler.panels.length.should.equal(8);
    panelHandler.panels[0].id.should.equal("40fa0bae-a79d-4ded-9cda-bfeb43feae1f");
	panelHandler.panels[0].row.should.equal(0);
    panelHandler.panels[1].id.should.equal("bf5a7fe8-3f30-4465-8629-80ec2fc04fa0");
	panelHandler.panels[1].row.should.equal(2);
    panelHandler.panels[2].id.should.equal("64a0dd4a-0965-43e0-8016-3402662d467a");
	panelHandler.panels[2].row.should.equal(1);
    panelHandler.panels[3].id.should.equal("978f05e0-eae6-4ae9-933d-1e8e11651fe8");
	panelHandler.panels[3].row.should.equal(3);
  });
  it('moves third entry down correctly', function(done) {
    var panelHandler = new PanelHandler({dataDirectory: dataDirectory});

    panelHandler.movePanelDown("64a0dd4a-0965-43e0-8016-3402662d467a");
    done();
    
    panelHandler.panels.length.should.equal(8);
    panelHandler.panels[0].id.should.equal("40fa0bae-a79d-4ded-9cda-bfeb43feae1f");
	panelHandler.panels[0].row.should.equal(0);
    panelHandler.panels[1].id.should.equal("bf5a7fe8-3f30-4465-8629-80ec2fc04fa0");
	panelHandler.panels[1].row.should.equal(1);
    panelHandler.panels[2].id.should.equal("64a0dd4a-0965-43e0-8016-3402662d467a");
	panelHandler.panels[2].row.should.equal(3);
    panelHandler.panels[3].id.should.equal("978f05e0-eae6-4ae9-933d-1e8e11651fe8");
	panelHandler.panels[3].row.should.equal(2);
  });
  it('moves fourth entry down correctly', function(done) {
    var panelHandler = new PanelHandler({dataDirectory: dataDirectory});

    panelHandler.movePanelDown("978f05e0-eae6-4ae9-933d-1e8e11651fe8");
    done();
    
    panelHandler.panels.length.should.equal(8);
    panelHandler.panels[0].id.should.equal("40fa0bae-a79d-4ded-9cda-bfeb43feae1f");
	panelHandler.panels[0].row.should.equal(0);
    panelHandler.panels[1].id.should.equal("bf5a7fe8-3f30-4465-8629-80ec2fc04fa0");
	panelHandler.panels[1].row.should.equal(1);
    panelHandler.panels[2].id.should.equal("64a0dd4a-0965-43e0-8016-3402662d467a");
	panelHandler.panels[2].row.should.equal(2);
    panelHandler.panels[3].id.should.equal("978f05e0-eae6-4ae9-933d-1e8e11651fe8");
	panelHandler.panels[3].row.should.equal(3);
  });
  it('moves second entry right correctly', function(done) {
    var panelHandler = new PanelHandler({dataDirectory: dataDirectory});

    panelHandler.movePanelRight("bf5a7fe8-3f30-4465-8629-80ec2fc04fa0");
    done();
    
    panelHandler.panels.length.should.equal(8);
    panelHandler.panels[0].id.should.equal("40fa0bae-a79d-4ded-9cda-bfeb43feae1f");
	panelHandler.panels[0].row.should.equal(0);
	panelHandler.panels[0].column.should.equal(1);
    
    panelHandler.panels[1].id.should.equal("bf5a7fe8-3f30-4465-8629-80ec2fc04fa0");
	panelHandler.panels[1].row.should.equal(4);
	panelHandler.panels[1].column.should.equal(2);
    
    panelHandler.panels[2].id.should.equal("64a0dd4a-0965-43e0-8016-3402662d467a");
	panelHandler.panels[2].row.should.equal(1);
	panelHandler.panels[2].column.should.equal(1);
    panelHandler.panels[3].id.should.equal("978f05e0-eae6-4ae9-933d-1e8e11651fe8");
	panelHandler.panels[3].row.should.equal(2);
	panelHandler.panels[3].column.should.equal(1);

    panelHandler.panels[4].id.should.equal("40fa0bae-1111-4ded-9cda-bfeb43feae1f");
	panelHandler.panels[4].row.should.equal(0);
	panelHandler.panels[4].column.should.equal(2);
    panelHandler.panels[5].id.should.equal("bf5a7fe8-1111-4465-8629-80ec2fc04fa0");
	panelHandler.panels[5].row.should.equal(1);
	panelHandler.panels[5].column.should.equal(2);
    panelHandler.panels[6].id.should.equal("64a0dd4a-1111-43e0-8016-3402662d467a");
	panelHandler.panels[6].row.should.equal(2);
	panelHandler.panels[6].column.should.equal(2);
    panelHandler.panels[7].id.should.equal("978f05e0-1111-4ae9-933d-1e8e11651fe8");
	panelHandler.panels[7].row.should.equal(3);
	panelHandler.panels[7].column.should.equal(2);
  });
  it('moves two entries right correctly', function(done) {
    var panelHandler = new PanelHandler({dataDirectory: dataDirectory});

    panelHandler.movePanelRight("bf5a7fe8-3f30-4465-8629-80ec2fc04fa0");
    panelHandler.movePanelRight("40fa0bae-a79d-4ded-9cda-bfeb43feae1f");
    done();
    
    panelHandler.panels.length.should.equal(8);
    panelHandler.panels[0].id.should.equal("40fa0bae-a79d-4ded-9cda-bfeb43feae1f");
	panelHandler.panels[0].row.should.equal(5);
	panelHandler.panels[0].column.should.equal(2);
    
    panelHandler.panels[1].id.should.equal("bf5a7fe8-3f30-4465-8629-80ec2fc04fa0");
	panelHandler.panels[1].row.should.equal(4);
	panelHandler.panels[1].column.should.equal(2);
    
    panelHandler.panels[2].id.should.equal("64a0dd4a-0965-43e0-8016-3402662d467a");
	panelHandler.panels[2].row.should.equal(0);
	panelHandler.panels[2].column.should.equal(1);
    panelHandler.panels[3].id.should.equal("978f05e0-eae6-4ae9-933d-1e8e11651fe8");
	panelHandler.panels[3].row.should.equal(1);
	panelHandler.panels[3].column.should.equal(1);

    panelHandler.panels[4].id.should.equal("40fa0bae-1111-4ded-9cda-bfeb43feae1f");
	panelHandler.panels[4].row.should.equal(0);
	panelHandler.panels[4].column.should.equal(2);
    panelHandler.panels[5].id.should.equal("bf5a7fe8-1111-4465-8629-80ec2fc04fa0");
	panelHandler.panels[5].row.should.equal(1);
	panelHandler.panels[5].column.should.equal(2);
    panelHandler.panels[6].id.should.equal("64a0dd4a-1111-43e0-8016-3402662d467a");
	panelHandler.panels[6].row.should.equal(2);
	panelHandler.panels[6].column.should.equal(2);
    panelHandler.panels[7].id.should.equal("978f05e0-1111-4ae9-933d-1e8e11651fe8");
	panelHandler.panels[7].row.should.equal(3);
	panelHandler.panels[7].column.should.equal(2);
  });
  it('moves second entry left correctly', function(done) {
    var panelHandler = new PanelHandler({dataDirectory: dataDirectory});

    panelHandler.movePanelLeft("bf5a7fe8-1111-4465-8629-80ec2fc04fa0");
    done();
    
    panelHandler.panels.length.should.equal(8);
    panelHandler.panels[0].id.should.equal("40fa0bae-a79d-4ded-9cda-bfeb43feae1f");
	panelHandler.panels[0].row.should.equal(0);
	panelHandler.panels[0].column.should.equal(1);
    panelHandler.panels[1].id.should.equal("bf5a7fe8-3f30-4465-8629-80ec2fc04fa0");
	panelHandler.panels[1].row.should.equal(1);
	panelHandler.panels[1].column.should.equal(1);
    panelHandler.panels[2].id.should.equal("64a0dd4a-0965-43e0-8016-3402662d467a");
	panelHandler.panels[2].row.should.equal(2);
	panelHandler.panels[2].column.should.equal(1);
    panelHandler.panels[3].id.should.equal("978f05e0-eae6-4ae9-933d-1e8e11651fe8");
	panelHandler.panels[3].row.should.equal(3);
	panelHandler.panels[3].column.should.equal(1);

    panelHandler.panels[4].id.should.equal("40fa0bae-1111-4ded-9cda-bfeb43feae1f");
	panelHandler.panels[4].row.should.equal(0);
	panelHandler.panels[4].column.should.equal(2);
    
    panelHandler.panels[5].id.should.equal("bf5a7fe8-1111-4465-8629-80ec2fc04fa0");
	panelHandler.panels[5].row.should.equal(4);
	panelHandler.panels[5].column.should.equal(1);
    
    panelHandler.panels[6].id.should.equal("64a0dd4a-1111-43e0-8016-3402662d467a");
	panelHandler.panels[6].row.should.equal(1);
	panelHandler.panels[6].column.should.equal(2);
    panelHandler.panels[7].id.should.equal("978f05e0-1111-4ae9-933d-1e8e11651fe8");
	panelHandler.panels[7].row.should.equal(2);
	panelHandler.panels[7].column.should.equal(2);
  });
  it('moves two entry left correctly', function(done) {
    var panelHandler = new PanelHandler({dataDirectory: dataDirectory});

    panelHandler.movePanelLeft("bf5a7fe8-1111-4465-8629-80ec2fc04fa0");
    panelHandler.movePanelLeft("40fa0bae-1111-4ded-9cda-bfeb43feae1f");
    done();
    
    panelHandler.panels.length.should.equal(8);
    panelHandler.panels[0].id.should.equal("40fa0bae-a79d-4ded-9cda-bfeb43feae1f");
	panelHandler.panels[0].row.should.equal(0);
	panelHandler.panels[0].column.should.equal(1);
    panelHandler.panels[1].id.should.equal("bf5a7fe8-3f30-4465-8629-80ec2fc04fa0");
	panelHandler.panels[1].row.should.equal(1);
	panelHandler.panels[1].column.should.equal(1);
    panelHandler.panels[2].id.should.equal("64a0dd4a-0965-43e0-8016-3402662d467a");
	panelHandler.panels[2].row.should.equal(2);
	panelHandler.panels[2].column.should.equal(1);
    panelHandler.panels[3].id.should.equal("978f05e0-eae6-4ae9-933d-1e8e11651fe8");
	panelHandler.panels[3].row.should.equal(3);
	panelHandler.panels[3].column.should.equal(1);

    panelHandler.panels[4].id.should.equal("40fa0bae-1111-4ded-9cda-bfeb43feae1f");
	panelHandler.panels[4].row.should.equal(5);
	panelHandler.panels[4].column.should.equal(1);
    
    panelHandler.panels[5].id.should.equal("bf5a7fe8-1111-4465-8629-80ec2fc04fa0");
	panelHandler.panels[5].row.should.equal(4);
	panelHandler.panels[5].column.should.equal(1);
    
    panelHandler.panels[6].id.should.equal("64a0dd4a-1111-43e0-8016-3402662d467a");
	panelHandler.panels[6].row.should.equal(0);
	panelHandler.panels[6].column.should.equal(2);
    panelHandler.panels[7].id.should.equal("978f05e0-1111-4ae9-933d-1e8e11651fe8");
	panelHandler.panels[7].row.should.equal(1);
	panelHandler.panels[7].column.should.equal(2);
  });

});
