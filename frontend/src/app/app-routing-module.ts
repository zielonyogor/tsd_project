import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Board } from './pages/board/board';

const routes: Routes = [
  { path: '', component: Home },
  { path: 'board', redirectTo: '' },
  { path: 'board/:id', component: Board },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
