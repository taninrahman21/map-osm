import { __experimentalBorderControl as BorderControl, PanelBody, PanelRow, __experimentalUnitControl as UnitControl } from '@wordpress/components';
import { compose } from '@wordpress/compose';
import { withSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import React from 'react';
import { BColor, Label } from '../../../../../Components';
import { Device } from '../../../../../Components/Device/Device';
import { updateData } from '../../../utils/functions';

const MapStyles = compose(withSelect((select) => { return { device: select("core/edit-post").__experimentalGetPreviewDeviceType()?.toLowerCase() } }))(({ attributes, setAttributes, device }) => {
  const { height, width, markerIconColor, border } = attributes;

  console.log('Height:', height, 'Width:', width);

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
            onChange={(value) => setAttributes({ width: updateData(width, value, device) })}
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
            onChange={(value) => setAttributes({ height: updateData(height, value, device) })}
            step={1}
          />
        </div>

        {/* Marker Icon Color */}
        <div>
          <BColor
            label={__('Marker Icon Color', 'feature-lists')}
            value={markerIconColor}
            onChange={value => setAttributes({ markerIconColor: updateData(markerIconColor, value) })}
            defaultColor='orangered' />
        </div>

        {/* Border Color */}
        <div>
          <BorderControl
            colors={colors}
            label={__('Border')}
            onChange={value => setAttributes({ border: value })}
            value={border}
          />
        </div>

      </PanelBody>
    </>
  );
})


export default MapStyles;