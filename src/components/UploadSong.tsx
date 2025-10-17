import { useState } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { api } from '@/lib/api';

const UploadSong = () => {
  const [formData, setFormData] = useState({
    title: '',
    artist_name: '',
  });
  const [mp3File, setMp3File] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!mp3File) {
      toast.error('Please select an MP3 file');
      return;
    }

    setLoading(true);
    try {
      await api.uploadSong({
        title: formData.title,
        artist_name: formData.artist_name,
        audio_file: mp3File,
        // cover_image: coverImage || undefined,
      });
      
      toast.success('Song uploaded successfully!');
      
      // Reset form
      setFormData({ title: '', artist_name: '' });
      setMp3File(null);
      // setCoverImage(null);
      
      // Reset file inputs
      const fileInputs = document.querySelectorAll('input[type="file"]') as NodeListOf<HTMLInputElement>;
      fileInputs.forEach(input => input.value = '');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 card-gradient border-border">
      <form onSubmit={handleSubmit} className="space-y-6" >
        <div className="space-y-2">
          <Label htmlFor="title">Song Title</Label>
          <Input
            id="title"
            type="text"
            placeholder="Enter song title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            className="bg-background/50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="artist">Artist Name</Label>
          <Input
            id="artist"
            type="text"
            placeholder="Enter artist name"
            value={formData.artist_name}
            onChange={(e) => setFormData({ ...formData, artist_name: e.target.value })}
            required
            className="bg-background/50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="mp3">MP3 File</Label>
          <Input
            id="mp3"
            type="file"
            // accept="audio/mp3,audio/mpeg,audio/mpeg-4"
            onChange={(e) => setMp3File(e.target.files?.[0] || null)}
            required
            className="bg-background/50"
          />
          {mp3File && (
            <p className="text-sm text-muted-foreground">
              Selected: {mp3File.name}
            </p>
          )}
        </div>

        {/* <div className="space-y-2">
          <Label htmlFor="cover">Cover Image (Optional)</Label>
          <Input
            id="cover"
            type="file"
            accept="image/*"
            onChange={(e) => setCoverImage(e.target.files?.[0] || null)}
            className="bg-background/50"
          />
          {coverImage && (
            <p className="text-sm text-muted-foreground">
              Selected: {coverImage.name}
            </p>
          )}
        </div> */}

        <Button 
          type="submit" 
          className="w-full hero-gradient text-primary-foreground hover:opacity-90"
          disabled={loading}
        >
          <Upload className="w-4 h-4 mr-2" />
          {loading ? 'Uploading...' : 'Upload Song'}
        </Button>
      </form>
    </Card>
  );
};

export default UploadSong;
