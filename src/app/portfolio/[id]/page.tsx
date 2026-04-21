import portfolio from '@/data/portfolio.json';
import PortfolioDetailClient from './PortfolioDetailClient';

export function generateStaticParams() {
  return portfolio.portfolio.map((project) => ({
    id: project.id,
  }));
}

export default async function PortfolioDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PortfolioDetailClient id={id} />;
}