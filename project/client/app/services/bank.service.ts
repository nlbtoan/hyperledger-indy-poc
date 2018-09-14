import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class BankService {

  constructor(private http: HttpClient) { }

  applyLoan(bank: any): Observable<any> {
    return this.http.post<any>('/api/applyLoan', bank);
  }

  insertBankIdCard(BankIdCard: any): Observable<any> {
    return this.http.post<any>('/api/bankIdCard', BankIdCard);
  }

  getAllBankIdCard(): Observable<any> {
    return this.http.get<any>('/api/bankIdCards')
  }

  deleteBankIdCard(BankIdCard: any): Observable<any> {
    return this.http.delete(`/api/bankIdCard/${BankIdCard._id}`, { responseType: 'text' });
  }

}
