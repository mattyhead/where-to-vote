(function ($, _) {
  var wardDivisionEndpoint = 'http://gis.phila.gov/arcgis/rest/services/ElectionGeocoder/GeocodeServer/findAddressCandidates'
  var pollingPlaceEndpoint = 'https://api.phila.gov/polling-places/v1'
  var params = qs(window.location.search.substr(1))

  // Use mustache.js style brackets in templates
  _.templateSettings = { interpolate: /\{\{(.+?)\}\}/g }
  var templates = {
    result: _.template($('#tmpl-result').html()),
    error: _.template($('#tmpl-error').html()),
    loading: $('#tmpl-loading').html()
  }
  var resultContainer = $('#result')

  if (params.address) {
    // First fetch the ward/division from the address
    resultContainer.html(templates.loading)
    var divisionUrl = constructDivisionUrl(params.address)
    $.getJSON(divisionUrl, function (response) {
      console.log(response)
      if (response.candidates.length < 1) {
        // If there's no response or if there's an error, indicate such
        resultContainer.html(templates.error())
      } else {
        // Otherwise fetch the polling place from the ward/division
        var wardDivision = response.candidates[0].attributes.division
        var pollingPlaceUrl = constructPollingPlaceUrl(wardDivision)
        $.getJSON(pollingPlaceUrl, function (response) {
          if (response.features.length < 1) {
            // if there's no features returned, indicate an error
            resultContainer.html(templates.error())
          } else {
            // Otherwise show the result
            resultContainer.html(templates.result(response.features[0].attributes))
          }
        }).fail(function () {
          resultContainer.html(templates.error())
        })
      }
    }).fail(function () {
      resultContainer.html(templates.error())
    })
  }

  function constructDivisionUrl (address) {
    var params = {
      Street: address.replace(/\+/g, ' '),
      outFields: 'division',
      f: 'json'
    }
    return wardDivisionEndpoint + '?' + $.param(params)
  }

  function constructPollingPlaceUrl (wardDivision) {
    var params = {
      ward: wardDivision.substr(0, 2),
      division: wardDivision.substr(2)
    }
    return pollingPlaceEndpoint + '?' + $.param(params)
  }

  // decode a uri into a kv representation :: str -> obj
  // https://github.com/yoshuawuyts/sheet-router/blob/master/qs.js
  function qs (uri) {
    var obj = {}
    var reg = new RegExp('([^?=&]+)(=([^&]*))?', 'g')
    uri.replace(/^.*\?/, '').replace(reg, map)
    return obj

    function map (a0, a1, a2, a3) {
      obj[window.decodeURIComponent(a1)] = window.decodeURIComponent(a3)
    }
  }
})(window.jQuery, window._)
