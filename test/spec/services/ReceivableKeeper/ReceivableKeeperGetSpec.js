'use strict';

describe('Service: ReceivableKeeperGet', function() {

    var ReceivableKeeper = null;
    var fakeNow = null;

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.receivable.entity');
        module('tnt.catalog.receivable.keeper');
        module('tnt.catalog.journal');
        module('tnt.catalog.journal.entity');
        module('tnt.catalog.journal.replayer');

        fakeNow = 1386179100000;
        spyOn(Date.prototype, 'getTime').andReturn(fakeNow);
    });

    // instantiate service
    beforeEach(inject(function(_ReceivableKeeper_) {
        ReceivableKeeper = _ReceivableKeeper_;
    }));

    /**
     * <pre>
     * Given a existing receivable id     
     * When an get is triggered
     * Then the target receivable should be returned
     * </pre>
     */
    it('should return a receivable', function() {
        // given
        var title = 'M A V COMERCIO DE ACESSORIOS LTDA';
        var document = {
            label : 'Document label',
            number : '231231231-231'
        };
        var receivable = {
            title : title,
            document : document,
        };
        ReceivableKeeper.handlers['receivableAddV1'](receivable);
        ReceivableKeeper.handlers['receivableAddV1'](receivable);
        var receivables = ReceivableKeeper.list();

        // when
        var myResult = ReceivableKeeper.get(receivables[0].id);
        var yourResult = ReceivableKeeper.get(receivables[1].id);

        // then
        expect(receivables[0].title).toEqual(myResult.title);
        expect(receivables[0].document).toEqual(myResult.document);
        expect(receivables[0].id).toEqual(1);
        expect(receivables[0].createdate).toEqual(fakeNow);

        expect(receivables[1].title).toEqual(yourResult.title);
        expect(receivables[1].document).toEqual(yourResult.document);
        expect(receivables[1].id).toEqual(2);
        expect(receivables[1].createdate).toEqual(fakeNow);
    });

    /**
     * <pre>
     * Given a missing receivable id     
     * When an get is triggered
     * Then undefined should be returned
     * </pre>
     */
    it('shouldn\'t return a receivable', function() {
        // given
        var title = 'M A V COMERCIO DE ACESSORIOS LTDA';
        var document = {
            label : 'Document label',
            number : '231231231-231'
        };
        var receivable = {
            title : title,
            document : document,
        };
        ReceivableKeeper.handlers['receivableAddV1'](receivable);

        // when
        var myResult = ReceivableKeeper.get(123);

        // then
        expect(myResult).toBe(null);
    });

});
