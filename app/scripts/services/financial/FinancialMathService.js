(function (angular) {
    'use strict';

    angular.module('tnt.catalog.financial.math.service', ['tnt.catalog.misplaced.service']).service('FinancialMathService', ['Misplacedservice','logger',
        /**
         * Utility service to financial mathematics.
         * 
         * @author Arnaldo S. Rodrigues Jr.
         */
        function FinancialMathService (Misplacedservice, logger) {
        
            var log = logger.getLogger('tnt.catalog.financial.math.service');

            this.financialRound = function financialRound (value) {
                return (Math.round(100 * value) / 100);
            };
            
            this.currencySum = function currencySum (value1, value2) {
                return this.financialRound(Number(value1) + Number(value2));
            };

            this.currencySubtract = function currencySubtract (value1, value2) {
                return this.financialRound(Number(value1) - Number(value2));
            };

            this.currencyMultiply = function currencyMultiply (value1, value2) {
                return this.financialRound(Number(value1) * Number(value2));
            };

            this.currencyDivide = function currencyDivide (value1, value2) {
                var result = 0;
                if (value2 !== 0) {
                    result = this.financialRound(Number(value1) / Number(value2));
                }
                return result;
            };

            this.round = function (number, places) {
                places = places ? places : 2;
                var zeroes = Math.pow(10, places);
                return Math.round(number * zeroes) / zeroes;
            };

            this.floor = function (number, places) {
                places = places ? places : 2;
                var zeroes = Math.pow(10, places);
                return Math.floor(number * zeroes) / zeroes;
            };
            
            this.presentValue = function(fixedRatio, monthlyRatio, numberOfInstallments, amount){
                log.debug('fixedRatio', fixedRatio); 
                log.debug('monthlyRatio',monthlyRatio);
                log.debug('numberOfInstallments', numberOfInstallments);
                log.debug('amount', amount);
                var installments = [];
                for(var ix = 0; ix <numberOfInstallments; ix++){
                    installments.push({index:ix, amount:0});
                }
                Misplacedservice.recalc(amount, -1, installments, 'amount');
                var result =0;
                for(var ix in installments){
                    var installment = installments[ix];
                    var equivalentRatio = this.equivalentRatio(installment.index, fixedRatio, monthlyRatio);
                    var installmentPresentValue = this.currencyDivide(installment.amount, equivalentRatio);
                    log.debug('presentValue', installment.index, installmentPresentValue);
                    
                    result = this.currencySum(result, installmentPresentValue);
                }
                //result = this.currencySubtract(amount, result);
                log.debug('result', result);
                return result;
            };
            
            this.equivalentRatio = function (installment, fixedRatio, monthlyRatio){
                var roundedFixedRatio = this.round(fixedRatio/100, 4);
                var roundedMonthlyRatio =1 + this.round(monthlyRatio/100, 4);
                var ratio = roundedFixedRatio + this.round(Math.pow(roundedMonthlyRatio, installment+1), 6);
                log.debug('equivalentRatio', ratio);
                return ratio;
            };
        }

    ]);
})(angular);