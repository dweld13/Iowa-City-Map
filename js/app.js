/*global ko*/
/*global google*/
/*global $*/
(function() {
    'use strict';
});
var map;


// Destination object
var Destination = function(data) {

    var self = this;
    self.address = ko.observable('');
    self.contentString = ko.observable('');
    self.lat = ko.observable(data.lat);
    self.lng = ko.observable(data.lng);
    self.marker = ko.observable();
    self.title = ko.observable(data.title);
    self.url = ko.observable('');
    self.id = ko.observable('');
};

// Model
var locations = [{
        title: 'Hillcrest',
        lat: 41.659234,
        lng: -91.542823
    }, {
        title: 'The Mill',
        lat: 41.658021,
        lng: -91.533830
    }, {
        title: 'Short\'s Burger & Shine',
        lat: 41.660647,
        lng: -91.534476
    }, {
        title: 'Prairie Lights Bookstore',
        lat: 41.660747,
        lng: -91.533335
    }, {
        title: 'Carver Hawkeye Arena',
        lat: 41.663624,
        lng: -91.554510
    }, {
        title: 'Kinnick Stadium',
        lat: 41.658462,
        lng: -91.551088
    }, {
        title: 'Iowa Memorial Union',
        lat: 41.662976,
        lng: -91.538017
    }, {
        title: 'Hubbard Park',
        lat: 41.661880,
        lng: -91.538261
    }, {
        title: 'Finkbine Golf Course',
        lat: 41.661316,
        lng: -91.567953
    }];


// ViewModel
var ViewModel = function() {

    var self = this;
    var infoWindow = new google.maps.InfoWindow({
        maxWidth: 250
    });
    var bounds = new google.maps.LatLngBounds();
    var venue;
    var location;
    var marker;
    var UserInput;
    var url;
    var id;

    self.destinations = ko.observableArray([]);

    self.foursqError = ko.observable(false);

    locations.forEach(function(destinationData) {
        self.destinations.push(new Destination(destinationData));
    });

    // add interactivity for map
    self.destinations().forEach(function(destinationData) {

        marker = new google.maps.Marker({
            position: new google.maps.LatLng(destinationData.lat(), destinationData.lng()),
            map: map,
            animation: google.maps.Animation.DROP
        });
        bounds.extend(marker.position);
        destinationData.marker = marker;

        // api call for foursquare data including versioning
        $.ajax({
            url: 'https://api.foursquare.com/v2/venues/search',
            dataType: 'json',
            data: 'limit=1' + '&ll=41.661129,-91.530167' + '&query=' + destinationData.title() +
                '&client_id=GRKEXJ2OXH5VXLLCKUCUZV0GDOENLW2VREIBHQT4KGGPIC41' +
                '&client_secret=S3J2AHTY5LXDWVW200F4HBWEWTT1YSSBPLN0COKFHS0VH5VB' +
                '&v=20171121',
            async: true,

            // successful api call will pull the information for infowindows
            success: function(data) {

                venue = data.response.hasOwnProperty("venues") ? data.response.venues[0] : '';

                location = venue.hasOwnProperty('location') ? venue.location : '';

                if (location.hasOwnProperty('address')) {
                    destinationData.address(location.address || '');
                }

                url = venue.hasOwnProperty('url') ? venue.url : '';
                destinationData.url((url) ? '<a href="' + url + '">Website</a>' : 'No website available');

                id = venue.hasOwnProperty('id') ? venue.id : '';
                destinationData.id(id || '');

                destinationData.contentString = '<div><h2>' + destinationData.title() + '</h2><p>' +
                    destinationData.address() + '</p><p><a target="_blank" href=https://www.google.com/maps/dir/Current+Location/' +
                    destinationData.lat() + ',' + destinationData.lng() + '>Directions</a></p></div><p>' +
                    destinationData.url() + '</p><hr><h5>Location data delivered by <a href="http://foursquare.com/v/' +
                    destinationData.id() + '?ref=GRKEXJ2OXH5VXLLCKUCUZV0GDOENLW2VREIBHQT4KGGPIC41">FourSquare</a></h5>';
                },

                // error message for infowindow
                error: function(e) {
                    infoWindow.setContent('<p>Unable to find the FourSquare data. Please try again later.</p>');
            }
        });

        // infowindows and animation
        google.maps.event.addListener(destinationData.marker, 'click', function() {
            infoWindow.open(map, this);
            destinationData.marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function() {
                destinationData.marker.setAnimation(null);
            }, 1200);
            infoWindow.setContent(destinationData.contentString);
        });
    });

    map.fitBounds(bounds);

    // tie list items to the marker
    self.popInfoWindow = function(destinationData) {
        google.maps.event.trigger(destinationData.marker, 'click');
        $(".menu").slideToggle("slow", function() {
            $(".close").hide();
            $(".hamburger").show();
        });
    };

    self.visible = ko.observableArray();

    // all markers show to start
    self.destinations().forEach(function(place) {
        self.visible.push(place);
    });

    self.userInput = ko.observable('');

    //only show markers that match search results by user
    self.filterMarkers = function() {
        UserInput = self.userInput().toLowerCase();
        infoWindow.close();
        self.visible.removeAll();

        self.destinations().forEach(function(place) {
            place.marker.setVisible(false);
            if (place.title().toLowerCase().indexOf(UserInput) !== -1) {
                self.visible.push(place);
            }
        });

        self.visible().forEach(function(place) {
            place.marker.setVisible(true);
        });
    };

};

function initMap() {
    // constructor creates a new map - only center and zoom are required
    map = new google.maps.Map(document.getElementById("mapDiv"), {
        zoom: 13,
        center: {
            lat: 41.661129,
            lng: -91.530167
        }
    });

    ko.applyBindings(new ViewModel());

}


var mapError = ko.observable(false);

// open and close menu list functionality
$(".close").hide();
$(".menu").hide();
$(".hamburger").click(function() {
    $(".menu").slideToggle("slow", function() {
        $(".hamburger").hide();
        $(".close").show();
    });
});

$(".close").click(function() {
    $(".menu").slideToggle("slow", function() {
        $(".close").hide();
        $(".hamburger").show();
    });
});

function errorHandling() {
    alert("Unable to load Google Maps at this time");
}


