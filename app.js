var app = angular.module('thebitos-3312', ['firebase','ngRoute','ngCookies']);

// for ngRoute
app.run(["$rootScope", "$location", function($rootScope, $location) {
  $rootScope.$on("$routeChangeError", function(event, next, previous, error) {
    // We can catch the error thrown when the $requireSignIn promise is rejected
    // and redirect the user back to the home page
    if (error === "AUTH_REQUIRED") {
      $location.path("/");
    }
  });
}]);

app.run(['$http', '$cookies', function($http, $cookies) {
  $http.defaults.headers.post['X-CSRFToken'] = $cookies.csrftoken;
}]);

app.config(['$httpProvider', function($httpProvider) {
  $httpProvider.defaults.withCredentials = true;
}])

app.config(["$routeProvider", function($routeProvider) {
  $routeProvider
  .when('/', {
    templateUrl: 'init.html',
    controller: 'UserSessionCtrl'
    })
  .when("/dashboard", {
    // the rest is the same for ui-router and ngRoute...
    controller: "DashboardSessionCtrl",
    templateUrl: "dashboard.html",
    resolve: {
      // controller will not be loaded until $waitForSignIn resolves
      // Auth refers to our $firebaseAuth wrapper in the factory below
      "currentAuth": ["Auth", function(Auth) {
        // $waitForSignIn returns a promise so the resolve waits for it to complete
        return Auth.$requireSignIn();
      }]
    }
  }).when("/crypt", {
    // the rest is the same for ui-router and ngRoute...
    controller: "CryptCtrl",
    templateUrl: "list.html",
    resolve: {
      // controller will not be loaded until $requireSignIn resolves
      // Auth refers to our $firebaseAuth wrapper in the factory below
      "currentAuth": ["Auth", function(Auth) {
        // $requireSignIn returns a promise so the resolve waits for it to complete
        // If the promise is rejected, it will throw a $routeChangeError (see above)
        return Auth.$requireSignIn();
      }]
    }
  }).when("/membership", {
    // the rest is the same for ui-router and ngRoute...
    controller: "",
    templateUrl: "subscription.html",
    resolve: {
      // controller will not be loaded until $requireSignIn resolves
      // Auth refers to our $firebaseAuth wrapper in the factory below
      "currentAuth": ["Auth", function(Auth) {
        // $requireSignIn returns a promise so the resolve waits for it to complete
        // If the promise is rejected, it will throw a $routeChangeError (see above)
        return Auth.$requireSignIn();
      }]
    }
  }).when("/profile", {
    // the rest is the same for ui-router and ngRoute...
    controller: "AccountUserCtrl",
    templateUrl: "user.html",
    resolve: {
      // controller will not be loaded until $requireSignIn resolves
      // Auth refers to our $firebaseAuth wrapper in the factory below
      "currentAuth": ["Auth", function(Auth) {
        // $requireSignIn returns a promise so the resolve waits for it to complete
        // If the promise is rejected, it will throw a $routeChangeError (see above)
        return Auth.$requireSignIn();
      }]
    }
  }).otherwise({
    redirectTo: '/'
})
}]);

app.factory("Auth", ["$firebaseAuth",
  function($firebaseAuth) {
    return $firebaseAuth();
  }
]);


app.factory('dashboardFactory', function($http){
  var pathbitDays = "http://localhost:3000/thebitos/dashboard/bit/day";
  var pathbitYear = "http://localhost:3000/thebitos/dashboard/bit/year";
  var pathbitYears = "http://localhost:3000/thebitos/dashboard/bit/years";

  var pathEtherumDays = "http://localhost:3000/thebitos/dashboard/ethe/day";
  var pathEtherumYear = "http://localhost:3000/thebitos/dashboard/ethe/year";
  var pathEtherumYears = "http://localhost:3000/thebitos/dashboard/ethe/years";

  var pathLiteDay = "http://localhost:3000/thebitos/dashboard/lite/day";
  var pathLiteYear = "http://localhost:3000/thebitos/dashboard/lite/year";
  var pathLiteYears = "http://localhost:3000/thebitos/dashboard/lite/years";

  var pathCoins = "http://localhost:3000/thebitos/dashboard/";
  var pathCoinsUltimate = "http://localhost:3000/thebitos/dashboard/ultimate";

  var pathBitNow =  "https://api.bitso.com/v3/ticker/";

	return {
		//Login
		posts : function(){ //Retornara la lista de posts
			global = $http.get(pathbitDays);
			return global;
    },
    postsyear : function(){ //Retornara la lista de posts
			global = $http.get(pathbitYear);
			return global;
    },
    postsday : function(){ //Retornara la lista de posts
			global = $http.get(pathbitYears);
			return global;
    },
    bitNow: function(){
      global = $http.get(pathBitNow);
			return global;
    },
    coinU: function(){
      global = $http.get(pathCoinsUltimate);
			return global;
    },
    coins: function(){
      global = $http.get(pathCoinsUltimate);
			return global;
    }
	}
});

