import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastComponent } from '../shared/toast/toast.component';

import { PatientService } from '../services/patient.service';
import { CreateSchemaService } from '../services/schema.service';
import { LedgerService } from '../services/ledger.service';
import { TrustAnchorService } from '../services/anchor.service';

@Component({
  selector: 'app-patient',
  templateUrl: './patient.component.html'
})
export class PatientComponent implements OnInit {

  @ViewChild('fileInput') fileInput: ElementRef;

  hashResponse;
  binaryConverted;
  credentialDefinitions = [];
  patientPrescriptions = [];
  ledgers = [];
  TrustAnchors = [];
  Schemas = [];
  isLoading = true;

  // Patient validation
  patientForm: FormGroup;

  patient_first_name = new FormControl('', [
    Validators.required
  ]);
  patient_last_name = new FormControl('', [
    Validators.required
  ]);
  doctor_name = new FormControl('', [
    Validators.required
  ]);
  status = new FormControl('', [
    Validators.required
  ]);
  dob = new FormControl('', [
    Validators.required
  ]);
  pdf_hash = new FormControl('', [
    Validators.required
  ]);

  constructor(
    private patientService: PatientService,
    private formBuilder: FormBuilder,
    public toast: ToastComponent,
    private createSchemaService: CreateSchemaService,
    private ledgerService: LedgerService,
    private trustAnchorService: TrustAnchorService) { }

  ngOnInit() {
    this.getCredentialDefinitions();
    this.getPatientPrescription();
    this.getTrustAnchor();
    this.getLedger();
    this.getShema();

    // Build form for patient
    this.patientForm = this.formBuilder.group({
      patient_first_name: this.patient_first_name,
      patient_last_name: this.patient_last_name,
      doctor_name: this.doctor_name,
      status: this.status,
      dob: this.dob,
      pdf_hash: this.pdf_hash
    });

  }

  // Patient class notification
  setClassFirstname() {
    return { 'has-danger': !this.patient_first_name.pristine && !this.patient_first_name.valid };
  }

  setClassLastname() {
    return { 'has-danger': !this.patient_last_name.pristine && !this.patient_last_name.valid };
  }

  setClassDoctorName() {
    return { 'has-danger': !this.doctor_name.pristine && !this.doctor_name.valid };
  }

  setClassStatus() {
    return { 'has-danger': !this.status.pristine && !this.status.valid };
  }

  setClassBob() {
    return { 'has-danger': !this.dob.pristine && !this.dob.valid };
  }

  setClassPdfHash() {
    return { 'has-danger': !this.pdf_hash.pristine && !this.pdf_hash.valid };
  }

  getCredentialDefinitions() {
    this.patientService.getAllCredentialDefinition().subscribe(
      data => this.credentialDefinitions = data,
      error => console.log(error),
      () => this.isLoading = false
    );
  }

  getPatientPrescription() {
    this.patientService.getAllPatientPrescription().subscribe(
      data => this.patientPrescriptions = data,
      error => console.log(error),
      () => this.isLoading = false
    );
  }

  getTrustAnchor() {
    this.trustAnchorService.getAllTrustAnchor().subscribe(
      data => this.TrustAnchors = data,
      error => console.log(error),
      () => this.isLoading = false
    );
  }

  getLedger() {
    this.ledgerService.getAllPoolLedger().subscribe(
      data => this.ledgers = data,
      error => console.log(error),
      () => this.isLoading = false
    );
  }

  getShema() {
    this.createSchemaService.getAllSchema().subscribe(
      data => this.Schemas = data,
      error => console.log(error)
    );
  }

  deleteCredentialDefinition(credentialDefinition) {
    if (window.confirm('Are you sure you want to delete this credential?')) {
      this.patientService.deleteCredentialDefinition(credentialDefinition).subscribe(
        res => {
          this.getCredentialDefinitions();
          this.toast.setMessage('Credential Definition deleted successfully.', 'success');
        },
        error => {
          console.log(error);
          this.toast.setMessage('Credential Definition can not deleted.', 'danger');
        }
      );
    }
  }

  deletePatientPrescription(patientPrescription) {
    if (window.confirm('Are you sure you want to delete this prescription?')) {
      this.patientService.deletePatientPrescription(patientPrescription).subscribe(
        data => {
          this.getPatientPrescription();
          this.toast.setMessage('Patient Prescription deleted successfully.', 'success');
        },
        error => {
          console.log(error);
          this.toast.setMessage('Patient Prescription can not deleted.', 'danger');
        }
      );
    }
  }

