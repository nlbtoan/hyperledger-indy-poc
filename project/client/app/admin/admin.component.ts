import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { ToastComponent } from '../shared/toast/toast.component';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { LedgerService } from '../services/ledger.service';
import { TrustAnchorService } from '../services/anchor.service';
import { CreateSchemaService } from '../services/schema.service';
import { User } from '../shared/models/user.model';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html'
})
export class AdminComponent implements OnInit {

  users: User[] = [];
  ledgers = [];
  TrustAnchors = [];
  Schemas = [];
  isLoading = true;

  // For Pool Ledger
  ledgerForm: FormGroup;
  poolName = new FormControl('', [
    Validators.required
  ]);
  stewardWalletName = new FormControl('', [
    Validators.required
  ]);

  // For Trust Anchor 
  anchorForm: FormGroup;
  name = new FormControl('', [
    Validators.required
  ]);

  constructor(public auth: AuthService,
    public toast: ToastComponent,
    private formBuilder: FormBuilder,
    private userService: UserService,
    private ledgerService: LedgerService,
    private trustAnchorService: TrustAnchorService,
    private createSchemaService: CreateSchemaService
  ) { }

  ngOnInit() {
    this.getUsers();
    this.getLedger();
    this.getTrustAnchor();
    this.getShema();

    // For Pool Ledger
    this.ledgerForm = this.formBuilder.group({
      poolName: this.poolName,
      stewardWalletName: this.stewardWalletName
    })

    // For Anchor
    this.anchorForm = this.formBuilder.group({
      name: this.name
    });
  }

  // For Pool Ledger
  setClassPoolName() {
    return { 'has-danger': !this.poolName.pristine && !this.poolName.valid };
  }

  setClassStewardWalletName() {
    return { 'has-danger': !this.stewardWalletName.pristine && !this.stewardWalletName.valid };
  }

  // For Trust Anchor
  setClassName() {
    return { 'has-danger': !this.name.pristine && !this.name.valid };
  }

  getUsers() {
    this.userService.getUsers().subscribe(
      data => this.users = data,
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
      error => console.log(error),
      () => this.isLoading = false
    );
  }

  deleteUser(user: User) {
    if (window.confirm('Are you sure you want to delete ' + user.username + '?')) {
      this.userService.deleteUser(user).subscribe(
        data => this.toast.setMessage('user deleted successfully.', 'success'),
        error => console.log(error),
        () => this.getUsers()
      );
    }
  }

  deleteTrustAnchor(trustAnchor: any) {
    if (window.confirm('Are you sure you want to delete ' + trustAnchor.trustAnchorName + '?')) {
      this.trustAnchorService.deleteTrustAnchor(trustAnchor).subscribe(
        data => this.toast.setMessage('Trust anchor deleted successfully.', 'success'),
        error => console.log(error),
        () => this.getTrustAnchor()
      );
    }
  }

  deleteLedger(ledger: any) {
    if (window.confirm('Are you sure you want to delete ' + ledger.name + '?')) {
      this.ledgerService.deletePoolLedger(ledger).subscribe(
        data => this.toast.setMessage('Trust anchor deleted successfully.', 'success'),
        error => console.log(error),
        () => this.getLedger()
      );
    }
  }

  deleteSchema(schema: any) {
    if (window.confirm('Are you sure you want to delete ' + schema.prescriptionSchemaId + '?')) {
      this.createSchemaService.deleteSchema(schema).subscribe(
        data => this.toast.setMessage('Schema deleted successfully.', 'success'),
        error => console.log(error),
        () => this.getShema()
      );
    }
  }

  createPoolLedger() {
    this.isLoading = true;

    this.ledgerService.createPoolLedger(this.ledgerForm.value).subscribe(
      data => {
        this.ledgerService.insertPoolLedger(data).subscribe(
          res => {
            this.getLedger();
            this.isLoading = false
            this.toast.setMessage('Ledger created successfully.', 'success');
          },
          error => {
            this.isLoading = false;
            console.log(error);
          }
        );
      },
      error => {
        this.isLoading = false;
        console.log(error);
      }
    );
  }

  addTrustAnchor() {
    this.isLoading = true;
    let trustAnchor = this.anchorForm.value;
    trustAnchor.trustAnchorWalletName = this.anchorForm.value.name + 'Wallet';
    trustAnchor.poolHandle = parseInt(this.ledgers[this.ledgers.length - 1].poolHandle);
    trustAnchor.poolName = this.ledgers[this.ledgers.length - 1].poolName;
    trustAnchor.stewardWallet = parseInt(this.ledgers[this.ledgers.length - 1].stewardWallet);
    trustAnchor.stewardDid = this.ledgers[this.ledgers.length - 1].stewardDid;

    this.trustAnchorService.addTrustAnchor(trustAnchor).subscribe(
      res => {
        this.trustAnchorService.insertTrustAnchor(res).subscribe(
          res => {
            this.getTrustAnchor();
            this.isLoading = false;
            this.toast.setMessage('Trust Anchor created successfully.', 'success');
          },
          error => {
            this.isLoading = false;
            console.log(error);
          },
        );
      },
      error => {
        this.isLoading = false;
        console.log(error);
      }
    );
  }

  createSchema() {
    this.isLoading = true;
    let setupSchema = {
      nursingHomeWallet: 'null',
      nursingHomeDid: 'null',
      poolHandle: parseInt(this.ledgers[this.ledgers.length - 1].poolHandle),
      schema: ["id", "name", "dob", "gender", "nationality", "hometown", "profile_image_hash", "created_at"]
    };

    this.TrustAnchors.forEach(TrustAnchor => {
      let anchorName = TrustAnchor.trustAnchorName.toLowerCase();
      if (anchorName === 'government' || anchorName === 'gov') {
        setupSchema.nursingHomeWallet = TrustAnchor.trustAnchorWallet;
        setupSchema.nursingHomeDid = TrustAnchor.trustAnchorDID;
      }
    });

    this.createSchemaService.createSchema(setupSchema).subscribe(
      res => {
        this.createSchemaService.insertSchema(res).subscribe(
          res => {
            this.getShema();
            this.isLoading = false;
            this.toast.setMessage('Trust Anchor created successfully.', 'success');
          }
        );
      },
      error => {
        this.isLoading = false;
        console.log(error);
      }
    );
  }
}