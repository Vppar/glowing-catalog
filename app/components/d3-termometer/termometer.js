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
                firstcolor : '=firstcolor',
                lastcolor : '=lastcolor'
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
                var label = null;

                var format = d3.format('%');

                var width = 801;
                var marginLeft = 30;
                var marginBottom = 20;

                var chart = d3.select(element[0]);

                var color = null;
                var x = null;


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
                    label = snapshot/goal;

                    var i = null;

                    while (i < numBands) {
                        bands.push(++i);
                    }

                    color = d3.scale.linear().domain([bands[0],bands[bands.length-1]]).range([firstColor,lastColor]);
                    x = d3.scale.linear().domain([0,goal]).range([marginLeft, width]);
                }


                function draw() {
                    clear();
                    setValues();

                    chart
                        .append("div")
                        .attr("class", "termometer-canvas")
                        .style('padding-top', (height + 8) + 'px')
                        .style('margin-bottom', marginBottom + 'px')
                        .style('width', width - marginLeft + 'px')
                        .selectAll('div')
                        .data(bands)
                        .enter()
                        .append("div")
                        .attr('class','band')  
                        .style('float','left')
                        .style('height',height)
                        .style('background-color',function (d,i) { return color(d); })
                        .style("width", function(d) { return (100/numBands) + "%"; });

                    var pos = x(snapshot > goal ? goal : snapshot);
                    tooltip(pos, format(label),'#333');
                }


                function tooltip(value, label, color){
                    var h = 5;
                    var w = 20;

                    var tw = 8;
                    var th = 5;

                    var canvas = chart.append('svg')
                        .attr('class','tooltip-canvas')
                        .style('position','absolute')
                        .style('top', (20 - th/2) + 'px')
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

                    var triangle = [
                        {x:w/2-tw/2,y:h},
                        {x:w/2+tw/2,y:h},
                        {x:w/2,y:h+th}
                    ];

                    canvas.append('path')
                        .attr("d", triangleMap(triangle));
                        //.attr('stroke',color)
                        //.attr('fill',color);

                    canvas.append('rect')
                        .attr('width', w)
                        .attr('height', h)
                        .attr('x', 0)
                        .attr('y', 0)
                        //.attr('fill', color);

                    canvas.append('text')
                        .attr('x', w/2)
                        .attr('y', h/2 + 3)
                        .style("text-anchor", "middle");
                }


                draw();
            }
        }
    });
}(angular));
