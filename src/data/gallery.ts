export interface GalleryImage {
  src: string;
  caption: string;
  link?: string;
}

export interface GalleryAlbum {
  id: string;
  title: string;
  images: GalleryImage[];
}

// Foto's en video's zijn tijdelijk niet beschikbaar - bestanden migreren van oude server
export const galleryData: GalleryAlbum[] = [];

export function getAllImages(): GalleryImage[] {
  return galleryData.flatMap((album) => album.images);
}
