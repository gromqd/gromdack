// Конфигурация - используем локальный сервер
const API_BASE_URL = 'http://localhost:3000';
let sessionToken = localStorage.getItem('session_token');
let playerData = null;

// Инициализация игры
async function initGame() {
    try {
        showNotification('🔗 Подключаемся к серверу...', 'success');
        
        if (!sessionToken) {
            await authenticateWithTelegram();
        } else {
            await loadPlayerData();
        }
        
        updateDisplay();
        await loadUpgrades();
        
        showNotification('✅ Подключено к серверу!', 'success');
        
    } catch (error) {
        console.error('Ошибка инициализации:', error);
        showNotification('❌ Ошибка подключения: ' + error.message, 'error');
    }
}

// Авторизация (упрощенная для локального теста)
async function authenticateWithTelegram() {
    // Для теста используем фиктивные данные
    const testData = {
        initData: {
            user: {
                id: Math.floor(Math.random() * 1000000),
                username: 'test_player',
                first_name: 'Тестовый Игрок'
            }
        }
    };

    const response = await fetch(`${API_BASE_URL}/api/auth/telegram`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData)
    });

    const data = await response.json();
    
    if (!data.success) {
        throw new Error(data.error);
    }

    sessionToken = data.session_token;
    playerData = data.player;
    
    localStorage.setItem('session_token', sessionToken);
    updateDisplay();
}

// Загрузка данных игрока
async function loadPlayerData() {
    const response = await fetch(`${API_BASE_URL}/api/player`, {
        headers: { 'X-Session-Token': sessionToken }
    });

    const data = await response.json();
    
    if (!data.success) {
        // Если сессия устарела, создаем новую
        localStorage.removeItem('session_token');
        sessionToken = null;
        await authenticateWithTelegram();
        return;
    }

    playerData = data.player;
    return playerData;
}

// Тап по хомяку
async function tap() {
    if (!playerData) return;

    try {
        const response = await fetch(`${API_BASE_URL}/api/game/tap`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'X-Session-Token': sessionToken 
            }
        });

        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error);
        }

        // Обновляем данные
        playerData.coins = data.coins;
        playerData.total_taps = data.total_taps;
        
        updateDisplay();
        showTapEffect(data.coins_earned);
        
    } catch (error) {
        showNotification(`❌ ${error.message}`, 'error');
    }
}

// Покупка улучшения
async function buyUpgrade(upgradeId) {
    if (!playerData) return;

    try {
        const response = await fetch(`${API_BASE_URL}/api/game/buy-upgrade`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'X-Session-Token': sessionToken 
            },
            body: JSON.stringify({ upgrade_id: upgradeId })
        });

        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error);
        }

        // Обновляем данные
        playerData.coins = data.coins;
        playerData.tap_power = data.tap_power;
        
        updateDisplay();
        await loadUpgrades();
        showNotification(`🎉 Улучшение "${data.upgrade}" куплено!`, 'success');
        
    } catch (error) {
        showNotification(`❌ ${error.message}`, 'error');
    }
}

// Загрузка улучшений
async function loadUpgrades() {
    if (!playerData) return;

    try {
        const response = await fetch(`${API_BASE_URL}/api/game/upgrades`, {
            headers: { 'X-Session-Token': sessionToken }
        });

        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error);
        }

        renderUpgrades(data.upgrades);
        
    } catch (error) {
        console.error('Ошибка загрузки улучшений:', error);
    }
}

// Остальные функции остаются без изменений...
function updateDisplay() {
    if (!playerData) return;
    
    document.getElementById('coins').textContent = playerData.coins;
    document.getElementById('power').textContent = playerData.tap_power;
    document.getElementById('level').textContent = Math.floor(playerData.tap_power / 5) + 1;
    document.getElementById('playerId').textContent = playerData.id;
}

function renderUpgrades(upgrades) {
    const container = document.getElementById('upgradesList');
    if (!container) return;
    
    container.innerHTML = '';
    
    upgrades.forEach(upgrade => {
        const canAfford = playerData.coins >= upgrade.cost;
        const isPurchased = upgrade.purchased;
        const element = document.createElement('div');
        element.className = `upgrade-item ${canAfford && !isPurchased ? '' : 'disabled'}`;
        
        if (canAfford && !isPurchased) {
            element.onclick = () => buyUpgrade(upgrade.id);
        }
        
        element.innerHTML = `
            <div class="upgrade-icon">🛠</div>
            <div class="upgrade-info">
                <div class="upgrade-name">${upgrade.name}</div>
                <div class="upgrade-desc">${upgrade.description}</div>
            </div>
            <div class="upgrade-price">${upgrade.cost} 💰</div>
            ${isPurchased ? '<div class="upgrade-owned">✓ Куплено</div>' : ''}
        `;
        
        container.appendChild(element);
    });
}

// Функции уведомлений и анимаций (оставляем старые)
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    if (!notification) return;
    
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

function showTapEffect(amount) {
    const effect = document.getElementById('tapEffect');
    if (!effect) return;
    
    effect.textContent = `+${amount}`;
    effect.style.fontSize = '1.2em';
    effect.style.animation = 'none';
    void effect.offsetWidth;
    effect.style.animation = 'floatUp 1s ease-out';
}

function showScreen(screenName) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.style.display = 'none';
    });
    
    switch(screenName) {
        case 'main':
            document.getElementById('mainScreen').style.display = 'block';
            break;
        case 'upgrades':
            document.getElementById('upgradesScreen').style.display = 'block';
            loadUpgrades();
            break;
        case 'stats':
            document.getElementById('statsScreen').style.display = 'block';
            break;
        default:
            document.getElementById('mainScreen').style.display = 'block';
    }
}

// Запуск игры
document.addEventListener('DOMContentLoaded', initGame);
