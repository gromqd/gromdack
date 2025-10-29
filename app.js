// Игровые переменные
let coins = 0;
let tapPower = 1;
let totalTaps = 0;
let playTime = 0;
let startTime = Date.now();

// Улучшения
const upgrades = [
    { id: 1, name: "Улучшенные пальцы", icon: "👆", cost: 100, power: 2, description: "+2 к силе тапа" },
    { id: 2, name: "Золотые перчатки", icon: "🥊", cost: 500, power: 5, description: "+5 к силе тапа" },
    { id: 3, name: "Энергетик", icon: "⚡", cost: 1000, power: 10, description: "+10 к силе тапа" },
    { id: 4, name: "Турбо-режим", icon: "🚀", cost: 5000, power: 25, description: "+25 к силе тапа" },
    { id: 5, name: "Легендарный хомяк", icon: "🏆", cost: 20000, power: 100, description: "+100 к силе тапа" }
];

// Инициализация игры
function initGame() {
    loadGame();
    updateDisplay();
    startPlayTimeCounter();
    
    // Показываем админ кнопку если это админ
    if (isAdmin()) {
        document.getElementById('adminBtn').style.display = 'block';
    }
    
    renderUpgrades();
}

// Проверка админа
function isAdmin() {
    // Замените на ваш Telegram ID
    const adminIds = [1488847693]; // ВАШ ID
    return adminIds.includes(1488847693); // Заглушка для веб-версии
}

// Тап по хомяку
function tap() {
    coins += tapPower;
    totalTaps++;
    updateDisplay();
    saveGame();
    
    // Анимация тапа
    showTapEffect(tapPower);
}

// Показать эффект тапа
function showTapEffect(amount) {
    const effect = document.getElementById('tapEffect');
    effect.textContent = `+${amount}`;
    effect.style.animation = 'none';
    void effect.offsetWidth; // Перезапуск анимации
    effect.style.animation = 'floatUp 1s ease-out';
}

// Покупка улучшения
function buyUpgrade(upgradeId) {
    const upgrade = upgrades.find(u => u.id === upgradeId);
    
    if (!upgrade) return;
    
    if (coins >= upgrade.cost) {
        coins -= upgrade.cost;
        tapPower += upgrade.power;
        updateDisplay();
        saveGame();
        renderUpgrades();
        
        showNotification(`🎉 Куплено: ${upgrade.name}!`, 'success');
    } else {
        showNotification('❌ Недостаточно монет!', 'error');
    }
}

// Показать уведомление
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Переключение экранов
function showScreen(screenName) {
    // Скрыть все экраны
    document.querySelectorAll('.screen').forEach(screen => {
        screen.style.display = 'none';
    });
    
    // Показать нужный экран
    switch(screenName) {
        case 'main':
            document.getElementById('mainScreen').style.display = 'block';
            break;
        case 'upgrades':
            document.getElementById('upgradesScreen').style.display = 'block';
            renderUpgrades();
            break;
        case 'stats':
            document.getElementById('statsScreen').style.display = 'block';
            updateStats();
            break;
        case 'shop':
            document.getElementById('shopScreen').style.display = 'block';
            break;
        case 'admin':
            if (isAdmin()) {
                document.getElementById('adminScreen').style.display = 'block';
                updateAdminStats();
            }
            break;
    }
}

// Рендер улучшений
function renderUpgrades() {
    const container = document.getElementById('upgradesList');
    container.innerHTML = '';
    
    upgrades.forEach(upgrade => {
        const canAfford = coins >= upgrade.cost;
        const element = document.createElement('div');
        element.className = `upgrade-item ${canAfford ? '' : 'disabled'}`;
        element.onclick = canAfford ? () => buyUpgrade(upgrade.id) : null;
        
        element.innerHTML = `
            <div class="upgrade-icon">${upgrade.icon}</div>
            <div class="upgrade-info">
                <div class="upgrade-name">${upgrade.name}</div>
                <div class="upgrade-desc">${upgrade.description}</div>
            </div>
            <div class="upgrade-price">${upgrade.cost} 💰</div>
        `;
        
        container.appendChild(element);
    });
}

