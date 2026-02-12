// ===== API CONFIGURATION =====
const API_URL = window.location.origin;

// ===== GLOBAL STATE =====
let isLoggedIn = false;
let authToken = null;
let currentUser = null;

let profileData = {
    nickname: 'Tech Explorer',
    username: 'guest_user',
    email: 'guest@nexacore.com',
    phone: null,
    phoneVerified: false,
    profileImage: null,
    twoFactorEnabled: false,
    loginAlerts: false,
    smsNotifications: false,
    emailNotifications: true,
    language: 'en',
    currency: 'LKR'
};

let paymentHistory = [
    { date: '2025-02-10', amount: 'රු 5,000', method: 'Visa •• 4242', status: 'Completed', receipt: '#INV-001' },
    { date: '2025-02-05', amount: 'රු 2,500', method: 'Mastercard •• 8888', status: 'Completed', receipt: '#INV-002' },
    { date: '2025-01-28', amount: 'රු 1,200', method: 'Bank Transfer', status: 'Completed', receipt: '#INV-003' }
];

// ===== CHECK AUTH =====
function checkAuth() {
    const token = localStorage.getItem('nexacore_token');
    const user = localStorage.getItem('nexacore_user');
    
    if (token && user) {
        authToken = token;
        isLoggedIn = true;
        currentUser = JSON.parse(user);
        profileData = { ...profileData, ...currentUser };
        updateSidebarProfile();
    }
}

// ===== LOGIN =====
async function handleLogin() {
    const email = document.getElementById('loginEmail')?.value;
    const password = document.getElementById('loginPassword')?.value;
    
    if (!email || !password) {
        alert('Please enter email and password');
        return;
    }
    
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            authToken = data.token;
            isLoggedIn = true;
            currentUser = data.user;
            profileData = { ...profileData, ...data.user };
            
            localStorage.setItem('nexacore_token', authToken);
            localStorage.setItem('nexacore_user', JSON.stringify(data.user));
            
            updateSidebarProfile();
            window.location.href = '/?page=dashboard';
        } else {
            alert(data.error || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed. Please try again.');
    }
}

// ===== SIGNUP =====
async function handleSignup() {
    const email = document.getElementById('signupEmail')?.value;
    const password = document.getElementById('signupPassword')?.value;
    const confirmPassword = document.getElementById('signupConfirmPassword')?.value;
    
    if (!email || !password) {
        alert('Please fill in all fields');
        return;
    }
    
    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }
    
    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            authToken = data.token;
            isLoggedIn = true;
            currentUser = data.user;
            profileData = { ...profileData, ...data.user };
            
            localStorage.setItem('nexacore_token', authToken);
            localStorage.setItem('nexacore_user', JSON.stringify(data.user));
            
            updateSidebarProfile();
            window.location.href = '/?page=dashboard';
        } else {
            alert(data.error || 'Signup failed');
        }
    } catch (error) {
        console.error('Signup error:', error);
        alert('Signup failed. Please try again.');
    }
}

// ===== LOGOUT =====
function handleLogout() {
    authToken = null;
    isLoggedIn = false;
    currentUser = null;
    
    profileData = {
        nickname: 'Tech Explorer',
        username: 'guest_user',
        email: 'guest@nexacore.com',
        phone: null,
        phoneVerified: false,
        profileImage: null,
        twoFactorEnabled: false,
        loginAlerts: false,
        smsNotifications: false,
        emailNotifications: true,
        language: 'en',
        currency: 'LKR'
    };
    
    localStorage.removeItem('nexacore_token');
    localStorage.removeItem('nexacore_user');
    
    updateSidebarProfile();
    window.location.href = '/?page=dashboard';
    
    const offcanvas = document.getElementById('nexaSidebar');
    if (offcanvas.classList.contains('show')) {
        bootstrap.Offcanvas.getInstance(offcanvas)?.hide();
    }
}

