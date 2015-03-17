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

##Usage

    new ArcGauge([options]);

##Options

* value - initial value, defualt is 0
* target - initial target value, default is 0.5
* minValue - minimum allowed value, default is 0
* maxValue - maximum allowed value, default is 100
* valueType - how to display the value, default is `ArcGauge.VALUES_ACTUAL` (`ArcGauge.VALUES_PERCENTAGE` | `ArcGauge.VALUES_ACTUAL`) 
* displayTarget - display the target element, default is `true` (`true`|`false`) 
* startAngle - starting angle of gauge, defualt is `ArcGauge.TAU` * 0.6
* arcAngle - the total angle of the gauge, default is `ArcGauge.TAU` * 0.8
* endAngle - ending angle of gauge, cannot be set via options, defaults to `startAngle` plus `arcAngle`
* goodMargin - value from which the value is determined as good, affects colour of gauge
* dangerMargin - value from which the value is determined as in danger, affects colour of gauge
* colorMode - mode to determine colour of the indicator, currently supports `ArcGauge.COLOR_MODE_MANUAL` and `ArcGauge.COLOR_MODE_VALUE`
* goodColor - the colour when the value is deemed good, value is larger than or equal to `goodMargin`
* warningColor - the colour when the value is deemed in warning, value is less than `goodMargin` and larger than `dangerMargin`
* dangerColor - the color when the alue is deemed in danger, value is less than or equal to the `dangerMargin`
* markColor - the color for the target element
* textColor - the color for the text
* backgroundColor - the color of the background
* barColor - color of the indicator, used when `colorMode` equals `ArcGauge.COLOR_MODE_MANUAL`
* textDisplayMode - controls formatting of value for display, if `ArcGauge.DISPLAY_PERCENTAGE` then will display as percentage with symbol
* textSize - sets the font size for the text, default is 40 for a viewbox of 200 by 200
* textFontName - sets the name of the font, default is `sans-serif`
* textFontWeight - sets the weight of the font, default is `bold`
* appendTo - the id of the HTML element to append the gauge to, defaults to body
* width - width of gauge, sets the width attribute for the generated svg 
* height - height of gauge, sets the height attribute for the generated svg 
* innerRadius - the inner radius of the indicator arc, defaults to 40 for a viewbox of 200 by 200
* outerRadius - the outer radius of the indicator arc, defaults to 120 for a viewbox of 200 by 200
* markerInnerRadius - the inner radius of the target arc, defaults to the `outerRadius` + 2
* markerOuterRadius - the outer raidus of the target arc, defaults to the `markerInnerRadius` + 4

##Methods

####setTarget(value[, redraw])

Set the target indicator value.

* value, the new value for the target, will be overridden if outside minValue/maxValue
* redraw, redraw the gauge

####setValue(value[, redraw])

Set the main indicator value.

* value, the new value for the inidicator, will be overridden if outside minValue/maxValue
* redraw, redraw the gauge

####setIndicatorColor(color)

Override the indicator color.

* color, the color for the indicator

Note that this will set `colorMode` to `ArcGauge.COLOR_MODE_MANUAL`, resulting in a fixed indicator color

####setText(text)

Override the text.

* text, the text to display in the gauge

Note that this will set `textDisplayMode` to `ArcGauge.DISPLAY_TEXT`, resulting in fixed text

####demo()

Set the gauge to run in demo mode, changing the value of the indicator and target to a random value between the minValue and maxValue (inclusive).

##Versions

###0.0.3 

The following is a summary of the changes in release 0.0.3.

* `setIndicatorColor()`, new method, set the color of the indicator and change the color mode to manual
* `setText()`, new method, set the text displayed in the gauge and change the display mode to text
* `ArcGauge.COLOR_MODE_MANUAL`, new option for `options.colorMode`, the color of the indicator will not automatically change based on the value
* `ArcGauge.DISPLAY_TEXT`, new option for `options.textDisplayMode`, the text on the gauge will not automatically change to the value
* `demo()`, returns the instance of the ArcGauge that it is operating upon. 

The demo has been updated to demonstrate `setIndicatorColor()` and `setText()`.

###0.0.2 

The following is a summary of the changes in release 0.0.2.

* Correctly displays values, irrespective of `textDisplayMode`
* `displayTarget`, new option. Controls whether the target element of the gauge will be displayed
* `colorMode`, new option. Determines if the color of the inidicator is determined by `goodMargin`, `badMargin` or manually set. Options are `ArcGauge.COLOR_MODE_MANUAL` and `ArcGauge.COLOR_MODE_VALUE`
* `barColor`, new option, defaults to `blue`. Specifies the color of the indicator on the gauge when `colorMode` is set to `ArcGauge.COLOR_MODE_MANUAL`
* Expanded testArc.html to demonstrate possible ways of using arcGauge.

###0.0.1 

First release

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