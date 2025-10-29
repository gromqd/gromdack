// Игровые переменные
let coins = 0;
let tapPower = 1;

// Инициализация Telegram Web App
let tg = window.Telegram.WebApp;

// Функция запуска игры
function initGame() {
    tg.expand(); // Раскрываем на весь экран
    tg.enableClosingConfirmation(); // Подтверждение закрытия
    
    // Показываем админ панель если это админ
    if (tg.initDataUnsafe.user && tg.initDataUnsafe.user.id === 123456789) {
        document.getElementById('adminPanel').style.display = 'block';
    }
    
    loadGame();
    updateDisplay();
}

// Функция тапа по хомяку
function tap() {
    coins += tapPower;
    updateDisplay();
    saveGame();
    
    // Анимация тапа
    const hamster = document.querySelector('.hamster');
    hamster.style.transform = 'scale(0.9)';
    setTimeout(() => {
        hamster.style.transform = 'scale(1)';
    }, 100);
}

// Покупка улучшений
function buyUpgrade(type) {
    const upgrades = {
        1: { cost: 100, power: 2, name: 'Улучшение' },
        2: { cost: 500, power: 5, name: 'Золотые перчатки' },
        3: { cost: 1000, power: 10, name: 'Энергетик' }
    };
    
    const upgrade = upgrades[type];
    
    if (coins >= upgrade.cost) {
        coins -= upgrade.cost;
        tapPower += upgrade.power;
        updateDisplay();
        saveGame();
        
        // Анимация покупки
        alert(`🎉 Успех! Куплено: ${upgrade.name}\n💪 Новая сила: ${tapPower}`);
    } else {
        alert('❌ Недостаточно монет!');
    }
}

// Обновление интерфейса
function updateDisplay() {
    document.getElementById('coins').textContent = coins;
    document.getElementById('power').textContent = tapPower;
}

// Сохранение игры
function saveGame() {
    const gameData = {
        coins: coins,
        tapPower: tapPower
    };
    
    // Сохраняем в локальное хранилище
    localStorage.setItem('hamsterGame', JSON.stringify(gameData));
    
    // Отправляем в Telegram если нужно
    if (tg && tg.sendData) {
        tg.sendData(JSON.stringify(gameData));
    }
}

// Загрузка игры
function loadGame() {
    const saved = localStorage.getItem('hamsterGame');
    if (saved) {
        const gameData = JSON.parse(saved);
        coins = gameData.coins || 0;
        tapPower = gameData.tapPower || 1;
    }
}

// Админ функции
function addCoins(amount) {
    coins += amount;
    updateDisplay();
    saveGame();
    alert(`✅ Добавлено ${amount} монет!`);
}

function resetGame() {
    if (confirm('⚠️ Вы уверены? Это сбросит всю игру!')) {
        coins = 0;
        tapPower = 1;
        localStorage.removeItem('hamsterGame');
        updateDisplay();
        alert('🔄 Игра сброшена!');
    }
}

// Запускаем игру когда страница загрузится
document.addEventListener('DOMContentLoaded', initGame);