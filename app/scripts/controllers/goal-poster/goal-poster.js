(function (angular) {
    'use strict';

    angular.module('tnt.catalog.goalposter.ctrl', [
        'tnt.utils.fileinput',
        'tnt.catalog.goalposter.service'
    ]).controller(
        'GoalPosterCtrl',
        [
            '$scope',
            'DialogService',
            'GoalPosterService',
            function ($scope, DialogService, GoalPosterService) {

                var imagesSize = GoalPosterService.getImagesSize();

                $scope.goalImages = GoalPosterService.getImages();
                $scope.goalImageUpload = function (id) {
                    var data = imagesSize[id];
                    data.myImage = $scope.goalImages[id];
                    DialogService.openImageUploadDialog(data)
                        .then(function (base64Image) {
                            $scope.goalImages[id] = base64Image;
                            GoalPosterService.setGoalImage(id, base64Image);
                        });
                };
            }])
    ;
})
(angular);
