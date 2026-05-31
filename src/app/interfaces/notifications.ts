import { IUserExtended } from './user';


export interface INotification {
  id: number;
  is_read: boolean;
  user: IUserExtended;
  title: string;
  description: string;
  created: string;
  updated: string;
}

export enum NotificationTypesEnum {
  UNREAD_COUNT = 'unread_count',
  WORK_CREATE = 'work_create',
  WORK_UPDATE = 'work_update',
  UPDATE_WORK_STATUS = 'work_status_update',
}
export interface INotificationUnreadCount {
  unread_count?: number;
}
export interface IWSNotificationResponse extends INotificationUnreadCount {
  type: NotificationTypesEnum;
  items?: INotification[];
  item?: INotification;
}
