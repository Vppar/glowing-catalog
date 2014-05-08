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

                // var values = scope.values;

                // var width = 800; 
                // var height = 200;

                // var leftMargin = 40;
                // var bottomMargin = 40;
                // var barWidth = 80;
                
                // console.log(values);

                // var chartWidth = width-leftMargin;
                // var chartHeight = height-(topMargin+bottomMargin);

                // var x = d3.scale.ordinal().domain(values.map(function(d){ return d.order;})).rangeRoundBands([leftMargin,width],0);
                // var y = d3.scale.linear().domain([max,0]).range([0,chartHeight]);

                // var obj = {};
                // obj.values = values.map(function(d){ return d.value;}).filter(Number);
                // obj.goals = values.map(function(d){ return d.goal;}).filter(Number);


                // var valuesCumulative = makeCumulative(obj.values);
                // var goalCumulative = makeCumulative(obj.goals);


                // drawXAxis();
                // drawYAxis();

                // function drawYAxis(){

                //     var qty = 6;

                //     var yAxis =
                //     d3.svg.axis()
                //     .scale(y)
                //     .ticks(qty)
                //     .orient('left');

                //     var axisY = canvas.append("g")
                //     .attr('class','axis-y')
                //     .attr("transform", "translate("+leftMargin+","+topMargin+")")
                //     .call(yAxis);

                //     axisY.selectAll("line.y")
                //     .data(y.ticks(qty))
                //     .enter().append("line")
                //     .attr('class','guide')
                //     .attr("x1", 0)
                //     .attr("x2", leftMargin + chartWidth)
                //     .attr("y1", function(d){ return y(d);})
                //     .attr("y2", function(d){ return y(d);});
                // }       

                // function drawXAxis(){
                //     var xAxis = d3.svg.axis().scale(x).orient("bottom").tickFormat(function(d){ return valuesByOrder.get('o'+d)[0].name});

                //     canvas.append("g")
                //     .attr('class','axis-x')
                //     .attr("transform", "translate(0,"+(chartHeight+topMargin)+")")
                //     .call(xAxis);

                // }


                // function makeCumulative(entry){
                //     var values = [];
                //     var last = 0;
                //     for(var i = 0;i<entry.length;i++){
                //         last = last + entry[i];
                //         values.push(last);
                //     }
                //     return values;
                // }
                
                
            }
        }
    });
}(angular));