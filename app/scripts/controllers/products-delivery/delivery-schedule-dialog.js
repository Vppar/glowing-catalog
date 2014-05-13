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
                    orderUUID: dialog.data.orderUUID,
                    date: dialog.data.deliveryDate,
                    items: dialog.data.items,
                    disabled: true
                };

                $scope.minDate = new Date();
                $scope.minDate.setDate($scope.minDate.getDate() + 1);

                $scope.cancel = function cancel() {
                    dialog.close($q.reject());
                    return $q.reject('Canceled');
                };

                $scope.confirm =
                    function confirm() {
                        // schedule
                        var schedule = SchedulingService.readByDocument($scope.scheduledDelivery.orderUUID);
                        if (schedule) {
                            var promise =
                                SchedulingService.update(
                                    schedule.uuid,
                                    $scope.scheduledDelivery.date,
                                    $scope.scheduledDelivery.items,
                                    true);
                            promise.then(function () {
                                return dialog.close(true);
                            }, function (err) {
                                log.error(
                                    'Failed to create the scheduling!',
                                    $scope.scheduledDelivery.orderUUID,
                                    $scope.scheduledDelivery.date,
                                    $scope.scheduledDelivery.items);
                                log.debug(err);
                            });
                        } else {
                            var promise =
                                SchedulingService.create(
                                    $scope.scheduledDelivery.orderUUID,
                                    $scope.scheduledDelivery.date,
                                    $scope.scheduledDelivery.items,
                                    true);
                            promise.then(function () {
                                return dialog.close(true);
                            }, function (err) {
                                log.error(
                                    'Failed to create the scheduling!',
                                    $scope.scheduledDelivery.orderUUID,
                                    $scope.scheduledDelivery.date,
                                    $scope.scheduledDelivery.items);
                                log.debug(err);
                            });
                        }

                    };
//
//                function zeroFill(target) {
//                    var result = target;
//                    if (target.length < 2) {
//                        result = '0' + target;
//                    } else if (target.length > 2) {
//                        result = target.slice(1,3);
//                    }
//                    return result;
//                }
            }
        ]);
})(angular);