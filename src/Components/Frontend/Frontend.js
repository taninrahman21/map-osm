import L from 'leaflet';
import 'leaflet.fullscreen';
import 'leaflet.fullscreen/Control.FullScreen.css';
import 'leaflet/dist/leaflet.css';
import React, { useEffect } from 'react';
import '../../editor.scss';
import Styles from '../Common/Styles';

const Frontend = ({ attributes }) => {
  const { cId, latitude, longitude, zoom, searchQuery, markerIconColor, controlPosition, markerText } = attributes;



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
    const map = L.map('map', { fullscreenControl: true, fullscreenControlOptions: { position: controlPosition } }).setView([latitude, longitude], zoom);


    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.bplugins.com">bPlugins</a> contributors',
      maxZoom: 19
    }).addTo(map);

    const customIcon = createCustomIcon(markerIconColor);

    L.marker([latitude, longitude], { icon: customIcon }).addTo(map)
      .bindPopup(`<b>${markerText}</b>`)
      .openPopup();


    return () => map.remove();
  }, [latitude, longitude, zoom, searchQuery, controlPosition, markerText, markerIconColor]);



  return (
    <>
      <Styles attributes={attributes} />

      <div id={`mainWrapper-${cId}`}>
        <div id="map"></div>
      </div>
    </>
  );
};

export default Frontend;