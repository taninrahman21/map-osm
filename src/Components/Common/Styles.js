import React from 'react';

const Styles = ({ attributes }) => {
  const { cId, mapOptions, mapLayout } = attributes;
  const { width, height, border } = mapLayout;
  const { showImgDownload, showPdfDownload, allowUsersToSetFromToLocation } = mapOptions;

  const mainContainer = `#mainWrapper-${cId}`;
  const map = `${mainContainer} #map`;
  const fromToLocationDiv = `${map} .from-to-location-div`;
  const imgBtn = `${mainContainer} .img-download-btn`;
  const pdfBtn = `${mainContainer} .pdf-download-btn`;

  return (
    <div>
      <style>
        {`
          ${map} {
            height: ${height.desktop};
            width: ${width.desktop};
            border: ${border.width} ${border.style} ${border.color};
          }
          ${imgBtn} {
            display: ${showImgDownload ? 'inline-block' : 'none'};
            margin-right: 7px;
          }
            
          ${pdfBtn} {
            display: ${showPdfDownload ? 'inline-block' : 'none'};
          }
          ${fromToLocationDiv} {
           display: ${allowUsersToSetFromToLocation? 'flex' : 'none'};
          }

          @media only screen and (min-width:641px) and (max-width: 1024px){
          ${map} {
            height: ${height.tablet};
            width: ${width.tablet};
          }
          }

          @media only screen and (max-width:640px){
          ${map} {
            height: ${height.mobile};
            width: ${width.mobile};
          }
          }
          
        `}
      </style>
    </div>
  );
};

export default Styles;