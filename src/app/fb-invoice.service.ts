// responsible for connection to Firebase-DB

import {Injectable} from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/firestore';
import {Customer} from './customer';
import {CustomerType} from './customer-type';
import {Invoice} from './invoice';
import {InvoiceType} from './invoice-type';
import {combineLatest, from, Observable} from 'rxjs';
import {AngularFireAuth} from '@angular/fire/auth';
import {AngularFireStorage} from '@angular/fire//storage';
import * as firebase from 'firebase';
import {map, switchMap} from 'rxjs/operators';
import {SettingType} from './setting-type';


@Injectable({
    providedIn: 'root'
})
export class FbInvoiceService {

    private dbCustomerPath = '/customers';
    private dbInvoicePath = '/invoices';
    private dbUserPath = '/userprofiles';
    private dbSettingPath = '/settings';

    constructor(private firebaseAuth: AngularFireAuth,
                private db: AngularFirestore,
                private afStorage: AngularFireStorage) {
    }

    private static historyKeyToLabel(key: string): string {
        return key.slice(12, 14) + '.' + key.slice(9, 11) + '.' + key.slice(4, 8) + ' ' + key.slice(15, 17) + ':' + key.slice(18, 20)
            + ':' + key.slice(21, 23);
    }

    private static getHistoryKey(): string {
        const date = new Date();
        const key = 'Key-' + date.getFullYear() + '-'
            + ('0' + (date.getMonth() + 1).toString()).slice(-2) + '-'
            + ('0' + date.getDate().toString()).slice(-2) + '-'
            + ('0' + date.getHours().toString()).slice(-2) + '-'
            + ('0' + date.getMinutes().toString()).slice(-2) + '-'
            + ('0' + date.getSeconds().toString()).slice(-2) + '-'
            + ('00' + date.getMilliseconds().toString()).slice(-3);
        return key;
    }

    uploadLogo(event): Observable<any> {
        const ref = this.afStorage.ref(FbInvoiceService.getHistoryKey());
        return from(ref.put(event.target.files[0]));
    }

    getDownloadUrl(id: string): Observable<any> {
        const ref = this.afStorage.ref(id);
        return ref.getDownloadURL();
    }

