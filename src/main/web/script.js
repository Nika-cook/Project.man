const API_BASE_URL = 'http://localhost:8080/api';


// Функція для збереження облікових даних
function setAuthData(username, password) {
    const authData = btoa(`${username}:${password}`);
    localStorage.setItem('authData', authData);
}

// Функція для отримання заголовка авторизації
function getAuthHeader() {
    const authData = localStorage.getItem('authData');
    return authData ? 'Basic ' + authData : null;
}

function showNotification(message, type = "info") {
    const container = document.getElementById('notificationContainer');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    container.appendChild(notification);

    // РџРѕРєР°Р·С‹РІР°РµРј СѓРІРµРґРѕРјР»РµРЅРёРµ
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);

    // РЈР±РёСЂР°РµРј СѓРІРµРґРѕРјР»РµРЅРёРµ С‡РµСЂРµР· 3 СЃРµРєСѓРЅРґС‹
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300); // РЈРґР°Р»СЏРµРј РёР· DOM
    }, 3000);
}


// Глобальні змінні
let chatHistory = []; // Зберігання історії чату

// Функція для відкриття/закриття чату
function toggleChat() {
    const chatWindow = document.getElementById("chatWindow");
    chatWindow.classList.toggle("hidden");

    if (!chatWindow.classList.contains("hidden")) {
        if (chatHistory.length === 0) {
            addMessage("Привіт! Як я можу допомогти вам сьогодні?", "assistant");
        }
    }
}

// Функція для додавання повідомлення в чат
function addMessage(message, sender) {
    const chatMessages = document.getElementById("chatMessages");
    const messageDiv = document.createElement("div");
    messageDiv.className = `chat-message ${sender}`;
    messageDiv.textContent = message;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Функція для надсилання повідомлення
function sendMessage() {
    const chatInput = document.getElementById("chatInput");
    const userMessage = chatInput.value.trim();

    if (!userMessage) return;

    addMessage(userMessage, "user");
    chatInput.value = "";

    fetchChatGPTResponse(userMessage);
}

// Функція для обробки попередньо визначених дій
function presetAction(action) {
    switch (action) {
        case "currency":
            fetchCurrencyRates();
            break;
        case "optimize":
            addMessage("Привіт! Як я можу оптимізувати мої витрати?", "assistant");
            fetchChatGPTResponse("Ось кілька порад, як оптимізувати ваші витрати.");
            break;
        case "crypto":
            addMessage("В яку криптовалюту краще інвестувати зараз?", "assistant");
            fetchChatGPTResponse("Ось кілька рекомендацій щодо інвестування в криптовалюту.");
            break;
    }
}

// Функція для отримання курсів валют
async function fetchCurrencyRates() {
    const ratesMap = {
        USD: "Долар",
        EUR: "Євро",
        PLN: "Злотий",
        GBP: "Фунт",
        ILS: "Шекель"
    };

    try {
        const response = await fetch("https://api.privatbank.ua/p24api/pubinfo?json&exchange&coursid=5");
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const rates = await response.json();

        let message = "Курс валют сьогодні:\n";
        rates.forEach(rate => {
            if (ratesMap[rate.ccy]) {
                message += `${ratesMap[rate.ccy]}: Купівля ${rate.buy} грн, Продаж ${rate.sale} грн\n`;
            }
        });

        addMessage(message, "assistant");
    } catch (error) {
        console.error("Error fetching currency rates:", error);
        addMessage("Не вдалося отримати курси валют. Спробуйте пізніше.", "assistant");
    }
}

// Функція для отримання поради щодо криптовалюти
async function fetchCryptoAdvice() {
    try {
        addMessage("Шукаю дані про криптовалюти...", "assistant");
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer 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`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: "В яку криптовалюту краще інвестувати зараз?" }]
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const advice = data.choices[0]?.message?.content || "Немає доступних порад.";

        addMessage(advice, "assistant");
    } catch (error) {
        console.error("Error fetching crypto advice:", error);
        addMessage("Не вдалося отримати пораду щодо криптовалют. Спробуйте пізніше.", "assistant");
    }
}

// Функція для надсилання повідомлення до ChatGPT
async function fetchChatGPTResponse(message) {
    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer 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`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    ...chatHistory,
                    { role: "user", content: message }
                ]
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const aiMessage = data.choices[0]?.message?.content || "Відповідь відсутня.";

        addMessage(aiMessage, "assistant");
        chatHistory.push({ role: "user", content: message });
        chatHistory.push({ role: "assistant", content: aiMessage });
    } catch (error) {
        console.error("Error fetching ChatGPT response:", error);
        addMessage("Щось пішло не так. Спробуйте ще раз пізніше.", "assistant");
    }
}



