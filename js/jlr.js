// !@qwaszx!

$( "#list-vehicles" ).click(function() {
  var auth_key = $('#request').val();
  var url = "https://www.jlrdevchallenge.com/api/v1/get_vehicles/?request=" + auth_key;
  $.getJSON(url, function( data ) {
    $.each(data, function (index, packet) {
        $('#vin').append($('<option/>', {
            value: packet.vin,
            text : packet.model + ' ' + packet.vin
        }));
    });
    $('.vehicles-group').slideDown();
    $('.journeys-group').hide();
    $('.signals-group').hide();
  });
});


$( "#vin" ).on('change', function() {
  var vin = $('#vin').val();
  if (vin === "") {return;}
  $("#jid option[value!='']").remove();
  var auth_key = $('#request').val();
  var query = "?request=" + auth_key + "&vin=" + vin;
  var url = "https://www.jlrdevchallenge.com/api/v1/get_journeys/" + query;
  $.getJSON(url, function( data ) {
    $.each(data, function (index, packet) {
        var text = packet.start_time.substring(0, packet.start_time.length - 7);
        $('#jid').append($('<option/>', {
            value: packet.journey_id,
            text : packet.journey_id + ' - ' + text
        }));
    });
    $('.journeys-group').slideDown();
    $('.signals-group').hide();
  });
});


$( "#jid" ).on('change', function() {
  var jid = $('#jid').val();
  if (jid === "") {return;}
  $("#signals option[value!='']").remove();
  var auth_key = $('#request').val();
  var query = "?request=" + auth_key + "&jid=" + jid;
  var url = "https://www.jlrdevchallenge.com/api/v1/get_signals/" + query;
  $.getJSON(url, function( data ) {
    var signalNames = [];
    $.each(data, function (key, packet) {
      signalNames.push(key);
    });
    signalNames.sort();
    $.each(signalNames, function (index, name) {
        $('#signals').append($('<option/>', {
            value: name,
            text : name
        }));
    });
    $('.signals-group').slideDown();
  });
});


$( "#plot-data" ).click(function() {
  var signals = $('#signals').val();
  if (signals === "") {return;}
  var auth_key = $('#request').val();
  var jid = $('#jid').val();
  var query = "?sampling_rate=1000&request=" + auth_key + "&jid=" + jid + "&signals=" + signals;
  var url = "https://www.jlrdevchallenge.com/api/v1/get_data/" + query;
  $.getJSON(url, function( data ) {
    // Coerce the data
    var chart = c3.generate({
        bindto: '#chart',
        data: {
          json: coerce_data(data),
          keys: {
            x: 't',
            value: ['val'],
          },
          names: {
            val: Object.keys(data)[0]
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
        }
    });
  });
});

function coerce_data(data) {
  // Manipulate API data into a format that can be used by C3.js.
  var newdata = data[Object.keys(data)[0]];
  for (i=0; i<newdata.length; i++) {
    newdata[i].t = new Date(newdata[i].t);
  }
  return newdata;
}