    signin$(type: number, email: string, password: string): Observable<any> {
        let user$: Observable<any>;
        if (type === 0) {
            user$ = from(this.firebaseAuth.auth.signInWithEmailAndPassword(email, password));
        }
        if (type === 1) {
            user$ = from(this.firebaseAuth.auth.createUserWithEmailAndPassword(email, password));
        }
        if (type === 2) {
            user$ = from(this.firebaseAuth.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()));
        }
        const userProfile$: Observable<any> = user$.pipe(switchMap(value => {
            return this.db.collection(this.dbUserPath).doc(value.user.uid).valueChanges();
        }));
        return combineLatest(user$, userProfile$);
    }

    logout() {
        this.firebaseAuth
            .auth
            .signOut();
    }

    resetPassword(email: string) {
        const auth = firebase.auth();

        return auth.sendPasswordResetEmail(email)
            .then(() => console.log('email sent'))
            .catch((error) => console.log(error));
    }

    // receives the list of the users
    getUserList(): Observable<any> {
        // create the database reference/query witch depends on the value of the "archive" parameter
        const usersRef = this.db.collection(this.dbUserPath,
            ref => ref.orderBy('email'));
        // return of the observable
        return usersRef.snapshotChanges().pipe(
            map(changes =>
                changes.map(c => ({key: c.payload.doc.id, ...c.payload.doc.data()}))
            )
        );
    }

    // updates the authorityLevel field of an existing user document
    updateUser(id: string, authorityLevel: number): Observable<any> {
        return from(this.db.doc(`${this.dbUserPath}/${id}`).update({authorityLevel: authorityLevel}));
    }

    // save the setting document as a new version
    saveSetting(setting: SettingType): Observable<any> {
        const id = FbInvoiceService.getHistoryKey();
        return from(this.db.collection(this.dbSettingPath).doc(id).set(setting));
    }

    // receives the last setting document
    getLastSetting(): Observable<any> {
        return this.db.collection(this.dbSettingPath, ref => ref.orderBy('creationTime', 'desc').limit(1))
            .snapshotChanges()
            .pipe(map(changes => changes.map(c => ({key: c.payload.doc.id, ...c.payload.doc.data()}))));
    }

    // receives the last setting document
    getSettingList(): Observable<any> {
        return this.db.collection(this.dbSettingPath).snapshotChanges()
            .pipe(map(changes =>
                changes.map(c => ({key: c.payload.doc.id, creationTime: FbInvoiceService.historyKeyToLabel(c.payload.doc.id)})
                )));
    }

    // receives one specific setting document
    getSettingById(settingId: string): Observable<any> {
        return this.db.doc(`${this.dbSettingPath}/${settingId}`).valueChanges();
    }

    // receives the list of the customers with archive or not
    getCustomersList(archive: string): Observable<any> {
        // create the database reference/query witch depends on the value of the "archive" parameter
        let customersRef: AngularFirestoreCollection<Customer> = null;
        if (archive === 'all') {
            customersRef = this.db.collection(this.dbCustomerPath);
        } else {
            if (archive === 'showArchive') {
                customersRef = this.db.collection(this.dbCustomerPath,
                    ref => ref.where('archived', '==', true));
            } else {
                customersRef = this.db.collection(this.dbCustomerPath,
                    ref => ref.where('archived', '==', false));
            }
        }
        // return of the observable
        return customersRef.snapshotChanges().pipe(
            map(changes =>
                changes.map(c => ({key: c.payload.doc.id, ...c.payload.doc.data()}))
            )
        );
    }

    // receives one specific customers document
    getCustomerById(customerId: string, historyId: string): Observable<any> {
        // create the database path witch depends from the value of the "historyId" parameter
        let path = '';
        if (!historyId) {
            path = `${this.dbCustomerPath}/${customerId}`;
        } else {
            path = `${this.dbCustomerPath}/${customerId}/history/${historyId}`;
        }
        // return of the observable
        return this.db.doc(path).valueChanges();
    }

    // receives the history list of one specific customers - used in the select element
    getCustomerHistoryById(customerId: string): Observable<any> {
        // create the database reference
        const customersRef = this.db.collection(`${this.dbCustomerPath}/${customerId}/history`);
        // return of the observable
        return customersRef.snapshotChanges().pipe(
            map(changes =>
                changes.map(c => ({
                    historyKey: c.payload.doc.id,
                    historyLabel: FbInvoiceService.historyKeyToLabel(c.payload.doc.id)
                }))
            )
        );
    }

    // receives te first two documents of the history - necessary to test the existence of the customer history
    testCustomerHistoryById(customerId: string): Observable<any> {
        // create the database reference
        const customersRef = this.db.collection(`${this.dbCustomerPath}/${customerId}/history`,
            ref => ref.limit(2));
        // return of the observable
        return customersRef.snapshotChanges().pipe(
            map(changes =>
                changes.map(c => ({historyId: c.payload.doc.id}))));
    }

    // creates a new customer document
    createCustomer(data: CustomerType): Observable<any> {
        return from(this.db.collection(this.dbCustomerPath).add(data));
    }

    // updates an existing customer document
    updateCustomer(id: string, data: CustomerType): Observable<any> {
        return from(this.db.doc(`${this.dbCustomerPath}/${id}`).set(data));
    }

    // receives one specific invoice document
    getInvoiceById(invoiceId: string, historyId: string, defaultSettingId: string): Observable<any> {
        // create the database path witch depends from the value of the "historyId" parameter

        let path = '';
        if (!historyId) {
            path = `${this.dbInvoicePath}/${invoiceId}`;
        } else {
            path = `${this.dbInvoicePath}/${invoiceId}/History/${historyId}`;
        }
        // join and return of the observables
        const invoice$: Observable<any> = this.db.doc(path).valueChanges();
        const settings$: Observable<any> = invoice$.pipe(switchMap(value => {
            return this.db.collection(this.dbSettingPath).doc(value.settingId ? value.settingId : defaultSettingId).valueChanges();
        }));
        return combineLatest(invoice$, settings$);
        // return  invoice$;
    }

    // receives the invoice query with several filter options
    getInvoiceList(refIndex: number, filterStartDate: Date, filterEndDate: Date, filterState: string,
                   filterCustomer: string, filterArchive: boolean): Observable<any> {
        // let invoiceRef: AngularFirestoreCollection<Invoice> = null;
        const invoiceRefs: AngularFirestoreCollection<Invoice>[] = [
            // 0
            this.db.collection(this.dbInvoicePath),
            // 1
            this.db.collection(this.dbInvoicePath,
                ref => ref.where('invoiceDate', '>=', filterStartDate)
                    .where('invoiceDate', '<=', filterEndDate)),
            // 2
            this.db.collection(this.dbInvoicePath,
                ref => ref.where('invoiceDueDate', '>=', filterStartDate)
                    .where('invoiceDueDate', '<=', filterEndDate)),
            // 3
            null,
            // 4
            this.db.collection(this.dbInvoicePath,
                ref => ref.where('invoiceState', '==', filterState)),
            // 5
            this.db.collection(this.dbInvoicePath,
                ref => ref.where('invoiceDate', '>=', filterStartDate)
                    .where('invoiceDate', '<=', filterEndDate)
                    .where('invoiceState', '==', filterState)),
            // 6
            this.db.collection(this.dbInvoicePath,
                ref => ref.where('invoiceDueDate', '>=', filterStartDate)
                    .where('invoiceDueDate', '<=', filterEndDate)
                    .where('invoiceState', '==', filterState)),
            // 7
            null,
            // 8
            this.db.collection(this.dbInvoicePath,
                ref => ref.where('customer.customerId', '==', filterCustomer)),
            // 9
            this.db.collection(this.dbInvoicePath,
                ref => ref.where('invoiceDate', '>=', filterStartDate)
                    .where('invoiceDate', '<=', filterEndDate)
                    .where('customer.customerId', '==', filterCustomer)),
            // 10
            this.db.collection(this.dbInvoicePath,
                ref => ref.where('invoiceDueDate', '>=', filterStartDate)
                    .where('invoiceDueDate', '<=', filterEndDate)
                    .where('customer.customerId', '==', filterCustomer)),
            // 11
            null,
            // 12
            this.db.collection(this.dbInvoicePath,
                ref => ref.where('invoiceState', '==', filterState)
                    .where('customer.customerId', '==', filterCustomer)),
            // 13
            this.db.collection(this.dbInvoicePath,
                ref => ref.where('invoiceDate', '>=', filterStartDate)
                    .where('invoiceDate', '<=', filterEndDate).where('invoiceState', '==', filterState)
                    .where('customer.customerId', '==', filterCustomer)),
            // 14
            this.db.collection(this.dbInvoicePath,
                ref => ref.where('invoiceDueDate', '>=', filterStartDate)
                    .where('invoiceDueDate', '<=', filterEndDate).where('invoiceState', '==', filterState)
                    .where('customer.customerId', '==', filterCustomer)),
            // 15
            null,
            // 16
            this.db.collection(this.dbInvoicePath,
                ref => ref.where('archived', '==', filterArchive)),
            // 17
            this.db.collection(this.dbInvoicePath,
                ref => ref.where('invoiceDate', '>=', filterStartDate)
                    .where('invoiceDate', '<=', filterEndDate)
                    .where('archived', '==', filterArchive)),
            // 18
            this.db.collection(this.dbInvoicePath,
                ref => ref.where('invoiceDueDate', '>=', filterStartDate)
                    .where('invoiceDueDate', '<=', filterEndDate)
                    .where('archived', '==', filterArchive)),
            // 19
            null,
            // 20
            this.db.collection(this.dbInvoicePath,
                ref => ref.where('invoiceState', '==', filterState)
                    .where('archived', '==', filterArchive)),
            // 21
            this.db.collection(this.dbInvoicePath,
                ref => ref.where('invoiceDate', '>=', filterStartDate)
                    .where('invoiceDate', '<=', filterEndDate).where('invoiceState', '==', filterState)
                    .where('archived', '==', filterArchive)),
            // 22
            this.db.collection(this.dbInvoicePath,
                ref => ref.where('invoiceDueDate', '>=', filterStartDate)
                    .where('invoiceDueDate', '<=', filterEndDate).where('invoiceState', '==', filterState)
                    .where('archived', '==', filterArchive)),
            // 23
            null,
            // 24
            this.db.collection(this.dbInvoicePath,
                ref => ref.where('customer.customerId', '==', filterCustomer)
                    .where('archived', '==', filterArchive)),
            // 25
            this.db.collection(this.dbInvoicePath,
                ref => ref.where('invoiceDate', '>=', filterStartDate)
                    .where('invoiceDate', '<=', filterEndDate)
                    .where('customer.customerId', '==', filterCustomer)
                    .where('archived', '==', filterArchive)),
            // 26
            this.db.collection(this.dbInvoicePath,
                ref => ref.where('invoiceDueDate', '>=', filterStartDate)
                    .where('invoiceDueDate', '<=', filterEndDate)
                    .where('customer.customerId', '==', filterCustomer)
                    .where('archived', '==', filterArchive)),
            // 27
            null,
            // 28
            this.db.collection(this.dbInvoicePath,
                ref => ref.where('invoiceState', '==', filterState)
                    .where('customer.customerId', '==', filterCustomer)
                    .where('archived', '==', filterArchive)),
            // 29
            this.db.collection(this.dbInvoicePath,
                ref => ref.where('invoiceDate', '>=', filterStartDate)
                    .where('invoiceDate', '<=', filterEndDate).where('invoiceState', '==', filterState)
                    .where('customer.customerId', '==', filterCustomer)
                    .where('archived', '==', filterArchive)),
            // 30
            this.db.collection(this.dbInvoicePath,
                ref => ref.where('invoiceDueDate', '>=', filterStartDate)
                    .where('invoiceDueDate', '<=', filterEndDate).where('invoiceState', '==', filterState)
                    .where('customer.customerId', '==', filterCustomer)
                    .where('archived', '==', filterArchive)),
            null
        ];
        return invoiceRefs[refIndex].snapshotChanges()
            .pipe(map(changes =>
                changes.map(c => ({
                    key: c.payload.doc.id,
                    ...c.payload.doc.data(),
                    wholeCost: (c.payload.doc.data().itemTypes
                        ? c.payload.doc.data().itemTypes.reduce((sum, current) =>
                                isNaN(current.count) || isNaN(current.partialCost) ? sum : sum + current.count * current.partialCost,
                            0) : 0)
                }))
            ));
    }

    // receives te first two documents of the history - necessary to test the existence of the invoice history
    testInvoiceHistoryById(invoiceId: string): Observable<any> {
        // create the database reference
        const invoiceRef = this.db.collection(`${this.dbInvoicePath}/${invoiceId}/History`,
            ref => ref.limit(2));
        // return of the observable
        return invoiceRef.snapshotChanges().pipe(
            map(changes =>
                changes.map(c => ({historyId: c.payload.doc.id}))));
    }

    // receives the history list of one specific invoice - used in the select element
    getInvoiceHistoryById(invoicerId: string): Observable<any> {
        // create the database reference
        const invoicerRef = this.db.collection(`${this.dbInvoicePath}/${invoicerId}/History`);
        // return of the observable
        return invoicerRef.snapshotChanges().pipe(
            map(changes =>
                changes.map(c => ({
                    historyKey: c.payload.doc.id,
                    historyLabel: FbInvoiceService.historyKeyToLabel(c.payload.doc.id)
                }))
            )
        );
    }

    // update or create a invoice document together with a history document in one batc
    updateInvoice(id: string, data: InvoiceType): Observable<any> {
        const batch = this.db.firestore.batch();
        if (!id) {
            id = this.db.firestore.collection(this.dbInvoicePath).doc().id;
        } // creating invoiceId if not existing
        const invoiceRef = this.db.firestore.collection(this.dbInvoicePath).doc(id);
        const invoiceHistoryRef = this.db.firestore.collection(this.dbInvoicePath)
            .doc(id).collection('History').doc(FbInvoiceService.getHistoryKey());
        batch.set(invoiceRef, data);
        console.log(`\r\n\r\nDB-Update with BatchWrite invoiceRef!!! \r\n\r\n`);
        batch.set(invoiceHistoryRef, data);
        console.log(`\r\n\r\nDB-Update with BatchWrite invoiceHistoryRef!!! \r\n\r\n`);
        return from(batch.commit());
    }

}
