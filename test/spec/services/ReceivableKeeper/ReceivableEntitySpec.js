'use strict';

describe('Service: ReceivableEntity', function() {

    var Receivable = null;
    var fakeNow = null;
    var monthTime = null;

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.receivable.entity');
        fakeNow = 1386179100000;
        monthTime = 2592000;

        spyOn(Date.prototype, 'getTime').andReturn(fakeNow);
    });

    // instantiate service
    beforeEach(inject(function(_Receivable_) {
        Receivable = _Receivable_;
    }));

    /**
     * <pre>
     * Given a receivable description
     * and a document
     * When new is triggered
     * Then a Receivable instance should be created
     * </pre>
     */
    it('should create a new Receivable instance', function() {
        // given
        var id = 1;
        var creationdate = fakeNow;
        var entity = 'M A V COMERCIO DE ACESSORIOS LTDA';
        var type = 'BRINDE';
        var amount = 12345.67;
        var duedate = fakeNow + monthTime;

        // when
        var receivable = new Receivable(id, creationdate, entity, type, amount, duedate);

        // then
        expect(receivable.id).toBe(id);
        expect(receivable.creationdate).toBe(creationdate);
        expect(receivable.entity).toBe(entity);
        expect(receivable.type).toBe(type);
        expect(receivable.amount).toBe(amount);
        expect(receivable.duedate).toBe(fakeNow + monthTime);
    });
});
