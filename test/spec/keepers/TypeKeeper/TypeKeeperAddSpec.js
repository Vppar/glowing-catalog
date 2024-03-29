'use strict';

describe('Service: TypeKeeper', function() {

    var jKeeper = {};
    var IdentityService ={};
    var fakeUUID = {};
    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.type');
        module('tnt.catalog.type.keeper');
        module('tnt.catalog.type.entity');
        module('tnt.catalog.journal');
        module('tnt.catalog.journal.entity');
        module('tnt.catalog.journal.replayer');
    });

    beforeEach(function() {
        jKeeper.compose = jasmine.createSpy('JournalKeeper.compose');
        IdentityService.getUUID = jasmine.createSpy('IdentityService.getUUID').andReturn(fakeUUID);
        module(function($provide) {
            $provide.value('JournalKeeper', jKeeper);
            $provide.value('IdentityService', IdentityService);
        });
    });

    // instantiate service
    var TypeKeeper = undefined;
    var Type = undefined;
    var JournalEntry = undefined;
    beforeEach(inject(function(_TypeKeeper_, _Type_, _JournalEntry_) {
        TypeKeeper = _TypeKeeper_;
        Type = _Type_;
        JournalEntry =_JournalEntry_;
    }));
    
    /**
     * <pre>
     * @spec TypeKeeper.add#1
     * Given a valid typeId
     * and a valid name
     * when and add is triggered
     * then a journal entry must be created
     * an the entry must be registered
     * </pre>
     */
    it('should add', function() {

        var fakeNow = 1386179100000;
        spyOn(Date.prototype, 'getTime').andReturn(fakeNow);
        
        var typeId = 23;
        var name = 'I\'m the type\`s name!';
        var classification = 'a class';
        
        var ev = new Type(typeId, name,classification);
        var stp = fakeNow / 1000;
        var entry = new JournalEntry(null, stp, 'typeAdd', 1, ev); 

        var expectResult = function(){
            TypeKeeper.add(ev);
        };
        
        expect(expectResult).not.toThrow();
        expect(jKeeper.compose).toHaveBeenCalledWith(entry);
    });
    
    it('should add with the handler', function() {

        var fakeNow = 1386179100000;
        spyOn(Date.prototype, 'getTime').andReturn(fakeNow);
        
        var typeId = 23;
        var name = 'I\'m the type\`s name!';
        var classification = 'a class';
        
        var ev = new Type(typeId, name,classification);
        
        TypeKeeper.handlers['typeAddV1'](ev);
        
        var typelength = TypeKeeper.list(classification).length;
        
        expect(typelength).toBe(1);
    });
    
    it('should add with the handler at separated places', function() {

        var fakeNow = 1386179100000;
        spyOn(Date.prototype, 'getTime').andReturn(fakeNow);
        
        var typeId1 = 1;
        var name1 = 'I\'m the type\`s name!';
        var classification1 = 'a class';
        var ev1 = new Type(typeId1, name1,classification1);
        
        var typeId2 = 1;
        var name2 = 'I\'m the other type\`s name!';
        var classification2 = 'another class';
        var ev2 = new Type(typeId2, name2,classification2);
        
        TypeKeeper.handlers['typeAddV1'](ev1);
        TypeKeeper.handlers['typeAddV1'](ev2);
        
        var typelength1 = TypeKeeper.list(classification1).length;
        var typelength2 = TypeKeeper.list(classification2).length;
        
        expect(typelength1).toBe(1);
        expect(typelength2).toBe(1);
    });
    
    it('should throw error if the obj passed is not an Type', function() {

        var notType = {
            typeId : 1,
            name: 'fake type'
        };
        
        var expectedReturn = function(){
            TypeKeeper.add(notType);
        };

        expect(expectedReturn).toThrow('Wrong instance to TypeKeeper');
    });
    
    it('should throw error if the argument is null', function() {

        var expectedReturn = function(){
            TypeKeeper.add(null);
        };
        
        expect(expectedReturn).toThrow('Wrong instance to TypeKeeper');
    });
    
    it('should throw error if the argument is undefined', function() {

        var expectedReturn = function(){
            TypeKeeper.add(undefined);
        };
        
        expect(expectedReturn).toThrow('Wrong instance to TypeKeeper');
    });

});
