const API_BASE_URL = 'http://localhost:8080/api'

// Функція для збереження облікових даних
function setAuthData(username, password) {
    const authData = btoa(`${username}:${password}`)
    localStorage.setItem('authData', authData)
}











// Функція для отримання заголовка авторизації
function getAuthHeader() {
    const authData = localStorage.getItem('authData')
    return authData ? 'Basic ' + authData : null
}

function showNotification(message, type = 'info') {
    const container = document.getElementById('notificationContainer')
    const notification = document.createElement('div')
    notification.className = `notification ${type}`
    notification.textContent = message

    container.appendChild(notification)

    // РџРѕРєР°Р·С‹РІР°РµРј СѓРІРµРґРѕРјР»РµРЅРёРµ
    setTimeout(() => {
        notification.classList.add('show')
    }, 100)

    // РЈР±РёСЂР°РµРј СѓРІРµРґРѕРјР»РµРЅРёРµ С‡РµСЂРµР· 3 СЃРµРєСѓРЅРґС‹
    setTimeout(() => {
        notification.classList.remove('show')
        setTimeout(() => notification.remove(), 300) // РЈРґР°Р»СЏРµРј РёР· DOM
    }, 3000)
}

// Глобальні змінні
let chatHistory = [] // Зберігання історії чату

// Функція для відкриття/закриття чату
function toggleChat() {
    const chatWindow = document.getElementById('chatWindow');
    chatWindow.classList.toggle('hidden');

    if (!chatWindow.classList.contains('hidden')) {
        if (chatHistory.length === 0) {
            addMessage('Привіт! Як я можу допомогти вам сьогодні?', 'assistant');
        }
    }
}

// Прив'язуємо кнопку чату до функції toggleChat лише один раз
const chatBtn = document.getElementById('chatBtn');
chatBtn.addEventListener('click', toggleChat);


// Функція для додавання повідомлення в чат
function addMessage(message, sender) {
    const chatMessages = document.getElementById('chatMessages')
    const messageDiv = document.createElement('div')
    messageDiv.className = `chat-message ${sender}`
    messageDiv.textContent = message
    chatMessages.appendChild(messageDiv)
    chatMessages.scrollTop = chatMessages.scrollHeight
}

// Функція для надсилання повідомлення
function sendMessage() {
    const chatInput = document.getElementById('chatInput')
    const userMessage = chatInput.value.trim()

    if (!userMessage) return

    addMessage(userMessage, 'user')
    chatInput.value = ''

    fetchChatGPTResponse(userMessage)
}

// Функція для обробки попередньо визначених дій
function presetAction(action) {
    switch (action) {
        case 'currency':
            fetchCurrencyRates()
            break
        case 'optimize':
            addMessage('Привіт! Як я можу оптимізувати мої витрати?', 'assistant')
            fetchChatGPTResponse('Ось кілька порад, як оптимізувати ваші витрати.')
            break
        case 'crypto':
            addMessage('В яку криптовалюту краще інвестувати зараз?', 'assistant')
            fetchChatGPTResponse(
                'Ось кілька рекомендацій щодо інвестування в криптовалюту.'
            )
            break
    }
}

// Функція для отримання курсів валют
async function fetchCurrencyRates() {
    const ratesMap = {
        USD: 'Долар',
        EUR: 'Євро',
        PLN: 'Злотий',
        GBP: 'Фунт',
        ILS: 'Шекель',
    }

    try {
        const response = await fetch(
            'https://api.privatbank.ua/p24api/pubinfo?json&exchange&coursid=5'
        )
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }
        const rates = await response.json()

        let message = 'Курс валют сьогодні:\n'
        rates.forEach((rate) => {
            if (ratesMap[rate.ccy]) {
                message += `${ratesMap[rate.ccy]}: Купівля ${rate.buy} грн, Продаж ${
                    rate.sale
                } грн\n`
            }
        })

        addMessage(message, 'assistant')
    } catch (error) {
        console.error('Error fetching currency rates:', error)
        addMessage(
            'Не вдалося отримати курси валют. Спробуйте пізніше.',
            'assistant'
        )
    }
}

