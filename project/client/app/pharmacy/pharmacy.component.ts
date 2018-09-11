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
  // nationality = new FormControl('', [
  //   Validators.required
  // ]);
  // hometown = new FormControl('', [
  //   Validators.required
  // ]);
  created_at = new FormControl('', [
    Validators.required
  ]);
  // profile_image_hash = new FormControl('', [
  //   Validators.required
  // ]);
  money = new FormControl('', [
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
      id: this.id,
      name: this.name,
      dob: this.dob,
      gender: this.gender,
      // nationality: this.nationality,
      // hometown: this.hometown,
      created_at: this.created_at,
      // profile_image_hash: this.profile_image_hash,
      money: this.money
    });

  }


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

  // setClassNationality() {
  //   return { 'has-danger': !this.nationality.pristine && !this.nationality.valid };
  // }

  // setClassHometown() {
  //   return { 'has-danger': !this.hometown.pristine && !this.hometown.valid };
  // }

  // setClassProfileImageHash() {
  //   return { 'has-danger': !this.profile_image_hash.pristine && !this.profile_image_hash.valid };
  // }

  setClassMoney() {
    return { 'has-danger': !this.money.pristine && !this.money.valid };
  }

  setClassCreatedAt() {
    return { 'has-danger': !this.created_at.pristine && !this.created_at.valid };
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
    let data = this.pharmacyForm.value;
    data.status = 1;

    let prescription = {
      poolHandle: this.ledgers[this.ledgers.length - 1].poolHandle,
      poolName: this.ledgers[this.ledgers.length - 1].poolName,
      patientWallet: this.patientPrescriptions[this.patientPrescriptions.length - 1].patientWallet,
      patientWalletName: data.name.split(' ').join('') + 'Wallet',
      patientDoctorDid: this.patientPrescriptions[this.patientPrescriptions.length - 1].patientDoctorDid,
      patientMasterSecretId: this.patientPrescriptions[this.patientPrescriptions.length - 1].patientMasterSecretId,
      doctorPrescriptionCredDefId: this.credentialDefinitions[this.credentialDefinitions.length - 1].doctorPrescriptionCredDefId,
      pdfHash: this.hashResponse,
      pharmacyWallet: 'null',
      pharmacyDid: 'null',
      patientWalletCredentials: {
        key: data.name.split(' ').join('') + "_key"
      },
      data: data
    };

    this.TrustAnchors.forEach(TrustAnchor => {
      let anchorName = TrustAnchor.trustAnchorName.toLowerCase();
      if (anchorName === 'banking' || anchorName === 'bank') {
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
