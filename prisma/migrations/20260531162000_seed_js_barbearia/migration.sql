-- Identidade inicial da JS Barbearia. Dados comerciais serão cadastrados depois.
INSERT INTO public."Shop" (
  "id", "name", "slug", "primaryDomain", "isDefault", "isActive",
  "metadataTitle", "metadataDescription", "whatsappNumber", "instagramUrl",
  "addressLine", "businessHours", "logoPath", "faviconPath", "brandColor",
  "brandColorStrong", "brandColorMuted", "backgroundColor", "textColor",
  "fontStyle", "designTemplate", "heroImageUrl", "heroEyebrow", "heroTitle",
  "heroSubtitle", "primaryCtaLabel", "secondaryCtaLabel", "secondaryCtaHref",
  "attendanceText", "reviewsTitle", "reviewsEmptyText", "createdAt", "updatedAt"
) VALUES (
  'shop_js_barbearia',
  'JS Barbearia',
  'js-barbearia',
  NULL,
  true,
  true,
  'JS Barbearia | Corte classico e acabamento preciso',
  'Agende seu horario na JS Barbearia e viva uma experiencia de cuidado em cada detalhe.',
  NULL,
  NULL,
  NULL,
  NULL,
  '/brands/js-barbearia/logo.png',
  '/brands/js-barbearia/favicon.png',
  '#c8c8c8',
  '#f4f4f5',
  'rgba(200, 200, 200, 0.16)',
  '#080808',
  '#f5f5f5',
  'classic',
  'dark-premium',
  '/brands/js-barbearia/logo.png',
  'JS Barbearia',
  'Corte classico, acabamento preciso.',
  'Uma experiencia de cuidado pensada para valorizar seu estilo em cada detalhe.',
  'Agendar horario',
  'Ver planos',
  '/planos',
  'Atendimento com hora marcada',
  'Confianca construida no atendimento.',
  'As avaliacoes da JS Barbearia aparecerao aqui em breve.',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("id") DO UPDATE SET
  "name" = EXCLUDED."name",
  "slug" = EXCLUDED."slug",
  "isDefault" = true,
  "isActive" = true,
  "faviconPath" = EXCLUDED."faviconPath",
  "updatedAt" = CURRENT_TIMESTAMP;

INSERT INTO public."ShopEmailSettings" (
  "id", "shopId", "fromName", "replyToEmail", "notificationEmail",
  "createdAt", "updatedAt"
) VALUES (
  'shop_email_settings_js_barbearia',
  'shop_js_barbearia',
  'JS Barbearia',
  NULL,
  NULL,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("shopId") DO UPDATE SET
  "fromName" = EXCLUDED."fromName",
  "replyToEmail" = EXCLUDED."replyToEmail",
  "notificationEmail" = EXCLUDED."notificationEmail",
  "updatedAt" = CURRENT_TIMESTAMP;

-- Sem usuários, serviços, planos, preços, domínio ou contatos herdados.
