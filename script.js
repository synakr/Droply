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
    const tabButtons = document.querySelectorAll('.terminal-tab');
    const contentPages = document.querySelectorAll('#main-content-area > div');

    // Default: show login page
    switchPage('login-page');

    function switchPage(pageId) {
        tabButtons.forEach(tab => tab.classList.remove('active'));
        contentPages.forEach(page => {
            if (page.id === 'chat-page') {
                page.classList.add('hidden');
                page.style.display = 'none';
            } else {
                page.classList.add('hidden');
            }
        });
        const targetTab = document.querySelector(`.terminal-tab[data-page="${pageId}"]`);
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.remove('hidden');
            if (pageId === 'chat-page') {
                targetPage.style.display = 'flex';
            }
            if (targetTab) targetTab.classList.add('active');
        }
    }

    tabButtons.forEach(tab => {
        tab.addEventListener('click', () => {
            const pageId = tab.dataset.page;
            switchPage(pageId);
        });
    });

    // Login handler
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = usernameInput.value;
        const password = passwordInput.value;
        loginStatus.classList.remove('hidden', 'error');

        if (username === 'user' && password === 'password') {
            loginStatus.textContent = "AUTHENTICATION SUCCESSFUL.";
            setTimeout(() => {
                switchPage('chat-page');
                terminalNav.querySelector('[data-page="login-page"]').classList.add('hidden');
                terminalNav.querySelector('[data-page="create-page"]').classList.add('hidden');
            }, 1000);
        } else {
            loginStatus.textContent = "AUTHENTICATION FAILED. RETRY.";
            loginStatus.classList.add('error');
        }
    });

    // Virtual keyboard
    keyButtons.forEach(button => {
        button.addEventListener('click', () => {
            const char = button.dataset.char;
            const currentPage = document.querySelector('.terminal-tab.active').dataset.page;
            if (currentPage === 'chat-page') {
                chatInput.value += char;
            }
        });
    });

    sendButton.addEventListener('click', sendMessage);
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    function addMessage(sender, text, isUser = false) {
        const maxMessages = 5;
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
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    async function sendMessage() {
        const message = chatInput.value.trim();
        if (message === '') return;

        addMessage('YOU', message, true);
        chatInput.value = '';

        // Ask chatbot.js for Ethan's response
        try {
            const reply = await getEthanResponse(message);
            addMessage("ETHAN M'HUNT", reply);
        } catch (err) {
            addMessage("SYSTEM", "Error fetching Ethan's response.");
            console.error(err);
        }
    }
});