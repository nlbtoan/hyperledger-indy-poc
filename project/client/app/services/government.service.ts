import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class GovernmentService {

  constructor(private http: HttpClient) { }

  createIdCard(data: any): Observable<any> {
    return this.http.post<any>('/api/createIdCard', data);
  }

  setupCredentialDefinition(data: any): Observable<any> {
    return this.http.post<any>('/api/setupCredentialDefinition', data);
  }

  hashFile(base64: any): Observable<any> {
    return this.http.post<any>('/api/hash', base64);
  }

  insertCredentialDefinition(data: any): Observable<any> {
    return this.http.post<any>('/api/credentialDefinition', data);
  }

  deleteCredentialDefinition(data: any): Observable<any> {
    return this.http.delete(`/api/credentialDefinition/${data._id}`, { responseType: 'text' });
  }

  getAllCredentialDefinition(): Observable<any> {
    return this.http.get<any>('/api/credentialDefinitions');
  }

  insertIdCard(IdCard: any): Observable<any> {
    return this.http.post<any>('/api/idCard', IdCard);
  }

  getAllIdCard(): Observable<any> {
    return this.http.get<any>('/api/idCards')
  }

  deleteIdCard(data: any): Observable<any> {
    return this.http.delete(`/api/idCard/${data._id}`, { responseType: 'text' });
  }

}
