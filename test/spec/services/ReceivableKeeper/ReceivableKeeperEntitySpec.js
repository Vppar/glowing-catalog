'use strict';

describe('Service: ReceivableKeeperEntity', function() {

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
     * Given a valid receivable id
     * and a due date
     * and a amount
     * When new is triggered
     * Then a Receivable instance should be created
     * </pre>
     */
    it('should create a new Receivable instance', function() {
        // given
        var id = 27;
        var duedate = 1391101200000;
        var amount = 1345.93;
        var expected = {
            id : id,
            createdate : fakeNow,
            duedate : duedate,
            amount : amount,
        };

        // when
        var receivable = new Receivable(id, duedate, amount);

        // then
        expect(receivable).toEqual(expected);
    });

});
