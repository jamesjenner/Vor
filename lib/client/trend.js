/*
 * trend.js
 *
 * Copyright (c) 2015 James G Jenner
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
 * 
 * Logic is based on Timothy Banas article on calculating trend line
 * http://classroom.synonym.com/calculate-trendline-2709.html
 * 
 * Some redundancy is kept so that code is comparable to reference material
 */

function calcTrendLine(xSeries, ySeries, ignoreLeadingZeros) {
  ignoreLeadingZeros = (ignoreLeadingZeros !== undefined || ignoreLeadingZeros !== null) ? ignoreLeadingZeros : true;
  
  if(xSeries.length < ySeries.length) {
    return [[0, 0], [0, 0]];
  }
  
  var n;
  var idx;
  var sumPlus = 0;
  var sumSquaredX = 0;
  var sumX = 0;
  var sumY = 0;
  var startOffset = 0;
  
  var adjustedXSeries = [];
  var adjustedYSeries = [];
  var foundValue = false;
  
  if(ySeries[0] === 0) {
    for(idx = 0; idx < xSeries.length; idx++) {
      if(ySeries[idx] !== 0 || foundValue) {
        adjustedXSeries.push(xSeries[idx]);
        if(idx < ySeries.length) {
          adjustedYSeries.push(ySeries[idx]);
        }
        
        if(!foundValue) {
          startOffset = idx + 1;
          foundValue = true;
        }
      }
    }
  } else {
    adjustedXSeries = xSeries;
    adjustedYSeries = ySeries;
  }
  
  n = adjustedYSeries.length;

  for(idx = 0; idx < adjustedYSeries.length; idx++) {
    sumPlus += adjustedXSeries[idx] * adjustedYSeries[idx];
    sumX += adjustedXSeries[idx];
    sumY += adjustedYSeries[idx];
    sumSquaredX += Math.pow(adjustedXSeries[idx], 2);
  }

  var a = n * sumPlus;
  var b = sumX * sumY;
  var c = n * sumSquaredX;
  var d = Math.pow(sumX, 2);
  var m = (a - b) / (c - d);

  var e = sumY;
  var f = m * sumX;

  var bSlope = (e - f) / n;
  
  return [[startOffset, _calcYForX(startOffset)], [xSeries.length, _calcYForX(xSeries.length)]];

  function _calcYForX(x) {
    return m * x + bSlope;
  }
}

