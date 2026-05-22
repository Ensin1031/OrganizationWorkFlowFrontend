import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth-guard';
import { HomeComponent } from './components/home/home';
import { LoginComponent } from './components/common/login/login';
import { RegisterComponent } from './components/common/register/register';
import { NotFoundComponent } from './components/common/not-found/not-found';
import { NoAuthGuard } from './guards/no-auth-guard';
import { UserTableComponent } from './components/work-entity/user-table/user-table';
import { ProjectsComponent } from './components/work-entity/projects/projects';
import { TasksComponent } from './components/work-entity/tasks/tasks';
import { UserSettingsComponent } from './components/common/user-settings/user-settings';
import { TaskViewComponent } from './components/work-entity/tasks/task-view/task-view';
import { SearchPageComponent } from './components/work-entity/search-page/search-page';
import { SprintPageComponent } from './components/work-entity/sprint-page/sprint-page';
import { ProjectPageComponent } from './components/work-entity/project-page/project-page';


export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [NoAuthGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [NoAuthGuard] },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'search', component: SearchPageComponent },
      { path: 'user-profile', component: UserSettingsComponent },
      { path: 'dashboard', component: UserTableComponent },
      { path: 'projects', component: ProjectsComponent },
      {
        path: 'projects',
        children: [
          {
            path: '',
            component: ProjectsComponent,
          },
          {
            path: ':slug',
            component: ProjectPageComponent,
          },
        ],
      },
      { path: 'projects/:slug', component: ProjectPageComponent },
      { path: 'sprints/:slug', component: SprintPageComponent },
      {
        path: 'tasks',
        children: [
          {
            path: '',
            component: TasksComponent,
          },
          {
            path: ':slug',
            component: TaskViewComponent,
          },
        ],
      },
      { path: '', redirectTo: '/home/dashboard', pathMatch: 'full' },
      { path: '**', component: NotFoundComponent },
    ],
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '404', component: NotFoundComponent },
  { path: '**', component: NotFoundComponent },
];
