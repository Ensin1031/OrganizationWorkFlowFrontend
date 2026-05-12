import {
  IWorkDifficultyShort,
  IWorkPriorityShort,
  IWorkTagShort,
  IWorkTechnologyShort,
  IWorkTypeShort,
} from './references';
import { IProjectShort, IProjectStatusShort, IProjectVersionShort } from './project';
import { ISprintShort } from './sprints';
import { IUserExtendedShort } from './user';

export enum DefaultWorkTypesEnum {
  EPIC = 1,
  STORY = 2,
  WORK = 3,
  PROBLEM = 4,
}

export interface IWorkShort {
  id: number;
  name: string;
  full_name: string;
  color: string;
  slug: string;
  icon: string;
  start_date?: string | null;
  end_date?: string | null;
  target_start_date?: string | null;
  target_end_date?: string | null;
  lead_time?: string;
  wasted_time?: string;
}
export interface IWork extends IWorkShort {
  description: string;
  created: string;
  updated: string;
  epic?: IWorkShort;
  histories?: IWorkShort[];
  type?: IWorkTypeShort;
  priority?: IWorkPriorityShort;
  tags?: IWorkTagShort[];
  project: IProjectShort;
  sprint?: ISprintShort;
  status: IProjectStatusShort;
  created_by: IUserExtendedShort;
  execute_by?: IUserExtendedShort;
  difficulty?: IWorkDifficultyShort;
  technology?: IWorkTechnologyShort;
  versions?: IProjectVersionShort[];
}
export type IWorkCreateOrUpdate = Omit<IWork, 'id' | 'created' | 'updated' | 'full_name' | 'slug'> & {
  epic_id?: number;
  histories_ids?: number[];
  type_id: number;
  priority_id?: number;
  tags_ids?: number[];
  project_id: number;
  sprint_id?: number;
  status_id: number;
  created_by_id: number;
  execute_by_id?: number;
  difficulty_id?: number;
  technology_id?: number;
  versions_ids?: number[];
};
export type IWorkPatch = Partial<{
  [K in keyof IWorkCreateOrUpdate]: IWorkCreateOrUpdate[K] | null;
}>;
