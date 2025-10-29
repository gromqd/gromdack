// 🔒 СИСТЕМА ЗАЩИТЫ ОТ ЧИТЕРОВ
class AntiCheatSystem {
    constructor() {
        this.checksumKey = 'hamster_secure_' + Math.random().toString(36).substr(2, 9);
        this.lastValidation = Date.now();
        this.initProtection();
    }
    
    initProtection() {
        // Блокируем доступ к критическим функциям
        this.protectGlobalVariables();
        this.monitorGameState();
        this.detectDevTools();
        this.obfuscateData();
        this.setupPeriodicChecks();
    }
    
    // Защита глобальных переменных
    protectGlobalVariables() {
        const criticalVars = ['coins', 'tapPower', 'totalTaps', 'playTime', 'playerId'];
        
        criticalVars.forEach(varName => {
            let value = window[varName];
            
            Object.defineProperty(window, varName, {
                get: () => value,
                set: (newValue) => {
                    if (this.isValidChange(varName, value, newValue)) {
                        value = newValue;
                        this.logChange(varName, newValue);
                    } else {
                        this.penalizeCheater('Несанкционированное изменение: ' + varName);
                        return; // Блокируем изменение
                    }
                },
                configurable: false
            });
        });
    }
    
    // Проверка допустимости изменений
    isValidChange(variable, oldValue, newValue) {
        const maxChanges = {
            'coins': oldValue * 2 + 1000, // Не более чем в 2 раза + 1000
            'tapPower': oldValue + 10,    // Не более +10 за раз
            'totalTaps': oldValue + 1000, // Не более +1000 тапов
            'playTime': oldValue + 3600   // Не более +1 часа
        };
        
        if (maxChanges[variable] && newValue > maxChanges[variable]) {
            return false;
        }
        
        return true;
    }
    
    // Мониторинг состояния игры
    monitorGameState() {
        let lastCoins = window.coins || 0;
        let lastTaps = window.totalTaps || 0;
        
        setInterval(() => {
            const currentCoins = window.coins || 0;
            const currentTaps = window.totalTaps || 0;
            
            // Проверка на резкие изменения
            if (currentCoins > lastCoins * 5 && currentTaps === lastTaps) {
                this.penalizeCheater('Подозрительный рост монет без тапов');
                window.coins = lastCoins; // Откатываем изменения
            }
            
            lastCoins = currentCoins;
            lastTaps = currentTaps;
        }, 1000);
    }
    
    // Обфускация данных в localStorage
    obfuscateData() {
        const originalSetItem = localStorage.setItem;
        const originalGetItem = localStorage.getItem;
        
        localStorage.setItem = function(key, value) {
            if (key === 'hamsterGame' || key.includes('hamster')) {
                // Шифруем данные
                const encrypted = btoa(unescape(encodeURIComponent(JSON.stringify({
                    data: value,
                    checksum: this.generateChecksum(value),
                    timestamp: Date.now()
                }))));
                return originalSetItem.call(this, key, encrypted);
            }
            return originalSetItem.call(this, key, value);
        }.bind(this);
        
        localStorage.getItem = function(key) {
            if (key === 'hamsterGame' || key.includes('hamster')) {
                try {
                    const encrypted = originalGetItem.call(this, key);
                    if (!encrypted) return null;
                    
                    const decrypted = JSON.parse(decodeURIComponent(escape(atob(encrypted))));
                    
                    // Проверяем целостность данных
                    if (this.generateChecksum(decrypted.data) !== decrypted.checksum) {
                        this.penalizeCheater('Нарушение целостности данных');
                        return null;
                    }
                    
                    return decrypted.data;
                } catch (e) {
                    this.penalizeCheater('Ошибка декодирования данных');
                    return null;
                }
            }
            return originalGetItem.call(this, key);
        }.bind(this);
    }
    
    // Генерация контрольной суммы
    generateChecksum(data) {
        return btoa(unescape(encodeURIComponent(JSON.stringify(data) + this.checksumKey)))
               .substr(5, 15);
    }
    
    // Обнаружение DevTools
    detectDevTools() {
        const element = new Image();
        Object.defineProperty(element, 'id', {
            get: () => {
                this.penalizeCheater('Обнаружены DevTools');
            }
        });
        
        console.log('%c🔒', 'font-size: 50px', element);
    }
    
    // Периодические проверки
    setupPeriodicChecks() {
        setInterval(() => {
            this.validateGameState();
            this.checkForTampering();
        }, 5000);
    }
    
    // Валидация состояния игры
    validateGameState() {
        const expectedCoins = (window.totalTaps || 0) * (window.tapPower || 1);
        const actualCoins = window.coins || 0;
        
        // Допускаем расхождение до 1000 монет (для улучшений и бонусов)
        if (actualCoins > expectedCoins + 1000) {
            this.penalizeCheater('Несоответствие монет и тапов');
            window.coins = Math.min(actualCoins, expectedCoins + 1000);
        }
    }
    
    // Проверка на вмешательство
    checkForTampering() {
        // Проверяем, не были ли переопределены наши функции
        const criticalFunctions = ['saveGame', 'loadGame', 'buyUpgrade', 'tap'];
        criticalFunctions.forEach(funcName => {
            if (window[funcName] && window[funcName].toString().includes('[native code]')) {
                // Функция была переопределена
                this.penalizeCheater('Переопределение функции: ' + funcName);
                location.reload(); // Перезагружаем игру
            }
        });
    }
    
