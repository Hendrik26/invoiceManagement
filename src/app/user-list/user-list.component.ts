import {Component, OnInit} from '@angular/core';
import {FbInvoiceService} from '../fb-invoice.service';
import {SettingsService} from '../settings.service';
import {LoginUser} from '../loginuser';
import {Router} from '@angular/router';

@Component({
    selector: 'app-user-list',
    templateUrl: './user-list.component.html',
    styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {

    users: LoginUser[];

    constructor(private fbInvoiceService: FbInvoiceService,
                public settingsService: SettingsService,
                private router: Router) {
    }


    ngOnInit() {
        if (!this.settingsService.loginUser.id) {
            this.router.navigateByUrl('/login');
        }
        this.receiveUsers();
    }

    receiveUsers(): void {
        this.fbInvoiceService.getUserList()
            .subscribe(data => {
                this.users = data.map(x => LoginUser.normalizeUser(x));
            });
    }

    changeAuthorityLevel(index: number, level: number): void {
        this.users[index].authorityLevel = level;
        this.fbInvoiceService.updateUser(this.users[index].id, level).subscribe(
            () => {
            }
            , () => {
                this.settingsService.handleDbError('Datenbankfehler', 'Error during updating a user');
            }
        );
    }

}
