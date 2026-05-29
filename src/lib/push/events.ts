import { dispatchTeamPushAsync } from "@/lib/push/dispatch";
import type { AracDurumu } from "@/types/vehicle-status";
import type { TedarikDurumu } from "@/types/tedarik";
import type { DosyaDurumu } from "@/types/servis-dosya";
import type { ParcaSatir } from "@/types/is-emri";

export function notifyWorkOrderCreated(params: {
  workOrderId: string;
  workOrderNo: string;
  plaka: string;
}): void {
  dispatchTeamPushAsync(
    {
      body: `Yeni iş emri oluşturuldu · ${params.plaka} (${params.workOrderNo})`,
      url: `/is-emirleri/${params.workOrderId}`,
      tag: `wo-created-${params.workOrderId}`,
      workOrderId: params.workOrderId,
    },
    { event: "work_order_created" }
  );
}

export function notifyWorkOrderVehicleStatus(params: {
  workOrderId: string;
  workOrderNo: string;
  plaka: string;
  status: AracDurumu;
  excludeUserId?: string;
}): void {
  if (params.status === "Hazır") {
    dispatchTeamPushAsync(
      {
        body: `Araç teslimata hazır · ${params.plaka} (${params.workOrderNo})`,
        url: `/is-emirleri/${params.workOrderId}`,
        tag: `wo-ready-${params.workOrderId}`,
        workOrderId: params.workOrderId,
      },
      { excludeUserId: params.excludeUserId }
    );
    return;
  }
  if (params.status === "Teslim Edildi") {
    dispatchTeamPushAsync(
      {
        body: `Araç teslim edildi · ${params.plaka} (${params.workOrderNo})`,
        url: `/is-emirleri/${params.workOrderId}`,
        tag: `wo-delivered-${params.workOrderId}`,
        workOrderId: params.workOrderId,
      },
      { excludeUserId: params.excludeUserId }
    );
  }
}

const TEDARIK_PUSH: Partial<
  Record<TedarikDurumu, { body: (p: { parca: string; plaka: string }) => string }>
> = {
  Kargoda: {
    body: (p) => `Parça kargoda · ${p.parca} (${p.plaka})`,
  },
  Geldi: {
    body: (p) => `Parça servise ulaştı · ${p.parca} (${p.plaka})`,
  },
  "Stokta Yok": {
    body: (p) => `Parça stokta yok · ${p.parca} (${p.plaka})`,
  },
  "Servis Satın Aldı": {
    body: (p) => `Servis parçayı satın aldı · ${p.parca} (${p.plaka})`,
  },
};

export function notifyProcurementStatusesOnCreate(params: {
  workOrderId: string;
  plaka: string;
  parcalar: ParcaSatir[];
  excludeUserId?: string;
}): void {
  const plaka = params.plaka || "—";
  for (const parca of params.parcalar) {
    const tpl = TEDARIK_PUSH[parca.tedarikDurumu];
    if (!tpl) continue;
    const name = parca.parcaAdi.trim() || "Parça";
    dispatchTeamPushAsync(
      {
        body: tpl.body({ parca: name, plaka }),
        url: `/tedarik`,
        tag: `tedarik-${params.workOrderId}-${parca.id}-${parca.tedarikDurumu}`,
        workOrderId: params.workOrderId,
      },
      { excludeUserId: params.excludeUserId }
    );
  }
}

export function notifyServiceFileStatus(params: {
  fileId: string;
  dosyaNo: string;
  plaka: string;
  durum: DosyaDurumu;
  excludeUserId?: string;
}): void {
  const base = { plaka: params.plaka, no: params.dosyaNo };
  if (params.durum === "Eksper Sürecinde" || params.durum === "Evrak Bekleniyor") {
    dispatchTeamPushAsync(
      {
        body: `Eksper bekleniyor · ${base.plaka} (${base.no})`,
        url: `/dosyalar/${params.fileId}`,
        tag: `file-eksper-${params.fileId}`,
      },
      { excludeUserId: params.excludeUserId }
    );
    return;
  }
  if (params.durum === "Ödeme Bekleniyor") {
    dispatchTeamPushAsync(
      {
        body: `Onay bekleniyor · ${base.plaka} (${base.no})`,
        url: `/dosyalar/${params.fileId}`,
        tag: `file-onay-${params.fileId}`,
      },
      { excludeUserId: params.excludeUserId }
    );
    return;
  }
  if (params.durum === "Kapandı") {
    dispatchTeamPushAsync(
      {
        body: `Dosya kapandı · ${base.plaka} (${base.no})`,
        url: `/dosyalar/${params.fileId}`,
        tag: `file-closed-${params.fileId}`,
      },
      { excludeUserId: params.excludeUserId }
    );
  }
}
