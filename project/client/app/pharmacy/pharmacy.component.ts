import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { PharmacyService } from '../services/pharmacy.service';
import { ToastComponent } from '../shared/toast/toast.component';
import { LedgerService } from '../services/ledger.service';
import { PatientService } from '../services/patient.service';
import { TrustAnchorService } from '../services/anchor.service';

@Component({
  selector: 'app-pharmacy',
  templateUrl: './pharmacy.component.html'
})
export class PharmacyComponent implements OnInit {

  hashResponse;
  pharmacyPrescriptions = [];
  ledgers = [];
  patientPrescriptions = [];
  TrustAnchors = [];
  credentialDefinitions = [];
  isLoading = true;

  pharmacyForm: FormGroup;
  patientFirstName = new FormControl('', [
    Validators.required
  ]);
  patientLastName = new FormControl('', [
    Validators.required
  ]);
  dateOfBirth = new FormControl('', [
    Validators.required
  ]);
  status = new FormControl('', [
    Validators.required
  ]);
  doctorName = new FormControl('', [
    Validators.required
  ]);
  pdfHash = new FormControl('', [
    Validators.required
  ]);

  constructor(
    private pharmacyService: PharmacyService,
    private formBuilder: FormBuilder,
    public toast: ToastComponent,
    private ledgerService: LedgerService,
    private patientService: PatientService,
    private trustAnchorService: TrustAnchorService) { }

  ngOnInit() {
    this.getPharmacyPrescriptions();
    this.getLedger();
    this.getPatientPrescription();
    this.getTrustAnchor();
    this.getCredentialDefinitions();

    this.pharmacyForm = this.formBuilder.group({
      patientFirstName: this.patientFirstName,
      patientLastName: this.patientLastName,
      status: this.status,
      dateOfBirth: this.dateOfBirth,
      doctorName: this.doctorName,
      pdfHash: this.pdfHash
    });

  }

  setClassStatus() {
    return { 'has-danger': !this.status.pristine && !this.status.valid };
  }

  setClassDoctorName() {
    return { 'has-danger': !this.doctorName.pristine && !this.doctorName.valid };
  }

  setClassPdfHash() {
    return { 'has-danger': !this.pdfHash.pristine && !this.pdfHash.valid };
  }

  setClassPatientFirstName() {
    return { 'has-danger': !this.patientFirstName.pristine && !this.patientFirstName.valid };
  }

  setClassPatientLastName() {
    return { 'has-danger': !this.patientLastName.pristine && !this.patientLastName.valid };
  }

  setClassDateOfBirth() {
    return { 'has-danger': !this.dateOfBirth.pristine && !this.dateOfBirth.valid };
  }

  getPharmacyPrescriptions() {
    this.pharmacyService.getAllPharmacyPrescription().subscribe(
      data => {
        this.pharmacyPrescriptions = data;
      },
      error => {
        console.log(error);
        this.toast.setMessage('Can not pharmacy prescription lists', 'danger');
      }
    );
  }

  getLedger() {
    this.ledgerService.getAllPoolLedger().subscribe(
      data => this.ledgers = data,
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

  getCredentialDefinitions() {
    this.patientService.getAllCredentialDefinition().subscribe(
      data => this.credentialDefinitions = data,
      error => console.log(error),
      () => this.isLoading = false
    );
  }

  deletePharmacyPrescription(pharmacyPrescription: any) {
    if (window.confirm('Are you sure you want to delete this prescription?')) {
      this.pharmacyService.deletePharmacyPrescription(pharmacyPrescription).subscribe(
        res => {
          this.getPharmacyPrescriptions();
        },
        error => {
          console.log(error);
          this.toast.setMessage('Can not delete this pharmacy prescription', 'danger');
        }
      );
    }
  }

  applyPrescription() {
    this.isLoading = true;
    let prescription = this.pharmacyForm.value;

    prescription.poolHandle = parseInt(this.ledgers[this.ledgers.length - 1].poolHandle);
    prescription.poolName = this.ledgers[this.ledgers.length - 1].poolName;
    prescription.patientWallet = this.patientPrescriptions[this.patientPrescriptions.length - 1].patientWallet;
    prescription.patientWalletName = this.pharmacyForm.value.patientFirstName + 'Wallet';
    prescription.patientDoctorDid = this.patientPrescriptions[this.patientPrescriptions.length - 1].patientDoctorDid;
    prescription.patientMasterSecretId = this.patientPrescriptions[this.patientPrescriptions.length - 1].patientMasterSecretId;
    prescription.doctorPrescriptionCredDefId = this.credentialDefinitions[this.credentialDefinitions.length - 1].doctorPrescriptionCredDefId;
    prescription.pdfHash = this.hashResponse;

    prescription.patientWalletCredentials = {
      key: this.pharmacyForm.value.patientFirstName + "_key"
    };

    this.TrustAnchors.forEach(TrustAnchor => {
      if (TrustAnchor.trustAnchorWallet == 21) {
        prescription.pharmacyWallet = TrustAnchor.trustAnchorWallet;
        prescription.pharmacyDid = TrustAnchor.trustAnchorDID;
      }
    });

    this.pharmacyService.applyPrescription(prescription).subscribe(
      res => {
        this.pharmacyService.insertPharmacyPrescription({ patientDoctorDid: prescription.patientDoctorDid, doctorPrescriptionCredDefId: prescription.doctorPrescriptionCredDefId }).subscribe(
          res => {
            this.getPharmacyPrescriptions();
            this.isLoading = false;
            this.toast.setMessage('This claim is verified.', 'success');
          },
          error => {
            console.log(error);
            this.isLoading = false
            this.toast.setMessage('This claim can not save to pharmacy table.', 'danger');
          }
        );
      },
      error => {
        console.log(error);
        this.isLoading = false
        this.toast.setMessage('This claim is not verified.', 'danger');
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
