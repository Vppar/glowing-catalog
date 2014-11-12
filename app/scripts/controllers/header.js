(function(angular) {
    'use strict';

    angular.module('tnt.catalog.header', ['tnt.catalog.manifest', 'tnt.catalog.service.intent', 'tnt.catalog.config', 'tnt.catalog.consultant.service']).controller(
            'HeaderCtrl',
            ['$scope', '$element', '$filter', '$location', '$interval', 'OrderService', 'DialogService', 'UserService', 'CacheController', 'IntentService', 'SubscriptionService', 'CatalogConfig', 'ConsultantService',
            function($scope, $element, $filter, $location, $interval, OrderService, DialogService, UserService, CacheController, IntentService, SubscriptionService, CatalogConfig, ConsultantService) {

                // #############################################################################################################
                // Scope variables from services
                // #############################################################################################################
                /**
                 * Expose basket in the scope.
                 */
                var order = OrderService.order;
                $scope.order = order;

                $scope.update = false;
                $scope.hasToken = false;

                // FIXME: is it really safe to remove this? (see
                // $scope.checkout())
                function inBasketFilter(item) {
                    return Boolean(item.qty);
                }

                function hasPPToken() {
                    var token = localStorage.ppToken;
                    if(token === 'null'){
                        $scope.hasToken =  false;
                    } else {
                        $scope.hasToken =  true;
                    }
                }

                hasPPToken();

                // #############################################################################################################
                // Dialogs control
                // #############################################################################################################
                /**
                 * Opens the dialog to card configuration.
                 */
                $scope.openDialogCardConfig = DialogService.openDialogCardConfig;
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
                /**
                 * Opens the dialog to subscribe.
                 */
                $scope.openDialogSubscribeNow = function openDialogSubscribeNow() {
                    var lastSubscription = SubscriptionService.getLastSubscription();
                    if( lastSubscription && lastSubscription.planType ){
                        if( lastSubscription.planType === CatalogConfig.GLOSS ){
                            DialogService.openDialogSubscriptionLastPlanGloss();
                        }
                        else if( lastSubscription.planType === CatalogConfig.BLUSH ){
                            DialogService.openDialogSubscriptionLastPlanBlush();
                        }
                        else if( lastSubscription.planType === CatalogConfig.RIMEL ){
                            DialogService.openDialogSubscriptionLastPlanRimel();
                        }
                        else {
                            DialogService.openDialogSubscriptionLastPlanNullByMenu();
                        }
                    } else {
                        DialogService.openDialogSubscriptionLastPlanNullByMenu();
                    }
                };

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
                        $element.find('img.loading-icon').css('visibility', 'hidden');
                        if(status==="UPDATEREADY"){
                            $scope.update=true;
                            CacheController.userConfirmationPopUp();
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

                $scope.openAboutDialog = function () {

                    var message = [];

                    try {
                        var consultant = ConsultantService.get();
                        console.log(consultant);
                        var splitName = consultant.name.split(' ');
                        consultant.firstAndLastName = splitName[0] + ' ' + splitName[splitName.length - 1];
                        message.push('<b>Licenciado para ' + consultant.firstAndLastName + '</b>');
                        message.push('Licença pessoal válida até ' + $filter('date')(consultant.subscriptionExpirationDate, 'dd/MM/yyyy'));
                    } catch(e){
                        console.log('No Consultant!');
                    }
                    var dialog = {
                        title: 'VPink versão ' + CatalogConfig.version,
                        message: message.join('<BR/>'),
                        btnYes: 'Ok'
                    };
                    DialogService.messageDialog(dialog);
                };
            }]);
})(angular);
