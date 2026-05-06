import { AfterViewInit, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-tasks',
  imports: [],
  templateUrl: './tasks.html',
  styleUrl: './tasks.scss',
})
export class TasksComponent implements OnInit, AfterViewInit {
  private route = inject(ActivatedRoute);
  projectId: number | null = null;
  searchText = signal('');

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.projectId = params['projectId'] ? +params['projectId'] : null;
    });
  }
  ngAfterViewInit(): void {
    this.loadTasks();
  }

  loadTasks() {
    // TODO
    console.log('projectId ===', this.projectId, 'searchText ===', this.searchText());
  }
}
