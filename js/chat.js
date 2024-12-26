// Элементы DOM
const chatBox = document.getElementById('chatBox');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');

// Обработка отправки сообщения
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = chatInput.value.trim();
    if (message === '') return;

    const user = auth.currentUser;
    if (user) {
        const msgData = {
            username: user.displayName,
            message: message,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        };
        db.ref('chat').push(msgData);
        chatInput.value = '';
    }
});

// Загрузка и отображение сообщений
db.ref('chat').on('child_added', (snapshot) => {
    const msg = snapshot.val();
    const msgElement = document.createElement('div');
    msgElement.innerHTML = `<strong>${msg.username}:</strong> ${msg.message}`;
    chatBox.appendChild(msgElement);
    chatBox.scrollTop = chatBox.scrollHeight;
});