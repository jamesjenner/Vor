this['arcGauge'] = {};
    
ArcGauge.COLOR_MODE_RANGE = "colorModeRange";
ArcGauge.COLOR_MODE_VALUE = "colorModeValue";

// http://tauday.com/tau-manifesto -> TAU == 2PI
ArcGauge.τ = 2 * Math.PI; 
ArcGauge.TAU = 2 * Math.PI; 

ArcGauge.DISPLAY_PERCENTAGE = "displayAsPercentage";
ArcGauge.DISPLAY_VALUE = "displayAsValue";
ArcGauge.VALUES_PERCENTAGE = "valuesPercentage";
ArcGauge.VALUES_ACTUAL = "valuesActual";

function ArcGauge(options) {
  options = options || {};

  this.startAngle = ((options.startAngle != null && options.startAngle !== undefined) ? options.startAngle : ArcGauge.TAU * .6);
  this.arcAngle = ((options.arcAngle != null && options.arcAngle !== undefined) ? options.arcAngle : ArcGauge.TAU * .8);
  this.endAngle = this.startAngle + this.arcAngle;
  
  this.goodMargin = ((options.goodMargin != null && options.goodMargin !== undefined) ? options.goodMargin : 2);
  this.dangerMargin = ((options.dangerMargin != null && options.dangerMargin !== undefined) ? options.dangerMargin : 10);
  this.colorMode = ((options.colorMode != null && options.colorMode !== undefined) ? options.colorMode : ArcGauge.COLOR_MODE_VALUE);

  this.valueType = ((options.valueType != null && options.valueType !== undefined) ? options.valueType : ArcGauge.VALUES_ACTUAL);
  
  this.minValue = ((options.minValue != null && options.minValue !== undefined) ? options.minValue : 0);
  this.maxValue = ((options.maxValue != null && options.maxValue !== undefined) ? options.maxValue : 100);

  this.goodColor = ((options.goodColor != null && options.goodColor !== undefined) ? options.goodColor : "green");
  this.warningColor = ((options.warningColor != null && options.warningColor !== undefined) ? options.warningColor : "orange");
  this.dangerColor = ((options.dangerColor != null && options.dangerColor !== undefined) ? options.dangerColor : "red");
  this.markColor = ((options.markColor != null && options.markColor !== undefined) ? options.markColor : "gray");
  this.textColor = ((options.textColor != null && options.textColor !== undefined) ? options.textColor : "black");
  this.backgroundColor = ((options.backgroundColor != null && options.backgroundColor !== undefined) ? options.backgroundColor : "lightgray");
  
  this.value = ((options.value != null && options.value !== undefined) ? options.value : 0);
  this.setValue(this.value, false);
  
  this.target = ((options.target != null && options.target !== undefined) ? options.target : .5);
  this.setTarget(this.target, false);
  
  // update good/bad margin based on percentage so it can be calculated in future
  
  this.textDisplayMode = ((options.textDisplayMode != null && options.textDisplayMode !== undefined) ? options.textDisplayMode : ArcGauge.DISPLAY_PERCENTAGE);
  
  this.appendTo = ((options.appendTo != null && options.appendTo !== undefined) ? options.appendTo : "body")
    
  this.width = ((options.width != null && options.width !== undefined) ? options.width : 300);
  this.height = ((options.height != null && options.height !== undefined) ? options.height : 300);

  // An arc function with all values bound except the endAngle. So, to compute an
  // SVG path string for a given angle, we pass an object with an endAngle
  // property to the `arc` function, and it will return the corresponding string.

  var arc = d3.svg.arc()
      .innerRadius(80)
      .outerRadius(120)
      .startAngle(this.startAngle);

  this.innerArc = d3.svg.arc()
//      .innerRadius(82)
//      .outerRadius(118)
      .innerRadius(80)
      .outerRadius(120)
      .startAngle(this.startAngle);

  this.markArc = d3.svg.arc()
//      .innerRadius(115)
//      .outerRadius(125)
      .innerRadius(122)
      .outerRadius(126)
      // .startAngle(this.startAngle + (this.arcAngle * (this.targetPercentage - 0.005)));
      .startAngle(this.startAngle);

  // Create the SVG container, and apply a transform such that the origin is the
  // center of the canvas. This way, we don't need to position arcs individually.
//  var svg = d3.select("#" + this.appendTo).append("svg")
//      .attr("width", this.width)
//      .attr("height", this.height)
//      .append("g")
//      .attr("transform", "translate(" + this.width / 2 + "," + this.height / 2 + ")");

//  var svg = d3.select("#" + this.appendTo).append("svg")
//      .attr("width", this.width)
//      .attr("height", this.height);
//  svg = svg.append("g")
//      .attr("transform", "translate(" + this.width / 2 + "," + this.height / 2 + ")");
  
  var svg = d3.select("#" + this.appendTo).append("svg")
      .attr("width", "100%")
      .attr("height", "100%");
  
  var elem1 = document.getElementById(this.appendTo);
  var style = window.getComputedStyle(elem1, null);

  console.log("style info, w: " + parseFloat(style.width) + " h: " + parseFloat(style.height));
  var svgBBox = svg.node().getBBox();
  
  console.log("svg attr: " + svg.attr("width"));
  
   svg = svg.append("g").attr("transform", "translate(" + parseFloat(style.width) / 2 + "," + parseFloat(style.height) / 2 + ")");
  // svg.append("g").attr("transform", "translate(" + this.width / 2 + "," + this.height / 2 + ")");
  // svg.append("g").attr("transform", "translate(" + this.width + "," + this.height + ")");

  // Add the background arc, from 0 to 100% (τ).
  var background = svg.append("path")
      .datum({endAngle: this.endAngle})
      .style("fill", this.backgroundColor)
      .attr("d", arc);

  var foregroundColor = this._determineForegroundColor();
  
  this.targetMark = svg.append("path")
      .datum({endAngle: this.startAngle + (this.arcAngle * this.targetPercentage)})
      .style("fill", this.markColor)
      .attr("d", this.markArc);

  this.foreground = svg.append("path")
      .attr("id", "targetValue")
      .datum({endAngle: this.startAngle + (this.arcAngle * this.valuePercentage)})
      .style("fill", foregroundColor)
      .attr("d", this.innerArc);

  this.text = svg.append("text")
      .attr("id", "arcValue")
      .attr("dy", ".35em")
      .text(this._getTextValue())
      .attr("text-anchor", "middle")
      .attr("font-family", "sans-serif")
      .style("font-weight", "bold")
      // .style("font-size","40px")
      .attr("font-size", "40px")
      .attr("fill", this.textColor);

  // newText.setAttributeNS(null,"fill-opacity",Math.random());		
  // newText.setAttributeNS(null,"fill","rgb("+ red +","+ green+","+blue+")");
}

    
ArcGauge.prototype._getTextValue = function() {
  var displayText = '';
  
  switch(this.textDisplayMode) {
    case ArcGauge.DISPLAY_PERCENTAGE:
      displayText = this.valuePercentage * 100;
      break;
      
    case ArcGauge.DISPLAY_VALUE:
    default:
      displayText = this.value;
  }
  
  console.log("displayText: " + displayText);
  
  return displayText;
}

