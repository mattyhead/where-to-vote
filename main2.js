Mapboard.default({
  // config options will go here

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
  topics: [{
    // a unique key for the topic
    key: 'property-assessments',
    // the icon displayed in the topic header. this can be any Font Awesome
    // class, minus the 'fa-' prefix. see http://fontawesome.io/
    icon: 'map-marker',
    // the full name of the topic
    label: 'Property Assessments',
    // keys for all of the data sources required for this topic (see 'dataSources' option above).
    dataSources: ['opa'],
    // the key for the basemap to show with this topic. basemaps are
    // usually defined in the base config file.
    basemap: 'pwd',
    // the type of map feature used to show the location of the address
    // e.g. address-marker, pwd-parcel, dor-parcel
    identifyFeature: 'address-marker',
    // the parcel (aka property boundary) layer to use with this topic
    parcels: 'pwd',
    // a list of components to display. see below for details.
    components: []
  }],

  defaultAddress: '1234 MARKET ST'
});