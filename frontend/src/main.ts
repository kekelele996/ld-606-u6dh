import { Component } from "@angular/core";
import { bootstrapApplication } from "@angular/platform-browser";
import { CommonModule } from "@angular/common";
import { provideRouter, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { routes } from "./router/routes";
import { appRoutes } from "./router/app.routes";
import "./styles.css";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
  <div class="shell">
    <aside>
      <div class="brand">港口泊位与堆场协同系统</div>
      <nav>
        <a *ngFor="let route of routes"
           [routerLink]="route.route"
           routerLinkActive="active">{{ route.name }}</a>
      </nav>
    </aside>
    <main class="page">
      <router-outlet></router-outlet>
    </main>
  </div>`
})
class AppComponent {
  routes = routes;
}

bootstrapApplication(AppComponent, {
  providers: [provideRouter(appRoutes)]
});
