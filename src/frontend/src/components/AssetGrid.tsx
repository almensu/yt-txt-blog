import { AssetCard } from './AssetCard';
import type { TxtAsset } from '../services/api';

interface AssetGridProps {
  assets: TxtAsset[];
  onCardClick: (id: string) => void;
  leadingCard?: React.ReactNode;
}

export function AssetGrid({ assets, onCardClick, leadingCard }: AssetGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {leadingCard}
      {assets.map(asset => (
        <AssetCard
          key={asset.id}
          asset={asset}
          onClick={() => onCardClick(asset.id)}
        />
      ))}
    </div>
  );
}
