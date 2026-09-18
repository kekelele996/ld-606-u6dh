import { Component } from "@angular/core";
import { bootstrapApplication } from "@angular/platform-browser";
import { CommonModule } from "@angular/common";
import { provideRouter, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { appRoutes, navItems } from "./router/routes";
import "./styles.css";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
  <div class="shell">
    <aside>
      <div class="brand">港口泊位与堆场协同系统</div>
      <nav>
        <a
          *ngFor="let item of navItems"
          class="nav-link"
          [routerLink]="item.route"
          routerLinkActive="active"
        >{{ item.name }}</a>
      </nav>
    </aside>
    <main class="page">
      <router-outlet></router-outlet>
    </main>
  </div>`,
  styles: [
    `
      .nav-link {
        display: block;
        color: inherit;
        text-decoration: none;
        padding: 10px 12px;
        border-radius: 6px;
      }
      .nav-link.active {
        background: #f5f1e6;
        color: #223126;
        font-weight: 700;
      }
    `
  ]
})
class AppComponent {
  navItems = navItems;
}

bootstrapApplication(AppComponent, {
  providers: [provideRouter(appRoutes)]
});
