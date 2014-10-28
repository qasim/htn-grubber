function makeInfoWindowEvent(map, infowindow, marker) {
   return function() {
      for(var x = 0; x < window.infowindows.length; x++) {
        //window.infowindows[x].close()
      }
      infowindow.open(map, marker)
      jQuery(".timeago").timeago();
   }
}

function urlify(text) {
    var urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, function(url) {
        return '<a href="' + url + '" target="_blank">' + url + '</a>';
    })
    // or alternatively
    // return text.replace(urlRegex, '<a href="$1">$1</a>')
}

window.markers = [];
window.infowindows = [];

function initialize() {
  var mapOptions = {
    center: { lat: 43.6632245, lng: -79.395480 },
    zoom: 15
  };
  window.map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

  for(var i = 0; i < window.valid_tweets.length; i++) {
    var addition = ''
    if(window.valid_tweets[i].tweet_img != '') {
      addition = '<img src="'+window.valid_tweets[i].tweet_img+'" style="margin-top: 10px;width: 100%;"/>'
    }

    window.infowindows[i] = new InfoBox({
      content: "Hi",
      disableAutoPan: false,
      maxWidth: 0,
      pixelOffset: new google.maps.Size(0, 0),
      zIndex: null,
      boxStyle: {
        background: "url('tipbox.gif') no-repeat",
        opacity: 0.75,
        width: "280px",
      },
      closeBoxMargin: "10px 2px 2px 2px",
      closeBoxURL: "http://www.google.com/intl/en_us/mapfiles/close.gif",
      infoBoxClearance: new google.maps.Size(1, 1),
      isHidden: false,
      pane: "floatPane",
      enableEventPropagation: false
    });

    /*window.infowindows[i] = new google.maps.InfoWindow({
      content: urlify('<span class="handle">\
        @' + window.valid_tweets[i].tweet_name + '\
      </span> <span class="date">· <span class="timeago" title="' + new Date(parseInt(window.valid_tweets[i].tweet_date) * 1000).toISOString() + '"></span></span> <br />' + window.valid_tweets[i].tweet_text) + '<br />\
      ' + addition,
      maxWidth: 300
    });*/

    window.markers[i] = new google.maps.Marker({
      position: new google.maps.LatLng(window.valid_tweets[i].tweet_lat,window.valid_tweets[i].tweet_long),
      map: window.map,
      icon: window.myIcon,
      title: '@' + window.valid_tweets[i].tweet_name
    });

    google.maps.event.addListener(window.markers[i], 'click', makeInfoWindowEvent(
      window.map,
      window.infowindows[i],
      window.markers[i]
    ));
  }
}

window.myIcon = {
  url: "../images/pin.png",
  size: new google.maps.Size(57, 64), // the size it should be on the map
  scaledSize: new google.maps.Size(57, 64), // the normal size of the image is 90x1100 because Retina asks double size.
  origin: new google.maps.Point(0, 0) // position in the sprite
};

$(document).ready(function() {

	//Connect to our server-side
	socket = io.connect(location.href);

  jQuery.timeago.settings.allowFuture = true;

  socket.on('tweets', function(data) {
    window.valid_tweets = data.valid_tweets;
    console.log(window.valid_tweets);
    initialize();
  })

});
