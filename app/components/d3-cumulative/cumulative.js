(function(angular) {
    'use strict';

    var templateUrl = 'components/d3-cumulative/cumulative.html';

    angular.module('glowingCatalogApp').run(['$http', '$templateCache', function($http, $templateCache) {
        $http.get(templateUrl, {
            cache : $templateCache
        });
    }]);

    angular.module('tnt.chart.components.cumulative', []).directive('cumulative', function() {
        return {
            restrict : 'E',
            templateUrl : templateUrl,
            replace: true,
            scope : {
                values : '=values'
            },
            link: function (scope, element, attrs) {
                //get the json with data
                var values = null;

                //get the values that should be displayed
                var bands = null;

                var currentBand = null;

                var width = 800; 
                var height = 200;

                var leftMargin = 45;
                var bottomMargin = 40;
                var topMargin = 10;

                //get the max value of goals (this is needed to make the chart y scale) 
                var max = null;

                //calcs the real chart width
                var chartWidth = null;

                //calcs the real chart height
                var chartHeight = null;

                //creates the x scale for the chart. its an ordinal scale!   
                var x = null;
                 
                //creates the x scale for the chart. this is a linear scale!
                var y = null;

                //creates the canvas tha will hold all
                var canvas = d3.select(element[0]).append('svg');

                var goals = null;
                var snapshots = null;
                var byOrder = null;

                function clear() {
                    canvas.selectAll('*').remove();
                }


                function setValues() {
                    values = scope.values;
                    bands = scope.values.bands;
                    max = d3.max(bands, function(d){ return d.goal >= d.snapshot ? d.goal : d.snapshot; });
                    chartWidth = width-leftMargin;
                    chartHeight = height-(topMargin+bottomMargin);
                    x = d3.scale.ordinal().domain(bands.map(function(d){ return d.order;})).rangeRoundBands([leftMargin,width],0);
                    y = d3.scale.linear().domain([max,0]).range([0,chartHeight]);
                    goals = bands.map(function(d){ return d.goal;}).filter(Number);
                    snapshots = bands.map(function(d){ return d.snapshot;}).filter(Number);
                    byOrder = d3.nest().key(function(d){ return 'o'+d.order;}).map(bands,d3.map);

                    var values = scope.values;
                    var validBandIndex = angular.isNumber(values.current) &&
                            values.current >= 0 &&
                            !!bands[values.current];

                    currentBand = validBandIndex ? values.current + 1 : null;
                }


                function draw() {
                    clear();
                    setValues();

                    canvas
                        .attr('width', width)
                        .attr('height', height);
                        
                    drawXAxis();
                    drawYAxis();

                    if (currentBand) {
                        drawGuide(currentBand);
                    }

                    drawLine('#5892ce',goals);
                    drawLine('#ab147a',snapshots);
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


                function drawGuide(order){
                    var guide = canvas.append("line")
                        .attr('class','guide')
                        .attr("x1", x(order)+x.rangeBand()/2)
                        .attr("x2", x(order)+x.rangeBand()/2)
                        .attr("y1", function(d){ return 0;})
                        .attr("y2", function(d){ return chartHeight+topMargin;});
                }


                function drawLine(color,points){
                    var lineMap = d3.svg.line()
                        .x(function(d,i) { 
                            return ((i) * x.rangeBand()) + leftMargin + x.rangeBand()/2; 
                        })
                        .y(function(d) { 
                            return y(d);
                        })

                    var line = canvas.append('path')
                        .attr("d", lineMap(points))
                        .attr('stroke',color)
                        .attr('fill','none')
                        .attr('stroke-linejoin','round')
                        .attr('stroke-width','2px')
                        .attr("transform", "translate(0,"+topMargin+")");
                }


                function drawYAxis(){
                    var qty = 6;
                    var yAxis = d3.svg.axis()
                        .scale(y)
                        .ticks(qty)
                        .orient('left');

                    var axisY = canvas.append("g")
                        .attr('class','axis-y')
                        .attr("transform", "translate("+leftMargin+","+topMargin+")")
                        .call(yAxis);

                    axisY.selectAll("line.y")
                        .data(y.ticks(qty))
                        .enter().append("line")
                        .attr('class','guide')
                        .attr("x1", 0)
                        .attr("x2", leftMargin + chartWidth)
                        .attr("y1", function(d){ return y(d);})
                        .attr("y2", function(d){ return y(d);});
                }       


                scope.$watchCollection('values', draw);
          }
      }
});
}(angular));