// Функція для отримання поради щодо криптовалюти
async function fetchCryptoAdvice() {
    try {
        addMessage('Шукаю дані про криптовалюти...', 'assistant')
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer API`,
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: [
                    {
                        role: 'user',
                        content: 'В яку криптовалюту краще інвестувати зараз?',
                    },
                ],
            }),
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        const advice = data.choices[0]?.message?.content || 'Немає доступних порад.'

        addMessage(advice, 'assistant')
    } catch (error) {
        console.error('Error fetching crypto advice:', error)
        addMessage(
            'Не вдалося отримати пораду щодо криптовалют. Спробуйте пізніше.',
            'assistant'
        )
    }
}

// Функція для надсилання повідомлення до ChatGPT
async function fetchChatGPTResponse(message) {
    let chatHistory = [];  // Reset history for each call

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer API`, // Replace with your actual API key
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: [{ role: 'user', content: message }],
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const aiMessage = data.choices[0]?.message?.content || 'Відповідь відсутня.';

        addMessage(aiMessage, 'assistant');
        chatHistory.push({ role: 'user', content: message });
        chatHistory.push({ role: 'assistant', content: aiMessage });
    } catch (error) {
        console.error('Error fetching ChatGPT response:', error);
        addMessage('Щось пішло не так. Спробуйте ще раз пізніше.', 'assistant');
    }
}
// Оновлена функція логіну
function loginUser() {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    if (!username || !password) {
        showNotification('Please enter valid credentials.', 'error');
        return;
    }

    setAuthData(username, password);

    fetch(`${API_BASE_URL}/transactions/${username}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: getAuthHeader(),
        },
    })
    .then((response) => {
        if (response.ok) {
            showNotification('Login successful!', 'success');

            checkLoginStatus(); // Оновлення інтерфейсу після входу
            viewTransactions();

            document.getElementById('login').style.display = 'none'; // Ховаємо форму логіну
        } else {
            document.getElementById('loginMessage').textContent =
                'Login failed. Check your credentials.';
            localStorage.removeItem('authData');
        }
    })
    .catch(() => {
        showNotification('Error logging in', 'error');
        localStorage.removeItem('authData');
    });
}

// Оновлена функція реєстрації
function registerUser() {
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;

    if (!username || !email || !password) {
        showNotification('Please fill all fields.', 'error');
        return;
    }

    fetch(`${API_BASE_URL}/users/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
    })
    .then((response) => response.json())
    .then(() => {
        showNotification('Registration successful!', 'success');
        setAuthData(username, password);
        checkLoginStatus(); // Оновлення інтерфейсу після реєстрації

        document.getElementById('registration').style.display = 'none'; // Ховаємо форму реєстрації
    })
    .catch(() => {
        showNotification('Error registering user', 'error');
    });
}

function checkLoginStatus() {
    const isLoggedIn = !!localStorage.getItem('authData'); // Чи є користувач залогінений

    // Кнопки авторизації (Login/Register) та Logout
    const authToggle = document.getElementById('authToggle');
    const logoutBtn = document.getElementById('logoutBtn');

    // Основні кнопки (Transaction, Chat, Calculator)
    const transactionBtn = document.getElementById('transactionBtn');
    const chatBtn = document.getElementById('chatBtn');
    const calculatorBtn = document.getElementById('calculatorBtn');

    // Форми логіну та реєстрації
    const loginForm = document.getElementById('login');
    const registrationForm = document.getElementById('registration');

    if (isLoggedIn) {
        // Користувач залогінений: ховаємо Login/Register, показуємо основні кнопки
        authToggle.style.display = 'none';
        logoutBtn.style.display = 'block'; //Показуємо кнопку Logout

        transactionBtn.style.display = 'block';
        chatBtn.style.display = 'block';
        calculatorBtn.style.display = 'block';

        loginForm.style.display = 'none';
        registrationForm.style.display = 'none';
    } else {
        // Користувач не залогінений: показуємо кнопки Login/Register, ховаємо інші
        authToggle.style.display = 'flex';
        logoutBtn.style.display = 'none'; //Ховаємо Logout при виході

        transactionBtn.style.display = 'none';
        chatBtn.style.display = 'none';
        calculatorBtn.style.display = 'none';

        loginForm.style.display = 'none';
        registrationForm.style.display = 'none';
    }
}


// Функція виходу
function logoutUser() {
    localStorage.removeItem('authData');
    checkLoginStatus(); // Оновлюємо UI
}

// Виконуємо перевірку статусу логіну при завантаженні сторінки
document.addEventListener('DOMContentLoaded', checkLoginStatus);


function getCredentials() {
    const authData = localStorage.getItem('authData')

    if (authData) {
        const decodedData = atob(authData) // Decode the base64 string
        const [username, password] = decodedData.split(':') // Split into username and password
        return { username, password }
    }
    return null
}
function closeTransactionWindow() {
    document.getElementById('transactionSection').style.display = 'none'; // Приховуємо вікно транзакцій
    const mainButtons = document.querySelector('.main-buttons'); // Контейнер для основних кнопок
    if (mainButtons) {
        mainButtons.style.display = 'flex'; // Повертаємо видимість основних кнопок
    }
}

