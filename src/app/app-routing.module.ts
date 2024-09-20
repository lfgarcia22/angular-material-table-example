import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TableExampleComponent } from './table-example/table-example.component';

const routes: Routes = [
  { path: '', component: TableExampleComponent },
  { path: '**', redirectTo: '/' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
