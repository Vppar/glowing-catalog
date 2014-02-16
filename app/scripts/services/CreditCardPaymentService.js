(function(angular) {

    'use strict';
    angular.module('tnt.catalog.payment.creditcard.service', [
        'tnt.catalog.payment.service', 'tnt.catalog.payment.entity', 'tnt.catalog.gopay.integration', 'tnt.catalog.misplaced.service'
    ]).service(
            'CreditCardPaymentService',
            function CreditcardPaymentService($q, $log, PaymentService, CreditCardPayment, Misplacedservice) {

                var errMsgs = {
                    0 : 'Falha no processamento da transação',
                    1 : 'Pagamento recusado pela operadora do cartão'
                };

                /**
                 * Calls the credit card company and send the charges to a
                 * credit card.
                 */
                this.sendCharges = function sendCharges(data) {
                    // TODO - Implement the real deal, you should call go pay
                    // service or something like that.
                    var deferred = $q.defer();
                    deferred.resolve(true);
                    return deferred.promise;
                };

                /**
                 * Create credit card payments to fulfill the customer order.
                 * 
                 * @param CreditCard - The credit card information.
                 * @param amount - Charged amount.
                 * @param numInstallments - Number of installments.
                 */
                this.createCreditCardPayments =
                        function createCreditCardPayments(creditCard, amount, numInstallments) {

                            var creditCardInstallments = [];

                            for ( var i = 0; i < numInstallments; i++) {
                                var cc = angular.copy(creditCard);
                                cc.amount = 0;
                                cc.installment = i + 1;
                                creditCardInstallments.push(cc);
                            }

                            Misplacedservice.recalc(creditCard.amount, -1, creditCardInstallments, 'amount');

                            var dueDate = new Date();
                            var creditCardDueDate = creditCard.expirationMonth + '-' + creditCard.expirationYear;

                            for ( var ix in creditCardInstallments) {
                                var creditCardInstallment = creditCardInstallments[ix];
                                // FIXME - Fix duedate and installment
                                var payment =
                                        new CreditCardPayment(
                                                creditCardInstallment.amount, creditCardInstallment.flag, creditCardInstallment.number,
                                                creditCardInstallment.cardholderName, creditCardDueDate, creditCard.cvv,
                                                creditCard.cardholderDocument, creditCardInstallment.installment, dueDate.getTime());

                                PaymentService.add(payment);
                            }
                        };
                
                /**
                 * Creates the credit card payment to feed the PaymentService,
                 * and try to send the charge the credit card company
                 * 
                 * @param CreditCard - The credit card information.
                 * @param amount - Charged amount.
                 * @param numInstallments - Number of installments.
                 */
                this.charge = function charge(creditCard, amount, numInstallments) {
                    var recordedPayment = null;
                    try {
                        var chargedCCPromise = this.sendCharges({
                            creditCard : creditCard,
                            amount : amount,
                            installments : numInstallments
                        });
                        
                        var createCreditCardPayments = this.createCreditCardPayments;
                        
                        recordedPayment = chargedCCPromise.then(function() {
                            createCreditCardPayments(creditCard, amount, numInstallments);
                            return true;
                        }, function(errCod) {
                            var errMsg = errMsgs[errCod];
                            return $q.reject(errMsg);
                        });
                    } catch (err) {
                        $log.fatal('CreditcardPaymentService.charge', err);
                        recordedPayment = $q.reject('Erro interno na aplicação. Contate o administrador');
                    }

                    return recordedPayment;
                };
            });

}(angular));