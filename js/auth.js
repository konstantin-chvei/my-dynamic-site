// Элементы DOM
const authSection = document.getElementById('auth-section');
const mainContent = document.getElementById('main-content');
const googleSignInBtn = document.getElementById('googleSignInBtn');
const logoutBtn = document.getElementById('logoutBtn');
const profileForm = document.getElementById('profileForm');
const profileModal = new bootstrap.Modal(document.getElementById('profileModal'), {});

// Обработчик входа через Google
googleSignInBtn.addEventListener('click', () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
        .then((result) => {
            const user = result.user;
            // Добавляем пользователя в базу данных, если его еще нет
            db.ref('users/' + user.uid).once('value').then(snapshot => {
                if (!snapshot.exists()) {
                    db.ref('users/' + user.uid).set({
                        username: user.displayName,
                        email: user.email,
                        balance: 100, // Начальный баланс
                        avatar: user.photoURL || 'images/default-avatar.png',
                        isBlocked: false
                    });
                }
            });
        })
        .catch((error) => {
            console.error("Ошибка аутентификации:", error);
        });
});

// Обработчик состояния аутентификации
auth.onAuthStateChanged(user => {
    if (user) {
        authSection.style.display = 'none';
        mainContent.style.display = 'block';
        loadUserProfile(user.uid);
    } else {
        authSection.style.display = 'block';
        mainContent.style.display = 'none';
    }
});

// Обработчик выхода
logoutBtn.addEventListener('click', () => {
    auth.signOut();
});

// Загрузка профиля пользователя
function loadUserProfile(uid) {
    db.ref('users/' + uid).on('value', snapshot => {
        const userData = snapshot.val();
        if (userData.isBlocked) {
            alert('Ваш аккаунт заблокирован.');
            auth.signOut();
        }
        // Здесь можно обновить интерфейс с данными пользователя
    });
}

// Обработка формы профиля
profileForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const uid = auth.currentUser.uid;
    const username = document.getElementById('usernameInput').value;
    const password = document.getElementById('passwordInput').value;
    const avatarFile = document.getElementById('avatarInput').files[0];

    if (avatarFile) {
        const storageRef = storage.ref('avatars/' + uid + '/' + avatarFile.name);
        storageRef.put(avatarFile).then(snapshot => {
            snapshot.ref.getDownloadURL().then(url => {
                db.ref('users/' + uid).update({
                    username: username,
                    // Для безопасности лучше использовать отдельный механизм для смены пароля
                    // Здесь мы просто обновляем displayName в Firebase Auth
                });
                return auth.currentUser.updateProfile({
                    displayName: username,
                    photoURL: url
                });
            }).then(() => {
                alert('Профиль обновлен.');
                profileModal.hide();
            });
        });
    } else {
        db.ref('users/' + uid).update({
            username: username,
            // Аналогично, обновление пароля должно происходить через Firebase Auth
        });
        return auth.currentUser.updateProfile({
            displayName: username
        }).then(() => {
            alert('Профиль обновлен.');
            profileModal.hide();
        });
    }
})