app.directive("c3Graph", function() {
  var linkFunction = function(scope) {
      c3.generate({
          bindto: '#' + scope.bindToId,
          data: {
              columns: scope.data
          }
      });
  };

  return {
      link: linkFunction,
      scope: {
          bindToId: '@',
          data: '='
      }
  };
});

app.controller("UserSessionCtrl", ["$log", "$window", "$rootScope", "$scope", "$firebaseArray", "$q", "$controller", "dashboardFactory", function ($log, $window, $rootScope, $scope, $firebaseArray, $q, $controller, dashboardFactory) {

    
  var dbRef = firebase.database().ref('user');
  $scope.users = $firebaseArray(dbRef);

  $scope.initSession = function(data){
    const promise = firebase.auth().signInWithEmailAndPassword(data.email, data.password)
    .then(user => {
        var url = "http://" + $window.location.host + "/thebitos/#!/dashboard/";
        $log.log(url);
        $window.location.href = url;
        console.log('Ya entro');
       // $location.path("/#!/home");
        //location = "http://localhost/browserID/#!/home";
    })
    .catch(function(error) {
      var errorCode = error.code;
      var errorMessage = error.message;
      location.reload(true);
    });
    promise.catch(e => console.log(e.message));
  }

  $rootScope.logoutSession = function(){
    firebase.auth().signOut().then(function() {
      location.reload(true);
        var user = firebase.auth().currentUser;
        var name, email, photoUrl, uid, emailVerified;
          if (user != null) {
            name = user.displayName;
            email = user.email;
            photoUrl = user.photoURL;
            emailVerified = user.emailVerified;
            uid = user.uid;  // The user's ID,
            console.log(email)
          }
    }).catch(function(error) {
      //error
    });
  }

  $rootScope.dataSession = function(){
    var user = firebase.auth().currentUser;
    var name, email, photoUrl, uid, emailVerified;
    console.log('estas logeueado');
      if (user != null) {
        name = user.displayName;
        email = user.email;
        photoUrl = user.photoURL;
        emailVerified = user.emailVerified;
        uid = user.uid;  // The user's ID,
        console.log(name);
        console.log(photoUrl);
        console.log(email);
      }
  }


  $scope.addObjectUser = function(datareg){
    var dataregInfo = {}
    dataregInfo.username = datareg.username;
    dataregInfo.birthdate = datareg.birthdate;
    dataregInfo.password = datareg.password;
    dataregInfo.email = datareg.email;
    //dataregInfo.email = currentAuth.email;

    $scope.users.$add(dataregInfo)  
    .then(function(ref){
      firebase.auth().createUserWithEmailAndPassword(datareg.email, datareg.password)
      .then(function(){
        var url = "http://" + $window.location.host + "/thebitos/";
        $log.log(url);
        $window.location.href = url;
        console.log('Ya entro');
      }).catch(function(error) {
        var errorCode = error.code;
        var errorMessage = error.message;
        // ...
      });
    })
    .catch(function(err){
      console.log('No se podido ingresar un estudiante')
      console.log(err)
    });
    
  }


  $scope.datareg = null;

}]);
/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////

