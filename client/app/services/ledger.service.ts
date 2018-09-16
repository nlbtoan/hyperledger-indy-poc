import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class LedgerService {

  constructor(private http: HttpClient) { }

  createPoolLedger(ledger: any): Observable<any> {
    return this.http.post<any>('/api/createPoolLedger', ledger);
  }

  insertPoolLedger(ledger: any): Observable<any> {
    return this.http.post<any>('/api/ledger', ledger);
  }

  deletePoolLedger(ledger: any): Observable<any> {
    return this.http.delete(`/api/ledger/${ledger._id}`, { responseType: 'text' });
  }

  getAllPoolLedger(): Observable<any> {
    return this.http.get<any>('/api/ledgers');
  }

}
