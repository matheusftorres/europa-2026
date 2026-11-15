import { BedDouble, TrainFront, Plane, Landmark, Church, Building2, MapPin, Trees, Store, Utensils, Coffee, TreePine } from 'lucide-react';

const ICONS = {
  hotel: BedDouble, station: TrainFront, airport: Plane, attraction: Landmark, church: Church,
  museum: Building2, square: MapPin, park: Trees, market: Store, restaurant: Utensils, cafe: Coffee,
  'christmas-market': TreePine,
};

export default function CategoryIcon({ category, size = 16, className = '' }) {
  const Icon = ICONS[category] ?? MapPin;
  return <Icon size={size} strokeWidth={1.75} className={className} aria-hidden="true" />;
}
