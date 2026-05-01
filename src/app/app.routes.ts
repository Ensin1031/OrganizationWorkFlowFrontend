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


export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [NoAuthGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [NoAuthGuard] },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'user-profile', component: UserSettingsComponent },
      { path: 'user-table', component: UserTableComponent },
      { path: 'projects', component: ProjectsComponent },
      { path: 'tasks', component: TasksComponent },
      { path: '', redirectTo: '/home/user-table', pathMatch: 'full' },
      { path: '**', component: NotFoundComponent },
    ],
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '404', component: NotFoundComponent },
  { path: '**', component: NotFoundComponent },
];
