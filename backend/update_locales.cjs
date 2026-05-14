const fs = require('fs');

const langs = ['vi', 'en', 'ja'];
const translations = {
  vi: {
    googleSignInTitle: 'Ðang nh?p b?ng Google',
    googleSignInDesc: 'Tài kho?n c?a b?n hi?n dang liên k?t v?i Google. B?n có th? ti?p t?c dang nh?p b?ng Google ho?c thi?t l?p m?t kh?u du?i dây d? kích ho?t thêm tính nang dang nh?p b?ng email.',
    newPassword: 'M?t kh?u m?i',
    newPasswordPlaceholder: 'Nh?p m?t kh?u m?i',
    confirmPassword: 'Xác nh?n m?t kh?u m?i',
    confirmPasswordPlaceholder: 'Xác nh?n m?t kh?u',
    saving: 'Ðang luu...',
    setPassword: 'T?o m?t kh?u',
    changePassword: 'Ð?i m?t kh?u',
    currentPassword: 'M?t kh?u hi?n t?i',
    loginSecurityDesc: 'Ðang dang nh?p trên:',
    unknown: 'Không rõ',
    lastLoginAt: 'L?n dang nh?p cu?i:'
  },
  en: {
    googleSignInTitle: 'Google Sign-In',
    googleSignInDesc: 'Your account is currently connected to Google. You can continue logging in with Google or set a password below to enable email login.',
    newPassword: 'New password',
    newPasswordPlaceholder: 'Enter new password',
    confirmPassword: 'Confirm new password',
    confirmPasswordPlaceholder: 'Confirm password',
    saving: 'Saving...',
    setPassword: 'Set Password',
    changePassword: 'Change Password',
    currentPassword: 'Current password',
    loginSecurityDesc: 'Currently logged in on:',
    unknown: 'Unknown',
    lastLoginAt: 'Last login:'
  },
  ja: {
    googleSignInTitle: 'Google????',
    googleSignInDesc: '????????????Google??????????Google???????????????????????????????????????????????',
    newPassword: '????????',
    newPasswordPlaceholder: '???????????',
    confirmPassword: '????????(??)',
    confirmPasswordPlaceholder: '????????',
    saving: '???...',
    setPassword: '????????',
    changePassword: '????????',
    currentPassword: '????????',
    loginSecurityDesc: '???????:',
    unknown: '??',
    lastLoginAt: '??????:'
  }
};

for (const lang of langs) {
  const path = 'locales/' + lang + '.json';
  const data = JSON.parse(fs.readFileSync(path, 'utf8'));
  if (!data.settings) data.settings = {};
  for (const key of Object.keys(translations[lang])) {
    data.settings[key] = translations[lang][key];
  }
  fs.writeFileSync(path, JSON.stringify(data, null, 2));
  console.log('Updated ' + lang + '.json');
}
