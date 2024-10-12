// src/lib/utils/iconUtils.js

const iconMap = {
  document: '📄',
  video: '🎥',
  audio: '🎵',
  image: '🖼️',
  url: '🔗',
};

export function getFileIcon(type) {
  return iconMap[type] || '📁';
}
