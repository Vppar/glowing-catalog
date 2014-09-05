(function (angular) {
    'use strict';

    angular.module('tnt.catalog.goalposter.ctrl', [
        'tnt.catalog.user',
        'tnt.utils.fileinput',
        'tnt.catalog.goalposter.service'
    ]).controller(
        'GoalPosterCtrl',
        [
            '$scope',
            'UserService',
            'DialogService',
            'GoalPosterService',
            function ($scope, UserService, DialogService, GoalPosterService) {

                UserService.redirectIfInvalidUser();

                var imagesSize = GoalPosterService.getImagesSize();

                $scope.consultant = GoalPosterService.getConsultant();
                $scope.goalImages = GoalPosterService.getImages();
                $scope.alerts = GoalPosterService.getAlerts();
                $scope.messageOfDay = GoalPosterService.getMessageOfDay();

                $scope.goalImageUpload = function (id) {
                    var data = imagesSize[id];
                    data.myImage = $scope.goalImages[id];
                    DialogService.openImageUploadDialog(data)
                        .then(function (base64Image) {
                            if (base64Image) {
                                $scope.goalImages[id] = base64Image;
                                GoalPosterService.setImage(id, base64Image);
                            }
                        });
                };
            }]);
})
(angular);
