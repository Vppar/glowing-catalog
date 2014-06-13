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
                var topMargin = 30;

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

                var goalValues = null;
                var snapshotValues = null;

                function clear() {
                    canvas.selectAll('*').remove();
                }


                function setValues() {
                    values = scope.values;
                    bands = scope.values.bands;
                    
                    //set max value to zero
                    max = 0;

                    //find who has the greatest value (goal or snapsgot)
                    for(var i = 0;i<bands.length;i++){
                        if( (max < bands[i].goal) && (bands[i].goal) ) max = bands[i].goal;
                        if( (max < bands[i].snapshot) && (bands[i].snapshot) ) max = bands[i].snapshot;
                    }
      
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

                    var lastBand = bands[goals.length-1];
                    var band = bands[currentBand-1];
                    var posyGoal = 0;
                    var posySnap = 0;
                    var posyFinal = 0;
                    var posxFinal = 0;
                    var valueSnap = 0;
                    var valueGoal = 0;
                    var valueGoalFinal = 0;
                    
                    var posx = (x(currentBand)+x.rangeBand()/2);
                    if(!posx) posx = 0;
                    
                    if(lastBand){
                        posxFinal = (x(goals.length)+x.rangeBand()/2);
                        posyFinal = y(lastBand.goal)+topMargin;
                        valueGoalFinal = lastBand.goal;
                    }
                    if(band){
                        posySnap = y(band.snapshot)+topMargin;
                        posyGoal = y(band.goal)+topMargin;
                        valueSnap = band.snapshot;
                        valueGoal = band.goal;
                        
                    }
                    drawLine('#5892ce',goals);
                    drawLine('#ab147a',snapshots);                  
                   
                    drawTip(posx,posyGoal-10,valueGoal,'goal-tip');

                    drawTip(posx,posySnap-10,valueSnap, 'snapshot-tip');

                    drawTip(posxFinal,posyFinal-10,valueGoalFinal, 'goal-tip');

                   
                }

                function drawTip(x,y,label,clazz){
                    var w = 36;
                    var h = 20;
                    var triangleSize = w/4;
                    var format = d3.format('');

                    var triangleMap = d3.svg.line()
                    .x(function(d){
                        return d.x;
                    })
                    .y(function(d){
                        return d.y;
                    });

                    var triangle = [
                    {x:0,y:0},
                    {x:triangleSize/2,y:-triangleSize/2},
                    {x:-triangleSize/2,y:-triangleSize/2}
                    ];

                    var tip = canvas.append('g').attr('class', clazz)
                    .attr("transform", "translate("+x+","+(y+(h/4))+")");

                    tip.append('path')
                    .attr("d", triangleMap(triangle));

                    tip.append('rect')
                    .attr('width', w)
                    .attr('height', h)
                    .attr('x', -(w/2))
                    .attr('y', -(h+triangleSize/2)+1);

                    tip.append('text')
                    .attr('x', 0)
                    .attr('y', -w/4)
                    .style("text-anchor", "middle")
                    .text(format(label));
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
                            //return ((i) * x.rangeBand()) + leftMargin + x.rangeBand()/2; 
                            return (x(i+1)+x.rangeBand()/2);
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
