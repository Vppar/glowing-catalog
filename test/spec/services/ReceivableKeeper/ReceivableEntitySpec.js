'use strict';

xdescribe('Service: ReceivableEntity', function() {

    var Receivable = null;
    var fakeNow = null;

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.receivable.entity');
        fakeNow = 1386179100000;
        spyOn(Date.prototype, 'getTime').andReturn(fakeNow);
    });

    // instantiate service
    beforeEach(inject(function(_Receivable_) {
        Receivable = _Receivable_;
    }));

    /**
     * <pre>
     * Given a receivable id
     * and a due date
     * and a amount
     * When new is triggered
     * Then a Receivable instance should be created
     * and the id should be read only
     * </pre>
     */
    it('should create a new Receivable instance', function() {
        // given
        var duedate = 1391101200000;
        var amount = 1345.93;
        var expected = {
            createdate : fakeNow,
            duedate : duedate,
            amount : amount,
        };

        // when
        var receivable = new Receivable(duedate, amount);
        receivable.id = 3;

        // then
        expect(receivable).toEqual(expected);
    });
});
