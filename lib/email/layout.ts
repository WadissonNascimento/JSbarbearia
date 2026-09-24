export const EMAIL_LOGO_URL =
  "https://jsbarbearia.com/brands/js-barbearia/logo-header-transparent.png?v=email-transparent-20260924";

export const emailColors = {
  page: "#070708",
  panel: "#111113",
  raised: "#1b1b1e",
  border: "#303034",
  silver: "#dedee1",
  text: "#f7f7f8",
  muted: "#a8a8af",
};

export type EmailTheme = {
  nomeBarbearia: string;
  logoBarbearia?: string;
  corPrimaria: string;
  enderecoBarbearia?: string | null;
  telefoneBarbearia?: string | null;
};

export function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function clean(value: string | null | undefined, fallback = "Não informado") {
  return value?.trim() || fallback;
}

export function brandColor(theme: Pick<EmailTheme, "corPrimaria">) {
  return /^#[0-9a-f]{3}(?:[0-9a-f]{3})?$/i.test(theme.corPrimaria)
    ? theme.corPrimaria
    : emailColors.silver;
}

export function emailButton(label: string, href: string, color: string) {
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:28px;border-collapse:separate;">
    <tr><td align="center" bgcolor="${escapeHtml(brandColor({ corPrimaria: color }))}" style="border-radius:10px;">
      <a href="${escapeHtml(href)}" style="display:block;padding:17px 18px;border:1px solid ${escapeHtml(brandColor({ corPrimaria: color }))};border-radius:10px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:20px;font-weight:700;color:#111113;text-decoration:none;">${escapeHtml(label)}</a>
    </td></tr>
  </table>`;
}

export function emailInfoRow(label: string, value: string) {
  const isTotal = label === "Total" || label === "Valor mensal";
  return `<tr><td style="padding:16px 0;border-bottom:1px solid ${emailColors.border};font-family:Arial,Helvetica,sans-serif;word-break:break-word;overflow-wrap:anywhere;">
    <p style="margin:0 0 6px;font-size:12px;line-height:18px;color:${emailColors.muted};">${escapeHtml(label)}</p>
    <p style="margin:0;font-size:${isTotal ? "26" : "16"}px;line-height:${isTotal ? "32" : "24"}px;font-weight:${isTotal ? "700" : "500"};color:${emailColors.text};">${escapeHtml(value)}</p>
  </td></tr>`;
}

export function emailInfoList(rows: Array<[string, string]>) {
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:12px;border-collapse:collapse;table-layout:fixed;">${rows.map(([label, value]) => emailInfoRow(label, value)).join("")}</table>`;
}

export function emailSchedule(date: string, time: string, reference?: string) {
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" bgcolor="${emailColors.raised}" style="margin-top:26px;border-collapse:separate;border-spacing:0;border-radius:12px;table-layout:fixed;">
    <tr>
      <td style="padding:19px 16px;vertical-align:top;width:62%;font-family:Arial,Helvetica,sans-serif;word-break:break-word;">
        <p style="margin:0 0 7px;font-size:11px;line-height:16px;letter-spacing:1px;text-transform:uppercase;color:${emailColors.muted};">Data</p>
        <p style="margin:0;font-size:17px;line-height:25px;font-weight:700;color:${emailColors.text};">${escapeHtml(date)}</p>
      </td>
      <td style="padding:19px 12px 19px 0;vertical-align:top;font-family:Arial,Helvetica,sans-serif;">
        <p style="margin:0 0 7px;font-size:11px;line-height:16px;letter-spacing:1px;text-transform:uppercase;color:${emailColors.muted};">Horário</p>
        <p style="margin:0;font-size:27px;line-height:32px;font-weight:700;letter-spacing:-1px;color:${emailColors.text};">${escapeHtml(time)}</p>
      </td>
    </tr>
    ${reference ? `<tr><td colspan="2" style="padding:0 16px 17px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:${emailColors.muted};word-break:break-word;">Agendamento ${escapeHtml(reference)}</td></tr>` : ""}
  </table>`;
}

export function emailNotice(label: string, value?: string | null, color = emailColors.silver) {
  if (!value?.trim()) return "";
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:24px;border-collapse:collapse;table-layout:fixed;">
    <tr><td style="padding:2px 0 2px 15px;border-left:2px solid ${escapeHtml(brandColor({ corPrimaria: color }))};font-family:Arial,Helvetica,sans-serif;word-break:break-word;overflow-wrap:anywhere;">
      <p style="margin:0 0 6px;font-size:12px;line-height:18px;font-weight:700;color:${escapeHtml(brandColor({ corPrimaria: color }))};">${escapeHtml(label)}</p>
      <p style="margin:0;font-size:14px;line-height:23px;color:${emailColors.muted};">${escapeHtml(value.trim())}</p>
    </td></tr>
  </table>`;
}

