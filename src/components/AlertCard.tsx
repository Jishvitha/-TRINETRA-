// Alert card component for displaying missing child alerts
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, AlertTriangle } from 'lucide-react';
import type { Alert } from '@/types/index';
import { formatDistanceToNow } from 'date-fns';

interface AlertCardProps {
  alert: Alert;
  onReportSighting: (alertId: string) => void;
  onViewMap: (alertId: string) => void;
}

export function AlertCard({ alert, onReportSighting, onViewMap }: AlertCardProps) {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high':
        return 'bg-destructive text-destructive-foreground';
      case 'medium':
        return 'bg-[hsl(var(--warning))] text-white';
      case 'low':
        return 'bg-[hsl(var(--success))] text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const timeSinceMissing = formatDistanceToNow(new Date(alert.time_missing), { addSuffix: true });

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={alert.photo_url}
          alt={alert.child_name}
          className="w-full h-full object-cover"
        />
      </div>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-lg">{alert.child_name}</h3>
            <p className="text-sm text-muted-foreground">Age: {alert.age}</p>
          </div>
          <Badge className={getRiskColor(alert.risk_level)}>
            <AlertTriangle className="w-3 h-3 mr-1" />
            {alert.risk_level.toUpperCase()}
          </Badge>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 mt-0.5 text-primary shrink-0" />
            <span className="text-muted-foreground">{alert.last_seen_location}</span>
          </div>
          <div className="flex items-start gap-2">
            <Clock className="w-4 h-4 mt-0.5 text-primary shrink-0" />
            <span className="text-muted-foreground">Missing {timeSinceMissing}</span>
          </div>
        </div>

        <p className="text-sm line-clamp-2">{alert.description}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button
          variant="default"
          className="flex-1"
          onClick={() => onReportSighting(alert.id)}
        >
          Report Sighting
        </Button>
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => onViewMap(alert.id)}
        >
          View Map
        </Button>
      </CardFooter>
    </Card>
  );
}
