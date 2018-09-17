import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { ToastComponent } from '../shared/toast/toast.component';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { LedgerService } from '../services/ledger.service';
import { TrustAnchorService } from '../services/anchor.service';
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
  stewardName = new FormControl('', [
    Validators.required
  ]);

  // For Ledger 
  anchorForm: FormGroup;
  name = new FormControl('', [
    Validators.required
  ]);

  constructor(public auth: AuthService,
    public toast: ToastComponent,
    private formBuilder: FormBuilder,
    private userService: UserService,
    private ledgerService: LedgerService,
    private trustAnchorService: TrustAnchorService
  ) { }

  ngOnInit() {
    this.getUsers();
    this.getLedger();
    this.getTrustAnchor();

    // For Pool Ledger
    this.ledgerForm = this.formBuilder.group({
      poolName: this.poolName,
      stewardName: this.stewardName
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

  setClassStewardName() {
    return { 'has-danger': !this.stewardName.pristine && !this.stewardName.valid };
  }

  // For Ledger
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
        data => this.toast.setMessage('Ledger deleted successfully.', 'success'),
        error => console.log(error),
        () => this.getTrustAnchor()
      );
    }
  }

  deleteLedger(ledger: any) {
    if (window.confirm('Are you sure you want to delete ' + ledger.name + '?')) {
      this.ledgerService.deletePoolLedger(ledger).subscribe(
        data => this.toast.setMessage('Ledger deleted successfully.', 'success'),
        error => console.log(error),
        () => this.getLedger()
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
    let ledger = this.ledgers[0];
    let data = {
      poolName: ledger.poolName,
      stewardName: ledger.stewardName,
      stewardDid: ledger.stewardDid,
      trustAnchorName: this.anchorForm.value.name
    };

    this.trustAnchorService.addTrustAnchor(data).subscribe(
      res => {
        this.trustAnchorService.insertTrustAnchor(res).subscribe(
          res => {
            this.getTrustAnchor();
            this.isLoading = false;
            this.toast.setMessage('Ledger created successfully.', 'success');
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
}