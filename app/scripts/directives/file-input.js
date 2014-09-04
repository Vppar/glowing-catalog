(function (angular) {
    'use strict';
    angular.module('tnt.catalog.directives.fileInput', []).directive('fileInput', ['$parse', '$timeout', function fileInput($parse, $timeout) {
        return {
            restrict: 'EA',
            template: '<input type=\'file\' class=\'invisible\'/>',
            replace: true,
            link: function (scope, element, attrs) {

                var modelGet = $parse(attrs.fileInput);
                var modelSet = modelGet.assign;
                var onChange = $parse(attrs.onChange);

                var updateModel = function (evt) {
                    var file = evt.currentTarget.files[0];
                    var reader = new FileReader();
                    reader.onload = function (evt) {
                        scope.$apply(function ($scope) {
                            modelSet(scope, evt.target.result);
                            onChange(scope);
                        });
                    };
                    reader.readAsDataURL(file);
                };

                element.bind('change', updateModel);

                scope.$on('selectImage', function () {
                    $timeout(function () {
                        angular.element(element).trigger('click');
                    }, 0);
                });
            }
        };
    }]);
})(angular);
