(function(angular) {
    'use strict';

    angular.module('tnt.catalog.payment.oncuff.service', [
        'tnt.catalog.entity.service', 'tnt.catalog.payment.service'
    ]).service('OnCuffPaymentService',

    /**
     * Service to handle on cuff payment business logic.
     * 
     * @param EntityService - Handle customer entity operations.
     * @param PaymentService - Handle payment operations
     */
    function OnCuffPaymentService(EntityService, PaymentService) {

        /**
         * Register in PaymentService the onCuff installments.
         * 
         * @param installments - onCuff installments to be persisted
         */
        this.registerInstallments = function(installments) {
            PaymentService.clear('onCuff');

            for ( var i in installments) {
                var installment = installments[i];
                if (installment.amount > 0) {
                    var payment = new OnCuffPayment(installment.amount, installment.dueDate);
                    payment.installment = installment.number;

                    PaymentService.add(payment);
                }
            }
        };

        /**
         * Build onCuff reference object.
         * 
         * @param paymentChange - Amount left of the order.
         * @param entityUUID - Customer entity uuid.
         */
        this.buildOnCuffRef = function buildOnCuffRef(paymentChange, entityUUID) {

            var onCuff = {
                customer : null,
                numberOfInstallments : null,
                dueDate : null,
                amount : null,
                installments : null
            };

            onCuff.customer = EntityService.find(entityUUID);

            var recoveredInstallments = PaymentService.list('onCuff');

            if (onCuff.installments === 0) {
                onCuff.numberOfInstallments = 1;
                onCuff.dueDate = angular.copy(TODAY);
                onCuff.amount = paymentChange * -1;
                onCuff.installments = this.buildInstallments(onCuff.number, onCuff.dueDate, onCuff.amount);
            } else {
                onCuff.numberOfInstallments = onCuff.installments.length;
                onCuff.dueDate = new Date(onCuff.installments[0].dueDate);
                onCuff.amount = $filter('sum')(recoveredInstallments, 'amount');
                onCuff.installments = recoveredInstallments;
            }

            return onCuff;
        };

        /**
         * Build onCuff monthly installments based on onCuff reference object.
         * 
         * @param numberOfInstallments - number of installments to be built.
         * @param firstDueDate - First duedate to be reference to the others
         *            installments.
         * @param amount - Total amount of all installments.
         */
        this.buildInstallments = function buildInstallments(numberOfInstallments, firstDueDate, amount) {
            var numberOfInstallments = onCuff.numberOfInstallments;
            var firstDueDate = onCuff.dueDate;
            var amount = onCuff.amount;

            var installments = [];
            for ( var i in numberOfInstallments) {

                var installment = {};

                installment.number = i + 1;
                installment.dueDate = this.buildDueDate(firstDueDate, i);
                installment.amount = 0;

                installments.push(installment);
            }

            Misplacedservice.recalc(amount, -1, installments, 'amount');

            return installments;
        };

        /**
         * Calculates the proper duedate based on the first duedate informed and
         * the number of months to add.
         * 
         * @param firstDueDate - The first duedate of the installments.
         * @param increase - Number of months to increase.
         */
        this.buildDueDate = function buildDueDate(firstDueDate, increase) {
            var baseDate = angular.copy(firstDueDate);

            var date = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1 + increase, 0);
            if (date.getDate() > baseDate.getDate()) {
                date = new Date(baseDate.setMonth(baseDate.getMonth() + increase));
            }
            
            date.setHours(0);
            date.setMinutes(0);
            date.setSeconds(0);
            
            return date;
        };

    });
}(angular));