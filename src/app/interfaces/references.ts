export interface IReferenceShortMixin {
  id: number;
  name: string;
  color: string;
  slug: string;
  icon: string;
}
export interface IReferenceMixin extends  IReferenceShortMixin {
  description: string;
  created: string;
  updated: string;
  selected?: boolean;
}
export type IReferenceCreateOrUpdate = Omit<IReferenceMixin, 'id' | 'created' | 'updated' | 'selected' | 'slug'>;

export interface IStatusShort extends IReferenceShortMixin {}
export interface IStatus extends IReferenceMixin {}

export interface IWorkTypeShort extends IReferenceShortMixin {}
export interface IWorkType extends IReferenceMixin {}

export interface IWorkTechnologyShort extends IReferenceShortMixin {}
export interface IWorkTechnology extends IReferenceMixin {}

export interface IWorkTagShort extends IReferenceShortMixin {}
export interface IWorkTag extends IReferenceMixin {}

export interface IWorkPriorityShort extends IReferenceShortMixin {}
export interface IWorkPriority extends IReferenceMixin {}

export interface IWorkDifficultyShort extends IReferenceShortMixin {}
export interface IWorkDifficulty extends IReferenceMixin {}
