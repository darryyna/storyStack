import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

import { Folder } from '../models/folder.model';

export interface AddBooksToFolderResponse {
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class FoldersService {
  private apiUrl = `${environment.apiUrl}/folders`;

  constructor(private http: HttpClient) {}

  getFolders(): Observable<Folder[]> {
    return this.http.get<Folder[]>(this.apiUrl);
  }

  createFolder(folder: Folder): Observable<Folder> {
    return this.http.post<Folder>(this.apiUrl, folder);
  }

  updateFolder(id: string, folder: Folder): Observable<Folder> {
    return this.http.put<Folder>(`${this.apiUrl}/${id}`, folder);
  }

  deleteFolder(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  addBooksToFolder(folderId: string | null, bookIds: string[]): Observable<AddBooksToFolderResponse> {
    const id = folderId === null ? 'null' : folderId;
    return this.http.post<AddBooksToFolderResponse>(`${this.apiUrl}/${id}/books`, { bookIds });
  }
}
