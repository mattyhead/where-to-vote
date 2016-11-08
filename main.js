(function ($, _) {
  var wardDivisionEndpoint = 'https://gis.phila.gov/arcgis/rest/services/ElectionGeocoder/GeocodeServer/findAddressCandidates'
  var pollingPlaceEndpoint = 'https://api.phila.gov/polling-places/v1'
  var buildingCodes = {	
	  'F' : 'BUILDING FULLY ACCESSIBLE',
	  'A' : 'ALTERNATE ENTRANCE',
	  'B' : 'BUILDING SUBSTANTIALLY ACCESSIBLE',
	  'R' : 'ACCESSIBLE WITH RAMP',
	  'M' : 'BUILDING ACCESSIBLITY MODIFIED',
	  'N' : 'BUILDING NOT ACCESSIBLE'
  }
  var parkingCodes = {	
  	'N' : 'NO PARKING',
  	'L' : 'LOADING ZONE',
  	'H' : 'HANDICAP PARKING',
  	'G' : 'GENERAL PARKING'
  }
  
  // Use mustache.js style brackets in templates
  _.templateSettings = { interpolate: /\{\{(.+?)\}\}/g }
  var templates = {
    result: _.template($('#tmpl-result').html()),
    error: _.template($('#tmpl-error').html()),
    loading: $('#tmpl-loading').html()
  }
  var resultContainer = $('#result')
  var addressEl = $('#address')

  addressEl.autocomplete({
    source: function (request, callback) {
      var divisionUrl = constructDivisionUrl(request.term)
      $.getJSON(divisionUrl, function (response) {
        if (response.candidates) {
          var addresses = $.map(response.candidates, function (candidate) {
            return { label: candidate.address, division: candidate.attributes.division }
          })
          callback(addresses)
          sendEvent('Autocomplete', 'Hit', request)
        } else {
          callback([])
          sendEvent('Autocomplete', 'Miss', request)
        }
      })
    },
    select: function (evt, ui) {
      sendEvent('Autocomplete', 'Select', ui.item.label)
      var wardDivision = ui.item.division
      var pollingPlaceUrl = constructPollingPlaceUrl(wardDivision)
      resultContainer.html(templates.loading)
      $.getJSON(pollingPlaceUrl, function (response) {
        var selected = {};
        if (response.features.length < 1) {
          // if there's no features returned, indicate an error
          resultContainer.html(templates.error())
        } else {
          // Otherwise show the result
          selected = response.features[0].attributes;
          selected.building = buildingCodes[selected.building];
          selected.parking = parkingCodes[selected.parking];
          resultContainer.html(templates.result(response.features[0].attributes))
        }
      }).fail(function () {
        resultContainer.html(templates.error())
      })
    }
  })

  function constructDivisionUrl (address) {
    var params = {
      Street: address.replace(/\+/g, ' '),
      outFields: 'division',
      f: 'json'
    }
    return wardDivisionEndpoint + '?' + $.param(params) + '&callback=?'
  }

  function constructPollingPlaceUrl (wardDivision) {
    var params = {
      ward: wardDivision.substr(0, 2),
      division: wardDivision.substr(2)
    }
    return pollingPlaceEndpoint + '?' + $.param(params) + '&callback=?'
  }

  function sendEvent (type, label, value) {
    dataLayer.push({
      'event': type,
      'eventCategory': 'Behavior',
      'eventAction': label,
      'eventLabel': value
    })
  }
})(window.jQuery, window._)
