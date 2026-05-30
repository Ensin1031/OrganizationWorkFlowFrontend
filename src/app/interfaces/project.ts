import { IUserExtended } from './user';
import { IStatus } from './references';

export interface IProjectVersionShort {
  id: number;
  project: number;
  name: string;
  start_date: string;
  end_date: string;
  color: string;
  slug: string;
  in_work: string;
}
export interface IProjectVersion extends IProjectVersionShort {
  description: string;
  created: string;
  updated: string;
  selected?: boolean;
}
export type IProjectVersionCreateOrUpdate = Omit<
  IProjectVersion,
  'id' | 'created' | 'updated' | 'selected' | 'slug' | 'project' | 'in_work'
> & {
  project_id: number;
};
export interface IProjectStatusShort {
  id: number;
  status: number;
  name: string;
  color: string;
  slug: string;
  icon: string;
  priority: number;
  project_id: number;
  project_ids?: number[];
}
export interface IProjectStatus extends IProjectStatusShort {
  description: string;
  created: string;
  updated: string;
  selected?: boolean;
}
export type IProjectStatusCreateOrUpdate = Omit<
  IProjectStatus,
  'id' | 'created' | 'updated' | 'selected' | 'slug' | 'status' | 'project_id'
> & {
  status?: number;
};
export interface IProjectCategory {
  id: number;
  name: string;
  description: string;
  color: string;
  slug: string;
  icon: string;
  created: string;
  updated: string;
  has_projects: boolean;
  selected?: boolean;
}
export type IProjectCategoryCreateOrUpdate = Omit<
  IProjectType,
  'id' | 'created' | 'updated' | 'has_projects' | 'selected' | 'slug'
>;

export interface IProjectType {
  id: number;
  name: string;
  description: string;
  color: string;
  slug: string;
  icon: string;
  created: string;
  updated: string;
  has_projects: boolean;
  selected?: boolean;
}
export type IProjectTypeCreateOrUpdate = Omit<
  IProjectType,
  'id' | 'created' | 'updated' | 'has_projects' | 'selected' | 'slug'
>;

export interface IProjectShort {
  id: number;
  name: string;
  slug: string;
  color: string;
  icon: string;
  code_prefix: string;
  full_name: string;
  start_date: string | null;
  end_date: string | null;
  active_version?: IProjectVersion;
  statuses: IProjectStatus[];
  versions: IProjectVersion[];
}
export interface IProject extends IProjectShort {
  description: string;
  created: string;
  updated: string;
  manage_by?: IUserExtended;
  category?: IProjectCategory;
  type?: IProjectType;
  urls: string[];
}
export type IProjectCreateOrUpdate = Omit<
  IProject,
  'id' | 'created' | 'updated' | 'slug' | 'full_name'
> & {
  category_id?: number;
  type_id?: number;
  manage_by_id?: number;
  set_active_version?: IProjectVersion;
  status_ids?: number[];
  statuses_map?: IStatus[];
};
export interface IProjectsQueryParams {
  page: number;
  pageSize: number;
  search?: string | null;
  ordering?: string | null;
  categoryId?: number | null;
  typeId?: number | null;
  managerId?: number | null;
}
