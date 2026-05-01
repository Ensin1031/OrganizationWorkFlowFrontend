export interface IStatus {
  id: number;
  name: string;
  description: string;
  color: string;
  slug: string;
  icon: string;
  created: string;
  updated: string;
  selected?: boolean;
}
export type IStatusCreateOrUpdate = Omit<IStatus, 'id' | 'created' | 'updated' | 'selected' | 'slug'>;

export interface IReferenceQueryParams {
  page?: number;
  pageSize?: number;
  search?: string | null;
  ordering?: string | null;
}
