// Stream data using socket.io

var chart;  // Holder for c3.js chart object
var client; // socket.io connection holder

/*
Function fired when the 'stream data' button is pressed.
Opens a socket connection to the server and plots the data on a graph
as it is received.
*/
$( "#stream-data" ).click(function() {
  var initialised = false;  // Has the chart been initialised?
  var signals = $('#signals').val();
  if (signals === "") {return;}
  var auth_key = $('#request').val();
  var jid = $('#jid').val();
  var query = "request=" + auth_key + "&jid=" + jid + "&signals=" + signals;
  var host = "https://www.jlrdevchallenge.com/";
  client = io.connect(host, {query: query, path: '/socket_api/v1'});
  client.once( "connect", function () {
    console.log( 'Client: Connected' );
    client.on('ready', function(msg) {
      // Server is ready to stream data.
      client.emit('play');
    });
    client.on('data', function(data) {
      console.log(data);
      data = coerce_streamed_data(data);
      if (!initialised) {
        // Chart is not initialised. Initialise it with the first data point.
        chart = c3.generate({
            bindto: '#chart',
            data: {
              json: data,
              keys: {
                x: 't',
                value: ['val'],
              },
              names: {
                val: data[0].signal_name
              }
            },
            axis: {
              x: {
                type: 'timeseries',
                tick: {
                    count: 10,
                    format: '%Y-%m-%d %H:%M:%S'
                }
              }
            },
            point: {
              show: false
            }
        });
        initialised = true;
      } else {
        // Chart is already initialised. Append data to it.
        chart.flow({
            json: data,
            keys: {
              x: 't',
              value: ['val'],
              },
            length: 0,
            duration: 1,
        });
      }
    });
  });
});

// Disconnect the socket on stop button press.
$( "#stop-stream" ).click(function() {
  client.disconnect();
});


function coerce_streamed_data(data) {
  // Manipulate API data into a format that can be used by C3.js.
  data.t = new Date(data.t);
  return [data];
}
