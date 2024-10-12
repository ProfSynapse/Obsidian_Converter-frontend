/* src/lib/utils/iconUtils.js */
export function getFileIcon(type) {
  switch (type) {
    case 'image':
      return '🖼️';
    case 'video':
      return '🎥';
    case 'audio':
      return '🎵';
    case 'document':
      return '📄';
    case 'url':
      return '🔗';
    default:
      return '📁';
  }
}
