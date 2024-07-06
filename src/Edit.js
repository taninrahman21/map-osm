import { useEffect} from 'react';
import Settings from './Components/Backend/Settings/Settings';
import MapOsm from './Components/MapOsm/MapOsm';


const Edit = props => {
	const { setAttributes, clientId, attributes } = props;


	useEffect(() => { clientId && setAttributes({ cId: clientId.substring(0, 10) }); }, [clientId]); // Set & Update clientId to cId


	// const backendInputChange = (value, type) => {
	// 	if (type === 'from') {
	// 		setAttributes({
	// 			mapOsm: produce(mapOsm, draft => {
	// 				draft.fromLocation.locationName = value;
	// 			})
	// 		});
	// 		fetchSuggestions(value, setLocationSuggestions);
	// 	} else if (type === 'to') {
	// 		setAttributes({
	// 			mapOsm: produce(mapOsm, draft => {
	// 				draft.searchQuery = value;
	// 				draft.markerText = value;
	// 			})
	// 		});
	// 		fetchSuggestions(value, setLocationSuggestions);
	// 	}
	// };

	return <>
		<Settings attributes={attributes} setAttributes={setAttributes}/>

		<MapOsm attributes={attributes} setAttributes={setAttributes} />
	</>
};
export default Edit;