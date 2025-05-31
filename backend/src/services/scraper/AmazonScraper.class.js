const axios = require('axios');
const cheerio = require('cheerio');
const randomUseragent = require('random-useragent');
const logger = require('../../utils/logger');

class AmazonScraper {
	constructor() {
		this.recommendedProducts = new Set();
		this.maxProductsPerCategory = 5;
		this.priceRange = 'all';
	}

	setPriceRange(range) {
		this.priceRange = range;
		logger.info(`Price range set to: ${range}`);
	}

	getHeaders() {
		return {
			'User-Agent': randomUseragent.getRandom(),
			'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
			'Accept-Language': 'en-US,en;q=0.5',
			'Accept-Encoding': 'gzip, deflate, br',
			'Connection': 'keep-alive',
			'Cache-Control': 'no-cache',
			'Pragma': 'no-cache'
		};
	}

	extractProductDetails($, item) {
		try {
			const $item = $(item);

			// Log the HTML structure for debugging
			logger.debug(`Processing item HTML: ${$item.html().substring(0, 200)}...`);

			// Extract ASIN using multiple selectors
			const asin = $item.attr('data-asin') ||
				$item.attr('data-component-id') ||
				$item.find('[data-asin]').first().attr('data-asin');

			if (!asin) {
				logger.debug('No ASIN found for item');
				return null;
			}

			const productUrl = `https://www.amazon.com/dp/${asin}`;
			if (this.recommendedProducts.has(productUrl)) {
				logger.debug(`Product ${asin} already recommended`);
				return null;
			}

			const titleElem = $item.find('h2 span').first() ||
				$item.find('.a-text-normal').first() ||
				$item.find('.a-link-normal span').first();

			if (!titleElem || !titleElem.text()) {
				logger.debug(`No title found for product ${asin}`);
				return null;
			}

			const priceElem = $item.find('.a-price .a-offscreen').first() ||
				$item.find('.a-price:not(.a-text-price) .a-offscreen').first();

			const ratingElem = $item.find('.a-icon-star-small .a-icon-alt').first() ||
				$item.find('.a-star-rating-text').first();

			const reviewsElem = $item.find('.a-size-base.s-underline-text').first() ||
				$item.find('[data-csa-c-type="widget"] .a-size-base').first();

			const imageElem = $item.find('img.s-image').first() ||
				$item.find('.s-image').first();

			const title = titleElem.text().trim();
			let price = null;
			let rating = null;
			let reviewsCount = null;
			const imageUrl = imageElem.attr('src');

			if (priceElem.length) {
				const priceText = priceElem.text().replace(/[^0-9.]/g, '');
				price = parseFloat(priceText);
			}

			// If price range is not 'all' and price is null or NaN, skip this product
			if (this.priceRange !== 'all' && (price === null || isNaN(price))) {
				logger.debug(`Skipping product ${asin} - no valid price available`);
				return null;
			}

			// Price range filtering
			if (price !== null) {
				switch (this.priceRange) {
					case 'low':
						if (price > 5) {
							logger.debug(`Skipping product ${asin} - price ${price} above low range`);
							return null;
						}
						break;
					case 'medium':
						if (price < 5 || price > 20) {
							logger.debug(`Skipping product ${asin} - price ${price} outside medium range`);
							return null;
						}
						break;
					case 'high':
						if (price < 20) {
							logger.debug(`Skipping product ${asin} - price ${price} below high range`);
							return null;
						}
						break;
				}
			}

			if (ratingElem.length) {
				const ratingText = ratingElem.text().match(/\d+\.?\d*/);
				rating = ratingText ? parseFloat(ratingText[0]) : null;
			}

			if (reviewsElem.length) {
				const reviewsText = reviewsElem.text().replace(/[^0-9]/g, '');
				reviewsCount = parseInt(reviewsText) || null;
			}

			const product = {
				title,
				product_url: productUrl,
				price,
				rating,
				reviews_count: reviewsCount,
				image_url: imageUrl
			};

			logger.debug(`Successfully extracted product: ${JSON.stringify(product)}`);
			return product;

		} catch (error) {
			logger.error(`Error extracting product details: ${error.message}`);
			return null;
		}
	}

	async searchProducts(searchTerms) {
		try {
			logger.info(`Starting search for terms: ${searchTerms.join(', ')}`);
			const products = [];
			let pageNumber = 1;
			const maxPages = 5;

			while (products.length < this.maxProductsPerCategory && pageNumber <= maxPages) {
				const searchQuery = encodeURIComponent(searchTerms.join('+'));
				const url = `https://www.amazon.com/s?k=${searchQuery}&page=${pageNumber}&ref=nb_sb_noss`;

				logger.info(`Fetching page ${pageNumber}: ${url}`);

				// Add a small delay between requests to avoid rate limiting
				if (pageNumber > 1) {
					await new Promise(resolve => setTimeout(resolve, 1000));
				}

				const response = await axios.get(url, {
					headers: this.getHeaders(),
					timeout: 30000
				});

				if (!response.data) {
					logger.warn(`No HTML content retrieved for page ${pageNumber}`);
					break;
				}

				const $ = cheerio.load(response.data);
				const productContainers = $('.s-result-item[data-component-type="s-search-result"]');

				logger.info(`Found ${productContainers.length} potential products on page ${pageNumber}`);

				// Convert jQuery object to array and process each item
				const items = productContainers.toArray();
				for (const item of items) {
					const product = this.extractProductDetails($, item);
					if (product && !this.recommendedProducts.has(product.product_url)) {
						products.push(product);
						this.recommendedProducts.add(product.product_url);
						logger.info(`Added product: ${product.title.substring(0, 50)}... (${products.length}/${this.maxProductsPerCategory})`);

						if (products.length >= this.maxProductsPerCategory) {
							break;
						}
					}
				}

				// Check if we've reached the last page
				const nextButton = $('.s-pagination-next:not(.s-pagination-disabled)');
				if (nextButton.length === 0) {
					logger.info('Reached last page of results');
					break;
				}

				pageNumber++;
			}

			if (products.length < this.maxProductsPerCategory) {
				logger.warn(`Could only find ${products.length} products within the specified price range after checking ${pageNumber} pages`);
			} else {
				logger.info(`Successfully found ${products.length} products within the specified price range`);
			}

			return products;

		} catch (error) {
			logger.error(`Error searching products: ${error.message}`);
			return [];
		}
	}

	generateSearchCategories(analysisData) {
		const categories = new Set();

		if (analysisData.skin_tone?.main_tone) {
			categories.add(`Skincare for ${analysisData.skin_tone.main_tone} Skin`);
		}

		if (analysisData.concerns) {
			if (analysisData.concerns.acne) {
				categories.add('Acne Treatment');
			}
			if (analysisData.concerns.wrinkles) {
				categories.add('Anti Aging Skincare');
			}
			if (analysisData.concerns.dark_circles) {
				categories.add('Under Eye Treatment');
			}
			if (analysisData.concerns.pigmentation) {
				categories.add('Dark Spot Treatment');
			}
			if (analysisData.concerns.dryness) {
				categories.add('Hydrating Skincare');
			}
		}

		if (analysisData.recommendations?.product_types) {
			analysisData.recommendations.product_types.forEach(type => {
				categories.add(type);
			});
		}

		const categoriesArray = Array.from(categories);
		logger.info(`Generated ${categoriesArray.length} search categories: ${categoriesArray.join(', ')}`);
		return categoriesArray;
	}

}

module.exports = AmazonScraper;
