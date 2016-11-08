(function ($, _) {
  var wardDivisionEndpoint = 'https://gis.phila.gov/arcgis/rest/services/ElectionGeocoder/GeocodeServer/findAddressCandidates'
  var pollingPlaceEndpoint = 'https://api.phila.gov/polling-places/v1'

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
          var addresses = response.candidates.map(function (candidate) {
            return { label: candidate.address, division: candidate.attributes.division }
          })
          callback(addresses)
        } else {
          callback([])
        }
      })
    },
    select: function (evt, ui) {
      var wardDivision = ui.item.division
      var pollingPlaceUrl = constructPollingPlaceUrl(wardDivision)
      resultContainer.html(templates.loading)
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
  })

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