app.controller("DashboardSessionCtrl", ["$log", "$window", "$rootScope", "$scope", "$firebaseArray", "$q", "$controller", "dashboardFactory", function ($log, $window, $rootScope, $scope, $firebaseArray, $q, $controller, dashboardFactory) {
  let cont1 = [0];
  let init = [];
  let cont2 = [0];
  let prob1 = [0];
  let prob2 = [0];
  var qq = [];

  

  dashboardFactory.coins().then(function(data){
    qq = data.data[0].payload[0];
    exportardatos(qq);
  }).catch(function(){

  });

  



  function exportardatos(qq){
    $scope.Customers = qq;
    console.log($scope.Customers);
    return $scope.Customers;
  } 



  $scope.Export = function () {
      $("#tblCustomers").table2excel({
          filename: "Table.xls"
      });
  }
  

  dashboardFactory.coinU().then(function(data){
    init=data.data[3].payload[0].volume;
    console.log(init);
    let index;
    for (index = 0; index < data.data.length; index++) {
      if(data.data[index].payload[0].volume>init){
        prob1[cont1]=data.data[index].payload[0].volume;
        cont1++
        console.log(prob1);
        
      }else{
        prob2[cont2]=data.data[index].payload[0].volume;
        cont2++
        console.log(prob2);
      }
    }
    future(1,cont1,index);
  }).catch(function(){

  });

  function future(tiempo,chi,t) {
    let chit = (chi/7)*t;
    let chitn = -Math.abs(chit);
    let total = Math.pow(chit, tiempo)*Math.pow(Math.E, chitn)/factorial(tiempo);
    console.log(total);
    let tt = parseInt(total*100, 10);
    $scope.future = tt;
    return console.log(tt);
  }
  /*let tiempo = 2;
  //Incremento Por Tiempo definido por el usuario;
  let chi=5/7;
  //Periodo de tiempo, en este caso 1 día;
  let t=1;
  let chit = chi*t;
  let chitn = -Math.abs(chit);*/

  function factorial (tiempo) {
    var total = 1; 
    for (i=1; i<=tiempo; i++) {
      total = total * i; 
    }
    return total; 
  }

  /*let total = Math.pow(chit, tiempo)*Math.pow(Math.E, chitn)/factorial(tiempo);

  console.log(total);
  let tt = total*100;
  console.log(tt);
  
  console.log('Valor de ⅇ: ', Math.E);*/





     // console.log(data.data);
      //var coins = data;
//////////////////////////////////////////////////////////////////////////////////////////

/*!

 =========================================================
 * Material Dashboard Dark Edition - v2.1.0
 =========================================================

 * Product Page: https://www.creative-tim.com/product/material-dashboard-dark
 * Copyright 2018 Creative Tim (http://www.creative-tim.com)

 * Coded by www.creative-tim.com

 =========================================================

 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

 */

(function() {
  isWindows = navigator.platform.indexOf('Win') > -1 ? true : false;

  if (isWindows) {
    // if we are on windows OS we activate the perfectScrollbar function
    $('.sidebar .sidebar-wrapper, .main-panel').perfectScrollbar();

    $('html').addClass('perfect-scrollbar-on');
  } else {
    $('html').addClass('perfect-scrollbar-off');
  }
})();


var breakCards = true;

var searchVisible = 0;
var transparent = true;

var transparentDemo = true;
var fixedTop = false;

var mobile_menu_visible = 0,
  mobile_menu_initialized = false,
  toggle_initialized = false,
  bootstrap_nav_initialized = false;

var seq = 0,
  delays = 80,
  durations = 500;
var seq2 = 0,
  delays2 = 80,
  durations2 = 500;

$(document).ready(function() {

  $('body').bootstrapMaterialDesign();

  $sidebar = $('.sidebar');

  md.initSidebarsCheck();

  window_width = $(window).width();

  // check if there is an image set for the sidebar's background
  md.checkSidebarImage();

  //    Activate bootstrap-select
  if ($(".selectpicker").length != 0) {
    $(".selectpicker").selectpicker();
  }

  //  Activate the tooltips
  $('[rel="tooltip"]').tooltip();

  $('.form-control').on("focus", function() {
    $(this).parent('.input-group').addClass("input-group-focus");
  }).on("blur", function() {
    $(this).parent(".input-group").removeClass("input-group-focus");
  });

  // remove class has-error for checkbox validation
  $('input[type="checkbox"][required="true"], input[type="radio"][required="true"]').on('click', function() {
    if ($(this).hasClass('error')) {
      $(this).closest('div').removeClass('has-error');
    }
  });

});

$(document).on('click', '.navbar-toggler', function() {
  $toggle = $(this);

  if (mobile_menu_visible == 1) {
    $('html').removeClass('nav-open');

    $('.close-layer').remove();
    setTimeout(function() {
      $toggle.removeClass('toggled');
    }, 400);

    mobile_menu_visible = 0;
  } else {
    setTimeout(function() {
      $toggle.addClass('toggled');
    }, 430);

    var $layer = $('<div class="close-layer"></div>');

    if ($('body').find('.main-panel').length != 0) {
      $layer.appendTo(".main-panel");

    } else if (($('body').hasClass('off-canvas-sidebar'))) {
      $layer.appendTo(".wrapper-full-page");
    }

    setTimeout(function() {
      $layer.addClass('visible');
    }, 100);

    $layer.click(function() {
      $('html').removeClass('nav-open');
      mobile_menu_visible = 0;

      $layer.removeClass('visible');

      setTimeout(function() {
        $layer.remove();
        $toggle.removeClass('toggled');

      }, 400);
    });

    $('html').addClass('nav-open');
    mobile_menu_visible = 1;

  }

});

// activate collapse right menu when the windows is resized
$(window).resize(function() {
  md.initSidebarsCheck();

  // reset the seq for charts drawing animations
  seq = seq2 = 0;

  setTimeout(function() {
    md.initDashboardPageCharts();
  }, 500);
});



md = {
  misc: {
    navbar_menu_visible: 0,
    active_collapse: true,
    disabled_collapse_init: 0
  },

  checkSidebarImage: function() {
    $sidebar = $('.sidebar');
    image_src = $sidebar.data('image');

    if (image_src !== undefined) {
      sidebar_container = '<div class="sidebar-background" style="background-image: url(' + image_src + ') "/>';
      $sidebar.append(sidebar_container);
    }
  },

  initSidebarsCheck: function() {
    if ($(window).width() <= 991) {
      if ($sidebar.length != 0) {
        md.initRightMenu();
      }
    }
  },

  initDashboardPageCharts: function() {

    if ($('#dailySalesChart').length != 0 || $('#completedTasksChart').length != 0 || $('#websiteViewsChart').length != 0) {
      /* ----------==========     Daily Sales Chart initialization    ==========---------- */
      dashboardFactory.posts()
      .then(function(data){
        console.log(data.data);
        var element2 = [0];
        var coin = [];
        var highs = [];
        var i = 0;
        for (var index = 0; index < data.data.length; index++) {
          
           //coin = data.data[index].payload[index].volume;
           //console.log(data.data[index].payload[index].volume);
          
          var element = [data.data[index].payload[0].created_at];
          if(element[0]==element2[0]){
            console.log(element);
          }else{
            coin[i] = data.data[index].payload[0].low;  
            highs[i] = data.data[index].payload[0].high;  
            //console.log(coin);
        }
        i++  
        element2 = element;
        
      }
      console.log(coin);
      dataDailySalesChart = {
        labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
        series: [
          [coin[0], coin[1], coin[2], coin[3], coin[4], coin[5], coin[6]],
          [highs[0], highs[1], highs[2], highs[3], highs[4], highs[5], highs[6]]                   
        ]
      };

      optionsDailySalesChart = {
        lineSmooth: Chartist.Interpolation.cardinal({
          tension: 0
        }),
        low: coin[0],
        high: highs[6], // creative tim: we recommend you to set the high sa the biggest value + something for a better look
        chartPadding: {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0
        },
      }

      var dailySalesChart = new Chartist.Line('#dailySalesChart', dataDailySalesChart, optionsDailySalesChart);

      md.startAnimationForLineChart(dailySalesChart);


      })
      .catch(function(){

      });
      /* ----------==========     Completed Tasks Chart initialization    ==========---------- */
      dashboardFactory.postsyear()
      .then(function(data){
        console.log(data.data);
        var element2 = [0];
        var coin = [];
        var highs = [];
        var i = 0;
        for (var index = 0; index < data.data.length; index++) {

          var element = [data.data[index].payload[0].created_at];
          if(element[0]==element2[0]){
            //console.log(element);
          }else{
            coin[i] = data.data[index].payload[0].low;  
            highs[i] = data.data[index].payload[0].high;  
            //console.log(coin);
        }
        i++  
        element2 = element;
        
      }
      //console.log(coin);
      dataCompletedTasksChart = {
        labels: ['2017', '2018', '2019'],
        series: [
          [coin[30], coin[4], coin[50]],
          [highs[30], highs[4], highs[50]]
        ]
      };

      optionsCompletedTasksChart = {
        lineSmooth: Chartist.Interpolation.cardinal({
          tension: 0
        }),
        low: coin[4],
        high: highs[4], // creative tim: we recommend you to set the high sa the biggest value + something for a better look
        chartPadding: {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0
        }
      }

      var completedTasksChart = new Chartist.Line('#completedTasksChart', dataCompletedTasksChart, optionsCompletedTasksChart);

      // start animation for the Completed Tasks Chart - Line Chart
      md.startAnimationForLineChart(completedTasksChart);

      }).catch(function(){

      });


      /* ----------==========     Emails Subscription Chart initialization    ==========---------- */
      dashboardFactory.postsday()
      .then(function(data){
        console.log(data.data);
        var element2 = [0];
        var coin = [];
        var highs = [];
        var i = 0;
        for (var index = 0; index < data.data.length; index++) {
          
          var element = [data.data[index].payload[0].created_at];
          if(element[0]==element2[0]){
            //console.log(element);
          }else{
            coin[i] = data.data[index].payload[0].low;  
            highs[i] = data.data[index].payload[0].high;  
            //console.log(coin);
        }
        i++  
        element2 = element;
        
      }
      console.log(coin);

      var dataWebsiteViewsChart = {
        labels: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
        series: [
          [coin[30], coin[30], coin[30], coin[30], coin[40], coin[50], 
          coin[60], coin[90], coin[10],  coin[4], coin[5], coin[60]],
          [highs[30], highs[30], highs[30], highs[30], highs[40], highs[50],
          highs[60], highs[90], highs[10], highs[4], highs[5], highs[60]]

        ]
      };
      var optionsWebsiteViewsChart = {
        axisX: {
          showGrid: false
        },
        low: 100000,
        high: 150000,
        chartPadding: {
          top: 0,
          right: 5,
          bottom: 0,
          left: 0
        }
      };
      var responsiveOptions = [
        ['screen and (max-width: 640px)', {
          seriesBarDistance: 5,
          axisX: {
            labelInterpolationFnc: function(value) {
              return value[0];
            }
          }
        }]
      ];
      var websiteViewsChart = Chartist.Line('#websiteViewsChart', dataWebsiteViewsChart, optionsWebsiteViewsChart, responsiveOptions);

      //start animation for the Emails Subscription Chart
      md.startAnimationForLineChart(websiteViewsChart);
    }).catch(function(){

    });
    }
  },

  showNotification: function(from, align) {
    type = ['', 'info', 'danger', 'success', 'warning', 'primary'];

    color = Math.floor((Math.random() * 5) + 1);

    $.notify({
      icon: "add_alert",
      message: "Welcome to <b>Material Dashboard</b> - a beautiful freebie for every web developer."

    }, {
      type: type[color],
      timer: 3000,
      placement: {
        from: from,
        align: align
      }
    });
  },

  checkScrollForTransparentNavbar: debounce(function() {
    if ($(document).scrollTop() > 260) {
      if (transparent) {
        transparent = false;
        $('.navbar-color-on-scroll').removeClass('navbar-transparent');
      }
    } else {
      if (!transparent) {
        transparent = true;
        $('.navbar-color-on-scroll').addClass('navbar-transparent');
      }
    }
  }, 17),

  initRightMenu: debounce(function() {

    $sidebar_wrapper = $('.sidebar-wrapper');

    if (!mobile_menu_initialized) {
      console.log('intra');
      $navbar = $('nav').find('.navbar-collapse').children('.navbar-nav');

      mobile_menu_content = '';

      nav_content = $navbar.html();

      nav_content = '<ul class="nav navbar-nav nav-mobile-menu">' + nav_content + '</ul>';

      navbar_form = $('nav').find('.navbar-form').length != 0 ? $('nav').find('.navbar-form')[0].outerHTML : null;

      $sidebar_nav = $sidebar_wrapper.find(' > .nav');

      // insert the navbar form before the sidebar list
      $nav_content = $(nav_content);
      $navbar_form = $(navbar_form);
      $nav_content.insertBefore($sidebar_nav);
      $navbar_form.insertBefore($nav_content);

      $(".sidebar-wrapper .dropdown .dropdown-menu > li > a").click(function(event) {
        event.stopPropagation();

      });

      // simulate resize so all the charts/maps will be redrawn
      window.dispatchEvent(new Event('resize'));

      mobile_menu_initialized = true;
    } else {
      if ($(window).width() > 991) {
        // reset all the additions that we made for the sidebar wrapper only if the screen is bigger than 991px
        $sidebar_wrapper.find('.navbar-form').remove();
        $sidebar_wrapper.find('.nav-mobile-menu').remove();

        mobile_menu_initialized = false;
      }
    }
  }, 200),

  startAnimationForLineChart: function(chart) {
    chart.on('draw', function(data) {
      if ((data.type === 'line' || data.type === 'area') && window.matchMedia("(min-width: 900px)").matches) {
        data.element.animate({
          d: {
            begin: 600,
            dur: 700,
            from: data.path.clone().scale(1, 0).translate(0, data.chartRect.height()).stringify(),
            to: data.path.clone().stringify(),
            easing: Chartist.Svg.Easing.easeOutQuint
          }
        });
      } else if (data.type === 'point') {
        seq++;
        data.element.animate({
          opacity: {
            begin: seq * delays,
            dur: durations,
            from: 0,
            to: 1,
            easing: 'ease'
          }
        });
      }

    });

    seq = 0;

  },
  startAnimationForBarChart: function(chart) {
    chart.on('draw', function(data) {
      if (data.type === 'bar' && window.matchMedia("(min-width: 900px)").matches) {
        seq2++;
        data.element.animate({
          opacity: {
            begin: seq2 * delays2,
            dur: durations2,
            from: 0,
            to: 1,
            easing: 'ease'
          }
        });
      }

    });

    seq2 = 0;

  }
}

// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.

function debounce(func, wait, immediate) {
  var timeout;
  return function() {
    var context = this,
      args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    }, wait);
    if (immediate && !timeout) func.apply(context, args);
  };
};

////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
$scope.updateObjectUser = function(User){
  // A post entry.
  console.log(reserverD.hour);
  var reserverInfo = {}
  reserverInfo.building = reserverD.building;
  reserverInfo.hour = reserverD.hour;
  reserverInfo.day = reserverD.day;
  reserverInfo.email = currentAuth.email;
  // Get a key for a new Post.
  var newPostKey = firebase.database().ref('reserver').push().key;
  console.log(newPostKey);
  // Write the new post's data simultaneously in the posts list and the user's post list.
  var updatesReserve = {};
  updatesReserve['/reserver/-LTmwBlZ5DP1SgV3rGTI'] = reserverInfo;
  
  firebase.database().ref().update(updatesReserve);
  location.reload();
}










  

  $rootScope.logoutSession = function(){
    firebase.auth().signOut().then(function() {
      location.reload(true);
        var user = firebase.auth().currentUser;
        var name, email, photoUrl, uid, emailVerified;
          if (user != null) {
            name = user.displayName;
            email = user.email;
            photoUrl = user.photoURL;
            emailVerified = user.emailVerified;
            uid = user.uid;  // The user's ID,
            console.log(email)
          }
    }).catch(function(error) {
      //error
    });
  }



}]);
/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////
app.controller("CryptCtrl", ["$scope","$firebaseArray", "$firebaseStorage", "currentAuth", "dashboardFactory", function($scope, $firebaseArray, $firebaseStorage, currentAuth, dashboardFactory) {
  $scope.bitreal = function(){ dashboardFactory.bitNow()
    .then(function(data){
      var dataBit = {};
      var dataEthe = {};
      var dataLite = {};
      console.log(data.data);
      console.log([data.data.payload[1].last,data.data.payload[1].book]);
      console.log([data.data.payload[5].last,data.data.payload[5].book]);
      dataBit.price = data.data.payload[0].last;
      dataBit.high = data.data.payload[0].high;
      dataBit.low = data.data.payload[0].low;
      dataEthe.price = data.data.payload[1].last*data.data.payload[0].last;
      dataEthe.high = data.data.payload[1].high*data.data.payload[0].high;
      dataEthe.low = data.data.payload[1].low*data.data.payload[0].low;
      dataLite.price = data.data.payload[5].last*data.data.payload[0].last;
      dataLite.high = data.data.payload[5].high*data.data.payload[0].high;
      dataLite.low = data.data.payload[5].low*data.data.payload[0].low;
      console.log(dataBit);
      $scope.dataBit = dataBit;
      $scope.dataEthe = dataEthe;
      $scope.dataLite = dataLite;
      var element2 = [];
      var coin = [];
      var i = 0;
      
      for (var index = 0; index < data.data.length; index++) {
        
        var element = [data.data.payload[0].created_at];
        if(element[0]==element2[0]){
          console.log(element);
        }else{
          coin[i] = data.data[index].payload[0].volume;  
          console.log(coin);
      }
      i++  
      element2 = element;
      
    }}).catch(function(){
  
    });
  }
  
    setInterval($scope.bitreal,5000);
}]);


