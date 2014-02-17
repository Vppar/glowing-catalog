'use strict';

describe('Service: CreditCardPaymentServiceChargeSpec', function() {

    var CreditCardPaymentService = null;
    var PaymentService = null;
    var Misplacedservice = null;
    var GoPayService = null;
    var $rootScope = null;
    var $q = null;
    var log = null;

    beforeEach(function() {
        log = {};
        log.fatal = jasmine.createSpy('$log.fatal');
    });

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.payment.creditcard.service');

        module(function($provide) {
            $provide.value('Misplacedservice', Misplacedservice);
            $provide.value('PaymentService', PaymentService);
            $provide.value('GoPayService', GoPayService);
            $provide.value('$log', log);
        });
    });

    // instantiate service
    beforeEach(inject(function(_CreditCardPaymentService_, _$q_, _$rootScope_) {
        CreditCardPaymentService = _CreditCardPaymentService_;
        $rootScope = _$rootScope_;
        $q = _$q_;
    }));

    it('should be able to inject', function() {
        expect(!!CreditCardPaymentService).toBe(true);
    });

    describe('PaymentServiceCharge.charge()', function() {

        it('is accessible', function() {
            expect(CreditCardPaymentService.charge).not.toBeUndefined();
        });

        it('is a function', function() {
            expect(typeof CreditCardPaymentService.charge).toBe('function');
        });

        describe('when called with valid paramenters', function() {
            var creditCard = {
                stub : 'i\'m a stub'
            };
            var amount = 150;
            var installments = 1;

            it('should charge a credit card', function() {
                var result = null;
                CreditCardPaymentService.createCreditCardPayments = jasmine.createSpy('CreditCardPaymentService.createCreditCardPayments');
                CreditCardPaymentService.sendCharges = jasmine.createSpy('CreditCardPaymentService.sendCharges').andCallFake(function() {
                    var deferred = $q.defer();
                    deferred.resolve(true);
                    return deferred.promise;
                });

                runs(function() {
                    var chargedPromise = CreditCardPaymentService.charge(creditCard, amount, installments);
                    chargedPromise.then(function(_result_) {
                        result = _result_;
                    });
                });

                waitsFor(function() {
                    $rootScope.$apply();
                    return !!result;
                }, 500);

                runs(function() {
                    expect(result).toBe(true);
                    expect(CreditCardPaymentService.sendCharges).toHaveBeenCalledWith({
                        creditCard : creditCard,
                        amount : amount,
                        installments : installments
                    });
                    expect(CreditCardPaymentService.createCreditCardPayments).toHaveBeenCalledWith(creditCard, amount, installments);
                });
            });

            it('should charge a credit card', function() {
                var result = null;
                CreditCardPaymentService.createCreditCardPayments = jasmine.createSpy('CreditCardPaymentService.createCreditCardPayments');
                CreditCardPaymentService.sendCharges = jasmine.createSpy('CreditCardPaymentService.sendCharges').andCallFake(function() {
                    var deferred = $q.defer();
                    deferred.reject('0');
                    return deferred.promise;
                });

                runs(function() {
                    var chargedPromise = CreditCardPaymentService.charge(creditCard, amount, installments);
                    chargedPromise.then(null, function(_result_) {
                        result = _result_;
                    });
                });

                waitsFor(function() {
                    $rootScope.$apply();
                    return !!result;
                }, 500);

                runs(function() {
                    expect(result).toBe('Falha no processamento da transação');
                    expect(CreditCardPaymentService.sendCharges).toHaveBeenCalledWith({
                        creditCard : creditCard,
                        amount : amount,
                        installments : installments
                    });
                    expect(CreditCardPaymentService.createCreditCardPayments).not.toHaveBeenCalled();
                });
            });

            it('should handle a charge rejection', function() {
                var result = null;
                CreditCardPaymentService.createCreditCardPayments = jasmine.createSpy('CreditCardPaymentService.createCreditCardPayments');
                CreditCardPaymentService.sendCharges = jasmine.createSpy('CreditCardPaymentService.sendCharges').andCallFake(function() {
                    var deferred = $q.defer();
                    deferred.reject('1');
                    return deferred.promise;
                });

                runs(function() {
                    var chargedPromise = CreditCardPaymentService.charge(creditCard, amount, installments);
                    chargedPromise.then(null, function(_result_) {
                        result = _result_;
                    });
                });

                waitsFor(function() {
                    $rootScope.$apply();
                    return !!result;
                }, 500);

                runs(function() {
                    expect(result).toBe('Pagamento recusado pela operadora do cartão');
                    expect(CreditCardPaymentService.sendCharges).toHaveBeenCalledWith({
                        creditCard : creditCard,
                        amount : amount,
                        installments : installments
                    });
                    expect(CreditCardPaymentService.createCreditCardPayments).not.toHaveBeenCalled();
                });
            });
        });
    });
});