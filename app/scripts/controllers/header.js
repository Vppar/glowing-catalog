(function(angular) {
    'use strict';

    angular.module('tnt.catalog.header', ['tnt.catalog.manifest', 'tnt.catalog.service.intent']).controller(
            'HeaderCtrl',
            ['$scope', '$element', '$filter', '$location', '$interval', 'OrderService', 'DialogService', 'UserService', 'CacheController', 'IntentService',
            function($scope, $element, $filter, $location, $interval, OrderService, DialogService, UserService, CacheController, IntentService) {

                // #############################################################################################################
                // Scope variables from services
                // #############################################################################################################
                /**
                 * Expose basket in the scope.
                 */
                var order = OrderService.order;
                $scope.order = order;

                $scope.update = false;

                // FIXME: is it really safe to remove this? (see
                // $scope.checkout())
                function inBasketFilter(item) {
                    return Boolean(item.qty);
                }

                // #############################################################################################################
                // Dialogs control
                // #############################################################################################################
                /**
                 * Opens the dialog to change the password.
                 */
                $scope.openDialogChangePass = DialogService.openDialogChangePass;
                /**
                 * Opens the dialog to choose a customer.
                 */
                $scope.openDialogChooseCustomer = DialogService.openDialogChooseCustomer;
                /**
                 * Opens the dialog to input a product.
                 */
                $scope.openDialogInputProducts = DialogService.openDialogInputProducts;

                $scope.now = {};

                // #############################################################################################################
                // Flow control functions
                // #############################################################################################################
                /**
                 * Redirect to payment if products and customer were selected.
                 */
                $scope.checkout = function(bypassBasket) {
                    var basket = $filter('filter')(order.items, inBasketFilter);
                    if ((basket && basket.length > 0) || bypassBasket) {
                        if (order.customerId) {
                            $location.path('/payment');
                        } else {
                            IntentService.putBundle({screen:'payment'});
                            DialogService.openDialogChooseCustomer().then(function(id) {
                                order.customerId = id;
                            });
                        }
                    } else {
                        DialogService.messageDialog({
                            title : 'Pagamento',
                            message : 'Nenhum produto selecionado.',
                            btnYes : 'OK'
                        });
                    }
                };

                function refreshDate() {
                    $scope.now.date = $filter('date')(new Date(), 'dd MMM yyyy');
                    $scope.now.time = $filter('date')(new Date(), 'HH:mm');
                }
                $interval(refreshDate, 10000);
                refreshDate();

                $scope.logout = function() {
                    return UserService.logout().then(function() {
                        $location.path('/login');
                    }, function() {
                        $location.path('/login');
                    });
                };
                
                $scope.preventClose = function(event) { event.stopPropagation(); };
                
                // #############################################################################################################
                // Manifest related stuff
                // #############################################################################################################
                
                function addCacheUpdateListeners(){
                    CacheController.getPromise().then(function(status){
//                        $scope.update=true;
                        $element.find('img.loading-icon').css('visibility', 'hidden');
                        if(status==="UPDATEREADY"){
                            $scope.update=true;
                            CacheController.popUp();
                        }else{
                            $scope.update=false;
                        }
                    }, function(){
                        $element.find('img.loading-icon').css('visibility', 'hidden');
                        $scope.update=false;
                    });
                }
                addCacheUpdateListeners();

                $scope.forceUpdate = function(){
                        $scope.update=false;
                        location.reload();
                };

                $scope.updateCache = function(){
                    CacheController.checkForUpdates().then(function(){
                        $element.find('img.loading-icon').css('visibility', '');
                        $scope.update=true;
                        addCacheUpdateListeners();
                    });
                };
            }]);
})(angular);