// ===== EMAIL VERIFICATION =====
async function sendEmailVerification() {
    const newEmail = document.getElementById('newEmailInput')?.value;
    
    if (!newEmail) {
        alert('Please enter new email address');
        return;
    }
    
    try {
        const response = await fetch('/api/verification/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: profileData.email })
        });
        
        const data = await response.json();
        
        if (data.success) {
            document.getElementById('emailStep1').style.display = 'none';
            document.getElementById('emailStep2').style.display = 'block';
            document.getElementById('verificationEmailDisplay').textContent = profileData.email;
            sessionStorage.setItem('pending_email', newEmail);
        } else {
            alert(data.error || 'Failed to send verification code');
        }
    } catch (error) {
        console.error('Email verification error:', error);
        alert('Failed to send verification code');
    }
}

async function verifyEmailCode() {
    const code = 
        document.getElementById('code1')?.value +
        document.getElementById('code2')?.value +
        document.getElementById('code3')?.value +
        document.getElementById('code4')?.value +
        document.getElementById('code5')?.value +
        document.getElementById('code6')?.value;
    
    if (code.length !== 6) {
        alert('Please enter the 6-digit code');
        return;
    }
    
    try {
        const response = await fetch('/api/verification/verify-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: profileData.email, code })
        });
        
        const data = await response.json();
        
        if (data.success) {
            const newEmail = sessionStorage.getItem('pending_email');
            profileData.email = newEmail;
            
            document.getElementById('currentEmailDisplay').textContent = newEmail;
            document.getElementById('modalCurrentEmail').textContent = newEmail;
            document.getElementById('sidebarEmail').textContent = newEmail;
            
            alert('✅ Email updated successfully!');
            
            bootstrap.Modal.getInstance(document.getElementById('changeEmailModal')).hide();
            
            setTimeout(() => {
                document.getElementById('emailStep1').style.display = 'block';
                document.getElementById('emailStep2').style.display = 'none';
                sessionStorage.removeItem('pending_email');
            }, 300);
        } else {
            alert(data.error || 'Invalid verification code');
        }
    } catch (error) {
        console.error('Code verification error:', error);
        alert('Verification failed');
    }
}

function resendEmailCode() {
    sendEmailVerification();
}

// ===== PHONE VERIFICATION =====
async function sendPhoneVerification() {
    const phone = document.getElementById('phoneNumberInput')?.value;
    
    if (!phone) {
        alert('Please enter phone number');
        return;
    }
    
    if (!phone.match(/^\+94[0-9]{9}$/)) {
        alert('Please use format: +94XXXXXXXXX');
        return;
    }
    
    try {
        const response = await fetch('/api/verification/send-phone', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone })
        });
        
        const data = await response.json();
        
        if (data.success) {
            document.getElementById('phoneStep1').style.display = 'none';
            document.getElementById('phoneStep2').style.display = 'block';
            document.getElementById('phoneNumberDisplay').textContent = phone;
            sessionStorage.setItem('pending_phone', phone);
        } else {
            alert(data.error || 'Failed to send SMS');
        }
    } catch (error) {
        console.error('Phone verification error:', error);
        alert('Failed to send verification code');
    }
}

async function verifyPhoneCode() {
    const code = 
        document.getElementById('phoneCode1')?.value +
        document.getElementById('phoneCode2')?.value +
        document.getElementById('phoneCode3')?.value +
        document.getElementById('phoneCode4')?.value +
        document.getElementById('phoneCode5')?.value +
        document.getElementById('phoneCode6')?.value;
    
    if (code.length !== 6) {
        alert('Please enter the 6-digit code');
        return;
    }
    
    const phone = sessionStorage.getItem('pending_phone');
    
    try {
        const response = await fetch('/api/verification/verify-phone', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, code })
        });
        
        const data = await response.json();
        
        if (data.success) {
            profileData.phone = phone;
            profileData.phoneVerified = true;
            
            document.getElementById('currentPhoneDisplay').textContent = phone + ' (Verified)';
            document.getElementById('currentPhoneDisplay').style.color = 'var(--nexa-success)';
            
            alert('✅ Phone number verified successfully!');
            
            bootstrap.Modal.getInstance(document.getElementById('verifyPhoneModal')).hide();
            
            setTimeout(() => {
                document.getElementById('phoneStep1').style.display = 'block';
                document.getElementById('phoneStep2').style.display = 'none';
                sessionStorage.removeItem('pending_phone');
            }, 300);
        } else {
            alert(data.error || 'Invalid verification code');
        }
    } catch (error) {
        console.error('Phone code verification error:', error);
        alert('Verification failed');
    }
}