ArcGauge.prototype._determineForegroundColor = function() {
  var foregroundColor = this.goodColor;

  if(this.colorMode === ArcGauge.COLOR_MODE_VALUE) {
    if(this.value >= this.target - this.goodMargin) {
      foregroundColor = this.goodColor;
    } else if(this.value <= this.target - this.dangerMargin) {
      foregroundColor = this.dangerColor;
    } else {
      foregroundColor = this.warningColor;
    }
  }

  // TODO: sort out range mode for color
  if(this.colorMode === ArcGauge.COLOR_MODE_RANGE) {
    if(this.value < .3) {
      foregroundColor = this.dangerColor;
    } else if(this.value < .7) {
      foregroundColor = this.warningColor;
    } else {
      foregroundColor = this.goodColor;
    }
  }
  
  return foregroundColor;
}

ArcGauge.prototype.setTarget = function(newValue, redrawGauge) {
  redrawGauge = ((redrawGauge != null && redrawGauge !== undefined) ? redrawGauge : true);
  
  this.target = newValue;
  
  if(this.valueType == ArcGauge.VALUES_ACTUAL) {
    this.targetPercentage = (this.target - this.minValue) / (this.maxValue - this.minValue);
  } else {
    this.targetPercentage = newValue;
  }
  
  if(redrawGauge) {
    var percentageValue = this.valuePercentage;

    (function(percentageValue, arcGaugeInst) {

//  var markArc = d3.svg.arc()
//      .innerRadius(122)
//      .outerRadius(126)
//      .startAngle(this.startAngle);
//      
//  this.targetMark = svg.append("path")
//      .datum({endAngle: this.startAngle + (this.arcAngle * this.targetPercentage)})
//      .style("fill", "rgba(150, 150, 150, .8)")
//      .attr("d", markArc);
      
      arcGaugeInst.targetMark.transition()
        .duration(750)
        .call(arcTween, arcGaugeInst.startAngle + (arcGaugeInst.arcAngle * arcGaugeInst.targetPercentage), arcGaugeInst.markArc);
      
      arcGaugeInst.foreground.transition()
        .duration(750)
        .style("fill", arcGaugeInst._determineForegroundColor());
    })(this.valuePercentage, this);
  }
}

