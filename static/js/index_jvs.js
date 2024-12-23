document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const loginButton = document.querySelector('.login-button');
    const loginLoaderContainer = document.getElementById('loginLoaderContainer');

    loginButton.style.display = 'none';
    loginLoaderContainer.style.display = 'flex';

    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `username=${username}&password=${password}`
    })
    .then(response => {
        if (response.status === 400) {
            showDialogue('Username does not exist, create an account');
            loginButton.style.display = 'block';
            loginLoaderContainer.style.display = 'none';
        } else {
            this.submit();
        }
    })
    .catch(error => {
        console.error('Error:', error);
        loginButton.style.display = 'block';
        loginLoaderContainer.style.display = 'none';
    });
});

document.getElementById('username').addEventListener('input', function() {
    document.getElementById('display-username').textContent = this.value;
});

function updateDateTime() {
    const now = new Date();
    document.getElementById('date').textContent = now.toLocaleDateString();
    document.getElementById('time').textContent = now.toLocaleTimeString();
}

setInterval(updateDateTime, 1000);
updateDateTime();

let otpValid = false;

function checkEmail() {
    const email = document.getElementById('email').value;
    const emailStatus = document.getElementById('email-status');

    fetch('/check_email', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `email=${email}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.exists) {
            emailStatus.innerHTML = '❌ Email already exists';
            emailStatus.style.color = 'red';
        } else {
            emailStatus.innerHTML = '✅ Email available';
            emailStatus.style.color = 'green';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        emailStatus.innerHTML = '';
    });
}

document.getElementById('email').addEventListener('input', checkEmail);

function sendOtp() {
    const email = document.getElementById('email').value;
    const username = document.getElementById('username').value;
    const otpStatus = document.getElementById('otp-status');
    const otpInput = document.getElementById('otp');
    const sendOtpButton = document.getElementById('sendOtpButton');
    const disabledText = document.getElementById('disabled-text');
    otpStatus.innerHTML = '<span class="loading-icon">⏳</span>';
    if (!email || !username) {
        showDialogue('Email and Username are required');
        otpStatus.innerHTML = '';
        return;
    }
    fetch('/send_otp', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `email=${email}&username=${username}`
    })
    .then(response => {
        if (response.status === 400) {
            return response.text().then(text => { throw new Error(text); });
        } else {
            return response.text();
        }
    })
    .then(data => {
        showDialogue(data);
        otpStatus.innerHTML = '';
        otpInput.disabled = false;
        otpValid = true;
        sendOtpButton.disabled = true;
        disabledText.style.display = 'block';
        startCountdown();
    })
    .catch(error => {
        otpStatus.innerHTML = `<span class="error-icon">❌</span> ${error.message}`;
        console.error('Error:', error);
    });
}

function verifyOtp() {
    const otp = document.getElementById('otp').value;
    const otpStatus = document.getElementById('otp-status');
    if (otp.length === 6 && otpValid) {
        fetch('/verify_otp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `otp=${otp}`
        })
        .then(response => {
            if (response.status === 200) {
                otpStatus.innerHTML = '<span class="check-icon">✔️</span>';
            } else {
                otpStatus.innerHTML = '<span class="error-icon">❌</span>';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            otpStatus.innerHTML = '<span class="error-icon">❌</span>';
        });
    } else {
        otpStatus.innerHTML = '';
    }
}

function startCountdown() {
    const countdownElement = document.getElementById('countdown');
    const otpInput = document.getElementById('otp');
    const sendOtpButton = document.getElementById('sendOtpButton');
    const disabledText = document.getElementById('disabled-text');
    let timeLeft = 150;
    countdownElement.innerHTML = `Code expires in : 00:00`;
    const countdownInterval = setInterval(() => {
        timeLeft--;
        countdownElement.innerHTML = `Code Expires in: ${formatTime(timeLeft)}`;
        if (timeLeft <= 0) {
            clearInterval(countdownInterval);
            countdownElement.innerHTML = 'OTP expired';
            otpInput.disabled = true;
            otpValid = false;
            sendOtpButton.disabled = false;
            disabledText.style.display = 'none';
            showDialogue('OTP expired. Please resend the code.');
        }
    }, 1000);
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

function openModal() {
    document.getElementById('createAccountModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('createAccountModal').style.display = 'none';
}

function showDialogue(message) {
    const dialogue = document.getElementById('dialogue');
    const dialogueMessage = document.getElementById('dialogue-message');
    dialogueMessage.textContent = message;
    dialogue.classList.add('show');
}

function closeDialogue() {
    const dialogue = document.getElementById('dialogue');
    dialogue.classList.remove('show');
}

window.onclick = function(event) {
    const modal = document.getElementById('createAccountModal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

let usernameCheckTimeout;

function checkUsername() {
    clearTimeout(usernameCheckTimeout);
    usernameCheckTimeout = setTimeout(() => {
        const username = document.getElementById('username').value;
        const usernameStatus = document.getElementById('username-status');

        fetch('/check_username', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `username=${username}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.exists) {
                usernameStatus.innerHTML = '❌ Username taken. Please use another one';
                usernameStatus.style.color = 'red';
            } else {
                usernameStatus.innerHTML = '✅ Username available';
                usernameStatus.style.color = 'green';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            usernameStatus.innerHTML = '';
        });
    }, 1000);
}

setInterval(checkUsername, 1000);

document.getElementById('createAccountForm').addEventListener('submit', function(event) {
    const otpInput = document.getElementById('otp');
    if (otpInput.disabled) {
        event.preventDefault();
        showDialogue('Please verify your email address first by entering the OTP sent to your email.');
    }
});
