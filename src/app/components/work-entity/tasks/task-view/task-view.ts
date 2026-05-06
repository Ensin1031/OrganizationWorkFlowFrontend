import { Component, HostBinding, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { filter, forkJoin, map, switchMap, take, tap } from 'rxjs';
import { WorkService } from '../../../../services/work';
import { IWork } from '../../../../interfaces/works';

@Component({
  selector: 'app-task-view',
  imports: [],
  templateUrl: './task-view.html',
  styleUrl: './task-view.scss',
})
export class TaskViewComponent implements OnInit {
  @HostBinding('class') class = 'h-100 take-full-page-height';

  private route = inject(ActivatedRoute);
  protected workService = inject(WorkService);

  taskSlug!: string;
  canEdit: boolean = false;
  task!: IWork;

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        take(1),
        filter((params) => !!params.get('slug')),
        map((params) => {
          this.taskSlug = params.get('slug')!;
          return this.taskSlug;
        }),
        switchMap((slug) =>
          forkJoin({
            canEdit: this.workService.getCanEdit(slug),
            work: this.workService.getWork(slug),
          }),
        ),
        tap(({ canEdit, work }) => {
          this.canEdit = canEdit;
          this.task = work;
        }),
      )
      .subscribe();

  }

}
