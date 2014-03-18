describe('Service: ConsultantServiceListSpec', function() {

    var ConsultantKeeper = {};
    var log = {};

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.consultant.service');
        log.debug = jasmine.createSpy('log.debug');

        module(function($provide) {
            $provide.value('$log', log);
            $provide.value('ConsultantKeeper', ConsultantKeeper);
        });
    });
    beforeEach(inject(function(_ConsultantService_) {
        ConsultantService = _ConsultantService_;
    }));

    it('should return full list copy', function() {
        // given
        var dummyReceivables = [
            {
                bla : 'bla'
            }
        ];
        ConsultantKeeper.list = jasmine.createSpy('ConsultantKeeper.list').andReturn(dummyReceivables);

        // when
        var consultants = ConsultantService.list();

        // then
        expect(ConsultantKeeper.list).toHaveBeenCalled();
        expect(consultants).toEqual(dummyReceivables);
    });

    it('shouldn\'t return full list copy', function() {
        // given
        ConsultantKeeper.list = jasmine.createSpy('ConsultantKeeper.list').andCallFake(function() {
            throw 'my exception';
        });

        // when
        var result = {};
        var consultantCall = function() {
            result = ConsultantService.list();
        };

        // then
        expect(consultantCall).not.toThrow();
//        expect(logger.debug).toHaveBeenCalledWith('ConsultantService.list: Unable to recover the list of consultant. Err=my exception');
        expect(result).toEqual(null);
    });
});