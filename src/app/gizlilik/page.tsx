import Link from "next/link";
import { LegalPageContent } from "@/components/legal/LegalPageContent";

export default function GizlilikPage() {
  return (
    <LegalPageContent title="Gizlilik Politikası">
      <section>
        <h2 className="text-lg font-semibold text-white">Kapsam</h2>
        <p>
          Bu politika, Seferoğulları Otomotiv Servis Dosya Takip Sistemi
          kullanımında toplanan ve işlenen bilgilerin gizliliğini açıklar.
        </p>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-white">Toplanan veriler</h2>
        <p>
          Uygulama; kullanıcı hesap bilgileri, servis operasyon verileri, yükleme
          yapılan evrak/görseller ve sistem güvenliği için teknik logları
          işler.
        </p>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-white">Kullanım amacı</h2>
        <p>
          Veriler yalnızca servis operasyonlarının yürütülmesi, raporlama,
          yedekleme, güvenlik ve mevzuata uyum için kullanılır; üçüncü taraflara
          izinsiz satılmaz veya pazarlama amacıyla paylaşılmaz.
        </p>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-white">Saklama süresi</h2>
        <p>
          Veriler, operasyonel gereklilik ve yasal saklama süreleri boyunca
          muhafaza edilir; silme talepleri mevzuata uygun şekilde değerlendirilir.
        </p>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-white">Haklarınız</h2>
        <p>
          KVKK kapsamındaki haklarınız için{" "}
          <Link href="/kvkk" className="text-[#5ba3d4] underline">
            Aydınlatma Metni
          </Link>
          ni inceleyebilir ve veri sorumlusuna başvurabilirsiniz.
        </p>
      </section>
    </LegalPageContent>
  );
}
