import { __ } from '@wordpress/i18n';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet.fullscreen';
import 'leaflet.fullscreen/Control.FullScreen.css';
import 'leaflet/dist/leaflet.css';
import React, { useEffect, useRef, useState } from 'react';
import '../../editor.scss';
import Styles from '../Common/Styles';

const Frontend = ({ attributes }) => {
  const { cId, mapOptions, mapOsm, osmStyles } = attributes;
  const { latitude, longitude, markerText, zoom, mapLayer, searchQuery, fromLocation, currentLocation, toLocation } = mapOsm;
  const { controlPosition, showPrintButton, showMarkerText, showDirectionFromYourLocation, getYourLocation, getLocationControlPosition } = mapOptions;
  const { routeLineColor, toLocationMarkerColor, defaultMarkerColor, fromLocationMarkerColor, currentLocationMarkerColor, markerIconSize } = osmStyles;
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);

  console.log(routeLineColor);

  const [newMapLayer, setNewMapLayer] = useState(mapLayer);
  const [displayLocation, setDisplayLocation] = useState({ lat: latitude, lon: longitude, markerText, });


  const layersWithImg = [
    { name: "standard", img: "https://maps.gstatic.com/tactile/layerswitcher/ic_default_colors2-1x.png" },
    { name: "satellite", img: "https://maps.gstatic.com/tactile/layerswitcher/ic_satellite-1x.png" },
    { name: "terrain", img: "https://maps.gstatic.com/tactile/layerswitcher/ic_terrain-1x.png" }
  ];

  const activeLayer = layersWithImg.find(layer => layer.name === newMapLayer);
  const activeLayerImg = activeLayer.img;


  const getMarkerIcon = (iconContent, iconColor) => {
    let iconOptions = {
      iconSize: [markerIconSize, markerIconSize],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    };
    const iconUrlEncoded = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(iconContent);
    iconOptions.iconUrl = iconUrlEncoded;
    return L.icon(iconOptions);
  }


  useEffect(() => {
    if (!mapContainerRef.current) {
      console.error('Map container not found');
      return;
    }

    if (mapRef.current) {
      mapRef.current.remove();
    }

    const map = L.map(mapContainerRef.current, { fullscreenControl: true, fullscreenControlOptions: { position: controlPosition } }).setView([displayLocation.lat, displayLocation.lon], zoom);
    mapRef.current = map;


    // Define different base layers
    const standardLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.bplugins.com">bPlugins</a> contributors',
      maxZoom: 19
    });

    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: '&copy; <a href="https://www.bplugins.com">bPlugins</a> contributors',
      maxZoom: 19
    });

    const terrainLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.bplugins.com">bPlugins</a> contributors',
      maxZoom: 17
    });

    const layers = {
      standard: standardLayer,
      satellite: satelliteLayer,
      terrain: terrainLayer,
    };

    // Add the selected layer to the map
    layers[newMapLayer].addTo(map);


    const CustomLayersControl = L.Control.extend({
      onAdd: () => {
        const div = L.DomUtil.create('div', 'custom-layers-control');
        div.innerHTML = `
      <div class="layers-wrapper">
        <div class="layers-trigger" style="border: ${newMapLayer === "satellite" ? '2px solid white' : '2px solid black'}">
           <img src=${activeLayerImg} alt="" />
           <p style="color: ${newMapLayer === "satellite" ? 'white' : 'black'}">Layers</p>
        </div>
        <div class="layer-options">
          <div class="layer-option" data-layer="standard">
            <img src="https://maps.gstatic.com/tactile/layerswitcher/ic_default_colors2-1x.png" alt="" />
            <span>Standard</span>
          </div>
          <div class="layer-option" data-layer="satellite">
             <img src="https://maps.gstatic.com/tactile/layerswitcher/ic_satellite-1x.png" alt="" />
             <span>Satellite</span>
          </div>
          <div class="layer-option" data-layer="terrain">
            <img src="https://maps.gstatic.com/tactile/layerswitcher/ic_terrain-1x.png" alt="" />
            <span>Terrain</span>
          </div>
        </div>
      </div>
    `;

        const layersContainer = div.querySelector('.layers-wrapper');

        layersContainer.addEventListener('click', (event) => {
          const clickedElement = event.target;
          const parentDiv = clickedElement.parentNode;

          if (parentDiv.classList.contains('layer-option')) {
            const selectedLayer = parentDiv.dataset.layer;
            setNewMapLayer(selectedLayer);
          }
        });
        return div;
      }
    });

    // Add the custom Layers Control to the map
    map.addControl(new CustomLayersControl({ position: 'bottomleft' }));

    const GetCurrentLocationControl = L.Control.extend({
      onAdd: () => {
        const div = L.DomUtil.create('div', 'get-current-location-control');
        div.innerHTML = `
      <div title="Your Location" class="location-control-wrapper">
        <span>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M256 0c17.7 0 32 14.3 32 32V66.7C368.4 80.1 431.9 143.6 445.3 224H480c17.7 0 32 14.3 32 32s-14.3 32-32 32H445.3C431.9 368.4 368.4 431.9 288 445.3V480c0 17.7-14.3 32-32 32s-32-14.3-32-32V445.3C143.6 431.9 80.1 368.4 66.7 288H32c-17.7 0-32-14.3-32-32s14.3-32 32-32H66.7C80.1 143.6 143.6 80.1 224 66.7V32c0-17.7 14.3-32 32-32zM128 256a128 128 0 1 0 256 0 128 128 0 1 0 -256 0zm128-80a80 80 0 1 1 0 160 80 80 0 1 1 0-160z"/></svg>
        </span>
      </div>
    `;

        const getLocationContainer = div.querySelector('.location-control-wrapper');

        getLocationContainer.addEventListener('click', () => {
          // setAttributes({
          //   mapOsm: produce(mapOsm, draft => {
          //     draft.currentLocation.showedCurrentLocation = true;
          //   })
          // });
          let iconColor = currentLocationMarkerColor;
          let iconContent = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M320 64A64 64 0 1 0 192 64a64 64 0 1 0 128 0zm-96 96c-35.3 0-64 28.7-64 64v48c0 17.7 14.3 32 32 32h1.8l11.1 99.5c1.8 16.2 15.5 28.5 31.8 28.5h38.7c16.3 0 30-12.3 31.8-28.5L318.2 304H320c17.7 0 32-14.3 32-32V224c0-35.3-28.7-64-64-64H224zM132.3 394.2c13-2.4 21.7-14.9 19.3-27.9s-14.9-21.7-27.9-19.3c-32.4 5.9-60.9 14.2-82 24.8c-10.5 5.3-20.3 11.7-27.8 19.6C6.4 399.5 0 410.5 0 424c0 21.4 15.5 36.1 29.1 45c14.7 9.6 34.3 17.3 56.4 23.4C130.2 504.7 190.4 512 256 512s125.8-7.3 170.4-19.6c22.1-6.1 41.8-13.8 56.4-23.4c13.7-8.9 29.1-23.6 29.1-45c0-13.5-6.4-24.5-14-32.6c-7.5-7.9-17.3-14.3-27.8-19.6c-21-10.6-49.5-18.9-82-24.8c-13-2.4-25.5 6.3-27.9 19.3s6.3 25.5 19.3 27.9c30.2 5.5 53.7 12.8 69 20.5c3.2 1.6 5.8 3.1 7.9 4.5c3.6 2.4 3.6 7.2 0 9.6c-8.8 5.7-23.1 11.8-43 17.3C374.3 457 318.5 464 256 464s-118.3-7-157.7-17.9c-19.9-5.5-34.2-11.6-43-17.3c-3.6-2.4-3.6-7.2 0-9.6c2.1-1.4 4.8-2.9 7.9-4.5c15.3-7.7 38.8-14.9 69-20.5z" fill="' + iconColor + '"/></svg>';
          map.setView([currentLocation.lat, currentLocation.lon], 18);
          L.marker([currentLocation?.lat, currentLocation?.lon], { icon: getMarkerIcon(iconContent, iconColor) }).bindPopup('Your are here :)').addTo(map).openPopup();
        })

        return div;
      }
    });
    // Add the Get Current Location Control to the map
    map.addControl(new GetCurrentLocationControl({ position: getLocationControlPosition }));


    let iconColor = defaultMarkerColor;
    let iconContent = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z" fill="' + iconColor + '"/></svg>';

    const marker = L.marker([latitude, longitude], { icon: getMarkerIcon(iconContent, iconColor) });

    if (latitude && longitude && !showDirectionFromYourLocation) {
      marker.addTo(map);
    }

    if (showMarkerText) {
      marker.bindPopup(`<b>${markerText}</b>`).openPopup();
    }

    if (currentLocation.showedCurrentLocation) {
      let iconColor = currentLocationMarkerColor;
      let iconContent = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M320 64A64 64 0 1 0 192 64a64 64 0 1 0 128 0zm-96 96c-35.3 0-64 28.7-64 64v48c0 17.7 14.3 32 32 32h1.8l11.1 99.5c1.8 16.2 15.5 28.5 31.8 28.5h38.7c16.3 0 30-12.3 31.8-28.5L318.2 304H320c17.7 0 32-14.3 32-32V224c0-35.3-28.7-64-64-64H224zM132.3 394.2c13-2.4 21.7-14.9 19.3-27.9s-14.9-21.7-27.9-19.3c-32.4 5.9-60.9 14.2-82 24.8c-10.5 5.3-20.3 11.7-27.8 19.6C6.4 399.5 0 410.5 0 424c0 21.4 15.5 36.1 29.1 45c14.7 9.6 34.3 17.3 56.4 23.4C130.2 504.7 190.4 512 256 512s125.8-7.3 170.4-19.6c22.1-6.1 41.8-13.8 56.4-23.4c13.7-8.9 29.1-23.6 29.1-45c0-13.5-6.4-24.5-14-32.6c-7.5-7.9-17.3-14.3-27.8-19.6c-21-10.6-49.5-18.9-82-24.8c-13-2.4-25.5 6.3-27.9 19.3s6.3 25.5 19.3 27.9c30.2 5.5 53.7 12.8 69 20.5c3.2 1.6 5.8 3.1 7.9 4.5c3.6 2.4 3.6 7.2 0 9.6c-8.8 5.7-23.1 11.8-43 17.3C374.3 457 318.5 464 256 464s-118.3-7-157.7-17.9c-19.9-5.5-34.2-11.6-43-17.3c-3.6-2.4-3.6-7.2 0-9.6c2.1-1.4 4.8-2.9 7.9-4.5c15.3-7.7 38.8-14.9 69-20.5z" fill="' + iconColor + '"/></svg>';
      L.marker([currentLocation?.lat, currentLocation?.lon], { icon: getMarkerIcon(iconContent, iconColor) }).bindPopup('Your are here :)').addTo(map).openPopup();
    }

    if (showDirectionFromYourLocation && fromLocation.lat && fromLocation.lon) {
      // Define waypoints with names
      const waypoints = [
        {
          latLng: L.latLng(fromLocation.lat, fromLocation.lon),
          name: fromLocation.locationName
        },
        {
          latLng: L.latLng(toLocation.lat, toLocation.lon),
          name: toLocation.locationName
        }
      ];

      L.Routing.control({
        waypoints,
        lineOptions: {
          styles: [ // M
            { color: routeLineColor, opacity: 0.6, weight: 10 }
          ]
        },
        createMarker: (i, waypoint, n) => {
          let iconColor;
          let iconContent;

          if (i === 0) {
            iconColor = fromLocationMarkerColor;
            if (fromLocation.lat === currentLocation.lat && fromLocation.lon === currentLocation.lon) {
              iconContent = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M320 64A64 64 0 1 0 192 64a64 64 0 1 0 128 0zm-96 96c-35.3 0-64 28.7-64 64v48c0 17.7 14.3 32 32 32h1.8l11.1 99.5c1.8 16.2 15.5 28.5 31.8 28.5h38.7c16.3 0 30-12.3 31.8-28.5L318.2 304H320c17.7 0 32-14.3 32-32V224c0-35.3-28.7-64-64-64H224zM132.3 394.2c13-2.4 21.7-14.9 19.3-27.9s-14.9-21.7-27.9-19.3c-32.4 5.9-60.9 14.2-82 24.8c-10.5 5.3-20.3 11.7-27.8 19.6C6.4 399.5 0 410.5 0 424c0 21.4 15.5 36.1 29.1 45c14.7 9.6 34.3 17.3 56.4 23.4C130.2 504.7 190.4 512 256 512s125.8-7.3 170.4-19.6c22.1-6.1 41.8-13.8 56.4-23.4c13.7-8.9 29.1-23.6 29.1-45c0-13.5-6.4-24.5-14-32.6c-7.5-7.9-17.3-14.3-27.8-19.6c-21-10.6-49.5-18.9-82-24.8c-13-2.4-25.5 6.3-27.9 19.3s6.3 25.5 19.3 27.9c30.2 5.5 53.7 12.8 69 20.5c3.2 1.6 5.8 3.1 7.9 4.5c3.6 2.4 3.6 7.2 0 9.6c-8.8 5.7-23.1 11.8-43 17.3C374.3 457 318.5 464 256 464s-118.3-7-157.7-17.9c-19.9-5.5-34.2-11.6-43-17.3c-3.6-2.4-3.6-7.2 0-9.6c2.1-1.4 4.8-2.9 7.9-4.5c15.3-7.7 38.8-14.9 69-20.5z" fill="' + iconColor + '"/></svg>';
            } else {
              iconContent = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z" fill="' + iconColor + '"/></svg>';
            }

          } else if (i === n - 1) {
            iconColor = toLocationMarkerColor;
            iconContent = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z" fill="' + iconColor + '"/></svg>';
          } else {
            iconColor = 'blue';
            iconContent = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z" fill="' + iconColor + '"/></svg>';
          }
          const customRoutingIcon = getMarkerIcon(iconContent, iconColor);
          const marker = L.marker(waypoint.latLng, {
            icon: customRoutingIcon
          });
          marker.bindPopup(waypoint.name);
          return marker;
        }
      }).addTo(map);
    }


    let clickCounter = 0;

    // Map Click Option
    map.on('click', function (e) {
      clickCounter++;
      const { lat, lng } = e.latlng;

      if (clickCounter === 2) {
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=${zoom}`)
          .then(response => response.json())
          .then(data => {
            if (data && data.display_name) {
              L.popup()
                .setLatLng(e.latlng)
                .setContent(`
                   ${data.display_name}<br>
                  <b>Latitude:</b> ${lat}<br>
                  <b>Longitude:</b> ${lng}
              `).openOn(map);
            }
          });
      }

      if (clickCounter === 2) {
        clickCounter = 0;
      }
    });


    // Create Custom Print Button
    if (showPrintButton) {
      const printButton = L.control({ position: mapOptions.printBtnPosition });
      printButton.onAdd = function () {
        const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
        div.innerHTML = '<a href="#" title="Print Map" id="print-map-btn"></a>';
        div.onclick = function () {
          window.print();
        };
        return div;
      };

      printButton.addTo(map);
    }


    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [fromLocationMarkerColor, toLocationMarkerColor, currentLocationMarkerColor, defaultMarkerColor, markerIconSize, currentLocation, markerText, searchQuery, zoom, latitude, longitude, fromLocation, mapOptions, mapLayer, routeLineColor]);

  // Function to export the map as an image
  const exportAsImage = () => {
    toPng(document.getElementById('map'))
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = 'map.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch((error) => {
        console.error('Failed to export map as image:', error);
      });
  };

  // Function to export the map as a PDF
  const exportAsPdf = () => {
    toPng(document.getElementById('map'))
      .then((dataUrl) => {
        const pdf = new jsPDF();
        pdf.addImage(dataUrl, 'PNG', 0, 0, 210, 297);
        pdf.save('map.pdf');
      })
      .catch((error) => {
        console.error('Failed to export map as PDF:', error);
      });
  };


  return (
    <>
      <Styles attributes={attributes} />

      <div id={`mainWrapper-${cId}`} style={{ position: "relative" }}>
        <div ref={mapContainerRef} id="map"></div>
        {/* <div className='from-to-location-div'>
          <div className='from-input' >
            <MarkerIcon />
            <input
              type="text"
              placeholder="From"
              value={fromLocation.locationName}
              onChange={(e) => backendInputChange(e.target.value, "from")}
            />
          </div>
          <div className='destination-input'>
            <MarkerIcon />
            <input
              type="text"
              placeholder="Destination"
              value={toLocation.locationName}
              onChange={(e) => backendInputChange(e.target.value, "to")}
            />
          </div>
        </div> */}
        <button className='img-download-btn' onClick={exportAsImage}>{__('Export as Image', 'map-osm')}</button>
        <button className='pdf-download-btn' onClick={exportAsPdf}>{__('Export as PDF', 'map-osm')}</button>
      </div>
    </>
  );
};

export default Frontend;