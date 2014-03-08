(function (angular) {
    'use strict';
    angular.module('tnt.catalog.directives.clickDelay', []).directive('tntClickDelay', function () {
        return {
            link : function (scope, element) {
                var start = 0;

                element.bind('touchend', function () {
                    start = new Date().getTime();
                });

                element.bind('click', function () {
                    if(start !== 0){
                        console.log((new Date().getTime()) - start);
                        start = 0;
                    }
                });
            }
        };
    });
}(angular));
