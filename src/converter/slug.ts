import { showErrorMessage } from '../utils/logger';

export function slug(str: string): string {
  try {
    return encodeURI(
      str.trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[\]\[!'#$%&()*+,./\:;<=>?@\\^_`{|}~\u3002\uff0c\u3001\uff1b\uff1a\uff1f\uff01\u2026\u2014\u00b7\u02c9\u00a8\u2018\u2019\u201c\u201d\u3005\uff5e\u2016\uff1a\u201c\u2019\uff40\uff5c\u3003\u3014\u3015\u300a\u300b\u300c\u300d\u300e\u300f\uff0e\u3016\u3017\u3010\u3011\uff08\uff09\uff3b\uff3d\uff5b\uff5d]/g, '')
        .replace(/^-+/, '')
        .replace(/-+$/, '')
    );
  } catch (error) {
    showErrorMessage('slug()', error);
    return str;
  }
}
