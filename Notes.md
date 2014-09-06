Exmaple line chart using flotr2js:

(function basic(container) {

  var
    actual = [[0, 20], [1, 18], [2, 17], [3, 15], [4, 17], [5, 16], [6, 15], [7, 15]],
    target = [[0, 20], [1, 18], [2, 16], [3, 14], [4, 12], [5, 10], [6, 8], [7, 6], [8, 4], [9, 2], [10, 0]],
    trend =  [[0, 20], [.5, 19.5], [1, 19], [1.5, 18.5], [2, 18], [2.5, 17.5], 
              [3, 17], [3.5, 16.5], [4, 16], [4.5, 15.5], [5, 15], [5.5, 14.5], 
              [6, 14], [6.5, 13.5], [7, 13], [7.5, 12.5], 
              [8, 12], [8.5, 11.5], [9, 11], [9.5, 10.5], [10, 10]]
    i, graph;

  // Draw Graph
  graph = Flotr.draw(container, [ 
    {data: trend,  color: '#AAAAAA', points: {show: true, fill: true, radius: 4, lineWidth: 3}} ,
    {data: target, color: '#CCCCCC', },
    {data: actual, color: '#FF0000', }, 
    ], {
    points: {
      show: false,
    },
    lines: {
      lineWidth: 10,
      fill: false,
      steps: false,
      fillColor: '#00FF00',
      fillBorder: false,
      stacked: false,
    },
    xaxis: {
        majorTickFreq: 1,
        min: 0,
        max: 10,
        noTicks: 10,
        ticks: [[1, '1'], [2, '2'], [3, '3'], [4, '4'], [5, '5'], [6, '6'], [7, '7'], [8, '8'], [9, '9']],
    }, 
    yaxis: {
      majorTickFreq: 5,
        ticks: [[5, '5'], [10, '10'], [15, '15'], [20, '20'], [25, '25'], [30, '30']],
    },
    grid: {
        color: '#000000',
        tickColor: '#CCCCCC',
        horizontalLines: false,
        minorVerticalLines: false
    }
  });
})(document.getElementById("editor-render-0"));



Example pie chart using flotr2js:

(function basic_pie(container) {

  var
    d1 = [[0, 4]],
    d2 = [[0, 3]],
    d3 = [[0, 1.03]],
    d4 = [[0, 3.5]],
    graph;
  
  graph = Flotr.draw(container, [
    { data : d1, label : 'Comedy' },
    { data : d2, label : 'Action' },
    { data : d3, label : 'Romance', },
    { data : d4, label : 'Drama' }
  ], {
    HtmlText : false,
    grid : {
      verticalLines : false,
      horizontalLines : false
    },
    xaxis : { showLabels : false },
    yaxis : { showLabels : false },
    pie : {
      show : true, 
      explode : 6
    },
    mouse : { track : true },
    legend : {
      position : 'se',
      backgroundColor : '#D2E8FF'
    }
  });
})(document.getElementById("editor-render-0"));