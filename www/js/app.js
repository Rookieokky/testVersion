// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('starter', ['ionic', 'firebase'])

app.factory("Items", function($firebaseArray) {
    var itemsRef = new Firebase("https://yalala.firebaseio.com/items");
    return $firebaseArray(itemsRef);
})

app.factory("Auth", function($firebaseAuth) {
    var usersRef = new Firebase("https://yalala.firebaseio.com/");
    return $firebaseAuth(usersRef);
})

app.controller("ListCtrl", function($scope, $ionicListDelegate, Items) {

    $scope.items = Items;

    $scope.purchaseItem = function(item) {
        var itemRef = new Firebase("https://yalala.firebaseio.com/items/" + item.$id);
        itemRef.child('status').set('purchased');
        $ionicListDelegate.closeOptionButtons();
    };

});

app.controller("ProfileCtrl", function($scope, $state, Auth) {
    var usersRef = new Firebase("https://yalala.firebaseio.com/");
    var authData = usersRef.getAuth();
    var isNewUser = true;

    $scope.login = function() {
        Auth.$authWithOAuthPopup("facebook");
    };

    $scope.logout = function() {
        Auth.$unauth();
    };

    Auth.$onAuth(function(authData) {
        if (authData && isNewUser) {
            // save the user's profile into the database so we can list users,
            // use them in Security and Firebase Rules, and show profiles
            usersRef.child("users").child(authData.uid).set({
                provider: authData.provider,
                name: getName(authData)
            });
        }
        if (authData === null) {
            console.log("Not logged in yet");
        } else {
            console.log("Logged in as", authData.uid);

        }
        $scope.authData = authData; // This will display the user's name in our view
    });

    // find a suitable name based on the meta info given by facebook
    function getName(authData) {
        switch(authData.provider) {
            case 'facebook':
                return authData.facebook.displayName;
        }
    }

    // Add item to firebase and add reference to the user
    $scope.addItem = function() {
        var authData = usersRef.getAuth();
        var name = $('[data-action=nameInput]').val();
        if (name) {
            $scope.items.$add({
                "name": name,
                "by": authData.uid
            });
        }
    };
});

app.config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('tab/home')
    $stateProvider

    // setup an abstract state for the tabs directive
    .state('tab', {
        url: '/tab',
        abstract: true,
        templateUrl: 'templates/tabs.html'
    })
    .state('tab.home', {
        url: '/home',
        views: {
            'tab-home': {
                templateUrl: 'templates/list.html',
                controller: 'ListCtrl',
                authRequired: true
            }
        }
    })
    .state('tab.add', {
        url: '/add',
        views: {
            'tab-add': {
                templateUrl: 'templates/add.html',
                controller: 'AddCtrl',
                authRequired: true
            }
        }
    })
    .state('tab.profile', {
        url: '/profile',
        views: {
            'tab-profile': {
                templateUrl: 'templates/profile.html',
                authRequired: true
            }
        }
    })
});