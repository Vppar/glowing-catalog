(function (angular) {

    angular.module('tnt.catalog.sync.driver', [
        'tnt.catalog.sync.firebase'
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

                var firebaseSyncStartTime = null;
                var firebaseSyncStartTime2 = null;

                if (isConnected()) {
                    setFirebaseReferences(localStorage.firebaseUser);
                }

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

                        new FirebaseSimpleLogin(baseRef, function (err, user) {
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
                        }).login('password', {
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

                                syncing ? $rootScope.$broadcast('FirebaseBusy', syncing)
                                    : $rootScope.$broadcast('FirebaseIdle');
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

            }
        ]);
}(angular));
