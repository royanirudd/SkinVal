import { initializeApp } from './js/main.js';

document.addEventListener('DOMContentLoaded', () => {
	try {
		initializeApp();
	} catch (error) {
		console.error('Error initializing app:', error);
	}
});
