export interface IUserExtendedShort {
  id: number;
  email: string;
  full_name: string;
  profile_photo?: string;
}
export interface IUserExtended extends IUserExtendedShort {
  username: string;
  first_name: string;
  last_name: string;
  second_name: string;
  birth_date?: string;
}
export type IUserExtendedCreateOrUpdate = Omit<IUserExtended, 'id' | 'full_name'>;
