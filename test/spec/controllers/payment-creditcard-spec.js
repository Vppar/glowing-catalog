'use strict';

describe('Controller: PaymentCreditCardCtrl', function() {

    var scope = {};
    var element = {};
    var ps = {};
    var dp = {};
    var os = {};

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

    beforeEach(inject(function($controller, $rootScope, _$filter_) {
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
            flags : ['','','','','','','MasterCard']
        };

        // scope mock
        scope = $rootScope.$new();
        scope.creditCardForm = {};

        scope.totals = {
          payments : {
            remaining : 100
          }
        };

        scope.selectPaymentMethod = jasmine.createSpy('$scope.selectPaymentMethod');
        scope.getAmount = jasmine.createSpy('$scope.getAmount');
        element.find = jasmine.createSpy('$element.find').andReturn({find:function(){
            return {
                removeClass : function(){
                    return {addClass: function(){}};
                }
            };
        }});

        $controller('PaymentCreditCardCtrl', {
            $scope : scope,
            $filter : _$filter_,
            $element : element,
            DataProvider : dp,
            OrderService : os,
            PaymentService : ps
        });
        
    }));

    it('should add a credit card payment', function() {
        scope.creditCardForm.$valid = true;

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
        expect(ps.add).toHaveBeenCalled();
        expect(ps.add.calls.length).toEqual(1);
    });

    it('shouldn\'t add a credit card payment with invalid form', function() {
        scope.creditCardForm.$valid = false;
        scope.confirmCreditCardPayment();
        expect(ps.add).not.toHaveBeenCalled();
    });

    describe('initial amount value', function() {
        it('is the remaining value', inject(function($controller, $rootScope, _$filter_) {
            scope.totals.payments.remaining = 170;

            $controller('PaymentCreditCardCtrl', {
                $scope : scope,
                $filter : _$filter_,
                $element : element,
                DataProvider : dp,
                OrderService : os,
                PaymentService : ps
            });

            expect(scope.creditCard.amount).toBe(170);
        }));

        it('is 0 if there\'s no remaining value', inject(function($controller, $rootScope, _$filter_) {
            scope.totals.payments.remaining = 0;

            $controller('PaymentCreditCardCtrl', {
                $scope : scope,
                $filter : _$filter_,
                $element : element,
                DataProvider : dp,
                OrderService : os,
                PaymentService : ps
            });

            expect(scope.creditCard.amount).toBe(0);
        }));
    });
});
