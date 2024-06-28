import { createRoot } from 'react-dom/client';
import Frontend from './Components/Frontend/Frontend';
import './style.scss';
// Block Name
function FrontEnd({ attributes }) {
	return (
		<>
			<Frontend attributes={attributes} />
		</>
	);
}

const container = document.querySelectorAll('.wp-block-mosm-hello');
container?.forEach(ele => {
	const attributes = JSON.parse(ele.dataset.attributes);
	const root = createRoot(ele);
	root.render(<FrontEnd attributes={attributes} />);
})