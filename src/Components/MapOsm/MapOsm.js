import { compose } from '@wordpress/compose';
import { withSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import L from 'leaflet';
import 'leaflet.fullscreen';
import 'leaflet.fullscreen/Control.FullScreen.css';
import 'leaflet/dist/leaflet.css';
import React, { useEffect, useRef } from 'react';
import '../../editor.scss';
import Styles from '../Common/Styles';

const MapOsm = compose(withSelect((select) => { return { device: select("core/edit-post").__experimentalGetPreviewDeviceType()?.toLowerCase() } }))(({ attributes, setAttributes, device }) => {
  const { cId, latitude, longitude, zoom, searchQuery, markerIconColor, controlPosition, markerText, mapLayer, mapOptions } = attributes;
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);




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
    const standardLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
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


    const customIcon = createCustomIcon(markerIconColor);

    L.marker([latitude, longitude], { icon: customIcon }).addTo(map)
      .bindPopup(`<b>${markerText}</b>`)
      .openPopup();


    map.on('click', function (e) {
      const { lat, lng } = e.latlng;
      setAttributes({ latitude: lat, longitude: lng });

      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=${zoom}`)
        .then(response => response.json())
        .then(data => {
          if (data && data.display_name) {
            setAttributes({ searchQuery: data.display_name, markerText: data.display_name });
          }
        });
    });

    // Create Custom Print Button
    if (mapOptions.showPrintButton) {
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
      // Clean up map instance on unmount
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

    };
  }, [latitude, longitude, zoom, searchQuery, controlPosition, markerText, markerIconColor, device, mapLayer, mapOptions]);


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

      <div id={`mainWrapper-${cId}`}>
        <div ref={mapContainerRef} id="map"></div>
        <button className='img-download-btn' onClick={exportAsImage}>{__('Export as Image', 'map-osm')}</button>
        <button className='pdf-download-btn' onClick={exportAsPdf}>{__('Export as PDF', 'map-osm')}</button>
      </div>
    </>
  );
})

export default MapOsm;