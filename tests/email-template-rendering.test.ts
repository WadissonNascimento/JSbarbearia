import assert from "node:assert/strict";
import test from "node:test";
import * as customer from "../lib/email/customerTemplates";
import * as barber from "../lib/email/barberTemplates";
import { EMAIL_LOGO_URL } from "../lib/email/layout";
import { renderVipPaymentEmail } from "../lib/email/vipTemplates";

const appointment = {
  nomeBarbearia: "JS Barbearia",
  corPrimaria: "#dedee1",
  enderecoBarbearia: "Rua Gomes Cardim, 271 - Brás",
  nomeCliente: "Ana <script>alert('x')</script> & João",
  nomeBarbeiro: "Jean Santana",
  servico: "Cabelo + Sobrancelha",
  detalhesServico: "50 minutos",
  dataAgendamento: "quinta-feira, 24/09/2026",
  horarioAgendamento: "09:50",
  codigoAgendamento: "#00000002",
  valorTotal: "R$ 107,00",
  extras: "Gel Cera Hidratante Pierry Lohan 250g × 1; Óleo Reparador 30ml × 1",
  telefoneCliente: "(11) 99999-0000",
  observacoes: 'Cliente escreveu: <img src="x" onerror="alert(1)">',
  motivoCancelamento: 'Motivo com <b>marcação</b> & "aspas"',
  horarioAntigo: "24/09/2026 às 09:00",
  novoHorario: "24/09/2026 às 09:50",
  linkPainelCliente: "https://jsbarbearia.com/customer/agendamentos?tab=all&source=email",
  linkPainel: "https://jsbarbearia.com/barber?tab=agenda&source=email",
  nota: 5,
  comentario: 'Gostei <img src="x" onerror="alert(1)">',
};

test("all appointment and barber messages preserve their data and escape customer input", () => {
  const rendered = [
    customer.renderCustomerAppointmentConfirmationEmail(appointment),
    customer.renderCustomerAppointmentCompletedEmail(appointment),
    customer.renderCustomerAppointmentCancelledEmail(appointment),
    customer.renderCustomerAppointmentReminderEmail(appointment),
    customer.renderCustomerAppointmentRescheduledEmail(appointment),
    barber.renderBarberNewAppointmentEmail(appointment),
    barber.renderBarberAppointmentCancelledEmail(appointment),
    barber.renderBarberAppointmentRescheduledEmail(appointment),
    barber.renderBarberNoShowEmail(appointment),
    barber.renderBarberNewReviewEmail(appointment),
    barber.renderBarberDailyAgendaEmail({
      ...appointment,
      quantidadeAtendimentos: 1,
      atendimentos: [{ horario: appointment.horarioAgendamento, cliente: appointment.nomeCliente, servico: appointment.servico, observacoes: appointment.observacoes }],
    }),
  ];
  for (const result of rendered) {
    assert.ok(result.subject.length > 0);
    assert.match(result.html, /lang="pt-BR"/);
    assert.ok(result.html.includes(EMAIL_LOGO_URL));
    assert.match(result.html, /mso-hide:all/);
    assert.match(result.html, /&lt;script&gt;/);
    assert.doesNotMatch(result.html, /<script>|<img src="x"/);
    assert.match(result.html, /Cabelo \+ Sobrancelha/);
    assert.ok(result.text.includes(appointment.nomeCliente));
    assert.match(result.html, /&amp;source=email/);
  }
});

test("security code emails keep eight digits together, optional actions and expiry", () => {
  const data = { ...appointment, codigoVerificacao: "00123456", contexto: "a troca do seu e-mail" };
  for (const render of [customer.renderCustomerVerificationCodeEmail, customer.renderCustomerPasswordResetEmail]) {
    const result = render(data);
    assert.match(result.html, />00123456<\/p>/);
    assert.match(result.html, /Válido por 10 minutos/);
    assert.match(result.text, /00123456/);
    assert.doesNotMatch(result.html, /href="undefined"|href=""/);
    assert.doesNotMatch(result.html, /width:38px|<script>/);
  }
});

test("appointment summaries suppress absent extras and duplicate service details", () => {
  const result = customer.renderCustomerAppointmentConfirmationEmail({
    ...appointment,
    detalhesServico: appointment.servico,
    extras: " ",
    logoBarbearia: "https://jsbarbearia.com/custom-logo.png",
  });
  assert.doesNotMatch(result.html, /Produtos para retirada|Detalhes do atendimento/);
  assert.match(result.html, /R\$ 107,00/);
  assert.match(result.html, /#00000002/);
  assert.match(result.html, /custom-logo.png/);
});

test("both VIP notices use the same brand and preserve billing details without interpreting HTML", () => {
  for (const isDueToday of [false, true]) {
    const html = renderVipPaymentEmail({
      customerName: appointment.nomeCliente,
      shopName: appointment.nomeBarbearia,
      planName: 'Plano <b>mensal</b>',
      amount: "R$ 120,00",
      dueDateLabel: "27 de setembro de 2026",
      actionUrl: "https://jsbarbearia.com/planos",
      isDueToday,
    });
    assert.match(html, isDueToday ? /Seu plano vence hoje/ : /Seu próximo vencimento/);
    assert.match(html, /R\$ 120,00/);
    assert.match(html, /27 de setembro de 2026/);
    assert.match(html, /Plano &lt;b&gt;mensal&lt;\/b&gt;/);
    assert.doesNotMatch(html, /<script>|<b>mensal<\/b>/);
    assert.ok(html.includes(EMAIL_LOGO_URL));
  }
});
