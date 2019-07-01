import {Component, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {FbInvoiceService} from '../fb-invoice.service';
import {SettingsService} from '../settings.service';
import {Setting} from '../setting';
import {Subscription} from 'rxjs';

@Component({
    selector: 'app-settings-detail',
    templateUrl: './settings-detail.component.html',
    styleUrls: ['./settings-detail.component.css']
})
export class SettingsDetailComponent implements OnInit, OnDestroy {

    public enableSaveButton = true;
    public settingList: object;
    public settingId: undefined;
    private dataSubscription1: Subscription;
    private dataSubscription2: Subscription;
    private downloadSubscription: Subscription;
    private writeSubscription: Subscription;
    private uploadSubscription: Subscription;

    constructor(
        private router: Router,
        // private route: ActivatedRoute,
        // private location: Location,
        private fbInvoiceService: FbInvoiceService,
        public settingsService: SettingsService) {
    }

    ngOnDestroy(): void {
        if (this.dataSubscription1) {
            this.dataSubscription1.unsubscribe();
        }
        if (this.dataSubscription2) {
            this.dataSubscription2.unsubscribe();
        }
        if (this.writeSubscription) {
            this.writeSubscription.unsubscribe();
        }
        if (this.uploadSubscription) {
            this.uploadSubscription.unsubscribe();
        }
        if (this.downloadSubscription) {
            this.downloadSubscription.unsubscribe();
        }
    }

    ngOnInit() {
        if (!this.settingsService.loginUser.id) {
            this.router.navigateByUrl('/login');
        }
        this.getDownloadUrl(this.settingsService.setting.logoId);
        this.getSettingList();
    }

    getSettingList(): void {
        this.dataSubscription1 = this.fbInvoiceService.getSettingList().subscribe(
            r => {
                this.settingList = r;
            }, () => {
                this.settingsService.handleDbError('Speicherfehler', 'Error during read the settings');
            });
    }

    saveSetting(): void {
        this.writeSubscription = this.fbInvoiceService.saveSetting(this.settingsService.setting.exportSettingData()).subscribe(
            r => {
                if (r) {
                    this.settingsService.settingId = r.id;
                }
            }, () => {
                this.settingsService.handleDbError('Datenbankfehler', 'Error during creation of a setting document');
            });
        this.router.navigateByUrl('/login');
    }

    uploadLogo(event): void {
        this.enableSaveButton = false;
        this.uploadSubscription = this.fbInvoiceService.uploadLogo(event).subscribe(
            r => {
                if (r.state === 'success') {
                    this.settingsService.setting.logoId = r.metadata.name;
                    this.getDownloadUrl(this.settingsService.setting.logoId);
                    this.enableSaveButton = true;
                }
            }, () => {
                this.settingsService.handleDbError('Speicherfehler', 'Error during uploading a file');
            });
    }

    private receiveSettingById(settingId: string): void {
        if (settingId) {
            this.dataSubscription2 = this.fbInvoiceService.getSettingById(settingId).subscribe(s => {
                if (s) {
                    this.settingsService.setting = Setting.normalizeSetting(s);
                    this.settingsService.settingId = settingId;
                }
            }, () => {
                this.settingsService.handleDbError('Speicherfehler', 'Error during read the settings');
            });
        } else {
            this.dataSubscription2 = this.fbInvoiceService.getLastSetting()
                .subscribe(s => {
                    if (s) {
                        this.settingsService.setting = Setting.normalizeSetting(s[0]);
                        this.settingsService.settingId = s[0].key;
                    }
                }, () => {
                    this.settingsService.handleDbError('Speicherfehler', 'Error during read a setting');
                });
        }
        this.getDownloadUrl(this.settingsService.setting.logoId);
    }

    private getDownloadUrl(id: string): void {
        if (!id) {
            return;
        }
        if (id.length === 0) {
            return;
        }
        this.downloadSubscription = this.fbInvoiceService.getDownloadUrl(id).subscribe(
            r => {
                this.settingsService.logoUrl = r;
            }, () => {
                this.settingsService.handleDbError('Speicherfehler', 'Error during downloading a file');
            });
    }

}
