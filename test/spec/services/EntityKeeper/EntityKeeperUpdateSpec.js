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
    var EntityKeeper = undefined;
    var Entity = undefined;
    var JournalEntry = undefined;
    beforeEach(inject(function(_EntityKeeper_, _Entity_, _JournalEntry_) {
        EntityKeeper = _EntityKeeper_;
        Entity = _Entity_;
        JournalEntry =_JournalEntry_;
    }));
    
    
    it('should handle an update entity event', function() {
        // given
        var validEntity = {
                id : 1,
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
        expect(function() {
            EntityKeeper.handlers['entityUpdateV1'](entity);}).toThrow('User not found.');

    });
    
    
    /**
     * <pre>
     * @spec EntityKeeper.update#1
     * Given a valid values
     * when and create is triggered
     * then a journal entry must be created
     * an the entry must be registered
     * </pre>
     */
    
    it('should update', function() {

        var fakeNow = 1386179100000;
        spyOn(Date.prototype, 'getTime').andReturn(fakeNow);
        
        var id = 1;
        var name = 'cassiano';
        var emails = [{address: 'cassiano.tesseroli@gvt.com.br'},{address: 'c4ssio@gmail.com'}];
        var birthDate = '16/09/1981';
        var phones = [{ddd: 41, phone: 96491686},{ddd: 41, phone: 30875341}];
        var cep = '8157170';
        var document = '1234567890';
        var addresses = [{street: 'rua', number: 555}, {street: 'rua', number: 556}];
        var remarks = 'bad client';
        
        var ev = new Entity(id, name, emails, birthDate, phones, cep, document, addresses,  remarks);
        var stp = fakeNow / 1000;
        var entry = new JournalEntry(null, stp, 'entityUpdate', 1, ev); 
        
        expect(function() {
            EntityKeeper.update(ev);}).not.toThrow();
        expect(jKeeper.compose).toHaveBeenCalledWith(entry);
    });
    
    /**
     * <pre>
     * @spec EntityKeeper.update#2
     * Given a invalid document
     * when and update is triggered
     * then an error must be raised
     * </pre> 
     */
    it('should throw error', function() {
        
        EntityKeeper.update = jasmine.createSpy('EntityKeeper.update').andCallFake(function() {
            throw 'User not found.';
        });
        var id = 1;
        var name = 'cassiano';
        var emails = [{address: 'cassiano.tesseroli@gvt.com.br'},{address: 'c4ssio@gmail.com'}];
        var birthDate = '16/09/1981';
        var phones = [{ddd: 41, phone: 96491686},{ddd: 41, phone: 30875341}];
        var cep = '8157170';
        var document = '11';
        var addresses = [{street: 'rua', number: 555}, {street: 'rua', number: 556}];
        var remarks = 'bad client';

        expect(function() {
            EntityKeeper.update(id, name, emails, birthDate, phones, cep, document, addresses,  remarks);}).toThrow('User not found.');
    });

});
