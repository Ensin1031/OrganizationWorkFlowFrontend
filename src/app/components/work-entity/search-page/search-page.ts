import { Component, computed, effect, HostBinding, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { rxResource, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatDivider } from '@angular/material/list';
import { MatFormField, MatInput, MatLabel, MatSuffix } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GlobalSearchService } from '../../../services/global-search';
import { FiltersType } from '../../../interfaces/common';
import { debounceTime, distinctUntilChanged, of, take, tap } from 'rxjs';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { IProjectShort } from '../../../interfaces/project';
import { ISprintShort } from '../../../interfaces/sprints';
import { IWorkShort } from '../../../interfaces/works';
import {
  DefaultEmptyGlobalSearchResult,
  IPaginatedSearchItemsSerializer,
} from '../../../interfaces/global-search';
import { NgStyle, NgTemplateOutlet } from '@angular/common';

type SearchComponentQueryParams = {
  search?: string;
};

@Component({
  selector: 'app-search-page',
  imports: [
    MatDivider,
    MatFormField,
    MatIcon,
    MatIconButton,
    MatInput,
    MatLabel,
    MatSuffix,
    ReactiveFormsModule,
    FormsModule,
    MatMenu,
    MatRadioButton,
    MatRadioGroup,
    MatMenuTrigger,
    NgTemplateOutlet,
    NgStyle,
    RouterLink,
  ],
  templateUrl: './search-page.html',
  styleUrl: './search-page.scss',
})
export class SearchPageComponent {
  @HostBinding('class') class = 'h-100 w-100 take-full-page-height';
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  protected searchService = inject(GlobalSearchService);

  globalFilters = computed((): FiltersType => {
    let filters: FiltersType = {};

    return filters;
  });

  searchText = signal<string>('');
  hasSearchResults = signal<boolean>(false);

  projects = signal<IPaginatedSearchItemsSerializer<IProjectShort> | null>(null);
  sprints = signal<IPaginatedSearchItemsSerializer<ISprintShort> | null>(null);
  epiks = signal<IPaginatedSearchItemsSerializer<IWorkShort> | null>(null);
  histories = signal<IPaginatedSearchItemsSerializer<IWorkShort> | null>(null);
  tasks = signal<IPaginatedSearchItemsSerializer<IWorkShort> | null>(null);

  private queryParams = toSignal(this.route.queryParams, {
    initialValue: this.route.snapshot.queryParams as SearchComponentQueryParams,
  });
  // URL -> STATE
  private syncFromUrl = effect(() => {
    const params = this.queryParams();
    this.searchText.set(params.search ?? '');
  });
  // STATE -> URL
  private syncToUrl = effect(() => {
    const params = this.queryParams();
    const next: SearchComponentQueryParams = { search: this.searchText() || undefined };
    if ((params.search ?? null) === next.search) return;
    this.router.navigate([], {
      queryParams: next,
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  });

  storageViewPageSizeKey = (): string => 'tasks.search.viewPageSize';
  readonly tasksPageSizeOptions = [10, 20, 50, 100, 200, 500, 1000];
  private getInitialPageSize(): number {
    const saved = localStorage.getItem(this.storageViewPageSizeKey());
    if (saved) {
      const id = Number(saved);
      if (this.tasksPageSizeOptions.filter((f) => f === id).length > 0) {
        return id;
      }
    }
    return 100;
  }
  pageSize = signal<number>(this.getInitialPageSize());
  setTasksPageSize(newSize: number): void {
    this.pageSize.set(newSize);
    localStorage.setItem(this.storageViewPageSizeKey(), String(newSize));
  }

  private searchText$ = toSignal(
    toObservable(this.searchText).pipe(debounceTime(400), distinctUntilChanged()),
    {
      initialValue: '',
    },
  );
  searchResource = rxResource({
    params: () => ({
      search: this.searchText$(),
      pageSize: this.pageSize(),
      filters: this.globalFilters(),
    }),

    stream: ({ params }) => {
      if (!params.search?.trim()) {
        const result = DefaultEmptyGlobalSearchResult;
        this.projects.set(null);
        this.sprints.set(null);
        this.epiks.set(null);
        this.histories.set(null);
        this.tasks.set(null);
        this.hasSearchResults.set(false);
        return of(result);
      }

      return this.searchService
        .getData({
          page: 1,
          pageSize: params.pageSize,
          search: params.search,
          filters: params.filters,
        })
        .pipe(
          take(1),
          tap((result) => {
            this.projects.set(!!result.projects?.count ? result.projects : null);
            this.sprints.set(!!result.sprints?.count ? result.sprints : null);
            this.epiks.set(!!result.epiks?.count ? result.epiks : null);
            this.histories.set(!!result.histories?.count ? result.histories : null);
            this.tasks.set(!!result.tasks?.count ? result.tasks : null);
            this.hasSearchResults.set(
              !!result.projects?.count ||
                !!result.sprints?.count ||
                !!result.epiks?.count ||
                !!result.histories?.count ||
                !!result.tasks?.count,
            );
          }),
        );
    },
  });

  projectsView = signal<boolean>(false);
  sprintsView = signal<boolean>(false);
  epiksView = signal<boolean>(false);
  historiesView = signal<boolean>(false);
  tasksView = signal<boolean>(false);

  getDataResults(data: IPaginatedSearchItemsSerializer<IProjectShort | IWorkShort | ISprintShort>): (IProjectShort | IWorkShort | ISprintShort)[] {
    return data.results;
  };

  getItemPageUrl(
    item: IProjectShort | IWorkShort | ISprintShort,
    type: string,
  ): (string | number)[] {
    switch (type) {
      case 'project': {
        return ['/home/tasks'];
      }
      case 'sprint': {
        return ['/home/sprints', item.slug];
      }
      case 'epik': {
        return ['/home/tasks', item.slug];
      }
      case 'history': {
        return ['/home/tasks', item.slug];
      }
      case 'task': {
        return ['/home/tasks', item.slug];
      }
      default: {
        return ['/home/dashboard'];
      }
    }
  }

  getItemPageUrlQueryParams(
    item: IProjectShort | IWorkShort | ISprintShort,
    type: string,
  ): FiltersType {
    switch (type) {
      case 'project': {
        return { projectId: item.id };
      }
      case 'sprint': {
        return {};
      }
      case 'epik': {
        return {};
      }
      case 'history': {
        return {};
      }
      case 'task': {
        return {};
      }
      default: {
        return {};
      }
    }
  }
  getSearchItemLinkName(item: IProjectShort | IWorkShort | ISprintShort, type: string): string {
    if ('full_name' in item) {
      return item.full_name;
    } else {
      return item.name;
    }
  }
}
