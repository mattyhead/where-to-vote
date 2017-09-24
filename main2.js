Mapboard.default({
  // config options will go here
  baseConfig: '//raw.githubusercontent.com/mattyhead/config/master/config.js',
  rootStyle: {
    // give the mapboard a height of 600 pixels
    height: '600px'
  },
  dataSources: {
    // each source has a unique key, e.g. 'opa'
    opa: {
      // the base url of the api
      url: 'https://data.phila.gov/resource/w7rb-qrn8.json',
      // query string parameters to be added to the url
      params: {
        // each param is mapped to a function that gets passed the current 
        // address feature. use attributes from this feature to form data queries. 
        // in this case, a param of '?parcel_number=<opa_account_num>' will be
        // appended to the url.
        parcel_number: function(feature) {
          return feature.properties.opa_account_num;
        }
      },
      // a callback that unpacks the desired record(s) from the api. this
      // data will be kept in state and made available in the topic panel.
      success: function(data) {
        return data[0];
      }
    }
  },
  basemaps: {
    pwd: {
      url: '//tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityBasemap/MapServer',
      tiledLayers: [
        'cityBasemapLabels'
      ],
      type: 'featuremap'
    }
  },

  defaultAddress: '1234 MARKET ST'
});