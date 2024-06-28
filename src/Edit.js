import { debounce } from 'lodash';
import { useEffect, useState } from 'react';
import Settings from './Components/Backend/Settings/Settings';
import MapOsm from './Components/MapOsm/MapOsm';
import { withSelect } from '@wordpress/data';


const Edit = props => {
	const { setAttributes, clientId, attributes } = props;
	const { searchQuery } = attributes;
	const [suggestions, setSuggestions] = useState([]);

	useEffect(() => { clientId && setAttributes({ cId: clientId.substring(0, 10) }); }, [clientId]); // Set & Update clientId to cId

	const handleSearch = () => {
		fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}`)
			.then(response => response.json())
			.then(data => {
				if (data && data.length > 0) {
					const place = data[0];
					setAttributes({ latitude: parseFloat(place.lat), longitude: parseFloat(place.lon) });
				}
			});
	};

	const fetchSuggestions = debounce((query) => {
		fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`)
			.then(response => response.json())
			.then(data => {
				if (data) {
					setSuggestions(data);
				}
			});
	}, 300);

	const handleInputChange = (value) => {
		setAttributes({ searchQuery: value, markerText: value });
		// setSearchQuery(value);
		fetchSuggestions(value);
	};

	const handleSuggestionClick = (suggestion) => {
		setAttributes({ searchQuery: suggestion.display_name, markerText: suggestion.display_name });
		// setSearchQuery(suggestion.display_name);
		setSuggestions([]);
		setAttributes({ latitude: parseFloat(suggestion.lat), longitude: parseFloat(suggestion.lon) });
	};

	return <>
		<Settings attributes={attributes} setAttributes={setAttributes} handleSearch={handleSearch} handleInputChange={handleInputChange} handleSuggestionClick={handleSuggestionClick} suggestions={suggestions}/>

		<MapOsm attributes={attributes} setAttributes={setAttributes} />
	</>
};
export default Edit;