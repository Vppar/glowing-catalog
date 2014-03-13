(function (angular) {
    'use strict';

    angular.module('tnt.catalog.sync.driver', [
        'tnt.catalog.sync.firebase',
        'tnt.catalog.config'
    ]).service(
        'SyncDriver',
        [
            '$rootScope',
            '$log',
            '$q',
            'Firebase',
            'FirebaseSimpleLogin',
            'CatalogConfig',
            function SyncDriver ($rootScope, $log, $q, Firebase, FirebaseSimpleLogin, CatalogConfig) {

                var baseRef = new Firebase(CatalogConfig.firebaseURL);
                var userRef = null;
                var journalRef = null;
                var syncingFlagRef = null;

                var auth = null;

                var firebaseSyncStartTime = null;
                var firebaseSyncStartTime2 = null;

                $rootScope.$on('SyncStop', function () {
                    if (syncingFlagRef) {
                        syncingFlagRef.remove();
                    }
                });

                function isFirebaseBusy () {
                    return !!firebaseSyncStartTime &&
                        firebaseSyncStartTime !== firebaseSyncStartTime2;
                }
                this.isFirebaseBusy = isFirebaseBusy;

                // Uses Firebase's connected ref...
                function isConnected () {
                    return !!localStorage.firebaseUser;
                }
                this.isConnected = isConnected;

                this.lock = function (successCb, failureCb) {
                    $log.debug('Trying to lock the user journal for synchronizing this device');
                    syncingFlagRef.transaction(function (currentValue) {
                        // Ooops! Another device got our slot! Abort
                        // synchronization!
                        if (!currentValue) {
                            return Firebase.ServerValue.TIMESTAMP;
                        }
                    }, function (err, committed, snapshot) {
                        if (err) {
                            failureCb(err);
                        } else {
                            if (committed) {
                                firebaseSyncStartTime2 = snapshot.val();
                                $log.debug('Firebase user journal locked!');
                                successCb(snapshot.val());
                            } else {
                                failureCb('Firebase already being synced!');
                            }
                        }
                    });
                };

                function setFirebaseReferences (username) {
                    userRef = baseRef.child('users').child(username.replace(/\.+/g, '_'));
                    journalRef = userRef.child('journal');
                    syncingFlagRef = userRef.child('syncing');
                }


                function changePassword(email, oldPassword, newPassword) {
                    if (!auth) {
                        return $q.reject('Not connected to Firebase!');
                    }

                    var deferred = $q.defer();

                    auth.changePassword(email, oldPassword, newPassword, function (err) {
                        if (!err) {
                            deferred.resolve(true);
                        } else {
                            $log.debug('Failed to change password:', err);
                            deferred.reject(err);
                        }
                    });

                    return deferred.promise;
                }

                this.changePassword = changePassword;



                // TODO implement rememberMe
                //
                // FIXME Firebase authentication expects a single callback to
                // handle
                // all authentication state changes. Right now we create two
                // instances of FirebaseSimpleLogin() to use 2 different
                // callbacks (one for login, another for logout). This is
                // bothering
                // me and I hope to fix this later to use a single callback.
                this.login =
                    function (username, password) {
                        var deferred = $q.defer();

                        auth = new FirebaseSimpleLogin(baseRef, function (err, user) {
                            if (err) {
                                $log.debug('Firebase authentication error (login cb)', err);
                                deferred.reject(err);
                            } else if (user) {
                                $log.debug('Logged in to Firebase as ' + username);
                                localStorage.firebaseUser = username;
                                setFirebaseReferences(username);

                                // We need a unique deviceId! Get one from the
                                // server!
                                if (!localStorage.deviceId) {
                                    $log.debug('This device has no ID! Get one from the server.');
                                    userRef.child('lastDeviceId').transaction(
                                        function (currentValue) {
                                            if (!currentValue) {
                                                currentValue = 0;
                                            }
                                            return currentValue + 1;
                                        },
                                        function (err, committed, snapshot) {
                                            if (err) {
                                                $log.debug('Failed to update the device id!', err);
                                                deferred.reject(err);
                                            } else if (committed) {
                                                localStorage.deviceId = snapshot.val();
                                                deferred.resolve(user);
                                            }
                                        });
                                } else {
                                    // We already have a deviceId
                                    deferred.resolve(user);
                                }
                            } else {
                                delete localStorage.firebaseUser;
                                $rootScope.$broadcast('FirebaseDisconnected');
                            }
                        });
                        
                        auth.login('password', {
                            email : username,
                            password : password
                        });

                        deferred.promise.then(function () {
                            // Get the GoPay token from Firebase
                            userRef.child('account').child('gpToken').on(
                                'value',
                                function (nameSnapshot) {
                                    if (nameSnapshot) {
                                        localStorage.gpToken = nameSnapshot.val();
                                    } else {
                                        delete localStorage.gpToken;
                                    }
                                });

                            syncingFlagRef.onDisconnect().remove();

                            syncingFlagRef.on('value', function (snapshot) {
                                var syncing = snapshot.val();
                                firebaseSyncStartTime = syncing || null;

                                if (syncing) {
                                    $rootScope.$broadcast('FirebaseBusy', syncing);
                                } else {
                                    $rootScope.$broadcast('FirebaseIdle');
                                }
                            });

                            // Broadcast the event once everything is ready
                            $rootScope.$broadcast('FirebaseConnected');
                        });

                        var connectedRef = baseRef.child('.info').child('connected');
                        connectedRef.on('value', function (snap) {
                            if (snap.val() === false) {
                                delete localStorage.gpToken;
                            }
                        });

                        return deferred.promise;
                    };

                this.logout = function () {
                    var deferred = $q.defer();

                    new FirebaseSimpleLogin(baseRef, function (err, user) {
                        if (err) {
                            $log.debug('Firebase authentication error (logout cb)', err);
                            deferred.reject(err);
                        } else if (!user) {
                            delete localStorage.firebaseUser;
                            delete localStorage.gpToken;
                            $log.debug('Logged out from Firebase!');
                            deferred.resolve('Logout successfull');
                        }
                    }).logout();

                    return deferred.promise;
                };

                this.registerSyncService =
                    function (SyncService) {
                        journalRef.startAt(SyncService.getLastSyncedSequence() + 1).on(
                            'child_added',
                            function (snapshot) {
                                var entry = snapshot.val();
                                $rootScope.$broadcast('EntryReceived', entry);
                            });
                    };

                this.save = function (entry) {
                    var deferred = $q.defer();

                    if (journalRef) {
                        journalRef.child(entry.sequence).transaction(function (currentValue) {
                            if (currentValue === null) {
                                entry.synced = new Date().getTime();

                                return {
                                    '.value' : entry,
                                    '.priority' : entry.sequence
                                };
                            }
                        }, function (error, committed) {
                            if (committed) {
                                // Entry stored
                                deferred.resolve();
                            } else if (error) {
                                // Failed to store entry
                                deferred.reject(error);
                            } else {
                                // Entry already exists
                                var message = 'Duplicate entry sequence!';
                                deferred.reject(message);
                            }
                        });
                    }

                    return deferred.promise;
                };



                if (isConnected()) {
                    setFirebaseReferences(localStorage.firebaseUser);
                }





                //////////////////////////////////////////////////
                // WarmUp
                //////////////////////////////////////////////////

                /**
                 * Initializes the whole warm up watchers and ensures the local
                 * warm up data is always up-to-date (unless there's no internet
                 * connection, obviously).
                 *
                 * NOTE: This was exposed just to make it easier to test.
                 *
                 * @see {@code init()} below.
                 */
                this._watchWarmupData = (function () {

                    /**
                     * Sets a listener in the Firebase reference for the
                     * warmup data's timestamp, keeping the warmup data
                     * updated across all devices.
                     *
                     * @param {Object} userRef A Firebase reference to the
                     *    user data stored in Firebase.
                     */
                    function _setRemoteTimestampListener(warmupRef) {
                        warmupRef.child('timestamp')
                            .on('value', function (snapshot) {
                                var timestamp = snapshot.val();
                                if (parseInt(localStorage.warmupTimestamp) !== timestamp) {
                                    _updateWarmupData(warmupRef);
                                }
                            });
                    }


                    /**
                     * Gets the warmup data from Firebase and updates the local
                     * data. Beware!!! DOES NOT replay the new data to the
                     * keepers.
                     *
                     * @param {Object} warmupRef Firebase reference to the
                     *    warmup data.
                     */
                    function _updateWarmupData(warmupRef) {
                        warmupRef.once('value', function (snapshot) {
                                var warmup = snapshot.val();
                                _setLocalWarmupData(warmup.data);
                                _setLocalWarmupTimestamp(warmup.timestamp);
                                $rootScope.$broadcast('WarmupDataUpdated');
                            });
                    }


                    /**
                     * Sets the warmup data in local storage.
                     * @param {*} data The data to be stored locally.
                     */
                    function _setLocalWarmupData(data) {
                        localStorage.warmupData = JSON.stringify(data);
                    }


                    /**
                     * Sets the timestamp for the current local warmup data.
                     * @param {Number} timestamp
                     */
                    function _setLocalWarmupTimestamp(timestamp) {
                        localStorage.warmupTimestamp = timestamp;
                    }


                    /**
                     * Initializes the warm up data listeners that keep the
                     * local warmup data updated.
                     * @param {Object} userRef Firebase reference to the user
                     *    data.
                     */
                    function _init(userRef) {
                        if (!userRef) {
                            $log.error('Not connected to Firebase!');
                            return;
                        }

                        var warmupRef = userRef.child('warmup');
                        _setRemoteTimestampListener(warmupRef);
                    }

                    return _init;
                })();
            }
        ]);
}(angular));
