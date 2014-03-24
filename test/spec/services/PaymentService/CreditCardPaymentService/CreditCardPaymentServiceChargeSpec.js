'use strict';

describe('Service: CreditCardPaymentServiceChargeSpec', function() {

    var CreditCardPaymentService = null;
    var PaymentService = null;
    var Misplacedservice = null;
    var $rootScope = null;
    var $q = null;
    var log = null;
    var logger = null;

    beforeEach(function() {
        log = {};
        log.fatal = jasmine.createSpy('$log.fatal');

        logger = {};
        logger.getLogger = jasmine.createSpy('logger.getLogger').andReturn({
            info : function() {
            },
            fatal : function() {
            }
        });
    });

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.payment.creditcard.service');

        module(function($provide) {
            $provide.value('Misplacedservice', Misplacedservice);
            $provide.value('PaymentService', PaymentService);
            $provide.value('$log', log);
            $provide.value('logger', logger);
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
            var creditCard = null;
            var amount = null;
            var installments = null;

            beforeEach(function() {
                creditCard = {
                    stub : 'i\'m a stub'
                };
                amount = 150;
                installments = 1;

                CreditCardPaymentService.createCreditCardPayments = jasmine.createSpy('CreditCardPaymentService.createCreditCardPayments');
            });

            it('should charge a credit card', function() {
                var result = null;
                var isGoPay = true;
                var hasInternet = true;
                var sendChargesReturn = {
                    stub : 'i\'m a stub return'
                };

                CreditCardPaymentService.createCreditCardPayments =
                        jasmine.createSpy('CreditCardPaymentService.createCreditCardPayments').andReturn(true);
                CreditCardPaymentService.sendCharges = jasmine.createSpy('CreditCardPaymentService.sendCharges').andCallFake(function() {
                    var deferred = $q.defer();
                    setTimeout(function() {
                        deferred.resolve(sendChargesReturn);
                    }, 0);
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
                    expect(CreditCardPaymentService.createCreditCardPayments).toHaveBeenCalledWith(
                            creditCard, amount, installments, sendChargesReturn);
                });
            });

            it('shouldn\'t charge a credit card with rejected promise', function() {
                var result = null;
                var isGoPay = true;
                var hasInternet = true;
                var errMsg = 'err text msg';

                CreditCardPaymentService.sendCharges = jasmine.createSpy('CreditCardPaymentService.sendCharges').andCallFake(function() {
                    var deferred = $q.defer();
                    setTimeout(function() {
                        deferred.reject(errMsg);
                    }, 0);
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
                    expect(angular.isObject(result)).toBe(false);
                    expect(result).toEqual(errMsg);
                    expect(CreditCardPaymentService.sendCharges).toHaveBeenCalledWith({
                        creditCard : creditCard,
                        amount : amount,
                        installments : installments
                    });
                    expect(CreditCardPaymentService.createCreditCardPayments).not.toHaveBeenCalled();
                });
            });

            it('shouldn\'t charge a credit card with an exception in sendCharges', function() {
                var result = null;
                var isGoPay = true;
                var hasInternet = true;

                CreditCardPaymentService.sendCharges = jasmine.createSpy('CreditCardPaymentService.sendCharges').andCallFake(function() {
                    throw 'I\'m an unexpected exception';
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
                    expect(angular.isObject(result)).toBe(false);
                    expect(result).toEqual('Erro interno na aplicação. Por favor, contate o administrador do sistema.');
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
