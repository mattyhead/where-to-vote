(function ($, _) {
  var endpoint = 'https://api.phila.gov/open311/v2/'
  var params = qs(window.location.search.substr(1))
  // Use mustache.js style brackets in templates
  _.templateSettings = { interpolate: /\{\{(.+?)\}\}/g }
  var templates = {
    result: _.template($('#tmpl-result').html()),
    error: _.template($('#tmpl-error').html()),
    loading: $('#tmpl-loading').html()
  }
  var resultContainer = $('#result')

  if (params.id) {
    resultContainer.html(templates.loading)
    var queryUrl = constructQueryUrl(params.id)
    $.getJSON(queryUrl, function (response) {
      if (response.length < 1 || response[0].errors) {
        // If there's no response or if there's an error, indicate such
        resultContainer.html(templates.error({ service_request_id: params.id }))
      } else {
        // Otherwise display the result
        var request = response[0]
        console.log(request)
        resultContainer.html(templates.result(request))
      }
    }).fail(function () {
      resultContainer.html(templates.error({ service_request_id: params.id }))
    })
  }

  function constructQueryUrl (id) {
    return endpoint + 'requests/' + params.id + '.json'
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