  createPrescription() {
    this.isLoading = true;
    let prescription = this.patientForm.value;

    prescription.name = this.patientForm.value.patient_first_name;
    prescription.patientWalletName = this.patientForm.value.patient_first_name + 'Wallet';
    prescription.poolHandle = this.ledgers[this.ledgers.length - 1].poolHandle;
    prescription.poolName = this.ledgers[this.ledgers.length - 1].poolName;
    prescription.doctorPrescriptionCredDefId = this.credentialDefinitions[this.credentialDefinitions.length - 1].doctorPrescriptionCredDefId;
    prescription.prescriptionCredValues = {
      patient_first_name: { raw: this.patientForm.value.patient_first_name, encoded: '1139481716457488690172217916278103335' },
      patient_last_name: { raw: this.patientForm.value.patient_last_name, encoded: '5321642780241790123587902456789123452' },
      doctor_name: { raw: this.patientForm.value.doctor_name, encoded: '12434523576212321' },
      status: { raw: this.patientForm.value.status, encoded: '2213454313412354' },
      dob: { raw: this.patientForm.value.dob, encoded: '3124141231422543541' },
      link: { raw: '2015', encoded: '2015' },
      pdf_hash: { raw: this.hashResponse, encoded: '456856164451658' },
      isCreated: { raw: '1', encoded: '1' }
    }

    delete prescription.dob;
    delete prescription.doctor_name;
    delete prescription.patient_first_name;
    delete prescription.patient_last_name;
    delete prescription.pdf_hash;
    delete prescription.status;

    this.TrustAnchors.forEach(TrustAnchor => {
      if (TrustAnchor.trustAnchorWallet == 13) {
        prescription.doctorDid = TrustAnchor.trustAnchorDID,
          prescription.doctorWallet = TrustAnchor.trustAnchorWallet
      } else if (TrustAnchor.trustAnchorWallet == 21) {
        prescription.pharmacyWallet = TrustAnchor.trustAnchorWallet
      }
    });

    this.patientService.createPrescription(prescription).subscribe(
      res => {
        this.patientService.insertPatientPrescription(res).subscribe(
          res => {
            this.getPatientPrescription();
            this.isLoading = false;
            this.toast.setMessage('Patient prescription created successfully.', 'success');
          },
          error => {
            console.log(error);
            this.isLoading = false;
            this.toast.setMessage('Patient prescription can not created', 'danger');
          }
        );
      },
      error => {
        console.log(error);
        this.isLoading = false;
        this.toast.setMessage('Patient prescription can not created', 'danger');
      }
    );
  }

  setupCredentialDefinition() {
    this.isLoading = true;

    let credentialDefinition = {
      poolHandle: this.ledgers[this.ledgers.length - 1].poolHandle,
      doctorDid: 'none',
      doctorWallet: 'none'
    }

    this.TrustAnchors.forEach(TrustAnchor => {
      if (TrustAnchor.trustAnchorWallet == 13) {
        credentialDefinition.doctorDid = TrustAnchor.trustAnchorDID,
          credentialDefinition.doctorWallet = TrustAnchor.trustAnchorWallet
      }
    });

    Object.keys(credentialDefinition).forEach(key => {
      this.Schemas[this.Schemas.length - 1][key] = credentialDefinition[key];
    });

    this.patientService.setupCredentialDefinition(this.Schemas[0]).subscribe(
      res => {
        this.patientService.insertCredentialDefinition(res).subscribe(
          res => {
            this.getCredentialDefinitions();
            this.isLoading = false;
            this.toast.setMessage('Credential Definition created successfully.', 'success');
          },
          error => {
            console.log(error);
            this.isLoading = false;
            this.toast.setMessage('Credential Definition can not inserted to database.', 'danger');
          }
        );
      },
      error => {
        console.log(error);
        this.isLoading = false;
        this.toast.setMessage('Can not setup credential definition!!!', 'danger');
      }
    );
  }

  onFileChange(event) {
    let reader = new FileReader();
    if (event.target.files && event.target.files.length > 0) {
      let file = event.target.files[0];
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.patientService.hashFile({ binary: reader.result }).subscribe(
          res => {
            this.hashResponse = res.hash.sha256;
            this.toast.setMessage('Hash successfully.', 'success');
          },
          error => {
            console.log(error);
            this.toast.setMessage('You can not get the hash of this file!!!', 'danger');
          }
        );
      };
    }
  }

}