app.controller("AccountUserCtrl", ["$scope","$firebaseArray", "$firebaseStorage", "currentAuth", function($scope, $firebaseArray, $firebaseStorage, currentAuth) {
  
  var dbRef = firebase.database().ref('user');
  $scope.users = $firebaseArray(dbRef);

  $scope.dataUserMail = currentAuth.email;
  console.log(currentAuth.email);
    
  $scope.updateObjectCompleteUser = function(user){
    // A post entry.
    var userInfo = {}
      userInfo.firstName = user.firstName;
      userInfo.lastName = user.lastName;
      userInfo.enrollement = user.enrollement;
      userInfo.level = user.level;
      userInfo.email = currentAuth.email;


    // Get a key for a new Post.
    var newPostKey = firebase.database().ref('users').push().key;
    console.log(newPostKey);
    // Write the new post's data simultaneously in the posts list and the user's post list.
    var updates = {};
    updates['/users/-LQkZ4zDNWj_L5Aojdon'] = userInfo;

    storage.$delete("photos/users/'currentAuth.email'")
        .then(function() {
          console.log("successfully deleted!");
          var uploadTask = storage.$put(user.file, metadata);
        });

          
    firebase.database().ref().update(updates);
    location.reload();
  }


  $scope.addObjectCompleteReserver = function(reserverD){
    console.log(reserverD);
    var reserverInfo = {}
    reserverInfo.hour = reserverD.hour;
    reserverInfo.day = reserverD.day;
    reserverInfo.email = currentAuth.email;

    $scope.reserve.$add(reserverInfo)  
    .then(function(ref){
      console.log('Se ha ingresado una reservación')
      console.log(ref)
    })
    .catch(function(err){
      console.log('No se podido ingresar una reservacion')
      console.log(err)
    });

    var url = "http://" + $window.location.host + "/browserID/#!/home/";
        $log.log(url);
        $window.location.href = url;
        console.log('Ya entro');
  }


  $scope.updateObjectCompleteReserver = function(reserverD){
    // A post entry.
    console.log(reserverD.hour);
    var reserverInfo = {}
    reserverInfo.building = reserverD.building;
    reserverInfo.hour = reserverD.hour;
    reserverInfo.day = reserverD.day;
    reserverInfo.email = currentAuth.email;
    // Get a key for a new Post.
    var newPostKey = firebase.database().ref('reserver').push().key;
    console.log(newPostKey);
    // Write the new post's data simultaneously in the posts list and the user's post list.
    var updatesReserve = {};
    updatesReserve['/reserver/-LTmwBlZ5DP1SgV3rGTI'] = reserverInfo;
    
    firebase.database().ref().update(updatesReserve);
    location.reload();
  }

}]);