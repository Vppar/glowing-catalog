describe('Service: ReceivableServiceisValidSpec', function() {

    var log = {};
    var fakeTime = 1386444467895;

    // load the service's module
    beforeEach(function() {
        log.debug = jasmine.createSpy('$log.debug');

        module('tnt.catalog.receivable.service');
        module(function($provide) {
            $provide.value('$log', log);
        });
    });
    beforeEach(inject(function(_ReceivableService_) {
        ReceivableService = _ReceivableService_;
    }));

    /**
     * <pre>
     * Given a valid receivable
     * When isValid is triggered
     * Then true should be returned
     * </pre>
     */
    it('should validate a receivable instance', function() {
        // given

        var receivable = {
            title : 'M A V COMERCIO DE ACESSORIOS LTDA',
            document : {
                label : 'Document label',
                number : '231231231-231',
                isValid : function() {
                    return true;
                }
            },
            type : 'my type',
            installmentId : 1,
            duedate : 1391083200000,
            amount : 1234.56
        };
        spyOn(Date.prototype, 'getTime').andReturn(fakeTime);

        // when
        var result = ReceivableService.isValid(receivable);

        // then
        expect(result).toBe(true);
    });
    
    /**
     * <pre>
     * Given a invalid receivable
     * When isValid is triggered
     * Then true should be returned
     * </pre>
     */
    it('should validate a receivable instance', function() {
        // given

        var receivable = {
            title : 'M A V COMERCIO DE ACESSORIOS LTDA',
            document : {
                label : 'Document label',
                number : '231231231-231',
            },
            amount : -1234.56
        };
        spyOn(Date.prototype, 'getTime').andReturn(fakeTime);

        // when
        var result = ReceivableService.isValid(receivable);

        // then
        expect(result).toBe(true);
    });

});