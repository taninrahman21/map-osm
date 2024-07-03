import { compose } from '@wordpress/compose';
import { withSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { toPng } from 'html-to-image';
import { produce } from 'immer';
import jsPDF from 'jspdf';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet.fullscreen';
import 'leaflet.fullscreen/Control.FullScreen.css';
import 'leaflet/dist/leaflet.css';
import React, { useEffect, useRef, useState } from 'react';
import '../../editor.scss';
import { updateData } from '../../utils/functions';
import { MarkerIcon } from '../../utils/icons';
import Styles from '../Common/Styles';

const MapOsm = compose(withSelect((select) => { return { device: select("core/edit-post").__experimentalGetPreviewDeviceType()?.toLowerCase() } }))(({ attributes, setAttributes, device }) => {
  const { cId, mapOptions, mapOsm, osmStyles } = attributes;
  const { latitude, longitude, markerText, zoom, mapLayer, searchQuery, fromLocation, toLocation } = mapOsm;
  const { controlPosition, showPrintButton, showMarkerText, showDirectionFromYourLocation, getYourLocation } = mapOptions;
  const { markerIconColor } = osmStyles;
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);


  const [initialUserLocation, setInitialUserLocation] = useState(null);

  if (getYourLocation) {
    setAttributes({
      mapOsm: produce(mapOsm, draft => {
        draft.fromLocation.lat = initialUserLocation?.lat;
        draft.fromLocation.lon = initialUserLocation?.lon;
        draft.fromLocation.locationName = initialUserLocation?.locationName;
      })
    });
  }

  const layersWithImg = [
    { name: "standard", img: "https://maps.gstatic.com/tactile/layerswitcher/ic_default_colors2-1x.png" },
    { name: "satellite", img: "https://maps.gstatic.com/tactile/layerswitcher/ic_satellite-1x.png" },
    { name: "terrain", img: "https://maps.gstatic.com/tactile/layerswitcher/ic_terrain-1x.png" }
  ];

  const activeLayer = layersWithImg.find(layer => layer.name === mapLayer);
  const activeLayerImg = activeLayer.img;

  const getMarkerIconUrl = (color) => {
    const encodedColor = encodeURIComponent(color);
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 384 512'%3E%3Cpath fill='${encodedColor}' d='M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z'/%3E%3C/svg%3E`;
  };

  const createCustomIcon = (color) => {
    const markerIconUrl = getMarkerIconUrl(color);
    return L.icon({
      iconUrl: markerIconUrl,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
      className: "custom-marker-icon"
    });
  };

  console.log(fromLocation);

  useEffect(() => {
    if (!mapContainerRef.current) {
      console.error('Map container not found');
      return;
    }

    if (mapRef.current) {
      mapRef.current.remove();
    }

    const map = L.map(mapContainerRef.current, { fullscreenControl: true, fullscreenControlOptions: { position: controlPosition } }).setView([latitude, longitude], zoom);
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
    layers[mapLayer].addTo(map);


    const CustomLayersControl = L.Control.extend({
      onAdd: () => {
        const div = L.DomUtil.create('div', 'custom-layers-control');
        div.innerHTML = `
      <div class="layers-wrapper">
        <div class="layers-trigger" style="border: ${mapLayer === "satellite" ? '2px solid white' : '2px solid black'}">
           <img src=${activeLayerImg} alt="" />
           <p style="color: ${mapLayer === "satellite" ? 'white' : 'black'}">Layers</p>
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
            setAttributes({ mapOsm: updateData(mapOsm, selectedLayer, "mapLayer") });
          }
        });
        return div;
      }
    });

    // Add the custom Layers Control to the map
    map.addControl(new CustomLayersControl({ position: 'bottomleft' }));

    const customIcon = createCustomIcon(markerIconColor);

    const marker = L.marker([latitude, longitude], { icon: customIcon }).addTo(map);

    if (showMarkerText) {
      marker.bindPopup(`<b>${markerText}</b>`).openPopup();
    }

    if (showDirectionFromYourLocation && fromLocation.lat && fromLocation.lon) {
      setAttributes({
        mapOsm: produce(mapOsm, draft => {
          draft.toLocation.lat = latitude;
          draft.toLocation.lon = longitude;
          draft.toLocation.locationName = searchQuery;
        })
      });

      // Define waypoints with names
      const waypoints = [
        {
          latLng: L.latLng(fromLocation.lat, fromLocation.lon),
          name: fromLocation.locationName
        },
        {
          latLng: L.latLng(latitude, longitude),
          name: searchQuery
        }
      ];

      L.Routing.control({
        waypoints,
        lineOptions: {
          styles: [ // M
            { color: 'Orangered', opacity: 0.6, weight: 10 }
          ]
        },
        createMarker: (i, waypoint, n) => {
          const iconColor = i === 0 ? 'green' : (i === n - 1 ? 'red' : 'blue');
          const customRoutingIcon = createCustomIcon(iconColor);
          const marker = L.marker(waypoint.latLng, {
            icon: customRoutingIcon
          });
          marker.bindPopup(waypoint.name); // Bind popup with waypoint name
          return marker;
        }
      }).addTo(map);
    }


    // Map Click Option
    map.on('click', function (e) {
      const { lat, lng } = e.latlng;


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
  }, [osmStyles, device, mapOsm, mapOptions]);


  useEffect(() => {
    if (!fromLocation.lat || !fromLocation.lon) {
      navigator.geolocation.getCurrentPosition((position) => {
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`)
          .then(response => response.json())
          .then(data => {
            if (data && data.display_name) {
              setInitialUserLocation({
                lat: position.coords.latitude,
                lon: position.coords.longitude,
                locationName: data.display_name
              });
              setAttributes({
                mapOsm: produce(mapOsm, draft => {
                  draft.fromLocation.lat = position.coords.latitude;
                  draft.fromLocation.lon = position.coords.longitude;
                  draft.fromLocation.locationName = data.display_name;
                })
              });
            }
          });
      }, (error) => {
        console.error('Error fetching current location:', error);
      });
    }
  }, [fromLocation.lat, fromLocation.lon, fromLocation.locationName, setAttributes, mapOsm, zoom]);

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

  const handleFromLocationChange = (e) => {
    const locationName = e.target.value;
    setAttributes({
      mapOsm: produce(mapOsm, draft => {
        draft.fromLocation.locationName = locationName;
      })
    });
  };

  const handleToLocationChange = (e) => {
    const locationName = e.target.value;
    setAttributes({
      mapOsm: produce(mapOsm, draft => {
        draft.toLocation.locationName = locationName;
      })
    });
  };



  return (
    <>
      <Styles attributes={attributes} />

      <div id={`mainWrapper-${cId}`}>
        <div ref={mapContainerRef} style={{ position: "relative" }} id="map">
          <div className='from-to-location-div'>
            <div className='from-input' >
              <MarkerIcon />
              <input
                type="text"
                placeholder="From"
                value={fromLocation.locationName}
                onChange={handleFromLocationChange}
              />
            </div>
            <div className='destination-input'>
              <MarkerIcon />
              <input
                type="text"
                placeholder="Destination"
                value={toLocation.locationName}
                onChange={handleToLocationChange}
              />
            </div>
          </div>
        </div>
      </div>
      <button className='img-download-btn' onClick={exportAsImage}>{__('Export as Image', 'map-osm')}</button>
      <button className='pdf-download-btn' onClick={exportAsPdf}>{__('Export as PDF', 'map-osm')}</button>
    </>
  );
});

export default MapOsm;