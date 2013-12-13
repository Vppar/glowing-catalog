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

						var isValid = function() {
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