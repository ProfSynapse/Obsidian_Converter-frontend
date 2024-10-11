import { Document, VideoCamera, MusicalNote, Photo, Link } from 'svelte-hero-icons';

const iconMap = {
  document: Document,
  video: VideoCamera,
  audio: MusicalNote,
  image: Photo,
  url: Link,
};

export function getFileIconComponent(type) {
  return iconMap[type] || Document;
}