// Р¤СѓРЅРєС†С–СЏ РґР»СЏ РїРµСЂРµРІС–СЂРєРё, С‡Рё С” РєРѕСЂРёСЃС‚СѓРІР°С‡ Р·Р°Р»РѕРіС–РЅРµРЅРёРј
function checkLoginStatus() {
    if (localStorage.getItem('authData')) {
        document.getElementById('login').style.display = 'none';
        document.getElementById('registration').style.display = 'none';
        document.getElementById('transactionSection').style.display = 'block';
    } else {
        document.getElementById('login').style.display = 'block';
        document.getElementById('registration').style.display = 'block';
        document.getElementById('transactionSection').style.display = 'none';
    }
}

// Логін користувача
function loginUser() {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    // Збереження даних для наступних запитів
    setAuthData(username, password);

    // Запит для перевірки логіну
    fetch(`${API_BASE_URL}/transactions/${username}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': getAuthHeader()
        },
    })
        .then(response => {
            if (response.ok) {
                showNotification('Login successful!', 'success');
                checkLoginStatus(); // РћРЅРѕРІР»РµРЅРЅСЏ С–РЅС‚РµСЂС„РµР№СЃСѓ РїС–СЃР»СЏ РІС…РѕРґСѓ
                viewTransactions(); // Fetch and display transactions immediately

            } else {
                document.getElementById('loginMessage').textContent = 'Login failed. Check your credentials.';
                localStorage.removeItem('authData');
            }
        })
        .catch(error => {
            showNotification('Error logging in', 'error');
            localStorage.removeItem('authData');
        });
}

// Вихід з облікового запису
function logoutUser() {
    localStorage.removeItem('authData');
    checkLoginStatus();
}

// Реєстрація користувача
function registerUser() {
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;

    fetch(`${API_BASE_URL}/users/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': getAuthHeader()
        },
        body: JSON.stringify({username, email, password})
    })
        .then(response => response.json())
        .then(data => {
            showNotification('Registration successful!', 'success');
        })
        .catch(error => {
            showNotification('Error registering user', 'error');
        });
}

function getCredentials() {
    const authData = localStorage.getItem('authData');

    if (authData) {
        const decodedData = atob(authData); // Decode the base64 string
        const [username, password] = decodedData.split(':'); // Split into username and password
        return {username, password};
    }
    return null;
}


