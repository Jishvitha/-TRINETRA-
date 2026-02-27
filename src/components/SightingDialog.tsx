// Dialog for reporting sightings
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Camera } from 'lucide-react';
import type { SightingFormData } from '@/types/index';
import { CameraCapture } from './CameraCapture';

interface SightingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  alertId: string;
  childName: string;
  onSubmit: (data: SightingFormData) => Promise<void>;
}

export function SightingDialog({
  open,
  onOpenChange,
  alertId,
  childName,
  onSubmit
}: SightingDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string>('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<Omit<SightingFormData, 'alert_id'>>();

  const handlePhotoCapture = (capturedPhoto: string) => {
    setPhotoUrl(capturedPhoto);
    setShowCamera(false);
  };

  const onFormSubmit = async (data: Omit<SightingFormData, 'alert_id'>) => {
    if (!photoUrl) {
      return; // Photo is mandatory
    }

    setIsSubmitting(true);
    try {
      await onSubmit({ ...data, alert_id: alertId, photo_url: photoUrl });
      reset();
      setPhotoUrl('');
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    setPhotoUrl('');
    setShowCamera(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Report Sighting</DialogTitle>
          <DialogDescription>
            Report a sighting of {childName}. Photo evidence is mandatory to ensure credibility.
          </DialogDescription>
        </DialogHeader>

        {showCamera ? (
          <CameraCapture
            onCapture={handlePhotoCapture}
            onCancel={() => setShowCamera(false)}
          />
        ) : (
          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
            {/* Photo Capture */}
            <div className="space-y-2">
              <Label>Photo Evidence *</Label>
              {photoUrl ? (
                <div className="relative">
                  <img
                    src={photoUrl}
                    alt="Captured evidence"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => setShowCamera(true)}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Retake Photo
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowCamera(true)}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Capture Photo with Camera
                </Button>
              )}
              {!photoUrl && (
                <p className="text-xs text-muted-foreground">
                  📸 Photo evidence is required to submit a sighting report
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                {...register('location', { required: 'Location is required' })}
                placeholder="Where did you see the child?"
              />
              {errors.location && (
                <p className="text-sm text-destructive">{errors.location.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Additional details about the sighting..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reporter_contact">Your Contact (Optional)</Label>
              <Input
                id="reporter_contact"
                {...register('reporter_contact')}
                placeholder="Phone or email"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !photoUrl}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Report'
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