//закриття та відкриття вікна транзакцій
function setupEventListeners() {
    const transactionBtn = document.getElementById('transactionBtn');
    const transactionSection = document.getElementById('transactionSection');
    const mainButtons = document.querySelector('.main-buttons'); // Контейнер для всіх кнопок
    const closeBtn = document.getElementById('closeTransactionBtn'); // Кнопка для закриття

    if (transactionBtn) {
        transactionBtn.addEventListener('click', function () {
            console.log('Кнопка натиснута');

            // Ховаємо всі кнопки
            if (mainButtons) {
                mainButtons.style.display = 'none'; // Приховуємо контейнер кнопок
            }

            // Відображаємо вікно транзакцій
            if (transactionSection) {
                transactionSection.classList.remove('hidden');
                transactionSection.style.display = 'block'; // Якщо було приховано через CSS
            } else {
                console.error('Елемент #transactionSection не знайдено');
            }
        });
    } else {
        console.error('Кнопку #transactionBtn не знайдено');
    }

    // Відкриття та закриття транзакцій
    if (closeBtn) {
        closeBtn.addEventListener('click', closeTransactionWindow);
    } else {
        console.error('Кнопку для закриття вікна не знайдено');
    }
}

document.addEventListener('DOMContentLoaded', setupEventListeners);



// Додаємо транзакцію
function addTransaction() {
    const transAmount = document.getElementById('transAmount').value;
    const transDescription = document.getElementById('transDescription').value;
    const transCategory = document.getElementById('transCategory').value;
    const transDate = document.getElementById('transDate').value;

    // Створюємо об'єкт транзакції
    const transaction = {
        amount: transAmount,
        description: transDescription,
        category: transCategory,
        date: transDate
    };

    // Отримуємо список транзакцій з localStorage або створюємо порожній масив
    const transactions = JSON.parse(localStorage.getItem('transactions')) || [];

    // Додаємо нову транзакцію до списку
    transactions.push(transaction);

    // Зберігаємо оновлений список транзакцій в localStorage
    localStorage.setItem('transactions', JSON.stringify(transactions));

    // Виводимо повідомлення для користувача
    document.getElementById('transactionMessage').textContent = 'Транзакцію додано!';
    console.log('Транзакція додана:', transaction);
}


let currentPage = 1 // Declare globally
const transactionsPerPage = 5 // Number of transactions per page

