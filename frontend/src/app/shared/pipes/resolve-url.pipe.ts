import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../../environments/environment';

@Pipe({
  name: 'resolveUrl',
  standalone: true
})
export class ResolveUrlPipe implements PipeTransform {
  private readonly serverUrl = environment.apiUrl.replace('/api', '');

  transform(url: string | null | undefined): string | null {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    if (url.startsWith('data:')) return url;
    
    // Ensure the url starts with a single /
    const normalizedUrl = url.startsWith('/') ? url : `/${url}`;
    return `${this.serverUrl}${normalizedUrl}`;
  }
}
