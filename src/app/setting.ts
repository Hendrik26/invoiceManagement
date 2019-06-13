import {SettingType} from './setting-type';

export class Setting implements SettingType {

    creationTime: Date;
    creditorIdentificationNumber: string;
    footerAddressCountry: string;
    footerAddressLine01: string;
    footerAddressLine02: string;
    footerAddressLine03: string;
    footerAddressLine04: string;
    footerAddressLine05: string;
    footerBankConnection01: string;
    footerBankConnection02: string;
    footerBankConnection03: string;
    footerBankConnection04: string;
    footerBankConnection05: string;
    footerContactLine01: string;
    footerContactLine02: string;
    footerContactLine03: string;
    footerContactLine04: string;
    footerContactLine05: string;
    footerContactLine11: string;
    footerContactLine12: string;
    footerContactLine13: string;
    footerContactLine14: string;
    footerContactLine15: string;
    footerTaxIdentification: string;
    headerAddressLine01: string;
    headerAddressLine02: string;
    headerAddressLine03: string;
    headerAddressLine04: string;
    headerAddressLine05: string;
    headerLocation: string;
    headerShortAddress: string;
    loginTxt0: string;
    loginTxt1: string;
    loginTxt2: string;
    loginTxt3: string;
    logoId: string;
    timeoutForEdit: number;

    constructor() {
        this.creationTime = new Date();
        this.creditorIdentificationNumber = '';
        this.footerAddressCountry = '';
        this.footerAddressLine01 = '';
        this.footerAddressLine02 = '';
        this.footerAddressLine03 = '';
        this.footerAddressLine04 = '';
        this.footerAddressLine05 = '';
        this.footerBankConnection01 = '';
        this.footerBankConnection02 = '';
        this.footerBankConnection03 = '';
        this.footerBankConnection04 = '';
        this.footerBankConnection05 = '';
        this.footerContactLine01 = '';
        this.footerContactLine02 = '';
        this.footerContactLine03 = '';
        this.footerContactLine04 = '';
        this.footerContactLine05 = '';
        this.footerContactLine11 = '';
        this.footerContactLine12 = '';
        this.footerContactLine13 = '';
        this.footerContactLine14 = '';
        this.footerContactLine15 = '';
        this.footerTaxIdentification = '';
        this.headerAddressLine01 = '';
        this.headerAddressLine02 = '';
        this.headerAddressLine03 = '';
        this.headerAddressLine04 = '';
        this.headerAddressLine05 = '';
        this.headerLocation = '';
        this.headerShortAddress = '';
        this.loginTxt0 = '';
        this.loginTxt1 = '';
        this.loginTxt2 = '';
        this.loginTxt3 = '';
        this.logoId = '';
        this.timeoutForEdit = 600;
    }

