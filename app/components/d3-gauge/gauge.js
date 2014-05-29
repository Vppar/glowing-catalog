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
                height : '=height',
                margintop : '=margintop'
            },
            link: function (scope, element, attrs) {
                var goal = null;
                var snapshot = null;
                var hasTip = null;
                var height = null;
                var textTopMargin = null;
                var currentGoal = null;
                var canvas = d3.select(element[0]).append('svg');
                var y = null;

                var barWidth = 60;
                var topMargin = 15;
                

                function clear() {
                  canvas.selectAll('*').remove();
                }


                function setValues() {
                    goal = scope.values.goal;
                    snapshot = scope.values.snapshot;
                    currentGoal = scope.values.currentGoal;
                    hasTip = scope.tip;
                    height = scope.height;
                    textTopMargin = scope.margintop;
                }

                function draw() {
                    clear();
                    setValues();

                    canvas
                      .attr('class','gauge-canvas')
                      .attr('height', height+20)
                      .style('width',124);

                    var cap = goal;
                    
                    //var cap = goal > snapshot ? goal : snapshot;
                    if(currentGoal > cap){ 
                        cap = currentGoal; 
                    }
                    if(snapshot > cap){ 
                        cap = snapshot; 
                    }

                    //order by size
                    var orderRender = [goal,currentGoal,snapshot];
                    orderRender.sort();
                    
                    var varCssMap = {};
                    varCssMap[goal] = 'goal';
                    varCssMap[currentGoal] = 'goal';
                    varCssMap[snapshot] = 'snapshot';


                    //scale based on goal value;
                    y = d3.scale.linear().domain([cap,0]).range([height-topMargin, 0]);

                    for(var i = (orderRender.length-1);i>(-1);i--){

                        if(i === 0 && varCssMap[currentGoal] === 'goal'){
                            drawBarNoFill(orderRender[i],varCssMap[orderRender[i]]);
                        }else{
                            drawBar(orderRender[i],varCssMap[orderRender[i]]);
                        }
                        drawLine(orderRender[i]);
                    }

                    //draw tips
                    drawTip(goal, 1, 'goal-tip');
                    drawTip(currentGoal, currentGoal/goal, 'goal-tip');
                    drawTip(snapshot, snapshot/goal, 'snapshot-tip');
                }

                function drawBar(value,clazz){
                    var bar = canvas.append('g').attr('class',clazz);

                    var rect = bar.append('rect')
                        .attr('x', 0 )
                        .attr('y', height - y(value))
                        .attr('width', barWidth)
                        .attr('height', y(value))
                        .attr('fill');

                    var text = bar.append('text')
                        .attr('x', barWidth/2)
                        .attr('y', -12+height - y(value) + textTopMargin)
                        .style("text-anchor", "middle")
                        .text(value);
                }

                function drawBarNoFill(value,clazz){
                    var bar = canvas.append('g').attr('class',clazz);

                    // var rect = bar.append('rect')
                    //     .attr('x', 0 )
                    //     .attr('y', height - y(value))
                    //     .attr('width', barWidth)
                    //     .attr('height', y(value))
                    //     .attr('fill');

                    var text = bar.append('text')
                        .attr('x', barWidth/2)
                        .attr('y', -12+height - y(value) + textTopMargin)
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

                    tip.append("line")
                    .attr("x1", barWidth+w/4)
                    .attr("x2", barWidth+w/4+w)
                    .attr("y1", height - y(value)-(h/2))
                    .attr("y2", height - y(value)-(h/2))
                    .attr('stroke','#fff');
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

                scope.$watchCollection('values', draw);
            }
        }
    });
}(angular));