ArcGauge.prototype.setValue = function(newValue, redrawGauge) {
  redrawGauge = ((redrawGauge != null && redrawGauge !== undefined) ? redrawGauge : true);
  
  this.value = newValue;
  
  if(this.valueType == ArcGauge.VALUES_ACTUAL) {
    this.valuePercentage = (this.value - this.minValue) / (this.maxValue - this.minValue);
  } else {
    this.valuePercentage = newValue;
  }
  
  if(redrawGauge) {
    var percentageValue = this.valuePercentage;

    (function(percentageValue, arcGaugeInst) {
      arcGaugeInst.foreground.transition()
        .duration(750)
        .style("fill", arcGaugeInst._determineForegroundColor())
        .call(arcTween, arcGaugeInst.startAngle + (arcGaugeInst.arcAngle * arcGaugeInst.valuePercentage), arcGaugeInst.innerArc);

      arcGaugeInst.text.transition()
        .duration(750)
        .ease('linear')
        .tween('text', function() {
          var ip = d3.interpolate(this.textContent, percentageValue * 100);
          return function(t) {
            this.textContent = Math.round(ip(t));
          };
      });
    })(this.valuePercentage, this);
  }
  
  // note: cannot bind this to the tween function, as this points to the selection of the tween
}

ArcGauge.prototype.demo = function() {
  // Every so often, start a transition to a new random angle. Use transition.call
  // (identical to selection.call) so that we can encapsulate the logic for
  // tweening the arc in a separate function below.
  
  setInterval(function() {
    if(this.valueType == ArcGauge.VALUES_ACTUAL) {
      this.setTarget(Math.random() * 100);
      this.setValue(Math.random() * 100);
    } else {
      this.setTarget(Math.random());
      this.setValue(Math.random());
    }
  }.bind(this), 1500);
}

// Creates a tween on the specified transition's "d" attribute, transitioning
// any selected arcs from their current angle to the specified new angle.
function arcTween(transition, newAngle, arc) {
  // The function passed to attrTween is invoked for each selected element when
  // the transition starts, and for each element returns the interpolator to use
  // over the course of transition. This function is thus responsible for
  // determining the starting angle of the transition (which is pulled from the
  // element's bound datum, d.endAngle), and the ending angle (simply the
  // newAngle argument to the enclosing function).
  transition.attrTween("d", function(d) {

    // To interpolate between the two angles, we use the default d3.interpolate.
    // (Internally, this maps to d3.interpolateNumber, since both of the
    // arguments to d3.interpolate are numbers.) The returned function takes a
    // single argument t and returns a number between the starting angle and the
    // ending angle. When t = 0, it returns d.endAngle; when t = 1, it returns
    // newAngle; and for 0 < t < 1 it returns an angle in-between.
    var interpolate = d3.interpolate(d.endAngle, newAngle);

    // The return value of the attrTween is also a function: the function that
    // we want to run for each tick of the transition. Because we used
    // attrTween("d"), the return value of this last function will be set to the
    // "d" attribute at every tick. (It's also possible to use transition.tween
    // to run arbitrary code for every tick, say if you want to set multiple
    // attributes from a single function.) The argument t ranges from 0, at the
    // start of the transition, to 1, at the end.
    return function(t) {

      // Calculate the current arc angle based on the transition time, t. Since
      // the t for the transition and the t for the interpolate both range from
      // 0 to 1, we can pass t directly to the interpolator.
      //
      // Note that the interpolated angle is written into the element's bound
      // data object! This is important: it means that if the transition were
      // interrupted, the data bound to the element would still be consistent
      // with its appearance. Whenever we start a new arc transition, the
      // correct starting angle can be inferred from the data.
      d.endAngle = interpolate(t);

      // Lastly, compute the arc path given the updated data! In effect, this
      // transition uses data-space interpolation: the data is interpolated
      // (that is, the end angle) rather than the path string itself.
      // Interpolating the angles in polar coordinates, rather than the raw path
      // string, produces valid intermediate arcs during the transition.
      return arc(d);
    };
  });
}
