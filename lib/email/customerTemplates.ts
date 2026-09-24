import {
  brandColor,
  clean,
  emailButton,
  emailColors,
  emailFooter,
  emailHeader,
  emailInfoList,
  emailInfoRow,
  emailLayout,
  emailNotice,
  emailSchedule,
  escapeHtml,
  type EmailLayoutInput,
} from "./layout";

export type CustomerEmailTheme = {
  nomeBarbearia: string;
  logoBarbearia?: string;
  corPrimaria: string;
  enderecoBarbearia?: string | null;
  telefoneBarbearia?: string | null;
};

export type CustomerAppointmentEmailData = CustomerEmailTheme & {
  nomeCliente: string;
  nomeBarbeiro: string;
  servico: string;
  detalhesServico: string;
  dataAgendamento: string;
  horarioAgendamento: string;
  codigoAgendamento: string;
  valorTotal: string;
  extras?: string;
  motivoCancelamento?: string | null;
  linkPainelCliente?: string;
  linkAvaliacao?: string;
};

export type CustomerCodeEmailData = CustomerEmailTheme & {
  nomeCliente: string;
  codigoVerificacao: string;
  linkAcao?: string;
  rotuloAcao?: string;
  contexto: string;
};

type RenderedEmail = {
  subject: string;
  html: string;
  text: string;
};

export function Button({ label, href, color }: { label: string; href: string; color: string }) {
  return emailButton(label, href, color);
}

export function InfoRow(label: string, value: string) {
  return emailInfoRow(label, value);
}

function InfoCard(rows: Array<[string, string]>) {
  return emailInfoList(rows);
}

export function AppointmentCard(data: CustomerAppointmentEmailData) {
  const rows: Array<[string, string]> = [
    ["Barbeiro", clean(data.nomeBarbeiro)],
    ["Serviços", clean(data.servico)],
  ];
  if (data.detalhesServico?.trim() && data.detalhesServico.trim() !== data.servico.trim()) {
    rows.push(["Detalhes do atendimento", data.detalhesServico.trim()]);
  }
  if (data.extras?.trim()) rows.push(["Produtos para retirada", data.extras.trim()]);
  rows.push(["Total", clean(data.valorTotal)]);
  return emailSchedule(clean(data.dataAgendamento), clean(data.horarioAgendamento), clean(data.codigoAgendamento)) + InfoCard(rows);
}

function NoticeBox({ label, value, color }: { label: string; value?: string | null; color?: string }) {
  return emailNotice(label, value, color);
}

