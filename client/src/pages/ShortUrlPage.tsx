import { Link2 } from 'lucide-react';
import { useState } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { Panel } from '../components/common/Panel';
import { ServiceUsage } from '../components/features/short-url/ServiceUsage';
import { ShortUrlForm } from '../components/features/short-url/ShortUrlForm';
import { ShortUrlHistory } from '../components/features/short-url/ShortUrlHistory';
import { ShortUrlResult } from '../components/features/short-url/ShortUrlResult';
import type { CreateShortUrlInput, ShortUrl } from '../models/shortUrl';
import { useShortUrls } from '../hooks/useShortUrls';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function ShortUrlPage() {
  useDocumentTitle('Short URL');
  const { history, totalCreated, create } = useShortUrls();
  const [lastCreated, setLastCreated] = useState<ShortUrl | null>(null);

  const handleCreate = async (input: CreateShortUrlInput) => {
    const created = await create(input);
    setLastCreated(created);
    return created;
  };

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-4">
        <PageHeader
          icon={Link2}
          title="Short URL"
          description="Incolla un link lungo e ottieni un indirizzo breve da condividere. Puoi scegliere tu l'alias."
        />
        {totalCreated !== null && <ServiceUsage total={totalCreated} />}
      </div>
      <Panel className="flex flex-col gap-6 p-6 sm:p-8">
        <ShortUrlForm onCreate={handleCreate} />
        {lastCreated && <ShortUrlResult key={lastCreated.code} item={lastCreated} />}
      </Panel>
      <ShortUrlHistory items={history} />
    </div>
  );
}
