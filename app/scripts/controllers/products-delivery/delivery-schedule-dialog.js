(function (angular) {
    'use strict';

    angular.module('tnt.catalog.productsDeliverySchedule', [
        'tnt.catalog.scheduling.service'
    ]).controller(
        'ScheduleDeliveryCtrl',
        [
            '$scope',
            '$q',
            'logger',
            'dialog',
            'SchedulingService',
            function ($scope, $q, logger, dialog, SchedulingService) {
                var log = logger.getLogger('tnt.catalog.productsDeliverySchedule');
                $scope.scheduledDelivery = {
                    orderUUID : dialog.data.orderUUID,
                    date : dialog.data.deliveryDate,
                    items : dialog.data.items,
                    disabled : true
                };
                $scope.schedule = {
                    hour : '0000'
                };
                $scope.cancel = function cancel () {
                    dialog.close($q.reject());
                    return $q.reject('Canceled');
                };

                $scope.confirm =
                    function confirm () {
                        // schedule
                        var schedule = SchedulingService.read($scope.scheduledDelivery.orderUUID);
                        if (schedule) {
                            var promise =
                                SchedulingService.update(
                                    schedule.uuid,
                                    $scope.scheduledDelivery.date,
                                    $scope.scheduledDelivery.items);
                            promise.then(function () {
                                return dialog.close(true);
                            }, function () {
                                console.log('Bad');
                            });
                        } else {
                            var promise =
                                SchedulingService.create(
                                    $scope.scheduledDelivery.orderUUID,
                                    $scope.scheduledDelivery.date,
                                    $scope.scheduledDelivery.items);
                            promise.then(function () {
                                return dialog.close(true);
                            }, function () {
                                console.log('Bad');
                            });
                        }

                    };

                $scope.$watch('schedule.hour', function () {
                    var hour = $scope.schedule.hour;
                    if ($scope.schedule.hour != null) {
                        $scope.scheduledDelivery.date =
                            setTime($scope.scheduledDelivery.date, hour.substring(0, 2), hour
                                .substring(2));
                        $scope.scheduledDelivery.disabled = false;
                    }
                });
                function setTime (date, hour, minutes) {
                    date.setHours(hour);
                    date.setMinutes(minutes);
                    return date;
                }
            }
        ]);
})(angular);