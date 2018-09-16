import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class TrustAnchorService {

  constructor(private http: HttpClient) { }

  addTrustAnchor(anchor: any): Observable<any> {
    return this.http.post<any>('/api/addTrustAnchor', anchor);
  }

  insertTrustAnchor(anchor: any): Observable<any> {
    return this.http.post<any>('/api/trustAnchor', anchor);
  }

  deleteTrustAnchor(anchor: any): Observable<any> {
    return this.http.delete(`/api/trustAnchor/${anchor._id}`, { responseType: 'text' });
  }

  getAllTrustAnchor(): Observable<any> {
    return this.http.get<any>('/api/trustAnchors');
  }

}
