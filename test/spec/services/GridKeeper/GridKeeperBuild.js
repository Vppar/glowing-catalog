'use strict';

describe('Service: GridKeeper', function() {

    // load the service's module
    beforeEach(module('tnt.catalog.grid'));

    // instantiate service
    var GridKeeper = undefined;
    beforeEach(inject(function(_GridKeeper_) {
        GridKeeper = _GridKeeper_;
    }));

    /**
     * 
     * FIXME - Not properly chaining the items with their parents.
     * 
     * <pre>
     * @spec GridKeeper.build#1
     *  Given a valid array of products
     *  when the build is triggered
     *  then the grid should be populated with the products and their parents 
     * </pre>
     */
    xit('should build a grid', function() {
        //Given
        var list = 
            [{ 
                description : 'Cuide dos cílios com uma rotina diária e tenha o olhar que você sempre sonhou. Em apenas 3 passos, fortaleça, prepare e finalize com a sua máscara para cílios favorita.',
                id : 0,
                image : '10-042319.jpg',
                line : 'Olhos',
                points : 18,
                price : 37,
                session : 'Lançamentos',
                title : 'Máscara para Cílios Lash Love - 8 g'
            },
            { 
                SKU : '10-042319',
                active : true,
                id : 1,
                image : '10-042319.jpg',
                option : 'Azul',
                parent : 0
            },
            { 
                SKU : '10-042320',
                active : true,
                id : 2,
                image : '10-042320.jpg',
                option : 'Verde',
                parent : 0
            },
            { 
                description : 'São tonalidades vibrantes e de longa duração em fórmula mineral. Proporcionam cores intensas, que não acumulam nas pálpebras, e são ideais para qualquer tom de pele.',
                id : 3,
                image : '10-026293.jpg',
                line : 'Olhos',
                points : 12,
                price : 21,
                session : 'Lançamentos',
                title : 'Sombra Mineral (Refil) - 1,4 g'
            },
            { 
                SKU : '10-026293',
                active : true,
                id : 4,
                image : '10-026293.jpg',
                option : 'Golden Vanilla',
                parent : 3
            },
            { 
                SKU : '10-046679',
                active : true,
                id : 5,
                image : '10-046679.jpg',
                option : 'Lime',
                parent : 3
            }];
        
        var expected = [ { id : 0, grid : [{ id : 1, grid : [  ] }, { id : 2, grid : [  ] } ] }, 
                         { id : 3, grid : [{ id : 4, grid : [  ] }, { id : 5, grid : [  ] } ] }];
        
        //When
         GridKeeper.build(list);
        //Then
        expect(GridKeeper.read()).toEqual(expected);
        
    });
    
    /**
     * 
     *  FIXME - should return an empty array
     * 
     * <pre>
     * @spec GridKeeper.build#2
     *  Given a invalid array of products
     *  when the build is triggered
     *  nothing should be added to the grid
     * </pre>
     */
    xit('should build an empty inventory', function() {
        //Given
        var list = 
            [{ 
                these : 18,
                are : 37,
                nonsense : 'Lançamentos',
                objects : 'Máscara para Cílios Lash Love - 8 g'
            },
            { 
                sholdnt : '10-042319',
            },
            { 
                be : 'Verde',
                considered : 0
            }];
        
        //When
        GridKeeper.build(list);
        
        //Then
        expect(GridKeeper.read()).toEqual([]);
        
    });

});