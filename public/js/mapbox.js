/* eslint-disable no-undef */
// https://www.mapbox.com/

// https://docs.mapbox.com/

// const allLocations = JSON.parse(document.getElementById('map').dataset.allLocations);
// console.log(allLocations);
export const displayMap = (allLocations) => {
  // console.log(allLocations);
  mapboxgl.accessToken =
    'pk.eyJ1IjoiYmJyZXZpayIsImEiOiJja25udjM3cHQwYWV0MzBwZ21jbm0wNjllIn0.r25WK2_IRVdPl-E3k9jh-g';

  let map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/bbrevik/ckno1ge292k0317ud4jphg3vw',
    scrollZoom: false,
  });

  const bounds = new mapboxgl.LngLatBounds();

  allLocations.forEach((location) => {
    // Create marker
    const item = document.createElement('div');
    item.className = 'marker';

    // Add a marker to the map
    new mapboxgl.Marker({
      element: item,
      anchor: 'bottom',
    })
      .setLngLat(location.coordinates)
      .addTo(map);

    // set a popup with information where the marker is
    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(location.coordinates)
      .setHTML(`<p>Day ${location.day}: ${location.description}</p>`)
      .addTo(map);

    // Extend map bounds to include current location
    bounds.extend(location.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 150,
      bottom: 120,
      left: 115,
      right: 115,
    },
  });
};
