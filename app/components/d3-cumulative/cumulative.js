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
               var values = scope.values;

               //get the values that should be displayed
               var bands = scope.values.bands;


               var width = 800; 
               var height = 200;

               var leftMargin = 40;
               var bottomMargin = 40;
               var topMargin = 10;

               //get the max value of goals (this is needed to make the chart y scale) 
               var max = d3.max(bands, function(d){ return d.goal});

               //calcs the real chart width
               var chartWidth = width-leftMargin;

               //calcs the real chart height
               var chartHeight = height-(topMargin+bottomMargin);

               //creates the x scale for the chart. its an ordinal scale!   
               var x = d3.scale.ordinal().domain(bands.map(function(d){ return d.order;})).rangeRoundBands([leftMargin,width],0);
               
               //creates the x scale for the chart. this is a linear scale!
               var y = d3.scale.linear().domain([max,0]).range([0,chartHeight]);

               //creates the canvas tha will hold all
               var canvas = d3.select('body').selectAll('div.cumulative').append('svg')
               .attr('width', width)
               .attr('height', height);

             //this is the right way!!
             var goals = bands.map(function(d){ return d.goal;}).filter(Number);
             var snapshots = bands.map(function(d){ return d.snapshot;}).filter(Number);

             var byOrder = d3.nest().key(function(d){ return 'o'+d.order;}).map(bands,d3.map);


             drawXAxis();
             drawYAxis();
             drawGuide(2);
             drawLine('#5892ce',goals);
             drawLine('#ab147a',snapshots);

             function drawXAxis(){
                var xAxis = d3.svg.axis().scale(x).orient("bottom").tickFormat(function(d){ return byOrder.get('o'+d)[0].label; });

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

                var yAxis =
                d3.svg.axis()
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

            

        }
    }
});
}(angular));