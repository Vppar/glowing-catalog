(function(angular) {
    'use strict';

    var templateUrl = 'components/d3-histogram/histogram.html';

    angular.module('glowingCatalogApp').run(['$http', '$templateCache', function($http, $templateCache) {
        $http.get(templateUrl, {
            cache : $templateCache
        });
    }]);

    angular.module('tnt.chart.components.histogram', []).directive('histogram', function() {
        return {
            restrict : 'E',
            templateUrl : templateUrl,
            replace: true,
            scope : {
                values : '=values'
            },
            link: function (scope, element, attrs) {
                var width = 800; 
                var height = 200;
                var bottomMargin = 35;
                var leftMargin = 40;
                var topMargin = 20;

                var bands = null;
                var qty = null;
                var barWidth = null;
                var chartWidth = null;
                var chartHeight = null;
                var max = null;
                var x = null;
                var y = null;
                var goals = null;
                var snapshots = null;
                var byOrder = null;

                var canvas = d3.select(element[0]).append('svg');


                function clear() {
                    canvas.selectAll('*').remove();
                }


                function setValues() {
                    bands = scope.values.bands;
                    qty = bands.length;
                    barWidth = (width/qty)-(width/(qty*2));
                    chartWidth = width-leftMargin;
                    chartHeight = height-(topMargin+bottomMargin);
                    max = d3.max(bands,function(d){ return d.goal >= d.snapshot ? d.goal : d.snapshot; });
                    x = d3.scale.ordinal().domain(bands.map(function(d){ return d.order;})).rangeRoundBands([leftMargin,width],0);
                    y = d3.scale.linear().domain([max,0]).range([0,chartHeight]);
                    goals = bands.map(function(d){ return d.goal;});
                    snapshots = bands.map(function(d){ return d.snapshot;});
                    byOrder = d3.nest().key(function(d){ return 'o'+d.order; }).map(bands,d3.map);
                }


                function draw() {
                    clear();
                    setValues();

                    canvas
                        .attr('width', width)
                        .attr('height', height);

                    drawXAxis();
                    drawYAxis();
                    drawGuide(2);
                    drawBars(goals,'#5892ce');
                    drawLine('#ab147a',snapshots);
                }


                function drawGuide(order){
                    var guide = canvas.append("line")
                        .attr('class','guide')
                        .attr("x1", x(order)+x.rangeBand()/2)
                        .attr("x2", x(order)+x.rangeBand()/2)
                        .attr("y1", function(d){ return 0;})
                        .attr("y2", function(d){ return chartHeight+topMargin;});

                }

                function drawBars(values,color){

                    var g = canvas.append('g')
                        .attr("transform", "translate(0,"+topMargin+")");

                    var bars = g.selectAll('.bar')
                        .data(values)
                        .enter();

                    bars.append('rect')
                        .attr('x', function(d,i){  return ((i) * x.rangeBand()) + (x.rangeBand()/2) + leftMargin - (barWidth/2);   })
                        .attr('y', function(d){ return y(d); })
                        .attr('width', barWidth)
                        .attr('height', function(d){ return chartHeight-y(d); })
                        .attr('fill', color );

                    return bars;
                }


                function drawLine(color,points){
                    var lineMap = d3.svg.line()
                        .x(function(d,i) { 
                           return ((i) * x.rangeBand()) + leftMargin + x.rangeBand()/2; 
                       })
                        .y(function(d) { 
                            return y(d);
                        });

                    var line = canvas.append('path')
                        .attr("d", lineMap(points))
                        .attr('stroke',color)
                        .attr('fill','none')
                        .attr('stroke-linejoin','round')
                        .attr('stroke-width','2px')
                        .attr("transform", "translate(0,"+topMargin+")");
                }


                function drawYAxis(){
                    var qtyTicks = 5;

                    var yAxis = d3.svg.axis()
                        .scale(y)
                        .ticks(qtyTicks)
                        .orient('left');

                    var axisY = canvas.append("g")
                        .attr('class','axis-y')
                        .attr("transform", "translate("+leftMargin+","+topMargin+")")
                        .call(yAxis);

                    axisY.selectAll("line.y")
                        .data(y.ticks(qtyTicks))
                        .enter().append("line")
                        .attr('class','guide')
                        .attr("x1", 0)
                        .attr("x2", leftMargin + chartWidth)
                        .attr("y1", function(d){ return y(d);})
                        .attr("y2", function(d){ return y(d);});
                }


                function drawXAxis(){
                    var xAxis = d3.svg.axis().scale(x).orient("bottom").tickFormat(function(d){ 
                        return byOrder.get('o'+d)[0].label;
                    });

                    canvas.append("g")
                        .attr('class','axis-x')
                        .attr("transform", "translate(0,"+(chartHeight+topMargin)+")")
                        .call(xAxis);   
                }


                scope.$watchCollection('values', draw);
            }
        }
    });
}(angular));
