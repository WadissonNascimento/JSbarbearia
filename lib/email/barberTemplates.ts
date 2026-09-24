import {
  clean,
  emailColors,
  emailInfoList,
  emailLayout,
  emailNotice,
  emailSchedule,
  escapeHtml,
} from "./layout";

export type BarberEmailTheme = {
  nomeBarbearia: string;
  logoBarbearia?: string;
  corPrimaria: string;
  enderecoBarbearia?: string | null;
  linkPainel: string;
};

export type BarberAppointmentEmailData = BarberEmailTheme & {
  nomeBarbeiro: string;
  nomeCliente: string;
  servico: string;
  dataAgendamento: string;
  horarioAgendamento: string;
  telefoneCliente?: string | null;
  observacoes?: string | null;
};

export type BarberRescheduleEmailData = BarberAppointmentEmailData & {
  horarioAntigo: string;
  novoHorario: string;
};

export type BarberDailyAgendaItem = {
  horario: string;
  cliente: string;
  servico: string;
  telefoneCliente?: string | null;
  observacoes?: string | null;
};

export type BarberDailyAgendaEmailData = BarberEmailTheme & {
  nomeBarbeiro: string;
  dataAgendamento: string;
  quantidadeAtendimentos: number;
  atendimentos: BarberDailyAgendaItem[];
};

export type BarberReviewEmailData = BarberAppointmentEmailData & {
  nota: number;
  comentario?: string | null;
};

type RenderedEmail = {
  subject: string;
  html: string;
  text: string;
};

type LayoutInput = BarberEmailTheme & {
  eyebrow: string;
  title: string;
  intro: string;
  children: string;
  buttonLabel?: string;
  footerNote?: string;
};

function renderInfoCard(rows: Array<[string, string]>) {
  const date = rows.find(([label]) => label === "Data")?.[1];
  const time = rows.find(([label]) => label === "Horário")?.[1];
  if (date && time) {
    return emailSchedule(date, time) + emailInfoList(rows.filter(([label]) => label !== "Data" && label !== "Horário"));
  }
  return emailInfoList(rows);
}

function renderObservation(label: string, value: string | null | undefined) {
  return emailNotice(label, value);
}

