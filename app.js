// Copyright 2016, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

process.env.DEBUG = 'actions-on-google:*';
let Assistant = require('actions-on-google').ApiAiAssistant;
let express = require('express');
let bodyParser = require('body-parser');
let request = require('request');

let app = express();
app.use(bodyParser.json({type: 'application/json'}));

const FIND_MUSIC = 'find.artists';
const LOCATION_ARGUMENT = 'country';

app.post('/', function (req, res) {
  const assistant = new Assistant({request: req, response: res});
  console.log('Request headers: ' + JSON.stringify(req.headers));
  console.log('Request body: ' + JSON.stringify(req.body));

  function findArtists (assistant) {
    let location = assistant.getArgument(LOCATION_ARGUMENT);
    getArtists(location, function(artists) {
      let sorted = artists.sort((a, b) => a.listeners > b.listeners);
      let sentence = `Popular music in ${location} includes ${sorted[0].name}, ${sorted[1].name} and ${sorted[2].name}`
      assistant.tell(sentence);
    });
  }

  let actionMap = new Map();
  actionMap.set(FIND_MUSIC, findArtists);

  assistant.handleRequest(actionMap);
});

function getArtists(location, callback) {
  let apiKey = "9748ee331a618424769dc165a3a84d4d";
  let url = `http://ws.audioscrobbler.com/2.0/?method=geo.gettopartists&country=${location}&api_key=${apiKey}&format=json`;
  
  console.log(url);
  request.get({
    url: url,
    json: true,
    headers: {'User-Agent': 'request'}
  }, (err, res, data) => {
    if (err) {
      console.log(`Error querying ${url}`, err);
      return callback(`I encountered an error looking up ${articleName}, sorry.`);
    } else if (res.statusCode !== 200) {
      console.log('Status:', res.statusCode);
      return callback(`I encountered an error ${res.statusCode} looking up ${articleName}, sorry.`);
    } else {
      // data is already parsed as JSON:
      try {
        return callback(data.topartists.artist);
      } catch (e) {
        console.log(e);
        return callback("Failed to parse JSON, sorry.");
      }
    }
  });
}

if (module === require.main) {
  // [START server]
  // Start the server
  let server = app.listen(process.env.PORT || 8080, function () {
    let port = server.address().port;
    console.log('App listening on port %s', port);
  });
  // [END server]
}

module.exports = app;
