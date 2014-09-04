(function (angular) {
    'use strict'

    angular.module('tnt.catalog.goalposter.service', []).service('GoalPosterService', ['$q', 'SyncDriver', 'ConsultantService', function ($q, SyncDriver, ConsultantService) {

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

        this.getConsultant = function () {
            return ConsultantService.get();
        }

        this.getImagesSize = function () {
            return angular.copy(goalImageSizes);
        }

        this.getImages = function () {
            var user = localStorage.getItem('user');
            var consultantImage = localStorage.getItem(user + ':0');
            var goalImage1 = localStorage.getItem(user + ':1');
            var goalImage2 = localStorage.getItem(user + ':2');
            var goalImage3 = localStorage.getItem(user + ':3');
            var goalImage4 = localStorage.getItem(user + ':4');
            return [consultantImage, goalImage1, goalImage2, goalImage3, goalImage4];
        }

        this.setGoalImage = function (id, base64Image) {
            // set in localStorage
            localStorage.setItem(user + ':' + id, base64Image);
        }
    }]);

})(angular);
