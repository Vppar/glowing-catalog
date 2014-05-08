(function(angular) {
    'use strict';

    var templateUrl = 'components/d3-gauge/gauge.html';

    angular.module('glowingCatalogApp').run(['$http', '$templateCache', function($http, $templateCache) {
        $http.get(templateUrl, {
            cache : $templateCache
        });
    }]);

    angular.module('tnt.chart.components.gauge', []).directive('gauge', function() {
        return {
            restrict : 'E',
            templateUrl : templateUrl,
            replace: true,
            scope : {
                values : '=values',
                tip : '=tip',
                height : '=height'
            },
            link: function (scope, element, attrs) {
                var goal = scope.values.goal;
                var snapshot = scope.values.snapshot;
                var hasTip = scope.tip;
                var height = scope.height;

                var canvas = d3.select('body').selectAll('div.gauge').append('svg')
                .attr('class','gauge-canvas')
                .attr('height', height)
                .style('width','100%');

                var barWidth = 60;
                var topMargin = 0;
                var textTopMargin = 20;

                //scale based on goal value;
                var y = d3.scale.linear().domain([goal,0]).range([height-topMargin, 0]);

                drawBar(goal,'goal');
                drawBar(snapshot,'snapshot');
                drawLine(snapshot);
                drawTip(goal,100,'goal-tip');
                drawTip(snapshot,snapshot/goal,'snapshot-tip');

                function drawBar(value,clazz){

                    var bar = canvas.append('g').attr('class',clazz);

                    var rect = bar.append('rect')
                    .attr('x', 0 )
                    .attr('y', height - y(value))
                    .attr('width', barWidth)
                    .attr('height', y(value))
                    .attr('fill');

                    var text = bar.append('text')
                    .attr('x',barWidth/2)
                    .attr('y',height - y(value)+textTopMargin)
                    .style("text-anchor", "middle")
                    .text(value);
                }

                function drawTip(value,label,clazz){

                    var w = 40;
                    var h = 20;
                    var format = d3.format('%');

                    var triangleMap = d3.svg.line()
                    .x(function(d){
                        return d.x;
                    })
                    .y(function(d){
                        return d.y;
                    });

                    var triangle = [
                    {x:barWidth+w/4,y:height - y(value)-h/4},
                    {x:barWidth+w/4,y:height - y(value)+h/4},
                    {x:barWidth+w/4-5,y:height - y(value)}
                    ];

                    var tip = canvas.append('g').attr('class', clazz);

                    tip.append('path')
                    .attr("d", triangleMap(triangle));

                    tip.append('rect')
                    .attr('width', w)
                    .attr('height', h)
                    .attr('x', barWidth+w/4)
                    .attr('y', height - y(value)-h/2);

                    tip.append('text')
                    .attr('x', barWidth+w/4+w/2)
                    .attr('y', height - y(value)+3)
                    .style("text-anchor", "middle")
                    .text(format(label));
                }

                function drawLine(value){
                    canvas.append("line")
                    .attr('class','line')
                    .attr("x1", 0)
                    .attr("x2", barWidth)
                    .attr("y1", height - y(value))
                    .attr("y2", height - y(value))
                    .attr('stroke','#fff');
                }
            }
        }
    });
}(angular));