export function SecurityCodeBox(code: string, color: string) {
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" bgcolor="${emailColors.raised}" style="margin-top:28px;border-collapse:separate;border-spacing:0;border-radius:12px;table-layout:fixed;">
    <tr><td align="center" style="padding:24px 10px;font-family:Arial,Helvetica,sans-serif;">
      <p style="margin:0 0 16px;font-size:11px;line-height:18px;letter-spacing:1.5px;text-transform:uppercase;color:${escapeHtml(brandColor({ corPrimaria: color }))};">Código de segurança</p>
      <p style="margin:0;font-family:'Courier New',Courier,monospace;font-size:30px;line-height:40px;font-weight:700;letter-spacing:4px;color:${emailColors.text};word-break:break-all;">${escapeHtml(code.trim())}</p>
      <p style="margin:16px 0 0;font-size:13px;line-height:20px;color:${emailColors.muted};">Válido por 10 minutos.<br />Não compartilhe este código.</p>
    </td></tr>
  </table>`;
}

export function RatingBox(color: string) {
  return emailNotice("Sua experiência importa", "Sua opinião ajuda a cuidar de cada detalhe do atendimento. A avaliação leva menos de um minuto.", color);
}

export function EmailHeader(theme: CustomerEmailTheme) {
  return emailHeader(theme);
}

export function EmailFooter(theme: CustomerEmailTheme, note?: string) {
  return emailFooter(theme, note);
}

export function EmailLayout(input: EmailLayoutInput) {
  return emailLayout(input);
}

function lines(values: Array<string | null | undefined>) {
  return values.filter(Boolean).join("\n");
}

function appointmentTextIntro(data: CustomerAppointmentEmailData) {
  return [
    `Código: ${data.codigoAgendamento}`,
    `Data: ${data.dataAgendamento}`,
    `Horário: ${data.horarioAgendamento}`,
    `Barbeiro: ${data.nomeBarbeiro}`,
    `Serviço: ${data.servico}`,
    `Detalhes: ${data.detalhesServico}`,
    `Total: ${data.valorTotal}`,
    data.extras ? `Extras: ${data.extras}` : null,
  ];
}

export function renderCustomerAppointmentConfirmationEmail(
  data: CustomerAppointmentEmailData
): RenderedEmail {
  const subject = `Confirmação de agendamento - ${data.nomeBarbearia}`;

  return {
    subject,
    html: EmailLayout({
      ...data,
      eyebrow: "Agendamento confirmado",
      title: "Seu horário está reservado",
      intro: `Olá, ${data.nomeCliente}. Seu atendimento foi agendado com sucesso.`,
      buttonLabel: "Ver meus agendamentos",
      buttonUrl: data.linkPainelCliente,
      footerNote: "Chegue alguns minutos antes do horário marcado.",
      children: AppointmentCard(data),
    }),
    text: lines([
      `Olá, ${data.nomeCliente}.`,
      "Seu agendamento foi confirmado.",
      ...appointmentTextIntro(data),
      data.linkPainelCliente ? `Ver meus agendamentos: ${data.linkPainelCliente}` : null,
    ]),
  };
}

export function renderCustomerAppointmentCompletedEmail(
  data: CustomerAppointmentEmailData
): RenderedEmail {
  const subject = `Atendimento concluído - ${data.nomeBarbearia}`;

  return {
    subject,
    html: EmailLayout({
      ...data,
      eyebrow: "Atendimento concluído",
      title: "Obrigado pela visita",
      intro: `Olá, ${data.nomeCliente}. Seu atendimento foi finalizado e você já pode avaliar a experiência.`,
      buttonLabel: "Avaliar atendimento",
      buttonUrl: data.linkAvaliacao || data.linkPainelCliente,
      footerNote: "Sua avaliação ajuda a barbearia a manter a qualidade.",
      children: AppointmentCard(data) + RatingBox(brandColor(data)),
    }),
    text: lines([
      `Olá, ${data.nomeCliente}.`,
      "Seu atendimento foi concluído.",
      ...appointmentTextIntro(data),
      data.linkAvaliacao || data.linkPainelCliente
        ? `Avaliar atendimento: ${data.linkAvaliacao || data.linkPainelCliente}`
        : null,
    ]),
  };
}

export function renderCustomerAppointmentCancelledEmail(
  data: CustomerAppointmentEmailData
): RenderedEmail {
  const subject = `Agendamento cancelado - ${data.nomeBarbearia}`;

  return {
    subject,
    html: EmailLayout({
      ...data,
      eyebrow: "Cancelamento",
      title: "Seu horário foi cancelado",
      intro: `Olá, ${data.nomeCliente}. Esse agendamento não está mais ativo.`,
      buttonLabel: "Agendar outro horário",
      buttonUrl: data.linkPainelCliente,
      footerNote: "Se o cancelamento não parece correto, fale com a barbearia.",
      children:
        AppointmentCard(data) +
        NoticeBox({
          label: "Motivo do cancelamento",
          value: data.motivoCancelamento,
          color: "#fda4af",
        }),
    }),
    text: lines([
      `Olá, ${data.nomeCliente}.`,
      "Seu agendamento foi cancelado.",
      ...appointmentTextIntro(data),
      data.motivoCancelamento ? `Motivo: ${data.motivoCancelamento}` : null,
      data.linkPainelCliente ? `Agendar outro horário: ${data.linkPainelCliente}` : null,
    ]),
  };
}

export function renderCustomerAppointmentReminderEmail(
  data: CustomerAppointmentEmailData
): RenderedEmail {
  const subject = `Lembrete do seu atendimento - ${data.nomeBarbearia}`;

  return {
    subject,
    html: EmailLayout({
      ...data,
      eyebrow: "Lembrete",
      title: "Seu atendimento está próximo",
      intro: `Olá, ${data.nomeCliente}. Faltam cerca de 30 minutos para seu horário.`,
      buttonLabel: "Ver agendamento",
      buttonUrl: data.linkPainelCliente,
      footerNote: "Esse lembrete é automático para ajudar você a chegar no horário.",
      children: AppointmentCard(data),
    }),
    text: lines([
      `Olá, ${data.nomeCliente}.`,
      "Faltam cerca de 30 minutos para seu atendimento.",
      ...appointmentTextIntro(data),
      data.linkPainelCliente ? `Ver agendamento: ${data.linkPainelCliente}` : null,
    ]),
  };
}

export function renderCustomerAppointmentRescheduledEmail(
  data: CustomerAppointmentEmailData & {
    horarioAntigo: string;
    novoHorario: string;
  }
): RenderedEmail {
  const subject = `Agendamento remarcado - ${data.nomeBarbearia}`;

  return {
    subject,
    html: EmailLayout({
      ...data,
      eyebrow: "Reagendamento",
      title: "Seu horário foi alterado",
      intro: `Olá, ${data.nomeCliente}. Confira o novo horário do seu atendimento.`,
      buttonLabel: "Ver agendamento",
      buttonUrl: data.linkPainelCliente,
      footerNote: "Confira a agenda atualizada antes de sair.",
      children:
        NoticeBox({ label: "Horário anterior", value: data.horarioAntigo }) +
        NoticeBox({ label: "Novo horário", value: data.novoHorario }) +
        AppointmentCard(data),
    }),
    text: lines([
      `Olá, ${data.nomeCliente}.`,
      "Seu agendamento foi remarcado.",
      `Horário antigo: ${data.horarioAntigo}`,
      `Novo horário: ${data.novoHorario}`,
      ...appointmentTextIntro(data),
      data.linkPainelCliente ? `Ver agendamento: ${data.linkPainelCliente}` : null,
    ]),
  };
}

export function renderCustomerVerificationCodeEmail(
  data: CustomerCodeEmailData
): RenderedEmail {
  const subject = `Código de verificação - ${data.nomeBarbearia}`;

  return {
    subject,
    html: EmailLayout({
      ...data,
      eyebrow: "Verificação de e-mail",
      title: "Confirme seu acesso",
      intro: `Olá, ${data.nomeCliente}. Use o código abaixo para concluir ${data.contexto}.`,
      buttonLabel: data.rotuloAcao,
      buttonUrl: data.linkAcao,
      footerNote: "Se você não solicitou esse código, ignore esta mensagem.",
      children: SecurityCodeBox(data.codigoVerificacao, brandColor(data)),
    }),
    text: lines([
      `Olá, ${data.nomeCliente}.`,
      `Use este código para concluir ${data.contexto}: ${data.codigoVerificacao}`,
      "Esse código expira em 10 minutos.",
      data.linkAcao ? `${data.rotuloAcao || "Abrir"}: ${data.linkAcao}` : null,
      "Se você não solicitou esse código, ignore esta mensagem.",
    ]),
  };
}

export function renderCustomerPasswordResetEmail(
  data: CustomerCodeEmailData
): RenderedEmail {
  const subject = `Recuperação de senha - ${data.nomeBarbearia}`;

  return {
    subject,
    html: EmailLayout({
      ...data,
      eyebrow: "Segurança da conta",
      title: "Redefina sua senha",
      intro: `Olá, ${data.nomeCliente}. Use o código abaixo para criar uma nova senha.`,
      buttonLabel: data.rotuloAcao,
      buttonUrl: data.linkAcao,
      footerNote: "Se você não solicitou a redefinição, ignore esta mensagem.",
      children: SecurityCodeBox(data.codigoVerificacao, brandColor(data)),
    }),
    text: lines([
      `Olá, ${data.nomeCliente}.`,
      `Seu código para redefinir a senha é: ${data.codigoVerificacao}`,
      "Esse código expira em 10 minutos.",
      data.linkAcao ? `${data.rotuloAcao || "Abrir"}: ${data.linkAcao}` : null,
      "Se você não solicitou a redefinição, ignore esta mensagem.",
    ]),
  };
}
