const fs = require('fs');

const loginPath = './src/pages/Login.tsx';
const registerPath = './src/pages/Register.tsx';

function injectTranslate(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  if (!content.includes('useTranslation')) {
    content = content.replace(/(import React[^;]*;)/, '$1\nimport { useTranslation } from \'react-i18next\';');
  }
  if (!content.includes('const { t } = useTranslation();')) {
    content = content.replace(/const (Login|Register): React\.FC = \(\) => {/, 'const $1: React.FC = () => {\n  const { t } = useTranslation();');
  }
  fs.writeFileSync(filePath, content);
}

injectTranslate(loginPath);
injectTranslate(registerPath);

const replacePairs = [
  ['>Chào mừng trở lại!</', '>{t(\'auth.welcomeBack\')}</'],
  ['>Vui lòng nhập thông tin để tiếp tục mua sắm</', '>{t(\'auth.pleaseEnterInfo\')}</'],
  ['>Email/Password</', '>{t(\'auth.emailOrPhone\')}</'],
  ['>Phone OTP</', '>{t(\'auth.phoneNumber\')}</'],
  ['>Email hoặc SĐT</', '>{t(\'auth.emailOrPhone\')}</'],
  ['>Mật khẩu</', '>{t(\'auth.password\')}</'],
  ['>Quên mật khẩu?</', '>{t(\'auth.forgotPassword\')}</'],
  ['>Ghi nhớ tôi</', '>{t(\'auth.rememberMe\')}</'],
  ['>Đang đăng nhập...</', '>{t(\'auth.loggingIn\')}</'],
  ['>Đăng nhập</', '>{t(\'auth.loginBtn\')}</'],
  ['>Số điện thoại</', '>{t(\'auth.phoneNumber\')}</'],
  ['>Gửi OTP</', '>{t(\'auth.sendOTP\')}</'],
  ['>Mã OTP</', '>{t(\'auth.otpCode\')}</'],
  ['>Đang xác thực OTP...</', '>{t(\'auth.verifyingOTP\')}</'],
  ['>Xác thực OTP</', '>{t(\'auth.verifyOTP\')}</'],
  ['>Hoặc tiếp tục với</', '>{t(\'auth.orContinueWith\')}</'],
  ['>Chưa có tài khoản? ', '>{t(\'auth.noAccount\')} '],
  ['>Đăng ký ngay</', '>{t(\'auth.registerNow\')}</'],
  ['>Trải nghiệm mua sắm <', '>{t(\'auth.shoppingExperience\')} <'],
  ['>tiện lợi tại nhà</', '>{t(\'auth.convenientAtHome\')}</'],
  ['>Hàng ngàn sản phẩm tươi ngon, chất lượng từ Lotte Mart đang chờ đón bạn. Đăng nhập ngay để nhận ưu đãi độc quyền.</', '>{t(\'auth.loginBannerDesc\')}</'],
  ['>Hơn 1tr+ khách hàng tin dùng</', '>{t(\'auth.trustedBy\')}</'],

  ['>Tạo tài khoản mới</', '>{t(\'auth.createAccount\')}</'],
  ['>Bạn đã có tài khoản? ', '>{t(\'auth.alreadyHaveAccount\')} '],
  ['>Họ và tên</', '>{t(\'auth.fullName\')}</'],
  ['>Số điện thoại <span className="text-slate-400 font-normal">(tùy chọn)</span></', '>{t(\'auth.phoneNumber\')} <span className="text-slate-400 font-normal">({t(\'auth.phoneOptional\').replace(\'Số điện thoại (\', \'(\')})</span></'],
  ['>Xác nhận mật khẩu</', '>{t(\'auth.confirmPassword\')}</'],
  ['>Độ bảo mật: <', '>{t(\'auth.securityLevel\')} <'],
  ['>Tối thiểu 8 ký tự</', '>{t(\'auth.min8chars\')}</'],
  ['>Ít nhất 1 chữ in hoa</', '>{t(\'auth.min1uppercase\')}</'],
  ['>Ít nhất 1 chữ số</', '>{t(\'auth.min1number\')}</'],
  ['Tôi đồng ý với các', '{t(\'auth.iAgree\')}'],
  ['>Điều khoản dịch vụ</', '>{t(\'auth.termsOfService\')}</'],

  ['>Chính sách bảo mật</', '>{t(\'auth.privacyPolicy\')}</'],
  ['của Lotte Mart.', '{t(\'auth.ofLotteMart\')}'],
  ['>Đang tạo tài khoản...</', '>{t(\'auth.creatingAccount\')}</'],
  ['>Đăng ký tài khoản</', '>{t(\'auth.registerAccount\')}</'],
  ['>Mua sắm tại nhà cùng Lotte Mart</', '>{t(\'auth.registerBannerTitle\')}</'],
  ['>Hàng ngàn ưu đãi hấp dẫn đang chờ đón bạn. Đăng ký ngay để trải nghiệm dịch vụ đi chợ online tiện lợi nhất.</', '>{t(\'auth.registerBannerDesc\')}</'],
  ['>© 2024 Lotte Mart Việt Nam. Bảo lưu mọi quyền.</', '>{t(\'auth.copyright\')}</'],
  ['>Hoặc đăng ký bằng Email</', '>{t(\'auth.orRegisterWithEmail\')}</'],
  ['>Xác thực email đăng ký</', '>{t(\'auth.verifyRegEmail\')}</'],
  ['>Nhập mã OTP đã gửi tới email của bạn để kích hoạt tài khoản.</', '>{t(\'auth.enterOtpToActivate\')}</'],
  ['>Đang xác thực...</', '>{t(\'auth.verifyingEmail\')}</'],
  ['>Xác thực email</', '>{t(\'auth.verifyEmail\')}</'],
  ['placeholder="Nhập họ và tên"', 'placeholder={t(\'auth.fullName\')}'],
  ['placeholder="Nhập số điện thoại"', 'placeholder={t(\'auth.phoneNumber\')}'],
  ['placeholder="Nhập mã OTP"', 'placeholder={t(\'auth.otpCode\')}'],
  ['placeholder="Nhập mật khẩu"', 'placeholder={t(\'auth.password\')}'],
  ['placeholder="Xác nhận mật khẩu"', 'placeholder={t(\'auth.confirmPassword\')}'],
  ['placeholder="email@example.com hoặc 0912..."', 'placeholder={t(\'auth.emailOrPhone\')}'],
];

function applyReplace(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  replacePairs.forEach(([v, r]) => {
    content = content.split(v).join(r);
  });
  
  // Custom replaces
  content = content.replace(/\{resendCountdown > 0 \? \`Gửi lại OTP sau \$\{resendCountdown\}s\` : \'Gửi OTP\'\}/g, '{resendCountdown > 0 ? t(\'auth.resendOTP\', { seconds: resendCountdown }) : t(\'auth.sendOTP\')}');
  content = content.replace(/\{otpSending\s*\?\s*\'Đang gửi\.\.\.\'\s*:\s*otpCooldown > 0\s*\?\s*\`Gửi lại sau \$\{otpCooldown\}s\`\s*:\s*\'Gửi lại OTP\'\}/g, '{otpSending ? t(\'auth.verifyingEmail\') : otpCooldown > 0 ? t(\'auth.resendOTP\', { seconds: otpCooldown }) : t(\'auth.sendOTP\')}');
  content = content.replace(/\{passwordStrength \>= 0 \? \[\'Yếu\', \'Trung bình\', \'Khá\', \'Mạnh\'\]\[passwordStrength\] : \'Yếu\'\}/g, '{[t(\'auth.weak\'), t(\'auth.medium\'), t(\'auth.good\'), t(\'auth.strong\')][passwordStrength] || t(\'auth.weak\')}');
  content = content.replace(/\[\'Yếu\', \'Trung bình\', \'Khá\', \'Mạnh\'\]\[passwordStrength\] \|\| \'Yếu\'/g, '[t(\'auth.weak\'), t(\'auth.medium\'), t(\'auth.good\'), t(\'auth.strong\')][passwordStrength] || t(\'auth.weak\')');

  fs.writeFileSync(filePath, content);
}

applyReplace(loginPath);
applyReplace(registerPath);
console.log('Login and Register updated');
