import {Component, OnInit} from '@angular/core';
import {FbInvoiceService} from '../fb-invoice.service';
import {SettingsService} from '../settings.service';
import {Setting} from '../setting';

// import {LoginUser} from '../loginuser';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

    constructor(
        public fbInvoiceService: FbInvoiceService,
        public settingsService: SettingsService
    ) {
    }

    ngOnInit() {
        this.settingsService.timeoutAlert = null;
    }

    private signin(type: number) {
        this.fbInvoiceService.signin$(type, this.settingsService.email, this.settingsService.password).subscribe(value => {
            this.settingsService.loginUser.id = value[0].user.uid; // value[0]: data comes from Firebase-authentication
            this.settingsService.loginUser.email = value[0].user.email;
            this.settingsService.loginUser.providerId = value[0].additionalUserInfo.providerId;
            this.settingsService.passReset2 = (value[0].additionalUserInfo.providerId === 'password');
            if (value[1]) { // value[1]: data comes from Firebase-collection userprofiles
                this.settingsService.loginUser.authorityLevel = value[1].authorityLevel;
                this.settingsService.loginUser.created = value[1].created.toDate();
                this.settingsService.readonly = value[1].authorityLevel <= 1;
            } else {
                this.settingsService.loginUser.authorityLevel = 0;
                this.settingsService.loginUser.created = undefined;
                this.settingsService.readonly = true;
            }
            this.getLastSetting();
        });
        this.settingsService.email = '';
        this.settingsService.password = '';
    }

    private logout() {
        this.settingsService.loginUser.id = null;
        this.settingsService.loginUser.email = null;
        this.fbInvoiceService.logout();
    }

    private resetPassword() {
        this.fbInvoiceService.resetPassword(this.settingsService.loginUser.email)
            .then(() => this.settingsService.passReset1 = true);
    }

    private getLastSetting(): void {
        this.fbInvoiceService.getLastSetting()
            .subscribe(s => {
                if (s) {
                    this.settingsService.setting = Setting.normalizeSetting(s[0]);
                    this.settingsService.settingId = s[0].key;
                }
            });
    }

}
