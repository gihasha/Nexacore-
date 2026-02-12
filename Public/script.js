// ===== API CONFIGURATION =====
const API_URL = window.location.origin;  // Same domain for Vercel

// ===== AUTHENTICATION =====
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
            headers: {
                'Content-Type': 'application/json'
            },
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
            headers: {
                'Content-Type': 'application/json'
            },
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
            headers: {
                'Content-Type': 'application/json'
            },
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
        document.getElementById('code1').value +
        document.getElementById('code2').value +
        document.getElementById('code3').value +
        document.getElementById('code4').value +
        document.getElementById('code5').value +
        document.getElementById('code6').value;
    
    if (code.length !== 6) {
        alert('Please enter the 6-digit code');
        return;
    }
    
    try {
        const response = await fetch('/api/verification/verify-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: profileData.email,
                code
            })
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
            headers: {
                'Content-Type': 'application/json'
            },
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
        document.getElementById('phoneCode1').value +
        document.getElementById('phoneCode2').value +
        document.getElementById('phoneCode3').value +
        document.getElementById('phoneCode4').value +
        document.getElementById('phoneCode5').value +
        document.getElementById('phoneCode6').value;
    
    if (code.length !== 6) {
        alert('Please enter the 6-digit code');
        return;
    }
    
    const phone = sessionStorage.getItem('pending_phone');
    
    try {
        const response = await fetch('/api/verification/verify-phone', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
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

// ===== PROFILE UPDATE =====
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
                headers: {
                    'Authorization': `Bearer ${authToken}`
                },
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
