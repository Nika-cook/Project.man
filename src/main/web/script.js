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

// Функція для перевірки, чи є користувач залогіненим
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
                document.getElementById('loginMessage').textContent = 'Login successful!';
                checkLoginStatus(); // Оновлення інтерфейсу після входу
                viewTransactions(); // Fetch and display transactions immediately

            } else {
                document.getElementById('loginMessage').textContent = 'Login failed. Check your credentials.';
                localStorage.removeItem('authData');
            }
        })
        .catch(error => {
            document.getElementById('loginMessage').textContent = 'Error logging in';
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
            document.getElementById('registerMessage').textContent = 'Registration successful!';
        })
        .catch(error => {
            document.getElementById('registerMessage').textContent = 'Error registering user';
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
    const amount = document.getElementById('transAmount').value;
    const description = document.getElementById('transDescription').value;
    const date = document.getElementById('transDate').value;

    fetch(`${API_BASE_URL}/transactions/${credentials.username}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': getAuthHeader()
        },
        body: JSON.stringify({type, amount, description, date})
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
