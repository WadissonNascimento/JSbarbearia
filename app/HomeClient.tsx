"use client";

import Image from "next/image";
import Link from "next/link";
import { SHOW_PLANS } from "@/lib/featureVisibility";
import {
  CalendarDays,
  ChevronRight,
  Clock3,
  AtSign,
  MapPin,
  MessageCircle,
  Scissors,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import CrownRating from "@/components/ui/CrownRating";

export type HomeReview = {
  id: string;
  rating: number;
  comment: string;
  customerName: string;
};

export type HomeService = {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  duration: number;
};

export type HomeBarber = {
  id: string;
  name: string;
  image?: string | null;
};

type HomeClientProps = {
  reviews: HomeReview[];
  hasMoreReviews: boolean;
  homeImages?: string[];
  shopId?: string;
  brandName: string;
  addressLine: string;
  businessHours: string;
  logoPath?: string;
  whatsappNumber?: string;
  instagramUrl?: string;
  services?: HomeService[];
  barbers?: HomeBarber[];
  heroImageUrl?: string;
  heroEyebrow?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  primaryCtaLabel?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  attendanceText?: string;
  reviewsTitle?: string;
  reviewsEmptyText?: string;
};

const corteImages = ["/brands/js-barbearia/logo.png"];

function formatReviewName(name: string) {
  const [firstName] = name.trim().split(/\s+/);

  return firstName || "Cliente";
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function buildWhatsAppHref(phone: string | undefined, brandName: string) {
  const digits = (phone || "").replace(/\D/g, "");

  if (!digits) {
    return "/agendar";
  }

  const message = `Olá, ${brandName}! Quero agendar um horário.`;

  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export default function HomeClient(props: HomeClientProps) {
  return <DefaultHomeClient {...props} />;
}

function JsBarbeariaHome({
  reviews,
  hasMoreReviews,
  homeImages = [],
  brandName,
  addressLine,
  businessHours,
  logoPath,
  whatsappNumber,
  instagramUrl,
  services = [],
  barbers = [],
}: HomeClientProps) {
  const heroImage = homeImages[0] || logoPath || corteImages[0];
  const whatsappHref = buildWhatsAppHref(whatsappNumber, brandName);

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#080808] text-[#f5f5f5]">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,_#111111_0%,_#080808_48%,_#020202_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] bg-[radial-gradient(circle_at_22%_18%,_rgba(229,229,229,0.08),_transparent_30%),radial-gradient(circle_at_82%_8%,_rgba(255,255,255,0.045),_transparent_28%)]" />

      <section className="px-4 pb-10 pt-5 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-7 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div className="min-w-0 lg:col-start-1 lg:row-start-1">
            <p className="inline-flex rounded-full border border-[#e5e5e5]/15 bg-white/[0.045] px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.24em] text-[#d4d4d4]">
              JS Barbearia
            </p>

            <h1 className="mt-5 max-w-2xl text-[2.35rem] font-black leading-[0.96] tracking-normal text-[#fafafa] sm:text-6xl lg:text-7xl">
              Corte clássico, acabamento preciso.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#c2c2c2] sm:text-lg">
              Um atendimento feito com calma, técnica e cuidado em cada detalhe
              para valorizar o seu estilo.
            </p>
          </div>

          <div className="relative min-h-[330px] overflow-hidden rounded-lg border border-[#e5e5e5]/10 bg-[#111111] shadow-[0_28px_80px_rgba(0,0,0,0.48)] sm:min-h-[480px] lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:min-h-[640px]">
            <Image
              src={heroImage}
              alt={`Identidade visual da ${brandName}`}
              fill
              sizes="(max-width: 1024px) 100vw, 580px"
              quality={94}
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,_rgba(0,0,0,0.05),_rgba(0,0,0,0.58))]" />
          </div>

          <div className="min-w-0 lg:col-start-1 lg:row-start-2">
            <div className="mt-7 grid gap-3 sm:max-w-lg sm:grid-cols-2">
              <Link
                href="/agendar"
                className="inline-flex min-h-14 items-center justify-center rounded-lg bg-[#e5e5e5] px-5 text-base font-black text-[#080808] shadow-[0_18px_42px_rgba(0,0,0,0.32)] transition hover:bg-white active:scale-[0.98]"
              >
                Agendar horário
              </Link>
              <Link
                href="/servicos"
                className="inline-flex min-h-14 items-center justify-center rounded-lg border border-[#e5e5e5]/15 bg-white/[0.035] px-5 text-base font-bold text-[#f5f5f5] transition hover:bg-white/[0.07] active:scale-[0.98]"
              >
                Ver serviços
              </Link>
            </div>

            <div className="mt-6 grid gap-2 text-sm text-[#c2c2c2] sm:grid-cols-3">
              <span className="rounded-lg border border-white/10 bg-white/[0.035] p-3">
                <Clock3 className="mb-2 h-4 w-4 text-[#d4d4d4]" aria-hidden="true" />
                {businessHours}
              </span>
              <span className="rounded-lg border border-white/10 bg-white/[0.035] p-3">
                <MapPin className="mb-2 h-4 w-4 text-[#d4d4d4]" aria-hidden="true" />
                {addressLine}
              </span>
              <span className="rounded-lg border border-white/10 bg-white/[0.035] p-3">
                <Scissors className="mb-2 h-4 w-4 text-[#d4d4d4]" aria-hidden="true" />
                Com hora marcada
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[#e5e5e5]/10 bg-white/[0.025] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-5 sm:grid-cols-3">
          {[
            ["01", "Técnica", "Cortes executados com precisão e acabamento atento."],
            ["02", "Experiência", "Um ambiente clássico para desacelerar e cuidar de você."],
            ["03", "Praticidade", "Agendamento simples para encaixar o cuidado na sua rotina."],
          ].map(([number, title, description]) => (
            <article key={number} className="border-l border-[#c8c8c8]/45 pl-4">
              <p className="text-xs font-black tracking-[0.24em] text-[#c8c8c8]">{number}</p>
              <h2 className="mt-3 text-xl font-black text-[#fafafa]">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-[#b8b8b8]">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#c8c8c8]">
            Serviços
          </p>
          <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="max-w-xl text-2xl font-black text-[#fafafa] sm:text-4xl">
              Escolha seu próximo cuidado.
            </h2>
            <Link href="/servicos" className="text-sm font-bold text-[#d4d4d4] hover:text-white">
              Ver todos os serviços
            </Link>
          </div>

          {services.length === 0 ? (
            <div className="mt-6 rounded-lg border border-dashed border-[#e5e5e5]/15 bg-white/[0.035] p-5 text-sm text-[#c2c2c2]">
              Os serviços da JS Barbearia serão publicados aqui em breve.
            </div>
          ) : (
            <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {services.slice(0, 6).map((service) => (
                <article key={service.id} className="rounded-lg border border-[#e5e5e5]/15 bg-white/[0.04] p-5">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-lg font-black text-[#fafafa]">{service.name}</h3>
                    <span className="shrink-0 text-sm font-black text-[#d4d4d4]">
                      {formatCurrency(service.price)}
                    </span>
                  </div>
                  {service.description ? (
                    <p className="mt-3 text-sm leading-6 text-[#b8b8b8]">{service.description}</p>
                  ) : null}
                  <p className="mt-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#c8c8c8]">
                    <Clock3 className="h-4 w-4" aria-hidden="true" />
                    {service.duration} min
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {barbers.length > 0 ? (
        <section className="px-4 pb-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#c8c8c8]">Equipe</p>
            <h2 className="mt-2 text-2xl font-black text-[#fafafa] sm:text-4xl">
              Profissionais que entendem seu estilo.
            </h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {barbers.slice(0, 6).map((barber) => (
                <article key={barber.id} className="flex items-center gap-4 rounded-lg border border-[#e5e5e5]/15 bg-white/[0.04] p-4">
                  <div className="relative h-14 w-14 overflow-hidden rounded-full border border-[#e5e5e5]/15 bg-white/[0.05]">
                    {barber.image ? (
                      <Image src={barber.image} alt={barber.name} fill sizes="56px" className="object-cover" />
                    ) : (
                      <Users className="m-4 h-6 w-6 text-[#d4d4d4]" aria-hidden="true" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-[#c8c8c8]">Barbeiro</p>
                    <h3 className="mt-1 font-black text-[#fafafa]">{barber.name}</h3>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="px-4 pb-10 pt-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#d4d4d4]">
            Avaliações
          </p>
          <h2 className="mt-2 text-2xl font-black text-[#fafafa] sm:text-4xl">
            Confiança construída no atendimento.
          </h2>

          {reviews.length === 0 ? (
            <div className="mt-5 rounded-lg border border-dashed border-[#e5e5e5]/15 bg-white/[0.035] p-5 text-sm text-[#c2c2c2]">
              As avaliações da JS Barbearia aparecerão aqui em breve.
            </div>
          ) : (
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {reviews.map((review) => (
                <article
                  key={review.id}
                  className="rounded-lg border border-[#e5e5e5]/15 bg-white/[0.04] p-5"
                >
                  <p className="text-sm font-black text-[#fafafa]">
                    {formatReviewName(review.customerName)}
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <CrownRating rating={review.rating} size="sm" />
                    <span className="text-xs font-semibold text-[#c2c2c2]">
                      Nota {review.rating}/5
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[#c2c2c2]">
                    {review.comment}
                  </p>
                </article>
              ))}
            </div>
          )}

          {hasMoreReviews ? (
            <div className="mt-5 flex justify-center">
              <Link
                href="/avaliacoes"
                className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[#e5e5e5]/15 px-4 py-2 text-sm font-bold text-[#f5f5f5] transition hover:bg-white/[0.07]"
              >
                Ver mais avaliações
              </Link>
            </div>
          ) : null}
        </div>
      </section>

      <section className="px-4 pb-14 pt-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl rounded-lg border border-[#c8c8c8]/35 bg-[linear-gradient(135deg,_rgba(200,200,200,0.16),_rgba(255,255,255,0.025))] p-6 sm:p-9">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#d4d4d4]">Contato</p>
          <h2 className="mt-3 max-w-2xl text-3xl font-black text-[#fafafa] sm:text-5xl">
            Reserve seu horário.
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-6 text-[#c2c2c2] sm:text-base">
            Escolha o melhor momento para o seu atendimento e venha viver a experiência JS Barbearia.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/agendar" className="inline-flex min-h-12 items-center justify-center rounded-lg bg-[#e5e5e5] px-5 text-sm font-black text-[#080808] transition hover:bg-white">
              Agendar agora
            </Link>
            {whatsappNumber ? (
              <a href={whatsappHref} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center justify-center rounded-lg border border-[#e5e5e5]/15 px-5 text-sm font-bold text-[#f5f5f5] transition hover:bg-white/[0.07]">
                Falar pelo WhatsApp
              </a>
            ) : null}
            {instagramUrl ? (
              <a href={instagramUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center justify-center rounded-lg border border-[#e5e5e5]/15 px-5 text-sm font-bold text-[#f5f5f5] transition hover:bg-white/[0.07]">
                Ver Instagram
              </a>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}

function ThemedDefaultHomeClient({
  reviews,
  hasMoreReviews,
  homeImages = [],
  brandName,
  addressLine,
  businessHours,
  heroImageUrl,
  heroEyebrow,
  heroTitle,
  heroSubtitle,
  primaryCtaLabel,
  secondaryCtaLabel,
  secondaryCtaHref,
  attendanceText,
  reviewsTitle,
  reviewsEmptyText,
}: HomeClientProps) {
  const image = homeImages[0] || heroImageUrl || corteImages[0];

  return (
    <main className="relative min-h-screen text-white">
      <section className="mx-auto max-w-6xl px-4 pb-8 pt-5 sm:px-6 sm:pt-9">
        <div className="grid gap-7 lg:grid-cols-[1fr_0.95fr] lg:items-start">
          <div className="min-w-0 lg:col-start-1 lg:row-start-1">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--brand-strong)]">
              {heroEyebrow || "Barbearia premium"}
            </p>
            <h1 className="mt-3 max-w-[17rem] text-[1.95rem] font-semibold leading-[1.14] tracking-[-0.04em] sm:mt-5 sm:max-w-xl sm:text-5xl sm:font-bold sm:leading-tight lg:text-6xl">
              {heroTitle || "Seu estilo começa aqui."}
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-zinc-300 sm:text-base">
              {heroSubtitle ||
                `Agende seu horário com praticidade e tenha uma experiência premium na ${brandName}.`}
            </p>
          </div>

          <div className="surface-card-strong overflow-hidden rounded-2xl p-2 lg:col-start-2 lg:row-span-2 lg:row-start-1">
            <div className="relative h-[290px] overflow-hidden rounded-[20px] sm:h-[420px] lg:h-[560px]">
              {image ? (
                <Image
                  src={image}
                  alt={`Imagem principal da ${brandName}`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 560px"
                  quality={92}
                  priority
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full bg-[linear-gradient(135deg,var(--brand),#080808_65%)]" />
              )}
            </div>
          </div>

          <div className="min-w-0 lg:col-start-1 lg:row-start-2">
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/agendar"
                className="rounded-lg bg-[var(--brand)] px-6 py-3 text-center font-semibold text-white shadow-[0_12px_30px_rgba(200,200,200,0.35)] transition hover:brightness-110 active:scale-[0.98]"
              >
                {primaryCtaLabel || "Agendar horário"}
              </Link>

              <Link
                href={secondaryCtaHref || "/servicos"}
                className="rounded-lg border border-white/10 bg-white/[0.04] px-6 py-3 text-center text-white transition hover:bg-white/[0.08] active:scale-[0.98]"
              >
                {secondaryCtaLabel || "Ver serviços"}
              </Link>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="surface-card rounded-lg p-4">
                <p className="text-xs text-[var(--brand-strong)]">Local</p>
                <p className="mt-2 text-sm text-zinc-200">{addressLine}</p>
              </div>

              <div className="surface-card rounded-lg p-4">
                <p className="text-xs text-[var(--brand-strong)]">Horário</p>
                <p className="mt-2 text-sm text-zinc-200">{businessHours}</p>
              </div>

              <div className="surface-card rounded-lg p-4">
                <p className="text-xs text-[var(--brand-strong)]">Atendimento</p>
                <p className="mt-2 text-sm text-zinc-200">
                  {attendanceText || "Com hora marcada"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-8 pt-10 sm:px-6 sm:pt-14">
        <div className="mb-5">
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--brand-strong)]">
            Avaliações
          </p>
          <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
            {reviewsTitle || "O que os clientes acharam."}
          </h2>
        </div>

        {reviews.length === 0 ? (
          <div className="rounded-lg border border-dashed border-white/10 bg-white/[0.04] p-5 text-sm text-zinc-400">
            {reviewsEmptyText ||
              "As avaliações reais dos clientes vão aparecer aqui depois dos atendimentos concluídos."}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {reviews.map((review) => (
              <article
                key={review.id}
                className="rounded-lg border border-white/10 bg-white/[0.04] p-5"
              >
                <p className="text-sm font-semibold text-white">
                  {formatReviewName(review.customerName)}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <CrownRating rating={review.rating} size="sm" />
                  <span className="text-xs font-semibold text-zinc-400">
                    Nota {review.rating}/5
                  </span>
                </div>
                <p className="mt-4 text-sm leading-6 text-zinc-300">
                  {review.comment}
                </p>
              </article>
            ))}
          </div>
        )}

        {hasMoreReviews ? (
          <div className="mt-5 flex justify-center">
            <Link
              href="/avaliacoes"
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/5"
            >
              Ver mais avaliações
            </Link>
          </div>
        ) : null}
      </section>
    </main>
  );
}

function DefaultHomeClient({
  reviews,
  hasMoreReviews,
  brandName,
  addressLine,
  businessHours,
}: HomeClientProps) {
  return (
    <main className="relative text-white">
      <section className="relative isolate overflow-hidden border-b border-white/10">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_0%,rgba(200,200,200,0.12),transparent_65%)]" />
        <div className="mx-auto max-w-6xl px-4 pb-8 pt-12 sm:px-6 sm:pb-10 sm:pt-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="inline-flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-zinc-400 sm:text-xs">
              <span aria-hidden="true" className="h-px w-8 bg-white/25" />
              {brandName}
              <span aria-hidden="true" className="h-px w-8 bg-white/25" />
            </p>
            <h1 className="mt-6 text-[2.65rem] font-semibold leading-[1.08] tracking-[-0.05em] sm:text-6xl lg:text-7xl">
              Seu estilo.<br />
              <span className="bg-gradient-to-r from-zinc-400 via-white to-zinc-400 bg-clip-text text-transparent">Seu melhor momento.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-lg text-sm leading-7 text-zinc-400 sm:text-base">
              Um tempo para cuidar de você. Escolha seu horário e deixe o resto com a {brandName}.
            </p>
            <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <Link href="/agendar" className="inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-[var(--brand)] px-7 py-3.5 text-sm font-semibold text-black shadow-[0_8px_30px_rgba(200,200,200,0.12)] transition hover:brightness-110 active:scale-[0.98]">
                <CalendarDays aria-hidden="true" size={18} />
                Agendar horário
                <ChevronRight aria-hidden="true" size={16} />
              </Link>
              <Link href="/servicos" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/15 px-7 py-3.5 text-sm font-medium text-zinc-200 transition hover:bg-white/5">
                Conhecer serviços
              </Link>
              {SHOW_PLANS && <Link href="/planos" className="px-5 py-3 text-sm text-zinc-300 hover:text-white">Planos</Link>}
            </div>
            <p className="mt-5 inline-flex items-center gap-2 text-xs text-zinc-500">
              <Clock3 aria-hidden="true" size={13} /> Atendimento com hora marcada
            </p>
          </div>
          <div className="mx-auto mt-12 grid max-w-4xl divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/[0.025] sm:mt-16 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {[
              { icon: MapPin, label: "Onde estamos", value: addressLine },
              { icon: Clock3, label: "Funcionamento", value: businessHours },
              { icon: CalendarDays, label: "Seu próximo horário", value: "Agende pelo site, no seu tempo" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-3 px-5 py-5 sm:px-6 sm:py-6">
                <Icon aria-hidden="true" className="mt-0.5 shrink-0 text-zinc-400" size={18} strokeWidth={1.5} />
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500">{label}</p>
                  <p className="mt-2 text-sm leading-6 text-zinc-300">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-8 pt-10 sm:px-6 sm:pt-14">
        <div className="mb-5">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[var(--brand-strong)]">
              Avaliações
            </p>
            <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
              O que os clientes acharam.
            </h2>
          </div>
        </div>

        {reviews.length === 0 ? (
          <div className="rounded-lg border border-dashed border-white/10 bg-white/[0.04] p-5 text-sm text-zinc-400">
            As avaliações reais dos clientes vão aparecer aqui depois dos
            atendimentos concluídos.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {reviews.map((review) => (
              <article
                key={review.id}
                className="rounded-lg border border-white/10 bg-white/[0.04] p-5"
              >
                <p className="text-sm font-semibold text-white">
                  {formatReviewName(review.customerName)}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <CrownRating rating={review.rating} size="sm" />
                  <span className="text-xs font-semibold text-zinc-400">
                    Nota {review.rating}/5
                  </span>
                </div>
                <p className="mt-4 text-sm leading-6 text-zinc-300">
                  {review.comment}
                </p>
              </article>
            ))}
          </div>
        )}

        {hasMoreReviews ? (
          <div className="mt-5 flex justify-center">
            <Link
              href="/avaliacoes"
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/5"
            >
              Ver mais avaliações
            </Link>
          </div>
        ) : null}
      </section>
    </main>
  );
}
