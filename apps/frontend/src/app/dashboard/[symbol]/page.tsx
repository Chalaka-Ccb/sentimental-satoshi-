'use client';

import { useParams } from 'next/navigation';

export default function SymbolPage() {
  const params = useParams();
  const symbol = params.symbol as string;

  return (
    <div>
      <h1>{symbol}</h1>
      <p>Deep-dive: chart + conviction</p>
    </div>
  );
}
