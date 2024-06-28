import React from 'react';

const Styles = ({ attributes }) => {
  const { width, height, border, cId } = attributes;

  const mainContainer = `#mainWrapper-${cId}`;
  const map = `${mainContainer} #map`;

  return (
    <div>
      <style>
        {`
          ${map} {
            height: ${height.desktop};
            width: ${width.desktop};
            border: ${border.width} ${border.style} ${border.color};
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