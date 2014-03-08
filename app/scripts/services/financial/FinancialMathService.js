(function(angular) {
    'use strict';

    angular.module('tnt.catalog.financial.math.service', []).service('FinancialMathService', [
        /**
         * Utility service to financial mathematics.
         * 
         * @author Arnaldo S. Rodrigues Jr.
         */
        function FinancialMathService() {

            this.financialRound = function financialRound(value) {
                return (Math.round(100 * value) / 100);
            };

            this.currencySum = function currencySum(value1, value2) {
                return this.financialRound(Number(value1) + Number(value2));
            };

            this.currencySubtract = function currencySubtract(value1, value2) {
                return this.financialRound(Number(value1) - Number(value2));
            };

            this.currencyMultiply = function currencyMultiply(value1, value2) {
                return this.financialRound(Number(value1) * Number(value2));
            };

            this.currencyDivide = function currencyDivide(value1, value2) {
                var result = 0;
                if (value2 !== 0) {
                    result = this.financialRound(Number(value1) / Number(value2));
                }
                return result;
            };
        }
    ]);
})(angular);