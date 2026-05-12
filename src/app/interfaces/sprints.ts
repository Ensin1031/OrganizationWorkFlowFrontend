export interface ISprintShort {
  id: number;
  name: string;
  slug: string;
  color: string;
  start_date?: string;
  end_date?: string;
  in_work: boolean;
  is_completed: boolean;
}
export interface ISprint extends ISprintShort {
  description: string;
  works_ids: number[];
  created: string;
  updated: string;
}
export type ISprintCreateOrUpdate = Omit<
  ISprint,
  'id' | 'created' | 'updated' | 'works_ids' | 'slug'
>;

export interface IUserSprintLoad {
  user_id: number;
  user_photo: string;
  user_email: string;
  user_full_name: string;
  user_lead_time: string;
}
export interface ISprintLoadWithoutUsers {
  total_lead_time: string;
}
export interface ISprintLoad {
  users: IUserSprintLoad[];
  without_users?: ISprintLoadWithoutUsers | null;
}
