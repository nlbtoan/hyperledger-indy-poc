import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { BankService } from '../services/bank.service';
import { GovernmentService } from '../services/government.service';
import { ToastComponent } from '../shared/toast/toast.component';
import { LedgerService } from '../services/ledger.service';
import { TrustAnchorService } from '../services/anchor.service';

@Component({
  selector: 'app-bank',
  templateUrl: './bank.component.html'
})
export class BankComponent implements OnInit {

  hashResponse;
  bankIdCards = [];
  ledgers = [];
  residentIdCards = [];
  TrustAnchors = [];
  credentialDefinitions = [];
  isLoading = true;

  bankForm: FormGroup;
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
    private bankService: BankService,
    private governmentService: GovernmentService,
    private formBuilder: FormBuilder,
    public toast: ToastComponent,
    private ledgerService: LedgerService,
    private trustAnchorService: TrustAnchorService) { }

  ngOnInit() {
    this.getBankIdCards();
    this.getLedger();
    this.gettingIdCard();
    this.getTrustAnchor();
    this.getCredentialDefinitions();

    this.bankForm = this.formBuilder.group({
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

  getBankIdCards() {
    this.bankService.getAllBankIdCard().subscribe(
      data => {
        this.bankIdCards = data;
      },
      error => {
        console.log(error);
        this.toast.setMessage('Can not Bank Id Card lists', 'danger');
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

  gettingIdCard() {
    this.governmentService.getAllIdCard().subscribe(
      data => this.residentIdCards = data,
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
    this.governmentService.getAllCredentialDefinition().subscribe(
      data => this.credentialDefinitions = data,
      error => console.log(error),
      () => this.isLoading = false
    );
  }

  deleteBankIdCard(bankIdCard: any) {
    if (window.confirm('Are you sure you want to delete this bankIdCard?')) {
      this.bankService.deleteBankIdCard(bankIdCard).subscribe(
        res => {
          this.getBankIdCards();
        },
        error => {
          console.log(error);
          this.toast.setMessage('Can not delete this bankIdCard', 'danger');
        }
      );
    }
  }

  applyLoan() {
    this.isLoading = true;
    let data = this.bankForm.value;
    data.status = 1;

    let idCard = {
      poolHandle: this.ledgers[this.ledgers.length - 1].poolHandle,
      poolName: this.ledgers[this.ledgers.length - 1].poolName,
      residentWallet: this.residentIdCards[this.residentIdCards.length - 1].residentWallet,
      residentWalletName: data.name.split(' ').join('') + 'Wallet',
      residentGovernmentDid: this.residentIdCards[this.residentIdCards.length - 1].residentGovernmentDid,
      residentMasterSecretId: this.residentIdCards[this.residentIdCards.length - 1].residentMasterSecretId,
      governmentIdCardCredDefId: this.credentialDefinitions[this.credentialDefinitions.length - 1].governmentIdCardCredDefId,
      pdfHash: this.hashResponse,
      bankWallet: 'null',
      bankDid: 'null',
      residentWalletCredentials: {
        key: data.name.split(' ').join('') + "_key"
      },
      data: data
    };

    this.TrustAnchors.forEach(TrustAnchor => {
      let anchorName = TrustAnchor.trustAnchorName.toLowerCase();
      if (anchorName === 'banking' || anchorName === 'bank') {
        idCard.bankWallet = TrustAnchor.trustAnchorWallet;
        idCard.bankDid = TrustAnchor.trustAnchorDID;
      }
    });

    this.bankService.applyLoan(idCard).subscribe(
      res => {
        this.bankService.insertBankIdCard({ residentGovernmentDid: idCard.residentGovernmentDid, governmentIdCardCredDefId: idCard.governmentIdCardCredDefId }).subscribe(
          res => {
            this.getBankIdCards();
            this.isLoading = false;
            this.toast.setMessage('This claim is verified.', 'success');
          },
          error => {
            console.log(error);
            this.isLoading = false
            this.toast.setMessage('This claim can not save to Bank table.', 'danger');
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
        this.governmentService.hashFile({ binary: reader.result }).subscribe(
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
