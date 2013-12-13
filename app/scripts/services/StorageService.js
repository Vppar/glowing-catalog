(function(angular, _undefined) {
	'use strict';

	angular
			.module('tnt.catalog.service.storage',
					[ 'tnt.catalog.service.data' ])
			.service(
					'StorageService',
					function StorageService($log, DataProvider) {

						// Easy the access to DataProvider service.
						var data = DataProvider;

						/**
						 * Function that returns if the name is a valid storage.
						 * 
						 * @param name -
						 *            Storage name
						 */
						var isValid = function(name) {
							
							var storage = data[name];
							
							//if the name exists in the dataProvider
							if(storage){
								//if the attribute is an array
								if(storage instanceof Array){
										return true;
								//if is the name of an attribute, but is not an array
								}else{
									$log.error('StorateService.isValid: -Invalid storage name, name='+ name);
									return false;
								}
							//if the name doesn't exists in the dataProvider
							}
							else{
								//if storage exists, but is null
								if(storage === null){
									$log.error('StorateService.isValid: -Empty storage');
									return false;
								}else{
									$log.error('StorateService.isValid: -Invalid storage name, name='+ name);
									return false;
								}
							}
						};
						/**
						 * Function to return the next unique id.
						 * 
						 * @param name -
						 *            Storage name
						 * @return Id - Next id
						 */
						var getNextId = function getNextId(name) {
							var storage = data[name];
							var nextId = _undefined;
							if (storage) {
								nextId = 0;
								for ( var idx in storage) {
									var entity = storage[idx];
									if (entity.id > nextId) {
										nextId = entity.id;
									}
								}
								nextId++;
							} else {
								$log
										.error('StorageService.getNextId: -Invalid storage, name='
												+ name);
							}
							return nextId;
						};
						
						/**
						 * Function to insert an entity on a especific storage
						 * 
						 *  @param name -
						 *  			Storage name
						 *  @param entity - 
						 *  			Entity to be inserted
						 */

						var insert = function insert(name, entity) {
							var id = _undefined;
							var date = new Date().getTime();

							// if the name and the entity are both valid
							if (this.isValid(name)) {

								var storage = data[name];

								// a unique id must be set
								id = getNextId(name);
								entity.id = id;

								// a create date must be set
								entity.createdate = date;

								// an update date must be set
								entity.updatedate = date;

								// a journal entry must be added - TO BE DONE

								// an entity must be inserted in the storage
								storage.push(entity);

							}
							// if the name is not valid, just return the default
							// id value (_undefiend)

							// the id must be returned
							return id;
						};

						this.getNextId = getNextId;
						this.insert = insert;
						this.isValid = isValid;
					});
}(angular));