// Додавання транзакції
function addTransaction() {

    const credentials = getCredentials();

    const type = document.getElementById('transType').value;
    const category = document.getElementById('transCategory').value;
    const amount = document.getElementById('transAmount').value;
    const description = document.getElementById('transDescription').value;
    const date = document.getElementById('transDate').value;

    console.log("Transaction type:", type);
    console.log("Transaction category:", category);
    console.log("Transaction amount:", amount);
    console.log("Transaction description:", description);
    console.log("Transaction date:", date);

    fetch(`${API_BASE_URL}/transactions/${credentials.username}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': getAuthHeader()
        },
        body: JSON.stringify({type, category, amount, description, date})
    })
        .then(response => response.json())
        .then(data => {
            document.getElementById('transactionMessage').textContent = 'Transaction added successfully!';
        })
        .catch(error => {
            document.getElementById('transactionMessage').textContent = 'Error adding transaction';
        });
}

let currentPage = 1; // Declare globally
const transactionsPerPage = 5; // Number of transactions per page

function displayTransactions(transactions, page = 1) {
    const transactionsList = document.getElementById('transactionsList');
    transactionsList.innerHTML = ''; // Clear previous transactions

    const startIndex = (page - 1) * transactionsPerPage;
    const endIndex = startIndex + transactionsPerPage;
    const paginatedTransactions = transactions.slice(startIndex, endIndex);

    paginatedTransactions.forEach(transaction => {
        const transactionItem = document.createElement('div');
        transactionItem.className = 'transaction-card';

        transactionItem.innerHTML = `
            <div class="transaction-header">
                <h4>${transaction.description || 'No description provided'}</h4>
                <p>${new Date(transaction.date).toLocaleDateString()}</p>
            </div>
            <div class="transaction-body">
                <p><strong>Amount:</strong> $${parseFloat(transaction.amount).toFixed(2)}</p>
                <p><strong>Type:</strong> ${transaction.type} </p>
                <p><strong>Category:</strong> ${transaction.category || 'Uncategorized'}</p>
            </div>
        `;

        transactionsList.appendChild(transactionItem);
    });

    createPaginationControls(transactions, page);
}

function createPaginationControls(transactions, currentPage) {
    const paginationContainer = document.getElementById('paginationControls');
    paginationContainer.innerHTML = ''; // Clear previous controls

    const totalPages = Math.ceil(transactions.length / transactionsPerPage);

    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.className = i === currentPage ? 'active' : '';
        pageButton.onclick = () => {
            displayTransactions(transactions, i);
        };
        paginationContainer.appendChild(pageButton);
    }
}

function viewTransactions() {
    const credentials = getCredentials();

    if (!credentials) { // РџСЂРѕРІРµСЂСЏРµРј, РµСЃС‚СЊ Р»Рё РґР°РЅРЅС‹Рµ РІ credentials
        console.error("No credentials found. Please log in.");
        document.getElementById('transactionsList').innerHTML = 'Please log in to view transactions.';
        return;
    }

    fetch(`${API_BASE_URL}/transactions/${credentials.username}`, {
        method: 'GET',
        headers: {
            'Authorization': getAuthHeader()
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.length === 0) {
                document.getElementById('transactionsList').innerHTML = 'No transactions found.';
                return;
            }
            displayTransactions(data, currentPage);
        })
        .catch(error => {
            document.getElementById('transactionsList').innerHTML = 'Error fetching transactions.';
            console.error("Error:", error);
        });
}



// Function to on view of password field
function togglePassword(inputId, imgElement) {
    const input = document.getElementById(inputId);

    // Р•СЃР»Рё РїРѕР»Рµ СЃРєСЂС‹С‚РѕРµ, РїРѕРєР°Р·С‹РІР°РµРј РїР°СЂРѕР»СЊ
    if (input.type === 'password') {
        input.type = 'text';
        imgElement.src = '../assets/icons/PasswordEyeIcon/Open.png'; // РРєРѕРЅРєР° РѕС‚РєСЂС‹С‚РѕРіРѕ РіР»Р°Р·Р°
    } else {
        input.type = 'password';
        imgElement.src = '../assets/icons/PasswordEyeIcon/Close.png'; // РРєРѕРЅРєР° Р·Р°РєСЂС‹С‚РѕРіРѕ РіР»Р°Р·Р°
    }
}



// Function to fetch exchange rates and update the table
function fetchExchangeRates() {
    fetch(`${API_BASE_URL}/currencies`, {
        method: 'GET',
        headers: {
            'Authorization': getAuthHeader()
        }
    })
        // Fetch data from API
        .then(response => {
            return response.json()
        })
        .then(data => {


            const exchangeRateTable = document.getElementById('exchangeRateTable');
            exchangeRateTable.innerHTML = ''; // Clear previous rates

            if (data.length === 0) {
                const noDataRow = document.createElement('tr');
                noDataRow.innerHTML = '<td colspan="4">No exchange rates available</td>';
                exchangeRateTable.appendChild(noDataRow);
                return;
            }


            // Populate table with API data
            data.forEach(item => {

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.ccy}</td>
                    <td>${item.base_ccy}</td>
                    <td>${parseFloat(item.buy).toFixed(2)}</td>
                    <td>${parseFloat(item.sale).toFixed(2)}</td>
                `;
                exchangeRateTable.appendChild(row);


                console.log(item)
            });
        })
        .catch(error => {
            const exchangeRateTable = document.getElementById('exchangeRateTable');
            exchangeRateTable.innerHTML = '<tr><td colspan="4">Error fetching exchange rates</td></tr>';
            console.error("Error fetching exchange rates:", error);        });
}

// Fetch and display data when the page loads
document.addEventListener("DOMContentLoaded", fetchExchangeRates);

document.addEventListener("DOMContentLoaded", viewTransactions)
// Перевірка статусу логіну при завантаженні сторінки
document.addEventListener('DOMContentLoaded', checkLoginStatus);
function getAssistantResponse(userInput) {
    const apiKey = 'Bearer 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';
    const apiUrl = 'https://api.openai.com/v1/chat/completions'; // URL API OpenAI

    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'gpt-3.5-turbo', // Актуальна модель
            messages: [
                { role: 'system', content: 'You are a helpful assistant.' },
                { role: 'user', content: userInput }
            ]
        })
    })

        .then(response => response.json())
        .then(data => {
            const chatHistory = document.getElementById('chatHistory');
            const assistantMessage = document.createElement('div');
            assistantMessage.className = 'assistantMessage';

            // Перевіряємо, чи є відповідь від API
            if (data.choices && data.choices.length > 0) {
                assistantMessage.textContent = data.choices[0].message.content;
            } else {
                assistantMessage.textContent = 'Помилка: Не вдалося отримати відповідь від API.';
            }

            chatHistory.appendChild(assistantMessage);

            // Прокручуємо чат до останнього повідомлення
            chatHistory.scrollTop = chatHistory.scrollHeight;
        })
        .catch(error => {
            console.error('Помилка:', error);
        });
}
