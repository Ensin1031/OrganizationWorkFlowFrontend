import { IUserExtended } from './user';


export interface INotification {
  id: number;
  user: IUserExtended
  title: string;
  description: string;
  created: string;
  updated: string;
}
