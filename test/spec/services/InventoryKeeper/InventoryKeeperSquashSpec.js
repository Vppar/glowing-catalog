'use strict';

describe('Service: InventoryKeeper', function() {

    // load the service's module
    beforeEach(module('tnt.catalog.inventory'));

    // instantiate service
    var InventoryKeeper = undefined;
    beforeEach(inject(function(_InventoryKeeper_) {
        InventoryKeeper = _InventoryKeeper_;
    }));

    /**
     * <pre>
     * @spec InventoryKeeper.squash#1
     * Given a valid product
     * and a valid list of products
     * When a squash is triggered
     * Then the product must be returned containing extra parent's data 
     * </pre>
     */
    it('should squash products', function() {
    	//Given
    	var product = 
    		{ 
    			SKU : '10-046679',
    			active : true,
    			id : 5,
    			image : '10-046679.jpg',
    			option : 'Lime',
    			parent : 3
    		};
    	
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
    		{
    			id: 5, 
    			SKU: '10-046679', 
    			active: true,
    			image: '10-046679.jpg', 
    			option: 'Lime', 
    			parent: 3
    		};
    	
    	//When
    	var squashed = InventoryKeeper.squash(product, list);
    	
    	//Then
    	expect(squashed).toEqual(expected);
    	
    });
    
    /**
     * FIXME
	 * <pre>
	 * @spec InventoryKeeper.squash#2
     * Given a valid product
     * and a non-parent products list
     * When a squash is triggered
     * Then null must be returned
	 * </pre>
	 */
    xit('should not squash with non-parent list of products', function() {
    	//Given
    	var product = 
		{ 
			SKU : '10-046679',
			active : true,
			id : 5,
			image : '10-046679.jpg',
			option : 'Lime',
			parent : 3
		};
    	
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
    			description : 'São tonalidades vibrantes e de longa duração em fórmula mineral. Proporcionam cores intensas, que não acumulam nas pálpebras, e são ideais para qualquer tom de pele.',
    			id : 3,
    			image : '10-026293.jpg',
    			line : 'Olhos',
    			points : 12,
    			price : 21,
    			session : 'Lançamentos',
    			title : 'Sombra Mineral (Refil) - 1,4 g'
    		}];
    	
    	var expected = null;
    	
    	//When
    	var squashed = InventoryKeeper.squash(product, list);
    	
    	//Then
    	expect(squashed).toEqual(expected);
    	
    });
    
    /**
     * FIXME
	 * <pre>
	 * @spec InventoryKeeper.squash#3
     * Given an invalid product
     * When a squash is triggered
     * Then null must be returned
	 * </pre>
	 */
    xit('should not squash with invalid product', function() {
    	//Given
    	var product = 
		{ 
			thisis : '10-046679',
			a : true,
			invalid : 5,
			product : '10-046679.jpg',
		};
	
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
		
		var expected = null;
		
		//When
		var squashed = InventoryKeeper.squash(product, list);
		
		//Then
		expect(squashed).toEqual(expected);
    	
    });
    
    /**
     * FIXME
	 * <pre>
	 * @spec InventoryKeeper.squash#3
     * Given an invalid product
     * When a squash is triggered
     * Then null must be returned
	 * </pre>
	 */
    xit('should not squash with an invalid list of products', function() {
    	//Given
    	var product = 
		{ 
			thisis : '10-046679',
			a : true,
			invalid : 5,
			product : '10-046679.jpg',
		};
	
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
		
		var expected = null;
		
		//When
		var squashed = InventoryKeeper.squash(product, list);
		
		//Then
		expect(squashed).toEqual(expected);
    	
    });

});
