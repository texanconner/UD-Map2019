// Model - List of data 
var locationData = [
  {
    locationName: 'Old Red Museum',
    latLng: {lat: 32.779167, lng: -96.806944},
    articleID: 'Dallas_County_Courthouse_(Texas)',
    articleName: null,
    articleUrl: null
  },

  {
    locationName: 'Adolphus Hotel',
    latLng: {lat: 32.779722, lng: -96.799167},
    articleID: 'Adolphus_Hotel',
    articleName: null,
    articleUrl: null
  },

  {
    locationName: 'Majestic Theatre',
    latLng: {lat: 32.783611, lng: -96.794444},
    articleID: 'Majestic_Theatre_(Dallas)',
    articleName: null,
    articleUrl: null
  },

  {
    locationName: 'Magnolia Hotel',
    latLng: {lat: 32.78, lng: -96.798889},
    articleID: 'Magnolia_Hotel_(Dallas,_Texas)',
    articleName: null,
    articleUrl: null
  },

  {
    locationName: 'Texas School Book Depository',
    latLng: {lat: 32.779722, lng: -96.808333},
    articleID: 'Texas_School_Book_Depository',
    articleName: null,
    articleUrl: null
  }
];

//Initialize the Map and apply bindings for the viewmodel.  
var googleMap;   
initMap = function() {

  // Build the Google Map object. Store a reference to it.
  googleMap = new google.maps.Map(document.getElementById('map-canvas'), {
    center: {lat: 32.78, lng: -96.798889},
    zoom: 16
  });

  ko.applyBindings(new koViewModel());
  }

// View Model
var koViewModel = function() {
  var self = this;
  var infowindow = new google.maps.InfoWindow();
  
  /*
   *  This creates each place, creates the map info for each place, retrieves wikipedia info and makes the info windows.
   *  Used this method of creating an array of all elements, and 
   *  one of the visible elements to be show when list filtering.
   *  Build "Place" objects out of raw place data.
  */

  self.allPlaces = [];
  locationData.forEach(function(place) {
    self.allPlaces.push(new Place(place));
  });
    
  // Build Markers via the Maps API and place them on the map.
  self.allPlaces.forEach(function(place) {

    var markerOptions = {
      map: googleMap,
      position: place.latLng,
      animation: google.maps.Animation.DROP
    };
      
    place.marker = new google.maps.Marker(markerOptions);

    function nonce_generate() {
      return (Math.floor(Math.random() * 1e12).toString());
    }

    /*
      * Construct the Wiki API url and pass the model data for the places.
      * Then send our data via ajax request.
    */

    var wiki_base_url = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + place.articleID + '&format=json&callback=wikiCallback';

    var settings2 = {
      url: wiki_base_url,
      cache: true,
      dataType: "jsonp",
      success: function(results) {
        place.articleUrl = results[3];
        place.articleName = '<div> <h1> ' + place.locationName + '</h1> </div> <div> <p> ' + results[2] + '</p> </div>' + '<div> <a href=' + place.articleUrl + '> Article on WikiPedia -> </a> </div>' ;
      },
      error: function() {
        console.log('WikiPedia API failure');
        place.articleName = "Wikipedia API Failure";
      },
    };

    // Send AJAX query via jQuery library.
    $.ajax(settings2);

    // Listens for click on map markers and opens info window if clicked
    google.maps.event.addListener(place.marker, 'click', function() {
    self.openInfo(place);
    });
  });

  // Toggles the map markers when clicked.  
  function toggleBounce(marker) {
    if (marker.getAnimation() !== null) {
      marker.setAnimation(null);
    } else {
      marker.setAnimation(google.maps.Animation.BOUNCE);
    }
  }

  // Opens the info window, sets the content, and toggles the bounce of the map marker.  
  self.openInfo = function (place) {
    
    infowindow.setContent(place.articleName);
    infowindow.open(googleMap, place.marker);
    self.moveTo(place.latLng.lat, place.latLng.lng);
    toggleBounce(place.marker);

    setTimeout(function() {
      toggleBounce(place.marker);
    }, 3000);
    
  }

  // Moves the map to the location of the place selected from list, or by marker
  self.moveTo = function(lat, lng){

    var latLng = new google.maps.LatLng(lat, lng);
    googleMap.panTo(latLng);
  }

  self.showList = ko.observable(true);
  self.toggle = function() {
   
    if (self.showList() === true) {
      self.showList(false);
    }
    else {
      self.showList(true);
    }
  };

  // source from http://codepen.io/prather-mcs/pen/KpjbNN for the idea for the List filetering
  // The markers that should be visible based on user input.
  self.visiblePlaces = ko.observableArray();
    
  // All places should be visible at first. We only want to remove them if the
  // user enters some input which would filter some of them out.
  self.allPlaces.forEach(function(place) {
    self.visiblePlaces.push(place);
  });
    
  // This, along with the data-bind on the <input> element, lets KO keep 
  // constant awareness of what the user has entered. It stores the user's 
  // input at all times.
  self.userInput = ko.observable('');
    
  // The filter will look at the names of the places the Markers are standing
  // for, and look at the user input in the search box. If the user input string
  // can be found in the place name, then the place is allowed to remain 
  // visible. All other markers are removed.
  self.filterMarkers = function() {
    var searchInput = self.userInput().toLowerCase();
    
    self.visiblePlaces.removeAll();
    
    // This looks at the name of each places and then determines if the user
    // input can be found within the place name.
    self.allPlaces.forEach(function(place) {
      place.marker.setVisible(false);
      
      if (place.locationName.toLowerCase().indexOf(searchInput) !== -1) {
        self.visiblePlaces.push(place);
      }
    });    
    
    self.visiblePlaces().forEach(function(place) {
      place.marker.setVisible(true);
    });
  };  
  
  function Place(dataObj) {
    this.locationName = dataObj.locationName;
    this.latLng = dataObj.latLng;
    this.articleID = dataObj.articleID;
    this.articleName = dataObj.articleName;
    
    // You will save a reference to the Places' map marker after you build the
    // marker:
    this.marker = null;
  }
};
