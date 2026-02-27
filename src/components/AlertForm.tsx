// Alert creation form component for authorities
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Upload, Loader2 } from 'lucide-react';
import type { AlertFormData } from '@/types/index';
import { toast } from 'sonner';
import { supabase } from '@/db/supabase';

interface AlertFormProps {
  onSubmit: (data: AlertFormData) => Promise<void>;
}

// Image compression utility
async function compressImage(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Resize to max 1080p while maintaining aspect ratio
        const maxDimension = 1080;
        if (width > height && width > maxDimension) {
          height = (height * maxDimension) / width;
          width = maxDimension;
        } else if (height > maxDimension) {
          width = (width * maxDimension) / height;
          height = maxDimension;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        // Convert to WebP with quality 0.8
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.webp'), {
                type: 'image/webp',
                lastModified: Date.now()
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Compression failed'));
            }
          },
          'image/webp',
          0.8
        );
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
}

export function AlertForm({ onSubmit }: AlertFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<AlertFormData>({
    defaultValues: {
      risk_level: 'medium'
    }
  });

  const riskLevel = watch('risk_level');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload an image.');
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      let fileToUpload = file;

      // Check file size and compress if needed
      if (file.size > 1048576) {
        // 1MB
        toast.info('Compressing image...');
        fileToUpload = await compressImage(file);
        toast.success(`Image compressed to ${(fileToUpload.size / 1024).toFixed(0)}KB`);
      }

      // Generate unique filename
      const fileExt = fileToUpload.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      setProgress(50);

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('app-9wcfw5spx1q9_child_images')
        .upload(fileName, fileToUpload, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      setProgress(75);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('app-9wcfw5spx1q9_child_images')
        .getPublicUrl(fileName);

      setProgress(100);
      setPhotoUrl(urlData.publicUrl);
      setValue('photo_url', urlData.publicUrl);
      toast.success('Photo uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload photo');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const onFormSubmit = async (data: AlertFormData) => {
    if (!photoUrl) {
      toast.error('Please upload a photo');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({ ...data, photo_url: photoUrl });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Missing Child Alert</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          {/* Photo Upload */}
          <div className="space-y-2">
            <Label htmlFor="photo">Child Photo *</Label>
            <div className="flex flex-col gap-2">
              <Input
                id="photo"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={uploading}
                className="cursor-pointer"
              />
              {uploading && (
                <div className="space-y-1">
                  <Progress value={progress} />
                  <p className="text-xs text-muted-foreground">Uploading... {progress}%</p>
                </div>
              )}
              {photoUrl && (
                <div className="relative w-32 h-32 rounded-lg overflow-hidden border">
                  <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="child_name">Child Name *</Label>
            <Input
              id="child_name"
              {...register('child_name', { required: 'Name is required' })}
              placeholder="Enter child's name"
            />
            {errors.child_name && (
              <p className="text-sm text-destructive">{errors.child_name.message}</p>
            )}
          </div>

          {/* Age */}
          <div className="space-y-2">
            <Label htmlFor="age">Age *</Label>
            <Input
              id="age"
              type="number"
              {...register('age', {
                required: 'Age is required',
                min: { value: 0, message: 'Age must be positive' },
                max: { value: 18, message: 'Age must be under 18' }
              })}
              placeholder="Enter age"
            />
            {errors.age && (
              <p className="text-sm text-destructive">{errors.age.message}</p>
            )}
          </div>

          {/* Last Seen Location */}
          <div className="space-y-2">
            <Label htmlFor="last_seen_location">Last Seen Location *</Label>
            <Input
              id="last_seen_location"
              {...register('last_seen_location', { required: 'Location is required' })}
              placeholder="e.g., Central Park, New York"
            />
            {errors.last_seen_location && (
              <p className="text-sm text-destructive">{errors.last_seen_location.message}</p>
            )}
          </div>

          {/* Time Missing */}
          <div className="space-y-2">
            <Label htmlFor="time_missing">Time Missing *</Label>
            <Input
              id="time_missing"
              type="datetime-local"
              {...register('time_missing', { required: 'Time is required' })}
            />
            {errors.time_missing && (
              <p className="text-sm text-destructive">{errors.time_missing.message}</p>
            )}
          </div>

          {/* Risk Level */}
          <div className="space-y-2">
            <Label htmlFor="risk_level">Risk Level *</Label>
            <Select
              value={riskLevel}
              onValueChange={(value) => setValue('risk_level', value as 'low' | 'medium' | 'high')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select risk level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              {...register('description', { required: 'Description is required' })}
              placeholder="Physical description, clothing, distinguishing features..."
              rows={4}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || uploading || !photoUrl}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Alert...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Verify & Activate Alert
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
