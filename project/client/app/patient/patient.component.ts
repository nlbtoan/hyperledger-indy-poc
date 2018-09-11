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

  id = new FormControl('', [
    Validators.required
  ]);
  name = new FormControl('', [
    Validators.required
  ]);
  dob = new FormControl('', [
    Validators.required
  ]);
  gender = new FormControl('', [
    Validators.required
  ]);
  nationality = new FormControl('', [
    Validators.required
  ]);
  hometown = new FormControl('', [
    Validators.required
  ]);
  profile_image_hash = new FormControl('', [
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
      id: this.id,
      name: this.name,
      dob: this.dob,
      gender: this.gender,
      nationality: this.nationality,
      hometown: this.hometown,
      profile_image_hash: this.profile_image_hash
    });

  }

  // Patient class notification
  setClassID() {
    return { 'has-danger': !this.id.pristine && !this.id.valid };
  }

  setClassName() {
    return { 'has-danger': !this.name.pristine && !this.name.valid };
  }

  setClassDOB() {
    return { 'has-danger': !this.dob.pristine && !this.dob.valid };
  }

  setClassGender() {
    return { 'has-danger': !this.gender.pristine && !this.gender.valid };
  }

  setClassNationality() {
    return { 'has-danger': !this.nationality.pristine && !this.nationality.valid };
  }

  setClassHometown() {
    return { 'has-danger': !this.hometown.pristine && !this.hometown.valid };
  }

  setClassProfileImageHash() {
    return { 'has-danger': !this.profile_image_hash.pristine && !this.profile_image_hash.valid };
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
    let data = this.patientForm.value;
    let prescription = {
      patientWalletName: data.name.split(' ').join('-') + 'Wallet',
      poolHandle: this.ledgers[this.ledgers.length - 1].poolHandle,
      poolName: this.ledgers[this.ledgers.length - 1].poolName,
      doctorPrescriptionCredDefId: this.credentialDefinitions[this.credentialDefinitions.length - 1].doctorPrescriptionCredDefId,
      doctorDid: 'null',
      doctorWallet: 'null',
      pharmacyWallet: 'null',
      prescriptionCredValues: {
        id: { raw: this.patientForm.value.id, encoded: '1' },
        name: { raw: this.patientForm.value.name, encoded: '1' },
        dob: { raw: this.patientForm.value.dob, encoded: '1' },
        gender: { raw: this.patientForm.value.gender, encoded: '1' },
        nationality: { raw: this.patientForm.value.nationality, encoded: '1' },
        hometown: { raw: this.patientForm.value.hometown, encoded: '1' },
        profile_image_hash: { raw: this.hashResponse, encoded: '1' },
        created_at: { raw: new Date().toISOString().slice(0, 10), encoded: '1' },
        status: { raw: 1, encoded: '1' }
      }
    };

    this.TrustAnchors.forEach(TrustAnchor => {
      let anchorName = TrustAnchor.trustAnchorName.toLowerCase();
      if (anchorName === 'government' || anchorName === 'gov') {
        prescription.doctorDid = TrustAnchor.trustAnchorDID;
        prescription.doctorWallet = TrustAnchor.trustAnchorWallet;
      } else if (anchorName === 'banking' || anchorName === 'bank') {
        prescription.pharmacyWallet = TrustAnchor.trustAnchorWallet;
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
      let anchorName = TrustAnchor.trustAnchorName.toLowerCase();
      if (anchorName === 'government' || anchorName === 'gov') {
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
