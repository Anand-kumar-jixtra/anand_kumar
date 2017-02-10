var role;
var myApp = angular.module('myApp', ["ngRoute"])

.config(function($routeProvider, $locationProvider) {
        $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
            });
        $routeProvider.when("/", {
            templateUrl : "templates/login.html",
            controller : "LoginCtrl"
        }).when("/home", {
            templateUrl : "templates/home.html",
            controller : "HomeCtrl"
        }).when("/forgotPassword", {
            template : '<div align="center" style="margin-top: 20px" ng-controller="ForgotPwdCtrl" >Forgot Password<br>'+
                        '<input style="margin-top: 20px" ng-model="email" class="input" type="email" placeholder="Email" required /><br>'+
                        ' <button  ng-click="submit()" class="btnGo"><img ng-src="images/goImage.jpeg" class="goBtnImage"/>'+
                        '</div>',
            controller : "ForgotPwdCtrl"
        }).when("/resetPwd/:token", {
            // template : '<div align="center" style="margin-top: 20px" ng-controller="ResetPwdCtrl" >'+
            //             '<input ng-model="newPwd" class="input" type="password" placeholder="New Password" required /><br>'+
            //             '<input ng-model="confirmPwd" style="margin-top: 20px"  class="input" type="password" placeholder="Confirm Password" required /><br>'+
            //             ' <button  ng-click="submit()" class="btnGo"><img ng-src="images/goImage.jpeg" class="goBtnImage"/>'+
            //             '</div>',
            templateUrl : "templates/resetPwd.html",
            controller :  "ResetPwdCtrl"          
        }).when("/signUp", {
            templateUrl : "templates/signUp.html",
            controller : "SignUpCtrl"
        });
})
.controller('LoginCtrl', ['$scope', '$http', '$location', function ($scope, $http, $location) {

$scope.signIn = function(){
	var user = { username: $scope.username,
				       password: $scope.password

				};
 var message;
        if (isEmptyString($scope.username)) {
            message = "Username cannot be left empty.";
        }
        else if (isEmptyString($scope.password)) {
            message = "Password cannot be left empty.";
        }
        if (isNonEmptyString(message)) {
            alert(message);
        }else{
        	  $http.post("./user/login", user).then(function(response){
              if(response){
                  // console.log(response.data.role);
                  role = response.data.role;
                 console.log(role);
                 $location.path('/home');
              }
     
        
   });
        } 

 
};

$scope.signUp = function(){
    $location.path('/signUp');
};

$scope.forgotPwd = function(){
    $location.path('/forgotPassword');
};
}])

.controller('HomeCtrl', ['$scope', function ($scope) {
$scope.role = role;
}])

.controller('SignUpCtrl', ['$scope', '$http', '$location', function ($scope, $http, $location) {
    
        $scope.signUpUser = function(){
              // var user = config.user;
              // user = $scope;
              // console.log(user);
            var user = { username: $scope.username,
                         email: $scope.email,
                         age: $scope.age,
                         gender: $scope.gender,
                         role: $scope.role,
                         password: $scope.password
                };
 var message;
        if (isEmptyString($scope.username)) {
            message = "Username cannot be left empty.\n";
        }
         else if (isEmptyString($scope.email)) {
            message = "Email is either empty or invalid.";
        }
         else if (isEmptyString($scope.age)) {
            message = "Age is either empty or above specified limit.";
        }
         else if (isEmptyString($scope.gender)) {
            message = "Gender is not selected.";
        }
         else if (isEmptyString($scope.role)) {
            message = "Role is not selected.";
        }
        else if (isEmptyString($scope.password)) {
            message = "Password cannot be left empty.";
        }
        else if (isEmptyString($scope.confirmPassword)) {
            message = "Confirm Password cannot be left empty.";
        }
         else if (!isMatching($scope.confirmPassword, $scope.password)) {
            message = "Passwords do not match.";
        }
        if (isNonEmptyString(message)) {
            alert(message);
        }else{
              $http.post("./user/register", user).then(function(response){
              if(response){
                 // console.log(response);
                  role = response.data.role;
                 console.log(role);
                 $location.path('/home');
              }
     
        
   });
        } 
    };

}])

.controller('ForgotPwdCtrl', ['$scope', '$http', '$location', function ($scope, $http, $location) {
	$scope.submit = function(){
        var email = {email: $scope.email};

        if (isEmptyString($scope.email)) {
            alert("Email is either empty or invalid.");
        }
        else{
              $http.post("./user/forgotPassword", email).then(function(response){
              if(response){
                 // console.log(response);
                 alert("An e-mail has been sent with further instructions.");
                 $location.path('/');
              }
   });
        } 

 
};

}])

.controller('ResetPwdCtrl', ['$scope', '$http', '$location', function ($scope, $http, $location, $route, $routeParams) {

       $scope.submit = function(){
        var password = {password: $scope.password};
        var message;
        if (isEmptyString($scope.password)) {
            message = alert("Password cannot be left empty.");
        }
        else if (isEmptyString($scope.confirmPassword)) {
            message = "Confirm Password cannot be left empty.";
        }
        else if (!isMatching($scope.confirmPassword, $scope.password)) {
            message = "Passwords do not match.";
        }
        if (isNonEmptyString(message)) {
            alert(message);
        }
        else{
              $http.post("./user/resetPwd/:token"+$scope.token, password).then(function(response){
              if(response){
                 // console.log(response);
                 $location.path('/home');
              }
     
        
   });
        } 
 
};
}]);


