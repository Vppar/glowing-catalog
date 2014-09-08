/**
 * Created by Arnaldo on 03/09/2014.
 */
(function (angular) {
    'use strict';

    angular.module('tnt.utils.imageUpload.ctrl', []).controller('ImageUploadCtrl', ['$scope', '$q', 'dialog', function ($scope, $q, dialog) {


        $scope.crop = {
            myImage: dialog.data.base64Img,
            myCroppedImage: null,
            areaType: dialog.data.areaType,
            size: dialog.data.size
        };

        $scope.selectImage = function () {
            $scope.$broadcast('selectImage');
        };

        $scope.confirm = function () {
            return dialog.close($scope.crop.myCroppedImage);
        };

        $scope.cancel = function () {
            dialog.close($q.reject());
        };
    }]);
})(angular);
