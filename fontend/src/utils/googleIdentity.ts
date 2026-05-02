declare global {
  interface Window {
    google?: any;
  }
}

const GOOGLE_SDK_SRC = 'https://accounts.google.com/gsi/client';

let sdkLoadPromise: Promise<void> | null = null;

const loadScriptOnce = (id: string, src: string) => {
  if (sdkLoadPromise) return sdkLoadPromise;

  sdkLoadPromise = new Promise<void>((resolve, reject) => {
    const existing = document.getElementById(id) as HTMLScriptElement | null;
    if (existing) {
      if ((existing as any).dataset.loaded === 'true') {
        resolve();
        return;
      }
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error(`Không thể tải SDK: ${src}`)), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.id = id;
    script.src = src;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      script.dataset.loaded = 'true';
      resolve();
    };
    script.onerror = () => {
      sdkLoadPromise = null;
      reject(new Error(`Không thể tải SDK: ${src}`));
    };
    document.head.appendChild(script);
  });

  return sdkLoadPromise;
};

/**
 * ⚠️ QUAN TRỌNG: CÁU HÌNH GOOGLE CLOUD OAUTH
 * 
 * 1. Vào https://console.cloud.google.com/apis/credentials
 * 2. Chọn hoặc tạo Client ID. Loại (Client Type) PHẢI LÀ: "Web application" (Ứng dụng web)
 * 3. Trong phần "Authorized JavaScript origins" (Nguồn gốc JavaScript được cho phép),
 *    BẠN BẮT BUỘC PHẢI THÊM CÁC URL SAU ĐÂY:
 *    - http://localhost:5173
 *    - http://127.0.0.1:5173 (Nếu testing bằng local IP)
 *    - (Thêm URL production khi deploy thật)
 * 4. Lưu lại và chờ khoảng 5-10 phút để Google cập nhật.
 */
export const preloadGoogleIdentity = async (): Promise<void> => {
  await loadScriptOnce('google-identity-sdk', GOOGLE_SDK_SRC);
};

interface GoogleSignInOptions {
  containerId: string;
  onSuccess: (credential: string) => void;
  onError: (errorMsg: string) => void;
  width?: number;
}

export const setupGoogleSignIn = async (options: GoogleSignInOptions): Promise<void> => {
  const clientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID || '').trim();
  if (!clientId) {
    options.onError('Thiếu VITE_GOOGLE_CLIENT_ID trong môi trường');
    return;
  }

  try {
    await preloadGoogleIdentity();

    if (!window.google?.accounts?.id) {
      options.onError('Google Identity Services chưa sẵn sàng. Vui lòng tải lại trang.');
      return;
    }

    window.google.accounts.id.initialize({
      client_id: clientId,
      auto_select: false,
      callback: (response: any) => {
        if (response?.credential) {
          options.onSuccess(response.credential);
        } else {
          options.onError('Google trả về credential không hợp lệ.');
        }
      },
    });

    const container = document.getElementById(options.containerId);
    if (!container) {
      console.warn(`[GoogleAuth] Container #${options.containerId} not found`);
      return;
    }

    window.google.accounts.id.renderButton(container, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text: 'signin_with',
      shape: 'rectangular',
      width: options.width || 300,
    });
    
    // Optional: display prompt One Tap
    // window.google.accounts.id.prompt();

  } catch (err: any) {
    const msg = err?.message || '';
    if (msg.toLowerCase().includes('origin') || msg.toLowerCase().includes('not allowed')) {
      options.onError('Google OAuth chưa cho phép domain hiện tại. Origin hiện tại phải là exact match theo scheme + host + port.');
    } else {
      options.onError(msg || 'Lỗi khởi tạo Google Identity Services.');
    }
  }
};

