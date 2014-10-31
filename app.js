/**
 * Module dependencies.
 */
var twitter = require('twitter')
var express = require('express')
var routes = require('./routes')
var http = require('http')
var path = require('path')
var mysql = require('mysql')
var tools = require('./tools')
var fs = require('fs')
var request = require('request')
var emojiStrip = require('emoji-strip')

var app = express()

// all environments
app.set('port', process.env.PORT || 8269)
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(express.favicon())
app.use(express.logger('dev'))
app.use(express.json())
app.use(express.urlencoded())
app.use(express.methodOverride())
app.use(express.cookieParser('ivan got a job at tim hortons'))
app.use(express.session())
app.use(app.router)
app.use(express.static(path.join(__dirname, 'public')))

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler())
}

app.get('/', routes.index)

var server = http.createServer(app)
var io = require('socket.io').listen(server)

var Twitter = new twitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
})

function wordInString(s, word){
  return new RegExp( '\\b' + word + '\\b', 'i').test(s)
}

var valid_tweets = [];

function twitterSearch() {
  valid_tweets = []
  Twitter.search('free', {
    'geocode': '43.66,-79.4,3km',
    'result_type': 'recent',
    'count': 100
  }, function(data) {
    if(data.statuses == undefined) {
      console.log(data)
    } else {
      for(var i = 0; i < data.statuses.length; i++) {
        //Get coordinate data depending on whats available
        var loc = data.statuses[i].geo || data.statuses[i].coordinates
        //Only continue if not empty.
        var long = ""
        var lat = ""
        if(loc != null || loc != undefined) {
          if(loc.coordinates != null) {
            long = loc.coordinates[1]
            lat = loc.coordinates[0]
          }
          for(var x = 0; x < tools.valid_words.length; x++) {
            if(wordInString(data.statuses[i].text.toLowerCase(), tools.valid_words[x])) {
              //There is a food match. Automatically valid.
              var invalidFound = false
              for(var y = 0; y < tools.invalid_words.length; y++) {
                if(wordInString(data.statuses[i].text.toLowerCase(), tools.invalid_words[y])) {
                  invalidFound = true
                  break
                }
              }
              if(!invalidFound) {
                var image = ''
                if(data.statuses[i].entities.media != undefined) {
                  image = data.statuses[i].entities.media[0].media_url || ''
                }

                var text = emojiStrip(data.statuses[i].text)
                text = encodeURIComponent(text)
                text = text.replace(/%E2%80%9C/g, '%22')
                text = text.replace(/%E2%80%9D/g, '%22')
                text = text.replace(/%E2%80%A6/g, '...')
                text = decodeURIComponent(text)

                valid_tweets.push({
                  tweet_id: data.statuses[i].id_str,
                  tweet_name: data.statuses[i].user.screen_name,
                  tweet_date: (new Date(data.statuses[i].created_at) / 1000).toString(),
                  tweet_text: text,
                  tweet_lat: lat.toString(),
                  tweet_long: long.toString(),
                  tweet_img: image
                })
                break
              }
            }
          }
        }
      }
      console.log('TOTAL: ' + data.statuses.length)
      fs.writeFile('public/tweets.json', JSON.stringify(valid_tweets, null, 4), function(err) {
        if(err) {
          console.log(err)
        } else {
          console.log("JSON saved to " + 'public/tweets.json')
        }
      })
    }
  })
}

twitterSearch()
var twitterCheck = setInterval(twitterSearch, 480000)

server.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'))
})

//When a client connects
io.sockets.on('connection', function(socket) {
  socket.emit('tweets', { valid_tweets: valid_tweets })
  /*var sendData = setInterval(function() {
    socket.emit('tweets', { valid_tweets: valid_tweets })
  }, 3000)*/
})
