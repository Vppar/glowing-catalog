(function (angular) {
    'use strict';

    angular.module('tnt.catalog.payment.creditcard', [
        'tnt.catalog.service.dialog', 'tnt.catalog.service.data', 'tnt.catalog.payment.creditcard.service', 'tnt.catalog.entity.service'
    ])
        .controller(
        'PaymentCreditCardCtrl',
        [
            '$parse',
            '$scope',
            '$element',
            '$filter',
            '$q',
            '$location',
            'DataProvider',
            'DialogService',
            'OrderService',
            'CreditCardPaymentService',
            'EntityService',
            'IntentService',
            function ($parse, $scope, $element, $filter, $q, $location, DataProvider, DialogService, OrderService, CreditCardPaymentService, EntityService, IntentService) {

                // #############################################################
                // Warm up the controller
                // #############################################################

                //set default as partial
                $scope.formType = 'partial';
                function getAmount(change) {
                    return !change || change > 0 ? 0 : -change;
                }

                var customer = null;
                var hasToken = false;
                function verifyPPToken(){
                    var token = localStorage.ppToken;
                    if(token === 'null'){
                        $scope.formType = 'partial';
                    }else{
                        hasToken = true;
                        $scope.formType = 'full';
                    }
                }
                
                verifyPPToken();
                
                function documentCheck() {
                    customer = EntityService.read(OrderService.order.customerId);
                    if (customer && !customer.document && hasToken) {
                        var promise = DialogService.messageDialog({
                            title: 'Atenção.',
                            message: 'Para processar transações de Cartão de Crédito é necessário o CPF do cliente. Deseja preencher agora?',
                            btnYes: 'Sim',
                            btnNo: 'Não'
                        });

                        promise.then(function () {
                            IntentService.putBundle({editUuid: customer.uuid, screen: 'payment', method: 'creditcard'});
                            $location.path('/add-customer');
                        }, function () {
                            $scope.selectPaymentMethod('none');
                        });
                    }
                }

                // Initializing credit card data with a empty credit
                // card
                var creditCard = {};
                var emptyCreditCardTemplate = {
                    installment: '1 x',
                    flag: null,
                    amount: getAmount($scope.total.change),
                    orginalRemaingAmount : getAmount($scope.total.change),
                    expirationMonth: null,
                    expirationYear: null,
                    number: null,
                    cvv: null,
                    cardholderName: null,
                    // cardholder's CPF
                    cardholderDocument: null
                };

                angular.extend(creditCard, emptyCreditCardTemplate);
                $scope.creditCard = creditCard;

                // Credit card informations to fill the screen
                // combos.
                $scope.cardFlags = DataProvider.cardData.flags;
                // select MasterCard
                $scope.creditCard.flag = DataProvider.cardData.flags[6];
                $scope.installments = DataProvider.cardData.installments;

                $scope.months = DataProvider.date.months;

                $scope.select2Options = {
                    minimumResultsForSearch: -1
                };

                $scope.creditCardMask = '';
                $scope.creditCardCvvLength = 3;

                function resetCardNumberAndCvv() {
                    $scope.creditCard.number = null;
                    $scope.creditCard.cvv = null;
                }

                $scope.checkCreditCardFlagChange = function (cardFlag) {
                    // Changing from any flag/no flag to American
                    // Express
                    if (cardFlag === 'American Express') {
                        $scope.creditCardMask = 'amex';
                        $scope.creditCardCvvLength = 4;
                        resetCardNumberAndCvv();

                        // Changing from American Express to other
                        // flag
                    } else if ($scope.creditCardMask === 'amex') {
                        $scope.creditCardMask = '';
                        $scope.creditCardCvvLength = 3;
                        resetCardNumberAndCvv();
                    }
                    // Changing from a non-Amex flag to another, do
                    // nothing
                };

                // Creates an array containing year options for
                // credit card
                // expiration
                // dates
                var currYear = new Date().getFullYear();
                var cardMaxExpirationYear = currYear + 10;
                var cardExpirationYears = [];

                while (currYear < cardMaxExpirationYear) {
                    cardExpirationYears.push(currYear++);
                }

                var nextMonth = new Date().getMonth() + 1;
                creditCard.expirationMonth = (String(nextMonth).length > 1 ? '' : '0') + nextMonth;
                creditCard.expirationYear = new Date().getFullYear();
                $scope.cardExpirationYears = cardExpirationYears;

                $scope.$watch('creditCard.expirationYear', function () {
                    if (Number(creditCard.expirationYear) === new Date().getFullYear()) {
                        var minMonth = new Date().getMonth() + 1;
                        var months = [];
                        for (var ix in DataProvider.date.months) {
                            if (Number(DataProvider.date.months[ix].id) >= minMonth) {
                                months.push(DataProvider.date.months[ix]);
                            }
                        }
                        $scope.months = months;
                    } else {
                        $scope.months = DataProvider.date.months;
                    }
                });

                // #####################################################################################################
                // Scope action functions
                // #####################################################################################################

                /**
                 *  Numpad
                 */
                $scope.openSingleInputCardDialog = function (ngModel, initialValue, title, currency) {

                    var data = {
                        initial: initialValue,
                        title: title,
                        isCurrencyEnabled: currency
                    };

                    var dialog = DialogService.openDialogNumpad(data).then(function (returnedValue) {

                        console.log(ngModel);
                        console.log(returnedValue);

                        $parse(ngModel).assign($scope, returnedValue);
                    });

                    return dialog;
                };

                $scope.setValue = function (key) {

                    switch(key) {
                        case 'enter':
                            $scope.selectPaymentMethod('step2');
                            break;
                    }
                };

                /**
                 * Confirms a credit card payment.
                 */
                $scope.confirmCreditCardPayment = function confirmCreditCardPayment() {
                    $element.find('form').find('input').removeClass('ng-pristine').addClass('ng-dirty');
                    if (!($scope.creditCardForm.$valid && $scope.creditCard.amount > 0)) {
                        var deferred = $q.defer();
                        deferred.resolve();
                        return deferred.promise;
                    }
                    var numInstallments = Number(creditCard.installment.replace('x', '').replace(' ', ''));

                    //Autorization only used with external payment. Not for pagpop.
                    var autorization = $scope.creditCard.autorization | null;
                    var result = CreditCardPaymentService.charge(customer, creditCard, creditCard.amount, numInstallments, autorization, hasToken);
                    
                    return result.then(function () {
                        var promise = DialogService.messageDialog({
                            title: 'Pagamento',
                            message: 'Pagamento realizado com sucesso.',
                            btnYes: 'OK'
                        });
                        
                        promise.then(function(){
                            // verify if the total amount of payment is
                            // equal the total amount of order if yes
                            // finalize all payments.
                            if (creditCard.orginalRemaingAmount > 0 &&
                                creditCard.amount === creditCard.orginalRemaingAmount) {
                                $scope.confirm(true);
                            }
                        });
                        
                        $scope.selectPaymentMethod('none');
                    }, function (errMsg) {
                        DialogService.messageDialog({
                            title: 'Pagamento',
                            message: errMsg,
                            btnYes: 'OK'
                        });
                    });
                };
                // #####################################################################################################
                // Watcher
                // #####################################################################################################
                $scope.order = OrderService.order;
                $scope.$watch('order.customerId', documentCheck);
            }
        ]);
}(angular));
