import { Component, computed, HostBinding, inject, signal } from '@angular/core';
import { SprintService } from '../../../../services/sprint';
import { WorkService } from '../../../../services/work';
import { ProjectContextService } from '../../../../services/project-context';
import { rxResource } from '@angular/core/rxjs-interop';
import { forkJoin, of } from 'rxjs';
import { defaultEmptyPage } from '../../../../interfaces/common';
import { StatusesService } from '../../../../services/work-references';

@Component({
  selector: 'app-active-tasks-board',
  imports: [],
  templateUrl: './active-tasks-board.html',
  styleUrl: './active-tasks-board.scss',
})
export class ActiveTasksBoardComponent {
  @HostBinding('class') class = 'h-100 take-full-page-height';

  private sprintService = inject(SprintService);
  private projectService = inject(ProjectContextService);
  private statusesService = inject(StatusesService);
  private workService = inject(WorkService);

  private reloadTrigger = signal(0);
  refresh(): void {
    this.reloadTrigger.update((v) => v + 1);
  }
  activeSprintsResource = rxResource({
    params: () => ({
      reload: this.reloadTrigger(),
    }),
    stream: () => {
      return this.sprintService.getActiveSprints();
    },
  });
  activeSprints = computed(() => this.activeSprintsResource.value() ?? []);
  activeSprintSlugs = computed(() => this.activeSprints().map((s) => s.slug));
  /**
   * null = выбраны все активные спринты
   * [] = ничего не выбрано
   * ['sprint-1'] = выбран конкретный sprint
   */
  selectedSprintSlugs = signal<string[] | null>(null);
  /** Итоговый список sprint slugs */
  sprintSlugs = computed(() => {
    const selected = this.selectedSprintSlugs();
    if (selected === null) return this.activeSprintSlugs();
    return selected;
  });
  boardDataResource = rxResource({
    params: () => ({
      reload: this.reloadTrigger(),
      sprintSlugs: this.sprintSlugs(),
    }),
    stream: ({ params }) => {
      if (!params.sprintSlugs.length) {
        return of({
          tasks: defaultEmptyPage,
          statuses: [],
        });
      }
      return forkJoin({
        tasks: this.workService.getWorkPage({
          page: 1,
          pageSize: 1000,
          filters: {
            sprints: params.sprintSlugs,
          },
        }),
        statuses: this.statusesService.getByFilters({ sprints: params.sprintSlugs }),
      });
    },
  });
  tasks = computed(() => this.boardDataResource.value()?.tasks?.results ?? []);
  statuses = computed(() => this.boardDataResource.value()?.statuses ?? []);

  isLoadingSprints = computed(() => this.activeSprintsResource.isLoading());
  isLoadingBoard = computed(() => this.boardDataResource.isLoading());
  sprintsError = computed(() => this.activeSprintsResource.error());
  boardError = computed(() => this.boardDataResource.error());

  toggleSprintSelection(slug: string): void {
    this.selectedSprintSlugs.update((current) => {
      const currentArray = current ?? this.activeSprintSlugs();
      if (currentArray.includes(slug)) return currentArray.filter((s) => s !== slug);
      return [...currentArray, slug];
    });
  }
  selectAllSprints = (): void => this.selectedSprintSlugs.set(null);
  clearSprintSelection = (): void => this.selectedSprintSlugs.set([]);
  isSprintSelected(slug: string): boolean {
    const selected = this.selectedSprintSlugs();
    if (selected === null) return true;
    return selected.includes(slug);
  }
}
