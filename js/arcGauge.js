if(typeof module == "undefined"){
    var module = function(){};
    var exports = this['arcGauge'] = {};
    module.exports = exports;
}
if (typeof require != "undefined") {
//    var Class = require('./file');
}

module.exports = ArcGauge;
    
ArcGauge.COLOR_MODE_RANGE = "colorModeRange";
ArcGauge.COLOR_MODE_VALUE = "colorModeValue";

// http://tauday.com/tau-manifesto
ArcGauge.τ = 2 * Math.PI; 
ArcGauge.TAU = 2 * Math.PI; 

function ArcGauge(options) {
  
  options = options || {};

  this.startAngle = ((options.startAngle != null && options.startAngle !== undefined) ? options.startAngle : ArcGauge.TAU * .6);
  this.arcAngle = ((options.arcAngle != null && options.arcAngle !== undefined) ? options.arcAngle : ArcGauge.TAU * .8);
  this.endAngle = this.startAngle + this.arcAngle;
  
  this.goodMargin = ((options.goodMargin != null && options.goodMargin !== undefined) ? options.goodMargin : .05);
  this.badMargin = ((options.badMargin != null && options.badMargin !== undefined) ? options.badMargin : .15);
  this.colorMode = ((options.colorMode != null && options.colorMode !== undefined) ? options.colorMode : ArcGauge.COLOR_MODE_VALUE);
  
  this.value = ((options.value != null && options.value !== undefined) ? options.value : 0);
  this.target = ((options.target != null && options.target !== undefined) ? options.target : .5);

  this.appendTo = ((options.appendTo != null && options.appendTo !== undefined) ? options.appendTo : "body")
    
  var width = 300,
      height = 300;

  // An arc function with all values bound except the endAngle. So, to compute an
  // SVG path string for a given angle, we pass an object with an endAngle
  // property to the `arc` function, and it will return the corresponding string.

  var arc = d3.svg.arc()
      .innerRadius(80)
      .outerRadius(120)
      .startAngle(this.startAngle);

  this.innerArc = d3.svg.arc()
      .innerRadius(82)
      .outerRadius(118)
      .startAngle(this.startAngle);

  var markArc = d3.svg.arc()
      .innerRadius(115)
      .outerRadius(125)
      .startAngle(this.startAngle + (this.arcAngle * (this.target - 0.005)));

  // Create the SVG container, and apply a transform such that the origin is the
  // center of the canvas. This way, we don't need to position arcs individually.
  var svg = d3.select("#" + this.appendTo).append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")

  // Add the background arc, from 0 to 100% (τ).
  var background = svg.append("path")
      .datum({endAngle: this.endAngle})
      .style("fill", "#ddd")
      .attr("d", arc);

  // Add the foreground arc in orange, currently showing 12.7%.

  var foregroundColor = "black";

  if(this.colorMode === ArcGauge.COLOR_MODE_VALUE) {
    var diff = Math.abs(this.value - this.target);

    if(diff < this.goodMargin) {
      foregroundColor = "green";
    } else if(diff < this.badMargin) {
      foregroundColor = "orange";
    } else {
      foregroundColor = "red";
    }
  }


  if(this.colorMode === ArcGauge.COLOR_MODE_RANGE) {
    if(this.value < .3) {
      foregroundColor = "red";
    } else if(this.value < .7) {
      foregroundColor = "orange";
    } else {
      foregroundColor = "green";
    }
  }

  this.targetMark = svg.append("path")
      .datum({endAngle: this.startAngle + (this.arcAngle * this.target)})
      .style("fill", "rgba(150, 150, 150, .8)")
      .attr("d", markArc);

  this.foreground = svg.append("path")
      .attr("id", "targetValue")
      .datum({endAngle: this.startAngle + (this.arcAngle * this.value)})
      .style("fill", foregroundColor)
      .attr("d", this.innerArc);

  this.text = svg.append("text")
      .attr("id", "arcValue")
      .attr("dy", ".35em")
      // .text((this.value * 100) + "%")
      .text((this.value * 100))
      .attr("text-anchor", "middle")
      .attr("font-family", "sans-serif")
      .style("font-weight", "bold")
      // .style("font-size","40px")
      .attr("font-size", "40px")
      .attr("fill", "black");

  // newText.setAttributeNS(null,"fill-opacity",Math.random());		
  // newText.setAttributeNS(null,"fill","rgb("+ red +","+ green+","+blue+")");
}

ArcGauge.prototype.setTarget = function(newTarget) {    
  // ToDo: write logic to update the target
//  this.foreground.transition()
//      .duration(750)
//      .call(arcTween, this.startAngle + (this.arcAngle * newValue), this.innerArc);
}
    
ArcGauge.prototype.setValue = function(newValue) {    
  // ToDo: write logic to update the color of the innnerArc
  this.foreground.transition()
      .duration(750)
      .call(arcTween, this.startAngle + (this.arcAngle * newValue), this.innerArc);

  this.text.transition()
    .duration(750)
    .ease('linear')
    .tween('text', function() {
      var i = d3.interpolate(this.textContent, newValue * 100);
      return function(t) {
        this.textContent = Math.round(i(t));
      };
  });
}

ArcGauge.prototype.demo = function() {
  // Every so often, start a transition to a new random angle. Use transition.call
  // (identical to selection.call) so that we can encapsulate the logic for
  // tweening the arc in a separate function below.
  
  setInterval(function() {
    var newValue =  Math.random();
    this.setValue(newValue);
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
