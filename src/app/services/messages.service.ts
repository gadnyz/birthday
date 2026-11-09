import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export type Lang = 'fr' | 'en';
export const RELATIONS = ['famille', 'ami', 'collegue', 'voisin', 'eglise', 'autre'] as const;
export type Relation = (typeof RELATIONS)[number];

export interface Message {
  id: string;
  author_name: string;
  relation: Relation;
  lang: Lang;
  body: string;
  photo_url: string | null;
  video_url: string | null;
  hearts: number;
  created_at: string;
}

export interface MessagesResponse {
  revealed: boolean;
  revealAt: string;
  count: number;
  messages: Message[];
}

export interface NewMessage {
  author_name: string;
  relation: Relation;
  lang: Lang;
  body: string;
  photo_path: string | null;
  website: string; // champ piège
}

@Injectable({ providedIn: 'root' })
export class MessagesService {
  private readonly http = inject(HttpClient);

  list(): Promise<MessagesResponse> {
    return firstValueFrom(this.http.get<MessagesResponse>('/api/messages'));
  }

  create(msg: NewMessage): Promise<{ ok: boolean; revealed: boolean }> {
    return firstValueFrom(this.http.post<{ ok: boolean; revealed: boolean }>('/api/messages', msg));
  }

  heart(id: string): Promise<{ hearts: number }> {
    return firstValueFrom(this.http.post<{ hearts: number }>('/api/heart', { id }));
  }

  /**
   * Envoie un fichier directement dans le bucket Supabase via une URL signée,
   * avec suivi de progression (XHR, car fetch ne donne pas la progression d'envoi).
   */
  async upload(file: Blob, contentType: string, onProgress: (pct: number) => void): Promise<string> {
    const { path, signedUrl } = await firstValueFrom(
      this.http.post<{ path: string; signedUrl: string }>('/api/upload-url', { contentType, size: file.size }),
    );

    const form = new FormData();
    form.append('cacheControl', '3600');
    form.append('', new File([file], path.split('/').pop()!, { type: contentType }));

    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', signedUrl);
      xhr.setRequestHeader('x-upsert', 'false');
      xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(Math.round((e.loaded / e.total) * 100));
      xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`upload ${xhr.status}`)));
      xhr.onerror = () => reject(new Error('upload network error'));
      xhr.send(form);
    });

    return path;
  }
}
