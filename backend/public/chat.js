class ChatUI {
	constructor() {
		this.chatSection = document.getElementById('chat-section');
		this.chatMessages = document.getElementById('chat-messages');
		this.chatInput = document.getElementById('chat-input');
		this.sendButton = document.getElementById('send-message');

		this.llmSelect = document.createElement('select');
		this.llmSelect.className = 'llm-select';
		this.llmSelect.innerHTML = `
            <option value="gemini">Gemini</option>
            <option value="claude">Claude</option>
            <option value="cohere">Cohere</option>
        `;

		this.sessionId = Date.now().toString();
		this.context = {
			routine: '',
			products: [],
			tips: ''
		};

		// Add formatting rules
		this.formattingRules = {
			maxLineLength: 80,
			preserveParagraphs: true
		};

		const chatInputContainer = document.querySelector('.chat-input-container');
		chatInputContainer.insertBefore(this.llmSelect, this.chatInput);

		this.currentLLM = 'gemini'; // Default LLM

		this.llmSelect.addEventListener('change', (e) => {
			this.currentLLM = e.target.value;
		});

		this.loadingStates = {
			gemini: 'Gemini is thinking...',
			claude: 'Claude is thinking...',
			cohere: 'Cohere is thinking...'
		};

		this.setupEventListeners();
	}

	formatResponse(text) {
		let formatted = text
			.replace(/[#*_~`]/g, '')                  // Remove markdown characters
			.replace(/\n\s*[-•*+]\s/g, '\n')         // Remove bullet points
			.replace(/\n{3,}/g, '\n\n')              // Limit consecutive newlines
			.replace(/\s{2,}/g, ' ')                 // Remove extra spaces
			.trim();

		const paragraphs = formatted.split('\n\n');
		return paragraphs
			.map(para => para.trim())
			.filter(para => para.length > 0)
			.join('\n\n');
	}

	updateContext(routineData, recommendations, tips) {
		console.log('Raw data received in updateContext:', {
			routineData,
			recommendationsCount: recommendations?.length,
			tipsLength: tips?.length
		});

		// Format products
		const formattedProducts = Array.isArray(recommendations) ? recommendations.map(category => ({
			category: category.category,
			products: (category.products || []).map(product => ({
				title: product.title || '',
				price: typeof product.price === 'number' ? product.price :
					typeof product.price === 'string' ? parseFloat(product.price.replace(/[^0-9.]/g, '')) : null,
				rating: typeof product.rating === 'number' ? product.rating :
					typeof product.rating === 'string' ? parseFloat(product.rating) : null,
				reviews_count: typeof product.reviews_count === 'number' ? product.reviews_count :
					typeof product.reviews_count === 'string' ? parseInt(product.reviews_count.replace(/[^0-9]/g, '')) : null
			})).filter(p => p.title)
		})) : [];

		console.log('Formatted products:', formattedProducts);

		// Update context
		this.context = {
			routine: typeof routineData === 'string' ? routineData.replace(/[#*_~`]/g, '').trim() :
				typeof routineData === 'object' ? JSON.stringify(routineData) : '',
			products: formattedProducts,
			tips: typeof tips === 'string' ? tips.replace(/[#*_~`]/g, '').trim() : ''
		};

		console.log('Final context:', {
			routineLength: this.context.routine.length,
			productsCount: this.context.products.length,
			productCategories: this.context.products.map(p => p.category),
			tipsLength: this.context.tips.length
		});

		this.chatSection.style.display = 'block';
	}

	async typeWriterEffect(element, text, speed = 10) {
		element.textContent = '';
		element.classList.add('typewriter');

		let i = 0;
		return new Promise(resolve => {
			const typing = () => {
				if (i < text.length) {
					element.textContent += text.charAt(i);
					i++;
					setTimeout(typing, speed);
				} else {
					element.classList.remove('typewriter');
					resolve();
				}
			};
			typing();
		});
	}

	async sendMessage() {
		const message = this.chatInput.value.trim();
		if (!message) return;

		try {
			this.addMessageToChat('user', message);
			this.chatInput.value = '';
			this.setInputState(true);

			const loadingDiv = document.createElement('div');
			loadingDiv.classList.add('chat-message', 'assistant', 'loading');
			loadingDiv.textContent = this.loadingStates[this.currentLLM];
			this.chatMessages.appendChild(loadingDiv);

			const response = await fetch('/api/chat/message', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					message: message,
					sessionId: this.sessionId,
					context: this.context,
					llm: this.currentLLM
				})
			});

			const data = await response.json();
			loadingDiv.remove();

			if (!data.success) {
				throw new Error(data.error || 'Failed to get response');
			}

			// Handle fallback message for Claude
			if (data.response.fallback) {
				const fallbackDiv = document.createElement('div');
				fallbackDiv.classList.add('chat-message', 'system-message');
				fallbackDiv.textContent = data.response.fallbackMessage;
				this.chatMessages.appendChild(fallbackDiv);

				const messageDiv = document.createElement('div');
				messageDiv.classList.add('chat-message', 'assistant');
				await this.typeWriterEffect(messageDiv, data.response.response);
				this.chatMessages.appendChild(messageDiv);
			} else {
				const formattedResponse = this.formatResponse(data.response);
				const messageDiv = document.createElement('div');
				messageDiv.classList.add('chat-message', 'assistant');
				await this.typeWriterEffect(messageDiv, formattedResponse);
				this.chatMessages.appendChild(messageDiv);
			}

			this.chatMessages.scrollTop = this.chatMessages.scrollHeight;

		} catch (error) {
			console.error('Chat error:', error);
			this.addMessageToChat('error', 'Sorry, there was an error processing your message. Please try again.');
		} finally {
			this.setInputState(false);
			this.chatInput.focus();
		}
	}


	setupEventListeners() {
		this.sendButton.addEventListener('click', () => this.sendMessage());
		this.chatInput.addEventListener('keypress', (e) => {
			if (e.key === 'Enter' && !e.shiftKey) {
				e.preventDefault();
				this.sendMessage();
			}
		});
	}

	addMessageToChat(role, content) {
		const messageDiv = document.createElement('div');
		messageDiv.classList.add('chat-message', role);

		if (role === 'user') {
			messageDiv.textContent = content;
		}

		this.chatMessages.appendChild(messageDiv);
		this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
	}

	clearChat() {
		while (this.chatMessages.firstChild) {
			this.chatMessages.removeChild(this.chatMessages.firstChild);
		}
	}

	setInputState(disabled) {
		this.chatInput.disabled = disabled;
		this.sendButton.disabled = disabled;
	}
}

const chatUI = new ChatUI();

export default chatUI;
