import { __experimentalBorderControl as BorderControl, PanelBody, PanelRow, RangeControl, __experimentalUnitControl as UnitControl } from '@wordpress/components';
import { compose } from '@wordpress/compose';
import { withSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import React from 'react';
import { BColor, Label } from '../../../../../Components';
import { Device } from '../../../../../Components/Device/Device';
import { updateData } from '../../../utils/functions';

const MapStyles = compose(withSelect((select) => { return { device: select("core/edit-post").__experimentalGetPreviewDeviceType()?.toLowerCase() } }))(({ attributes, setAttributes, device }) => {
  const { mapLayout, osmStyles, mapOptions } = attributes;
  const { showDirectionFromYourLocation } = mapOptions;
  const { height, width, border } = mapLayout;
  const { markerIconSize, fromLocationMarkerColor, toLocationMarkerColor, defaultMarkerColor, routeLineColor, currentLocationMarkerColor } = osmStyles;


  console.log(osmStyles);


  const colors = [
    { name: 'white', color: '#fff' },
    { name: 'Black', color: '#000' },
    { name: 'Red', color: '#ff0000' },
    { name: 'Green', color: '#00ff00' },
    { name: 'Blue', color: '#0000ff' },
    { name: 'White 20', color: '#f9f9f9' },
    { name: 'Blue 20', color: '#72aee6' }
  ];

  return (
    <>
      <PanelBody title={__('Map styles', 'map-osm')}>
        {/* Map Width */}
        <div>
          <PanelRow>
            <Label className='mb5'>{__("Width", 'map-osm')}</Label>
            <Device />
          </PanelRow>
          <UnitControl
            value={width[device]}
            onChange={(value) => setAttributes({ mapLayout: updateData(mapLayout, value, "width", device) })}
            step={1}
          />
        </div>

        {/* Map Height */}
        <div>
          <PanelRow>
            <Label className='mb5'>{__("Height", 'map-osm')}</Label>
            <Device />
          </PanelRow>
          <UnitControl
            value={height[device]}
            onChange={(value) => setAttributes({ mapLayout: updateData(mapLayout, value, "height", device) })}
            step={1}
          />
        </div>


        {/* Border Color */}
        <div>
          <BorderControl
            colors={colors}
            label={__('Border')}
            onChange={value => setAttributes({ mapLayout: updateData(mapLayout, value, "border")})}
            value={border}
          />
        </div>

      </PanelBody>

      <PanelBody title={__("Marker Styles", "map-osm")}>
        {/* Marker Size */}
        <div>
          <RangeControl
            label={__('Marker Icon Size', 'map-osm')}
            value={markerIconSize}
            onChange={(value) => setAttributes({ osmStyles: updateData(osmStyles, value, "markerIconSize") })}
            min={5}
            max={100}
          />
        </div>

        {/* Marker Icon Color */}
        <div>
          {
            !showDirectionFromYourLocation && (
              <BColor
                label={__('Marker Icon Color', 'map-osm')}
                value={defaultMarkerColor}
                onChange={value => setAttributes({ osmStyles: updateData(osmStyles, value, "defaultMarkerColor") })}
                defaultColor='orangered' />
            )
          }
          {/* Current Location Marker Color */}
          <BColor
            label={__('Current Location Marker Color', 'map-osm')}
            value={currentLocationMarkerColor}
            onChange={value => setAttributes({ osmStyles: updateData(osmStyles, value, "currentLocationMarkerColor") })}
            defaultColor='orangered' />

          {
            showDirectionFromYourLocation && (
              <BColor
                label={__('Start Point Marker Color', 'map-osm')}
                value={fromLocationMarkerColor}
                onChange={value => setAttributes({ osmStyles: updateData(osmStyles, value, "fromLocationMarkerColor") })}
                defaultColor='orangered' />
            )
          }
          {
            showDirectionFromYourLocation && (
              <BColor
                label={__('End Point Marker Color', 'map-osm')}
                value={toLocationMarkerColor}
                onChange={value => setAttributes({ osmStyles: updateData(osmStyles, value, "toLocationMarkerColor") })}
                defaultColor='orangered' />
            )
          }
          {
            showDirectionFromYourLocation && (
              <BColor
                label={__('Routing Line Color', 'map-osm')}
                value={routeLineColor}
                onChange={value => setAttributes({ osmStyles: updateData(osmStyles, value, "routeLineColor") })}
                defaultColor='orangered' />
            )
          }
        </div>

        {/*  */}
      </PanelBody>
    </>
  );
})


export default MapStyles;