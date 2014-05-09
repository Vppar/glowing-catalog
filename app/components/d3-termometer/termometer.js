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

                var goal = scope.values.goal;
                var snapshot = scope.values.snapshot;
                var hasTip = scope.tip;
                var height = scope.height;
                var numBands = scope.bands;
                var bands = [];
                var firstColor = scope.firstcolor;
                var lastColor = scope.lastcolor;

                var format = d3.format('%');

                var width = 801;
                var marginleft = 30;
                var marginbottom = 20;

                var chart = d3.select(element[0]);

                for(var i = 0;i<numBands;i++){
                    bands.push(i+1);
                }

                var color = d3.scale.linear().domain([bands[0],bands[bands.length-1]]).range([firstColor,lastColor]);
                var x = d3.scale.linear().domain([0,goal]).range([marginleft ,width - marginleft]);

                chart.append("div").attr("class", "termometer-canvas")
                .style('padding-top',(height+8)+'px')
                .style('margin-bottom',marginbottom+'px')
                .style('width',width - marginleft+'px')
                .selectAll('div')
                .data(bands).enter()
                .append("div")
                .attr('class','band')  
                .style('float','left')
                .style('height',height)
                .style('background-color',function (d,i) { return color(d); })
                .style("width", function(d) { return (100/numBands) + "%"; })

                var label = snapshot/goal;

                tooltip(x(snapshot), format(label),'#333');
                function tooltip(value, label, color){

                    var h = 20;
                    var w = 40;

                    var canvas = chart.append('svg')
                    .attr('class','tooltip-canvas')
                    .style('position','absolute')
                    .style('top','0px')
                    .style('left', value+'px')
                    .attr('width', w)
                    .attr('height', h+h/4);

                    var triangleMap = d3.svg.line()
                    .x(function(d){
                        return d.x;
                    })
                    .y(function(d){
                        return d.y;
                    });

                    var triangle = [
                        {x:w/2-h/4,y:h},
                        {x:w/2+h/4,y:h},
                        {x:w/2,y:h+h/4}
                    ];

                    canvas.append('path')
                    .attr("d", triangleMap(triangle))
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
                    .style("text-anchor", "middle")
                    .text(label);



                }
                
            }
        }
    });
}(angular));