describe('Service: EntityServiceUpdateSpec', function() {

    var log = {};
    var fakeNow = 1386444467895;
    var EntityKeeper = {};

    // load the service's module
    beforeEach(function() {
        spyOn(Date.prototype, 'getTime').andReturn(fakeNow);

        log.debug = jasmine.createSpy('log.debug');

        module('tnt.catalog.entity.service');
        module(function($provide) {
            $provide.value('$log', log);
            $provide.value('EntityKeeper', EntityKeeper);
        });
    });
    beforeEach(inject(function(_Entity_, _EntityService_) {
        Entity = _Entity_;
        EntityService = _EntityService_;
    }));

    it('should update a entity instance', function() {
        // given
        EntityKeeper.update = jasmine.createSpy('EntityKeeper.update');
        EntityService.isValid = jasmine.createSpy('EntityService.isValid').andReturn([]);
        
        var entity = {
                uuid : 1,
                name : 'cassiano',
                emails : [{address: 'cassiano.tesseroli@gvt.com.br'},{address: 'c4ssio@gmail.com'}],
                birthDate : '16/09/1981',
                phones : [{ddd: 41, phone: 96491686},{ddd: 41, phone: 30875341}],
                cep : '8157170',
                document : '1234567890',
                addresses : [{street: 'rua', number: 555}, {street: 'rua', number: 556}],
                remarks : 'bad client'
        };

        // when
        var result = EntityService.update(entity);

        // then
        expect(EntityKeeper.update).toHaveBeenCalledWith(entity);
        expect(result.length).toBe(0);
    });
  
    it('shouldn\'t update a entity instance', function() {
        // given
        EntityService.isValid = jasmine.createSpy('EntityKeeper.isValid').andReturn([]);
        EntityKeeper.update = jasmine.createSpy('EntityKeeper.update').andCallFake(function() {
            throw 'my exception';
        });
        var entity = {
                uuid : 1,
                name : 'cassiano',
                emails : [{address: 'cassiano.tesseroli@gvt.com.br'},{address: 'c4ssio@gmail.com'}],
                birthDate : '16/09/1981',
                phones : [{ddd: 41, phone: 96491686},{ddd: 41, phone: 30875341}],
                cep : '8157170',
                document : '1234567890',
                addresses : [{street: 'rua', number: 555}, {street: 'rua', number: 556}],
                remarks : 'bad client'
        };
        // when
        var createCall = function() {
            EntityService.update(entity);
        };

        // then
        expect(createCall).toThrow();
    });

});
