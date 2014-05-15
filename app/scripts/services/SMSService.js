(function (angular) {
    'use strict';

    angular
        .module(
            'tnt.catalog.service.sms',
            [
                'tnt.catalog.service.data',
                'tnt.catalog.entity.service',
                'tnt.catalog.consultant.service',
                'tnt.catalog.filter.phone'
            ])
        .service(
            'SMSService',
            [
                '$http',
                '$q',
                '$interpolate',
                '$filter',
                'logger',
                'EntityService',
                'ConsultantService',
                function ($http, $q, $interpolate, $filter, logger, EntityService,
                    ConsultantService) {

                    var log = logger.getLogger('tnt.catalog.service.sms');

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
                            var logData = {
                                to : to,
                                message : message,
                                status : status,
                                result : data
                            };
                            log.info('SMS sent:', logData);
                        }).error(function errLog (data, status) {
                            var logData = {
                                to : to,
                                message : message,
                                status : status,
                                result : data
                            };
                            log.fatal('SMS error', logData);
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

                    var getRepresentativePhoneNumber = function (user) {
                        return $filter('phone')(user.cellphone);
                    };

                    this.getRepresentativePhoneNumber = getRepresentativePhoneNumber

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

                    function useOnlyFirstName (data) {
                        var newData = {};
                        for ( var ix in data) {
                            var prop = data[ix];
                            if (ix.indexOf('Name') > -1 && data[ix]) {
                                prop = data[ix].split(' ')[0];
                            }
                            newData[ix] = prop;
                        }
                        return newData;
                    }

                    function evaluateSMSMessage (baseMsg, data, smsMessage) {
                        if (smsMessage.length > 160) {
                            data = useOnlyFirstName(data);
                            smsMessage = $interpolate(baseMsg)(data);
                            if (smsMessage.length > 160) {
                                log.fatal('Unable to send SMS, the message is too big', smsMessage);
                            }
                        }
                        return smsMessage;
                    }
                    /**
                     * Payment msgs template.
                     */
                    var paymentConfirmationSMS =
                        'Ola {{customerName}}, seu pedido no valor de {{orderAmount}} reais foi confirmado. '
                            + '{{representativeName}} {{representativetPhone}}.';
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
                            data.representativetPhone = getRepresentativePhoneNumber(user);

                            if (to) {
                                var smsMessage = $interpolate(paymentConfirmationSMS)(data);
                                smsMessage =
                                    evaluateSMSMessage(paymentConfirmationSMS, data, smsMessage);
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
                            + 'de produtos. {{representativeName}} {{representativetPhone}}.';

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
                            data.representativetPhone = getRepresentativePhoneNumber(user);

                            if (to) {
                                var smsMessage = $interpolate(voucherConfirmationSMS)(data);
                                smsMessage =
                                    evaluateSMSMessage(voucherConfirmationSMS, data, smsMessage);
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
                            + 'de produtos. {{representativeName}} {{representativetPhone}}.';
                    var pluralCouponConfirmationSMS =
                        'Voce recebeu {{couponsQty}} cupons promocionais no valor total de {{couponsAmount}} reais a serem '
                            + 'utilizados na compra de produtos. {{representativeName}} {{representativetPhone}}.';

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
                            data.representativetPhone = getRepresentativePhoneNumber(user);

                            if (to) {
                                var smsMessage = null;
                                if (couponsQty > 1) {
                                    smsMessage = $interpolate(pluralCouponConfirmationSMS)(data);
                                    smsMessage =
                                        evaluateSMSMessage(
                                            pluralCouponConfirmationSMS,
                                            data,
                                            smsMessage);
                                } else {
                                    smsMessage = $interpolate(singularCouponConfirmationSMS)(data);
                                    smsMessage =
                                        evaluateSMSMessage(
                                            singularCouponConfirmationSMS,
                                            data,
                                            smsMessage);
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
                            + 'na compra de produtos. {{representativeName}} {{representativetPhone}}.';

                    var giftCardCustomerConfirmationSMS =
                        'Voce presenteou {{giftedCustomerName}} com um Vale Presente no valor de {{giftCardAmount}} reais a ser utilizado '
                            + 'na compra de produtos. {{representativeName}} {{representativetPhone}}.';

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
                            data.representativetPhone = getRepresentativePhoneNumber(user);

                            if (to) {
                                var smsMessage = $interpolate(giftCardConfirmationSMS)(data);
                                smsMessage =
                                    evaluateSMSMessage(giftCardConfirmationSMS, data, smsMessage);
                                smsSent = this.send(to, smsMessage);
                            } else {
                                smsSent = $q.reject($interpolate(cellMissingAlert)(data));
                            }
                            return smsSent;
                        };

                    this.sendGiftCardCustomerConfirmation =
                        function sendGiftCardCustomerConfirmation (customer, giftCard) {

                            var entity = EntityService.read(giftCard.entity);
                            var to = getPhoneNumber(customer);

                            var smsSent = null;
                            var data = {};

                            // complete data object
                            data.giftedCustomerName = entity.name;
                            data.giftCardAmount = getCurrencyFormat(giftCard.amount);
                            data.representativeName = user.name;
                            data.yourConsultant = getYourConsultantGenderRelativePhrase(user);
                            data.representativetPhone = getRepresentativePhoneNumber(user);

                            if (to) {
                                var smsMessage =
                                    $interpolate(giftCardCustomerConfirmationSMS)(data);
                                smsMessage =
                                    evaluateSMSMessage(
                                        giftCardCustomerConfirmationSMS,
                                        data,
                                        smsMessage);
                                smsSent = this.send(to, smsMessage);
                            } else {
                                smsSent = $q.reject($interpolate(cellMissingAlert)(data));
                            }
                            return smsSent;
                        };

                }
            ]);

}(angular));