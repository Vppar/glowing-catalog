describe('Service: ReceivableServiceListSpec', function() {

    var ReceivableKeeper = {};
    var BookService = {};
    var CoinKeeper = function() {
        return ReceivableKeeper;
    };
    var log = {};

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.receivable.service');

        log.debug = jasmine.createSpy('log.debug');

        module(function($provide) {
            $provide.value('$log', log);
            $provide.value('CoinKeeper', CoinKeeper);
            $provide.value('BookService', BookService);
        });
    });
    beforeEach(inject(function(_ReceivableService_) {
        ReceivableService = _ReceivableService_;
    }));

    it('should return full list copy', function() {
        // given
        var dummyReceivables = [
            {
                bla : 'bla'
            }
        ];
        ReceivableKeeper.list = jasmine.createSpy('ReceivableKeeper.list').andReturn(dummyReceivables);

        // when
        var receivables = ReceivableService.list();

        // then
        expect(ReceivableKeeper.list).toHaveBeenCalled();
        expect(receivables).toEqual(dummyReceivables);
    });

    it('shouldn\'t return full list copy', function() {
        // given
        ReceivableKeeper.list = jasmine.createSpy('ReceivableKeeper.list').andCallFake(function() {
            throw 'my exception';
        });

        // when
        var result = {};
        var receivableCall = function() {
            result = ReceivableService.list();
        };

        // then
        expect(receivableCall).not.toThrow();
        expect(log.debug).toHaveBeenCalledWith('ReceivableService.list: Unable to recover the list of receivables. Err=my exception');
        expect(result).toEqual(null);
    });
    
    it('should return a list of checks only', function() {
        // given
        var dummyReceivables = [
            {
                uuid : 2,
                type : 'check',
                payment : {
                    uuid : null
                }
            }, {
                uuid : 32,
                type : 'check',
                payment : {
                    uuid : null
                }
            }, {
                type : 'cash',
                payment : {
                    uuid : 987978986
                }
            }
        ];
        ReceivableKeeper.list = jasmine.createSpy('ReceivableKeeper.list').andReturn(dummyReceivables);

        // when
        var receivables = ReceivableService.listChecks();

        // then
        expect(ReceivableKeeper.list).toHaveBeenCalled();
        expect(receivables).toEqual([ { uuid : 2 }, { uuid : 32 } ]);
    });
});