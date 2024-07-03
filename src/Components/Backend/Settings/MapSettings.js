import { PanelBody, RangeControl, SelectControl, TextControl, ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import React from 'react';
import '../../../editor.scss';
import { updateData } from '../../../utils/functions';
import { MarkerIcon } from '../../../utils/icons';


const MapSettings = ({ attributes, setAttributes, handleInputChange, handleSuggestionClick, handleSearch, suggestions, handleFromLocationSearch, handleFromLocationSuggestionClick, handleFromLocationInput, fromLocationSuggestions }) => {
  const { mapOptions, mapOsm } = attributes;
  const { latitude, longitude, markerText, zoom, searchQuery, mapLayer, fromLocation } = mapOsm;
  const { showPrintButton, showImgDownload, controlPosition, printBtnPosition, showPdfDownload, showMarkerText, showDirectionFromYourLocation, getYourLocation, allowUsersToSetFromToLocation } = mapOptions;


  const validateLatitude = (value) => {
    const lat = parseFloat(value);
    if (lat >= -90 && lat <= 90) {
      setAttributes({ mapOsm: updateData(mapOsm, lat, "latitude") });
    } else {
      alert(__('Please enter a valid latitude between -90 and 90.', 'map-osm'));
    }
  };

  const validateLongitude = (value) => {
    const lon = parseFloat(value);
    if (lon >= -180 && lon <= 180) {
      setAttributes({ mapOsm: updateData(mapOsm, lon, "longitude") });
    } else {
      alert(__('Please enter a valid longitude between -180 and 180.', 'map-osm'));
    }
  };
  const validateFromLat = (value) => {
    const lat = parseFloat(value);
    if (lat >= -90 && lat <= 90) {
      setAttributes({ mapOsm: updateData(mapOsm, lat, "fromLocation", "lat") });
    } else {
      alert(__('Please enter a valid latitude between -90 and 90.', 'map-osm'));
    }
  };

  const validateFromLon = (value) => {
    const lon = parseFloat(value);
    if (lon >= -180 && lon <= 180) {
      setAttributes({ mapOsm: updateData(mapOsm, lon, "fromLocation", "lon") });
    } else {
      alert(__('Please enter a valid longitude between -180 and 180.', 'map-osm'));
    }
  };

  return (
    <>
      <PanelBody title={__('Map Settings', 'map-osm')}>
        {
          showDirectionFromYourLocation && (
            <>
              <div className="search-option">
                <TextControl
                  label={__("From", 'map-osm')}
                  value={fromLocation.locationName}
                  onChange={handleFromLocationInput}
                />
                <ToggleControl
                  label="Get Your Location"
                  checked={getYourLocation}
                  help={__("You need to turn off this toggle to edit from location", "map-osm")}
                  onChange={(newValue) => setAttributes({ mapOptions: updateData(mapOptions, newValue, 'getYourLocation') })}
                />
                <button className='search-btn' onClick={handleFromLocationSearch}>{__('SEARCH', 'map-osm')}</button>
                {fromLocationSuggestions.length > 0 && (
                  <ul style={{ border: '1px solid #ccc', padding: '10px' }}>
                    {fromLocationSuggestions.map((suggestion, index) => (
                      <li key={index} className='suggestion' onClick={() => handleFromLocationSuggestionClick(suggestion)}>
                        <span><MarkerIcon /></span>
                        <p>{suggestion.display_name}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", gap: "5px" }}>
                <TextControl
                  label={__('Latitude', 'map-osm')}
                  value={fromLocation.lat}
                  onChange={validateFromLat}
                />
                <TextControl
                  label={__('Longitude', 'map-osm')}
                  value={fromLocation.lon}
                  onChange={validateFromLon}
                />
              </div>
            </>
          )
        }


        <div className="search-option">
          <TextControl
            label={__(`${showDirectionFromYourLocation ? "Your Destination" : "Search Location"}`, 'map-osm')}
            value={searchQuery}
            onChange={handleInputChange}
          />
          <button className='search-btn' onClick={handleSearch}>{__('SEARCH', 'map-osm')}</button>
          {suggestions.length > 0 && (
            <ul style={{ border: '1px solid #ccc', padding: '10px' }}>
              {suggestions.map((suggestion, index) => (
                <li key={index} className='suggestion' onClick={() => handleSuggestionClick(suggestion)}>
                  <span><MarkerIcon /></span>
                  <p>{suggestion.display_name}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", gap: "5px" }}>
          <TextControl
            label={__('Latitude', 'map-osm')}
            value={latitude}
            onChange={validateLatitude}
          />
          <TextControl
            label={__('Longitude', 'map-osm')}
            value={longitude}
            onChange={validateLongitude}
          />
        </div>

        <ToggleControl
          label="Show Direction From Your Location"
          checked={showDirectionFromYourLocation}
          onChange={(newValue) => setAttributes({ mapOptions: updateData(mapOptions, newValue, 'showDirectionFromYourLocation') })}
        />


        <ToggleControl
          label="Show Marker Text"
          checked={showMarkerText}
          onChange={(newValue) => setAttributes({ mapOptions: updateData(mapOptions, newValue, 'showMarkerText') })}
        />
        <TextControl
          label={__('Marker Text', 'map-osm')}
          value={markerText}
          onChange={(value) => setAttributes({ mapOsm: updateData(mapOsm, value, "markerText") })}
        />

        <RangeControl
          label={__('Zoom Level', 'map-osm')}
          value={zoom}
          onChange={(value) => setAttributes({ mapOsm: updateData(mapOsm, value, "zoom") })}
          min={3}
          max={19}
        />

        <SelectControl
          label={__('Map Layer', 'map-osm')}
          value={mapLayer}
          options={[
            { label: 'Standard', value: 'standard' },
            { label: 'Satellite', value: 'satellite' },
            { label: 'Terrain', value: 'terrain' }
          ]}
          onChange={(value) => setAttributes({ mapOsm: updateData(mapOsm, value, "mapLayer") })}
        />

        <SelectControl
          label="Select Controller Position"
          value={controlPosition}
          options={[
            { value: 'topleft', label: 'Top Left' },
            { value: 'topright', label: 'Top Right' },
            { value: 'bottomleft', label: 'Bottom Left' },
            { value: 'bottomright', label: 'Bottom Right' },
          ]}
          onChange={value => setAttributes({ mapOptions: updateData(mapOptions, value, "controlPosition") })}
        />

      </PanelBody>

      <PanelBody title={__('Map Options', ("map-osm"))} initialOpen={false}>
        <ToggleControl
          label="Allow Users To Set From To Location"
          checked={allowUsersToSetFromToLocation}
          onChange={(newValue) => setAttributes({ mapOptions: updateData(mapOptions, newValue, 'allowUsersToSetFromToLocation') })}
        />
        <ToggleControl
          label="Show Print Map Button"
          checked={showPrintButton}
          onChange={(newValue) => setAttributes({ mapOptions: updateData(mapOptions, newValue, 'showPrintButton') })}
        />
        {
          mapOptions.showPrintButton && (
            <SelectControl
              label="Button Position"
              value={printBtnPosition}
              options={[
                { value: 'topleft', label: 'Top Left' },
                { value: 'topright', label: 'Top Right' },
                { value: 'bottomleft', label: 'Bottom Left' },
                { value: 'bottomright', label: 'Bottom Right' }
              ]}
              onChange={value => setAttributes({ mapOptions: updateData(mapOptions, value, 'printBtnPosition') })}
            />
          )
        }
        <ToggleControl
          label="Show Download Image Button"
          checked={showImgDownload}
          onChange={(newValue) => setAttributes({ mapOptions: updateData(mapOptions, newValue, 'showImgDownload') })}
        />
        <ToggleControl
          label="Show Download PDF Button"
          checked={showPdfDownload}
          onChange={(newValue) => setAttributes({ mapOptions: updateData(mapOptions, newValue, 'showPdfDownload') })}
        />
      </PanelBody>
    </>
  );
};

export default MapSettings;