    public static normalizeSetting(inSetting: any): Setting {
        const setting = new Setting();
        setting.creationTime = inSetting.creationTime ? inSetting.creationTime.toDate() : new Date();
        setting.creditorIdentificationNumber = inSetting.logoId ? inSetting.creditorIdentificationNumber : '';
        setting.footerAddressCountry = inSetting.footerAddressCountry ? inSetting.footerAddressCountry : '';
        setting.footerAddressLine01 = inSetting.footerAddressLine01 ? inSetting.footerAddressLine01 : '';
        setting.footerAddressLine02 = inSetting.footerAddressLine02 ? inSetting.footerAddressLine02 : '';
        setting.footerAddressLine03 = inSetting.footerAddressLine03 ? inSetting.footerAddressLine03 : '';
        setting.footerAddressLine04 = inSetting.footerAddressLine04 ? inSetting.footerAddressLine04 : '';
        setting.footerAddressLine05 = inSetting.footerAddressLine05 ? inSetting.footerAddressLine05 : '';
        setting.footerBankConnection01 = inSetting.footerBankConnection01 ? inSetting.footerBankConnection01 : '';
        setting.footerBankConnection02 = inSetting.footerBankConnection02 ? inSetting.footerBankConnection02 : '';
        setting.footerBankConnection03 = inSetting.footerBankConnection03 ? inSetting.footerBankConnection03 : '';
        setting.footerBankConnection04 = inSetting.footerBankConnection04 ? inSetting.footerBankConnection04 : '';
        setting.footerBankConnection05 = inSetting.footerBankConnection05 ? inSetting.footerBankConnection05 : '';
        setting.footerContactLine01 = inSetting.footerContactLine01 ? inSetting.footerContactLine01 : '';
        setting.footerContactLine02 = inSetting.footerContactLine02 ? inSetting.footerContactLine02 : '';
        setting.footerContactLine03 = inSetting.footerContactLine03 ? inSetting.footerContactLine03 : '';
        setting.footerContactLine04 = inSetting.footerContactLine04 ? inSetting.footerContactLine04 : '';
        setting.footerContactLine05 = inSetting.footerContactLine05 ? inSetting.footerContactLine05 : '';
        setting.footerContactLine11 = inSetting.footerContactLine11 ? inSetting.footerContactLine11 : '';
        setting.footerContactLine12 = inSetting.footerContactLine12 ? inSetting.footerContactLine12 : '';
        setting.footerContactLine13 = inSetting.footerContactLine13 ? inSetting.footerContactLine13 : '';
        setting.footerContactLine14 = inSetting.footerContactLine14 ? inSetting.footerContactLine14 : '';
        setting.footerContactLine15 = inSetting.footerContactLine15 ? inSetting.footerContactLine15 : '';
        setting.footerTaxIdentification = inSetting.footerTaxIdentification ? inSetting.footerTaxIdentification : '';
        setting.headerAddressLine01 = inSetting.headerAddressLine01 ? inSetting.headerAddressLine01 : '';
        setting.headerAddressLine02 = inSetting.headerAddressLine02 ? inSetting.headerAddressLine02 : '';
        setting.headerAddressLine03 = inSetting.headerAddressLine03 ? inSetting.headerAddressLine03 : '';
        setting.headerAddressLine04 = inSetting.headerAddressLine04 ? inSetting.headerAddressLine04 : '';
        setting.headerAddressLine05 = inSetting.headerAddressLine05 ? inSetting.headerAddressLine05 : '';
        setting.headerLocation = inSetting.headerLocation ? inSetting.headerLocation : '';
        setting.headerShortAddress = inSetting.headerShortAddress ? inSetting.headerShortAddress : '';
        setting.loginTxt0 = inSetting.loginTxt0 ? inSetting.loginTxt0 : '';
        setting.loginTxt1 = inSetting.loginTxt1 ? inSetting.loginTxt1 : '';
        setting.loginTxt2 = inSetting.loginTxt2 ? inSetting.loginTxt2 : '';
        setting.loginTxt3 = inSetting.loginTxt3 ? inSetting.loginTxt3 : '';
        setting.logoId = inSetting.logoId ? inSetting.logoId : '';
        setting.timeoutForEdit = (typeof inSetting.timeoutForEdit === 'number') ? inSetting.timeoutForEdit : 6000;
        return setting;
    }

    exportSettingData(): SettingType {
        return {
            creationTime: new Date(),
            creditorIdentificationNumber: this.creditorIdentificationNumber,
            footerAddressCountry: this.footerAddressCountry,
            footerAddressLine01: this.footerAddressLine01,
            footerAddressLine02: this.footerAddressLine02,
            footerAddressLine03: this.footerAddressLine03,
            footerAddressLine04: this.footerAddressLine04,
            footerAddressLine05: this.footerAddressLine05,
            footerBankConnection01: this.footerBankConnection01,
            footerBankConnection02: this.footerBankConnection02,
            footerBankConnection03: this.footerBankConnection03,
            footerBankConnection04: this.footerBankConnection04,
            footerBankConnection05: this.footerBankConnection05,
            footerContactLine01: this.footerContactLine01,
            footerContactLine02: this.footerContactLine02,
            footerContactLine03: this.footerContactLine03,
            footerContactLine04: this.footerContactLine04,
            footerContactLine05: this.footerContactLine05,
            footerContactLine11: this.footerContactLine11,
            footerContactLine12: this.footerContactLine12,
            footerContactLine13: this.footerContactLine13,
            footerContactLine14: this.footerContactLine14,
            footerContactLine15: this.footerContactLine15,
            footerTaxIdentification: this.footerTaxIdentification,
            headerAddressLine01: this.headerAddressLine01,
            headerAddressLine02: this.headerAddressLine02,
            headerAddressLine03: this.headerAddressLine03,
            headerAddressLine04: this.headerAddressLine04,
            headerAddressLine05: this.headerAddressLine05,
            headerLocation: this.headerLocation,
            headerShortAddress: this.headerShortAddress,
            loginTxt0: this.loginTxt0,
            loginTxt1: this.loginTxt1,
            loginTxt2: this.loginTxt2,
            loginTxt3: this.loginTxt3,
            logoId: this.logoId,
            timeoutForEdit: this.timeoutForEdit
        };
    }

}
