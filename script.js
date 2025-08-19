document.addEventListener('DOMContentLoaded', () => {
    const chatInput = document.getElementById('chat-input');
    const chatWindow = document.getElementById('chat-window');
    const sendButton = document.getElementById('send-button');
    const keyButtons = document.querySelectorAll('.key-button');
    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username-input');
    const passwordInput = document.getElementById('password-input');
    const loginStatus = document.getElementById('login-status');
    const terminalNav = document.getElementById('terminal-nav');
    // Get all tab buttons and content pages
    const tabButtons = document.querySelectorAll('.terminal-tab');
    const contentPages = document.querySelectorAll('#main-content-area > div');
    // Set the login page as the initial active page
    switchPage('login-page');
    /**
     * Switches between different pages/tabs.
     * @param {string} pageId - The ID of the page to show.
     */
    function switchPage(pageId) {
        // Remove the active class from all tabs and hide all content pages
        tabButtons.forEach(tab => tab.classList.remove('active'));
        contentPages.forEach(page => {
            // Fix for chat page layout to not be a flexbox on other pages
            if (page.id === 'chat-page') {
                page.classList.add('hidden');
                page.style.display = 'none'; // Ensure it's fully hidden
            } else {
                page.classList.add('hidden');
            }
        });
        // Find the target tab and page
        const targetTab = document.querySelector(`.terminal-tab[data-page="${pageId}"]`);
        const targetPage = document.getElementById(pageId);
        // Show the target page and set the active class on the target tab
        if (targetPage) {
            targetPage.classList.remove('hidden');
            if (pageId === 'chat-page') {
                targetPage.style.display = 'flex'; // Re-enable flexbox for the chat page
            }
            if (targetTab) {
                targetTab.classList.add('active');
            }
        }
    }
    // Add click event listeners to all tab buttons
    tabButtons.forEach(tab => {
        tab.addEventListener('click', () => {
            const pageId = tab.dataset.page;
            switchPage(pageId);
        });
    });
    // Handle login form submission
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevent the form from submitting normally
        const username = usernameInput.value;
        const password = passwordInput.value;
        loginStatus.classList.remove('hidden', 'error');
        // Hardcoded credentials for simulation
        if (username === 'user' && password === 'password') {
            loginStatus.textContent = "AUTHENTICATION SUCCESSFUL.";
            setTimeout(() => {
                switchPage('chat-page');
                // Hide login and create tabs after successful login
                terminalNav.querySelector('[data-page="login-page"]').classList.add('hidden');
                terminalNav.querySelector('[data-page="create-page"]').classList.add('hidden');
            }, 1000); // Redirect to chat page after 1 second
        } else {
            loginStatus.textContent = "AUTHENTICATION FAILED. RETRY.";
            loginStatus.classList.add('error');
        }
    });
    // Virtual keyboard functionality
    keyButtons.forEach(button => {
        button.addEventListener('click', () => {
            const char = button.dataset.char;
            const currentPage = document.querySelector('.terminal-tab.active').dataset.page;
            // Only allow virtual keyboard for the chat input
            if (currentPage === 'chat-page') {
                chatInput.value += char;
            }
        });
    });
    // Handle the Send button click
    sendButton.addEventListener('click', sendMessage);
    // Handle Enter key press on the chat input field
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    /**
     * Appends a new message to the chat window.
     * @param {string} sender - The name of the message sender.
     * @param {string} text - The content of the message.
     * @param {boolean} isUser - True if the message is from the user.
     */
    function addMessage(sender, text, isUser = false) {
        // Check if the chat window has too many messages
        const maxMessages = 6;
        if (chatWindow.children.length >= maxMessages) {
            chatWindow.removeChild(chatWindow.firstElementChild);
        }
        const messageParagraph = document.createElement('p');
        messageParagraph.classList.add('chat-message');
        if (isUser) {
            messageParagraph.classList.add('user');
        }
        messageParagraph.innerHTML = `${sender}: ${text}`;
        chatWindow.appendChild(messageParagraph);
        // Scroll to the bottom to show the new message
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }
    /**
     * Sends the user's message and generates a canned response.
     */
    function sendMessage() {
        const message = chatInput.value.trim();
        if (message === '') {
            return;
        }
        addMessage('YOU', message, true);
        chatInput.value = '';
        // Simulate a response from the other person
        setTimeout(() => {
            const cannedResponses = [
                "I hear that. What's the latest on your end?",
                "Affirmative. Stand by for new orders.",
                "Copy that. Let's move on."
            ];
            const randomResponse = cannedResponses[Math.floor(Math.random() * cannedResponses.length)];
            addMessage("J. O'NEIL", randomResponse);
        }, 1000); // Wait 1 second before responding
    }
});