import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class PharmacyService {

  constructor(private http: HttpClient) { }

  applyPrescription(pharmacy: any): Observable<any> {
    return this.http.post<any>('/api/applyPrescription', pharmacy);
  }

  insertPharmacyPrescription(PharmacyPrescription: any): Observable<any> {
    return this.http.post<any>('/api/pharmacyPrescription', PharmacyPrescription);
  }

  getAllPharmacyPrescription(): Observable<any> {
    return this.http.get<any>('/api/pharmacyPrescriptions')
  }

  deletePharmacyPrescription(PharmacyPrescription: any): Observable<any> {
    return this.http.delete(`/api/pharmacyPrescription/${PharmacyPrescription._id}`, { responseType: 'text' });
  }

}