// Обновление статистики
function updateStats() {
    document.getElementById('totalCoins').textContent = coins;
    document.getElementById('totalTaps').textContent = totalTaps;
    document.getElementById('totalPower').textContent = tapPower;
    document.getElementById('playTime').textContent = Math.floor(playTime / 60);
}

// Админ функции
function adminAddCoins(amount) {
    if (!isAdmin()) return;
    
    coins += amount;
    updateDisplay();
    saveGame();
    showNotification(`✅ Добавлено ${amount} монет!`);
}

function adminReset() {
    if (!isAdmin()) return;
    
    if (confirm('⚠️ Вы уверены? Это сбросит всю игру!')) {
        coins = 0;
        tapPower = 1;
        totalTaps = 0;
        playTime = 0;
        startTime = Date.now();
        updateDisplay();
        saveGame();
        showNotification('🔄 Игра сброшена!');
    }
}

function updateAdminStats() {
    if (!isAdmin()) return;
    
    const stats = document.getElementById('adminStats');
    stats.innerHTML = `
        <strong>Статистика игры:</strong><br>
        • Монеты: ${coins}<br>
        • Сила тапа: ${tapPower}<br>
        • Всего тапов: ${totalTaps}<br>
        • Время игры: ${Math.floor(playTime / 60)} мин.<br>
        • Уровень: ${Math.floor(tapPower / 5) + 1}
    `;
}

function exportData() {
    if (!isAdmin()) return;
    
    const data = {
        coins: coins,
        tapPower: tapPower,
        totalTaps: totalTaps,
        playTime: playTime
    };
    
    showNotification('📁 Данные готовы для экспорта');
    console.log('Данные игры:', data);
}

// Покупка в магазине
function buyItem(itemType) {
    switch(itemType) {
        case 'autoTap':
            if (coins >= 500) {
                coins -= 500;
                showNotification('⚡ Авто-тап активирован на 1 минуту!');
            } else {
                showNotification('❌ Недостаточно монет!', 'error');
            }
            break;
        case 'doubleCoins':
            if (coins >= 1000) {
                coins -= 1000;
                showNotification('💰 x2 Монеты активировано на 2 минуты!');
            } else {
                showNotification('❌ Недостаточно монет!', 'error');
            }
            break;
    }
    updateDisplay();
    saveGame();
}

// Счетчик времени игры
function startPlayTimeCounter() {
    setInterval(() => {
        playTime = Math.floor((Date.now() - startTime) / 1000);
    }, 1000);
}

// Обновление дисплея
function updateDisplay() {
    document.getElementById('coins').textContent = coins;
    document.getElementById('power').textContent = tapPower;
    document.getElementById('level').textContent = Math.floor(tapPower / 5) + 1;
}

// Сохранение игры
function saveGame() {
    const gameData = {
        coins: coins,
        tapPower: tapPower,
        totalTaps: totalTaps,
        playTime: playTime,
        startTime: startTime
    };
    localStorage.setItem('hamsterGame', JSON.stringify(gameData));
}

// Загрузка игры
function loadGame() {
    const saved = localStorage.getItem('hamsterGame');
    if (saved) {
        const gameData = JSON.parse(saved);
        coins = gameData.coins || 0;
        tapPower = gameData.tapPower || 1;
        totalTaps = gameData.totalTaps || 0;
        playTime = gameData.playTime || 0;
        startTime = gameData.startTime || Date.now();
    }
}

// Запуск игры при загрузке страницы
document.addEventListener('DOMContentLoaded', initGame);

// Отключаем контекстное меню
document.addEventListener('contextmenu', (e) => e.preventDefault());