function displayTransactions(transactions, page = 1) {
    const transactionsList = document.getElementById('transactionsList');
    transactionsList.innerHTML = ''; // Clear previous transactions

    const transactionsPerPage = 5; // або скільки ви хочете показувати на сторінку
    const startIndex = (page - 1) * transactionsPerPage;
    const endIndex = startIndex + transactionsPerPage;
    const paginatedTransactions = transactions.slice(startIndex, endIndex);

    paginatedTransactions.forEach((transaction) => {
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
    const paginationContainer = document.getElementById('paginationControls')
    paginationContainer.innerHTML = '' // Clear previous controls

    const totalPages = Math.ceil(transactions.length / transactionsPerPage)

    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button')
        pageButton.textContent = i
        pageButton.className = i === currentPage ? 'active' : ''
        pageButton.onclick = () => {
            displayTransactions(transactions, i)
        }
        paginationContainer.appendChild(pageButton)
    }
}

function viewTransactions() {
    // Отримуємо транзакції з localStorage
    const transactions = JSON.parse(localStorage.getItem('transactions')) || [];

    if (transactions.length === 0) {
        document.getElementById('transactionsList').innerHTML = 'No transactions found.';
        return;
    }

    // Відображаємо транзакції
    displayTransactions(transactions);
}


// Function to on view of password field
function togglePassword(inputId, imgElement) {
    const input = document.getElementById(inputId)

    // Р•СЃР»Рё РїРѕР»Рµ СЃРєСЂС‹С‚РѕРµ, РїРѕРєР°Р·С‹РІР°РµРј РїР°СЂРѕР»СЊ
    if (input.type === 'password') {
        input.type = 'text'
        imgElement.src = 'eye.png' // РРєРѕРЅРєР° РѕС‚РєСЂС‹С‚РѕРіРѕ РіР»Р°Р·Р°
    } else {
        input.type = 'password'
        imgElement.src = 'closed-eye.png' // РРєРѕРЅРєР° Р·Р°РєСЂС‹С‚РѕРіРѕ РіР»Р°Р·Р°
    }
}

// Function to fetch exchange rates and update the table
function fetchExchangeRates() {
    fetch(`${API_BASE_URL}/currencies`, {
        method: 'GET',
        headers: {
            Authorization: getAuthHeader(),
        },
    })
        // Fetch data from API
        .then((response) => {
            return response.json()
        })
        .then((data) => {
            const exchangeRateTable = document.getElementById('exchangeRateTable')
            exchangeRateTable.innerHTML = '' // Clear previous rates

            if (data.length === 0) {
                const noDataRow = document.createElement('tr')
                noDataRow.innerHTML = '<td colspan="4">No exchange rates available</td>'
                exchangeRateTable.appendChild(noDataRow)
                return
            }

            // Populate table with API data
            data.forEach((item) => {
                const row = document.createElement('tr')
                row.innerHTML = `
                    <td>${item.ccy}</td>
                    <td>${item.base_ccy}</td>
                    <td>${parseFloat(item.buy).toFixed(2)}</td>
                    <td>${parseFloat(item.sale).toFixed(2)}</td>
                `
                exchangeRateTable.appendChild(row)

                console.log(item)
            })
        })
        .catch((error) => {
            const exchangeRateTable = document.getElementById('exchangeRateTable')
            exchangeRateTable.innerHTML =
                '<tr><td colspan="4">Error fetching exchange rates</td></tr>'
            console.error('Error fetching exchange rates:', error)
        })
}

// Fetch and display data when the page loads
document.addEventListener('DOMContentLoaded', fetchExchangeRates)

document.addEventListener('DOMContentLoaded', viewTransactions)
// Перевірка статусу логіну при завантаженні сторінки
document.addEventListener('DOMContentLoaded', checkLoginStatus)
function getAssistantResponse(userInput) {
    const apiKey = 'Bearer API' // URL API OpenAI

    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: 'gpt-4', // Актуальна модель
            messages: [
                { role: 'system', content: 'You are a helpful assistant.' },
                { role: 'user', content: userInput },
            ],
        }),
    })
        .then((response) => response.json())
        .then((data) => {
            const chatHistory = document.getElementById('chatHistory')
            const assistantMessage = document.createElement('div')
            assistantMessage.className = 'assistantMessage'

            // Перевіряємо, чи є відповідь від API
            if (data.choices && data.choices.length > 0) {
                assistantMessage.textContent = data.choices[0].message.content
            } else {
                assistantMessage.textContent =
                    'Помилка: Не вдалося отримати відповідь від API.'
            }

            chatHistory.appendChild(assistantMessage)

            // Прокручуємо чат до останнього повідомлення
            chatHistory.scrollTop = chatHistory.scrollHeight
        })
        .catch((error) => {
            console.error('Помилка:', error)
        })
}
// Функція для відкриття/закриття калькулятора
document.getElementById("calculatorBtn").addEventListener("click", function() {
    document.getElementById("calculatorWindow").classList.toggle("hidden");
});

// Функція для закриття калькулятора
function closeCalculator() {
    document.getElementById("calculatorWindow").classList.add("hidden");
}

// Функція для додавання цифр/операцій до дисплея
function appendToDisplay(value) {
    document.getElementById("calculatorDisplay").value += value;
}

// Функція для очищення дисплея
function clearDisplay() {
    document.getElementById("calculatorDisplay").value = '';
}

// Функція для обчислення результату
function calculateResult() {
    try {
        document.getElementById("calculatorDisplay").value = eval(document.getElementById("calculatorDisplay").value);
    } catch (e) {
        document.getElementById("calculatorDisplay").value = 'Error';
    }
}


function showLoginForm() {
    document.getElementById('login').style.display = 'block';
    document.getElementById('registration').style.display = 'none';
}

function showRegisterForm() {
    document.getElementById('login').style.display = 'none';
    document.getElementById('registration').style.display = 'block';
}

function closeLogin() {
    document.getElementById('login').style.display = 'none';
}
function closeRegistration() {
    document.getElementById('registration').style.display = 'none';
}
function toggleTransactionSection() {
    const transactionSection = document.getElementById('transactionSection');
    transactionSection.classList.toggle('hidden');
}

function showTransactionSection() {
    document.getElementById('transactionSection').classList.remove('hidden');
}

function closeTransactionSection() {
    document.getElementById('transactionSection').classList.add('hidden');
}
