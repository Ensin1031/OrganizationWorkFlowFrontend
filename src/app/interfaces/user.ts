export interface IUserExtended {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  second_name: string;
  full_name: string;
  profile_photo?: string;
  birth_date?: string;
}
export type IUserExtendedCreateOrUpdate = Omit<IUserExtended, 'id' | 'full_name'>;

export interface IUserExtendedQueryParams {
  page?: number;
  pageSize?: number;
  search?: string | null;
  ordering?: string | null;
}
