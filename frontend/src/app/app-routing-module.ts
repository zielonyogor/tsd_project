import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Board } from './pages/board/board';
import { Join } from './pages/join/join';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';

const routes: Routes = [
  { path: '', component: Home },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'join', component: Join },
  { path: 'join/:code', component: Join },
  { path: 'board', redirectTo: '' },
  { path: 'board/:id', component: Board },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
