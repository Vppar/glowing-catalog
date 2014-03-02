'use strict';

describe('Service: OnCuffPaymentServiceBuildDueDateSpec\n', function() {

    var OnCuffPaymentService = null;
    var EntityService = null;
    var PaymentService = null;
    var Misplacedservice = null;

    var fakeNow = null;
    var fakeNowLastDay = null;

    var firstDueDate = null;
    var increase = null;
    var duedate = null;

    // Stub dependencies
    beforeEach(function() {
        EntityService = {};
        PaymentService = {};
        Misplacedservice = {};

        // 03/01/2014 - 00:00:00 UTC+3
        fakeNow = 1393642800000;
        // 31/01/2014 - 00:00:00 UTC+3
        fakeNowLastDay = 1391137200000;
    });

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.payment.oncuff.service');

        // Mock OnCuffPaymentService dependencies
        module(function($provide) {
            $provide.value('EntityService', EntityService);
            $provide.value('PaymentService', PaymentService);
            $provide.value('Misplacedservice', Misplacedservice);
        });
    });

    // instantiate service
    beforeEach(inject(function(_OnCuffPaymentService_) {
        OnCuffPaymentService = _OnCuffPaymentService_;
    }));

    describe('Given a firstDueDate timestamp not being last day in a month\n', function() {

        beforeEach(function() {
            firstDueDate = fakeNow;
        });

        describe('and increase equals one\n When buildDueDate is called \n Then', function() {

            beforeEach(function() {
                increase = 1;
                duedate = OnCuffPaymentService.buildDueDate(firstDueDate, increase);
            });

            it('should return an one month increased date', function() {
                var now = new Date(fakeNow);
                var nextMonth = new Date(now.setMonth(now.getMonth() + 1));
                nextMonth.setHours(0);
                nextMonth.setMinutes(0);
                nextMonth.setSeconds(0);

                expect(duedate).toEqual(nextMonth);
            });
        });

        describe('and increase greater than one\n When buildDueDate is called \n Then', function() {

            beforeEach(function() {
                increase = 2;
                duedate = OnCuffPaymentService.buildDueDate(firstDueDate, increase);
            });

            it('should return more than one month increased date', function() {
                var now = new Date(fakeNow);
                var coupleOfMonths = new Date(now.setMonth(now.getMonth() + 2));
                coupleOfMonths.setHours(0);
                coupleOfMonths.setMinutes(0);
                coupleOfMonths.setSeconds(0);

                expect(duedate).toEqual(coupleOfMonths);
            });
        });
    });

    describe('Given a firstDueDate timestamp being last day in a month\n ', function() {

        beforeEach(function() {
            firstDueDate = fakeNowLastDay;
        });

        describe('and one of months to increase When\n', function() {

            beforeEach(function() {
                increase = 1;
                duedate = OnCuffPaymentService.buildDueDate(firstDueDate, increase);
            });

            it('should return an one month increased date', function() {
                var now = new Date(fakeNowLastDay);
                // increase 2 months and step one day back resulting in one
                // month increase
                var coupleOfMonths = new Date(now.getFullYear(), now.getMonth() + 2, 0);
                coupleOfMonths.setHours(0);
                coupleOfMonths.setMinutes(0);
                coupleOfMonths.setSeconds(0);

                expect(duedate).toEqual(coupleOfMonths);
            });
        });

        describe('and more than one of months to increase When\n', function() {

            beforeEach(function() {
                increase = 2;
                duedate = OnCuffPaymentService.buildDueDate(firstDueDate, increase);
            });

            it('should return more than one month increased date', function() {
                var now = new Date(fakeNowLastDay);
                // increase 2 months and step one day back resulting in two
                // month increase
                var coupleOfMonths = new Date(now.getFullYear(), now.getMonth() + 3, 0);
                coupleOfMonths.setHours(0);
                coupleOfMonths.setMinutes(0);
                coupleOfMonths.setSeconds(0);

                expect(duedate).toEqual(coupleOfMonths);
            });
        });
    });

});
