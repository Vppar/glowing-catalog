(function(angular) {
    'use strict';

    angular.module('tnt.catalog.payment.oncuff.service', [
        'tnt.catalog.entity.service', 'tnt.catalog.payment.service'
    ]).service('OnCuffPaymentService',
        ['$filter', 'OnCuffPayment', 'EntityService', 'PaymentService', 'Misplacedservice',
    /**
     * Service to handle on cuff payment business logic.
     * 
     * @param {function} $filter - Angular filter service.
     * @param {OnCuffPayment} OnCuffPayment - OnCuff payment entity
     * @param {EntityService} EntityService - Handle customer entity operations.
     * @param {EntityService} PaymentService - Handle payment operations
     * @param {Misplacedservice} Misplacedservice - Generate installments to
     *            general payments.
     */
    function OnCuffPaymentService($filter, OnCuffPayment, EntityService, PaymentService, Misplacedservice) {

        /**
         * Register in PaymentService the onCuff installments.
         * 
         * @param {Object} installments - onCuff installments to be persisted.
         */
        this.registerInstallments = function(installments) {
            PaymentService.clear('onCuff');

            for ( var i in installments) {
                var installment = installments[i];
                // FIXME - this allows some installments be lost and no one will
                // know.
                if (installment.amount > 0) {
                    var onCuffPayment = new OnCuffPayment(installment.amount, installment.duedate);
                    onCuffPayment.number = installment.number;

                    PaymentService.add(onCuffPayment);
                }
            }
        };

        /**
         * Build onCuff monthly installments based on onCuff reference object.
         * 
         * @param {number} numberOfInstallments - number of installments to be
         *            built.
         * @param {date} firstDueDate - First duedate to be reference to the
         *            others installments.
         * @param {number} amount - Total amount of all installments.
         * 
         * @return {array} installments - OnCuff installments.
         */
        this.buildInstallments = function buildInstallments(numberOfInstallments, firstDueDateTime, amount) {
            var installments = [];
            for ( var i = 0; i < numberOfInstallments; i++) {

                var installment = {};

                installment.number = i + 1;
                installment.duedate = this.buildDueDate(firstDueDateTime, i);
                installment.amount = 0;

                installments.push(installment);
            }

            Misplacedservice.recalc(amount, -1, installments, 'amount');

            return installments;
        };

        /**
         * Build onCuff reference object.
         * 
         * @param {number} remainingAmount - Amount left of the order.
         * @param {string} entityUUID - Customer entity uuid.
         * 
         * @return {Object} onCuff - OnCuff reference object to be used by the
         *         controller.
         */
        this.buildOnCuffRef = function buildOnCuffRef(remainingAmount, entityUUID) {

            var onCuff = {
                customer : null,
                numberOfInstallments : null,
                duedate : null,
                amount : null,
                installments : null
            };

            onCuff.customer = EntityService.read(entityUUID);

            var recoveredInstallments = PaymentService.list('onCuff');

            if (recoveredInstallments.length === 0) {
                var today = new Date();
                today.setHours(0);
                today.setMinutes(0);
                today.setSeconds(0);

                onCuff.numberOfInstallments = 1;
                onCuff.duedate = today;
                onCuff.amount = remainingAmount;
                onCuff.installments = this.buildInstallments(onCuff.numberOfInstallments, onCuff.duedate.getTime(), onCuff.amount);
            } else {
                onCuff.numberOfInstallments = recoveredInstallments.length;
                onCuff.duedate = new Date(recoveredInstallments[0].duedate.getTime());
                onCuff.amount = $filter('sum')(recoveredInstallments, 'amount');
                onCuff.installments = recoveredInstallments;
            }

            return onCuff;
        };

        /**
         * Calculates the proper duedate based on the first duedate informed and
         * the number of months to add.
         * 
         * @param {date} firstDueDate - The first duedate of the installments.
         * @param {number} increase - Number of months to increase.
         * 
         * @return {date} date - The proper incresed date.
         */
        this.buildDueDate = function buildDueDate(firstDueDateTime, increase) {
            var baseDate = new Date(firstDueDateTime);

            var date = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1 + increase, 0);
            if (date.getDate() > baseDate.getDate()) {
                date = new Date(baseDate.setMonth(baseDate.getMonth() + increase));
            }

            date.setHours(0);
            date.setMinutes(0);
            date.setSeconds(0);

            return date;
        };

        /**
         * Recalc OnCuff installments.
         * 
         * @param {number} index - The installment changed.
         * @param {Object} onCuff - OnCuff reference object.
         * 
         * @return {Object} installments - Recalculated installments.
         */
        this.recalcInstallments = function recalcInstallments(index, onCuff) {
            return Misplacedservice.recalc(onCuff.amount, index, onCuff.installments, 'amount');
        };

    }]);
}(angular));