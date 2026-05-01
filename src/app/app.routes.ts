import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth-guard';
import { HomeComponent } from './components/home/home';
import { LoginComponent } from './components/login/login';
import { RegisterComponent } from './components/register/register';
import { NotFoundComponent } from './components/not-found/not-found';
import { NoAuthGuard } from './guards/no-auth-guard';
import { UserTableComponent } from './components/work-entity/user-table/user-table';


export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [NoAuthGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [NoAuthGuard] },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'user-table', component: UserTableComponent },
      { path: '', redirectTo: '/home/user-table', pathMatch: 'full' },
      { path: '**', component: NotFoundComponent },
    ],
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '404', component: NotFoundComponent },
  { path: '**', component: NotFoundComponent },
];
