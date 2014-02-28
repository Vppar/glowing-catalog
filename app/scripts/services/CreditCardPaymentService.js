(function(angular) {

    'use strict';
    angular.module(
            'tnt.catalog.payment.creditcard.service',
            [
                'tnt.catalog.payment.service', 'tnt.catalog.payment.entity', 'tnt.catalog.gopay.integration',
                'tnt.catalog.misplaced.service', 'tnt.catalog.gopay.gateway'
            ]).service(
            'CreditCardPaymentService',
            function CreditcardPaymentService($q, $log, $filter, GoPayGateway, PaymentService, CreditCardPayment, Misplacedservice) {

                var acceptedCardFlags = {
                    'American Express' : 'AMERICANEXPRESS',
                    'Diners Club' : 'DINERS',
                    'MasterCard' : 'MASTERCARD',
                    'Visa' : 'VISA'
                };
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
                 * Calls the credit card company and send the charges to a
                 * credit card.
                 */
                this.sendCharges = function sendCharges(data) {

                    var codedFlag = acceptedCardFlags[data.creditCard.flag];
                    var maskedCpf = $filter('cpf')(data.creditCard.cardholderDocument);

                    var year = String(data.creditCard.expirationYear).substring(2);
                    var month = data.creditCard.expirationMonth > 9 ? '' : '0';
                    month += data.creditCard.expirationMonth;
                    var validity = month + '/' + year;

                    var card = {
                        flag : codedFlag,
                        number : data.creditCard.number,
                        holder : data.creditCard.cardholderName,
                        validity : validity,
                        cvv : data.creditCard.cvv,
                        amount : data.amount,
                        installments : data.installments,
                        cpf : maskedCpf,
                        description : 'Pedido MK no valor de ' + $filter('currency')(data.amount, '') + ' reais'
                    };

                    $log.debug(card);

                    var payedPromise = GoPayGateway.pay(card).then(function(data) {
                        return data;
                    }, function(err) {
                        // first of all, log err message
                        $log.error('CreditcardPaymentService.sendCharges', err);

                        var errMsg = '';
                        if (angular.isObject(err)) {
                            if (err.Status && String(err.Status).indexOf('-') < 0) {
                                errMsg = errMsgs.conn;
                            } else {
                                errMsg = errMsgs[err.Status];
                            }
                        } else {
                            errMsg = errMsgs.fatal;
                        }
                        return $q.reject(errMsg);
                    });

                    return payedPromise;
                };

                /**
                 * Create credit card payments to fulfill the customer order.
                 * 
                 * @param CreditCard - The credit card information.
                 * @param amount - Charged amount.
                 * @param numInstallments - Number of installments.
                 */
                this.createCreditCardPayments =
                        function createCreditCardPayments(creditCard, amount, numInstallments, gopayInfo) {

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
                                // FIXME - Fix duedate and installment
                                var payment =
                                        new CreditCardPayment(
                                                creditCardInstallment.amount, creditCardInstallment.flag, creditCardInstallment.number,
                                                creditCardInstallment.cardholderName, creditCardDueDate, creditCard.cvv,
                                                creditCard.cardholderDocument, creditCardInstallment.installment, dueDate.getTime());
                                payment.gopayInfo = gopayInfo;

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
                this.charge = function charge(creditCard, amount, numInstallments, isGoPay) {
                    var recordedPayment = null;
                    try {
                        var chargedCCPromise = null;
                        if (isGoPay) {
                            chargedCCPromise = this.sendCharges({
                                creditCard : creditCard,
                                amount : amount,
                                installments : numInstallments,
                            });
                        } else {
                            var deferred = $q.defer();
                            deferred.resolve();
                            chargedCCPromise = deferred.promise;
                        }

                        var createCreditCardPayments = this.createCreditCardPayments;

                        recordedPayment = chargedCCPromise.then(function(result) {
                            createCreditCardPayments(creditCard, amount, numInstallments, result);
                            return true;
                        }, function(errMsg) {
                            return $q.reject(errMsg);
                        });
                    } catch (err) {
                        $log.fatal('CreditcardPaymentService.charge', err);
                        recordedPayment = $q.reject(errMsgs.fatal);
                    }

                    return recordedPayment;
                };
            });

}(angular));