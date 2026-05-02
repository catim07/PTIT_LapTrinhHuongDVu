import { useEffect, useState } from 'react';
import { dataService } from '../../services/dataService';

function Footer() {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    dataService.getAdminSettings().then(setSettings).catch(() => {});
  }, []);

  const phone = settings?.support_phone || "1800 599 907 (miễn phí)";
  const email = settings?.support_email || "cskh@lottemart.vn";
  const brand = settings?.brand_name || "LOTTE Mart";

  return (
    <footer style={{ background: "#1a1a1a", color: "#ccc", padding: "48px 0 24px", marginTop: 64, fontFamily: "'Nunito', sans-serif" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 48, marginBottom: 48 }}>
          <div>
            <div
              style={{
                background: "white",
                borderRadius: 8,
                padding: "6px 14px",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                marginBottom: 20,
              }}
            >
              <span style={{ color: "#C1121F", fontWeight: 900, fontSize: 22, letterSpacing: -1 }}>LOTTE</span>
              <span style={{ color: "#C1121F", fontWeight: 700, fontSize: 14, borderLeft: "2px solid #C1121F", paddingLeft: 6 }}>Mart</span>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.8, color: "#999", marginBottom: 20 }}>
              {brand} Việt Nam – Chuỗi siêu thị hiện đại hàng đầu Hàn Quốc tại Việt Nam. Mang đến trải nghiệm mua sắm đẳng cấp với hàng ngàn sản phẩm chất lượng cao.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              {["📘", "📸", "▶️", "🐦"].map((icon, i) => (
                <div
                  key={i}
                  style={{
                    width: 36,
                    height: 36,
                    background: "#333",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    fontSize: 16,
                  }}
                >
                  {icon}
                </div>
              ))}
            </div>
          </div>

          {[
            { title: "Hỗ trợ khách hàng", items: ["Hướng dẫn mua hàng", "Chính sách đổi trả", "Chính sách vận chuyển", "Câu hỏi thường gặp"] },
            { title: "Về LOTTE Mart", items: ["Giới thiệu", "Tuyển dụng", "Tin tức & Sự kiện", "Quan hệ đối tác"] },
            { title: "Liên hệ", items: [`📞 ${phone}`, `✉️ ${email}`, "📍 Hà Nội & TP.HCM", "🕐 8:00 - 22:00 hàng ngày"] },
          ].map((col) => (
            <div key={col.title}>
              <h4
                style={{
                  color: "white",
                  fontSize: 15,
                  fontWeight: 800,
                  marginBottom: 16,
                  paddingBottom: 10,
                  borderBottom: "2px solid #C1121F",
                }}
              >
                {col.title}
              </h4>
              {col.items.map((item) => (
                <div key={item} style={{ fontSize: 13, color: "#999", marginBottom: 10, cursor: "pointer" }}>
                  {item}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div
          style={{
            borderTop: "1px solid #333",
            paddingTop: 24,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 12,
            color: "#666",
          }}
        >
          <span>© 2024 LOTTE Mart Vietnam. Tất cả quyền được bảo lưu.</span>
          <div style={{ display: "flex", gap: 8 }}>
            {["VISA", "MC", "ATM", "ZaloPay", "MoMo"].map((method) => (
              <span key={method} style={{ background: "#333", padding: "4px 8px", borderRadius: 4, fontSize: 11 }}>
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;