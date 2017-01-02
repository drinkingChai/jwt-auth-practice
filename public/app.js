angular.module('JwtExample', [], function config($httpProvider) {
  $httpProvider.interceptors.push('AuthInterceptor');
})
  .factory('RandomUserFactory', function($http) {
    return {
      getUser: function() {
        return $http.get('/random-user');
      }
    }
  })
  .factory('UserFactory', function($http, AuthTokenFactory, $q) {
    return {
      login: function(username, password) {
        return $http.post('/login', {
          username: username,
          password: password
        }).then(function success(response) {
          AuthTokenFactory.setToken(response.data.token);
          return response;
        })
      },
      logout: function() {
        AuthTokenFactory.setToken();
      },
      getUser: function() {
        if (AuthTokenFactory.getToken()) {
          return $http.get('/me');
        } else {
          return $q.reject({ data: 'client has no auth token' });
        }
      }
    }
  })
  .factory('AuthTokenFactory', function($window) {
    var store = $window.localStorage;
    var key = 'auth-token';

    return {
      getToken: function() {
        return store.getItem(key);
      },
      setToken: function(token) {
        if (token) {
          store.setItem(key, token);
        } else {
          store.removeItem(key);
        }
      }
    }
  })
  .factory('AuthInterceptor', function AuthInterceptor(AuthTokenFactory) {
    return {
      request: function(config) { //addToken
        var token = AuthTokenFactory.getToken();
        if (token) {
          config.headers = config.headers || {};
          config.headers.Authorization = 'Bearer ' + token;
        }

        return config;
      }
    }
  })
  .controller('MainController', function(RandomUserFactory, UserFactory) {
    var vm = this;

    // initializatioin
    UserFactory.getUser().then(function success(response) {
      vm.user = response.data;
    });

    vm.getRandomUser = function() {
      RandomUserFactory.getUser().then(function success(response) {
        vm.randomUser = response.data;
      }, handleError)
    }

    vm.login = function(username, password) {
      UserFactory.login(username, password).then(function success(response) {
        vm.user = response.data.user;
        // alert(response.data.token);
      }, handleError)
    }

    vm.logout = function() {
      UserFactory.logout();
      vm.user = null;
    }

    var handleError = function(response) {
      alert('Error: ' + response.data);
    }
  })
