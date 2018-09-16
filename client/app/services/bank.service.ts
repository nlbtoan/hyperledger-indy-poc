import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class BankService {

  constructor(private http: HttpClient) { }

  applyLoan(data: any): Observable<any> {
    return this.http.post<any>('/api/applyLoan', data);
  }

  insertContract(data: any): Observable<any> {
    return this.http.post<any>('/api/contract', data);
  }

  getAllContract(): Observable<any> {
    return this.http.get<any>('/api/contracts')
  }

  deleteContract(data: any): Observable<any> {
    return this.http.delete(`/api/contract/${data._id}`, { responseType: 'text' });
  }

}
