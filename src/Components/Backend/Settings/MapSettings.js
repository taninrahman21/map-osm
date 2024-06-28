import { PanelBody, RangeControl, SelectControl, TextControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import React from 'react';
import '../../../editor.scss';
import { MarkerIcon } from '../../../utils/icons';


const MapSettings = ({ attributes, setAttributes, handleInputChange, handleSuggestionClick, handleSearch, suggestions }) => {
  const { latitude, longitude, zoom, searchQuery, controlPosition, markerText } = attributes;


  return (
    <>
      <PanelBody title={__('Map Settings', 'map-osm')}>
        <div className="search-option">
          <TextControl
            label={__('Search Address', 'map-osm')}
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

        <TextControl
          label={__('Latitude', 'map-osm')}
          value={latitude}
          onChange={(value) => setAttributes({ latitude: parseFloat(value) })}
          disabled={true}
        />
        <TextControl
          label={__('Longitude', 'map-osm')}
          value={longitude}
          onChange={(value) => setAttributes({ longitude: parseFloat(value) })}
          disabled={true}
        />

        <TextControl
          label={__('Marker Text', 'map-osm')}
          value={markerText}
          onChange={(value) => setAttributes({ markerText: value })}
        />

        <RangeControl
          label={__('Zoom Level', 'map-osm')}
          value={zoom}
          onChange={(value) => setAttributes({ zoom: value })}
          min={3}
          max={19}
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
          onChange={value => setAttributes({ controlPosition: value })}
        />

      </PanelBody>
    </>
  );
};

export default MapSettings;