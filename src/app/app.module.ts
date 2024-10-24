import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { NotFoundComponent } from './not-found/not-found.component';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { HomePage } from './home/home.page';
import { ProfilePage } from './profile/profile.page';
import { LoginPage } from './login/login.page';
import { AuthGuard } from './auth/auth.guard';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

const routes: Routes = [
  { path: 'home', component: HomePage, canActivate: [AuthGuard] },
  { path: 'profile', component: ProfilePage, canActivate: [AuthGuard] },
  { path: 'login', component: LoginPage },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', component: NotFoundComponent },
];

@NgModule({
  declarations: [AppComponent, NotFoundComponent,],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
  exports: [RouterModule]
})
export class AppModule {}
