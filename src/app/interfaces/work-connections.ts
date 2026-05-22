import { IWorkShort } from './works';

export enum WorkConnectionTypesEnum {
  IS_BLOCKED_BY = 'is_blocked_by',
  BLOCKS = 'blocks',
  CLONES = 'clones',
  IS_CLONED_BY = 'is_cloned_by',
  DUPLICATES = 'duplicates',
  IS_DUPLICATED_BY = 'is_duplicated_by',
  HAS_TO_BE_FINISHED_TOGETHER_WITH = 'has_to_be_finished_together_with',
  HAS_TO_BE_DONE_BEFORE = 'has_to_be_done_before',
  HAS_TO_BE_DONE_AFTER = 'has_to_be_done_after',
  HAS_TO_BE_STARTED_TOGETHER_WITH = 'has_to_be_started_together_with',
  RELATES_TO = 'relates_to',
  IS_PARENT_TASK_OF = 'is_parent_task_of',
  IS_SUBTASK_OF = 'is_subtask_of',
  CAUSES = 'causes',
  IS_CAUSED_BY = 'is_caused_by',
}
export interface IWorkConnectionTypeItem {
  id: string;
  label: string;
  labelMany: string;
}
export const WorkConnectionTypes: IWorkConnectionTypeItem[] = [
  {
    id: WorkConnectionTypesEnum.IS_BLOCKED_BY,
    label: 'Заблокирован задачей',
    labelMany: 'Заблокирован задачами',
  },
  {
    id: WorkConnectionTypesEnum.BLOCKS,
    label: 'Блокирует задачу',
    labelMany: 'Блокирует задачи',
  },
  { id: WorkConnectionTypesEnum.CLONES, label: 'Клон задачи', labelMany: 'Клон задач' },
  {
    id: WorkConnectionTypesEnum.IS_CLONED_BY,
    label: 'Клонирован от задачи',
    labelMany: 'Клонирован от задач',
  },
  {
    id: WorkConnectionTypesEnum.DUPLICATES,
    label: 'Дублирует задачу',
    labelMany: 'Дублирует задачи',
  },
  {
    id: WorkConnectionTypesEnum.IS_DUPLICATED_BY,
    label: 'Дублирован от задачи',
    labelMany: 'Дублирован от задач',
  },
  {
    id: WorkConnectionTypesEnum.HAS_TO_BE_FINISHED_TOGETHER_WITH,
    label: 'Завершить вместе с задачей',
    labelMany: 'Завершить вместе с задачами',
  },
  {
    id: WorkConnectionTypesEnum.HAS_TO_BE_DONE_BEFORE,
    label: 'Нужно сделать до выполнения задачи',
    labelMany: 'Нужно сделать до выполнения задач',
  },
  {
    id: WorkConnectionTypesEnum.HAS_TO_BE_DONE_AFTER,
    label: 'Нужно сделать после выполнения задачи',
    labelMany: 'Нужно сделать после выполнения задач',
  },
  {
    id: WorkConnectionTypesEnum.HAS_TO_BE_STARTED_TOGETHER_WITH,
    label: 'Начать вместе с задачей',
    labelMany: 'Начать вместе с задачами',
  },
  {
    id: WorkConnectionTypesEnum.RELATES_TO,
    label: 'Связана с задачей',
    labelMany: 'Связана с задачами',
  },
  {
    id: WorkConnectionTypesEnum.IS_PARENT_TASK_OF,
    label: 'Является родительской для задачи',
    labelMany: 'Является родительской для задач',
  },
  {
    id: WorkConnectionTypesEnum.IS_SUBTASK_OF,
    label: 'Является дочерней от задачи',
    labelMany: 'Является дочерней от задач',
  },
  {
    id: WorkConnectionTypesEnum.CAUSES,
    label: 'Является причиной для задачи',
    labelMany: 'Является причиной для задач',
  },
  {
    id: WorkConnectionTypesEnum.IS_CAUSED_BY,
    label: 'Вызвана от задачи',
    labelMany: 'Вызвана от задач',
  },
];

export interface IWorkConnection {
  id: number;
  type: string;
  type_name: string;
  work_from: IWorkShort;
  work_to: IWorkShort;

  // кастомные поля
  type_id: string;
  slug: string;
  name: string;
}
export type IWorkConnectionCreateOrUpdate = Omit<
  IWorkConnection,
  'id' | 'type_name' | 'work_from' | 'work_to' | 'type_id' | 'slug' | 'name'
> & {
  work_from_id: string;
  work_to_id: string;
};
