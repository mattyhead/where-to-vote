(function ($, _) {
//  var wardDivisionEndpoint = 'https://gis.phila.gov/arcgis/rest/services/ElectionGeocoder/GeocodeServer/findAddressCandidates'
  var wardDivisionEndpoint = 'https://apis.philadelphiavotes.com/autocomplete'
  var pollingPlaceEndpoint = 'https://www.philadelphiavotes.com/'
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

        if (response.status=="success") {
          var addresses = $.map(response.data, function (candidate) {
            return { label: candidate.label, division: candidate.division }
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
        return wardDivisionEndpoint + '/' + address.replace(/\+/g, ' ') 
  }

  function constructPollingPlaceUrl (wardDivision) {
    var params = {
      ward: wardDivision.substr(0, 2),
      division: wardDivision.substr(2),
      view: 'json',
      option: 'com_pollingplaces'
    }
    var url = pollingPlaceEndpoint + '?' + $.param(params)
        return url
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
