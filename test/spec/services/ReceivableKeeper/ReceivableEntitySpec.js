'use strict';

describe('Service: ReceivableEntity', function() {

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
     * Given a receivable description
     * and a document
     * When new is triggered
     * Then a Receivable instance should be created
     * </pre>
     */
    it('should create a new Receivable instance', function() {
        // given
        var title = 'M A V COMERCIO DE ACESSORIOS LTDA';
        var document = {
            label : 'Document label',
            number : '231231231-231'
        };

        // when
        var receivable = new Receivable(title, document);

        // then
        expect(receivable.title).toBe(title);
        expect(receivable.document.label).toBe(document.label);
        expect(receivable.document.number).toBe(document.number);
        expect(receivable.canceled).toBe(false);
    });
});