function renderAgendaList(items: BarberDailyAgendaItem[]) {
  if (items.length === 0) {
    return emailNotice("Sua agenda", "Nenhum atendimento marcado para hoje.");
  }
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:24px;border-collapse:collapse;table-layout:fixed;">
    ${items.map((item) => `<tr>
      <td width="70" style="padding:20px 12px 20px 0;border-top:1px solid ${emailColors.border};vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:21px;line-height:28px;font-weight:700;color:${emailColors.text};">${escapeHtml(item.horario)}</td>
      <td style="padding:20px 0;border-top:1px solid ${emailColors.border};vertical-align:top;font-family:Arial,Helvetica,sans-serif;word-break:break-word;overflow-wrap:anywhere;">
        <p style="margin:0;font-size:16px;line-height:24px;font-weight:700;color:${emailColors.text};">${escapeHtml(item.cliente)}</p>
        <p style="margin:5px 0 0;font-size:14px;line-height:22px;color:${emailColors.muted};">${escapeHtml(item.servico)}</p>
        ${item.telefoneCliente ? `<p style="margin:8px 0 0;font-size:13px;line-height:20px;color:${emailColors.silver};">${escapeHtml(item.telefoneCliente)}</p>` : ""}
        ${item.observacoes ? `<p style="margin:8px 0 0;font-size:13px;line-height:20px;color:${emailColors.muted};">Obs.: ${escapeHtml(item.observacoes)}</p>` : ""}
      </td>
    </tr>`).join("")}
  </table>`;
}

function renderLayout(input: LayoutInput) {
  return emailLayout({ ...input, buttonUrl: input.linkPainel });
}

function textLines(lines: Array<string | null | undefined>) {
  return lines.filter(Boolean).join("\n");
}

function appointmentRows(data: BarberAppointmentEmailData) {
  return [
    ["Cliente", clean(data.nomeCliente)],
    ["Telefone", clean(data.telefoneCliente)],
    ["Serviço", clean(data.servico)],
    ["Data", clean(data.dataAgendamento)],
    ["Horário", clean(data.horarioAgendamento)],
  ] as Array<[string, string]>;
}

export function renderBarberNewAppointmentEmail(
  data: BarberAppointmentEmailData
): RenderedEmail {
  const subject = `Novo agendamento - ${data.nomeCliente} às ${data.horarioAgendamento}`;

  return {
    subject,
    html: renderLayout({
      ...data,
      eyebrow: "Novo agendamento",
      title: "Você tem um novo horário",
      intro: `${data.nomeCliente} acabou de agendar um atendimento com você.`,
      buttonLabel: "Abrir agenda",
      footerNote: "Confira os detalhes no painel antes do atendimento.",
      children:
        renderInfoCard(appointmentRows(data)) +
        renderObservation("Observações do cliente", data.observacoes),
    }),
    text: textLines([
      `Novo agendamento em ${data.nomeBarbearia}`,
      `Barbeiro: ${data.nomeBarbeiro}`,
      `Cliente: ${data.nomeCliente}`,
      `Telefone: ${clean(data.telefoneCliente)}`,
      `Serviço: ${data.servico}`,
      `Data: ${data.dataAgendamento}`,
      `Horário: ${data.horarioAgendamento}`,
      data.observacoes ? `Observações: ${data.observacoes}` : null,
      `Abrir agenda: ${data.linkPainel}`,
    ]),
  };
}

export function renderBarberAppointmentCancelledEmail(
  data: BarberAppointmentEmailData & { motivoCancelamento?: string | null }
): RenderedEmail {
  const subject = `Agendamento cancelado - ${data.nomeCliente}`;

  return {
    subject,
    html: renderLayout({
      ...data,
      eyebrow: "Cancelamento",
      title: "Um horário foi cancelado",
      intro: `O atendimento de ${data.nomeCliente} saiu da sua agenda.`,
      buttonLabel: "Abrir agenda",
      footerNote: "O histórico continua registrado no painel.",
      children:
        renderInfoCard(appointmentRows(data)) +
        renderObservation("Motivo do cancelamento", data.motivoCancelamento),
    }),
    text: textLines([
      `Agendamento cancelado em ${data.nomeBarbearia}`,
      `Barbeiro: ${data.nomeBarbeiro}`,
      `Cliente: ${data.nomeCliente}`,
      `Serviço: ${data.servico}`,
      `Data: ${data.dataAgendamento}`,
      `Horário: ${data.horarioAgendamento}`,
      data.motivoCancelamento ? `Motivo: ${data.motivoCancelamento}` : null,
      `Abrir agenda: ${data.linkPainel}`,
    ]),
  };
}

export function renderBarberAppointmentRescheduledEmail(
  data: BarberRescheduleEmailData
): RenderedEmail {
  const subject = `Agendamento remarcado - ${data.nomeCliente}`;

  return {
    subject,
    html: renderLayout({
      ...data,
      eyebrow: "Reagendamento",
      title: "Um horário foi alterado",
      intro: `O atendimento de ${data.nomeCliente} recebeu uma nova data ou horário.`,
      buttonLabel: "Abrir agenda",
      footerNote: "Confira a agenda atualizada antes de organizar o dia.",
      children:
        renderInfoCard([
          ["Cliente", clean(data.nomeCliente)],
          ["Serviço", clean(data.servico)],
          ["Horário antigo", clean(data.horarioAntigo)],
          ["Novo horário", clean(data.novoHorario)],
          ["Telefone", clean(data.telefoneCliente)],
        ]) + renderObservation("Observações", data.observacoes),
    }),
    text: textLines([
      `Agendamento remarcado em ${data.nomeBarbearia}`,
      `Barbeiro: ${data.nomeBarbeiro}`,
      `Cliente: ${data.nomeCliente}`,
      `Serviço: ${data.servico}`,
      `Horário antigo: ${data.horarioAntigo}`,
      `Novo horário: ${data.novoHorario}`,
      `Abrir agenda: ${data.linkPainel}`,
    ]),
  };
}

export function renderBarberDailyAgendaEmail(
  data: BarberDailyAgendaEmailData
): RenderedEmail {
  const subject = `Agenda do dia - ${data.quantidadeAtendimentos} atendimento(s)`;

  return {
    subject,
    html: renderLayout({
      ...data,
      eyebrow: "Agenda do dia",
      title: `${data.quantidadeAtendimentos} atendimento(s) hoje`,
      intro: `Bom dia, ${data.nomeBarbeiro}. Esta é sua agenda organizada para ${data.dataAgendamento}.`,
      buttonLabel: "Abrir agenda",
      footerNote: "Use esse resumo para preparar o dia com calma.",
      children: renderAgendaList(data.atendimentos),
    }),
    text: textLines([
      `Agenda do dia - ${data.nomeBarbearia}`,
      `Barbeiro: ${data.nomeBarbeiro}`,
      `Data: ${data.dataAgendamento}`,
      `Atendimentos: ${data.quantidadeAtendimentos}`,
      "",
      ...data.atendimentos.map(
        (item) =>
          `${item.horario} - ${item.cliente} - ${item.servico}${
            item.telefoneCliente ? ` - ${item.telefoneCliente}` : ""
          }${item.observacoes ? ` - Obs.: ${item.observacoes}` : ""}`
      ),
      `Abrir agenda: ${data.linkPainel}`,
    ]),
  };
}

export function renderBarberNoShowEmail(
  data: BarberAppointmentEmailData
): RenderedEmail {
  const subject = `Cliente não compareceu - ${data.nomeCliente}`;

  return {
    subject,
    html: renderLayout({
      ...data,
      eyebrow: "Não compareceu",
      title: "Atendimento marcado como falta",
      intro: `${data.nomeCliente} foi marcado como não compareceu.`,
      buttonLabel: "Abrir agenda",
      footerNote: "Esse registro ajuda a manter o histórico do cliente claro.",
      children: renderInfoCard(appointmentRows(data)),
    }),
    text: textLines([
      `Cliente não compareceu em ${data.nomeBarbearia}`,
      `Barbeiro: ${data.nomeBarbeiro}`,
      `Cliente: ${data.nomeCliente}`,
      `Serviço: ${data.servico}`,
      `Data: ${data.dataAgendamento}`,
      `Horário: ${data.horarioAgendamento}`,
      `Abrir agenda: ${data.linkPainel}`,
    ]),
  };
}

export function renderBarberNewReviewEmail(
  data: BarberReviewEmailData
): RenderedEmail {
  const subject = `Nova avaliação recebida - ${data.nota}/5`;

  return {
    subject,
    html: renderLayout({
      ...data,
      eyebrow: "Nova avaliação",
      title: `${data.nota}/5 recebido`,
      intro: `${data.nomeCliente} avaliou o atendimento realizado.`,
      buttonLabel: "Ver avaliações",
      footerNote: "Avaliações ajudam a acompanhar qualidade e experiência do cliente.",
      children:
        renderInfoCard([
          ["Cliente", clean(data.nomeCliente)],
          ["Serviço", clean(data.servico)],
          ["Nota", `${data.nota}/5`],
          ["Data", clean(data.dataAgendamento)],
          ["Horário", clean(data.horarioAgendamento)],
        ]) + renderObservation("Comentário", data.comentario),
    }),
    text: textLines([
      `Nova avaliação em ${data.nomeBarbearia}`,
      `Barbeiro: ${data.nomeBarbeiro}`,
      `Cliente: ${data.nomeCliente}`,
      `Serviço: ${data.servico}`,
      `Nota: ${data.nota}/5`,
      data.comentario ? `Comentário: ${data.comentario}` : null,
      `Ver avaliações: ${data.linkPainel}`,
    ]),
  };
}
