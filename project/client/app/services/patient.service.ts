import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Credential } from '../shared/models/setupCredentialDefinition.model';

@Injectable()
export class PatientService {

  constructor(private http: HttpClient) { }

  createPrescription(patient: any): Observable<any> {
    return this.http.post<any>('/api/gettingPrescription', patient);
  }

  setupCredentialDefinition(credential: Credential): Observable<Credential> {
    return this.http.post<Credential>('/api/setupCredentialDefinition', credential);
  }

  hashFile(base64: any): Observable<any> {
    return this.http.post<any>('/api/hash', base64);
  }

  insertCredentialDefinition(CredentialDefinition: any): Observable<any> {
    return this.http.post<any>('/api/CredentialDefinition', CredentialDefinition);
  }

  deleteCredentialDefinition(CredentialDefinition: any): Observable<any> {
    return this.http.delete(`/api/credentialDefinition/${CredentialDefinition._id}`, { responseType: 'text' });
  }

  getAllCredentialDefinition(): Observable<any> {
    return this.http.get<any>('/api/credentialDefinitions');
  }

  insertPatientPrescription(PatientPrescription: any): Observable<any> {
    return this.http.post<any>('/api/PatientPrescription', PatientPrescription);
  }

  getAllPatientPrescription(): Observable<any> {
    return this.http.get<any>('/api/patientPrescriptions')
  }

  deletePatientPrescription(PatientPrescription: any): Observable<any> {
    return this.http.delete(`/api/patientPrescription/${PatientPrescription._id}`, { responseType: 'text' });
  }

}
