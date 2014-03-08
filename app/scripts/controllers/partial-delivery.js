(function(angular) {
    'use strict';

    angular
            .module('glowingCatalogApp')
            .controller(
                    'PartialDeliveryCtrl',
                    ['$scope', '$location', '$filter', '$dialog', '$q', 'DataProvider', 'DialogService', 'SMSService', 'UserService',
                    function($scope, $location, $filter, $dialog, $q, DataProvider, DialogService, SMSService, UserService) {

                        UserService.redirectIfIsNotLoggedIn();
                        
                        var scheduledDefaultMsg =
                                'Ola {{customerName}}, uma entrega referente ao pedido {{order.code}} foi agendada para {{order.date}}. {{representativeName}} seu consultor Mary Kay.';
                        var deliveredDefaultMsg =
                                'Ola {{customerName}}, uma entrega referente ao pedido {{order.code}} foi confirmada. {{representativeName}} seu consultor Mary Kay.';

                        // #############################################################################################################
                        // Scope variables and functions
                        // #############################################################################################################
                        $scope.order = {};
                        $scope.dataProvider = DataProvider;
                        $scope.partialDeliveryAugmenter = function partialDeliveryAugmenter(orderItem) {
                            // Keep all deliveries of this order that has its
                            // status
                            // scheduled
                            var scheduled = $filter('filter')(DataProvider.deliveries, function(delivery) {
                                return (delivery.orderId === $scope.order.id && delivery.status === 'scheduled');
                            });
                            var delivered = $filter('filter')(DataProvider.deliveries, function(delivery) {
                                return (delivery.orderId === $scope.order.id && delivery.status === 'delivered');
                            });

                            var items = {};
                            var scheduledItems = [];
                            var deliveredItems = [];

                            var itemFilter = function itemFilter(item) {
                                return (item.id === orderItem.id);
                            };

                            // Get all delivery items that match to this one
                            for ( var idx in scheduled) {
                                items = $filter('filter')(scheduled[idx].items, itemFilter);
                                scheduledItems = scheduledItems.concat(items);
                            }
                            for (idx in delivered) {
                                items = $filter('filter')(delivered[idx].items, itemFilter);
                                deliveredItems = deliveredItems.concat(items);
                            }

                            orderItem.scheduled = $filter('sum')(scheduledItems, 'qty');
                            orderItem.delivered = $filter('sum')(deliveredItems, 'qty');
                            orderItem.remaining = orderItem.qty - (orderItem.scheduled + orderItem.delivered);
                            return true;
                        };
                        $scope.orderDeliveriesFilter = function orderDeliveriesFilter(delivery) {
                            return Boolean(delivery.orderId === $scope.order.id);
                        };
                        $scope.openDeliveryDetails =
                                function(delivery) {
                                    var remainingItems = $filter('filter')($scope.order.items, function(item) {
                                        return item.remaining > 0;
                                    });
                                    if (remainingItems.length === 0 && !delivery) {
                                        DialogService.messageDialog({
                                            tittle : 'Detalhes da entrega',
                                            message : 'Não há mais items a serem entregues nesse pedido.',
                                            btnYes : 'OK'
                                        });
                                        return;
                                    }
                                    $scope.order.selectedDelivery = delivery;
                                    DialogService.openDialogDeliveryDetails({
                                        order : $scope.order
                                    }).then(function(result) {
                                        if (result) {
                                            return result;
                                        } else {
                                            return $q.reject();
                                        }
                                    }).then(openSMSConfirmationAttempt).then(
                                            function(result) {
                                                var recoveredCustomer = $filter('filter')(DataProvider.customers, function(customer) {
                                                    return customer.id === $scope.order.customerId;
                                                })[0];
                                                var recoverdCustomerFirstName = recoveredCustomer.name.split(' ')[0];

                                                // find a cellphone
                                                var cellphone = null;
                                                var phone = null;
                                                for ( var idx in recoveredCustomer.phones) {
                                                    phone = recoveredCustomer.phones[idx].number;
                                                    if (Number(phone.charAt(2)) >= 7) {
                                                        cellphone = phone;
                                                        break;
                                                    }
                                                }
                                                if (cellphone) {
                                                    var defaultMsg = (result === 'delivered' ? deliveredDefaultMsg : scheduledDefaultMsg);
                                                    var msg =
                                                            defaultMsg.replace('{{customerName}}', recoverdCustomerFirstName).replace(
                                                                    '{{order.code}}', $scope.order.code).replace(
                                                                    '{{order.date}}', $filter('date')(result, 'dd/MM/yyyy HH:mm')).replace(
                                                                    '{{representativeName}}', 'Valtanette');
                                                    return SMSService.sendSMS('55' + phone, msg);
                                                } else {
                                                    return 'Não foi possível enviar o SMS, o cliente ' + recoverdCustomerFirstName +
                                                        ' não possui um número de celular em seu cadastro.';
                                                }
                                            }).then(openResultDialogAttempt);
                                };

                        function openSMSConfirmationAttempt(result) {
                            return DialogService.messageDialog({
                                title : 'Confirmar envio de SMS',
                                message : 'Deseja enviar o SMS de alerta para o cliente?',
                                btnYes : 'Sim',
                                btnNo : 'Não'
                            }).then(function() {
                                return result;
                            });
                        }
                        function openResultDialogAttempt(message) {
                            return DialogService.messageDialog({
                                title : 'Envio de SMS',
                                message : message,
                                btnYes : 'OK',
                            });
                        }

                        /* DIALOG CUSTOMER INFO */
                        $scope.openDialogCustomerInfo = function() {
                            DialogService.openDialogCustomerInfo({
                                customer : $scope.order.customer
                            });
                        };

                        $scope.statusNameAugmenter = function statusNameAugmenter(delivery) {
                            var statusName = '';
                            if (delivery.status === 'scheduled') {
                                statusName = 'Agendado';
                            } else if (delivery.status === 'delivered') {
                                statusName = 'Entregue';
                            }
                            delivery.statusName = statusName;
                            return true;
                        };

                        // #############################################################################################################
                        // Main method, controls the flow of this process.
                        // #############################################################################################################
                        function main() {
                            var search = $location.search();
                            var filteredOrders = $filter('filter')(DataProvider.orders, function(item) {
                                return item.id === Number(search.id);
                            });
                            // "There can be only one!" by Connor MacLeod
                            $scope.order = filteredOrders[0];

                            if($scope.order)  {
                                var filteredCustomers = $filter('filter')(DataProvider.customers, function(item) {
                                    return item.id === $scope.order.customerId;
                                });
                                // "There can be only one!" by Connor MacLeod
                                $scope.order.customer = filteredCustomers[0];
                            }
                        }
                        main();
                    }]);
}(angular));