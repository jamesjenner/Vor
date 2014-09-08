var PieLabelFormatter = {};

PieLabelFormatter.valueFormat = function(total, value) {
  return value;
};

PieLabelFormatter.percentageFormat = function(total, value) {
  return ((value / total) * 100).toFixed(2) + '%';
};

PieLabelFormatter.percentageFormatNoDecimals = function(total, value) {
  return ((value / total) * 100).toFixed(0) + '%';
};

PieLabelFormatter.noLabel = function(total, value) {
  return null;
};

(function basic_pie(container) {

  var
    d1 = [[0, 4]],
    d2 = [[0, 3]],
    d3 = [[0, 1.03]],
    graph;
  
  graph = Flotr.draw(container, [
    { data : d1, label : 'Not Started' },
    { data : d2, label : 'WIP' },
    { data : d3, label : 'Done', },
  ], {
    HtmlText : true,
    textEnabled: false,
    shadowSize: 0,
    colors: ['#cc0000', '#dddd00', '#00aa00', ],
    pie: {
      show: true, 
      explode: 0,
      lineWidth: 3,
      fill: true,
      fillColor: null,
      fillOpacity: 0.8,
      sizeRatio: 0.8,
      startAngle: Math.PI/4,
      labelFormatter: PieLabelFormatter.valueFormat,
      epsilon: 0.1,
      pie3D: false,
    },
    grid : {
      verticalLines: false,
      horizontalLines: false,
      outline: null,
    },
    xaxis: { showLabels: false },
    yaxis: { showLabels: false },
    mouse: { track : false },
    legend: { show: false },
  });
})(document.getElementById("progress1"));
             
