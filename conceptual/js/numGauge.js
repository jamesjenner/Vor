this['numGauge'] = {};
    
NumGauge.DISPLAY_PERCENTAGE = "displayAsPercentage";
NumGauge.DISPLAY_VALUE = "displayAsValue";

NumGauge.VALUES_PERCENTAGE = "valuesPercentage";
NumGauge.VALUES_ACTUAL = "valuesActual";

NumGauge.GOOD_HIGH = "goodHigh";
NumGauge.GOOD_LOW  = "goodLow";


function NumGauge(options) {
  options = options || {};

  this.goodDirection = ((options.goodDirection !== null && options.goodDirection !== undefined) ? options.goodDirection : NumGauge.GOOD_LOW);
  
  this.goodMargin = ((options.goodMargin !== null && options.goodMargin !== undefined) ? options.goodMargin : 0);
  this.dangerMargin = ((options.dangerMargin !== null && options.dangerMargin !== undefined) ? options.dangerMargin : 0);

  this.valueType = ((options.valueType !== null && options.valueType !== undefined) ? options.valueType : NumGauge.VALUES_ACTUAL);
  
  this.goodColor = ((options.goodColor !== null && options.goodColor !== undefined) ? options.goodColor : "green");
  this.warningColor = ((options.warningColor !== null && options.warningColor !== undefined) ? options.warningColor : "orange");
  this.dangerColor = ((options.dangerColor !== null && options.dangerColor !== undefined) ? options.dangerColor : "red");
  this.displaySymbol = ((options.displaySymbol !== null && options.displaySymbol !== undefined) ? options.displaySymbol : false);
  this.symbol = ((options.symbol !== null && options.symbol !== undefined) ? options.symbol : "%");
  
  this.displayNegative = ((options.displayNegative !== null && options.displayNegative !== undefined) ? options.displayNegative : false);
  this.symbolAdjY = ((options.symbolAdjY !== null && options.symbolAdjY !== undefined) ? options.symbolAdjY : 0);
  
  this.setValue(options.value, false);
  
  this.textDisplayMode = ((options.textDisplayMode !== null && options.textDisplayMode !== undefined) ? options.textDisplayMode : NumGauge.DISPLAY_VALUE);
  this.textSize = ((options.textSize !== null && options.textSize !== undefined) ? options.textSize : 5);
  this.textFontName = ((options.textFontName !== null && options.textFontName !== undefined) ? options.textFontName : "sans-serif");
  this.textFontWeight = ((options.textFontWeight !== null && options.textFontWeight !== undefined) ? options.textFontWeight : "bold");
  
  this.appendTo = ((options.appendTo !== null && options.appendTo !== undefined) ? options.appendTo : "body");
    
  // Create the SVG container, and apply a transform such that the origin is the
  // center of the canvas. This way, we don't need to position arcs individually.
  // setup the viewbox so that the size changes automatically

  var svg = d3.select("#" + this.appendTo).append("svg")
    .attr("id", "numWidget")
    .attr("width", this.width)
    .attr("height", this.height)
    .attr("viewBox", "0 0 100 100")
    .attr("perserveAspectRatio", "meet")
    .append("g")
    ;

  this.textValue = svg.append("text")
      .attr("id", "numValue")
      .attr("dx", 50)
      .attr("dy", 50)
      .text(this._getTextValue())
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .attr("font-family", this.textFontName)
      .style("font-weight", this.textFontWeight)
      .style("font-size", this.textSize + "em")
      .attr("fill", this._determineForegroundColor());

  if(this.displaySymbol) {
    this.textSymbol = svg.append("text")
      .attr("id", "numSymbol")
      .attr("dx", 107)   // do not understand why 105, but it works...
      .attr("dy", 30 + this.symbolAdjY)
      .text(this.symbol)
      .attr("text-anchor", "end")
      .attr("dominant-baseline", "central")
      .attr("font-family", this.textFontName)
      .style("font-weight", this.textFontWeight)
      .style("font-size", (this.textSize / 3) + "em")
      .attr("fill", this._determineForegroundColor());
  }

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

NumGauge.prototype._getTextValue = function() {
  var displayText = '';
  
  switch(this.textDisplayMode) {
    case NumGauge.DISPLAY_PERCENTAGE:
      displayText = this.valuePercentage * 100;
      break;
      
    case NumGauge.DISPLAY_VALUE:
    default:
      displayText = this.value;
  }
  
  return displayText;
};

NumGauge.prototype._determineForegroundColor = function() {
  var foregroundColor = this.goodColor;

  if(this.goodDirection === NumGauge.GOOD_LOW) {
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

NumGauge.prototype.setValue = function(newValue, redrawGauge) {
  var oldValue = this.value;
  var replacementValue = newValue;
  this.value = ((newValue !== null && newValue !== undefined) ? newValue : 0);
  
  redrawGauge = ((redrawGauge !== null && redrawGauge !== undefined) ? redrawGauge : true);
  
  var format = d3.format("f");
      
  if(this.valueType == NumGauge.VALUES_PERCENTAGE) {
    oldValue = this.valuePercentage;
    replacementValue = (this.value - this.minValue) / (this.maxValue - this.minValue);
    format = d3.format(".0%");
  }
  
  if(redrawGauge) {
    (function(replacementValue, gaugeInst) {
      gaugeInst.textValue.transition()
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
      
      if(gaugeInst.displaySymbol) {
        gaugeInst.textSymbol.transition()
          .duration(750)
          .ease('linear')
          .style("fill", gaugeInst._determineForegroundColor());
      }
      
    })(replacementValue, this);
  }
  
  // note: cannot bind this to the tween function, as this points to the selection of the tween
};

NumGauge.prototype.demo = function(min, max) {
  // Every so often, start a transition to a new random angle. Use transition.call
  // (identical to selection.call) so that we can encapsulate the logic for
  // tweening the arc in a separate function below.
  
  setInterval(function(min, max) {
//    var min = 0;
//    var max = 8;
    // calc a int random value between min and max
    var value = Math.floor(Math.random() * (max - min)) + min;
    this.setValue(value);
  }.bind(this, min, max), 1500);
};