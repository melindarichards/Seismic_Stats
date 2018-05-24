
var map;
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 8,
        center: { lat: 40.7608, lng: -111.8910 },
        mapTypeId: 'terrain'
    });
    // Create a <script> tag and set the USGS URL as the source.
    var script = document.createElement('script');
    // This example uses a local copy of the GeoJSON stored at
    //http://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojsonp
    // script.src = 'fakedata.js';
    document.getElementsByTagName('head')[0].appendChild(script);
    map.data.setStyle(function (feature) {
        var magnitude = feature.getProperty('mag');
        var place = feature.getProperty('place');
        var time = feature.getProperty('time');
        var ctime = moment(time).format();
        $('#history').append("<tr><td>" + place + "</td><td>" + ctime + "</td><td>" + magnitude + "</td><td>");
        return {
            icon: getCircle(magnitude)
        };
    });
}
function getCircle(magnitude) {
    return {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: 'brown',
        fillOpacity: 1,
        scale: Math.pow(2, magnitude) / 2,
        strokeColor: 'white',
        strokeWeight: .5
    };
}
function eqfeed_callback(results) {
    map.data.addGeoJson(results);
}
var config = {
    apiKey: "AIzaSyBufRELsSOVSrguYEl3zMS_yDbjg6XVLos",
    authDomain: "project1-1520099791989.firebaseapp.com",
    databaseURL: "https://project1-1520099791989.firebaseio.com",
    projectId: "project1-1520099791989",
    storageBucket: "",
    messagingSenderId: "778829038115"
};
firebase.initializeApp(config);
var database = firebase.database();
$(".btn").on("click", function (event) {
    event.preventDefault();
    $('form').valid();
		$("#history").empty();
    $("#map").addClass("shake").one("webkitAnimationEnd mozAnimationEnd oAnimationEnd animationend", function () {
        $(this).removeClass("shake");
    })
    var streetAdd = $("#street_address").val().trim();
    var street1 = streetAdd.split(' ').join('+');
    var cityAdd = $("#city_input").val().trim();
    var city1 = cityAdd.split(' ').join('+');
    var stateAdd = $("#state_input").val().trim();
    $("#street_address").val("");
    $("#city_input").val("");
    $("#state_input").val("");
		if (cityAdd === "" || stateAdd ==="") {
			return
		};
		database.ref().push({
        street: streetAdd,
        city: cityAdd,
        state: stateAdd
    });
    var queryURL = "https://maps.googleapis.com/maps/api/geocode/json?address=" + street1 + ",+" + city1 + ",+" + stateAdd + "&key=AIzaSyBRnBbZdpThRUpOF47JaGuMIrKZMt38SSU";
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {
        console.log(response);
        var lat = (response.results[0].geometry.location.lat);
        var lng = (response.results[0].geometry.location.lng);
        //recenter the map (note: requires object)
        map.setCenter({ lat: lat, lng: lng });
        var queryURL2 = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2013-01-01&endtime=&latitude=" + lat + "&longitude=" + lng + "&maxradiuskm=20"
        $.ajax({
            url: queryURL2,
            method: "GET"
        }).then(function (response) {
            eqfeed_callback(response);
            console.log(response);
        })
    });
    $("#addresses").append("<tr><td>" + streetAdd + "</td><td>" + cityAdd + "</td><td>" + stateAdd + "</td><tr>");
});
$('form').validate({
    rules: {
        city_input: {
            required: true
        },
        state_input: {
            required: true
        },
    },
    highlight: function (element) {
        $(element).closest('.form-group').addClass('has-error');
    },
    unhighlight: function (element) {
        $(element).closest('.form-group').removeClass('has-error');
    },
    errorElement: 'span',
    errorClass: 'help-block',
    errorPlacement: function (error, element) {
        if (element.parent('.input-group').length) {
            error.insertAfter(element.parent());
        } else {
            error.insertAfter(element);
        }
    }
});

