'use strict';

describe('Controller: PaymentCreditCardCtrl', function() {

    var scope = {};
    var element = {};
    var ps = {};
    var dp = {};
    var ds = {};
    var os = {};
    var is ={};
    var ccps = {};

    os.order = {
        code : '123456789'
    };

    dp.cardData = {};

    dp.internet = true;
    dp.gopay = {};
    dp.gopay.merchant = '4';
    dp.date = {};

    // load the controller's module
    beforeEach(function() {
        module('tnt.catalog.payment.creditcard');
        module('tnt.catalog.filter.findBy');
    });

    beforeEach(inject(function($controller, $rootScope, _$filter_, _$q_) {
        // element mock
        element.find = function(name) {
            var element = {
                removeClass : function(name) {
                    return this;
                },
                addClass : function(name) {
                    return this;
                }
            };
            return element;
        };

        // PaymentService mock
        ps.add = jasmine.createSpy('PaymentService.add');

        // DataProvider stub
        dp.cardData = {
            flags : [
                '', '', '', '', '', '', 'MasterCard'
            ]
        };
        dp.reloadGoPay= jasmine.createSpy('DataProvider.reloadGoPay');

        is.putBundle = jasmine.createSpy('IntentService.putBundle');
        is.getBundle = jasmine.createSpy('IntentService.getBundle');

        ds.messageDialog = jasmine.createSpy('DialogService.messageDialog');
        ccps.charge = jasmine.createSpy('CreditCardPaymentService.charge').andCallFake(function() {
            var deferred = _$q_.defer();
            deferred.resolve();
            return deferred.promise;
        });

        // scope mock
        scope = $rootScope.$new();
        scope.creditCardForm = {};

        scope.total = {};

        scope.selectPaymentMethod = jasmine.createSpy('$scope.selectPaymentMethod');
        scope.getAmount = jasmine.createSpy('$scope.getAmount');
        element.find = jasmine.createSpy('$element.find').andReturn({
            find : function() {
                return {
                    removeClass : function() {
                        return {
                            addClass : function() {
                            }
                        };
                    }
                };
            }
        });

        $controller('PaymentCreditCardCtrl', {
            $scope : scope,
            $filter : _$filter_,
            $element : element,
            DialogService : ds,
            DataProvider : dp,
            OrderService : os,
            CreditCardPaymentService : ccps,
            IntentService : is
        });

    }));

    it('should add a credit card payment', function() {
        scope.creditCardForm.$valid = true;
        scope.envFlags = {internet : true};
        
        scope.creditCard = {
            installment : '2x',
            flag : 'Visa',
            amount : 120.00,
            expirationMonth : '03',
            expirationYear : '2014',
            number : '1111111111111111',
            cvv : '123',
            cardholderName : 'Foo Bar',
            cardholderDocument : '11111111111'
        };

        scope.confirmCreditCardPayment();
        expect(ccps.charge).toHaveBeenCalled();
    });

    it('shouldn\'t add a credit card payment with invalid form', function() {
        scope.creditCardForm.$valid = false;
        scope.confirmCreditCardPayment();
        expect(ps.add).not.toHaveBeenCalled();
    });

    describe('initial amount value', function() {
        it('is 0 if change is positive', inject(function($controller, $rootScope, _$filter_) {
            scope.total.change = 170;

            $controller('PaymentCreditCardCtrl', {
                $scope : scope,
                $filter : _$filter_,
                $element : element,
                DialogService : ds,
                DataProvider : dp,
                OrderService : os,
                CreditCardPaymentService : ccps,
                IntentService : is
            });

            expect(scope.creditCard.amount).toBe(0);
        }));

        it('is the absolute value of change if change is negative', inject(function($controller, $rootScope, _$filter_) {
            scope.total.change = -170;

            $controller('PaymentCreditCardCtrl', {
                $scope : scope,
                $filter : _$filter_,
                $element : element,
                DialogService : ds,
                DataProvider : dp,
                OrderService : os,
                CreditCardPaymentService : ccps,
                IntentService : is
            });

            expect(scope.creditCard.amount).toBe(170);
        }));

        it('is 0 if change is falsy', inject(function($controller, $rootScope, _$filter_) {
            scope.total.change = null;

            $controller('PaymentCreditCardCtrl', {
                $scope : scope,
                $filter : _$filter_,
                $element : element,
                DialogService : ds,
                DataProvider : dp,
                OrderService : os,
                CreditCardPaymentService : ccps,
                IntentService : is
            });

            expect(scope.creditCard.amount).toBe(0);
        }));
    });
});
