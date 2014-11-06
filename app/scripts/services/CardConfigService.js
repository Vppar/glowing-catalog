(function(angular) {
    'use strict';
    
    angular.module(
         'tnt.catalog.card.config.service',
        [
        'tnt.catalog.card.config'
    ]).service(
         'CardConfigService',
        [
        '$q', '$log', 'logger', 'CardConfigKeeper',
        function CardConfigService($q, $log, logger, CardConfigKeeper) {

                this.isValid = function(subscription) {
                    var invalidProperty = {};

                    var result = [];
                 
                    for ( var ix in invalidProperty) {
                        if (!invalidProperty[ix]) {
                            var error = {};
                            error[ix] = subscription[ix];
                            result.push(error);
                        }
                    }

                    return result;
                };

                this.add = function (cardConfig) {
                    var result = this.isValid(cardConfig);
                
                    if (result.length === 0) {
                        return CardConfigKeeper.add(cardConfig);
                    }
                    else {
                        return $q.reject(result);
                    }
                };

                this.update = function (cardConfig) {
                    var result = this.isValid(cardConfig);
                    if (result.length === 0) {
                        try {
                            return CardConfigKeeper.update(cardConfig);
                        } catch (err) {
                            return $q.reject(result);
                        }
                    }
                    return result;
                };

                this.list = function() {
                    var result = null;
                    try {
                        result = CardConfigKeeper.list();
                    } catch (err) {
                        $log.debug('CardConfigService.list: Unable to recover the list of card config. Err=' + err);
                    }
                    return result;
                };

                this.getCreditCardFeeByInstallments = function(installments) {
                    if(installments && installments > 0) {
                        var cardConfigs = this.list();
                        if(cardConfigs && cardConfigs.length > 0) {
                            var cardConfig = cardConfigs[0];
                            if(installments === 1 && cardConfig.ccOpRate1Installment) {
                                return cardConfig.ccOpRate1Installment;
                            } else if(installments >= 2 && installments <= 6 && cardConfig.ccOpRate26Installment) {
                                return cardConfig.ccOpRate26Installment;
                            } else if(installments >= 7 && installments <= 12 && cardConfig.ccOpRate712Installment) {
                                return cardConfig.ccOpRate712Installment;
                            }
                        }
                    }
                    return;
                };
                
            }
    ]);
})(angular);