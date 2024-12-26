// Для `index.html` (основная страница)
if (window.location.pathname.endsWith('index.html')) {
    // Дополнительные функции для администратора на главной странице, если необходимо
}

// Для `admin.html`
if (window.location.pathname.endsWith('admin.html')) {
    const usersTableBody = document.querySelector('#usersTable tbody');
    const adminLogoutBtn = document.getElementById('adminLogoutBtn');

    // Проверка, является ли пользователь администратором
    auth.onAuthStateChanged(user => {
        if (user) {
            db.ref('users/' + user.uid + '/isAdmin').once('value').then(snapshot => {
                if (!snapshot.val()) {
                    alert('У вас нет доступа к админ-панели.');
                    window.location.href = 'index.html';
                } else {
                    loadUsers();
                }
            });
        } else {
            window.location.href = 'index.html';
        }
    });

    // Загрузка пользователей
    function loadUsers() {
        db.ref('users').on('value', snapshot => {
            usersTableBody.innerHTML = '';
            snapshot.forEach(childSnapshot => {
                const user = childSnapshot.val();
                const uid = childSnapshot.key;

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${user.username}</td>
                    <td>${user.email}</td>
                    <td>${user.balance}</td>
                    <td>${user.isBlocked ? 'Заблокирован' : 'Активен'}</td>
                    <td>
                        <button class="btn btn-sm btn-${user.isBlocked ? 'success' : 'danger'} toggle-block-btn" data-uid="${uid}">
                            ${user.isBlocked ? 'Разблокировать' : 'Заблокировать'}
                        </button>
                    </td>
                `;
                usersTableBody.appendChild(tr);
            });

            // Добавление обработчиков для кнопок блокировки/разблокировки
            document.querySelectorAll('.toggle-block-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const uid = btn.dataset.uid;
                    db.ref('users/' + uid + '/isBlocked').once('value').then(snapshot => {
                        const currentStatus = snapshot.val();
                        db.ref('users/' + uid).update({
                            isBlocked: !currentStatus
                        });
                        // Логирование действия
                        db.ref('logs').push({
                            action: !currentStatus ? 'Блокировка' : 'Разблокировка',
                            admin: auth.currentUser.uid,
                            targetUser: uid,
                            timestamp: firebase.database.ServerValue.TIMESTAMP
                        });
                    });
                });
            });
        });
    }

    // Обработчик выхода из админ-панели
    adminLogoutBtn.addEventListener('click', () => {
        auth.signOut();
    });
}