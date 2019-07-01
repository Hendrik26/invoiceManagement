import {Component, OnDestroy, OnInit} from '@angular/core';
import {FbInvoiceService} from '../fb-invoice.service';
import {SettingsService} from '../settings.service';
import {LoginUser} from '../loginuser';
import {Router} from '@angular/router';
import {Subscription} from 'rxjs';

@Component({
    selector: 'app-user-list',
    templateUrl: './user-list.component.html',
    styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit, OnDestroy {

    users: LoginUser[];
    private dataSubscription: Subscription;
    private writeSubscription: Subscription;

    constructor(private fbInvoiceService: FbInvoiceService,
                public settingsService: SettingsService,
                private router: Router) {
    }

    ngOnDestroy(): void {
        if (this.dataSubscription) {
            this.dataSubscription.unsubscribe();
        }
        if (this.writeSubscription) {
            this.writeSubscription.unsubscribe();
        }
    }

    ngOnInit() {
        if (!this.settingsService.loginUser.id) {
            this.router.navigateByUrl('/login');
        }
        this.receiveUsers();
    }

    receiveUsers(): void {
        this.dataSubscription = this.fbInvoiceService.getUserList()
            .subscribe(data => {
                this.users = data.map(x => LoginUser.normalizeUser(x));
            }, () => {
                this.settingsService.handleDbError('Speicherfehler', 'Error during read the user list');
            });
    }

    changeAuthorityLevel(index: number, level: number): void {
        this.users[index].authorityLevel = level;
        this.writeSubscription = this.fbInvoiceService.updateUser(this.users[index].id, level).subscribe(
            () => {
            }, () => {
                this.settingsService.handleDbError('Datenbankfehler', 'Error during updating a user');
            });
    }

}
