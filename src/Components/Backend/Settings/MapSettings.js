import { PanelBody, RangeControl, SelectControl, TextControl, ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import React from 'react';
import '../../../editor.scss';
import { updateData } from '../../../utils/functions';
import { MarkerIcon } from '../../../utils/icons';


const MapSettings = ({ attributes, setAttributes, handleInputChange, handleSuggestionClick, handleSearch, suggestions }) => {
  const { latitude, longitude, zoom, searchQuery, controlPosition, markerText, mapLayer, mapOptions } = attributes;


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
          label={__('Map Layer', 'map-osm')}
          value={mapLayer}
          options={[
            { label: 'Standard', value: 'standard' },
            { label: 'Satellite', value: 'satellite' },
            { label: 'Terrain', value: 'terrain' }
          ]}
          onChange={(value) => setAttributes({ mapLayer: value })}
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

      <PanelBody title={__('Map Options', ("map-osm"))} initialOpen={false}>
        <ToggleControl
          label="Show Print Map Button"
          checked={mapOptions.showPrintButton}
          onChange={(newValue) => setAttributes({ mapOptions: updateData(mapOptions, newValue, 'showPrintButton') })}
        />
        {
          mapOptions.showPrintButton && (
            <SelectControl
              label="Button Position"
              value={mapOptions.printBtnPosition}
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
          checked={mapOptions.showImgDownload}
          onChange={(newValue) => setAttributes({ mapOptions: updateData(mapOptions, newValue, 'showImgDownload') })}
        />
        <ToggleControl
          label="Show Download PDF Button"
          checked={mapOptions.showPdfDownload}
          onChange={(newValue) => setAttributes({ mapOptions: updateData(mapOptions, newValue, 'showPdfDownload') })}
        />
      </PanelBody>
    </>
  );
};

export default MapSettings;