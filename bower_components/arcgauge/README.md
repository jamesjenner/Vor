arcGauge
========

A gauge based around an arc implemented via D3 for use in HTML. The primary purpose is to use as a progress based gauge. 

##Features

* Minimum and maximum values
* Optional target and associated indicator
* Optional three level colour coding based on actual vs target
* Start and stop angle, innner and out radius, and markers all configurable
* Smooth animation for new values (target or actual)
* Completely scalable, including all text components
* Demo option that animates changes in values

##Quick Start

- Clone the repository: `git clone https://github.com/jamesjenner/arcGauge.git`
- Install client dependancies via [Bower](http://bower.io): `bower install arcgauge`

##Example

Note that the following example is available in `https://github.com/jamesjenner/arcGuage/testArc.html`

    <!doctype html>
    <html style="height: 100%">
    <head>
        <meta charset="UTF-8">
        <title>Test Arc Graph</title>
    </head>
    <body style="height: 100%">
      <div id="myGauge" style="height: 100%">
      </div>
      <script type="text/javascript" src="bower_components/d3/d3.min.js"></script>
      <script type="text/javascript" src="arcGauge.js"></script>
      <script>

      var v = new ArcGauge({
        value: 40, 
        minValue: 0,
        maxValue: 100,
        goodMargin: 5,
        dangerMargin: 20,
        valueType: ArcGauge.VALUES_ACTUAL,
        target: 50,
        width: "100%",
        height: "100%",

        innerRadius: 60,
        outerRadius: 93,
        markerInnerRadius: 95,
        markerOuterRadius: 100,

        innerRadius: 80,
        outerRadius: 120,
        markerInnerRadius: 122,
        markerOuterRadius: 126,
        goodColor: "rgb(50,200,50)",
        warningColor: "rgb(200,200,50)",
        dangerColor: "rgb(200,50,50)",
        markColor: "rgba(150, 150, 150, .8)",
        backgroundColor: "#eee",
        appendTo: "myGauge"
      }).demo();

      </script>  
    </body>
    </html>

##Options

* value - initial value, defualt is 0
* target - initial target value, default is 0.5
* minValue - minimum allowed value, default is 0
* maxValue - maximum allowed value, default is 100
* valueType - how to display the value, default is ArcGauge.VALUES_ACTUAL (ArcGauge.VALUES_PERCENTAGE | ArcGauge.VALUES_ACTUAL) 
* displayTarget - display the target element, default is true (true|false) 
* startAngle - starting angle of gauge, defualt is ArcGauge.TAU * 0.6
* arcAngle - the total angle of the gauge, default is ArcGauge.TAU * 0.8
* endAngle - ending angle of gauge, cannot be set via options, defaults to startAngle plus arcAngle
* goodMargin - value from which the value is determined as good, affects colour of gauge
* dangerMargin - value from which the value is determined as in danger, affects colour of gauge
* colorMode - mode for setting the colour of the gauge, currently supports ArcGauge.COLOR_MODE_MANUAL and ArcGauge.COLOR_MODE_VALUE
* goodColor - the colour when the value is deemed good, value is larger than or equal to goodMargin
* warningColor - the colour when the value is deemed in warning, value is less than goodMargin and larger than dangerMargin
* dangerColor - the color when the alue is deemed in danger, value is less than or equal to the dangerMargin
* markColor - the color for the target element
* textColor - the color for the text
* backgroundColor - the color of the background
* barColor - color of the bar, used when colorMode is ArcGauge.COLOR_MODE_MANUAL
* textDisplayMode
* textSize
* textFontName
* textFontWeight
* appendTo
* width
* height
* innerRadius
* outerRadius
* markerInnerRadius
* markerOuterRadius


##Dependancies

* [D3](http://d3js.org/) - a javascript library for manipulating documents based on data

##To Do


##License (MIT)

Copyright (c) 2014 James Jenner

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.