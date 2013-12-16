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
						 * Function that returns a storage by name and id.
						 * 
						 * @param name -
						 *            Storage name.
						 * 
						 * @param entity -
						 * 			 an entity
						 * @return  - boolean that indicates if the operation was successful
						 */
						var update = function update(name,entity){
							var result = false;
							
							var entityCopy = get(name,entity.id);
							
							if(isValid(name)){
								if(entityCopy){									
									if(!angular.equals(entity,entityCopy)){
										//TODO Journal
										
										angular.extend(entityCopy,entity);
									
										var storage = data[name];
										
										for(var idx in storage){
											if (storage[idx].id === entity.id) {
												storage[idx] = entityCopy;
												result = true;
												break;
											}
										}
									}
								}else{
									$log.error('StorageService.update : -Could not find a entity in '+name+' to update, id='+entity.id);
								}
								
							}else{
								$log.error('StorageService.update: -Invalid storage, name='+name);
							}
							return result;
						};
						 
						
						/**
						 * Function that returns a storage by name and id.
						 * 
						 * @param name -
						 *            Storage name.
						 * 
						 * @param id -
						 * 			 an id
						 * @return  - The entity that have the id == id.
						 */
						var get = function get(name, id) {

							var result = _undefined;
							
							// Given a valid storage name
							if (isValid(name)) {
								var storage = data[name];
								
								for (var idx in storage) {
									var entity = storage[idx];
									
									if (entity.id === id) {
										result = angular.copy(entity);
										break;
									}
								}
								$log.error('StorageService.get: -Receivable not found, id='+ id);
							
							}
							return result;
						};

						/**
						 * Function that returns a storage by name.
						 * 
						 * @param name -
						 *            Storage name.
						 * @return Array - The storage asked for.
						 */
						var list = function list(name) {
							var result = _undefined;
							if (isValid(name)) {
								var storage = data[name];
								var copylist = angular.copy(storage);
								result = copylist;
							}
							return result;
						};

						/**
						 * Function that returns if the name is a valid storage.
						 * 
						 * @param name -
						 *            Storage name.
						 * @return boolean - If the storage exists or not.
						 */
						var isValid = function isValid(name) {
							var storage = data[name];
							var result = false;
							// if the name exists in the dataProvider
							// if the attribute is an array
							if (storage instanceof Array) {
								result = true;
							} else {
								if (storage === _undefined) {
									$log
											.error('StorageService.isValid: -Invalid storage name, name='
													+ name);
								} else {
									$log
											.error('StorageService.isValid: -Invalid storage, name='
													+ name);
								}
								result = false;
							}
							return result;
						};

						/**
						 * Function to return the next unique id.
						 * 
						 * @param name -
						 *            Storage name
						 * @return Number - Next id
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
						 * Function to insert an entity on a specific storage
						 * 
						 * @param name -
						 *            Storage name
						 * @param entity -
						 *            Entity to be inserted
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
						this.get = get;
						this.insert = insert;
						this.isValid = isValid;
						this.list = list;
						this.update = update;
					});
}(angular));