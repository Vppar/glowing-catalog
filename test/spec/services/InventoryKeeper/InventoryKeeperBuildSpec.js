'use strict';

//FIXME - it's necessery change the <InventoryKeeper.inventory> to something that read the inventory
xdescribe('Service: InventoryKeeper', function() {

    // load the service's module
    beforeEach(module('tnt.catalog.inventory'));

    // instantiate service
    var InventoryKeeper = undefined;
    beforeEach(inject(function(_InventoryKeeper_) {
        InventoryKeeper = _InventoryKeeper_;
    }));

    /**
     * <pre>
     * @spec InventoryKeeper.build#1
     * Given a valid list of products
     * When a build is triggered
     * Then the inventory must be populated with squashed products
     * and the product's property <id> must be read only
     * </pre>
     */
    it('should build inventory', function() {
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
    	
    	var expected = 
    		[{
    			id: 1,
    			SKU: '10-042319',
    			active: true, 
    			image: '10-042319.jpg', 
    			option: 'Azul', parent: 0
    		},
    		{
    			id: 2, 
    			SKU: '10-042320', 
    			active: true, 
    			image: '10-042320.jpg',
    			option: 'Verde', 
    			parent: 0
    		}, 
    		{
    			id: 4, 
    			SKU: '10-026293', 
    			active: true, 
    			image: '10-026293.jpg', 
    			option: 'Golden Vanilla', 
    			parent: 3
    		}, 
    		{
    			id: 5, 
    			SKU: '10-046679', 
    			active: true,
    			image: '10-046679.jpg', 
    			option: 'Lime', 
    			parent: 3
    		}];
    	
    	//When
    	InventoryKeeper.build(list);
    	
    	//Then
    	expect(InventoryKeeper.inventory).toEqual(expected);
    	
    });
    
    /**
	 * <pre>
	 * @spec InventoryKeeper.build#2
	 * Given an invalid list of products
	 * When a build is triggered
	 * Then the inventory must be empty
	 * </pre>
	 */
    it('should build an empty inventory', function() {
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
    	
    	var expected = [];
    	
    	//When
    	InventoryKeeper.build(list);
    	
    	//Then
    	expect(InventoryKeeper.inventory).toEqual(expected);
    	
    });

});
