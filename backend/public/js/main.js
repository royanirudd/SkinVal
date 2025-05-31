let chatUI;
try {
	const module = await import('../chat.js');
	chatUI = module.default;
} catch (error) {
	console.error('Error importing ChatUI:', error);
}

export function initializeApp(chatUI) {

	const analysisForm = document.getElementById('analysis-form');
	const leftImageUpload = document.getElementById('left-image');
	const frontImageUpload = document.getElementById('front-image');
	const rightImageUpload = document.getElementById('right-image');
	const analyzeBtn = document.getElementById('analyze-btn');
	const resetBtn = document.getElementById('reset-btn');
	const resultsSection = document.getElementById('results-section');
	const productList = document.getElementById('product-list');

	// Remove the old image upload references
	const imagePreviewContainer = document.createElement('div');
	imagePreviewContainer.id = 'image-preview-container';

	// Preview containers
	const previewContainers = {
		left: document.getElementById('left-preview'),
		front: document.getElementById('front-preview'),
		right: document.getElementById('right-preview')
	};

	// Event Listeners
	if (analysisForm) {
		analysisForm.addEventListener('submit', handleAnalyze);
	}

	if (resetBtn) {
		resetBtn.addEventListener('click', () => resetApp('yes'));
	}

	// Initialize file upload listeners
	[leftImageUpload, frontImageUpload, rightImageUpload].forEach(input => {
		if (input) {
			input.addEventListener('change', handleImagePreview);
		}
	});

	initializeScrollAnimations();

	document.addEventListener('DOMContentLoaded', function() {
		// Get all elements that should animate on scroll
		const elements = document.querySelectorAll('.animate-on-scroll');

		const observer = new IntersectionObserver((entries) => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					entry.target.classList.add('visible');
				}
			});
		}, {
			threshold: 0.1
		});

		elements.forEach(element => {
			observer.observe(element);
		});
	});

	function initializeScrollAnimations() {
		const elements = document.querySelectorAll('.animate-on-scroll');

		const observer = new IntersectionObserver((entries) => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					entry.target.classList.add('visible');
				}
			});
		}, {
			threshold: 0.1,
			rootMargin: '50px'
		});

		elements.forEach(element => {
			observer.observe(element);
		});
	}

	// Image handling functions
	function initializeImageUploads() {
		const uploadInputs = document.querySelectorAll('input[type="file"]');
		uploadInputs.forEach(input => {
			input.addEventListener('change', handleImagePreview);
		});
	}

	function handleImagePreview(event) {
		const input = event.target;
		const position = input.dataset.position;
		const previewContainer = previewContainers[position];

		if (input.files && input.files[0] && previewContainer) {
			const reader = new FileReader();
			reader.onload = function(e) {
				previewContainer.innerHTML = `
                    <div class="image-preview">
                        <img src="${e.target.result}" alt="${position} view">
                        <button type="button" class="remove-preview" data-position="${position}">×</button>
                    </div>
                `;

				const removeButton = previewContainer.querySelector('.remove-preview');
				if (removeButton) {
					removeButton.addEventListener('click', (e) => {
						e.preventDefault();
						e.stopPropagation();
						removePreview(position);
					});
				}
			}
			reader.readAsDataURL(input.files[0]);
		}
	}

	function removePreview(position) {
		const input = document.getElementById(`${position}-image`);
		const previewContainer = previewContainers[position];
		if (input) input.value = '';
		if (previewContainer) previewContainer.innerHTML = '';
	}

	async function handleAnalyze(event) {
		event.preventDefault();

		const formData = new FormData();

		// Get file inputs
		const files = {
			left: document.getElementById('left-image').files[0],
			front: document.getElementById('front-image').files[0],
			right: document.getElementById('right-image').files[0]
		};

		// Add files to FormData with correct field names
		Object.entries(files).forEach(([position, file]) => {
			if (file) {
				formData.append(`image_${position}`, file);
			}
		});

		// Add price range
		const priceRange = document.getElementById('price-range').value;
		formData.append('priceRange', priceRange);

		resetApp();
		showLoadingIndicator('analyzing');

		try {
			const response = await fetch('/api/analysis-recommendation/analyze', {
				method: 'POST',
				body: formData
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();
			console.log('Analysis response:', data);

			if (data.success) {
				resultsSection.hidden = false;
				if (data.recommendations) {
					displayRecommendations(data.recommendations);
				}

				// Show AI generating state
				showLoadingIndicator('generating');

				// Start polling if we have an analysisId
				if (data.analysisId) {
					pollAIResults(data.analysisId);
				}
			} else {
				console.warn('Analysis failed:', data.message);
				alert(data.message || 'Analysis failed. Please try again.');
			}
		} catch (error) {
			console.error('Error analyzing the image:', error);
			alert('An error occurred while analyzing the image. Please try again.');
		} finally {
			hideLoadingIndicator();
		}
	}

	async function pollAIResults(analysisId) {
		let attempts = 0;
		const maxAttempts = 60; // 2 minutes with 2-second intervals

		// Clear any existing skincare routine
		const skincareSection = document.getElementById('skincare-routine');
		const routineContent = skincareSection.querySelector('.routine-content');
		if (routineContent) {
			routineContent.innerHTML = '';
		}
		skincareSection.hidden = true;

		const pollInterval = setInterval(async () => {
			try {
				attempts++;
				const response = await fetch(`/api/analysis-recommendation/ai-results/${analysisId}`);
				const data = await response.json();
				console.log('Polling response:', data);

				if (data.success && data.complete) {
					clearInterval(pollInterval);
					hideLoadingIndicator();

					// Handle routine
					if (data.routine) {
						try {
							const routineData = typeof data.routine === 'string'
								? data.routine
								: data.routine.text || JSON.stringify(data.routine);

							displaySkincareRoutine(routineData);

							// Get stored recommendations
							const recommendations = window._lastRecommendations || [];

							console.log('About to update chat context:', {
								routineLength: routineData?.length,
								recommendationsCount: recommendations?.length,
								recommendationCategories: recommendations?.map(r => r.category),
								tipsLength: data.tips?.length
							});

							// Make sure chatUI is available
							if (chatUI) {
								chatUI.updateContext(routineData, recommendations, data.tips);
							} else {
								console.warn('ChatUI not available for context update');
							}

						} catch (error) {
							console.error('Error updating chat context:', error);
							console.log('Failed data:', {
								routine: data.routine,
								recommendations: window._lastRecommendations,
								tips: data.tips
							});
						}
					}

					// Clear any existing tips before showing new ones
					const tipsSections = document.querySelectorAll('.tips-section');
					tipsSections.forEach(section => {
						section.hidden = true;
						section.innerHTML = '';
					});

					// Handle tips
					if (data.tips) {
						const tipsText = data.tips;
						const sections = tipsText.split('\n\n');

						sections.forEach(section => {
							const lines = section.split('\n');
							if (lines.length >= 2) {
								const categoryLine = lines[0];
								let category = categoryLine.split(':')[0].trim();
								const tipContent = lines.slice(1).join('\n').trim();

								// Normalize the category name
								let normalizedCategory = category;

								// Add "Treatment" suffix if not present and not a general skincare category
								if (!normalizedCategory.includes('Treatment') && !normalizedCategory.toLowerCase().includes('skincare')) {
									normalizedCategory = `${normalizedCategory} Treatment`;
								}

								// Handle special cases
								if (normalizedCategory.toLowerCase().includes('under eyes')) {
									normalizedCategory = normalizedCategory.replace(/under eyes/i, 'Under_Eyes');
								}
								if (normalizedCategory.toLowerCase().includes('skincare for dark skin')) {
									normalizedCategory = 'Skincare for dark Skin';
								}

								console.log('Processing tips for category:', {
									original: category,
									normalized: normalizedCategory
								});

								const tipsSection = document.querySelector(`.tips-section[data-category="${normalizedCategory}"]`);
								if (tipsSection) {
									tipsSection.hidden = false;
									tipsSection.innerHTML = `
    <h4 style="color: #ff9800; margin-bottom: 0.8rem; font-size: 1.1rem;">Usage Tips</h4>
    <p style="line-height: 1.6;">${tipContent}</p>
`;
								} else {
									console.log('No tips section found for category:', normalizedCategory);
									console.log('Available categories:',
										Array.from(document.querySelectorAll('.tips-section'))
											.map(el => el.getAttribute('data-category'))
									);
								}
							}
						});
					}
				}

				// Stop polling after max attempts
				if (attempts >= maxAttempts) {
					clearInterval(pollInterval);
					hideLoadingIndicator();
					console.log('Polling timed out');
				}
			} catch (error) {
				console.error('Error polling AI results:', error);
				clearInterval(pollInterval);
				hideLoadingIndicator();
			}
		}, 2000); // Poll every 2 seconds
	}


	function displayAnalysis(analysis) {
		// Create an analysis summary section
		const analysisSummary = document.createElement('div');
		analysisSummary.classList.add('analysis-summary');
		analysisSummary.innerHTML = `
        <h3>Analysis Results</h3>
        <div class="analysis-details">
            <p><strong>Skin Tone:</strong> ${analysis.skin_tone.main_tone} (${analysis.skin_tone.undertone})</p>
            <p><strong>Concerns:</strong> ${Object.entries(analysis.concerns)
				.filter(([_, value]) => value)
				.map(([key, _]) => key.replace('_', ' '))
				.join(', ')}</p>
            <p><strong>Recommended Ingredients:</strong> ${analysis.recommendations.ingredients.join(', ')}</p>
        </div>
    `;

		const resultsSection = document.getElementById('results-section');
		resultsSection.insertBefore(analysisSummary, document.getElementById('product-list'));
	}

	// Display Recommendations
	function displayRecommendations(recommendations) {
		console.log('displayRecommendations received:', recommendations);

		if (!recommendations || !Array.isArray(recommendations)) {
			console.error('Invalid recommendations format:', recommendations);
			return;
		}

		window._lastRecommendations = recommendations;
		console.log('Stored recommendations:', window._lastRecommendations);

		resultsSection.hidden = false;
		productList.innerHTML = '';


		recommendations.forEach((category, index) => {
			const categorySection = document.createElement('div');
			categorySection.classList.add('category-section');
			categorySection.style.background = '#1e1e1e';
			categorySection.style.borderRadius = '8px';
			categorySection.style.marginBottom = '1.5rem';
			categorySection.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.3)';

			// Normalize category name for display
			let displayCategory = category.category;
			let dataCategory = category.category;

			if (!displayCategory.includes('Treatment') && !displayCategory.toLowerCase().includes('skincare')) {
				displayCategory = `${displayCategory} Treatment`;
				dataCategory = `${displayCategory}`;
			}

			// Handle special cases
			if (displayCategory.includes('Under Eyes')) {
				dataCategory = displayCategory.replace('Under Eyes', 'Under_Eyes');
			}

			console.log('Category mapping:', {
				original: category.category,
				display: displayCategory,
				data: dataCategory
			});

			const categoryTitle = document.createElement('h2');
			categoryTitle.textContent = displayCategory;
			categoryTitle.classList.add('category-title');
			categoryTitle.style.color = '#ff9800';
			categoryTitle.style.padding = '1.5rem';
			categoryTitle.style.borderBottom = '2px solid #444';
			categoryTitle.style.cursor = 'pointer';
			categoryTitle.style.position = 'relative';
			if (index !== 0) categoryTitle.classList.add('collapsed');
			categorySection.appendChild(categoryTitle);

			const contentContainer = document.createElement('div');
			contentContainer.classList.add('category-content');
			contentContainer.style.display = index === 0 ? 'block' : 'none';

			// Add tips section with normalized data-category
			const tipsSection = document.createElement('div');
			tipsSection.classList.add('tips-section');
			tipsSection.setAttribute('data-category', dataCategory);
			tipsSection.style.padding = '1rem 1.5rem';
			tipsSection.style.background = '#2e2e2e';
			tipsSection.style.margin = '0 1.5rem';
			tipsSection.style.borderRadius = '8px';
			tipsSection.style.marginBottom = '1.5rem';
			tipsSection.style.color = '#e0e0e0';
			tipsSection.hidden = true;
			contentContainer.appendChild(tipsSection);

			const productsGrid = document.createElement('div');
			productsGrid.classList.add('products-grid');

			// Fixed the forEach syntax here
			if (category.products && Array.isArray(category.products)) {
				category.products.forEach((product, productIndex) => {
					if (!product) return;

					const productLink = document.createElement('a');
					productLink.href = product.product_url || '#';
					productLink.target = '_blank';
					productLink.rel = 'noopener noreferrer';
					productLink.classList.add('product-card');
					productLink.classList.add(`delay-${(productIndex % 5) * 100}`);

					let priceDisplay = product.price ? `$${product.price.toFixed(2)}` : 'Price not available';
					let ratingDisplay = product.rating ? `${product.rating.toFixed(1)}/5` : 'No rating';
					let reviewsDisplay = product.reviews_count ? `(${product.reviews_count} reviews)` : '';

					productLink.innerHTML = `
                    <div class="product-image-container">
                        ${product.image_url
							? `<img src="${product.image_url}" alt="${product.title}" loading="lazy">`
							: '<div class="no-image">No Image Available</div>'
						}
                    </div>
                    <div class="product-info">
                        <h3 class="product-title">${product.title || 'Untitled Product'}</h3>
                        <div class="product-details">
                            <p class="price">${priceDisplay}</p>
                            <p class="rating">${ratingDisplay} ${reviewsDisplay}</p>
                        </div>
                    </div>
                `;

					productsGrid.appendChild(productLink);
				});
			}

			contentContainer.appendChild(productsGrid);
			categorySection.appendChild(contentContainer);

			categoryTitle.addEventListener('click', () => {
				const isCollapsed = categoryTitle.classList.contains('collapsed');
				categoryTitle.classList.toggle('collapsed');
				contentContainer.style.display = isCollapsed ? 'block' : 'none';

				if (!isCollapsed) {
					setTimeout(() => {
						categorySection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
					}, 100);
				}
			});

			productList.appendChild(categorySection);
		});
		// Get all tips content
		const allTips = Array.from(document.querySelectorAll('.tips-section'))
			.map(section => section.textContent)
			.join('\n\n');

	}


	function displaySkincareRoutine(routineData) {
		const skincareSection = document.getElementById('skincare-routine');
		const routineContent = skincareSection.querySelector('.routine-content');
		const chatSection = document.getElementById('chat-section');

		skincareSection.hidden = false;
		routineContent.innerHTML = '<div class="space-y-4"></div>';

		try {
			let routineText = '';
			if (typeof routineData === 'string') {
				try {
					const parsedData = JSON.parse(routineData);
					routineText = parsedData.routine || routineData;
				} catch {
					routineText = routineData;
				}
			} else if (typeof routineData === 'object') {
				routineText = routineData.routine || routineData.text || '';
			}

			console.log('Processing routine:', routineText);

			const lines = routineText
				.split('\n')
				.map(line => line.trim())
				.filter(line => line.length > 0)
				.filter(line => !line.toLowerCase().includes('here is'))
				.filter(line => !line.toLowerCase().includes('personalized'))
				.map(line => line.replace(/^[╬ô├ç├│ΓÇó•#-]\s*/, '')); // Remove any bullet points and #

			const container = routineContent.querySelector('div');
			let currentIndex = 0;
			let currentWordIndex = 0;
			let currentLine = '';

			function typeWriter() {
				if (currentIndex < lines.length) {
					const line = lines[currentIndex];

					// Handle AM/PM headers (including cases with ###)
					if (line.trim().match(/^(###\s*)?[AP]M:?$/i) || line.trim() === 'AM' || line.trim() === 'PM') {
						const headerSection = document.createElement('div');
						headerSection.className = 'mt-8 mb-6';

						const header = document.createElement('h3');
						header.className = 'text-2xl font-bold text-orange-500 mb-3';
						header.textContent = line.includes('AM') ? 'Morning Routine (AM)' : 'Evening Routine (PM)';
						headerSection.appendChild(header);

						const hr = document.createElement('hr');
						hr.className = 'border-t-2 border-gray-700 mb-4';
						headerSection.appendChild(hr);

						container.appendChild(headerSection);
						currentIndex++;
						setTimeout(typeWriter, 100);
						return;
					}

					// Handle regular lines
					if (!currentLine) {
						currentLine = document.createElement('div');
						currentLine.className = 'mb-4 text-left pl-4';
						const textSpan = document.createElement('span');
						currentLine.appendChild(textSpan);
						container.appendChild(currentLine);
					}

					const words = line.split(' ');
					const textSpan = currentLine.querySelector('span');

					if (currentWordIndex < words.length) {
						textSpan.textContent += words[currentWordIndex] + ' ';
						currentWordIndex++;
						setTimeout(typeWriter, 50);
					} else {
						currentIndex++;
						currentWordIndex = 0;
						currentLine = '';
						setTimeout(typeWriter, 100);
					}
				} else {
					if (chatSection) {
						chatSection.style.display = 'block';
						chatSection.hidden = false;
					} else {
						console.error('Chat section not found');
					}
				}
			}

			typeWriter();
		} catch (error) {
			console.error('Error displaying skincare routine:', error);
			routineContent.innerHTML = `
            <p class="text-red-500">Error displaying routine: ${error.message}</p>
            <pre class="text-xs mt-2">${JSON.stringify(routineData, null, 2)}</pre>
        `;
			if (chatSection) {
				chatSection.style.display = 'block';
				chatSection.hidden = false;
			}
		}
	}

	// Reset Application
	function resetApp(button = 'no') {
		// Hide all sections
		resultsSection.hidden = true;
		const skincareSection = document.getElementById('skincare-routine');
		skincareSection.hidden = true;
		const chatSection = document.getElementById('chat-section');
		chatSection.hidden = true;

		// Clear all content
		productList.innerHTML = '';
		const routineContent = skincareSection.querySelector('.routine-content');
		if (routineContent) {
			routineContent.innerHTML = '';
		}

		// Only clear image preview if reset button was clicked
		if (button === 'yes') {
			imageUpload.value = '';
			imagePreviewContainer.innerHTML = '';
		}

		// Hide and clear all tips sections
		const tipsSections = document.querySelectorAll('.tips-section');
		tipsSections.forEach(section => {
			section.hidden = true;
			section.innerHTML = '';
		});

		// Reset loading state
		hideLoadingIndicator();
	}

	// Loading Indicators
	function showLoadingIndicator(state = 'analyzing') {
		analyzeBtn.disabled = true;
		switch (state) {
			case 'analyzing':
				analyzeBtn.textContent = 'Analyzing...';
				break;
			case 'generating':
				analyzeBtn.textContent = 'AI Generating Tips...';
				break;
			default:
				analyzeBtn.textContent = 'Processing...';
		}
	}

	function hideLoadingIndicator() {
		analyzeBtn.textContent = 'Analyze';
		analyzeBtn.disabled = false;
	}

	function initializeNewAnimations(element) {
		const newAnimatedElements = element.querySelectorAll('.animate-on-scroll');
		const observer = new IntersectionObserver((entries) => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					entry.target.classList.add('visible');
				}
			});
		}, {
			threshold: 0.1
		});

		newAnimatedElements.forEach(element => {
			observer.observe(element);
		});
	}
}
