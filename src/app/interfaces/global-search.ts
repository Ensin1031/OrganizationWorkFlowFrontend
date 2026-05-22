import { IProjectShort } from './project';
import { IWorkShort } from './works';
import { ISprintShort } from './sprints';

export interface IPaginatedSearchItemsSerializer<T> {
  count: number;
  has_next_page: boolean;
  results: T[];
}

export interface IGlobalSearchResponseSerializer {
  projects?: IPaginatedSearchItemsSerializer<IProjectShort>;
  sprints?: IPaginatedSearchItemsSerializer<ISprintShort>;
  epiks?: IPaginatedSearchItemsSerializer<IWorkShort>;
  histories?: IPaginatedSearchItemsSerializer<IWorkShort>;
  tasks?: IPaginatedSearchItemsSerializer<IWorkShort>;
}
export const DefaultEmptyGlobalSearchResult = {
  projects: { count: 0, has_next_page: false, results: [] },
  sprints: { count: 0, has_next_page: false, results: [] },
  epiks: { count: 0, has_next_page: false, results: [] },
  histories: { count: 0, has_next_page: false, results: [] },
  tasks: { count: 0, has_next_page: false, results: [] },
};
