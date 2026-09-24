import Link from "next/link";
import { Fragment } from "react";
import { unstable_cache } from "next/cache";
import { basePrisma } from "@/lib/prisma-core";
import { getCurrentShop, getCurrentShopId } from "@/lib/shop";
import { formatCurrency } from "@/lib/utils";
import { isComboService, sortServicesForDisplay } from "@/lib/servicePresentation";

export async function generateMetadata() {
  const shop = await getCurrentShop();
  const brandName = shop.name || "Barbearia";

  return {
    title: `Serviços | ${brandName}`,
    description: `Veja cortes, barba e serviços disponíveis na ${brandName}.`,
  };
}

const getPublicServices = unstable_cache(
  async (shopId: string) =>
    basePrisma.service.findMany({
      where: {
        shopId,
        isActive: true,
      },
      orderBy: [{ barberId: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        duration: true,
        barber: {
          select: {
            name: true,
          },
        },
      },
    }),
  ["public-services"],
  {
    revalidate: 300,
  }
);

export default async function ServicosPage() {
  const shopId = await getCurrentShopId();
  const services = await getPublicServices(shopId);
  const orderedServices = sortServicesForDisplay(services);

  return (
    <main className="page-shell max-w-5xl text-white">
      <section className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--brand-strong)]">
          Serviços
        </p>
        <h1 className="mt-3 text-4xl font-bold leading-tight sm:text-5xl">
          Escolha o cuidado ideal
        </h1>
        <p className="mt-4 text-sm leading-7 text-zinc-400 sm:text-base">
          Conheça os serviços disponíveis antes de agendar. Alguns atendimentos
          sao gerais e outros sao exclusivos de barbeiros especificos.
        </p>
      </section>

      <section className="mt-8 grid gap-3 sm:grid-cols-2">
        {orderedServices.map((service, index) => {
          const isCombo = isComboService(service);
          const isFirstCombo =
            isCombo &&
            (index === 0 || !isComboService(orderedServices[index - 1]));

          return (
          <Fragment key={service.id}>
          {isFirstCombo ? (
            <div className="my-3 flex items-center gap-4 sm:col-span-2">
              <span className="h-px flex-1 bg-gradient-to-r from-transparent to-white/20" />
              <h2 className="text-center text-sm font-black uppercase tracking-[0.32em] text-[var(--brand-strong)]">
                Combos
              </h2>
              <span className="h-px flex-1 bg-gradient-to-l from-transparent to-white/20" />
            </div>
          ) : null}
          <article
            className={`relative overflow-hidden rounded-2xl p-4 ${
              isCombo
                ? "border border-zinc-300/35 bg-gradient-to-br from-zinc-100/[0.10] via-white/[0.045] to-black/25 shadow-[0_18px_45px_rgba(0,0,0,0.32)]"
                : "surface-card"
            }`}
          >
            {isCombo ? (
              <span className="mb-3 inline-flex rounded-full border border-zinc-200/35 bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-100">
                Combo
              </span>
            ) : null}
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="truncate text-lg font-semibold">{service.name}</h2>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  {service.description || "Atendimento com acabamento caprichado."}
                </p>
              </div>
              <p className="shrink-0 text-sm font-semibold text-[var(--brand-strong)]">
                {formatCurrency(service.price)}
              </p>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 text-xs text-zinc-400">
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">
                {service.duration} min
              </span>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">
                {service.barber?.name ? `Com ${service.barber.name}` : "Todos os barbeiros"}
              </span>
            </div>
          </article>
          </Fragment>
          );
        })}
      </section>

      <div className="mt-8">
        <Link
          href="/agendar"
          className="inline-flex rounded-2xl bg-[var(--brand)] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110"
        >
          Agendar horário
        </Link>
      </div>
    </main>
  );
}
