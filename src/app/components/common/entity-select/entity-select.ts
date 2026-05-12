import {
  afterNextRender,
  Component,
  forwardRef,
  HostBinding,
  input,
  computed,
  output,
  model,
  signal,
} from '@angular/core';
import {
  debounceTime,
  distinctUntilChanged,
  Subject,
} from 'rxjs';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { ISelectStrictPageQuery, PaginatedResponse } from '../../../interfaces/common';
import { MatOptionModule } from '@angular/material/core';
import { MatIconButton } from '@angular/material/button';
import { SafeSvgComponent } from '../safe-svg/safe-svg';
import { UserPhotoViewComponent } from '../user-photo-view/user-photo-view';


@Component({
  selector: 'app-entity-select',
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatOptionModule,
    MatIcon,
    MatIconButton,
    SafeSvgComponent,
    UserPhotoViewComponent,
  ],
  templateUrl: './entity-select.html',
  styleUrl: './entity-select.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => EntitySelectComponent),
      multi: true,
    },
  ],
})
export class EntitySelectComponent<T extends Record<string, any>> implements ControlValueAccessor {
  @HostBinding('class') class = 'w-100 d-flex position-relative';
  label = input<string>('Выберите значение');
  idKey = input<string>('id');
  nameKey = input<string>('name');
  imgKey = input<string>('');
  svgIconKey = input<string>('');
  needSearch = input<boolean>(true);
  required = input<boolean>(false);
  disabled = input<boolean>(false);
  clearable = input<boolean>(false);
  multiple = input<boolean>(false);
  loadFn = input.required<(params: ISelectStrictPageQuery) => any>();
  filters = input<
    | Record<string, string | number | boolean | string[] | number[] | null | undefined>
    | null
    | undefined
  >(null);

  selectedChange = output<T | T[] | null>();
  onLoadChange = output<{ value: T | T[] | null; items: T[] }>();

  value = model<T | T[] | null>(null);
  items = signal<T[]>([]);
  loading = signal(false);
  hasMore = signal(true);
  search = signal('');
  private cvaDisabled = signal(false);

  isDisabled = computed(() => this.disabled() || this.cvaDisabled());
  private page = 1;
  private readonly pageSize = 20;
  private readonly searchSubject = new Subject<string>();

  externalValue = input<T | T[] | null>(null);
  currentValue = computed<T | T[] | null>(() => {
    const external = this.externalValue();

    if (external !== null && external !== undefined) {
      return external;
    }

    return this.value();
  });

  constructor() {
    afterNextRender(() => {
      this.loadFirstPage();
      this.searchSubject.pipe(debounceTime(300), distinctUntilChanged()).subscribe((value) => {
        this.search.set(value);
        this.loadFirstPage();
      });
    });
  }
  private loadFirstPage(filters?: Record<string, any>): void {
    this.page = 1;
    this.hasMore.set(true);
    this.items.set([]);
    this.loadPage(filters);
  }
  private loadPage(filters?: Record<string, any>): void {
    if (this.loading()) {
      return;
    }
    if (!this.hasMore()) {
      return;
    }
    this.loading.set(true);
    this.loadFn()({
      page: this.page,
      pageSize: this.pageSize,
      search: this.search(),
      filters: filters || this.filters() || undefined,
    }).subscribe({
      next: (response: PaginatedResponse<T>) => {
        this.items.update((current) => [...current, ...response.results]);
        this.hasMore.set(!!response.next);
        this.loading.set(false);
        this.onLoadChange.emit({ value: this.currentValue(), items: this.items() });
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  onScroll(event: Event): void {
    const element = event.target as HTMLElement;
    const threshold = 100;
    const reachedBottom =
      element.scrollTop + element.clientHeight >= element.scrollHeight - threshold;
    if (!reachedBottom) {
      return;
    }
    if (this.loading()) {
      return;
    }
    if (!this.hasMore()) {
      return;
    }
    this.page++;
    this.loadPage();
  }
  onSearch(value: string): void {
    this.searchSubject.next(value);
  }
  compareById = (a: T | null, b: T | null): boolean => {
    if (!a || !b) {
      return a === b;
    }
    return a[this.idKey()] === b[this.idKey()];
  };
  getItemId(item: T): any {
    return item[this.idKey()];
  }
  getItemImgUrl(item: T): string {
    if (this.imgKey()) return item[this.imgKey()] ?? '';
    return '';
  }
  getItemSVGIcon(item: T): string {
    if (this.svgIconKey()) return item[this.svgIconKey()] ?? '';
    return '';
  }
  getItemName(item: T): string {
    return item[this.nameKey()] ?? String(this.getItemId(item));
  }
  select(value: T | T[] | null): void {
    this.value.set(value);
    this.onChange(value);
    this.onTouched();
    this.selectedChange.emit(value);
  }
  clear(event: PointerEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (this.multiple()) {
      this.select([]);
      return;
    }
    this.select(null);
  }
  reload(selectItem?: T | T[] | null, filters?: Record<string, any>): void {
    const value = this.currentValue();
    this.loadFirstPage(filters);
    if (this.multiple()) {
      let selectedValues: T[] = [];
      if (selectItem && Array.isArray(selectItem)) {
        selectedValues = [...selectItem];
      } else if (selectItem) {
        selectedValues.push(selectItem);
      }
      if (value && Array.isArray(value)) {
        selectedValues = [...value, ...selectedValues];
      } else if (value) {
        selectedValues = [value, ...selectedValues];
      }
      this.select([]);
      this.select(selectedValues);
    } else if (selectItem !== undefined) {
      this.select(selectItem);
    }
  }
  writeValue(value: T | T[] | null): void {
    if (this.multiple()) {
      this.value.set(value ?? []);
      return;
    }
    this.value.set(value);
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }
  hasValue(): boolean {
    if (this.multiple()) {
      const value = this.currentValue();
      return Array.isArray(value) && value.length > 0;
    }
    return !!this.currentValue();
  }
  displayItems = computed<T[]>(() => {
    const loaded = this.items();
    const value = this.currentValue();
    const selected = (): T[] => {
      if (Array.isArray(value)) return value;
      if (value) return [value];
      return [];
    };
    const map = new Map<any, T>();
    loaded.forEach((item) => {
      map.set(this.getItemId(item), item);
    });
    selected().forEach((item) => {
      map.set(this.getItemId(item), item);
    });
    return Array.from(map.values());
  });
  private onChange: any = () => {};
  private onTouched: any = () => {};
}
