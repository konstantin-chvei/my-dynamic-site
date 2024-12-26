// Элементы DOM
const wheelCanvas = document.getElementById('wheelCanvas');
const spinBtn = document.getElementById('spinBtn');
const betButtonsContainer = document.getElementById('betButtons');
const betAmountInput = document.getElementById('betAmount');

const ctx = wheelCanvas.getContext('2d');
const wheelRadius = wheelCanvas.width / 2;

// Массив секторов колеса (повторяющиеся значения для разного шанса)
const sectors = [2, 4, 6, 10, 2, 4, 6, 10, 2, 4, 6, 10]; // Пример

// Генерация уникальных кнопок на основе секторов
const uniqueSectors = [...new Set(sectors)];
uniqueSectors.forEach(value => {
    const btn = document.createElement('button');
    btn.classList.add('btn', 'btn-secondary');
    btn.textContent = value;
    btn.dataset.value = value;
    betButtonsContainer.appendChild(btn);
});

// Рисование колеса
function drawWheel() {
    const numSectors = sectors.length;
    const anglePerSector = 2 * Math.PI / numSectors;

    for (let i = 0; i < numSectors; i++) {
        const startAngle = i * anglePerSector;
        const endAngle = startAngle + anglePerSector;
        ctx.beginPath();
        ctx.moveTo(wheelRadius, wheelRadius);
        ctx.arc(wheelRadius, wheelRadius, wheelRadius, startAngle, endAngle);
        ctx.fillStyle = getSectorColor(sectors[i]);
        ctx.fill();
        ctx.stroke();

        // Добавление текста
        ctx.save();
        ctx.translate(wheelRadius, wheelRadius);
        ctx.rotate(startAngle + anglePerSector / 2);
        ctx.textAlign = "right";
        ctx.fillStyle = "#000";
        ctx.font = "16px Arial";
        ctx.fillText(sectors[i], wheelRadius - 10, 10);
        ctx.restore();
    }
}

// Функция для получения цвета сектора
function getSectorColor(value) {
    switch(value) {
        case 2: return "#FF5733";
        case 4: return "#33FF57";
        case 6: return "#3357FF";
        case 10: return "#F333FF";
        default: return "#CCCCCC";
    }
}

// Инициализация колеса
drawWheel();

// Обработчики кнопок ставок
let selectedBet = null;
betButtonsContainer.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
        // Снимаем выделение с других кнопок
        document.querySelectorAll('#betButtons button').forEach(btn => btn.classList.remove('active'));
        // Выделяем выбранную кнопку
        e.target.classList.add('active');
        selectedBet = e.target.dataset.value;
    }
});

// Обработчик вращения колеса
spinBtn.addEventListener('click', () => {
    if (!selectedBet) {
        alert('Пожалуйста, выберите сектор для ставки.');
        return;
    }

    const betAmount = parseInt(betAmountInput.value);
    if (isNaN(betAmount) || betAmount <= 0) {
        alert('Пожалуйста, введите корректную сумму ставки.');
        return;
    }

    const user = auth.currentUser;
    if (user) {
        // Проверка блокировки
        db.ref('users/' + user.uid + '/isBlocked').once('value').then(snapshot => {
            if (snapshot.val()) {
                alert('Ваш аккаунт заблокирован.');
                return;
            }

            // Проверка баланса
            db.ref('users/' + user.uid + '/balance').once('value').then(snapshot => {
                const balance = snapshot.val();
                if (balance < betAmount) {
                    alert('Недостаточно средств.');
                    return;
                }

                // Блокируем кнопки
                spinBtn.disabled = true;
                document.querySelectorAll('#betButtons button').forEach(btn => btn.disabled = true);

                // Вращение колеса (анимация)
                const rotation = Math.floor(Math.random() * 360) + 3600; // Случайное вращение
                const duration = 5000; // 5 секунд

                let start = null;
                const animate = (timestamp) => {
                    if (!start) start = timestamp;
                    const progress = timestamp - start;
                    const currentRotation = (rotation * progress / duration) % 360;
                    wheelCanvas.style.transform = `rotate(${currentRotation}deg)`;
                    if (progress < duration) {
                        requestAnimationFrame(animate);
                    } else {
                        finalizeSpin(rotation % 360);
                    }
                };
                requestAnimationFrame(animate);
            });
        });
    }
});

// Завершение вращения и обработка результата
function finalizeSpin(degrees) {
    // Определяем сектор
    const numSectors = sectors.length;
    const anglePerSector = 360 / numSectors;
    const sectorIndex = Math.floor((360 - degrees + anglePerSector / 2) / anglePerSector) % numSectors;
    const landedValue = sectors[sectorIndex];

    // Обновляем баланс пользователя
    const user = auth.currentUser;
    db.ref('users/' + user.uid).once('value').then(snapshot => {
        const userData = snapshot.val();
        let newBalance = userData.balance;

        if (landedValue === parseInt(selectedBet)) {
            newBalance += selectedBet * betAmountInput.value;
            alert(`Вы угадали! Ваш баланс увеличен на ${selectedBet * betAmountInput.value}.`);
        } else {
            newBalance -= parseInt(betAmountInput.value);
            alert(`Выпало значение ${landedValue}. Ваш баланс уменьшен на ${betAmountInput.value}.`);
        }

        db.ref('users/' + user.uid + '/balance').set(newBalance);

        // Разблокируем кнопки
        spinBtn.disabled = false;
        document.querySelectorAll('#betButtons button').forEach(btn => btn.disabled = false);
    });

    // Сброс вращения колеса
    wheelCanvas.style.transform = `rotate(0deg)`;
}

// Регулярное вращение колеса каждые 30 секунд
setInterval(() => {
    spinBtn.click();
}, 30000);