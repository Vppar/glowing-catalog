(function(angular) {
    'use strict';

    var templateUrl = 'components/d3-termometer/termometer.html';

    angular.module('glowingCatalogApp').run(['$http', '$templateCache', function($http, $templateCache) {
        $http.get(templateUrl, {
            cache : $templateCache
        });
    }]);

    angular.module('tnt.chart.components.termometer', []).directive('termometer', function() {
        return {
            restrict : 'E',
            templateUrl : templateUrl,
            replace: true,
            scope : {
                values : '=values',
                tip : '=tip',
                height : '=height',
                bands : '=bands',
                firstcolor : '@firstcolor',
                middlecolor : '@middlecolor',
                lastcolor : '@lastcolor'
            },
            link: function (scope, element, attrs) {

                var goal = null;
                var snapshot = null;
                var hasTip = null;
                var height = null;
                var numBands = null;
                var bands = null;
                var firstColor = null;
                var lastColor = null;
                var middleColor = null;
                var label = null;

                var format = d3.format('%');

                var width = 801;
                var marginLeft = 45;
                var marginBottom = 20;

                var chart = d3.select(element[0]);

                var color = null;
                var x = null;

                var colorDomain = null;
                var colorRange = null;

                var canvas = null;


                scope.$watchCollection('values', draw);

                function clear() {
                    chart.selectAll('*').remove();
                }

                function setValues() {
                    goal = scope.values.goal;
                    snapshot = scope.values.snapshot;
                    hasTip = scope.tip;
                    height = scope.height;
                    numBands = scope.bands;
                    bands = [];
                    firstColor = scope.firstcolor;
                    lastColor = scope.lastcolor;
                    middleColor = scope.middlecolor;
                    label = snapshot/goal;

                    var i = null;

                    while (i < numBands) {
                        bands.push(++i);
                    }

                    if(middleColor){
                        colorDomain = [bands[0],bands[bands.length-1]/2,bands[bands.length-1]];
                        colorRange = [firstColor,middleColor,lastColor];
                    }else{
                        colorDomain = [bands[0],bands[bands.length-1]];
                        colorRange = [firstColor,lastColor];
                    }

                    color = d3.scale.linear().domain(colorDomain).range(colorRange);
                    x = d3.scale.linear().domain([0,goal]).range([marginLeft, width]);
                }


                function draw() {
                    clear();
                    setValues();

                    drawBar();
                    drawScale();

                    var pos = x(snapshot > goal ? goal : snapshot);
                    tooltip(pos, format(label), '#333');
                }

                function drawBar(){
                    canvas = chart.append('svg')
                    .attr('class','termometer-canvas')
                    .style('margin-left',marginLeft)
                    .attr('width', width)
                    .attr('height', height);

                    var gradient = canvas
                    .append("linearGradient")
                    .attr("y1", 0)
                    .attr("y2", 0)
                    .attr("x1", 0)
                    .attr("x2", width)
                    .attr("id", "gradient")
                    .attr("gradientUnits", "userSpaceOnUse")

                    gradient
                    .append("stop")
                    .attr("offset", "0")
                    .attr("stop-color", firstColor)

                    gradient
                    .append("stop")
                    .attr("offset", "0.5")
                    .attr("stop-color", middleColor)

                    gradient
                    .append("stop")
                    .attr("offset", "1")
                    .attr("stop-color", lastColor)

                    var bar = canvas.append('rect')
                    .attr('width', width - marginLeft)
                    .attr('height', height)
                    .attr('y', 0)
                    .attr('fill', '#333')
                    .attr("fill", "url(#gradient)");
                }

                function drawScale(){
                    canvas.append("g")
                    .attr("class", "grid-x32")
                    .selectAll('l')
                    .data([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31])
                    .enter()
                    .append('line')
                    .attr('x1', function(d,i){  return ((x(goal)-marginLeft)/32)*i;   })
                    .attr('y1', function(d){ return 10; })
                    .attr('x2', function(d,i){  return ((x(goal)-marginLeft)/32)*i;   })
                    .attr('y2', function(d){ return 20; })
                    .attr('stroke', function(d,i){
                        if(i == 0) return 'none';
                        return '#fff'; 
                    });

                    canvas.append("g")
                    .attr("class", "grid-x8")
                    .selectAll('l')
                    .data([0,1,2,3,4,5,6,7])
                    .enter()
                    .append('line')
                    .attr('x1', function(d,i){  return ((x(goal)-marginLeft)/8)*i;   })
                    .attr('y1', 7)
                    .attr('x2', function(d,i){  return ((x(goal)-marginLeft)/8)*i;   })
                    .attr('y2', 20)
                    .attr('stroke', '#fff' );

                    canvas.append("g")
                    .attr("class", "grid-x4")
                    .selectAll('l')
                    .data([0,1,2,3])
                    .enter()
                    .append('line')
                    .attr('x1', function(d,i){  return ((x(goal)-marginLeft)/4)*i;   })
                    .attr('y1', 7)
                    .attr('x2', function(d,i){  return ((x(goal)-marginLeft)/4)*i;   })
                    .attr('y2', 20)
                    .attr('stroke', function(d,i){
                        if(i == 0) return 'none';
                        return '#fff'; 
                    })
                    .attr('stroke-width', '2' );

                    canvas.append("g")
                    .attr("class", "grid-x2")
                    .append('line')
                    .attr('x1', (x(goal)-marginLeft)/2 )
                    .attr('y1', 0)
                    .attr('x2', (x(goal)-marginLeft)/2 )
                    .attr('y2', 20)
                    .attr('stroke', '#fff')
                    .attr('stroke-width', '2' );

                }


                function tooltip(value, label, color){
                    var h = 5;
                    var w = 20;

                    var tw = 16;
                    var th = 8;

                    var canvas = chart.append('svg')
                    .attr('class','tooltip-canvas')
                    .style('position','absolute')
                    .style('top', (-th) + 'px')
                    .style('left', (value - w/2) + 'px')
                    .attr('width', w)
                    .attr('height', h + tw);

                    var triangleMap = d3.svg.line()
                    .x(function(d){
                        return d.x;
                    })
                    .y(function(d){
                        return d.y;
                    });

                    var triangleStrokeWidth = 3;
                    var triangleStrokeColor = '#ffffff';

                    var triangleStroke = [{
                        x : w/2 - tw/2 - triangleStrokeWidth,
                        y : h - 2
                    }, {
                        x : w/2 + tw/2 + triangleStrokeWidth,
                        y : h - 2
                    }, {
                        x : w/2,
                        y : h - 2 + th + triangleStrokeWidth
                    }];

                    var triangle = [
                    {x:w/2-tw/2,y:h - 2},
                    {x:w/2+tw/2,y:h - 2},
                    {x:w/2,y:h - 2 + th}
                    ];

                    canvas.append('path')
                    .attr('d', triangleMap(triangleStroke))
                    .attr('fill', triangleStrokeColor);

                    canvas.append('path')
                    .attr('d', triangleMap(triangle))
                    .attr('fill', color || '#333');
                }


                draw();
            }
        }
    });
}(angular));
