import { produce } from 'immer';
import { debounce } from 'lodash';
import { useEffect, useState } from 'react';
import Settings from './Components/Backend/Settings/Settings';
import MapOsm from './Components/MapOsm/MapOsm';


const Edit = props => {
	const { setAttributes, clientId, attributes } = props;
	const { mapOsm } = attributes;
	const { searchQuery } = mapOsm;
	const [suggestions, setSuggestions] = useState([]);
	const [fromLocationSuggestions, setFromLocationSuggestions] = useState([]);


	useEffect(() => { clientId && setAttributes({ cId: clientId.substring(0, 10) }); }, [clientId]); // Set & Update clientId to cId

	const handleSearch = () => {
		fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}`)
			.then(response => response.json())
			.then(data => {
				if (data && data.length > 0) {
					const place = data[0];
					setAttributes({
						mapOsm: produce(mapOsm, draft => {
							draft.latitude = parseFloat(place.lat);
							draft.longitude = parseFloat(place.lon);
						})
					})
					setSuggestions([]);
				}
			});
	};

	const handleFromLocationSearch = (value) => {
		fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${value}`)
			.then(response => response.json())
			.then(data => {
				if (data && data.length > 0) {
					const place = data[0];
					setAttributes({
						mapOsm: produce(mapOsm, draft => {
							draft.fromLocation.lat = parseFloat(place.lat);
							draft.fromLocation.lon = parseFloat(place.lon);
						})
					})
					setFromLocationSuggestions([]);
				}
			});
	};

	const fetchSuggestions = debounce((query) => {
		fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`)
			.then(response => response.json())
			.then(data => {
				console.log(data)
				if (data) {
					setSuggestions(data);
				}
			});
	}, 300);

	const fetchFromLocationSuggestions = debounce((query) => {
		fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`)
			.then(response => response.json())
			.then(data => {
				console.log(data)
				if (data) {
					setFromLocationSuggestions(data);
				}
			});
	}, 300);

	const handleInputChange = (value) => {
		setAttributes({
			mapOsm: produce(mapOsm, draft => {
				draft.searchQuery = value;
				draft.markerText = value;
			})
		})
		fetchSuggestions(value);
	};

	const handleFromLocationInput = (value) => {
		setAttributes({
			mapOsm: produce(mapOsm, draft => {
				draft.fromLocation.locationName = value;
			})
		})
		fetchFromLocationSuggestions(value);
	}

	const handleFromLocationSuggestionClick = (suggestion) => {
		setAttributes({
			mapOsm: produce(mapOsm, draft => {
				draft.fromLocation.lat = parseFloat(suggestion.lat);
				draft.fromLocation.lon = parseFloat(suggestion.lon);
				draft.fromLocation.locationName = suggestion.display_name;
			})
		});
		setFromLocationSuggestions([]);
	}

	const handleSuggestionClick = (suggestion) => {
		setAttributes({
			mapOsm: produce(mapOsm, draft => {
				draft.searchQuery = suggestion.display_name;
				draft.markerText = suggestion.display_name;
				draft.latitude = parseFloat(suggestion.lat);
				draft.longitude = parseFloat(suggestion.lon);
			})
		});
		setSuggestions([]);
	};

	return <>
		<Settings attributes={attributes} setAttributes={setAttributes} handleSearch={handleSearch} handleInputChange={handleInputChange} handleSuggestionClick={handleSuggestionClick} suggestions={suggestions} fromLocationSuggestions={fromLocationSuggestions} handleFromLocationInput={handleFromLocationInput} handleFromLocationSuggestionClick={handleFromLocationSuggestionClick} handleFromLocationSearch={handleFromLocationSearch} />

		<MapOsm attributes={attributes} setAttributes={setAttributes} />
	</>
};
export default Edit;