import {Component, OnDestroy, OnInit} from '@angular/core';
import {FbInvoiceService} from '../fb-invoice.service';
import {SettingsService} from '../settings.service';
import {Setting} from '../setting';
import {Subscription} from 'rxjs';

// import {LoginUser} from '../loginuser';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {

    public loginFailed = false;
    private signinSubscription: Subscription;
    private settingsSubscription: Subscription;

    constructor(
        public fbInvoiceService: FbInvoiceService,
        public settingsService: SettingsService
    ) {
    }

    ngOnDestroy(): void {
        this.unsubscribe();
    }

    ngOnInit() {
        this.settingsService.timeoutAlert = null;
        if (this.settingsService.loginUser.id) {
            this.getLastSetting();
        }
    }

    private signin(type: number) {
        this.loginFailed = false;
        this.settingsService.passReset1 = false;
        this.signinSubscription = this.fbInvoiceService.signin$(type, this.settingsService.email, this.settingsService.password)
            .subscribe(value => {
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
            }, () => {
                this.loginFailed = true;
            });
        this.settingsService.email = '';
        this.settingsService.password = '';
    }

    private logout() {
        this.unsubscribe();
        this.settingsService.loginUser.id = null;
        this.settingsService.loginUser.email = null;
        this.settingsService.passReset1 = false;
        this.fbInvoiceService.logout();
    }

    private resetPassword() {
        this.fbInvoiceService.resetPassword(this.settingsService.loginUser.email)
            .then(() => this.settingsService.passReset1 = true);
    }

    private getLastSetting(): void {
        if (this.settingsSubscription) {
            this.settingsSubscription.unsubscribe();
        }
        this.settingsSubscription = this.fbInvoiceService.getLastSetting()
            .subscribe(s => {
                if (s) {
                    this.settingsService.setting = Setting.normalizeSetting(s[0]);
                    this.settingsService.settingId = s[0].key;
                }
            }, () => {
                this.settingsService.handleDbError('Speicherfehler', 'Error during read the settings');
            });
    }

    private unsubscribe(): void {
        if (this.signinSubscription) {
            this.signinSubscription.unsubscribe();
        }
        if (this.settingsSubscription) {
            this.settingsSubscription.unsubscribe();
        }
    }

}