export function emailHeader(theme: EmailTheme) {
  const logo = theme.logoBarbearia && !theme.logoBarbearia.startsWith("data:")
    ? theme.logoBarbearia
    : EMAIL_LOGO_URL;
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;table-layout:fixed;">
    <tr>
      <td width="104" style="padding:0 12px 0 0;vertical-align:middle;"><img src="${escapeHtml(logo)}" alt="${escapeHtml(theme.nomeBarbearia)}" width="92" height="92" style="display:block;width:92px;height:92px;object-fit:contain;border:0;outline:none;color:${emailColors.text};font-size:12px;" /></td>
      <td style="vertical-align:middle;font-family:Arial,Helvetica,sans-serif;word-break:break-word;">
        <p style="margin:0;font-size:17px;line-height:23px;font-weight:700;letter-spacing:.2px;color:${emailColors.text};">${escapeHtml(theme.nomeBarbearia)}</p>
        <p style="margin:6px 0 0;font-size:10px;line-height:17px;letter-spacing:2px;text-transform:uppercase;color:${emailColors.muted};">Cuidado em cada detalhe</p>
      </td>
    </tr>
  </table>`;
}

export function emailFooter(theme: EmailTheme, note?: string) {
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;table-layout:fixed;">
    <tr><td style="padding-top:22px;border-top:1px solid ${emailColors.border};font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:20px;color:${emailColors.muted};word-break:break-word;">
      <p style="margin:0 0 12px;">${escapeHtml(note || "Mensagem automática da plataforma.")}</p>
      <p style="margin:0;font-weight:700;color:${emailColors.silver};">${escapeHtml(theme.nomeBarbearia)}</p>
      ${theme.enderecoBarbearia ? `<p style="margin:3px 0 0;">${escapeHtml(theme.enderecoBarbearia)}</p>` : ""}
      ${theme.telefoneBarbearia ? `<p style="margin:3px 0 0;">Contato: ${escapeHtml(theme.telefoneBarbearia)}</p>` : ""}
    </td></tr>
  </table>`;
}

export type EmailLayoutInput = EmailTheme & {
  eyebrow: string;
  title: string;
  intro: string;
  children: string;
  buttonLabel?: string;
  buttonUrl?: string;
  footerNote?: string;
  preheader?: string;
};

export function emailLayout(input: EmailLayoutInput) {
  const color = brandColor(input);
  return `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><meta name="color-scheme" content="dark" /><meta name="supported-color-schemes" content="dark" /><title>${escapeHtml(input.title)} — ${escapeHtml(input.nomeBarbearia)}</title></head>
<body style="margin:0;padding:0;width:100%;background:${emailColors.page};-webkit-text-size-adjust:100%;">
  <div style="display:none;font-size:1px;line-height:1px;color:${emailColors.page};max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">${escapeHtml(input.preheader || input.intro)}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" bgcolor="${emailColors.page}" style="border-collapse:collapse;">
    <tr><td align="center" style="padding:24px 12px;">
      <!--[if mso]><table role="presentation" width="600" cellpadding="0" cellspacing="0"><tr><td><![endif]-->
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" bgcolor="${emailColors.panel}" style="max-width:600px;border-collapse:separate;border-spacing:0;border:1px solid ${emailColors.border};border-top:3px solid ${color};border-radius:0 0 16px 16px;table-layout:fixed;">
        <tr><td style="padding:24px 20px 0;">${emailHeader(input)}</td></tr>
        <tr><td style="padding:30px 20px 0;font-family:Arial,Helvetica,sans-serif;word-break:break-word;overflow-wrap:anywhere;">
          <p style="margin:0 0 12px;font-size:11px;line-height:18px;letter-spacing:2px;text-transform:uppercase;font-weight:700;color:${color};">${escapeHtml(input.eyebrow)}</p>
          <h1 style="margin:0;font-size:30px;line-height:36px;font-weight:700;letter-spacing:-.8px;color:${emailColors.text};">${escapeHtml(input.title)}</h1>
          <p style="margin:16px 0 0;font-size:15px;line-height:25px;color:${emailColors.muted};">${escapeHtml(input.intro)}</p>
        </td></tr>
        <tr><td style="padding:0 20px 30px;">${input.children}${input.buttonLabel && input.buttonUrl ? emailButton(input.buttonLabel, input.buttonUrl, color) : ""}</td></tr>
        <tr><td style="padding:0 20px 26px;">${emailFooter(input, input.footerNote)}</td></tr>
      </table>
      <!--[if mso]></td></tr></table><![endif]-->
    </td></tr>
  </table>
</body></html>`;
}
