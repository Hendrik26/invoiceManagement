import {CustomerType} from './customer-type';

export interface CustomerTypePlus extends CustomerType {
    customerId: string;
}
