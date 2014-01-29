'use strict';

describe('Service: EntityKeeper', function() {

    var jKeeper = {};
    
    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.entity');
        module('tnt.catalog.entity.keeper');
        module('tnt.catalog.entity.entity');
        module('tnt.catalog.journal');
        module('tnt.catalog.journal.entity');
        module('tnt.catalog.journal.replayer');
    });

    beforeEach(function() {
        jKeeper.compose = jasmine.createSpy('JournalKeeper.compose');
        
        module(function($provide) {
            $provide.value('JournalKeeper', jKeeper);
        });
    });

    // instantiate service
    var EntityKeeper = null;
    var Entity = null;
    var JournalEntry = null;
    var IdentityService = null;
    beforeEach(inject(function(_EntityKeeper_, _Entity_, _JournalEntry_, _IdentityService_) {
        EntityKeeper = _EntityKeeper_;
        Entity = _Entity_;
        JournalEntry =_JournalEntry_;
        IdentityService = _IdentityService_;
    }));
    
    it('should handle an add entity event', function() {
        // given
        var validEntity = {
                uuid : 'cc02b600-5d0b-11e3-96c3-010001000001',
                name : 'cassiano',
                emails : [{address: 'cassiano.tesseroli@gvt.com.br'},{address: 'c4ssio@gmail.com'}],
                birthDate : '16/09/1981',
                phones : [{ddd: 41, phone: 96491686},{ddd: 41, phone: 30875341}],
                cep : '8157170',
                document : '1234567890',
                addresses : [{street: 'rua', number: 555}, {street: 'rua', number: 556}],
                remarks : 'bad client'
        };
        var entity = new Entity(validEntity);

        // when
        EntityKeeper.handlers['entityCreateV1'](entity);
        var entities = EntityKeeper.list();

        // then
        expect(entities[0]).not.toBe(entity);
        expect(entities[0]).toEqual(entity);
    });
    
    /**
     * <pre>
     * @spec EntityKeeper.add#1
     * Given a valid values
     * when and create is triggered
     * then a journal entry must be created
     * an the entry must be registered
     * </pre>
     */
    it('should add', function() {

        var fakeNow = 1386179100000;
        spyOn(Date.prototype, 'getTime').andReturn(fakeNow);
        
        spyOn(IdentityService, 'getUUID').andReturn('cc02b600-5d0b-11e3-96c3-010001000001');
        
        var uuid = 'cc02b600-5d0b-11e3-96c3-010001000001';
        var name = 'cassiano';
        var emails = [{address: 'cassiano.tesseroli@gvt.com.br'},{address: 'c4ssio@gmail.com'}];
        var birthDate = '16/09/1981';
        var phones = [{ddd: 41, phone: 96491686},{ddd: 41, phone: 30875341}];
        var cep = '8157170';
        var document = '1234567890';
        var addresses = [{street: 'rua', number: 555}, {street: 'rua', number: 556}];
        var remarks = 'bad client';
        
        var stp = fakeNow;

        var ev = new Entity(uuid, name, emails, birthDate, phones, cep, document, addresses,  remarks);
        ev.created = stp;
        
        var entry = new JournalEntry(null, stp, 'entityCreate', 1, ev); 
        
        expect(function() {
            EntityKeeper.create(ev);}).not.toThrow();
        expect(jKeeper.compose).toHaveBeenCalledWith(entry);
    });
});
