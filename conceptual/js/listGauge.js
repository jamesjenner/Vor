this['listGauge'] = {};
    
ListGauge.DISPLAY_PERCENTAGE = "displayAsPercentage";
ListGauge.DISPLAY_VALUE = "displayAsValue";

ListGauge.VALUES_PERCENTAGE = "valuesPercentage";
ListGauge.VALUES_INT = "valuesActual";
ListGauge.VALUES_TEXT = "valuesText";

ListGauge.DIRECTION_BOTTOM_UP = "directionUp";
ListGauge.DIRECTION_TOP_DOWN = "directionDown";

ListGauge.ALIGN_LEFT = "alignLeft";
ListGauge.ALIGN_RIGHT = "alignRight";
ListGauge.ALIGN_CENTRE = "alignCentre";

function ListGauge(options) {
  var d, i;
  options = options || {};

  this.depth = ((options.depth !== null && options.depth !== undefined) ? options.depth : 5);
  this.direction = ((options.direction !== null && options.direction !== undefined) ? options.direction : ListGauge.DIRECTION_TOP_DOWN);
  this.valueType = ((options.valueType !== null && options.valueType !== undefined) ? options.valueType : ListGauge.VALUES_INT);
  this.align = ((options.align !== null && options.align !== undefined) ? options.align : ListGauge.ALIGN_RIGHT);

  this.defaultColor = ((options.defaultColor !== null && options.defaultColor !== undefined) ? options.defaultColor : "green");
  
  this.textDisplayMode = ((options.textDisplayMode !== null && options.textDisplayMode !== undefined) ? options.textDisplayMode : ListGauge.DISPLAY_VALUE);
  this.textSize = ((options.textSize !== null && options.textSize !== undefined) ? options.textSize : 1.5);
  this.textFontName = ((options.textFontName !== null && options.textFontName !== undefined) ? options.textFontName : "sans-serif");
  this.textFontWeight = ((options.textFontWeight !== null && options.textFontWeight !== undefined) ? options.textFontWeight : "bold");
  
  this.appendTo = ((options.appendTo !== null && options.appendTo !== undefined) ? options.appendTo : "body");

  this.values = ((options.values !== null && options.values !== undefined) ? options.values : []);
  
  if (this.values.length < this.depth) {
    for (d = this.values.length; d < this.depth; d++) {
      this.values[d] = new ListValue("", "");
    }
  }

  // Create the SVG container, and apply a transform such that the origin is the
  // center of the canvas. This way, we don't need to position arcs individually.
  // setup the viewbox so that the size changes automatically

  this.svg = d3.select("#" + this.appendTo).append("svg")
    .attr("id", "numWidget")
    .attr("width", "100px")
    .attr("height", "100px")
    .attr("viewBox", "0 0 100 100")  // set viewBox to 200/200 so we can use 0 to 100 for sizing
    .attr("perserveAspectRatio", "meet")
    // .attr("perserveAspectRatio", "none")
    .append("g")
  ;

  var height = (100 / this.depth);
  var textAnchor = "start";
  var xPos = 0;
  switch(this.align) {

    case ListGauge.ALIGN_LEFT:
      textAnchor = "start";
      xPos = 0;
      break;
    case ListGauge.ALIGN_RIGHT:
      textAnchor = "end";
      xPos = 100;
      break;
    case ListGauge.ALIGN_CENTRE:
      textAnchor = "middle";
      xPos = 50;
      break;
  }

  this.text = [];
  for(i = 0; i < this.depth; i++) {
    console.log("value: " + this.values[i].value + " y pos: " + (height * i));
    this.text[i] = this.svg.append("text")
        .attr("id", this.appendTo + "numValue" + i)
        .attr("x", xPos)
        .attr("y", (height * i) + height / 2)
        .attr("width", "100")
        .text(this.values[i].value)
        .attr("text-anchor", textAnchor)
        .attr("dominant-baseline", "central")
        .attr("font-family", this.textFontName)
        .style("font-weight", this.textFontWeight)
        .style("font-size", this.textSize + "em")
        .attr("fill", this.defaultColor);
  }
}

function ListValue(value, color) {
  this.color = color;
  this.value = value;
}

ListGauge.prototype.pushValue = function(value, color) {
  var i = 0, j = 0;
  
  if(this.values.length >= this.depth) {
    this.shiftValue();
  }
  
  this.values.push(new ListValue(value, color));
  
  if(this.direction === ListGauge.DIRECTION_BOTTOM_UP) {
    for(i = 0; i < this.values.length; i++) {
      this.text[i].transition()
        .duration(0)
        .ease('linear')
        .style("fill", this.values[i].color)
        .text(this.values[i].value);
    }
  } else {
    for(i = 0, j = this.values.length - 1; i < this.values.length; i++, j--) {
      this.text[j].transition()
        .duration(0)
        .ease('linear')
        .style("fill", this.values[i].color)
        .text(this.values[i].value);
    }
  }
};

ListGauge.prototype.shiftValue = function() {
  this.values.shift();
};

ListGauge.prototype.demo = function() {
  // Every so often, start a transition to a new random angle. Use transition.call
  // (identical to selection.call) so that we can encapsulate the logic for
  // tweening the arc in a separate function below.
  
  this.lastValue = (Math.floor(Math.random() * (10 - 2)) + 2) * 1000;
  this.colors = ["lightgray", "red", "green", "green", "green"]
  
  setInterval(function() {
    var min = 0;
    var max = 4;
    // calc a int random value between min and max
    var value = Math.floor(Math.random() * (max - min)) + min;
    
    this.pushValue(++this.lastValue, this.colors[value]);
  }.bind(this), Math.floor(Math.random() * (1500 - 750)) + 750);
};