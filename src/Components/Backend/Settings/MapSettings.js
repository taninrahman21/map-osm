import { PanelBody, RangeControl, SelectControl, TextControl, ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { produce } from 'immer';
import { debounce } from 'lodash';
import React, { useState } from 'react';
import '../../../editor.scss';
import { updateData } from '../../../utils/functions';
import { MarkerIcon } from '../../../utils/icons';


const MapSettings = ({ attributes, setAttributes }) => {
  const { mapOptions, mapOsm } = attributes;
  const { latitude, longitude, markerText, zoom, searchQuery, mapLayer, fromLocation, toLocation, currentLocation } = mapOsm;
  const { showPrintButton, showImgDownload, controlPosition, printBtnPosition, showPdfDownload, showMarkerText, showDirectionFromYourLocation, getYourLocation, allowUsersToSetFromToLocation, getLocationControlPosition, setSearchLocationOnDblClick, showLocationDetailsOnClick } = mapOptions;
  const [toLocationSuggestions, setToLocationSuggestions] = useState([]);
  const [fromLocationSuggestions, setFromLocationSuggestions] = useState([]);


  // Fetch Location Suggestions Function
  const fetchSuggestions = debounce((query, callback) => {
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`)
      .then(response => response.json())
      .then(data => {
        if (data) {
          callback(data);
        }
      })
      .catch(error => console.error('Error fetching suggestions:', error));
  }, 300);

  // Handle Map Settings Input Change Function
  const handleSettingsInputChange = (value, type) => {
    if (type === 'from') {
      setAttributes({
        mapOsm: produce(mapOsm, draft => {
          draft.fromLocation.locationName = value;
        })
      });
      fetchSuggestions(value, setFromLocationSuggestions);
    } else if (type === 'to') {
      setAttributes({
        mapOsm: produce(mapOsm, draft => {
          draft.searchQuery = value;
          draft.markerText = value;
        })
      });
      fetchSuggestions(value, setToLocationSuggestions);
    }
  };

  const searchLocationViaInputText = async (value) => {
    return fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${value}`)
      .then(response => response.json())
      .then(data => {
        return data;
      }).catch(error => console.error('Error fetching suggestions:', error));
  }

  const handleSearchBtnClick = async (value, type) => {
    const locations = await searchLocationViaInputText(value);
    let place;

    if (locations && locations.length > 0) {
      place = locations[0];
    }

    if (type === "from") {
      setAttributes({
        mapOsm: produce(mapOsm, draft => {
          draft.fromLocation.lat = parseFloat(place.lat);
          draft.fromLocation.lon = parseFloat(place.lon);
        })
      });
      setFromLocationSuggestions([]);
    } else if (type === "to") {
      setAttributes({
        mapOsm: produce(mapOsm, draft => {
          draft.latitude = parseFloat(place.lat);
          draft.longitude = parseFloat(place.lon);
          draft.toLocation.lat = parseFloat(place.lat);
          draft.toLocation.lon = parseFloat(place.lon);
          draft.toLocation.locationName = searchQuery;
          draft.currentLocation.showedCurrentLocation = false;
        })
      });
      setToLocationSuggestions([]);
    }
  };

  // Handle Suggestion Click Function
  const handleSuggestionClick = (suggestion, type) => {
    if (type === "from") {
      setAttributes({
        mapOsm: produce(mapOsm, draft => {
          draft.fromLocation.lat = parseFloat(suggestion.lat);
          draft.fromLocation.lon = parseFloat(suggestion.lon);
          draft.fromLocation.locationName = suggestion.display_name;
        })
      });
      setFromLocationSuggestions([]);
    } else if (type === "to") {
      setAttributes({
        mapOsm: produce(mapOsm, draft => {
          draft.latitude = parseFloat(suggestion.lat);
          draft.longitude = parseFloat(suggestion.lon);
          draft.toLocation.lat = parseFloat(suggestion.lat);
          draft.toLocation.lon = parseFloat(suggestion.lon);
          draft.toLocation.locationName = suggestion.display_name;
          draft.searchQuery = suggestion.display_name;
          draft.markerText = suggestion.display_name;
          draft.currentLocation.showedCurrentLocation = false;
        })
      });
      setToLocationSuggestions([]);
    }
  }


  const validateLatitude = (value) => {
    const lat = parseFloat(value);
    if (lat >= -90 && lat <= 90) {
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${longitude}`)
        .then(res => res.json())
        .then(data => {
          if (data) {
            setAttributes({
              mapOsm: produce(mapOsm, draft => {
                draft.latitude = lat;
                draft.toLocation.lat = lat;
                draft.searchQuery = data.display_name;
                draft.toLocation.locationName = data.display_name;
                draft.currentLocation.showedCurrentLocation = false;
              })
            })
          }
        })
    } else {
      alert(__('Please enter a valid latitude between -90 and 90.', 'map-osm'));
    }
  };

  const validateLongitude = (value) => {
    const lon = parseFloat(value);
    if (lon >= -180 && lon <= 180) {
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${lon}`)
        .then(res => res.json())
        .then(data => {
          if (data) {
            setAttributes({
              mapOsm: produce(mapOsm, draft => {
                draft.longitude = lon;
                draft.toLocation.lon = lon;
                draft.searchQuery = data.display_name;
                draft.toLocation.locationName = data.display_name;
                draft.currentLocation.showedCurrentLocation = false;
              })
            })
          }
        })
    } else {
      alert(__('Please enter a valid longitude between -180 and 180.', 'map-osm'));
    }
  };

  const validateFromLat = (value) => {
    const lat = parseFloat(value);
    if (lat >= -90 && lat <= 90) {
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${fromLocation.lon}`)
        .then(res => res.json())
        .then(data => {
          if (data) {
            setAttributes({
              mapOsm: produce(mapOsm, draft => {
                draft.fromLocation.lat = lat;
                draft.fromLocation.locationName = data.display_name;
                draft.currentLocation.showedCurrentLocation = false;
              })
            })
          }
        })
    } else {
      alert(__('Please enter a valid latitude between -90 and 90.', 'map-osm'));
    }
  };

  const validateFromLon = (value) => {
    const lon = parseFloat(value);
    if (lon >= -180 && lon <= 180) {
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${fromLocation.lat}&lon=${lon}`)
        .then(res => res.json())
        .then(data => {
          if (data) {
            setAttributes({
              mapOsm: produce(mapOsm, draft => {
                draft.fromLocation.lon = lon;
                draft.fromLocation.locationName = data.display_name;
                draft.currentLocation.showedCurrentLocation = false;
              })
            })
          }
        })
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
                  onChange={(value) => handleSettingsInputChange(value, "from")}
                />
                <button className='search-btn' onClick={() => handleSearchBtnClick(fromLocation.locationName, "from")}>{__('SEARCH', 'map-osm')}</button>
                {fromLocationSuggestions.length > 0 && (
                  <ul style={{ border: '1px solid #ccc', padding: '10px' }}>
                    {fromLocationSuggestions.map((suggestion, index) => (
                      <li key={index} className='suggestion' onClick={() => handleSuggestionClick(suggestion, "from")}>
                        <span><MarkerIcon /></span>
                        <p>{suggestion.display_name}</p>
                      </li>
                    ))}
                  </ul>
                )}
                <ToggleControl
                  label="Get Your Location"
                  checked={getYourLocation}
                  help={__("You need to turn off this toggle to edit from location", "map-osm")}
                  onChange={(newValue) => setAttributes({ mapOptions: updateData(mapOptions, newValue, 'getYourLocation') })}
                />
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
            onChange={(value) => handleSettingsInputChange(value, "to")}
            placeholder='Type Location Name'
          />
          <button className='search-btn' onClick={() => handleSearchBtnClick(searchQuery, "to")}>{__('SEARCH', 'map-osm')}</button>
          {toLocationSuggestions.length > 0 && (
            <ul style={{ border: '1px solid #ccc', padding: '10px' }}>
              {toLocationSuggestions.map((suggestion, index) => (
                <li key={index} className='suggestion' onClick={() => handleSuggestionClick(suggestion, "to")}>
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
            placeholder='Type Valid Latitude'
          />
          <TextControl
            label={__('Longitude', 'map-osm')}
            value={longitude}
            onChange={validateLongitude}
            placeholder='Type Valid Longitude'
          />
        </div>

        {
          currentLocation.lat !== toLocation.lat && <ToggleControl
            label="Show Direction From Your Location"
            checked={showDirectionFromYourLocation}
            onChange={(newValue) => setAttributes({ mapOptions: updateData(mapOptions, newValue, 'showDirectionFromYourLocation') })}
          />
        }

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
          label="FullScreen Zoom Controller Position"
          value={controlPosition}
          options={[
            { value: 'topleft', label: 'Top Left' },
            { value: 'topright', label: 'Top Right' },
            { value: 'bottomleft', label: 'Bottom Left' },
            { value: 'bottomright', label: 'Bottom Right' },
          ]}
          onChange={value => setAttributes({ mapOptions: updateData(mapOptions, value, "controlPosition") })}
        />
        <SelectControl
          label="Get Location Controller Position"
          value={getLocationControlPosition}
          options={[
            { value: 'topleft', label: 'Top Left' },
            { value: 'topright', label: 'Top Right' },
            { value: 'bottomleft', label: 'Bottom Left' },
            { value: 'bottomright', label: 'Bottom Right' },
          ]}
          onChange={value => setAttributes({ mapOptions: updateData(mapOptions, value, "getLocationControlPosition") })}
        />

      </PanelBody>

      <PanelBody title={__('Map Options', ("map-osm"))} initialOpen={false}>
        {/* <ToggleControl
          label="Allow Users To Set From To Location"
          checked={allowUsersToSetFromToLocation}
          onChange={(newValue) => setAttributes({ mapOptions: updateData(mapOptions, newValue, 'allowUsersToSetFromToLocation') })}
        /> */}
        <ToggleControl
          label="Show Print Map Button"
          checked={showPrintButton}
          onChange={(newValue) => setAttributes({ mapOptions: updateData(mapOptions, newValue, 'showPrintButton') })}
        />
        <ToggleControl
          label="Set Search Location On Double Click"
          checked={setSearchLocationOnDblClick}
          onChange={(newValue) => setAttributes({ mapOptions: updateData(mapOptions, newValue, 'setSearchLocationOnDblClick') })}
        />
        <ToggleControl
          label="Show Location Details OnClick"
          checked={showLocationDetailsOnClick}
          onChange={(newValue) => setAttributes({ mapOptions: updateData(mapOptions, newValue, 'showLocationDetailsOnClick') })}
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