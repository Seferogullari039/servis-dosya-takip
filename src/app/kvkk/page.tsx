import { LegalPageContent } from "@/components/legal/LegalPageContent";

export default function KvkkPage() {
  return (
    <LegalPageContent title="KVKK Aydınlatma Metni">
      <section>
        <h2 className="text-lg font-semibold text-white">Veri sorumlusu</h2>
        <p>
          Seferoğulları Otomotiv, 6698 sayılı Kişisel Verilerin Korunması Kanunu
          kapsamında veri sorumlusu sıfatıyla hareket eder.
        </p>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-white">
          İşlenen kişisel veriler
        </h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Kimlik ve iletişim: ad soyad, e-posta, telefon</li>
          <li>Müşteri ve araç: plaka, dosya no, müşteri adı, servis kayıtları</li>
          <li>Operasyon: iş emri, tedarik, ödeme ve evrak bilgileri</li>
          <li>Teknik: giriş kayıtları, IP adresi, tarayıcı bilgisi, işlem logları</li>
        </ul>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-white">
          İşleme amaçları
        </h2>
        <p>
          Veriler; servis dosyası ve iş emri takibi, operasyon yönetimi, finansal
          süreçlerin izlenmesi, yedekleme, güvenlik denetimi ve yasal
          yükümlülüklerin yerine getirilmesi amacıyla işlenir.
        </p>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-white">Erişim yetkileri</h2>
        <p>
          Sisteme yalnızca yetkilendirilmiş personel ve yöneticiler erişir. Rol
          bazlı yetkilendirme (admin / personel) uygulanır; hassas işlemler
          kayıt altına alınır.
        </p>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-white">Veri güvenliği</h2>
        <p>
          Veriler şifreli bağlantı, sunucu tarafı erişim kontrolleri, işlem
          kayıtları (audit log) ve düzenli yedekleme ile korunur. Servis
          anahtarları istemci tarafına aktarılmaz.
        </p>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-white">İletişim</h2>
        <p>
          KVKK talepleriniz için veri sorumlusuna yazılı veya kayıtlı e-posta
          kanalıyla başvurabilirsiniz.
        </p>
      </section>
    </LegalPageContent>
  );
}
