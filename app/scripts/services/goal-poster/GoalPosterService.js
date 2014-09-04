(function (angular) {
    'use strict'
    angular.module('tnt.catalog.goalposter.service', []).service('GoalPosterService', ['$q', function ($q) {

        var goalImageSizes = [{
            areaType: 'square',
            size: 50
        }, {
            areaType: 'circle',
            size: 220
        }, {
            areaType: 'circle',
            size: 250
        }, {
            areaType: 'circle',
            size: 250
        }, {
            areaType: 'circle',
            size: 220
        }]

        this.getImagesSize = function(){
            return angular.copy(goalImageSizes);
        }

        this.getImages = function () {
            return [];
        }

        this.setGoalImage = function (id, base64Image) {
        }
    }]);

})(angular);
