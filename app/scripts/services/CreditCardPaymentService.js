(function(angular) {

    'use strict';
    angular.module('tnt.catalog.payment.creditcard.service', [
        'tnt.catalog.payment.service', 'tnt.catalog.payment.entity', 'tnt.catalog.misplaced.service', 'tnt.catalog.pagpop.gateway'
    ])
            .service(
                    'CreditCardPaymentService',
                    [
                        '$q',
                        '$log',
                        '$filter',
                        'PagPopGateway',
                        'PaymentService',
                        'CreditCardPayment',
                        'NoMerchantCreditCardPayment',
                        'Misplacedservice',
                        function CreditcardPaymentService($q, $log, $filter, PagPopGateway, PaymentService, CreditCardPayment,
                                NoMerchantCreditCardPayment, Misplacedservice) {

                            var _this = this;

                            var errMsgs =
                                    {
                                        '-1' : 'Tentativa de transação como o mesmo cartão de crédito e '
                                            + 'o mesmo valor mais de uma vez, em um período menor que 5 minutos.',
                                        '-2' : 'Transação não autorizada pela instituição financeira.',
                                        '-3' : 'Dados do cartão de crédito incorretos.',
                                        'conn' : 'Ocorreu um erro na tentativa de conexão com o servidor. '
                                            + 'Verifique sua conexão com a internet e tente novamente mais tarde.',
                                        'fatal' : 'Erro interno na aplicação. Por favor, contate o administrador do sistema.'
                                    };

                            /**
                             * Calls the credit card company and send the
                             * charges to a credit card.
                             */
                            this.sendCharges = function sendCharges(data) {
                                var card = {
                                    installments : Number(data.installments),
                                    amount : Number(data.amount),
                                    number : String(data.creditCard.number),
                                    month : String(Number(data.creditCard.expirationMonth)),
                                    year : String(data.creditCard.expirationYear),
                                    cvv : String(data.creditCard.cvv),
                                    orderId : "0000-00-00",
                                    customer : String(data.customer.name)
                                };

                                var payedPromise = PagPopGateway.pay(card).then(function(result) {
                                    return result;
                                }, function(err) {
                                    // first of all, log err message
                                    $log.error('CreditcardPaymentService.sendCharges', err);

                                    var errMsg = '';
                                    if (angular.isObject(err)) {
                                        errMsg = errMsgs[err.status];
                                    } else {
                                        errMsg = errMsgs.fatal;
                                    }
                                    return $q.reject(errMsg);
                                });

                                return payedPromise;
                            };

                            /**
                             * Create credit card payments to fulfill the
                             * customer order.
                             * 
                             * @param CreditCard - The credit card information.
                             * @param amount - Charged amount.
                             * @param numInstallments - Number of installments.
                             */
                            this.createCreditCardPayments =
                                    function createCreditCardPayments(customer, creditCard, amount, numInstallments, gatewayInfo) {
                                        var result = null;
                                        try {
                                            var creditCardInstallments = [];

                                            // remove confidential info
                                            delete creditCard.cvv;
                                            if (creditCard.number) {
                                                creditCard.number = creditCard.number.slice(-4);
                                            }

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
                                                // FIXME - Fix duedate and
                                                // installment
                                                var payment =
                                                        new CreditCardPayment(
                                                                creditCardInstallment.amount, creditCardInstallment.flag,
                                                                creditCardInstallment.number, customer.name, creditCardDueDate,
                                                                creditCard.cardholderDocument, creditCardInstallment.installment, dueDate
                                                                        .getTime());
                                                payment.gatewayInfo = gatewayInfo;
                                                PaymentService.add(payment);
                                            }
                                            result = true;
                                        } catch (err) {
                                            $log.fatal('CreditcardPaymentService.charge', err);
                                            result = $q.reject(errMsgs.fatal);
                                        }
                                        return result;
                                    };

                            /**
                             * Creates the credit card payment to feed the
                             * PaymentService, and try to send the charge the
                             * credit card company
                             * 
                             * @param CreditCard - The credit card information.
                             * @param amount - Charged amount.
                             * @param numInstallments - Number of installments.
                             */
                            this.charge =
                                    function charge(customer, creditCard, amount, numInstallments) {
                                        var recordedPayment = null;
                                        try {
                                            var creditCardCopy = angular.copy(creditCard);
                                            var chargedCCPromise = this.sendCharges({
                                                customer : customer,
                                                creditCard : creditCardCopy,
                                                amount : amount,
                                                installments : numInstallments,
                                            });
                                            recordedPayment =
                                                    chargedCCPromise.then(function(gatewayInfo) {
                                                        return _this.createCreditCardPayments(
                                                                customer, creditCardCopy, amount, numInstallments, gatewayInfo);
                                                    }, function(errMsg) {
                                                        return $q.reject(errMsg);
                                                    });
                                        } catch (err) {
                                            $log.fatal('CreditcardPaymentService.charge', err);
                                            recordedPayment = $q.reject(errMsgs.fatal);
                                        }

                                        return recordedPayment;
                                    };
                        }
                    ]);
}(angular));
