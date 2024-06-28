import { InspectorControls } from '@wordpress/block-editor';
import { TabPanel } from '@wordpress/components';
import React from 'react';
import '../../../editor.scss';
import MapSettings from './MapSettings';
import MapStyles from './MapStyles';

const Settings = ({ attributes, setAttributes, handleInputChange, handleSuggestionClick, handleSearch, suggestions }) => {

  return (
    <>
      <InspectorControls>
        <TabPanel
          className="my-tab-panel"
          activeClass="active-tab"
          tabs={[
            {
              name: 'tab1',
              title: 'Settings',
              className: 'setting-tab',
            },
            {
              name: 'tab2',
              title: 'Styles',
              className: 'style-tab',
            },
          ]}>
          {(tab) => (
            <>
              {tab.name === 'tab1' && <MapSettings attributes={attributes} setAttributes={setAttributes} handleSearch={handleSearch} handleInputChange={handleInputChange} handleSuggestionClick={handleSuggestionClick} suggestions={suggestions} />}
              {tab.name === 'tab2' && <MapStyles attributes={attributes} setAttributes={setAttributes} />}
            </>
          )}
        </TabPanel>
      </InspectorControls>
    </>
  );
};

export default Settings;