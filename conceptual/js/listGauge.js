this['listGauge'] = {};
    
ListGauge.DISPLAY_PERCENTAGE = "displayAsPercentage";
ListGauge.DISPLAY_VALUE = "displayAsValue";

ListGauge.VALUES_PERCENTAGE = "valuesPercentage";
ListGauge.VALUES_INT = "valuesActual";
ListGauge.VALUES_TEXT = "valuesText";

function ListGauge(options) {
  options = options || {};

  this.valueType = ((options.valueType !== null && options.valueType !== undefined) ? options.valueType : ListGauge.VALUES_INT);

  this.defaultColor = ((options.defaultColor !== null && options.defaultColor !== undefined) ? options.defaultColor : "green");
  
  this.setValue(options.value, false);
  
  this.textDisplayMode = ((options.textDisplayMode !== null && options.textDisplayMode !== undefined) ? options.textDisplayMode : ListGauge.DISPLAY_VALUE);
  this.textSize = ((options.textSize !== null && options.textSize !== undefined) ? options.textSize : 5);
  this.textFontName = ((options.textFontName !== null && options.textFontName !== undefined) ? options.textFontName : "sans-serif");
  this.textFontWeight = ((options.textFontWeight !== null && options.textFontWeight !== undefined) ? options.textFontWeight : "bold");
  
  this.appendTo = ((options.appendTo !== null && options.appendTo !== undefined) ? options.appendTo : "body");
  
  this.values = [];
//  this.width = ((options.width !== null && options.width !== undefined) ? options.width : 300);
//  this.height = ((options.height !== null && options.height !== undefined) ? options.height : 300);


  // Create the SVG container, and apply a transform such that the origin is the
  // center of the canvas. This way, we don't need to position arcs individually.
  // setup the viewbox so that the size changes automatically

  var svg = d3.select("#" + this.appendTo).append("svg")
    .attr("id", "numWidget")
    .attr("width", this.width)
    .attr("height", this.height)
    .attr("viewBox", "0 0 100 100")  // set viewBox to 200/200 so we can use 0 to 100 for sizing
    .attr("perserveAspectRatio", "meet")
    // .attr("perserveAspectRatio", "none")
    .append("g")
    // .attr("transform", "translate(100, 100)")
    ;  // do we need the translate? don't think so...

  // determin the true size of the svg element
  //  var elem1 = document.getElementById(this.appendTo);
  //  var style = window.getComputedStyle(elem1, null);
  //  var svgBBox = svg.node().getBBox();
  // svg = svg.append("g").attr("transform", "translate(" + parseFloat(style.width) / 2 + "," + parseFloat(style.height) / 2 + ")");

  this.text = svg.append("text")
      .attr("id", "numValue")
      .attr("dx", "50%")
      .attr("dy", "50%")
      .text(this._getTextValue())
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .attr("font-family", this.textFontName)
      .style("font-weight", this.textFontWeight)
      .style("font-size", this.textSize + "em")
      .attr("fill", this.defaultColor);

/*
      <text 
          id="value"
          dx="50%" 
          dy="50%" 
          text-anchor="middle" 
          font-family="sans-serif"
          font-weight="bold"
          font-size="5em"
          dominant-baseline="central"
          fill="red">
          9
      </text>
 
 */

}

ListGauge.prototype._getTextValue = function() {
  var displayText = '';
  
  switch(this.textDisplayMode) {
    case ListGauge.DISPLAY_PERCENTAGE:
      displayText = this.valuePercentage * 100;
      break;
      
    case ListGauge.DISPLAY_VALUE:
    default:
      displayText = this.value;
  }
  
  return displayText;
};

ListGauge.prototype._determineForegroundColor = function() {
  var foregroundColor = this.goodColor;

  if(this.goodDirection === ListGauge.GOOD_LOW) {
    if(this.value <= this.goodMargin) {
      foregroundColor = this.goodColor;
    } else if(this.value >= this.dangerMargin) {
      foregroundColor = this.dangerColor;
    } else {
      foregroundColor = this.warningColor;
    }
  } else {
    if(this.value >= this.target - this.goodMargin) {
      foregroundColor = this.goodColor;
    } else if(this.value <= this.target - this.dangerMargin) {
      foregroundColor = this.dangerColor;
    } else {
      foregroundColor = this.warningColor;
    }
  }

  return foregroundColor;
};

function ListValue(value, color) {
  this.color = "white";
  this.value = "";
}

ListGauge.prototype.pushValue(value, color) {
  this.values.push(new ListValue(value, color));
}

ListGauge.prototype.popValue() {
  this.values.pop();
}

ListGauge.prototype.redraw() {
}

ListGauge.prototype.setValue = function(position, newValue, newColor, redrawGauge) {
  var oldValue = this.value;
  var replacementValue = newValue;
  this.value = ((newValue !== null && newValue !== undefined) ? newValue : 0);
  
  redrawGauge = ((redrawGauge !== null && redrawGauge !== undefined) ? redrawGauge : true);
  
  var format = d3.format("f");
      
  if(this.valueType == ListGauge.VALUES_PERCENTAGE) {
    oldValue = this.valuePercentage;
    replacementValue = (this.value - this.minValue) / (this.maxValue - this.minValue);
    format = d3.format(".0%");
  }
  
  if(redrawGauge) {
    (function(replacementValue, gaugeInst) {
      gaugeInst.text.transition()
        .duration(750)
        .ease('linear')
        .style("fill", gaugeInst._determineForegroundColor())
        .tween('text', function() {
          var ip = d3.interpolate(oldValue, replacementValue);
          return function(t) {
            var v = ip(t);
            this.textContent = format(v);
          };
      });
    })(replacementValue, this);
  }
  
  // note: cannot bind this to the tween function, as this points to the selection of the tween
};

ListGauge.prototype.demo = function() {
  // Every so often, start a transition to a new random angle. Use transition.call
  // (identical to selection.call) so that we can encapsulate the logic for
  // tweening the arc in a separate function below.
  
  setInterval(function() {
    var min = 500;
    var max = 1500;
    // calc a int random value between min and max
    var value = Math.floor(Math.random() * (max - min)) + min;
    this.setValue(value);
  }.bind(this), 1500);
};