// ===== PROFILE =====
function handleProfileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const previewImg = document.getElementById('profilePreviewImg');
            const previewIcon = document.getElementById('profilePreviewIcon');
            previewImg.src = e.target.result;
            previewImg.style.display = 'block';
            previewIcon.style.display = 'none';
            document.getElementById('sidebarProfileImg').src = e.target.result;
            profileData.profileImage = e.target.result;
            localStorage.setItem('nexacore_profile_image', e.target.result);
        };
        reader.readAsDataURL(file);
    }
}

async function saveProfile() {
    const nickname = document.getElementById('nicknameInput')?.value || profileData.nickname;
    const username = document.getElementById('usernameInput')?.value || profileData.username;
    const fullName = document.getElementById('fullNameInput')?.value || '';
    const bio = document.getElementById('bioInput')?.value || '';
    const whatsapp = document.getElementById('whatsappInput')?.value || '';
    const telegram = document.getElementById('telegramInput')?.value || '';
    
    profileData.nickname = nickname;
    profileData.username = username;
    
    document.getElementById('sidebarNickname').textContent = nickname;
    document.getElementById('sidebarUsername').textContent = '@' + username;
    
    if (authToken) {
        const formData = new FormData();
        formData.append('nickname', nickname);
        formData.append('username', username);
        formData.append('fullName', fullName);
        formData.append('bio', bio);
        formData.append('whatsapp', whatsapp);
        formData.append('telegram', telegram);
        
        const fileInput = document.getElementById('profileUploadInput');
        if (fileInput.files[0]) {
            formData.append('profileImage', fileInput.files[0]);
        }
        
        try {
            const response = await fetch('/api/profile/update', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${authToken}` },
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                alert('✅ Profile updated successfully!');
                window.location.href = '/?page=dashboard';
            } else {
                alert(data.error || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Profile update error:', error);
            alert('Failed to update profile');
        }
    } else {
        alert('Please login first');
        window.location.href = '/?page=login';
    }
}

function updateSidebarProfile() {
    document.getElementById('sidebarNickname').textContent = profileData.nickname;
    document.getElementById('sidebarUsername').textContent = '@' + profileData.username;
    document.getElementById('sidebarEmail').textContent = profileData.email;
    
    const savedImage = localStorage.getItem('nexacore_profile_image') || profileData.profileImage;
    if (savedImage) {
        document.getElementById('sidebarProfileImg').src = savedImage;
    }
    
    const emailDisplay = document.getElementById('currentEmailDisplay');
    if (emailDisplay) emailDisplay.textContent = profileData.email;
    
    const modalEmail = document.getElementById('modalCurrentEmail');
    if (modalEmail) modalEmail.textContent = profileData.email;
    
    const phoneDisplay = document.getElementById('currentPhoneDisplay');
    if (phoneDisplay) {
        if (profileData.phoneVerified) {
            phoneDisplay.textContent = profileData.phone + ' (Verified)';
            phoneDisplay.style.color = 'var(--nexa-success)';
        } else {
            phoneDisplay.textContent = 'Not verified';
            phoneDisplay.style.color = 'var(--nexa-text-dim)';
        }
    }
    
    // Update buttons
    const twoFactorBtn = document.getElementById('2faButton');
    if (twoFactorBtn) {
        twoFactorBtn.textContent = profileData.twoFactorEnabled ? 'Disable' : 'Enable';
    }
    
    const loginAlertsBtn = document.getElementById('loginAlertsButton');
    if (loginAlertsBtn) {
        loginAlertsBtn.textContent = profileData.loginAlerts ? 'Disable' : 'Enable';
    }
    
    const smsBtn = document.getElementById('smsButton');
    if (smsBtn) {
        smsBtn.textContent = profileData.smsNotifications ? 'Disable' : 'Enable';
    }
    
    const emailNotifBtn = document.getElementById('emailNotifButton');
    if (emailNotifBtn) {
        emailNotifBtn.textContent = profileData.emailNotifications ? 'Disable' : 'Enable';
    }
    
    const languageSelect = document.getElementById('languageSelect');
    if (languageSelect) languageSelect.value = profileData.language;
    
    const currencySelect = document.getElementById('currencySelect');
    if (currencySelect) currencySelect.value = profileData.currency;
}

// ===== SETTINGS TOGGLES =====
function toggle2FA() {
    profileData.twoFactorEnabled = !profileData.twoFactorEnabled;
    updateSidebarProfile();
    alert(profileData.twoFactorEnabled ? 
        '✅ Two-Factor Authentication enabled' : 
        'Two-Factor Authentication disabled');
}

function toggleLoginAlerts() {
    profileData.loginAlerts = !profileData.loginAlerts;
    updateSidebarProfile();
    alert(profileData.loginAlerts ? 
        '✅ Login alerts enabled' : 
        'Login alerts disabled');
}

function toggleSMS() {
    if (!profileData.phoneVerified) {
        alert('⚠️ Please add and verify a phone number first');
        openVerifyPhoneModal();
        return;
    }
    
    profileData.smsNotifications = !profileData.smsNotifications;
    updateSidebarProfile();
    
    if (profileData.smsNotifications) {
        alert(`✅ Test message sent to ${profileData.phone}`);
    } else {
        alert('SMS notifications disabled');
    }
}

function toggleEmailNotifications() {
    profileData.emailNotifications = !profileData.emailNotifications;
    updateSidebarProfile();
    alert(profileData.emailNotifications ? 
        '✅ Email notifications enabled' : 
        'Email notifications disabled');
}

// ===== LANGUAGE =====
function changeLanguage(lang) {
    profileData.language = lang;
    localStorage.setItem('nexacore_language', lang);
    
    if (window.google && google.translate) {
        const select = document.querySelector('select.goog-te-combo');
        if (select) {
            select.value = lang;
            select.dispatchEvent(new Event('change'));
        }
    }
    alert(`🌐 Language changed`);
}

function updateCurrency(currency) {
    profileData.currency = currency;
    localStorage.setItem('nexacore_currency', currency);
    alert(`💰 Default currency set to ${currency}`);
}

// ===== SECURITY QUESTIONS =====
function addSecurityQuestion() {
    const container = document.getElementById('securityQuestionsContainer');
    const div = document.createElement('div');
    div.className = 'security-question-item mb-3';
    div.innerHTML = `
        <select class="form-select mb-2">
            <option>What is your favorite book?</option>
            <option>What was your first car?</option>
            <option>What is your dream job?</option>
        </select>
        <input type="text" class="form-control" placeholder="Your answer">
    `;
    container.appendChild(div);
}

function saveSecurityQuestions() {
    alert('✅ Security questions saved!');
    window.location.href = '/?page=settings';
}

// ===== PAYMENT =====
function openAddCardModal() {
    new bootstrap.Modal(document.getElementById('addCardModal')).show();
}

function addPaymentMethod() {
    const cardNumber = document.getElementById('cardNumber')?.value;
    const expiryDate = document.getElementById('expiryDate')?.value;
    const cvv = document.getElementById('cvv')?.value;
    const cardHolder = document.getElementById('cardHolder')?.value;
    
    if (!cardNumber || !expiryDate || !cvv || !cardHolder) {
        alert('Please fill in all fields');
        return;
    }
    
    alert('✅ Card added successfully!');
    bootstrap.Modal.getInstance(document.getElementById('addCardModal')).hide();
}

function viewPaymentHistory() {
    const tbody = document.getElementById('paymentHistoryBody');
    tbody.innerHTML = '';
    
    paymentHistory.forEach(payment => {
        tbody.innerHTML += `
            <tr>
                <td>${payment.date}</td>
                <td>${payment.amount}</td>
                <td>${payment.method}</td>
                <td><span style="color: var(--nexa-success);">${payment.status}</span></td>
                <td><button class="btn-settings" onclick="downloadReceipt('${payment.receipt}')">Download</button></td>
            </tr>
        `;
    });
    
    new bootstrap.Modal(document.getElementById('paymentHistoryModal')).show();
}

function downloadReceipt(receiptId) {
    alert(`✅ Receipt ${receiptId} downloaded`);
}

// ===== MODAL OPENERS =====
function openChangeEmailModal() {
    new bootstrap.Modal(document.getElementById('changeEmailModal')).show();
}

function openVerifyPhoneModal() {
    new bootstrap.Modal(document.getElementById('verifyPhoneModal')).show();
}

function openChangePasswordModal() {
    alert('Password reset link sent to your email.');
}

function openForgotPasswordModal() {
    new bootstrap.Modal(document.getElementById('forgotPasswordModal')).show();
}

function sendPasswordReset() {
    const email = document.getElementById('resetEmail')?.value;
    if (!email) {
        alert('Please enter your email');
        return;
    }
    alert(`✅ Password reset link sent to ${email}`);
    bootstrap.Modal.getInstance(document.getElementById('forgotPasswordModal')).hide();
}

function saveAllSettings() {
    alert('✅ All settings saved successfully!');
}

// ===== CODE INPUT AUTO-MOVE =====
document.addEventListener('input', function(e) {
    if (e.target.classList.contains('code-input')) {
        if (e.target.value.length === 1) {
            const next = e.target.nextElementSibling;
            if (next && next.classList.contains('code-input')) {
                next.focus();
            }
        }
    }
});

// ===== ROUTING =====
function showPage(pageId) {
    const pages = [
        'dashboard-page', 'profile-page', 'subscription-page', 
        'services-page', 'settings-page', 'security-page', 
        'login-page', 'signup-page'
    ];
    
    pages.forEach(page => {
        const el = document.getElementById(page);
        if (el) el.style.display = 'none';
    });
    
    if (document.getElementById(pageId)) {
        document.getElementById(pageId).style.display = 'block';
    }
}

function handleRouting() {
    const urlParams = new URLSearchParams(window.location.search);
    const page = urlParams.get('page');
    
    if (!isLoggedIn) {
        if (page && ['profile', 'settings', 'security', 'subscription', 'services'].includes(page)) {
            window.location.href = '/?page=login';
            return;
        }
    }
    
    if (page === 'login') showPage('login-page');
    else if (page === 'signup') showPage('signup-page');
    else if (page === 'profile') showPage('profile-page');
    else if (page === 'settings') showPage('settings-page');
    else if (page === 'security') showPage('security-page');
    else if (page === 'subscription') showPage('subscription-page');
    else if (page === 'services') showPage('services-page');
    else showPage('dashboard-page');
    
    updateSidebarProfile();
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    handleRouting();
    
    AOS.init({
        duration: 600,
        once: true,
        offset: 20
    });
    
    const savedLang = localStorage.getItem('nexacore_language');
    if (savedLang) {
        profileData.language = savedLang;
        setTimeout(() => changeLanguage(savedLang), 1000);
    }
    
    const savedCurrency = localStorage.getItem('nexacore_currency');
    if (savedCurrency) profileData.currency = savedCurrency;
    
    const savedImage = localStorage.getItem('nexacore_profile_image');
    if (savedImage) {
        profileData.profileImage = savedImage;
        document.getElementById('sidebarProfileImg').src = savedImage;
    }
    
    document.querySelectorAll('a[href^="/?page="]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = this.href;
        });
    });
});

window.addEventListener('popstate', handleRouting);
