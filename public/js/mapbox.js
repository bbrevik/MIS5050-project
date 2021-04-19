/* eslint-disable no-undef */
// https://www.mapbox.com/

// https://docs.mapbox.com/

// const locations = JSON.parse(document.getElementById('map').dataset.locations);
// console.log(locations);
export function displayMap(locations) {
  // console.log(locations);
  mapboxgl.accessToken =
    'pk.eyJ1IjoiYmJyZXZpayIsImEiOiJja25udjM3cHQwYWV0MzBwZ21jbm0wNjllIn0.r25WK2_IRVdPl-E3k9jh-g';

  let map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/bbrevik/ckno1ge292k0317ud4jphg3vw',
    zoom: 3,
    scrollZoom: false,
  });

  const bounds = new mapboxgl.LngLatBounds();

  // need to create a pin for the map
  locations.forEach((x) => {
    // Create marker
    const point = document.createElement('div');
    point.className = 'marker';

    // Add a marker to the map
    new mapboxgl.Marker({
      element: point,
      anchor: 'bottom',
    })
      .setLngLat(x.coordinates)
      .addTo(map);

    // set a popup with information where the marker is
    new mapboxgl.Popup({
      offset: 25,
    })
      .setLngLat(x.coordinates)
      .setHTML(`<p>Day ${x.day}: ${x.description}</p>`)
      .addTo(map);

    // Extend map bounds to include current location
    bounds.extend(x.coordinates);
  });
  // this is the bounds of the points and will add padding to show the points on the map
  map.fitBounds(bounds, {
    padding: {
      top: 220,
      bottom: 220,
      left: 115,
      right: 115,
    },
  });
}
