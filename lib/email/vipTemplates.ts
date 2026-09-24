import { EMAIL_LOGO_URL, emailInfoList, emailLayout, emailNotice } from "./layout";

export type VipPaymentEmailData = {
  customerName: string;
  shopName: string;
  planName: string;
  amount: string;
  dueDateLabel: string;
  actionUrl: string;
  isDueToday: boolean;
};

export function renderVipPaymentEmail(data: VipPaymentEmailData) {
  return emailLayout({
    nomeBarbearia: data.shopName,
    logoBarbearia: EMAIL_LOGO_URL,
    corPrimaria: "#dedee1",
    eyebrow: "Seu plano mensal",
    title: data.isDueToday ? "Seu plano vence hoje" : "Seu próximo vencimento",
    intro: data.isDueToday
      ? `Olá, ${data.customerName}. Hoje é o vencimento do seu plano. Confira os detalhes abaixo.`
      : `Olá, ${data.customerName}. O vencimento do seu plano está próximo. Confira os detalhes e organize seu pagamento.`,
    preheader: `${data.planName} · ${data.amount} · Vencimento: ${data.dueDateLabel}.`,
    children: emailInfoList([
      ["Plano", data.planName],
      ["Vencimento", data.dueDateLabel],
      ["Valor mensal", data.amount],
    ]) + emailNotice("Pagamento", "Consulte o seu plano para acompanhar a situação do pagamento."),
    buttonLabel: "Ver meu plano",
    buttonUrl: data.actionUrl,
    footerNote: "Este é um aviso automático sobre o vencimento do seu plano mensal.",
  });
}
