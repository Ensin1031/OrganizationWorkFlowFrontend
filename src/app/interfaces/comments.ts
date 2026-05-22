import { IUserExtendedShort } from './user';


export interface IWorkComment {
  id: number;
  description: string;
  slug: string;
  created_by: IUserExtendedShort;
  work: string;
  parent?: string;
  created: string;
  updated: string;

  changeMode?: boolean;
  changeInputContent?: string;
}
export type IWorkCommentCreateOrUpdate = Omit<
  IWorkComment,
  | 'id'
  | 'created'
  | 'updated'
  | 'created_by'
  | 'work'
  | 'parent'
  | 'changeMode'
  | 'changeInputContent'
  | 'slug'
> & {
  created_by_id?: number;
  work_id?: string;
  parent_id?: string;
};
export type IWorkCommentPatch = Partial<{
  [K in keyof IWorkCommentCreateOrUpdate]: IWorkCommentCreateOrUpdate[K] | null;
}>;
