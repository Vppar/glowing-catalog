(function (angular) {
    'use strict';

    angular
        .module('tnt.catalog.service.sms', [
            'tnt.catalog.service.data', 'tnt.catalog.entity.service', 'tnt.catalog.consultant.service'
        ])
        .service(
            'SMSService',
            ['$http', '$q', '$interpolate', 'EntityService', 'ConsultantService',
            function ($http, $q, $interpolate, EntityService, ConsultantService) {

                // ############################################################################################
                // SMS related functions
                // ############################################################################################
                var baseUrl = 'https://vopp.com.br/api/sms/';
                var token = '8f934ur83rhq34r879hncfq9f4yq987nf4dh4fyn98hdmi44dz21x3gdju893d2';
                var method = 'GET';

                var user = ConsultantService.get();
                if (!user) {
                    user = {};
                    user.name = '';
                }

                this.send = function send (to, message) {
                    var url = baseUrl + '?to=' + to;
                    url = url + '&message=' + message;
                    url = url + '&token=' + token;

                    var result = $http({
                        method : method,
                        url : url
                    }).success(function sucessLog (data, status) {
                        console.log('success');
                        console.log(status);
                    }).error(function errLog (data, status) {
                        console.log('error');
                        console.log(status);
                    }).then(function () {
                        return 'SMS enviado.';
                    }, function () {
                        return 'Erro ao enviar SMS.';
                    });
                    return result;
                };

                // ############################################################################################
                // Getters
                // ############################################################################################
                var getPhoneNumber = function (customer) {
                    var to = null;
                    for ( var idx in customer.phones) {
                        var phone = customer.phones[idx];
                        if (phone.number.charAt(2) >= 7) {
                            to = '55' + phone.number;
                            break;
                        }
                    }
                    return to;
                };

                var getYourConsultantGenderRelativePhrase = function (user) {
                    var phrase = null;
                    if (user.gender) {
                        if (user.gender === 'Feminino') {
                            phrase = ', sua consultora';
                        } else {
                            phrase = ', seu consultor';
                        }
                    } else {
                        phrase = 'Sua consultora';
                    }
                    return phrase;
                };

                var getCurrencyFormat = function getCurrencyFormat (amount) {
                    var string = amount + "";
                    if (string.indexOf('.') === -1) {
                        string += ',00';
                    } else {
                        string = string.replace('.', ',');
                    }
                    return string;
                };

                // ############################################################################################
                // Payment functions
                // ############################################################################################
                /**
                 * Payment msgs template.
                 */
                var paymentConfirmationSMS =
                    'Ola {{customerName}}, seu pedido no valor de {{orderAmount}} reais foi confirmado. '
                        + '{{representativeName}}{{yourConsultant}} Mary Kay.';
                var cellMissingAlert =
                    'Não foi possível enviar o SMS, o cliente {{customerName}} não possui um número de celular em seu cadastro.';

                this.sendPaymentConfirmation =
                    function sendPaymentConfirmation (customer, orderAmount) {

                        var to = getPhoneNumber(customer);

                        var smsSent = null;
                        var data = {};

                        // complete data object
                        data.customerName = customer.name;
                        data.orderAmount = getCurrencyFormat(orderAmount);
                        data.representativeName = user.name;
                        data.yourConsultant = getYourConsultantGenderRelativePhrase(user);

                        if (to) {
                            var smsMessage = $interpolate(paymentConfirmationSMS)(data);
                            smsSent = this.send(to, smsMessage);
                        } else {
                            smsSent = $q.reject($interpolate(cellMissingAlert)(data));
                        }
                        return smsSent;
                    };

                /**
                 * Voucher msg template.
                 */
                var voucherConfirmationSMS =
                    'Voce recebeu um Vale Credito no valor de {{voucherAmount}} reais a ser utilizado na sua proxima compra '
                        + 'de produtos MK. {{representativeName}}{{yourConsultant}} Mary Kay.';

                this.sendVoucherConfirmation =
                    function sendVoucherConfirmation (customer, voucherAmount) {

                        var to = getPhoneNumber(customer);

                        var smsSent = null;
                        var data = {};

                        // complete data object
                        data.customerName = customer.name;
                        data.voucherAmount = getCurrencyFormat(voucherAmount);
                        data.representativeName = user.name;
                        data.yourConsultant = getYourConsultantGenderRelativePhrase(user);

                        if (to) {
                            var smsMessage = $interpolate(voucherConfirmationSMS)(data);
                            smsSent = this.send(to, smsMessage);
                        } else {
                            smsSent = $q.reject($interpolate(cellMissingAlert)(data));
                        }
                        return smsSent;
                    };

                /**
                 * Coupons msg template.
                 */
                var singularCouponConfirmationSMS =
                    'Voce recebeu um cupom promocional no valor total de {{couponsAmount}} reais a ser utilizado na compra '
                        + 'de produtos MK. {{representativeName}}{{yourConsultant}} Mary Kay.';
                var pluralCouponConfirmationSMS =
                    'Voce recebeu {{couponsQty}} cupons promocionais no valor total de {{couponsAmount}} reais a serem '
                        + 'utilizados na compra de produtos MK. {{representativeName}}{{yourConsultant}} Mary Kay.';

                this.sendCouponConfirmation =
                    function sendCouponConfirmation (customer, couponsAmount, couponsQty) {

                        var to = getPhoneNumber(customer);

                        var smsSent = null;
                        var data = {};

                        // complete data object
                        data.customerName = customer.name;
                        data.couponsAmount = getCurrencyFormat(couponsAmount);
                        data.couponsQty = couponsQty;
                        data.representativeName = user.name;
                        data.yourConsultant = getYourConsultantGenderRelativePhrase(user);

                        if (to) {
                            var smsMessage = null;
                            if (couponsQty > 1) {
                                smsMessage = $interpolate(pluralCouponConfirmationSMS)(data);
                            } else {
                                smsMessage = $interpolate(singularCouponConfirmationSMS)(data);
                            }
                            smsSent = this.send(to, smsMessage);
                        } else {
                            smsSent = $q.reject($interpolate(cellMissingAlert)(data));
                        }
                        return smsSent;
                    };

                /**
                 * Giftcard msg template.
                 */
                var giftCardConfirmationSMS =
                    'Voce recebeu de {{customerName}} um Vale Presente no valor de {{giftCardAmount}} reais a ser utilizado '
                        + 'na compra de produtos MK. {{representativeName}}{{yourConsultant}} Mary Kay.';

                this.sendGiftCardConfirmation =
                    function sendGiftCardConfirmation (customer, giftCard) {

                        var entity = EntityService.read(giftCard.entity);
                        var to = getPhoneNumber(entity);

                        var smsSent = null;
                        var data = {};

                        // complete data object
                        data.customerName = customer.name;
                        data.giftCardAmount = getCurrencyFormat(giftCard.amount);
                        data.representativeName = user.name;
                        data.yourConsultant = getYourConsultantGenderRelativePhrase(user);

                        if (to) {
                            var smsMessage = $interpolate(giftCardConfirmationSMS)(data);
                            smsSent = this.send(to, smsMessage);
                        } else {
                            smsSent = $q.reject($interpolate(cellMissingAlert)(data));
                        }
                        return smsSent;
                    };

            }]);

}(angular));