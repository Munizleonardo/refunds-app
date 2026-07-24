import { AppHeader } from "./_components/AppHeader";
import { RefundsDashboard } from "./_components/RefundsDashboard";
import { parseSearchParams } from "./_lib/parse-search-params";
import {
  getRefundCountries,
  getRefundStats,
  getRefundsPage,
} from "./_lib/refunds-repository";

interface HomeProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const query = parseSearchParams(await searchParams);
  const filters = {
    search: query.search,
    transactionType: query.transactionType,
    country: query.country,
    dateFrom: query.dateFrom,
    dateTo: query.dateTo,
  };

  const [stats, countries, { refunds, totalCount }] = await Promise.all([
    getRefundStats(filters),
    getRefundCountries(),
    getRefundsPage(filters, query.page, query.pageSize),
  ]);

  const pageCount = Math.max(1, Math.ceil(totalCount / query.pageSize));

  return (
    <div className="flex flex-col flex-1">
      <AppHeader />

      <main className="flex flex-col gap-5 flex-1 w-full max-w-6xl mx-auto px-4 py-5 sm:gap-6 sm:px-6 sm:py-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Consulta de Refunds
          </h1>
          <p className="text-sm text-muted">
            Acompanhe e consulte os reembolsos processados.
          </p>
        </div>

        <RefundsDashboard
          refunds={refunds}
          stats={stats}
          countries={countries}
          filters={filters}
          page={Math.min(query.page, pageCount)}
          pageSize={query.pageSize}
          pageCount={pageCount}
          totalCount={totalCount}
        />
      </main>
    </div>
  );
}