    // Наказание читеров
    penalizeCheater(reason) {
        console.warn('🚨 АНТИЧИТ: ' + reason);
        
        // Записываем в логи
        if (window.logAction) {
            window.logAction('cheat_detected', `Обнаружен чит: ${reason}`, true);
        }
        
        // Сбрасываем подозрительные значения
        if (window.coins > 100000) window.coins = 1000;
        if (window.tapPower > 100) window.tapPower = 10;
        
        // Показываем предупреждение (только в режиме отладки)
        if (window.showNotification) {
            window.showNotification('🚨 Обнаружена подозрительная активность!', 'error');
        }
    }
    
    logChange(variable, newValue) {
        if (window.logAction) {
            window.logAction('variable_change', `Изменена переменная ${variable}: ${newValue}`);
        }
    }
}

// 🔒 Защита функций админки
function protectAdminFunctions() {
    const originalAdminAddCoins = window.adminAddCoins;
    window.adminAddCoins = function(amount) {
        if (!window.isAdmin || !window.isAdmin()) {
            console.warn('🚨 Попытка несанкционированного вызова adminAddCoins');
            return;
        }
        return originalAdminAddCoins(amount);
    };
}

// 🔒 Запускаем систему защиты
let antiCheat;
try {
    antiCheat = new AntiCheatSystem();
    
    // Защищаем админ функции
    protectAdminFunctions();
    
    // Скрываем критические переменные от отладки
    Object.defineProperty(window, 'antiCheat', {
        value: antiCheat,
        writable: false,
        configurable: false,
        enumerable: false
    });
    
    console.log('🔒 Система защиты активирована');
} catch (e) {
    console.error('Ошибка инициализации защиты:', e);
}

// 🔒 Перемещаем основные переменные в замыкание
const GameState = (function() {
    let coins = 0;
    let tapPower = 1;
    let totalTaps = 0;
    let playTime = 0;
    let playerId = '';
    
    return {
        getCoins: () => coins,
        setCoins: (value) => {
            if (antiCheat && antiCheat.isValidChange('coins', coins, value)) {
                coins = value;
                return true;
            }
            return false;
        },
        
        getTapPower: () => tapPower,
        setTapPower: (value) => {
            if (antiCheat && antiCheat.isValidChange('tapPower', tapPower, value)) {
                tapPower = value;
                return true;
            }
            return false;
        },
        
        getTotalTaps: () => totalTaps,
        setTotalTaps: (value) => {
            if (antiCheat && antiCheat.isValidChange('totalTaps', totalTaps, value)) {
                totalTaps = value;
                return true;
            }
            return false;
        },
        
        getPlayTime: () => playTime,
        setPlayTime: (value) => {
            if (antiCheat && antiCheat.isValidChange('playTime', playTime, value)) {
                playTime = value;
                return true;
            }
            return false;
        },
        
        getPlayerId: () => playerId,
        setPlayerId: (value) => { playerId = value; }
    };
})();

// 🔒 Заменяем глобальные переменные на защищенные версии
Object.defineProperty(window, 'coins', {
    get: () => GameState.getCoins(),
    set: (value) => {
        if (!GameState.setCoins(value)) {
            console.warn('🚨 Попытка недопустимого изменения coins');
        }
    },
    configurable: false
});

Object.defineProperty(window, 'tapPower', {
    get: () => GameState.getTapPower(),
    set: (value) => {
        if (!GameState.setTapPower(value)) {
            console.warn('🚨 Попытка недопустимого изменения tapPower');
        }
    },
    configurable: false
});

Object.defineProperty(window, 'totalTaps', {
    get: () => GameState.getTotalTaps(),
    set: (value) => {
        if (!GameState.setTotalTaps(value)) {
            console.warn('🚨 Попытка недопустимого изменения totalTaps');
        }
    },
    configurable: false
});

Object.defineProperty(window, 'playTime', {
    get: () => GameState.getPlayTime(),
    set: (value) => {
        if (!GameState.setPlayTime(value)) {
            console.warn('🚨 Попытка недопустимого изменения playTime');
        }
    },
    configurable: false
});

Object.defineProperty(window, 'playerId', {
    get: () => GameState.getPlayerId(),
    set: (value) => GameState.setPlayerId(value),
    configurable: false
});

// Конфигурация - используем локальный сервер
const API_BASE_URL = 'https://gromqd.github.io/gromdack/';
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
function tap() {
    const oldCoins = GameState.getCoins();
    const currentTapPower = GameState.getTapPower();
    const newCoins = oldCoins + currentTapPower;
    
    if (!GameState.setCoins(newCoins)) {
        showNotification('🚨 Обнаружена подозрительная активность!', 'error');
        return;
    }
    
    GameState.setTotalTaps(GameState.getTotalTaps() + 1);
    
    updateDisplay();
    saveGame();
    
    // Анимация тапа с меньшим шрифтом
    showTapEffect(currentTapPower);
    
    // Логирование и проверка на читерство
    logAction('tap', `Тап: +${currentTapPower} монет`);
    checkSuspiciousActivity('tap', { 
        oldCoins, 
        newCoins: GameState.getCoins(), 
        tapPower: currentTapPower 
    });
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


