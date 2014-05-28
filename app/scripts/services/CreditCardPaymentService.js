(function (angular) {

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
            function CreditcardPaymentService($q, $log, $filter, PagPopGateway, PaymentService, CreditCardPayment, NoMerchantCreditCardPayment, Misplacedservice) {

                var _this = this;

                var errMsgs =
                {
                    '-1': 'Tentativa de transação como o mesmo cartão de crédito e o mesmo valor mais de uma vez, em um período menor que 5 minutos.',
                    '-2': 'Transação não autorizada pela instituição financeira.',
                    'minAmount': 'O valor mínimo da parcela deve ser R$ 5,00.',
                    'invalidCard': 'Dados do cartão de crédito incorretos.',
                    'rejected': 'Transação não autorizada.',
                    'conn': 'Ocorreu um erro na tentativa de conexão com o servidor. Verifique sua conexão com a internet e tente novamente mais tarde.',
                    'fatal': 'Erro interno na aplicação. Por favor, contate o administrador do sistema.'
                };

                /**
                 * Calls the credit card company and send the
                 * charges to a credit card.
                 */
                this.sendCharges = function sendCharges(data) {
                    var card = {
                        installments: Number(data.installments),
                        amount: Number(data.amount),
                        number: String(data.creditCard.number),
                        month: String(Number(data.creditCard.expirationMonth)),
                        year: String(data.creditCard.expirationYear),
                        cvv: String(data.creditCard.cvv),
                        orderId: "0000-00-00",
                        customer: String(data.customer.name),
                        cpf: String(data.customer.document)
                    };

                    var payedPromise = PagPopGateway.pay(card).then(function (result) {
                        return result;
                    }, function (err) {
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
                 * @param customer - Customer info.
                 * @param creditCard - The credit card information.
                 * @param amount - Charged amount.
                 * @param numInstallments - Number of installments.
                 * @param gatewayInfo - Info returned by the credit card gateway.
                 */
                this.createCreditCardPayments =
                    function createCreditCardPayments(customer, creditCard, amount, numInstallments, gatewayInfo) {
                        var result = null;
                        try {

                            // remove confidential info
                            delete creditCard.cvv;
                            if(!creditCard.flag){
                                creditCard.flag = flagTranslator3000(creditCard.number);
                            }
                            
                            if (creditCard.number) {
                                creditCard.number = creditCard.number.slice(-4);
                            }

                            creditCard.amount = amount;
                            creditCard.installment = numInstallments;
                            creditCard.dueDate = getDueDate(new Date(), gatewayInfo);
                            creditCard.creditCardDueDate = creditCard.expirationMonth + '-' + creditCard.expirationYear;

                            var payment =
                                new CreditCardPayment(creditCard.amount, creditCard.flag,
                                    creditCard.number, customer.name, creditCard.creditCardDueDate,
                                    creditCard.cardholderDocument, creditCard.installment, creditCard.dueDate.getTime());
                            payment.gatewayInfo = gatewayInfo;
                            PaymentService.add(payment);
                            result = true;
                        } catch (err) {
                            $log.fatal('CreditcardPaymentService.charge', err);
                            result = $q.reject(errMsgs.fatal);
                        }
                        return result;
                    };
                    
                 /**
                  * Return the day of experation date for this CC payment.
                  * This method uses the PagPop policy of payments.
                  */
                 function getDueDate(actualDate, gatewayInfo){
                     
                     if(!gatewayInfo){
                         return actualDate;
                     }
                     
                     var duedate = actualDate;
                     var day = duedate.getDate();
                     if(day > 23 || day <= 3){
                         duedate.setDate(5);
                         if(day > 23){
                             duedate.setMonth(duedate.getMonth() + 1);
                         }
                     }else if(day > 3 && day <= 13){
                         duedate.setDate(15);
                     }else if(day > 13 && day <= 23){
                         duedate.setDate(25);
                     }else{
                         $log.fatal('CreditcardPaymentService.getDueDate', actualDate, ' - invalid date');
                     }
                     return duedate;
                 }
                    
                /**
                 * Creates the credit card payment to feed the
                 * PaymentService, and try to send the charge the
                 * credit card company
                 * @param customer - Customer info.
                 * @param creditCard - The credit card information.
                 * @param amount - Charged amount.
                 * @param numInstallments - Number of installments.
                 * @param isPPPayment - if should send for pagpop.
                 */
                this.charge =
                    function charge(customer, creditCard, amount, numInstallments, isPPPayment) {
                        var recordedPayment = null;
                        try {
                            var creditCardCopy = angular.copy(creditCard);
                            
                            if(isPPPayment){
                                //send charges for PAG POP
                                var chargedCCPromise = this.sendCharges({
                                    customer: customer,
                                    creditCard: creditCardCopy,
                                    amount: amount,
                                    installments: numInstallments
                                });
                                recordedPayment =
                                    chargedCCPromise.then(function (gatewayInfo) {
                                        return _this.createCreditCardPayments(
                                            customer, creditCardCopy, amount, numInstallments, gatewayInfo);
                                    }, function (errMsg) {
                                        return $q.reject(errMsg);
                                    });
                            }else{
                                //do not send charges for pagpop
                                var deferred = $q.defer();
                                deferred.resolve(this.createCreditCardPayments(
                                    customer, creditCardCopy, amount, numInstallments, null));
                                return deferred.promise;
                                
                            }
                            
                        } catch (err) {
                            $log.fatal('CreditcardPaymentService.charge', err);
                            recordedPayment = $q.reject(errMsgs.fatal);
                        }
                        
                        return recordedPayment;
                    };

                function flagTranslator3000(number) {
                    var temp = number.split('');

                    var diners = Number(((temp.splice(0, 6)).join('')));

                    if (diners >= 300000 && diners <= 305999) {
                        return 'Diners';
                    }

                    temp = number.split('');
                    diners = Number(((temp.splice(0, 6)).join('')));

                    if (diners === 384100 || diners === 384140 || diners === 384160 || diners === 606282) {
                        return 'Hipercard';
                    }

                    temp = number.split('');
                    diners = Number(((temp.splice(0, 2)).join('')));

                    if (diners === 36 || diners === 38) {
                        return 'Diners';
                    }

                    if (number[0] === '3') {
                        return 'Amex';
                    }
                    if (number[0] === '4') {
                        return 'Visa';
                    }
                    if (number[0] === '5') {
                        return 'MasterCard';
                    }
                    if (number[0] === '6') {
                        return 'Elo';
                    }
                }

            }
        ]);
})(angular);
