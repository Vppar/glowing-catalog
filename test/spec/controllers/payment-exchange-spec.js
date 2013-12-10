'use strict';

describe('Controller: PaymentExchangeCtrl', function() {

    var scope = {};
    var element = {};
    var dp = {};
    var ps = {};

    // load the controller's module
    beforeEach(function() {
        module('tnt.catalog.payment.exchange');
        module('tnt.catalog.filter.findBy');
    });

    beforeEach(inject(function($controller, $rootScope, _$filter_) {
        // scope mock
        scope = $rootScope.$new();
        scope.exchangeForm = {
            $valid : true
        };
        scope.findPaymentTypeByDescription = function(value) {
            return 3;
        };
        scope.payments = angular.copy(sampleData.payments);

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

        // data provider mock
        dp.payments = angular.copy(sampleData.payments);
        dp.cardData = angular.copy(sampleData.cardData);
        dp.products = angular.copy(sampleData.products);

        // payment service mock
        ps.createNew = jasmine.createSpy('PaymentService.createNew').andCallFake(function(type) {
            var payment = {};
            ps.payments.push(payment);
            return payment;
        });

        // reproduce the scope inheritance
        ps.payments = angular.copy(sampleData.payments);
        scope.payments = ps.payments;

        $controller('PaymentExchangeCtrl', {
            $scope : scope,
            $filter : _$filter_,
            $element : element,
            DataProvider : dp,
            PaymentService : ps
        });
    }));

    /**
     * Given - a exchange.product And - an exchange.amount And - addExchange
     * function receive scope.exchange as parameter And - scope.exchangeForm is
     * valid When - the add payment button is clicked Then - call the createNew
     * to have an instance of payment And - copy the exchange data to this
     * instance And - clear the current exchange payment
     */
    it('should add an exchange payment', function() {
        // given
        scope.exchange = angular.copy(sampleData.payment.exchange.data);
        scope.exchange.amount = sampleData.payment.exchange.amount;
        var exchange = angular.copy(scope.exchange);
        delete exchange.amount;
        var paymentsSize = scope.payments.length;

        // when
        scope.addExchange(scope.exchange);

        // then
        expect(ps.createNew).toHaveBeenCalledWith('exchange');
        expect(scope.payments.length).toBe(paymentsSize + 1);
        expect(scope.payments[paymentsSize].data).toEqual(exchange);
    });

    /**
     * Given - a invalid exchangeForm When - the add payment button is clicked
     * Then - do not add to payments in PaymentService And - keep the current
     * exchange payment
     */
    it('shouldn\'t add an exchange payment with invalid form', function() {
        scope.exchange = angular.copy(sampleData.payment.exchange.data);
        var exchange = angular.copy(scope.exchange);
        var paymentsSize = scope.payments.length;
        scope.exchangeForm.$valid = false;

        scope.addExchange(scope.exchange);

        expect(scope.payments.length).toBe(paymentsSize);
        expect(scope.exchange).toEqual(exchange);

    });

    /**
     * Given - that the payment is passed to the remove function When - the
     * remove payment button is clicked Then - remove payment in the second
     * position from the list
     */
    it('should remove an exchange payment', function() {
        var payment = scope.payments[1];
        var paymentsSize = scope.payments.length;

        scope.removeExchange(payment);

        expect(scope.payments[1]).not.toEqual(payment);
        expect(scope.payments.length).toBe(paymentsSize - 1);
    });

});
