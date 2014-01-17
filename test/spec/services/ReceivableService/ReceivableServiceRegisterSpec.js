describe('Service: ReceivableServiceRegisterSpec', function() {

    var log = {};
    var fakeNow = 1386444467895;
    var ReceivableKeeper = {};
    var CoinKeeper = function() {
        return ReceivableKeeper;
    };

    // load the service's module
    beforeEach(function() {
        spyOn(Date.prototype, 'getTime').andReturn(fakeNow);

        log.debug = jasmine.createSpy('log.debug');

        module('tnt.catalog.receivable.service');
        module(function($provide) {
            $provide.value('$log', log);
            $provide.value('CoinKeeper', CoinKeeper);
        });
    });
    beforeEach(inject(function(_Receivable_, _ReceivableService_) {
        Receivable = _Receivable_, ReceivableService = _ReceivableService_;
    }));

    it('should create a receivable instance', function() {
        // given
        ReceivableKeeper.add = jasmine.createSpy('ReceivableKeeper.add');
        ReceivableService.isValid = jasmine.createSpy('ReceivableService.isValid').andReturn(true);
        var receivable = {
            stub : 'I\'m a stub'
        };

        // when
        var result = ReceivableService.register(receivable);

        // then
        expect(ReceivableKeeper.add).toHaveBeenCalledWith(receivable);
        expect(result).toBe(true);
    });

    it('should create a receivable instance from a existing receivable', function() {
        // given
        ReceivableKeeper.add = jasmine.createSpy('ReceivableKeeper.add');
        ReceivableKeeper.cancel = jasmine.createSpy('ReceivableKeeper.cancel');
        ReceivableService.isValid = jasmine.createSpy('ReceivableService.isValid').andReturn(true);

        var entityId = 'M A V COMERCIO DE ACESSORIOS LTDA';
        var documentId = 2;
        var type = 'my type';
        var creationdate = 123456789;
        var duedate = 987654321;
        var amount = 1234.56;

        var instance = {
            id : 1,
            creationdate : creationdate,
            entityId : entityId,
            documentId : documentId,
            type : type,
            duedate : duedate,
            amount : amount
        };
        var receivable = new Receivable(instance);

        // when
        var result = ReceivableService.register(receivable);

        // then
        expect(ReceivableKeeper.cancel).toHaveBeenCalledWith(receivable.id);
        expect(ReceivableKeeper.add).toHaveBeenCalledWith(receivable);
        expect(result).toBe(true);
    });

    it('shouldn\'t create a receivable instance', function() {
        // given
        ReceivableKeeper.add = jasmine.createSpy('ReceivableKeeper.add').andCallFake(function() {
            throw 'my exception';
        });
        var receivable = {
            stub : 'I\'m a stub'
        };

        // when
        var result = null;
        var registerCall = function() {
            result = ReceivableService.register(receivable);
        };

        // then
        expect(registerCall).not.toThrow();
        expect(result).toBe(false);
    });

});
