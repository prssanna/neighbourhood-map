//The start function, that initializes the map and runs the whole app.
function start() {

'use strict';

    var map;

    //Initializes the map

    map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: 19.095271, lng: 72.829263},
            zoom: 13,
            styles: this.styles,
            mapTypeControl: false
    });

    var styles = [
          {
              featureType: "landscape.natural",
              elementType: "geometry.fill",
              stylers: [
                  {
                      visibility: "on"
                  },
                  {
                      color: "#e0efef"
                  }
              ]
          },
          {
              featureType: "poi",
              elementType: "geometry.fill",
              stylers: [
                  {
                      visibility: "on"
                  },
                  {
                      hue: "#1900ff"
                  },
                  {
                      color: "#c0e8e8"
                  }
              ]
          },
          {
              featureType: "road",
              elementType: "geometry",
              stylers: [
                  {
                      lightness: 100
                  },
                  {
                      visibility: "simplified"
                  }
              ]
          },
          {
              featureType: "road",
              elementType: "labels",
              stylers: [
                  {
                      visibility: "off"
                  }
              ]
          },
          {
              featureType: "transit.line",
              elementType: "geometry",
              stylers: [
                  {
                      visibility: "on"
                  },
                  {
                      lightness: 700
                  }
              ]
          },
          {
              featureType: "water",
              elementType: "all",
              stylers: [
                  {
                      color: "#7dcdcd"
                  }
              ]
          }
    ];



    // The Location variable(model) that initializes the attributes which are, the title, longitude, latitude, marker, info window, url.
    var loc = function(longitude, latitude, name, placeid) {

        //Initializes title, longitude, latitude, info window
        var self = this;
        this.title = name;
        this.lng = longitude;
        this.lat = latitude;
        this.id = placeid;
        this.largeInfoWindow = new google.maps.InfoWindow();

        //Creates a marker for the location
        this.marker = new google.maps.Marker({
            position: new google.maps.LatLng(this.lng, this.lat),
            map: map,
            title: this.title,
            animation: google.maps.Animation.DROP,

        });

        //Opens info window when the marker is clicked.
        this.marker.addListener('click', function() {

            self.populateInfoWindow();

        });

        //foursquare url for venue details
        this.url = 'https://api.foursquare.com/v2/venues/'+this.id+'?client_id=13VIDC1NEFAFGL15FRU43DYNLLQNP0XAEDIS04WAPNNG3A0N&client_secret=PLUZQ4GS0RFHTLQD1R2LWRIGPBM53IU1Z3ASYTQWK12ZJEF4&m=foursquare&v=20140806';

        //JSON request for venue details
        this.data = $.getJSON(this.url, function() {

            //Sets content of info window
            var address = self.data.responseJSON.response.venue.location.formattedAddress;
            //console.log(address);
            var number = self.data.responseJSON.response.venue.contact.formattedPhone;
            if(number===undefined) number=" Number not found ";
            var rating = self.data.responseJSON.response.venue.rating;
            if(rating===undefined) number=" Rating not found ";

            var n=self.data.responseJSON.response.venue.tips.groups[0].count;
            //console.log(n);
            var comments = [];
            for(var i=0; i<n; i++) {
                var item = self.data.responseJSON.response.venue.tips.groups[0].items[i];
                comments.push(item.text);
            }
            self.content = '<h3>' + "Address:" + '</h3>' + '<p>' + address.join("  ") + '</p>' + '<h3>' +  "Number: " + '</h3>' + '<p>' + number + '</p>' + '<h3>' + "Rating: " + '</h3>' + '<p>' + rating + '</p>' + '<h3>' + "Comments:" + "</p>";
            //console.log(self.content);
            for(i=0; i<comments.length; i++) {
                self.content += '<li class=comments>' + '<p>' + comments[i] + '</p>' + '</li>';
            }

        });

        //Handles error if the url is invalid
        this.data.fail(function() {self.content = '<h2 class="error">' + "ERROR : Invalid URL" + '</h2>';});



        //Opens and populates the info window for the location

        this.populateInfoWindow = function() {


            for (var i=0; i < model.locations.length; i++) {
                model.locations[i].largeInfoWindow.close();
            }
            self.marker.setAnimation(google.maps.Animation.BOUNCE);

            setTimeout(function() {
                self.marker.setAnimation(null);
            }, 1400);
            self.largeInfoWindow.setContent('<div class="iw"> <h2 class=title>' + this.title + '</h2>' + self.content+'</div>');

            self.largeInfoWindow.open(map, self.marker);

        };

    };



    //The view model, that initializes all the locations and the function for searching for a particular location as well as
    //observable functions for showing and hiding markers.
    var model = {

        locations:[
            new loc(19.095271, 72.829263, 'Chaayos','56626f2a498ef50717f680a1'),
            new loc(19.093298, 72.8312125, 'Subway','4d6cba94fbf0a09314e2f58c'),
            new loc(19.1149738, 72.8218238, 'Baskin Robbins','4b0587cdf964a52052a222e3'),
            new loc(19.0981084, 72.8252866, 'Bora Bora','4f1184cbe4b019e991337078'),
            new loc(19.1107996,72.8240727, "Harry's Bar + Cafe",'544a9ea5498eefae2e31c7e1'),
            new loc(19.1107307,72.8232756, 'Myx','576fe24c498e779fa7d762a1'),
            new loc(19.1100428,72.8249239, 'Copa','525abf5311d277826dfcfa5c'),
            new loc(19.1023425,72.8290949, 'TrueTrammTrunk','56be18ce498ebf522c32ad58')
        ],


        //Shows the markers and extends the map bounds so that all markers can be seen(Useful when screemm size is small)
        showMarkers :function() {

            var bounds = new google.maps.LatLngBounds();
            for (var i = 0; i < this.locations.length; i++) {
                this.locations[i].marker.setVisible(true);
                bounds.extend(this.locations[i].marker.position);
            }
            map.fitBounds(bounds);
            window.onresize = function() {
              map.fitBounds(bounds);
            }

        },

        //Hides the markers
        hideMarkers:function() {

            for (var i=0; i < this.locations.length; i++) {
                this.locations[i].largeInfoWindow.close();
            }
            for (i = 0; i < this.locations.length; i++) {
             this.locations[i].marker.setVisible(false);
            }
        },

         query: ko.observable(''),
    };

    //The search function that filters the list of locations as well as the markers based on the input characters
    model.search = ko.computed(function() {

        var self = this;
        var search = self.query().toLowerCase();
        return ko.utils.arrayFilter(self.locations, function(location) {
            var index=location.title.toLowerCase().indexOf(search);
            var flag = (index>=0);
            location.marker.setVisible(flag);
            return  flag;
        });
    }, model);

    //Applies Knockout bindings
    ko.applyBindings(model);
}

//In case of an error in loading the map, this function os called
function error() {
    alert("ERROR : Google Maps has failed to load");
}
